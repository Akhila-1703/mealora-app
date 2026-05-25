import useAdminStore from "../store/adminStore";

const useAdmin = () => {
  const {
    dashboard,
    users,
    todayMeals,
    todayDeliveries,
    reports,
    processResult,
    billingRuns,
    loading,
    fetchDashboard,
    fetchUsers,
    toggleUserStatus,
    fetchTodayMeals,
    runProcessMeals,
    fetchTodayDeliveries,
    excludeUserAction,
    deliverUserAction,
    fetchReports,
    fetchBillingRuns,
  } = useAdminStore();

  return {
    dashboard,
    users,
    todayMeals,
    todayDeliveries,
    reports,
    processResult,
    billingRuns,
    loading,
    fetchDashboard,
    fetchUsers,
    toggleUserStatus,
    fetchTodayMeals,
    runProcessMeals,
    fetchTodayDeliveries,
    excludeUserAction,
    deliverUserAction,
    fetchReports,
    fetchBillingRuns,
  };
};

export default useAdmin;