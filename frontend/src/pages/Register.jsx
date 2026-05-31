import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Upload, UserPlus } from "lucide-react";
import useAuth from "../hooks/useAuth";

import {
  primaryBtn,
  formGroup,
} from "../styles/common";

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    mobile: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // form submission handler. we intentionally use a controlled form to validate inputs before making the heavy api call to the backend. upon success, zustand triggers a global state hydrate
  const handleSubmit = (e) => {
    // preventing default browser behavior to handle the submission seamlessly within the virtual dom
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (avatar) {
      formData.append("profileImageUrl", avatar);
    }

    register(formData);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row font-['Inter']">
      
      {/* LEFT SIDE - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 relative order-2 md:order-1 min-h-screen overflow-y-auto pt-24 md:pt-16">
        
        <div className="pt-24 md:pt-0"></div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-[32px] md:text-[36px] font-black font-['Inter'] text-[#332520] mb-3">Create Account</h2>
            <p className="text-[#827873] text-lg">Join MealOra for healthy, home-style meals.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
              <div className={formGroup}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">First Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <User size={18} />
                  </div>
                  <input
                    name="firstName"
                    placeholder="John"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.firstName ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
              </div>

              <div className={formGroup}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">Last Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <User size={18} />
                  </div>
                  <input
                    name="lastName"
                    placeholder="Doe"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.lastName ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
              </div>

              <div className={formGroup}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    placeholder="johndoe123"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.username ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username}</p>}
              </div>

              <div className={formGroup}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <Phone size={18} />
                  </div>
                  <input
                    name="mobile"
                    placeholder="+91 XXXXX XXXXX"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.mobile ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>}
              </div>

              <div className={`md:col-span-2 ${formGroup}`}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <Mail size={18} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>

              <div className={`md:col-span-2 ${formGroup}`}>
                <label className="text-sm text-[#332520] font-bold mb-2 block">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#827873]">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className={`w-full bg-white border border-[#E6E4DF] rounded-2xl py-3 pl-10 pr-4 text-[#332520] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>
            </div>

            <div className="mt-4 mb-8">
              <label className="text-sm text-[#332520] font-bold mb-2 block">Profile Picture <span className="text-[#827873] font-normal lowercase">(Optional)</span></label>
              <div className="flex items-center gap-6">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C04E2D] p-0.5"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#F4EEE8] flex items-center justify-center text-[#827873] border-2 border-dashed border-[#E6E4DF]">
                    <User size={24} />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-[#E6E4DF] bg-white rounded-2xl p-4 text-center hover:bg-[#F4EEE8] transition-colors">
                    <Upload size={20} className="mx-auto text-[#827873] mb-1" />
                    <p className="text-xs font-bold text-[#827873] uppercase tracking-widest">Click to upload avatar</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button 
              className={`${primaryBtn} w-full flex items-center justify-center gap-2 py-4 rounded-full text-lg shadow-sm mt-4`} 
              disabled={loading}
            >
              {loading ? "Creating Account..." : (
                <>
                  Sign Up Now <UserPlus size={20} />
                </>
              )}
            </button>

            <p className="text-center mt-6 text-[#827873] font-medium">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#C04E2D] cursor-pointer font-bold hover:text-[#A34226] transition-colors"
              >
                Login here
              </span>
            </p>
          </form>
        </motion.div>
      </div>

      {/* RIGHT SIDE - Image */}
      <div className="w-full md:w-1/2 h-64 md:h-auto bg-[#F4EEE8] relative order-1 md:order-2 overflow-hidden hidden md:block">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src="/register_side_image.png" 
          alt="Register Background" 
          className="w-full h-full object-cover"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#332520]/30 to-transparent" />
      </div>
    </div>
  );
};

export default Register;
