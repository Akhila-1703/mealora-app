import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  loginUser,
  registerUser,
  logoutUser,
  updateProfileApi,
  changePasswordApi,
  deactivateAccountApi, // 🔥 ADD THIS
} from "../api/authApi";

import axiosInstance from "../api/axios";
import useAuthStore from "../store/authStore";

const useAuth = () => {
  const navigate = useNavigate();

  const { setUser, clearUser, setChecking } = useAuthStore();

  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================
  const login = useCallback(async (data) => {
    try {
      setLoading(true);

      const res = await loginUser(data);
      const user = res.data?.payload;

      setUser(user);

      toast.success("Login successful");

      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  // ================= REGISTER =================
const register = async (formData) => {
  try {
    setLoading(true);

    await registerUser(formData); // already correct

    toast.success("Registration successful");
    navigate("/login", { replace: true });

  } catch (err) {
    toast.error(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
  };
  

  // ================= LOGOUT =================
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error", error);
    }

    clearUser();
    navigate("/login", { replace: true });
  }, [clearUser, navigate]);

  // ================= AUTO LOGIN =================
const getCurrentUser = useCallback(async () => {
  try {
    setChecking(true);

    const res = await axiosInstance.get("/auth-api/me");
    setUser(res.data?.payload || res.data?.user);

  } catch (err) {
    // ✅ IGNORE 401 (user not logged in)
    if (err.response?.status !== 401) {
      console.error("Auth error", err);
    }

    clearUser();
  } finally {
    setChecking(false);
  }
}, [setChecking, setUser, clearUser]);

  // ================= UPDATE PROFILE =================
  const updateProfile = async (data) => {
    try {
      setLoading(true);

      const res = await updateProfileApi(data);

      setUser(res.data.payload);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= CHANGE PASSWORD =================
  const changePassword = async (data) => {
    try {
      setLoading(true);

      await changePasswordApi(data);

      toast.success("Password updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= 🔥 DEACTIVATE ACCOUNT =================
  const deactivateAccount = async () => {
    try {
      setLoading(true);

      await deactivateAccountApi();

      toast.success("Account deactivated");

      // logout user after deactivation
      clearUser();
      navigate("/login", { replace: true });

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to deactivate account"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    deactivateAccount, // 🔥 EXPORT THIS
    loading,
  };
};

export default useAuth;