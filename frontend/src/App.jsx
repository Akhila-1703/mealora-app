import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ================= LAYOUTS =================
import RootLayout from "./layouts/RootLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import SupportPublic from "./pages/user/Support";

// ================= USER PAGES =================
import UserDashboard from "./pages/user/Dashboard";
import Wallet from "./pages/user/Wallet";
import SkipMeal from "./pages/user/SkipMeal";
import Subscription from "./pages/user/Subscription";
import Profile from "./pages/user/Profile";
import SupportUser from "./pages/user/Support";
import WeeklyMenu from "./pages/user/WeeklyMenu";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import AdminMenu from "./pages/admin/MenuEditor";
import Reports from "./pages/admin/Reports";


// ================= COMPONENTS =================
import Unauthorized from "./components/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

// ================= NOT FOUND =================
const NotFound = () => (
  <div className="flex items-center justify-center h-screen text-gray-500 text-lg">
    Page Not Found
  </div>
);

function App() {

  // we use createBrowserRouter instead of the older BrowserRouter because it enables react router v6.4+ data fetching APIs. this is the central nervous system of our client-side routing
  const routerObj = createBrowserRouter([

    {
      path: "/",
      element: <RootLayout />,

      children: [

        // ======================================================
        // 🌐 PUBLIC ROUTES
        // ======================================================

        {
          index: true,
          element: <Home />,
        },

        {
          path: "menu",
          element: <Menu />,
        },

        {
          path: "support",
          element: <SupportPublic />,
        },

        {
          path: "login",
          element: <Login />,
        },

        {
          path: "register",
          element: <Register />,
        },

        // ======================================================
        // 👤 USER ROUTES
        // ======================================================

        {
          path: "dashboard",

          // the dashboard is protected by our custom gatekeeper component. if a user without the 'USER' role tries to hit this route, they get bounced back to the login page immediately
          element: (
            <ProtectedRoute role="USER">
              <UserLayout />
            </ProtectedRoute>
          ),

          children: [

            // DASHBOARD HOME
            {
              index: true,
              element: <UserDashboard />,
            },

            // SKIP MEALS
            {
              path: "skip",
              element: <SkipMeal />,
            },

            // VIEW MENU
            {
              path: "menu",
              element: <WeeklyMenu />,
            },

            // WALLET
            {
              path: "wallet",
              element: <Wallet />,
            },

            // SUBSCRIPTION
            {
              path: "subscription",
              element: <Subscription />,
            },

            // PROFILE
            {
              path: "profile",
              element: <Profile />,
            },

            // SUPPORT
            {
              path: "support",
              element: <SupportUser />,
            },

          ],
        },

        // ======================================================
        // 👨‍🍳 ADMIN ROUTES
        // ======================================================

        {
          path: "admin",

          // exact same gatekeeper logic here, but strictly requiring the 'ADMIN' enum. this prevents regular users from ever loading the javascript chunks for the admin panel
          element: (
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          ),

          children: [

            // ADMIN DASHBOARD
            {
              index: true,
              element: <AdminDashboard />,
            },

            // USERS
            {
              path: "users",
              element: <Users />,
            },

            // MENU EDITOR
            {
              path: "menu",
              element: <AdminMenu />,
            },



            // REPORTS
            {
              path: "reports",
              element: <Reports />,
            },

          ],
        },

        // ======================================================
        // ⚠️ ERROR ROUTES
        // ======================================================

        {
          path: "unauthorized",
          element: <Unauthorized />,
        },

        {
          path: "*",
          element: <NotFound />,
        },

      ],
    },

  ]);

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      <RouterProvider router={routerObj} />
    </>
  );
}

export default App;