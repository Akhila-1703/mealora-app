import React, { useEffect, useState } from "react";
import useAdmin from "../../hooks/useAdmin";
import { CheckCircle, Calendar, Utensils, Zap, Search, Pencil, Ban, Wallet } from "lucide-react";

import Loader from "../../components/common/Loader";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function AdminDashboard() {
  const { dashboard, users, billingRuns, fetchDashboard, fetchUsers, fetchBillingRuns, loading } = useAdmin();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchBillingRuns();
  }, [fetchDashboard, fetchUsers, fetchBillingRuns]);

  if (loading && !dashboard) return <Loader />;

  // Filter users based on search
  const filteredUsers = users?.filter((user) => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const insufficientBalanceCount = users?.filter(u => (u.walletBalance ?? 0) < 400).length ?? 0;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-12 -mt-6">
      
      {/* HEADER SECTION */}
      <div className="w-full px-4 md:px-8 pt-8 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-[32px] font-bold text-[#1A1A1A] font-['Fraunces'] leading-none mb-2">
            Operations Hub
          </h1>
          <p className="text-[#666666] text-[15px]">
            Daily overview and automated 2:00 PM billing management.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* ACTIVE SUBS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <CheckCircle size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#4F4F4F]">Active Subs</span>
            </div>
            <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">
              {dashboard?.activeSubscriptions ?? 0}
            </span>
          </div>

          {/* TODAY'S SKIPS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#C04E2D]">
              <Calendar size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#4F4F4F]">Today's Skips</span>
            </div>
            <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">
              {dashboard?.skippedMeals ?? 0}
            </span>
          </div>

          {/* PREP COUNT */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#4F4F4F]">
              <Utensils size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Prep Count</span>
            </div>
            <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">
              {dashboard?.todayDeliveries ?? 0}
            </span>
          </div>

          {/* WALLET REVENUE */}
          <div className="bg-[#2B5240] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-[130px] text-white">
            <div className="flex items-center gap-2 text-[#A6C4B4]">
              <Wallet size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Wallet Revenue</span>
            </div>
            <span className="text-[36px] font-bold leading-none">
              ₹{(dashboard?.walletRevenue || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* MEALS DELIVERED REVENUE */}
          <div className="bg-[#C04E2D] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-[130px] text-white">
            <div className="flex items-center gap-2 text-[#F2C5B6]">
              <Utensils size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Meals Revenue</span>
            </div>
            <span className="text-[36px] font-bold leading-none">
              ₹{(dashboard?.mealsDeliveredRevenue || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* LATEST BILLING RUN RESULTS */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F5] flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">Latest Automated Billing Run</h2>
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase ${billingRuns?.[0]?.status === 'SUCCESS' ? 'bg-[#E8F5E9] text-[#2E7D32]' : billingRuns?.[0]?.status === 'FAILED' ? 'bg-[#FFEBEE] text-[#D32F2F]' : 'bg-[#F5F5F5] text-[#666666]'}`}>
              {billingRuns?.[0]?.status || 'PENDING'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#F5F5F5]">
            <div className="flex flex-col items-center justify-center p-8">
              <span className="text-[36px] font-bold text-[#2E7D32] leading-none mb-2">
                {billingRuns?.[0]?.processedCount ?? dashboard?.todayMealCount ?? 0}
              </span>
              <span className="text-[13px] font-medium text-[#666666]">Processed</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8">
              <span className="text-[36px] font-bold text-[#1A1A1A] leading-none mb-2">
                {billingRuns?.[0]?.skippedCount ?? dashboard?.skippedMeals ?? 0}
              </span>
              <span className="text-[13px] font-medium text-[#666666]">Skipped</span>
            </div>

            <div className="flex flex-col items-center justify-center p-8">
              <span className="text-[36px] font-bold text-[#D32F2F] leading-none mb-2">
                {billingRuns?.[0]?.insufficientBalanceCount ?? insufficientBalanceCount}
              </span>
              <span className="text-[13px] font-medium text-[#D32F2F]">Insufficient Balance</span>
            </div>
          </div>
        </div>

        {/* USER DIRECTORY */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">User Directory</h2>
            
            <div className="relative w-full md:w-[300px]">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-[#808080]" />
              </div>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl pl-11 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#F5F5F5]">
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">User</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Balance</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Sub State</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {filteredUsers.slice(0, 5).map((user) => {
                  const isLowBalance = (user.walletBalance ?? 0) < 400;
                  // For UI mockup parity, we'll randomize a bit if the data isn't exact, 
                  // but we stick to the data logic:
                  const isSkipped = false; // Add real skip logic if we have it in user object
                  
                  return (
                    <tr key={user._id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] ${isLowBalance ? 'bg-[#F97316]' : 'bg-[#2B5240]'}`}>
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#1A1A1A] text-[15px]">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[13px] text-[#666666]">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${isLowBalance ? 'bg-[#FFEBEE] text-[#D32F2F]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                          <span className="mr-1">{isLowBalance ? '•' : '•'}</span> 
                          ${(user.walletBalance || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`text-[14px] ${isSkipped ? 'text-[#808080] italic' : 'text-[#1A1A1A]'}`}>
                          {user.isActive ? (isSkipped ? 'Paused (Skipped Today)' : 'Active') : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-3 text-[#666666]">
                          <button className="p-1 hover:text-[#1A1A1A] transition-colors">
                            <Pencil size={18} />
                          </button>
                          <button className="p-1 hover:text-[#D32F2F] transition-colors">
                            <Ban size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-[#808080]">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;