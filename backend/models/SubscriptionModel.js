import { Schema, model, Types } from "mongoose"

const subscriptionSchema = new Schema({

    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true
    },

    address: {
        type: String,
        required: [true, "Address is required"]
    },

    city: {
        type: String,
        required: [true, "City is required"]
    },

    pincode: {
        type: String,
        required: [true, "Pincode is required"]
    },

    planType: {
        type: String,
        enum: ["TRIAL", "REGULAR"],
        default: "REGULAR"
    },

    mealPrice: {
        type: Number,
        required: [true, "Meal price is required"]
    },

    status: {
        type: String,
        enum: ["ACTIVE", "PAUSED", "CANCELLED"],
        default: "ACTIVE"
    },

    startDate: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    strict: "throw",
    versionKey: false
})

export const SubscriptionModel = model("subscriptions", subscriptionSchema)