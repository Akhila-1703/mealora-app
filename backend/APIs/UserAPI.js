import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../models/UserModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { MenuModel } from "../models/MenuModel.js";
import { SkipMealModel } from "../models/SkipMealModel.js";
import { upload } from "../config/multer.js";
import {uploadToCloudinary } from '../config/cloudinaryUpload.js'
import cloudinary from '../config/cloudinary.js'
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";

export const userRouter = exp.Router();

// ================= HELPERS =================
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getTodayDayName = () => {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date().getDay()];
};


// ================= DASHBOARD =================
userRouter.get("/dashboard", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, subscription, recentTransactions] = await Promise.all([
      UserModel.findById(userId),
      SubscriptionModel.findOne({ userId, status: "ACTIVE" }),
      WalletTransactionModel.find({ userId }).sort({ createdAt: -1 }).limit(3).lean()
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const today = getTodayDayName();

    const [menu, skipped, deliveryTx] = await Promise.all([
      MenuModel.findOne({ day: today }),
      SkipMealModel.findOne({
        userId,
        date: {
          $gte: getStartOfDay(new Date()),
          $lte: getEndOfDay(new Date())
        }
      }),
      WalletTransactionModel.findOne({
        userId,
        reason: "MEAL_DEDUCTED",
        createdAt: {
          $gte: getStartOfDay(new Date()),
          $lte: getEndOfDay(new Date())
        }
      }).lean()
    ]);


    const mealPrice = subscription?.mealPrice || 100;
    const walletBalance = user.walletBalance || 0;
    const remainingMeals = Math.floor(walletBalance / mealPrice);

    let message = null;

    if (remainingMeals <= 2) {
      message = "Recharge urgently";
    } else if (remainingMeals <= 5) {
      message = "Plan expiring soon";
    }

    res.status(200).json({
      success: true,
      payload: {
        walletBalance,
        remainingMeals,
        todayMenu: menu?.lunchMenu || null,
        imageUrl: menu?.imageUrl || null,
        isSkippedToday: !!skipped,
        subscriptionStatus: subscription?.status || "INACTIVE",
        deliveryAddress: subscription ? `${subscription.address}, ${subscription.city}` : null,
        message,
        recentTransactions: recentTransactions || [],
        deliveryState: (() => {
          const hour = new Date().getHours();
          const cutoffHour = 13; // 1:00 PM

          if (skipped) return "SKIPPED";
          if (hour < cutoffHour) return "PENDING_BEFORE_CUTOFF";
          return deliveryTx ? "DELIVERED" : "PENDING";
        })()
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= UPDATE PROFILE =================
userRouter.put(
  "/update-profile",
  verifyToken("USER"),
  upload.single("profileImageUrl"), // 🔥 accept file
  async (req, res, next) => {
    let cloudinaryResult;

    try {
      const userId = req.user.id;

      let { firstName, lastName, username, mobile } = req.body;

      // 🔥 get existing user (needed for old image delete)
      const existingUser = await UserModel.findById(userId);

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // 🔥 build update object
      const updateData = {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        ...(username && { username: username.trim() }),
        ...(mobile && { mobile: mobile.toString().trim() }),
      };

      // ================= IMAGE HANDLING =================
      if (req.file) {
        // upload new image
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);

        updateData.profileImageUrl = cloudinaryResult.secure_url;

        // 🔥 OPTIONAL: delete old image (if exists)
        if (existingUser.profileImageId) {
          await cloudinary.uploader.destroy(existingUser.profileImageId);
        }

        // 🔥 store public_id (important for future deletes)
        updateData.profileImageId = cloudinaryResult.public_id;
      }

      // ================= UPDATE =================
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select("-password");

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        payload: updatedUser,
      });

    } catch (err) {

      // 🔥 rollback new upload if something fails
      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      }

      next(err);
    }
  }
);

/*import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { UserModel } from "../models/UserModel.js"
import { SubscriptionModel } from "../models/SubscriptionModel.js"
import { MenuModel } from "../models/MenuModel.js"
import { SkipMealModel } from "../models/SkipMealModel.js"

export const userRouter = exp.Router()

/*userRouter.get(
  "/dashboard",
  verifyToken("USER"),
  async (req, res, next) => {
    try {
      // ✅ get userId from token (cookie)
      const userId = req.user.id;

      // parallel DB calls
      const [user, subscription] = await Promise.all([
        UserModel.findById(userId),
        SubscriptionModel.findOne({ userId, status: "ACTIVE" })
      ]);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date().toLocaleString("en-US", { weekday: "long" });

      const menu = await MenuModel.findOne({ day: today });

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const skipped = await SkipMealModel.findOne({
        userId,
        date: todayDate
      });

      const mealPrice = subscription?.mealPrice || 100;
      const walletBalance = user.walletBalance || 0;
      const remainingMeals = Math.floor(walletBalance / mealPrice);

      let message = null;

      if (remainingMeals <= 2) {
        message = "Recharge urgently";
      } else if (remainingMeals <= 5) {
        message = "Plan expiring soon";
      }

      res.status(200).json({
        success: true,
        payload: {
          walletBalance,
          remainingMeals,
          todayMenu: menu?.lunchMenu || null,
          isSkippedToday: !!skipped,
          subscriptionStatus: subscription?.status || "INACTIVE",
          message
        }
      });

    } catch (err) {
      next(err);
    }
  }
);*/

/*userRouter.get(
  "/dashboard/:userid",
  verifyToken("USER"),
  async (req, res, next) => {
    try {

      const { userid } = req.params

      // 🔒 SECURITY CHECK
      if (req.user.id.toString() !== userid) {
        return res.status(403).json({ message: "Access denied" })
      }

      const userId = userid

      // parallel DB calls
      const [user, subscription] = await Promise.all([
        UserModel.findById(userId),
        SubscriptionModel.findOne({ userId, status: "ACTIVE" })
      ])

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // today day
      const today = new Date().toLocaleString("en-US", { weekday: "long" })

      const menu = await MenuModel.findOne({ day: today })

      // normalize date
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)

      const skipped = await SkipMealModel.findOne({
        userId,
        date: todayDate
      })

      // calculations
      const mealPrice = subscription?.mealPrice || 100
      const walletBalance = user.walletBalance || 0
      const remainingMeals = Math.floor(walletBalance / mealPrice)

      let message = null

      if (remainingMeals <= 2) {
        message = "Recharge urgently"
      } else if (remainingMeals <= 5) {
        message = "Plan expiring soon"
      }

      res.status(200).json({
        success: true,
        payload: {
          walletBalance,
          remainingMeals,
          todayMenu: menu?.lunchMenu || null,
          isSkippedToday: !!skipped,
          subscriptionStatus: subscription?.status || "INACTIVE",
          message
        }
      })

    } catch (err) {
      next(err)
    }
  }
)

userRouter.put(
  "/update-profile/:userid",
  verifyToken("USER"),
  async (req, res, next) => {
    try {

      const { userid } = req.params

      // 🔒 SECURITY CHECK
      if (req.user.id.toString() !== userid) {
        return res.status(403).json({ message: "Access denied" })
      }

      const { firstName, lastName, username, mobile } = req.body

      const updatedUser = await UserModel.findByIdAndUpdate(
        userid,
        {
          $set: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(username && { username }),
            ...(mobile && { mobile })
          }
        },
        { new: true }
      ).select("-password")

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" })
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        payload: updatedUser
      })

    } catch (err) {
      next(err)
    }
  }
) */