import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";

export const walletRouter = exp.Router();


// ================= BALANCE =================
// fetches the user's raw wallet balance. we use the .lean() method here because we just need to read the number quickly and don't need the overhead of full mongoose hydration
walletRouter.get("/balance", verifyToken("USER"), async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id)
      .select("walletBalance")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      payload: {
        walletBalance: user.walletBalance || 0
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= STATUS =================
// calculates how many remaining meals the user can afford based on their current balance and their subscribed meal price. this powers the dynamic warnings on the frontend dashboard
walletRouter.get("/status", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, subscription] = await Promise.all([
      UserModel.findById(userId).select("walletBalance").lean(),
      SubscriptionModel.findOne({ userId, status: "ACTIVE" }).lean()
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const mealPrice = subscription?.mealPrice || 100;
    const walletBalance = user.walletBalance || 0;

    const remainingMeals = Math.floor(walletBalance / mealPrice);

    res.status(200).json({
      success: true,
      payload: {
        walletBalance,
        remainingMeals,
        canOrder: remainingMeals > 0
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= ADD MONEY =================
// processes simulated deposits into the user's wallet. we use an atomic $inc operation to update the balance directly in mongodb to prevent race conditions during concurrent payment webhooks
walletRouter.post("/add-money", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { amount, paymentMethod } = req.body;

    const allowedMethods = ["UPI", "CARD"];

    // ✅ sanitize
    amount = Math.floor(Number(amount));

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    // 🔥 atomic update
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await WalletTransactionModel.create({
      userId,
      amount,
      type: "CREDIT",
      reason: "RECHARGE",
      paymentMethod
    });

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      payload: {
        walletBalance: user.walletBalance
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= TRANSACTIONS =================
// retrieves the user's financial ledger (both recharges and meal deductions). we strictly limit the response to 50 records to prevent massive payload sizes for long-term users
walletRouter.get("/transactions", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const transactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50) // ✅ prevent huge response
      .lean();

    res.status(200).json({
      success: true,
      payload: transactions
    });

  } catch (err) {
    next(err);
  }
});