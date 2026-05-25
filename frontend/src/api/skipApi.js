import axiosInstance from "./axios";

export const skipMeals = (data) =>
  axiosInstance.post("/skipmeal-api", data);

export const getAllSkips = () =>
  axiosInstance.get("/skipmeal-api");

// ✅ THIS WAS MISSING
export const getTodaySkip = () =>
  axiosInstance.get("/skipmeal-api/today");

export const cancelSkip = (date) =>
  axiosInstance.delete(`/skipmeal-api/${date}`);