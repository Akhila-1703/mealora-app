import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:4000" : "https://mealora-app.onrender.com",
  withCredentials: true, // this is the most critical line for our stateless auth architecture. it forces the browser to attach the http-only jwt cookie to every single cross-origin request we make to the backend
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor. since our jwt lives securely in a cookie managed by the browser, we intentionally do not attach any bearer tokens here. this keeps our javascript memory clean and safe from xss payloads
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// response interceptor. we log network layer errors here for debugging, but we specifically don't auto-logout the user on 401s here to prevent aggressive session termination during brief network hiccups
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;