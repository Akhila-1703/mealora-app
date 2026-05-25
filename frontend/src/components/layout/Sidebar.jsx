import React from "react";
import { NavLink } from "react-router-dom";

import {
  sidebar,
  sidebarItem,
  sidebarItemActive,
  primaryBtn,
  navBrand,
} from "../../styles/common";

function Sidebar() {
  return (
    <div className={sidebar}>

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="MealFlow" className="w-8 h-8 object-contain" />
          <h2 className={navBrand}>
            <span className="text-[#332520]">Meal</span>
            <span className="text-[#C04E2D]">Flow</span>
          </h2>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-1">

          {/* DASHBOARD */}
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Dashboard
          </NavLink>

          {/* SKIP MEALS */}
          <NavLink
            to="/dashboard/skip"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Skip Meals
          </NavLink>

          {/* VIEW MENU */}
          <NavLink
            to="/dashboard/menu"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            View Menu
          </NavLink>

          {/* WALLET */}
          <NavLink
            to="/dashboard/wallet"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Wallet
          </NavLink>

          {/* SUBSCRIPTION */}
          <NavLink
            to="/dashboard/subscription"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Subscription
          </NavLink>

          {/* PROFILE */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Profile
          </NavLink>

          {/* SUPPORT */}
          <NavLink
            to="/dashboard/support"
            className={({ isActive }) =>
              isActive ? sidebarItemActive : sidebarItem
            }
          >
            Support
          </NavLink>

        </nav>
      </div>

      {/* BOTTOM */}
      <div>
        <NavLink 
          to="/dashboard/wallet"
          className={`${primaryBtn} w-full text-center block`}
        >
          Add Funds
        </NavLink>
      </div>

    </div>
  );
}

export default Sidebar;