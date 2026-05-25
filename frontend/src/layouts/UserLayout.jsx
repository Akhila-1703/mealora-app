import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import {
  layoutWrapper,
  contentArea,
} from "../styles/common";

function UserLayout() {
  return (
    <div className={layoutWrapper}>
      <Sidebar role="USER" />

      <div className={contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default UserLayout;