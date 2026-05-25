import { create } from "zustand";
import toast from "react-hot-toast";

import {
  skipMeals,
  getAllSkips,
  getTodaySkip,
  cancelSkip,
} from "../api/skipApi";

const defaultToday = () => ({
  isSkipped: false,
  date: new Date().toISOString().split("T")[0],
});

const useSkipStore = create((set) => ({

  skips: [],

  todaySkipped: defaultToday(),

  loading: false,

  // ================= REFRESH =================
  refreshData: async () => {

    const [allRes, todayRes] = await Promise.all([
      getAllSkips(),
      getTodaySkip(),
    ]);

    set({
      skips: allRes.data?.payload || [],
      todaySkipped: todayRes.data?.payload || defaultToday(),
    });
  },

  // ================= FETCH =================
  fetchSkips: async () => {

    try {

      set({ loading: true });

      const [allRes, todayRes] = await Promise.all([
        getAllSkips(),
        getTodaySkip(),
      ]);

      set({
        skips: allRes.data?.payload || [],
        todaySkipped: todayRes.data?.payload || defaultToday(),
        loading: false,
      });

    } catch (err) {

      console.error("Fetch skip error", err);

      toast.error("Failed to fetch skips");

      set({
        loading: false,
      });
    }
  },

  // ================= ADD =================
  addSkipMeals: async (dates) => {

    try {

      set({ loading: true });

      const res = await skipMeals({ dates });

      await useSkipStore.getState().refreshData();

      toast.success("Meal skipped successfully");

      set({ loading: false });

      return res.data;

    } catch (err) {

      console.error("Skip add error", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.reason ||
        "Unable to skip meal";

      toast.error(message);

      set({ loading: false });

      throw err;
    }
  },

  // ================= REMOVE =================
  removeSkip: async (date) => {

    try {

      set({ loading: true });

      const res = await cancelSkip(date);

      await useSkipStore.getState().refreshData();

      toast.success("Skip cancelled successfully");

      set({ loading: false });

      return res.data;

    } catch (err) {

      console.error("Cancel skip error", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.reason ||
        "Unable to cancel skip";

      toast.error(message);

      set({ loading: false });

      throw err;
    }
  },

}));

export default useSkipStore;