import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, LogIn, ArrowLeft } from "lucide-react";
import useAuth from "../hooks/useAuth";

import {
  primaryBtn,
  formGroup,
} from "../styles/common";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row font-['Inter']">
      
      {/* LEFT SIDE - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative order-2 md:order-1 min-h-screen">
        
        {/* Logo / Back */}
        <div 
          className="absolute top-8 left-8 md:top-12 md:left-12 cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <span className="text-2xl font-black font-['Fraunces'] text-[#332520]">DabbaFresh</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black font-['Fraunces'] text-[#332520] mb-3">Welcome Back</h2>
            <p className="text-[#827873] text-lg">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={formGroup}>
              <label className="text-sm text-[#332520] font-bold mb-2 block">Email or Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                  <User size={20} />
                </div>
                <input
                  name="identifier"
                  type="text"
                  placeholder="you@example.com or username"
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E6E4DF] rounded-2xl py-4 pl-12 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all"
                  required
                />
              </div>
            </div>

            <div className={formGroup}>
              <label className="text-sm text-[#332520] font-bold mb-2 block">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  className="w-full bg-white border border-[#E6E4DF] rounded-2xl py-4 pl-12 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all"
                  required
                />
              </div>
            </div>

            <button 
              className={`${primaryBtn} w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-full text-lg shadow-sm`} 
              disabled={loading}
            >
              {loading ? "Signing in..." : (
                <>
                  Login <LogIn size={20} />
                </>
              )}
            </button>

            <p className="text-center mt-8 text-[#827873] font-medium">
              Don’t have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-[#C04E2D] cursor-pointer font-bold hover:text-[#A34226] transition-colors"
              >
                Sign up for free
              </span>
            </p>
          </form>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Image */}
      <div className="w-full md:w-1/2 h-64 md:h-auto bg-[#F4EEE8] relative order-1 md:order-2 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src="/login_side_image.png" 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#332520]/30 to-transparent" />
      </div>
    </div>
  );
};

export default Login;