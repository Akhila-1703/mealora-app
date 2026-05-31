import React, { useEffect } from "react";
import useAdmin from "../../hooks/useAdmin";
import { CheckCircle, Calendar, Utensils, Wallet } from "lucide-react";

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
  const { dashboard, users, fetchDashboard, fetchUsers, fetchBillingRuns, loading } = useAdmin();



  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchBillingRuns();
  }, [fetchDashboard, fetchUsers, fetchBillingRuns]);

  if (loading && !dashboard) return <Loader />;

  const lowBalanceUsers = users?.filter(u => (u.walletBalance ?? 0) < 100) || [];

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-12 -mt-6">
      
      {/* HEADER SECTION */}
      <div className="w-full px-4 md:px-8 pt-8 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-2">
            Operations Hub
          </h1>
          <p className="text-[#827873] text-[15px]">
            Daily overview and automated 2:00 PM billing management.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-8">
        
        {/* STATS ROW */}
        {/* these top-level kpi cards give the admin a 10-second overview of the platform health. they map directly to the aggregation pipeline outputs from the backend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* ACTIVE SUBS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <CheckCircle size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#4F4F4F]">Active Subs</span>
            </div>
            <span className="text-[36px] font-bold text-[#332520] leading-none">
              {dashboard?.activeSubscriptions ?? 0}
            </span>
          </div>

          {/* TODAY'S SKIPS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#C04E2D]">
              <Calendar size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#4F4F4F]">Today's Skips</span>
            </div>
            <span className="text-[36px] font-bold text-[#332520] leading-none">
              {dashboard?.skippedMeals ?? 0}
            </span>
          </div>

          {/* PREP COUNT */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#4F4F4F]">
              <Utensils size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Prep Count</span>
            </div>
            <span className="text-[36px] font-bold text-[#332520] leading-none">
              {dashboard?.todayDeliveries ?? 0}
            </span>
          </div>

          {/* WALLET REVENUE */}
          <div className="bg-[#C04E2D] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-[130px] text-white">
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

        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden p-8 flex flex-col md:flex-row gap-8 items-stretch">
          <div className="flex flex-col items-center justify-center p-6 bg-red-50/50 rounded-2xl md:w-1/3 border border-red-100/50">
            <span className="text-[48px] font-black text-[#D32F2F] leading-none mb-3">
              {lowBalanceUsers.length}
            </span>
            <span className="text-[13px] font-bold text-[#D32F2F] tracking-wide uppercase text-center">Low Balance Users</span>
            <p className="text-[#827873] text-xs text-center mt-2 leading-relaxed">
              Active subscribers with wallet balance under ₹100.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <h2 className="text-[20px] font-bold text-[#332520] mb-1">Insufficient Balance Alert</h2>
              <p className="text-[#827873] text-sm mb-4">
                The following users' wallet balances are below the minimum threshold (₹100) required for their daily meal subscription.
              </p>
              
              {lowBalanceUsers.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2">
                  {lowBalanceUsers.map(u => (
                    <span key={u._id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl text-xs font-semibold text-[#332520]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {u.firstName} {u.lastName} (₹{(u.walletBalance ?? 0).toFixed(0)})
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center bg-[#F5F8F6] rounded-xl border border-emerald-100 text-emerald-800 text-sm font-semibold">
                  🎉 Excellent! All active users have sufficient balance.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#F5F5F5] pt-4 mt-4 text-xs text-[#827873]">
              <span>Status: <strong className="text-[#2E7D32] uppercase">Success</strong></span>
              <span>Last run: today at 1:00 PM</span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default AdminDashboard;

