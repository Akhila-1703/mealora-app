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
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="MealFlow" className="w-8 h-8 object-contain" />
          <h2 className={navBrand}>
            <span className="text-[#332520]">Meal</span>
            <span className="text-[#C04E2D]">Flow</span>
          </h2>
        </div>

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