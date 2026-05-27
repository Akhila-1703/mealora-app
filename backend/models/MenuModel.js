import { Schema, model } from "mongoose";

const menuSchema = new Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    lunchMenu: {
      type: String,
      required: [true, "Lunch menu is required"],
      trim: true,
    },



    imageUrl: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const MenuModel = model("menus", menuSchema);