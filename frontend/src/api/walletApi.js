import axiosInstance from "./axios";

export const getWalletBalance = () =>
  axiosInstance.get("/wallet-api/balance");

export const getWalletStatus = () =>
  axiosInstance.get("/wallet-api/status");

export const addMoney = (data) =>
  axiosInstance.post("/wallet-api/add-money", data);

export const getTransactions = () =>
  axiosInstance.get("/wallet-api/transactions");