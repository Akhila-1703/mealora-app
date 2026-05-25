import { UserModel } from "../models/UserModel.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { SkipMealModel } from "../models/SkipMealModel.js";
import { WalletTransactionModel } from "../models/WalletTransactionModel.js";
import { BillingRunModel } from "../models/BillingRunModel.js";

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

// ================= DAILY MEAL PROCESSOR =================

export const processDailyDeductions = async (
  executor = "SYSTEM"
) => {

console.log(
`🍱 Running meal deduction (${executor})`
);

let processedCount = 0;

let skippedCount = 0;

let insufficientBalanceCount = 0;

const details = [];

const now = new Date();

const dateStr =
now.toISOString().split("T")[0];

const todayStart =
getStartOfDay(now);

const todayEnd =
getEndOfDay(now);

try {

const alreadyProcessed =
await BillingRunModel.findOne({
date: dateStr,
status: "SUCCESS"
});

if (alreadyProcessed) {

console.log(
"⚠️ Billing already completed today"
);

return alreadyProcessed;

}

const subscriptions =
await SubscriptionModel.find({
status: "ACTIVE"
});

for (const sub of subscriptions) {

const user =
await UserModel.findById(
sub.userId
);

if (!user) continue;

// ================= SKIP CHECK =================

const skipped =
await SkipMealModel.findOne({

userId: user._id,

date: {
$gte: todayStart,
$lte: todayEnd
}

});

if (skipped) {

skippedCount++;

details.push({

userId: user._id,

username:
user.username,

email:
user.email,

status:
"SKIPPED",

amount: 0

});

continue;

}

// ================= PRICE =================

const mealPrice =
sub.mealPrice || 100;

// ================= BALANCE =================

if (
user.walletBalance <
mealPrice
) {

insufficientBalanceCount++;

details.push({

userId:
user._id,

username:
user.username,

email:
user.email,

status:
"INSUFFICIENT_BALANCE",

amount: 0

});

continue;

}

// ================= DUPLICATE CHECK =================

const exists =
await WalletTransactionModel.findOne({

userId:
user._id,

reason:
"MEAL_DEDUCTED",

createdAt: {
$gte: todayStart,
$lte: todayEnd
}

});

if (exists) {

details.push({

userId:
user._id,

username:
user.username,

email:
user.email,

status:
"ALREADY_BILLED",

amount:
mealPrice

});

continue;

}

// ================= DEDUCT =================

user.walletBalance -= mealPrice;

await user.save();

// ================= TRANSACTION =================

await WalletTransactionModel.create({

userId:
user._id,

amount:
mealPrice,

type:
"DEBIT",

reason:
"MEAL_DEDUCTED"

});

processedCount++;

details.push({

userId:
user._id,

username:
user.username,

email:
user.email,

status:
"BILLED",

amount:
mealPrice

});

console.log(
`✅ Deducted ₹${mealPrice}`
);

}

// ================= SAVE LOG =================

return await BillingRunModel.findOneAndUpdate(

{
date: dateStr
},

{

date: dateStr,

status:
"SUCCESS",

executedBy:
executor,

processedCount,

skippedCount,

insufficientBalanceCount,

details

},

{

upsert: true,

new: true

}

);

}

catch (err) {

console.log(
"❌ Processor Error:",
err
);

await BillingRunModel.findOneAndUpdate(

{
date: dateStr
},

{

date: dateStr,

status:
"FAILED",

executedBy:
executor,

processedCount,

skippedCount,

insufficientBalanceCount,

details

},

{
upsert: true
}

);

throw err;

}

};