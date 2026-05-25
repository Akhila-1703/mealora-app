import { create } from "zustand";
import {
  getAdminDashboard,
  getAllUsers,
  updateUserStatus,
  getTodayMeals,
  processMeals,
  getTodayDeliveries,
  excludeUser,
  deliverUser,
  getReports,
  getBillingRuns,
} from "../api/adminApi";

const useAdminStore = create((set) => ({
  dashboard: null,
  users: [],
  todayMeals: null,
  todayDeliveries: [],
  reports: null,
  processResult: null,
  billingRuns: [],
  loading: false,

  fetchDashboard: async () => {
    try {
      set({ loading: true });

      const res = await getAdminDashboard();

      set({
        dashboard: res.data?.payload,
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      set({ loading: true });

      const res = await getAllUsers();

      set({
        users: res.data?.payload || [],
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  toggleUserStatus: async (userId, isActive) => {
    try {
      set({ loading: true });

      await updateUserStatus(userId, { isActive });

      const res = await getAllUsers();

      set({
        users: res.data?.payload || [],
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchTodayMeals: async () => {
    try {
      set({ loading: true });

      const res = await getTodayMeals();

      set({
        todayMeals: res.data?.payload,
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  runProcessMeals: async () => {
    try {
      set({ loading: true });

      const res = await processMeals();

      set({
        processResult: res.data?.payload,
        loading: false,
      });

    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchTodayDeliveries: async () => {
    try {
      set({ loading: true });
      const res = await getTodayDeliveries();
      set({
        todayDeliveries: res.data?.payload || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  excludeUserAction: async (userId) => {
    try {
      set({ loading: true });
      await excludeUser(userId);
      const res = await getTodayDeliveries();
      set({
        todayDeliveries: res.data?.payload || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
      throw err;
    }
  },

  deliverUserAction: async (userId) => {
    try {
      set({ loading: true });
      await deliverUser(userId);
      const res = await getTodayDeliveries();
      set({
        todayDeliveries: res.data?.payload || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
      throw err;
    }
  },

  fetchReports: async () => {
    try {
      set({ loading: true });
      const res = await getReports();
      set({
        reports: res.data?.payload,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchBillingRuns: async () => {
    try {
      set({ loading: true });
      const res = await getBillingRuns();
      set({
        billingRuns: res.data?.payload || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },
}));

export default useAdminStore;