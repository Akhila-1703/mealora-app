import axiosInstance from "./axios";

// USER
export const getTodayMenu = () =>
  axiosInstance.get("/menu-api/today");

export const getWeeklyMenu = () =>
  axiosInstance.get("/menu-api/week");

// ADMIN
export const addMenu = (data) =>
  axiosInstance.post(
    "/menu-api",
    data
  );

export const updateMenu = (
  day,
  data
) =>
  axiosInstance.put(
    `/menu-api/${day}`,
    data
  );

export const uploadMenuImage = (
  formData
) =>
  axiosInstance.post(
    "/menu-api/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );