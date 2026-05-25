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

      // 🔥 CHECK EXISTING USER BEFORE UPLOAD
      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }, { mobile }]
      });

      if (existingUser) {
        if (existingUser.username === username) return res.status(400).json({ success: false, message: "Username is already taken" });
        if (existingUser.email === email) return res.status(400).json({ success: false, message: "Email is already registered" });
        if (existingUser.mobile === mobile) return res.status(400).json({ success: false, message: "Mobile number is already registered" });
      }

      // 🔥 IMAGE UPLOAD
      if (req.file) {
        console.log("STEP 2: Uploading image...");
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
        console.log("STEP 3: Image uploaded");
      }

      console.log("STEP 4: Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("STEP 5: Creating user...");
      const user = new UserModel({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        mobile,
        profileImageUrl: cloudinaryResult?.secure_url || null,
        profileImageId: cloudinaryResult?.public_id || null,
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

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 SET COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
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
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});


// ================= CURRENT USER (IMPORTANT) =================
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

/*import exp from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const authRouter = exp.Router();


// ================= REGISTER =================
authRouter.post("/register", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      mobile,
    } = req.body;

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }, { mobile }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with email/username/mobile already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      firstName,
      lastName,
      username,
      email,
      mobile,
      password: hashedPassword,
      role: "USER",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {
    next(err);
  }
});


// ================= LOGIN =================
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔒 check if blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    // 🔥 CREATE TOKEN
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔥 SET COOKIE (VERY IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      sameSite: "lax",
    });

    // 🔥 REMOVE PASSWORD FROM RESPONSE
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
authRouter.post("/logout", (req, res, next) => {
  try {
    res.clearCookie("token"); // ✅ CORRECT PLACE

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
});


// ================= PROFILE =================
authRouter.get(
  "/profile/:userid",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { userid } = req.params;

      if (
        req.user.role !== "ADMIN" &&
        req.user.id.toString() !== userid
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await UserModel.findById(userid).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        success: true,
        payload: user,
      });

    } catch (err) {
      next(err);
    }
  }
);


// ================= CHANGE PASSWORD =================
authRouter.put(
  "/change-password/:userid",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { userid } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (
        req.user.role !== "ADMIN" &&
        req.user.id.toString() !== userid
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await UserModel.findById(userid);

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


// ================= CURRENT USER (NEW - IMPORTANT) =================
authRouter.get(
  "/me",
  verifyToken("USER", "ADMIN"),
  async (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  }
);*/

/*import exp from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { UserModel } from "../models/UserModel.js"
import { verifyToken } from "../middleware/verifyToken.js"

export const authRouter = exp.Router()

// ================= REGISTER =================
authRouter.post("/register", async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      mobile
    } = req.body

    // check existing user
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }, { mobile }]
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with email/username/mobile already exists"
      })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create user
    const newUser = new UserModel({
      firstName,
      lastName,
      username,
      email,
      mobile,
      password: hashedPassword,
      role: "USER" // force role
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    })

  } catch (err) {
    next(err)
  }
})


// ================= LOGIN =================
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    })

    res.status(200).json({
      success: true,
      message: "Login successful",
      payload: user
    })

  } catch (err) {
    next(err)
  }
})

// CHANGE PASSWORD
authRouter.put(
  "/change-password/:userid",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {

      const { userid } = req.params
      const { currentPassword, newPassword } = req.body

      // 🔒 SECURITY CHECK
      if (
        req.user.role !== "ADMIN" &&
        req.user.id.toString() !== userid
      ) {
        return res.status(403).json({ message: "Access denied" })
      }

      const user = await UserModel.findById(userid)

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      const match = await bcrypt.compare(currentPassword, user.password)
      if (!match) {
        return res.status(401).json({ message: "Current password incorrect" })
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          message: "New password must be different"
        })
      }

      user.password = await bcrypt.hash(newPassword, 10)
      await user.save()

      res.status(200).json({
        success: true,
        message: "Password updated successfully"
      })

    } catch (err) {
      next(err)
    }
  }
)


// ================= LOGOUT =================
authRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token")

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    })
  } catch (err) {
    next(err)
  }
})


// ================= PROFILE =================
authRouter.get(
  "/profile/:userid",
  verifyToken("USER", "ADMIN"),
  async (req, res, next) => {
    try {

      const { userid } = req.params

      // ✅ ensure same user OR admin
      if (
        req.user.role !== "ADMIN" &&
        req.user.id.toString() !== userid
      ) {
        return res.status(403).json({ message: "Access denied" })
      }

      const user = await UserModel.findById(userid).select("-password")

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      res.status(200).json({
        success: true,
        payload: user
      })

    } catch (err) {
      next(err)
    }
  }
)*/
/*authRouter.get("/profile/:userid", verifyToken("USER", "ADMIN"), async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      success: true,
      payload: user
    })

  } catch (err) {
    next(err)
  }
})*/