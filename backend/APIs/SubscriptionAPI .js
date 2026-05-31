import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";

export const subscriptionRouter = exp.Router();

// ================= HELPERS =================
const getNextDeliveryCutoff = () => {
  const deliveryTime = new Date();
  deliveryTime.setDate(deliveryTime.getDate() + 1);
  deliveryTime.setHours(13, 0, 0, 0);

  return new Date(deliveryTime.getTime() - 3 * 60 * 60 * 1000);
};


// ================= CREATE =================
// when a user sets up their delivery address for the first time, we create their subscription record here. we hardcode the meal price to 100 in the initial record so future billing runs know exactly what to deduct
subscriptionRouter.post("/create", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { address, city, pincode } = req.body;

    // ✅ validation
    if (!address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    address = address.trim();
    city = city.trim();
    pincode = pincode.toString().trim();

    if (pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode"
      });
    }

    const existing = await SubscriptionModel.findOne({
      userId,
      status: "ACTIVE"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Active subscription already exists"
      });
    }

    const newSubscription = new SubscriptionModel({
      userId,
      address,
      city,
      pincode,
      mealPrice: 100,
      status: "ACTIVE",
      startDate: new Date()
    });

    await newSubscription.save();

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      payload: newSubscription
    });

  } catch (err) {
    next(err);
  }
});


// ================= GET MY =================
// retrieves the user's current subscription parameters (like address and active status) so the dashboard can render their live delivery profile accurately
subscriptionRouter.get("/my", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await SubscriptionModel
      .findOne({ userId })
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No subscription found"
      });
    }

    res.status(200).json({
      success: true,
      payload: subscription
    });

  } catch (err) {
    next(err);
  }
});


// ================= UPDATE =================
// allows the user to update their delivery address. however, we enforce a cutoff time check here because if the kitchen has already dispatched the meal, they shouldn't be able to reroute it at the last minute
subscriptionRouter.put("/update", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { address, city, pincode } = req.body;

    const subscription = await SubscriptionModel.findOne({
      userId,
      status: "ACTIVE"
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Active subscription not found"
      });
    }

    const now = new Date();
    const cutoff = getNextDeliveryCutoff();

    if (now > cutoff) {
      return res.status(400).json({
        success: false,
        message: "Cannot update address after cutoff time"
      });
    }

    // ✅ clean inputs
    if (address) subscription.address = address.trim();
    if (city) subscription.city = city.trim();
    if (pincode) subscription.pincode = pincode.toString().trim();

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      payload: subscription
    });

  } catch (err) {
    next(err);
  }
});


// ================= STATUS =================
// this acts as the master toggle switch for their account. if they pause it here, the nightly cron job will completely ignore them during the billing and delivery dispatch cycle
subscriptionRouter.patch(
  "/status",
  verifyToken("USER"),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { status } = req.body;

      const subscription = await SubscriptionModel.findOne({ userId });

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }

      // ================= PAUSE =================
      if (status === "PAUSED") {

        subscription.status = "PAUSED";

        await subscription.save();

        return res.status(200).json({
          success: true,
          message: "Subscription paused successfully",
          payload: subscription,
        });
      }

      // ================= RESUME =================
      if (status === "ACTIVE") {

        subscription.status = "ACTIVE";

        await subscription.save();

        return res.status(200).json({
          success: true,
          message: "Subscription resumed successfully",
          payload: subscription,
        });
      }

      // ================= CANCEL =================
      if (status === "CANCELLED") {

        subscription.status = "CANCELLED";

        await subscription.save();

        return res.status(200).json({
          success: true,
          message: "Subscription cancelled successfully",
          payload: subscription,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });

    } catch (err) {
      next(err);
    }
  }
);

