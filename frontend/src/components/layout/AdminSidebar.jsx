import React from "react";
import { NavLink } from "react-router-dom";
import {
  sidebar,
  sidebarItem,
  sidebarItemActive,
  navBrand,
} from "../../styles/common";

function AdminSidebar() {
  return (
    <div className={sidebar}>
      
      {/* Top */}
      <div>


        <nav className="flex flex-col gap-2">

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
            to="/admin/process-meals"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Operations
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
    </div>
  );
}

export default AdminSidebar;