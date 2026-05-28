import axiosInstance from "./axios";

// Dashboard
export const getAdminDashboard = () =>
  axiosInstance.get("/admin-api/dashboard");

// Users
export const getAllUsers = () =>
  axiosInstance.get("/admin-api/users");

export const updateUserStatus = (userId, data) =>
  axiosInstance.put(`/admin-api/user/${userId}`, data);

// Meals
export const getTodayMeals = () =>
  axiosInstance.get("/admin-api/meals/today");

export const processMeals = () =>
  axiosInstance.post("/admin-api/process-meals");

export const getTodayDeliveries = () =>
  axiosInstance.get("/admin-api/today-deliveries");

export const excludeUser = (userId) =>
  axiosInstance.post(`/admin-api/user/${userId}/exclude`);

export const deliverUser = (userId) =>
  axiosInstance.post(`/admin-api/user/${userId}/deliver`);

export const getReports = () =>
  axiosInstance.get("/admin-api/reports");

export const getBillingRuns = () =>
  axiosInstance.get("/admin-api/billing-runs");

export const getRevenueTotal = () =>
  axiosInstance.get("/admin-api/revenue/total");

export const getRevenueMonthly = () =>
  axiosInstance.get("/admin-api/revenue/monthly");

export const getRevenueWeekly = () =>
  axiosInstance.get("/admin-api/revenue/weekly");