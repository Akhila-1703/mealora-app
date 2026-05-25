import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // 🔥 IMAGE URL (for display)
    profileImageUrl: {
      type: String,
      default: null,
    },

    // 🔥 ADD THIS (VERY IMPORTANT)
    profileImageId: {
      type: String,
      default: null,
    },

    state: {
      type: String,
    },

    userCategory: {
      type: String,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    skippedMealsCount: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);

export const UserModel = model("users", userSchema);