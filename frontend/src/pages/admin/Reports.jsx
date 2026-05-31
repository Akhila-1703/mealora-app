import React, { useEffect, useState, useCallback } from "react";
import useAdmin from "../../hooks/useAdmin";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { RefreshCw, BarChart2, TrendingUp, Users, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

const COLORS = ["#EF5350", "#FFCA28", "#66BB6A"];

function Reports() {
  const { reports, fetchReports, loading } = useAdmin();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchReports();
      toast.success("Reports data updated");
    } catch (err) {
      toast.error("Failed to load reports");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Silent fetch on mount
    fetchReports().catch(() => {});
  }, [fetchReports]);

  if (loading && !reports) return <Loader />;

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-12 -mt-6">
      
      {/* HEADER */}
      <div className="w-full px-4 md:px-8 pt-8 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-2">
            Operations Report
          </h1>
          <p className="text-[#827873] text-[15px]">
            Comprehensive insights into service popularity, customer growth, and revenue trends.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="inline-flex items-center gap-2 border border-[#E0E0E0] hover:bg-white bg-[#FAFAFA] text-[#332520] px-5 py-3 rounded-xl text-[14px] font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          Refresh Reports
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-8">
        
        {!reports ? (
          <EmptyState message="No analytical report data available. Process some transactions or recharge wallets to begin." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* REVENUE GROWTH */}
            <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-6 md:p-8 flex flex-col justify-between min-w-0">
              <div className="mb-6">
                <span className="inline-flex p-3 rounded-2xl bg-[#FFF3E0] text-[#E65100] mb-3">
                  <TrendingUp size={20} />
                </span>
                <h3 className="text-[18px] font-bold text-[#332520]">Revenue Growth</h3>
                <p className="text-[13px] text-[#827873]">Monthly aggregated recharge volume</p>
              </div>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="99%" height="100%">
                  <AreaChart data={reports.revenueData || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C04E2D" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#C04E2D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                    <XAxis dataKey="month" stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#808080" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => [`₹${v}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#C04E2D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* MEAL POPULARITY */}
            <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-6 md:p-8 flex flex-col justify-between min-w-0">
              <div className="mb-6">
                <span className="inline-flex p-3 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] mb-3">
                  <BarChart2 size={20} />
                </span>
                <h3 className="text-[18px] font-bold text-[#332520]">Meal Popularity</h3>
                <p className="text-[13px] text-[#827873]">Served vs skipped ratio across weekday menus</p>
              </div>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={reports.popularityData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                    <XAxis dataKey="name" stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="served" fill="#2B5240" radius={[4, 4, 0, 0]} name="Served" />
                    <Bar dataKey="skipped" fill="#C04E2D" radius={[4, 4, 0, 0]} name="Skipped" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CUSTOMER GROWTH */}
            <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-6 md:p-8 flex flex-col justify-between min-w-0">
              <div className="mb-6">
                <span className="inline-flex p-3 rounded-2xl bg-[#E3F2FD] text-[#0D47A1] mb-3">
                  <Users size={20} />
                </span>
                <h3 className="text-[18px] font-bold text-[#332520]">Customer Base Growth</h3>
                <p className="text-[13px] text-[#827873]">Cumulative signups over months</p>
              </div>
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="99%" height="100%">
                  <AreaChart data={reports.userGrowthData || []}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                    <XAxis dataKey="month" stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#808080" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [v, "Cumulative Customers"]} />
                    <Area type="monotone" dataKey="users" stroke="#1E88E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WALLET SEGMENTATION */}
            <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-6 md:p-8 flex flex-col justify-between min-w-0">
              <div className="mb-6">
                <span className="inline-flex p-3 rounded-2xl bg-[#FFEBEE] text-[#C62828] mb-3">
                  <ShieldAlert size={20} />
                </span>
                <h3 className="text-[18px] font-bold text-[#332520]">Wallet Balance Segmentation</h3>
                <p className="text-[13px] text-[#827873]">User segmentation by wallet health thresholds</p>
              </div>
              <div className="h-[280px] w-full flex items-center justify-center min-w-0">
                <ResponsiveContainer width="99%" height="100%">
                  <PieChart>
                    <Pie
                      data={reports.walletUsageData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(reports.walletUsageData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, "Users"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Reports;

