import { useCallback } from "react";
import useUserStore from "../store/userStore";

const useUser = () => {
  const { dashboard, loading, fetchDashboard } = useUserStore();

  const loadDashboard = useCallback(() => {
    // ✅ No userId needed (cookie handles auth)
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    loadDashboard,
  };
};

export default useUser;