import axiosInstance from "./axios";

// 🔹 Create subscription
export const createSubscription = (data) =>
  axiosInstance.post("/subscription-api/create", data);

// 🔹 Get my subscription
export const getMySubscription = () =>
  axiosInstance.get("/subscription-api/my");

// 🔹 Update subscription details
export const updateSubscription = (data) =>
  axiosInstance.put("/subscription-api/update", data);

// 🔹 Update status (ACTIVE / PAUSED) ✅ ADD THIS
export const updateStatus = (data) =>
  axiosInstance.patch("/subscription-api/status", data);