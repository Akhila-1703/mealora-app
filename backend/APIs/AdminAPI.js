import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { SkipMealModel } from "../models/SkipMealModel.js";
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";
import { processDailyDeductions } from "../services/mealProcessor.js";

export const adminRouter = exp.Router();


// ================= DASHBOARD =================
adminRouter.get("/dashboard", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const [totalUsers, activeSubscriptions] = await Promise.all([
      UserModel.countDocuments({ role: "USER" }),
      SubscriptionModel.countDocuments({ status: "ACTIVE" })
    ]);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const skippedMeals = await SkipMealModel.countDocuments({
      date: { $gte: start, $lte: end }
    });

    const todayDeliveries = activeSubscriptions - skippedMeals;

    // Calculate wallet revenue (total recharged revenue) from all CREDIT transactions
    const walletRevenueResult = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const walletRevenue = walletRevenueResult[0]?.total || 0;

    // Calculate meals delivered revenue (total deducted meal revenue) from all DEBIT transactions
    const mealsDeliveredRevenueResult = await WalletTransactionModel.aggregate([
      { $match: { reason: "MEAL_DEDUCTED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const mealsDeliveredRevenue = mealsDeliveredRevenueResult[0]?.total || 0;

    // Monthly revenue chart data
    const monthlyRevenue = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueChartData = monthlyRevenue.map(item => {
      const [year, monthNum] = item._id.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const monthName = date.toLocaleString("en-IN", { month: "short" });
      return { month: `${monthName} ${year.slice(-2)}`, revenue: item.revenue };
    });

    // Meal popularity chart data
    const MenuModelModule = await import("../models/MenuModel.js");
    const MenuModel = MenuModelModule.MenuModel;
    const menus = await MenuModel.find({});
    const popularityChartData = menus.map(m => ({
      name: m.title || m.mealName || m.day,
      served: 0,
      skipped: 0
    }));

    res.status(200).json({
      success: true,
      payload: {
        totalUsers,
        activeSubscriptions,
        totalRevenue: walletRevenue,
        walletRevenue,
        mealsDeliveredRevenue,
        todayDeliveries,
        revenueChartData,
        popularityChartData
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= TODAY MEALS =================
adminRouter.get("/meals/today", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const activeUsers = await SubscriptionModel.countDocuments({ status: "ACTIVE" });

    const skippedMeals = await SkipMealModel.countDocuments({
      date: { $gte: start, $lte: end }
    });

    const totalMeals = activeUsers - skippedMeals;

    res.status(200).json({
      success: true,
      payload: {
        totalMeals,
        skippedMeals
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= USERS =================
adminRouter.get("/users", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const users = await UserModel.find({ role: "USER" }).select("-password").lean();
    const subscriptions = await SubscriptionModel.find().lean();
    const subMap = new Map(subscriptions.map(s => [s.userId.toString(), s]));

    const payload = users.map(user => ({
      ...user,
      subscription: subMap.get(user._id.toString()) || null
    }));

    res.status(200).json({
      success: true,
      payload
    });

  } catch (err) {
    next(err);
  }
});


// ================= UPDATE USER STATUS =================
adminRouter.patch("/user/:id/status", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User status updated",
      payload: user
    });

  } catch (err) {
    next(err);
  }
});

// ================= UPDATE USER STATUS (PUT - TO MATCH TOGGLE CONTRACT) =================
adminRouter.put("/user/:id", verifyToken("ADMIN"), async (req, res) => {
  try {
    const updated = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        isActive: req.body.isActive,
      },
      {
        new: true,
      }
    );

    res.send({
      success: true,
      user: updated,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
});


// ================= TODAY DELIVERIES =================
adminRouter.get("/today-deliveries", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const subscriptions = await SubscriptionModel.find({ status: "ACTIVE" });
    const userIds = subscriptions.map(sub => sub.userId);
    
    // Fetch all active subscribers regardless of wallet balance
    const users = await UserModel.find({ 
      _id: { $in: userIds }
    });

    const skips = await SkipMealModel.find({
      date: { $gte: start, $lte: end }
    });
    const skippedUserIds = new Set(skips.map(s => s.userId.toString()));

    const subMap = new Map(subscriptions.map(s => [s.userId.toString(), s]));
    const list = [];

    for (let user of users) {
      if (skippedUserIds.has(user._id.toString())) {
        continue;
      }

      const sub = subMap.get(user._id.toString());
      const transactionToday = await WalletTransactionModel.findOne({
        userId: user._id,
        reason: "MEAL_DEDUCTED",
        createdAt: { $gte: start, $lte: end }
      });

      list.push({
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile
        },
        address: sub ? `${sub.address}, ${sub.city} - ${sub.pincode}` : "No Address",
        walletBalance: user.walletBalance ?? 0,
        mealPrice: sub ? (sub.mealPrice || 100) : 100,
        deliveryStatus: transactionToday ? "DELIVERED" : "PENDING"
      });
    }

    res.status(200).json({
      success: true,
      payload: list
    });

  } catch (err) {
    next(err);
  }
});


// ================= USER OPERATIONS: EXCLUDE =================
adminRouter.post("/user/:id/exclude", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const existing = await SkipMealModel.findOne({
      userId: id,
      date: { $gte: start, $lte: end }
    });

    if (!existing) {
      await SkipMealModel.create({
        userId: id,
        date: new Date()
      });
      
    }

    res.status(200).json({
      success: true,
      message: "User excluded from today's delivery"
    });

  } catch (err) {
    next(err);
  }
});


// ================= USER OPERATIONS: MARK DELIVERED & BILL =================
adminRouter.post("/user/:id/deliver", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const existing = await WalletTransactionModel.findOne({
      userId: id,
      reason: "MEAL_DEDUCTED",
      createdAt: { $gte: start, $lte: end }
    });

    if (existing) {
      return res.status(400).json({ message: "User already billed/delivered today" });
    }

    const user = await UserModel.findById(id);
    const sub = await SubscriptionModel.findOne({ userId: id, status: "ACTIVE" });
    if (!user || !sub) {
      return res.status(400).json({ message: "Active subscription or user not found" });
    }

    const mealPrice = sub.mealPrice || 100;
    if (user.walletBalance < mealPrice) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    user.walletBalance -= mealPrice;
    await user.save();

    await WalletTransactionModel.create({
      userId: id,
      amount: mealPrice,
      type: "DEBIT",
      reason: "MEAL_DEDUCTED"
    });



    res.status(200).json({
      success: true,
      message: "Meal marked as delivered and billed"
    });

  } catch (err) {
    next(err);
  }
});


