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
      {/* NAVIGATION */}
      <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible flex-1 pr-4 lg:pr-0 scrollbar-none">
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

      {/* BOTTOM */}
      <div className="flex-shrink-0 pl-2 lg:pl-0">
        <NavLink 
          to="/dashboard/wallet"
          className={`${primaryBtn} whitespace-nowrap text-center block`}
        >
          Add Funds
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;