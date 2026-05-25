import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";

export const walletRouter = exp.Router();


// ================= BALANCE =================
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

/*import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { UserModel } from "../models/UserModel.js"
import { WalletTransactionModel } from "../models/WalletTransactionModel.js"
import { SubscriptionModel } from "../models/SubscriptionModel.js"

export const walletRouter = exp.Router()

walletRouter.get("/balance", verifyToken("USER"), async (req, res, next) => {
  try {

    const user = await UserModel.findById(req.user.id).select("walletBalance")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      payload: {
        walletBalance: user.walletBalance || 0
      }
    })

  } catch (err) {
    next(err)
  }
})

walletRouter.get("/status", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id

    const [user, subscription] = await Promise.all([
      UserModel.findById(userId).select("walletBalance"),
      SubscriptionModel.findOne({ userId, status: "ACTIVE" })
    ])

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const mealPrice = subscription?.mealPrice || 100
    const walletBalance = user.walletBalance || 0

    const remainingMeals = Math.floor(walletBalance / mealPrice)
    const canOrder = remainingMeals > 0

    res.status(200).json({
      success: true,
      payload: {
        walletBalance,
        remainingMeals,
        canOrder
      }
    })

  } catch (err) {
    next(err)
  }
})

walletRouter.post("/add-money", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id
    const { amount, paymentMethod } = req.body

    const allowedMethods = ["UPI", "CARD"]

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Invalid amount"
      })
    }

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method"
      })
    }

    // 🔥 ATOMIC UPDATE (important)
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: amount } },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const transaction = new WalletTransactionModel({
      userId,
      amount,
      type: "CREDIT",
      reason: "RECHARGE",
      paymentMethod
    })

    await transaction.save()

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      payload: {
        walletBalance: user.walletBalance
      }
    })

  } catch (err) {
    next(err)
  }
})

walletRouter.get("/transactions", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id

    const transactions = await WalletTransactionModel.find({ userId })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      payload: transactions
    })

  } catch (err) {
    next(err)
  }
})*/