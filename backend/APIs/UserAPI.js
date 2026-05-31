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
// this is the heaviest endpoint in the app. it aggregates data from four different collections (users, subscriptions, wallet transactions, menus) to build the live dashboard. we use promise.all to fetch them concurrently instead of sequentially to keep latency low
userRouter.get("/dashboard", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, subscription, recentTransactions, servedMealsCount, recentServedMealsList, allMenus, allServedMeals] = await Promise.all([
      UserModel.findById(userId),
      SubscriptionModel.findOne({ userId, status: "ACTIVE" }),
      WalletTransactionModel.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
      WalletTransactionModel.countDocuments({ userId, reason: "MEAL_DEDUCTED" }),
      WalletTransactionModel.find({ userId, reason: "MEAL_DEDUCTED" }).sort({ createdAt: -1 }).limit(3).lean(),
      MenuModel.find().lean(),
      WalletTransactionModel.find({ userId, reason: "MEAL_DEDUCTED" }).select("createdAt").lean()
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

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    const recentServedMeals = recentServedMealsList.map(tx => {
       const txDate = new Date(tx.createdAt);
       const dayName = days[txDate.getDay()];
       const menuForDay = allMenus.find(m => m.day === dayName);
       return {
           date: tx.createdAt,
           day: dayName,
           mealName: menuForDay ? menuForDay.lunchMenu : "Meal",
           amount: tx.amount
       };
    });

    const servedMealsDates = allServedMeals.map(tx => {
       const d = new Date(tx.createdAt);
       return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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

    const todayDateStr = new Date().toISOString().split("T")[0];
    let activeAddressObj = null;

    // Check for override
    const override = user.addressOverrides?.find(o => o.date === todayDateStr);
    if (override) {
      activeAddressObj = user.addresses?.find(a => a._id.toString() === override.addressId.toString());
    }
    
    // Fallback to default
    if (!activeAddressObj && user.addresses?.length > 0) {
      activeAddressObj = user.addresses.find(a => a.isDefault) || user.addresses[0];
    }

    const calculatedDeliveryAddress = activeAddressObj 
      ? `${activeAddressObj.address}, ${activeAddressObj.city}` 
      : (subscription ? `${subscription.address}, ${subscription.city}` : null);

    res.status(200).json({
      success: true,
      payload: {
        walletBalance,
        remainingMeals,
        servedMealsCount,
        recentServedMeals,
        servedMealsDates,
        todayMenu: menu?.lunchMenu || null,
        imageUrl: menu?.imageUrl || null,
        isSkippedToday: !!skipped,
        subscriptionStatus: subscription?.status || "INACTIVE",
        deliveryAddress: calculatedDeliveryAddress,
        addresses: user.addresses || [],
        todayAddressOverride: override?.addressId || null,
        subscriptionStartDate: subscription?.startDate || user.createdAt,
        message,
        recentTransactions: recentTransactions || [],
        deliveryState: (() => {
          const nowInIST = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
          const hour = nowInIST.getHours();
          const cutoffHour = 13; // 1:00 PM IST

          if (skipped) return "SKIPPED";
          if (deliveryTx) return "DELIVERED";
          
          // check if they created their subscription just today after 11:00 AM IST
          if (subscription && subscription.createdAt) {
             const subCreatedAtIST = new Date(new Date(subscription.createdAt).toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
             
             const isSubCreatedToday = subCreatedAtIST.getFullYear() === nowInIST.getFullYear() && 
                                       subCreatedAtIST.getMonth() === nowInIST.getMonth() && 
                                       subCreatedAtIST.getDate() === nowInIST.getDate();
                                       
             if (isSubCreatedToday && subCreatedAtIST.getHours() >= 11) {
                 return "MISSED_CUTOFF"; // they missed today's kitchen prep cutoff
             }
          }
          
          if (hour >= cutoffHour) {
            const isEligible = subscription?.status === "ACTIVE" && 
                               calculatedDeliveryAddress && 
                               walletBalance >= (subscription?.mealPrice || 100);
            
            if (isEligible) {
              return "DELIVERED";
            }
            return "MISSED_CUTOFF";
          }
          
          return "PENDING_BEFORE_CUTOFF";
        })()
      }
    });

  } catch (err) {
    next(err);
  }
});


// ================= UPDATE PROFILE =================
// allows the user to update their core profile data. we use cloudinary here to handle the avatar uploads, ensuring we delete the old image hash to keep our cloud storage footprint minimal
userRouter.put(
  "/update-profile",
  verifyToken("USER"),
  upload.single("profileImageUrl"), // 🔥 accept file
  async (req, res, next) => {
    let cloudinaryResult;

    try {
      const userId = req.user.id;

      let { firstName, lastName, username, mobile, emailUpdates } = req.body;

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
        ...(emailUpdates !== undefined && { emailUpdates: emailUpdates === "true" || emailUpdates === true }),
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


// ================= ADDRESS MANAGEMENT =================

// adds a new delivery address to the user's address book. if this is their first address or they explicitly flag it, we automatically make it their default shipping destination
userRouter.post("/address", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { tag, address, city, pincode, isDefault } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (isDefault || !user.addresses || user.addresses.length === 0) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push({ tag, address, city, pincode, isDefault: isDefault || user.addresses.length === 0 });
    await user.save();

    res.status(201).json({ success: true, message: "Address added successfully", payload: user.addresses });
  } catch (err) {
    next(err);
  }
});

// edits an existing address entry based on its subdocument _id. if they mark this one as default, we map over the rest of the array and remove the default flag from the others
userRouter.put("/address/:addressId", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const { tag, address, city, pincode, isDefault } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addressObj = user.addresses.id(addressId);
    if (!addressObj) return res.status(404).json({ success: false, message: "Address not found" });

    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    if (tag) addressObj.tag = tag;
    if (address) addressObj.address = address;
    if (city) addressObj.city = city;
    if (pincode) addressObj.pincode = pincode;
    if (isDefault !== undefined) addressObj.isDefault = isDefault;

    await user.save();
    res.status(200).json({ success: true, message: "Address updated successfully", payload: user.addresses });
  } catch (err) {
    next(err);
  }
});

// removes an address from the array. if they delete their default address, we automatically promote the next available address in the array to default so deliveries don't get stuck
userRouter.delete("/address/:addressId", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const addressObj = user.addresses.id(addressId);
    if (!addressObj) return res.status(404).json({ success: false, message: "Address not found" });

    user.addresses.pull({ _id: addressId });
    
    if (addressObj.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.status(200).json({ success: true, message: "Address deleted successfully", payload: user.addresses });
  } catch (err) {
    next(err);
  }
});

// handles the edge case where a user wants their dabba delivered to their office tomorrow instead of home, without permanently changing their default address setting
userRouter.post("/address/override", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, addressId } = req.body; // date format 'YYYY-MM-DD'

    if (!date || !addressId) return res.status(400).json({ success: false, message: "Date and addressId are required" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Ensure address exists
    if (!user.addresses.id(addressId)) {
      return res.status(400).json({ success: false, message: "Invalid addressId" });
    }

    const existingOverride = user.addressOverrides.find(o => o.date === date);
    if (existingOverride) {
      existingOverride.addressId = addressId;
    } else {
      user.addressOverrides.push({ date, addressId });
    }

    await user.save();
    res.status(200).json({ success: true, message: "Address override set successfully" });
  } catch (err) {
    next(err);
  }
});
