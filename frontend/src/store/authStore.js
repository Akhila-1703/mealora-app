import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // ✅ no localStorage as source
  isCheckingAuth: true, // 🔥 important

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user)); // optional (for quick reload UI)
    set({ user });
  },

  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },

  setChecking: (value) => set({ isCheckingAuth: value }),
}));

export default useAuthStore;