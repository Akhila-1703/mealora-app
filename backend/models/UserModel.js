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

    profileImageUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    profileImageId: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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

    emailUpdates: {
      type: Boolean,
      default: true,
    },

    addresses: [
      {
        tag: { type: String, required: true }, // e.g. "Home", "Office"
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
      }
    ],

    addressOverrides: [
      {
        date: { type: String, required: true }, // 'YYYY-MM-DD'
        addressId: { type: Schema.Types.ObjectId, required: true }
      }
    ]
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);

export const UserModel = model("users", userSchema);