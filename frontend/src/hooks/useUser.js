import { useCallback } from "react";
import useUserStore from "../store/userStore";
import { addAddress, editAddress, deleteAddress, setAddressOverride } from "../api/userApi";

const useUser = () => {
  const { dashboard, loading, fetchDashboard } = useUserStore();

  const loadDashboard = useCallback(() => {
    // ✅ No userId needed (cookie handles auth)
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAddAddress = async (data) => {
    await addAddress(data);
    await fetchDashboard();
  };

  const handleEditAddress = async (id, data) => {
    await editAddress(id, data);
    await fetchDashboard();
  };

  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
    await fetchDashboard();
  };

  const handleSetAddressOverride = async (data) => {
    await setAddressOverride(data);
    await fetchDashboard();
  };

  return {
    dashboard,
    loading,
    loadDashboard,
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddress,
    handleSetAddressOverride
  };
};

export default useUser;