// ================= REVENUE SYSTEM ANALYTICS =================
adminRouter.get("/revenue/total", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const totalResult = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const total = totalResult[0]?.total || 0;
    res.status(200).json({ success: true, payload: { total } });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/revenue/monthly", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const monthlyResult = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT", createdAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = monthlyResult
      .filter(item => item._id)
      .map(item => {
        const parts = item._id.split("-");
        if (parts.length < 2) return null;
        const [year, monthNum] = parts;
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthName = date.toLocaleString("en-IN", { month: "short" });
        return { label: `${monthName} ${year.slice(-2)}`, revenue: item.revenue };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, payload: data });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/revenue/weekly", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const weeklyResult = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT", createdAt: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    const data = weeklyResult
      .filter(item => item._id && item._id.week !== null && item._id.year !== null)
      .map(item => ({
        label: `Week ${item._id.week}, ${item._id.year}`,
        revenue: item.revenue
      }));

    res.status(200).json({ success: true, payload: data });
  } catch (err) {
    next(err);
  }
});


// ================= REPORTS ANALYTICS =================
adminRouter.get("/reports", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    // 1. Revenue trend
    const revenue = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT", createdAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueData = revenue
      .filter(item => item._id)
      .map(item => {
        const parts = item._id.split("-");
        if (parts.length < 2) return null;
        const [year, monthNum] = parts;
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthName = date.toLocaleString("en-IN", { month: "short" });
        return { month: `${monthName} ${year.slice(-2)}`, revenue: item.revenue };
      })
      .filter(Boolean);

    // 2. Meal popularity
    const MenuModelModule = await import("../models/MenuModel.js");
    const MenuModel = MenuModelModule.MenuModel;
    const menus = await MenuModel.find({});
    const popularityData = menus.map(m => ({
      name: m.title || m.mealName || m.day,
      served: 0,
      skipped: 0
    }));

    // 3. User growth
    const growth = await UserModel.aggregate([
      { $match: { createdAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    let accum = 0;
    const userGrowthData = growth
      .filter(item => item._id)
      .map(item => {
        accum += item.count;
        const parts = item._id.split("-");
        if (parts.length < 2) return null;
        const [year, monthNum] = parts;
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const monthName = date.toLocaleString("en-IN", { month: "short" });
        return { month: `${monthName} ${year.slice(-2)}`, users: accum };
      })
      .filter(Boolean);

    // 4. Wallet usage breakdown
    const lowCount = await UserModel.countDocuments({ walletBalance: { $lt: 100 } });
    const midCount = await UserModel.countDocuments({ walletBalance: { $gte: 100, $lte: 500 } });
    const highCount = await UserModel.countDocuments({ walletBalance: { $gt: 500 } });

    const walletUsageData = [
      { name: "Low (< ₹100)", value: lowCount },
      { name: "Medium (₹100-₹500)", value: midCount },
      { name: "High (> ₹500)", value: highCount }
    ];

    res.status(200).json({
      success: true,
      payload: {
        revenueData,
        popularityData,
        userGrowthData,
        walletUsageData
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= PROCESS MEALS LOGIC =================
export const processDailyMealsLogic = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const subscriptions = await SubscriptionModel.find({ status: "ACTIVE" });
  const userIds = subscriptions.map(sub => sub.userId);
  const users = await UserModel.find({ _id: { $in: userIds } });

  const skips = await SkipMealModel.find({
    date: { $gte: start, $lte: end }
  });

  const skippedUserIds = new Set(skips.map(s => s.userId.toString()));

  const subMap = new Map(
    subscriptions.map(s => [s.userId.toString(), s])
  );

  let processed = 0;
  let skipped = 0;
  let insufficientBalance = 0;

  for (let user of users) {
    if (!user.isActive) continue;

    if (skippedUserIds.has(user._id.toString())) {
      skipped++;
      continue;
    }

    const sub = subMap.get(user._id.toString());
    const mealPrice = sub?.mealPrice || 100;

    if ((user.walletBalance || 0) < mealPrice) {
      insufficientBalance++;
      continue;
    }

    await UserModel.findByIdAndUpdate(
      user._id,
      { $inc: { walletBalance: -mealPrice } }
    );

    await WalletTransactionModel.create({
      userId: user._id,
      amount: mealPrice,
      type: "DEBIT",
      reason: "MEAL_DEDUCTED"
    });

    processed++;
  }

  return { processed, skipped, insufficientBalance };
};

// ================= PROCESS MEALS ROUTE (Manual Fallback) =================
adminRouter.post("/process-meals", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const log = await processDailyDeductions("ADMIN");

    res.status(200).json({
      success: true,
      message: "Meal processing completed",
      payload: {
        processed: log.processedCount,
        skipped: log.skippedCount,
        insufficientBalance: log.insufficientBalanceCount
      }
    });

  } catch (err) {
    next(err);
  }
});

// ================= GET BILLING RUNS HISTORY =================
adminRouter.get("/billing-runs", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const BillingRunModelModule = await import("../models/BillingRunModel.js");
    const BillingRunModel = BillingRunModelModule.BillingRunModel;

    const logs = await BillingRunModel.find().sort({ createdAt: -1 }).limit(30);

    res.status(200).json({
      success: true,
      payload: logs
    });

  } catch (err) {
    next(err);
  }
});
