import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { MenuModel } from "../models/MenuModel.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

export const menuRouter = exp.Router();

// helper
const formatDay = (day) =>
  day.charAt(0).toUpperCase() +
  day.slice(1).toLowerCase();


// ================= UPLOAD IMAGE =================
menuRouter.post(
  "/upload",
  verifyToken("ADMIN"),
  upload.single("image"),
  async (req, res, next) => {
    try {

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided"
        });
      }

      const cloudinaryResult =
        await uploadToCloudinary(
          req.file.buffer
        );

      res.status(200).json({
        success: true,
        imageUrl:
          cloudinaryResult.secure_url,
        imagePublicId:
          cloudinaryResult.public_id
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= TODAY MENU =================
menuRouter.get(
  "/today",
  async (req, res, next) => {
    try {

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];

      const today =
        days[new Date().getDay()];

      const menu =
        await MenuModel.findOne({
          day: today
        });

      if (!menu) {
        return res.status(404).json({
          success: false,
          message:
            "Menu not found for today"
        });
      }

      res.status(200).json({
        success: true,
        payload: menu
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= WEEK MENU =================
menuRouter.get(
  "/week",
  async (req, res, next) => {
    try {

      const menus =
        await MenuModel.find();

      const order = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];

      menus.sort((a, b) =>
        order.indexOf(a.day) -
        order.indexOf(b.day)
      );

      res.status(200).json({
        success: true,
        payload: menus
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= ADD MENU =================
menuRouter.post(
  "/",
  verifyToken("ADMIN"),
  async (req, res, next) => {

    try {

      let {
        day,
        title,
        lunchMenu,
        imageUrl,
        imagePublicId
      } = req.body;

      if (!day) {
        return res.status(400).json({
          message:
            "Day is required"
        });
      }

      if (!title) {
        return res.status(400).json({
          message:
            "Title is required"
        });
      }

      day =
        formatDay(
          day.trim()
        );

      const existing =
        await MenuModel.findOne({
          day
        });

      if (existing) {
        return res.status(400).json({
          message:
            "Menu for this day already exists"
        });
      }

      const newMenu =
        new MenuModel({

          day,

          title,

          lunchMenu:
            lunchMenu,

          imageUrl:
            imageUrl || "",

          imagePublicId:
            imagePublicId || ""
        });

      await newMenu.save();

      res.status(201).json({
        success: true,
        message:
          "Menu created successfully",
        payload:
          newMenu
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= UPDATE MENU =================
menuRouter.put(
  "/:day",
  verifyToken("ADMIN"),
  async (req, res, next) => {

    try {

      let { day } =
        req.params;

      let {
        title,
        lunchMenu,
        imageUrl,
        imagePublicId
      } = req.body;

      day =
        formatDay(
          day.trim()
        );

      const existingMenu =
        await MenuModel.findOne({
          day
        });

      if (!existingMenu) {
        return res.status(404).json({
          message:
            "Menu not found"
        });
      }

      // Delete old image
      if (
        existingMenu.imagePublicId &&
        imagePublicId &&
        existingMenu.imagePublicId !==
          imagePublicId
      ) {
        try {

          await cloudinary
            .uploader
            .destroy(
              existingMenu.imagePublicId
            );

        } catch (err) {

          console.error(
            "Cloudinary delete failed",
            err
          );
        }
      }

      if (
        title !== undefined
      ) {
        existingMenu.title =
          title;
      }

      if (
        lunchMenu !== undefined
      ) {
        existingMenu.lunchMenu =
          lunchMenu;
      }

      if (
        imageUrl !== undefined
      ) {
        existingMenu.imageUrl =
          imageUrl;
      }

      if (
        imagePublicId !== undefined
      ) {
        existingMenu.imagePublicId =
          imagePublicId;
      }

      await existingMenu.save();

      res.status(200).json({

        success: true,

        message:
          "Menu updated successfully",

        payload:
          existingMenu
      });

    } catch (err) {
      next(err);
    }
  }
);

export default menuRouter;