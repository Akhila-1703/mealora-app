import { Schema, model, Types } from "mongoose"

const walletTransactionSchema = new Schema({

    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: [true, "User ID is required"]
    },

    amount: {
        type: Number,
        required: [true, "Amount is required"]
    },

    type: {
        type: String,
        enum: ["CREDIT", "DEBIT"],
        required: [true, "Transaction type is required"]
    },

    reason: {
        type: String,
        enum: ["RECHARGE", "MEAL_DEDUCTED"],
        required: [true, "Reason is required"]
    },

    paymentMethod: {
        type: String,
        enum: ["UPI", "CARD"],
        required: function () {
            return this.type === "CREDIT"
        }
    }

}, {
    timestamps: true,
    strict: "throw",
    versionKey: false
})

export const WalletTransactionModel = model("wallettransactions", walletTransactionSchema)