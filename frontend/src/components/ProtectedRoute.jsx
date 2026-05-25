import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function ProtectedRoute({ children, role }) {
  const { user, isCheckingAuth } = useAuthStore();

  // 🔥 wait until auth check finishes
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;