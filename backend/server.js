import exp from "express"
import mongoose from "mongoose"
import { config } from "dotenv"
import cookieParser from "cookie-parser"
import path from "path"
import cors from "cors";

// import routers
import { authRouter } from "./APIs/AuthAPI.js"
import {subscriptionRouter } from './APIs/SubscriptionAPI .js'
import { userRouter } from "./APIs/UserAPI.js"
import { menuRouter } from "./APIs/MenuAPI.js"
import { walletRouter } from "./APIs/WalletAPI.js"
import { skipMealRouter } from "./APIs/SkipMealAPI.js"
import { adminRouter } from "./APIs/AdminAPI.js"

config()

const app = exp()

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://mealora-app.vercel.app",
    ],
    credentials: true,
  })
);

// ================= MIDDLEWARE =================
app.use(exp.json())
app.use(cookieParser())

// ================= ROUTES =================
app.use("/auth-api", authRouter)
app.use("/user-api", userRouter)
app.use("/subscription-api", subscriptionRouter)
app.use("/menu-api", menuRouter)
app.use("/wallet-api", walletRouter)
app.use("/skipmeal-api", skipMealRouter)
app.use("/admin-api", adminRouter)
app.post(
"/scheduler-api/deduct",

async (req, res) => {
  try {
    // Manual run endpoint: scheduler should call the processor.
    // Keeping this route intact for manual/admin triggers.
    const { processDailyDeductions } = await import("./services/mealProcessor.js");
    const result = await processDailyDeductions("MANUAL");

    res.status(200).json({
      success: true,
      payload: result
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Meal deduction failed"
    });
  }
}
);


// static files (optional)
app.use("/uploads", exp.static(path.join(path.resolve(), "uploads")))

// ================= DB CONNECTION =================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL)

    console.log("DB connection successful")

    // Keep server start only here; do NOT run deductions automatically on startup.
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    })


  } catch (err) {
    console.log("DB connection error:", err)
  }
}

connectDB()

// ================= INVALID ROUTE =================
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`
  })
})

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {

  console.log("Error:", err)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      error: err.message
    })
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID",
      error: err.message
    })
  }

  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue

  if (errCode === 11000 && keyValue) {
    const field = Object.keys(keyValue)[0]
    const value = keyValue[field]

    return res.status(409).json({
      message: "Duplicate value",
      error: `${field} "${value}" already exists`
    })
  }

  if (err.status) {
    return res.status(err.status).json({
      message: err.message
    })
  }

  res.status(500).json({
    message: "Server side error"
  })
})