import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/layout/AdminSidebar";
import {
  layoutWrapper,
  contentArea,
} from "../styles/common";

function AdminLayout() {
  return (
    <div className={layoutWrapper}>
      <AdminSidebar />

      <div className={contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;