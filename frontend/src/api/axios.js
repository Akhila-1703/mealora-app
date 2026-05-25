import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:4000" : "https://mealora-app.onrender.com",
  withCredentials: true, // 🔥 REQUIRED for cookie auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (clean, no token logic)
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (no auto logout)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;