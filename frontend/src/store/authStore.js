import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // we intentionally don't hydrate this directly from localstorage on boot to prevent ui flashes if the backend cookie is already expired. the initial /check-auth call will populate this reliably
  isCheckingAuth: true, // we default this to true so the entire react tree can render a global loading spinner until the backend validates our http-only cookie

  setUser: (user) => {
    // we still mirror the user object to localstorage just for quick non-blocking reads across tabs, but the real source of truth remains the secure cookie on the backend
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },

  setChecking: (value) => set({ isCheckingAuth: value }),
}));

export default useAuthStore;