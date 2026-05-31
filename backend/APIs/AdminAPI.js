import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { SkipMealModel } from "../models/SkipMealModel.js";
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";
import { processDailyDeductions } from "../services/mealProcessor.js";

export const adminRouter = exp.Router();


// ================= DASHBOARD =================
// calculates the vital statistics for the admin dashboard. we perform several heavy mongodb aggregations here to calculate total revenue, meal popularity, and signup trends concurrently
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

    // Calculate daily signups for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailySignups = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayVal = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayVal}`;
      const dayName = weekdays[d.getDay()];
      dailySignups.push({
        date: dateString,
        day: dayName,
        reg: 0
      });
    }

    const userList = await UserModel.find({
      role: "USER",
      createdAt: { $gte: sevenDaysAgo }
    }).select("createdAt");

    for (const user of userList) {
      const uDate = new Date(user.createdAt);
      const year = uDate.getFullYear();
      const month = String(uDate.getMonth() + 1).padStart(2, "0");
      const dayVal = String(uDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayVal}`;
      const match = dailySignups.find(item => item.date === dateString);
      if (match) {
        match.reg++;
      }
    }

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
        popularityChartData,
        dailySignups
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= TODAY MEALS =================
// calculates precisely how many meals need to be cooked today by subtracting the number of active users who skipped from the total pool of active subscriptions
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
// retrieves the master list of all customers. we map over their subscriptions in memory instead of using $lookup in mongodb to keep the database query execution extremely fast
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
// provides the admin the authority to instantly suspend a user account, preventing them from logging in or receiving deliveries
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
// alternative toggle route for user suspension that perfectly matches the frontend expected contract structure
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
// generates the kitchen delivery manifest for today. we filter out anyone who skipped or doesnt have an active subscription so the delivery riders know exactly where to go
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
// allows the kitchen manager to manually exclude a user from todays delivery manifest (e.g., if they called in sick after the 11 am cutoff)
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
// manual override to explicitly mark a single user meal as delivered. this immediately deducts the meal price from their wallet and prevents double-billing if they were already charged
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
// calculates the total gross revenue ever deposited into the platform by aggregating all credit transactions in the ledger
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

// groups wallet deposits into monthly buckets for the revenue trend graph on the admin dashboard
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

// groups wallet deposits into weekly buckets for a more granular view of the revenue trend graph
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
// the master analytics engine. this route processes the last 14 days of data to generate growth metrics, wallet usage distribution, and precise meal popularity based on real deductions
adminRouter.get("/reports", verifyToken("ADMIN"), async (req, res, next) => {
  try {
    const last14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayVal = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${dayVal}`;
      const monthName = d.toLocaleString("en-IN", { month: "short" });
      last14Days.push({
        date: dateString,
        display: `${dayVal} ${monthName}`
      });
    }

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
    fourteenDaysAgo.setHours(0,0,0,0);

    // 1. Revenue trend
    const revenue = await WalletTransactionModel.aggregate([
      { $match: { type: "CREDIT", createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      }
    ]);

    const revenueDataMap = new Map();
    revenue.forEach(r => revenueDataMap.set(r._id, r.revenue));

    const revenueData = last14Days.map(d => ({
      month: d.display,
      revenue: revenueDataMap.get(d.date) || 0
    }));

    // 2. Meal popularity (REAL DATABASE ANALYTICS)

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const popularityMap = {
  Sun: { name: "Sun", served: 0, skipped: 0 },
  Mon: { name: "Mon", served: 0, skipped: 0 },
  Tue: { name: "Tue", served: 0, skipped: 0 },
  Wed: { name: "Wed", served: 0, skipped: 0 },
  Thu: { name: "Thu", served: 0, skipped: 0 },
  Fri: { name: "Fri", served: 0, skipped: 0 },
  Sat: { name: "Sat", served: 0, skipped: 0 }
};

// SERVED MEALS FROM REAL DEDUCTIONS

const deductions = await WalletTransactionModel.find({
  reason: "MEAL_DEDUCTED"
});

for (const txn of deductions) {

  const day =
    weekdays[new Date(txn.createdAt).getDay()];

  popularityMap[day].served += 1;
}

// SKIPPED MEALS FROM REAL SKIPS

const skips = await SkipMealModel.find({});

for (const skip of skips) {

  const day =
    weekdays[new Date(skip.date).getDay()];

  popularityMap[day].skipped += 1;
}

const popularityData =
  Object.values(popularityMap);

    // 3. User growth
    const initialUsersCount = await UserModel.countDocuments({
      role: "USER",
      createdAt: { $lt: fourteenDaysAgo }
    });

    const userSignups = await UserModel.aggregate([
      { $match: { role: "USER", createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      }
    ]);

    const userSignupsMap = new Map();
    userSignups.forEach(u => userSignupsMap.set(u._id, u.count));

    let currentTotal = initialUsersCount;
    const userGrowthData = last14Days.map(d => {
      currentTotal += (userSignupsMap.get(d.date) || 0);
      return { month: d.display, users: currentTotal };
    });

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
// the manual fallback trigger for the daily billing run. if the nightly cron job fails to execute, the admin can click a button on their dashboard to hit this route and process all payments manually
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
// fetches the audit logs of all previous billing runs (both automated and manual) so the admin can verify that payments are being processed correctly each day
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
