import axiosInstance from "./axios";

// ✅ No userId needed
export const getUserDashboard = () =>
  axiosInstance.get("/user-api/dashboard");

// ✅ No userId needed
export const updateProfile = (data) =>
  axiosInstance.put("/user-api/update-profile", data);