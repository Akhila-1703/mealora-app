import cron from "node-cron";
import { UserModel } from "../models/UserModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { SkipMealModel } from "../models/SkipMealModel.js";
import { sendMealDeliveredEmail } from "./emailService.js";

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

export const initScheduler = () => {
  // Schedule email reminders for 1:00 PM daily
  cron.schedule("0 13 * * *", async () => {
    console.log("⏰ Running daily email reminders scheduler (1:00 PM)");
    try {
      const now = new Date();
      const todayStart = getStartOfDay(now);
      const todayEnd = getEndOfDay(now);

      // Get all active subscriptions
      const subscriptions = await SubscriptionModel.find({ status: "ACTIVE" });

      for (const sub of subscriptions) {
        const user = await UserModel.findById(sub.userId);
        if (!user) continue;
        
        // Check if user has opted in to email updates
        if (!user.emailUpdates) continue;

        const mealPrice = sub.mealPrice || 100;
        
        // Check wallet balance
        if (user.walletBalance < mealPrice) continue;

        // Check if user skipped meal today
        const skipped = await SkipMealModel.findOne({
          userId: user._id,
          date: { $gte: todayStart, $lte: todayEnd }
        });
        
        if (skipped) continue;

        // User is eligible, send email
        await sendMealDeliveredEmail(user.email, user.firstName);
      }
      
      console.log("✅ Daily email reminders completed");
    } catch (err) {
      console.error("❌ Error running email reminders:", err);
    }
  });
  
  console.log("⏱️ Scheduler initialized. Email reminders set for 1:00 PM daily.");
};
