import { Schema, model, Types } from "mongoose"

const skipMealSchema = new Schema({

    userId: {
        type: Types.ObjectId,
        ref: "users",
        required: true
    },

    date: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    strict: "throw",
    versionKey: false
})

// Prevent duplicate skip for same day
skipMealSchema.index({ userId: 1, date: 1 }, { unique: true })

export const SkipMealModel = model("skipmeals", skipMealSchema)