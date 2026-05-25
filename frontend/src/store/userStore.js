import { create } from "zustand";
import { getUserDashboard } from "../api/userApi";

const useUserStore = create((set) => ({
  dashboard: null,
  loading: false,

  fetchDashboard: async () => {
    try {
      set({ loading: true });

      const res = await getUserDashboard();

      set({
        dashboard: res.data?.payload || null,
        loading: false,
      });

    } catch (err) {
      console.error("Dashboard error", err);
      set({ loading: false });
    }
  },
}));

export default useUserStore;