import axiosInstance from "./axios";

// ✅ No userId needed
export const getUserDashboard = () =>
  axiosInstance.get("/user-api/dashboard");

// ✅ No userId needed
export const updateProfile = (data) =>
  axiosInstance.put("/user-api/update-profile", data);

export const addAddress = (data) => axiosInstance.post("/user-api/address", data);
export const editAddress = (id, data) => axiosInstance.put(`/user-api/address/${id}`, data);
export const deleteAddress = (id) => axiosInstance.delete(`/user-api/address/${id}`);
export const setAddressOverride = (data) => axiosInstance.post("/user-api/address/override", data);