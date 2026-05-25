import axiosInstance from "./axios";

export const registerUser = (formData) =>
  axiosInstance.post("/auth-api/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const loginUser = (data) =>
  axiosInstance.post("/auth-api/login", data);

export const logoutUser = () =>
  axiosInstance.post("/auth-api/logout");

export const getCurrentUser = () =>
  axiosInstance.get("/auth-api/me");

// 🔥 FIXED
export const updateProfileApi = (formData) =>
  axiosInstance.put("/user-api/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const changePasswordApi = (data) =>
  axiosInstance.put("/auth-api/change-password", data);

export const deactivateAccountApi = () =>
  axiosInstance.patch("/auth-api/deactivate");