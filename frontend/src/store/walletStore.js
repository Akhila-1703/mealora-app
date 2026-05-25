import { create } from "zustand";
import {
  getWalletBalance,
  getTransactions,
  addMoney,
} from "../api/walletApi";

const useWalletStore = create((set) => ({
  balance: 0,
  transactions: [],
  loading: false,

  fetchWallet: async () => {
    try {
      set({ loading: true });

      const [balRes, txRes] = await Promise.all([
        getWalletBalance(),
        getTransactions(),
      ]);

      set({
        balance: balRes.data?.payload?.walletBalance || 0,
        transactions: txRes.data?.payload || [],
        loading: false,
      });

    } catch (err) {
      console.error("Wallet error", err);
      set({ loading: false });
    }
  },

  addMoneyToWallet: async (data) => {
    try {
      set({ loading: true });

      await addMoney(data);

      const [balRes, txRes] = await Promise.all([
        getWalletBalance(),
        getTransactions(),
      ]);

      set({
        balance: balRes.data?.payload?.walletBalance || 0,
        transactions: txRes.data?.payload || [],
        loading: false,
      });

    } catch (err) {
      console.error("Add money error", err);
      set({ loading: false });
    }
  },
}));

export default useWalletStore;