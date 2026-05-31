import React from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function ProtectedRoute({ children, role }) {
  const { user, isCheckingAuth } = useAuthStore();

  // this is the core gatekeeper check. if our global zustand state is still waiting on the /check-auth api to return, we halt the render tree completely and show a fallback ui to prevent ui flickering
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

  // role based access control (rbac). if they are logged in but trying to access a route they don't have clearance for (e.g., a standard user navigating to /admin), we safely redirect them to the unauthorized page
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;