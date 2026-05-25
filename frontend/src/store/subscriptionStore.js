import { create } from "zustand";

import {
  getMySubscription,
  createSubscription,
  updateSubscription,
  updateStatus,
} from "../api/subscriptionApi";

const useSubscriptionStore = create((set) => ({

  subscription: null,

  loading: false,

  // ================= FETCH =================
  fetchSubscription: async () => {

    try {

      set({ loading: true });

      const res = await getMySubscription();

      set({
        subscription: res.data?.payload || null,
        loading: false,
      });

    } catch (err) {

      console.error("Subscription error", err);

      set({
        loading: false,
      });
    }
  },

  // ================= CREATE =================
  createSub: async (data) => {

    try {

      set({ loading: true });

      await createSubscription(data);

      const res = await getMySubscription();

      set({
        subscription: res.data?.payload || null,
        loading: false,
      });

    } catch (err) {

      console.error("Create sub error", err);

      set({
        loading: false,
      });
    }
  },

  // ================= UPDATE =================
  updateSub: async (data) => {

    try {

      set({ loading: true });

      await updateSubscription(data);

      const res = await getMySubscription();

      set({
        subscription: res.data?.payload || null,
        loading: false,
      });

    } catch (err) {

      console.error("Update sub error", err);

      set({
        loading: false,
      });
    }
  },

  // ================= STATUS =================
  changeStatus: async (data) => {

    try {

      set({ loading: true });

      // ✅ FIXED
      await updateStatus(data);

      const res = await getMySubscription();

      set({
        subscription: res.data?.payload || null,
        loading: false,
      });

    } catch (err) {

      console.error("Status error", err);

      set({
        loading: false,
      });
    }
  },

}));

export default useSubscriptionStore;