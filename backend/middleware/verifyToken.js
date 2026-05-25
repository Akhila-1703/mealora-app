import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserModel } from "../models/UserModel.js"; // ✅ FIXED

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      let token;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ FIXED MODEL USAGE
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is inactive" });
      }

      req.user = user;

      if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied"
        });
      }

      next();

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
  };
};

/*import jwt from "jsonwebtoken"
import { config } from "dotenv"

config()

export const verifyToken = (...allowedRoles) => {
  return (req, res, next) => {
    try {

      const authHeader = req.headers.authorization

      // ✅ support BOTH header + cookie
      let token

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]
      } else if (req.cookies?.token) {
        token = req.cookies.token
      }

      if (!token) {
        return res.status(401).json({ message: "Token missing" })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      }

      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied" })
      }

      next()

    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" })
    }
  }
}*/