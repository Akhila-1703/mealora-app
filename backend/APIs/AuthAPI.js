import exp from "express";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const authRouter = exp.Router();


// ================= REGISTER =================
// we handle user registration here, parsing multipart form data via multer so they can optionally upload a profile picture during sign up
authRouter.post(
  "/register",
  upload.single("profileImageUrl"),
  async (req, res) => {
    let cloudinaryResult;

    try {
      console.log("STEP 1: Request received");

      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const { firstName, lastName, username, email, password, mobile } = req.body;

      // checking if this user already exists in our system. we check against email, username, and mobile since all three must be unique in the database
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }, { mobile }]
      });

      if (existingUser) {
        if (existingUser.username === username) return res.status(400).json({ success: false, message: "Username is already taken" });
        if (existingUser.email === email) return res.status(400).json({ success: false, message: "Email is already registered" });
        if (existingUser.mobile === mobile) return res.status(400).json({ success: false, message: "Mobile number is already registered" });
      }

      // if a file was attached to the request, we stream its memory buffer directly up to cloudinary. we don't save it to the local disk to keep the server completely stateless
      if (req.file) {
        console.log("STEP 2: Uploading image...");
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        console.log("STEP 3: Image uploaded");
      }

      console.log("STEP 4: Hashing password...");
      // we use bcrypt with a salt round of 10. this is computationally expensive enough to thwart dictionary attacks but fast enough to not block our node event loop during traffic spikes
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("STEP 5: Creating user...");
      const user = new UserModel({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        mobile,
        ...(cloudinaryResult?.secure_url && { profileImageUrl: cloudinaryResult.secure_url }),
        ...(cloudinaryResult?.public_id && { profileImageId: cloudinaryResult.public_id }),
      });

      console.log("STEP 6: Saving user...");
      await user.save();

      console.log("STEP 7: Success");

      res.status(201).json({
        success: true,
        payload: user,
      });

    } catch (err) {
      console.error("REGISTER ERROR FULL:");
      console.error(err.stack); // 🔥 VERY IMPORTANT

      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      }

      res.status(500).json({
        success: false,
        message: err.message || "Server side error",
      });
    }
  }
);

// ================= LOGIN =================
// login handles authenticating the user and signing a secure jwt payload. we allow them to log in using either their username or email address
authRouter.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Account is deactivated. Contact support.",
      });
    }

    // generating a stateless jwt token holding the user's role and id so we don't have to hit the database to verify their session on subsequent requests
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // setting the token in an http-only cookie makes it completely invisible to javascript, neutralizing cross-site scripting (xss) token theft
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true for SameSite=None to work in production
      sameSite: "none",
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      payload: userObj,
    });

  } catch (err) {
    next(err);
  }
});


// ================= LOGOUT =================
// to log out, we simply instruct the browser to clear the http-only token cookie, immediately invalidating their session
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


// ================= CURRENT USER (IMPORTANT) =================
// this route acts as our hydration endpoint. whenever the frontend app mounts, it hits this route to exchange its cookie for the user's latest profile data
authRouter.get(
  "/me",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        success: true,
        user,
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= CHANGE PASSWORD =================
// allows the authenticated user to safely rotate their password by confirming their old password first
authRouter.put(
  "/change-password",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const match = await bcrypt.compare(currentPassword, user.password);

      if (!match) {
        return res.status(401).json({
          message: "Current password incorrect",
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: "New password must be different",
        });
      }

      // applying a high salt round to cryptographically secure the password against dictionary attacks
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });

    } catch (err) {
      next(err);
    }
  }
);

// DELETE USER
// we perform a soft delete here instead of dropping the record to preserve their transaction history in our ledgers
authRouter.patch("/deactivate", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await UserModel.findByIdAndUpdate(userId, {
      isActive: false,
    });

    res.json({ message: "Account deactivated successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate account" });
  }
});
