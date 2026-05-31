import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { SkipMealModel } from "../models/SkipMealModel.js";

export const skipMealRouter = exp.Router();

// ================= HELPERS =================
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const getCurrentISTHour = () => {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false
  }).format(new Date());
  return parseInt(hourStr, 10) === 24 ? 0 : parseInt(hourStr, 10);
};

const formatDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

// ================= POST =================
skipMealRouter.post("/", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dates } = req.body;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Dates are required",
      });
    }

    const now = new Date();
    const today = getStartOfDay(new Date());

    const results = [];

    for (let dateStr of dates) {

      // ✅ FIXED TIMEZONE ISSUE
      const parsed = new Date(dateStr);

      const start = getStartOfDay(parsed);
      const end = getEndOfDay(parsed);

      let status = {
        date: formatDate(start),
        skipped: false,
        reason: null,
      };

      // ❌ past date
      if (start < today) {
        status.reason = "Cannot skip past date";
        results.push(status);
        continue;
      }

      // ❌ today's cutoff
      const isToday =
        formatDate(start) === formatDate(today);

      if (isToday) {
        if (getCurrentISTHour() >= 11) {
          return res.status(400).json({
            success: false,
            message: "You cannot skip today's meal after 11:00 AM",
          });
        }
      }

      // ❌ already skipped
      const existing = await SkipMealModel.findOne({
        userId,
        date: {
          $gte: start,
          $lte: end,
        },
      });

      if (existing) {
        status.reason = "Already skipped";
        results.push(status);
        continue;
      }

      // ✅ create skip
      await SkipMealModel.create({
        userId,
        date: start,
      });

      status.skipped = true;

      results.push(status);
    }

    res.status(200).json({
      success: true,
      message: "Skip meal processed",
      payload: results,
    });

  } catch (err) {
    next(err);
  }
});

// ================= GET ALL =================
skipMealRouter.get("/", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const skips = await SkipMealModel.find({
      userId,
    }).sort({ date: 1 });

    const formatted = skips.map((s) => ({
      date: formatDate(s.date),
    }));

    res.status(200).json({
      success: true,
      payload: formatted,
    });

  } catch (err) {
    next(err);
  }
});

// ================= TODAY =================
skipMealRouter.get("/today", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;

    const start = getStartOfDay(new Date());
    const end = getEndOfDay(new Date());

    const skip = await SkipMealModel.findOne({
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      success: true,
      payload: {
        date: formatDate(start),
        isSkipped: !!skip,
      },
    });

  } catch (err) {
    next(err);
  }
});

// ================= DELETE =================
skipMealRouter.delete("/:date", verifyToken("USER"), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date: dateStr } = req.params;

    const now = new Date();
    const today = getStartOfDay(new Date());

    // ✅ FIXED TIMEZONE ISSUE
    const parsed = new Date(dateStr);

    const start = getStartOfDay(parsed);
    const end = getEndOfDay(parsed);

    let response = {
      date: formatDate(start),
      cancelled: false,
      reason: null,
    };

    // ❌ cannot cancel past date
    if (start < today) {
      response.reason = "Cannot cancel past date";

      return res.status(400).json(response);
    }

    // ❌ cutoff only for today
    const isToday =
      formatDate(start) === formatDate(today);

    if (isToday) {
      if (getCurrentISTHour() >= 11) {
        response.reason = "Cutoff time passed";

        return res.status(400).json(response);
      }
    }

    // ✅ delete skip
    const deleted = await SkipMealModel.findOneAndDelete({
      userId,
      date: {
        $gte: start,
        $lte: end,
      },
    });

    if (!deleted) {
      response.reason = "Skip not found";

      return res.status(404).json(response);
    }

    response.cancelled = true;

    res.status(200).json({
      success: true,
      message: "Skip cancelled successfully",
      payload: response,
    });

  } catch (err) {
    next(err);
  }
});