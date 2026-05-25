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
// ================= STATUS =================
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

/*subscriptionRouter.patch("/status", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    const allowedStatuses = ["ACTIVE", "PAUSED", "CANCELLED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const subscription = await SubscriptionModel.findOne({ userId });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (subscription.status === status) {
      return res.status(400).json({
        success: false,
        message: `Subscription already ${status}`
      });
    }

    subscription.status = status;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription status updated",
      payload: subscription
    });

  } catch (err) {
    next(err);
  }
});*/

/*import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { SubscriptionModel } from "../models/SubscriptionModel.js"

export const subscriptionRouter = exp.Router()

subscriptionRouter.post("/create", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id
    const { address, city, pincode } = req.body

    const existing = await SubscriptionModel.findOne({
      userId,
      status: "ACTIVE"
    })

    if (existing) {
      return res.status(400).json({
        message: "Active subscription already exists"
      })
    }

    const newSubscription = new SubscriptionModel({
      userId,
      address,
      city,
      pincode,
      mealPrice: 100,
      status: "ACTIVE",
      startDate: new Date()
    })

    await newSubscription.save()

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      payload: newSubscription
    })

  } catch (err) {
    next(err)
  }
})

subscriptionRouter.get("/my", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id

    const subscription = await SubscriptionModel.findOne({ userId })

    if (!subscription) {
      return res.status(404).json({
        message: "No subscription found"
      })
    }

    res.status(200).json({
      success: true,
      payload: subscription
    })

  } catch (err) {
    next(err)
  }
})

subscriptionRouter.put("/update", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id
    const { address, city, pincode } = req.body

    const subscription = await SubscriptionModel.findOne({
      userId,
      status: "ACTIVE"
    })

    if (!subscription) {
      return res.status(404).json({
        message: "Active subscription not found"
      })
    }

    // 🧠 CURRENT TIME
    const now = new Date()

    // 🧠 NEXT DELIVERY TIME (tomorrow 1 PM)
    const deliveryTime = new Date()
    deliveryTime.setDate(deliveryTime.getDate() + 1)
    deliveryTime.setHours(13, 0, 0, 0)

    // 🧠 CUTOFF (3 hours before delivery)
    const cutoff = new Date(deliveryTime.getTime() - 3 * 60 * 60 * 1000)

    // ❌ BLOCK if past cutoff
    if (now > cutoff) {
      return res.status(400).json({
        message: "Cannot update address after cutoff time"
      })
    }

    // ✅ UPDATE FIELDS
    if (address) subscription.address = address
    if (city) subscription.city = city
    if (pincode) subscription.pincode = pincode

    await subscription.save()

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      payload: subscription
    })

  } catch (err) {
    next(err)
  }
})

subscriptionRouter.patch("/status", verifyToken("USER"), async (req, res, next) => {
  try {

    const userId = req.user.id
    const { status } = req.body

    const allowedStatuses = ["ACTIVE", "PAUSED", "CANCELLED"]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      })
    }

    const subscription = await SubscriptionModel.findOne({ userId })

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found"
      })
    }

    subscription.status = status
    await subscription.save()

    res.status(200).json({
      success: true,
      message: "Subscription status updated",
      payload: subscription
    })

  } catch (err) {
    next(err)
  }
})*/