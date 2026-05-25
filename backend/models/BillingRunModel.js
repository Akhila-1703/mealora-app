import { Schema, model } from "mongoose";

const billingRunSchema = new Schema({
  date: {
    type: String,
    required: true,
    unique: true // Ensure only one billing run log per day
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"],
    default: "SUCCESS"
  },
  processedCount: {
    type: Number,
    default: 0
  },
  skippedCount: {
    type: Number,
    default: 0
  },
  insufficientBalanceCount: {
    type: Number,
    default: 0
  },
  details: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "users"
      },
      username: String,
      email: String,
      status: {
        type: String,
        enum: ["BILLED", "SKIPPED", "INSUFFICIENT_BALANCE", "ALREADY_BILLED"]
      },
      amount: {
        type: Number,
        default: 0
      },
      errorReason: String
    }
  ],
  executedBy: {
    type: String,
    enum: ["SYSTEM", "ADMIN"],
    default: "SYSTEM"
  }
}, {
  timestamps: true,
  versionKey: false
});

export const BillingRunModel = model("billing_runs", billingRunSchema);
