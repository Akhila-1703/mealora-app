import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import useAuth from "../hooks/useAuth";

function RootLayout() {
  const { getCurrentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    getCurrentUser(); // 🔥 auto login using cookie
  }, [getCurrentUser]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-['Inter'] selection:bg-[#C04E2D]/10 selection:text-[#C04E2D]">
      <Navbar />

      <main className="relative pt-[73px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default RootLayout;