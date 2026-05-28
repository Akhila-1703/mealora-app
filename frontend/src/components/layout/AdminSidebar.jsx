import React from "react";
import { NavLink } from "react-router-dom";
import {
  sidebar,
  sidebarItem,
  sidebarItemActive,
} from "../../styles/common";


function AdminSidebar() {
  return (
    <div className={sidebar}>
      <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible flex-1 pr-4 lg:pr-0 scrollbar-none">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? sidebarItemActive : sidebarItem
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive ? sidebarItemActive : sidebarItem
          }
        >
          Users
        </NavLink>

        <NavLink
          to="/admin/menu"
          className={({ isActive }) =>
            isActive ? sidebarItemActive : sidebarItem
          }
        >
          Menu Management
        </NavLink>



        <NavLink
          to="/admin/reports"
          className={({ isActive }) =>
            isActive ? sidebarItemActive : sidebarItem
          }
        >
          Reports
        </NavLink>
      </nav>
    </div>
  );
}

export default AdminSidebar;