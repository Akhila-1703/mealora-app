import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";

import { User, LogOut, Menu as MenuIcon, X } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useAuth from "../../hooks/useAuth";





function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Scroll to hash on location change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, path) => {
    if (path.startsWith("/#")) {
      e.preventDefault();
      const hash = path.substring(1); // "#about"
      if (location.pathname !== "/") {
        navigate(path);
      } else {
        // already on home, just scroll
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        } else {
           // fallback: do not touch window.location.hash (eslint/runtime restriction)
           // just scroll if possible.
           const fallbackEl = document.getElementById(id);
           if (fallbackEl) fallbackEl.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About us", path: "/#about" },
    { name: "Weekly Menu", path: "/menu" }
    
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E4DF] font-['Inter']">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-5">
        
        {/* Logo */}
        <div
          className="cursor-pointer flex-shrink-0 mr-12 flex items-center gap-3"
          onClick={() => navigate("/")}
        >
          <img src="/logo.png" alt="MealOra" className="h-8 object-contain" />
          <span className="text-2xl font-black font-['Fraunces'] text-[#332520]">MealOra</span>
        </div>

        {/* Desktop Unified Navigation */}
        <div className="hidden lg:flex items-center justify-between flex-1">
          
          {/* Main Links */}
          <div className="flex items-center gap-10">
            {navLinks.map((link) => (
              link.path.startsWith("/#") ? (
                <a 
                  key={link.name} 
                  href={link.path} 
                  onClick={(e) => handleNavClick(e, link.path)}
                  className="text-sm font-bold text-[#827873] hover:text-[#C04E2D] transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name}
                  to={link.path}
                  className="text-sm font-bold text-[#827873] hover:text-[#C04E2D] transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Auth Links */}
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6 border-l border-[#E6E4DF] pl-8">
                <Link to="/dashboard" className="flex items-center gap-2 font-bold text-[#332520] hover:text-[#C04E2D] transition-colors">
                  <User size={18} />
                  Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors font-bold"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/login" className="font-bold text-[#C04E2D] hover:text-[#A34226] transition-colors text-sm">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-[#332520] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-[#4C3A35] transition-all duration-300"
                >
                  Join the Table
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Icon */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="lg:hidden p-2 text-[#332520] hover:bg-[#F4EEE8] rounded-lg transition-colors focus:outline-none"
        >
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E6E4DF] px-8 py-6 flex flex-col gap-6 font-['Inter']">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              link.path.startsWith("/#") ? (
                <a 
                  key={link.name} 
                  href={link.path} 
                  onClick={(e) => {
                    handleNavClick(e, link.path);
                    setIsOpen(false);
                  }}
                  className="text-base font-bold text-[#827873] hover:text-[#C04E2D] transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-bold text-[#827873] hover:text-[#C04E2D] transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          <div className="border-t border-[#E6E4DF] pt-6 flex flex-col gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-bold text-[#332520] hover:text-[#C04E2D] transition-colors text-base"
                >
                  <User size={18} />
                  Dashboard
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors font-bold text-base text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="font-bold text-[#C04E2D] hover:text-[#A34226] transition-colors text-base text-center py-2.5 border border-[#C04E2D] rounded-full"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#332520] text-white px-8 py-3 rounded-full text-base font-bold hover:bg-[#4C3A35] transition-all text-center block"
                >
                  Join the Table
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
