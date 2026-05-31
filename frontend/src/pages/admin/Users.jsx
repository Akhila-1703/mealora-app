import React, { useEffect, useState } from "react";
import useAdmin from "../../hooks/useAdmin";
import { 
  Search, ChevronDown,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight 
} from "lucide-react";

import Loader from "../../components/common/Loader";

const Users = () => {
  const {
    users,
    dashboard,
    loading,
    fetchUsers,
    fetchDashboard,
    toggleUserStatus,
  } = useAdmin();

  // 🔥 LOCAL STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeUserId, setActiveUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchDashboard();
  }, [fetchUsers, fetchDashboard]);

  // 🔥 SAFE TOGGLE
  const handleToggle = async (userId, currentStatus) => {
    try {
      setActiveUserId(userId);
      await toggleUserStatus(userId, !currentStatus);
      await fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Failed to update user");
    } finally {
      setActiveUserId(null);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  // Metrics calculations
  const totalUsersCount = users?.length || 0;
  const activeSubsCount = users?.filter(u => u.isActive).length || 0;
  const pausedSubsCount = users?.filter(u => !u.isActive).length || 0;
  
  const totalRevenue = dashboard?.walletRevenue || 0;

  // Filter logic
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobile?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Active" && user.isActive) ||
      (statusFilter === "Paused" && !user.isActive);

    return matchesSearch && matchesStatus;
  }) || [];

  // Pagination setup (4 users per page to match mockup scale)
  const usersPerPage = 4;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  if (loading && users.length === 0) return <Loader />;

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-16 -mt-6">
      
      {/* HEADER SECTION */}
      <div className="w-full px-4 md:px-8 pt-8 pb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-2">
            User Directory
          </h1>
          <p className="text-[#827873] text-[15px]">
            Manage your subscribers and monitor community health.
          </p>
        </div>
        
          <div className="flex items-center gap-3">
            {/* Removed Export CSV + Advanced Filters as requested */}
          </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-8">

        {/* METRIC CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* TOTAL USERS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[135px] relative overflow-hidden">
            <div className="flex justify-between items-center text-[#827873] mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase">Total Users</span>
            </div>

            <span className="text-[32px] font-bold text-[#332520] leading-none mb-4">
              {totalUsersCount.toLocaleString()}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2E7D32] opacity-80" />
          </div>

          {/* ACTIVE SUBSCRIPTIONS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[135px] relative overflow-hidden">
            <div className="flex justify-between items-center text-[#827873] mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase">Active Subs</span>

            </div>
            <span className="text-[32px] font-bold text-[#332520] leading-none mb-4">
              {activeSubsCount.toLocaleString()}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2B5240]" />
          </div>

          {/* PAUSED SUBSCRIPTIONS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[135px] relative overflow-hidden">
            <div className="flex justify-between items-center text-[#827873] mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase">Paused Subs</span>

            </div>
            <span className="text-[32px] font-bold text-[#332520] leading-none mb-4">
              {pausedSubsCount.toLocaleString()}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F97316]" />
          </div>

          {/* TOTAL REVENUE */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[135px] relative overflow-hidden">
            <div className="flex justify-between items-center text-[#827873] mb-2">
              <span className="text-[11px] font-bold tracking-widest uppercase">Total Revenue</span>

            </div>
            <span className="text-[32px] font-bold text-[#332520] leading-none mb-4 font-['Inter']">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C04E2D]" />
          </div>
        </div>

        {/* DATA CONTAINER (TABLE & FILTERS) */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="px-8 py-6 border-b border-[#F5F5F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-[350px]">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-[#808080]" />
              </div>
              <input 
                type="text" 
                placeholder="Search by name, email, or mobile..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl pl-11 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E0E0E0] hover:bg-[#FAFAFA] px-4 py-2.5 pr-10 rounded-xl font-semibold text-[13px] text-[#332520] cursor-pointer focus:outline-none"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Status: Active</option>
                  <option value="Paused">Status: Paused</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#827873]" />
              </div>

            </div>
          </div>

          {/* CUSTOM DIRECTORY TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#F5F5F5]">
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">User Name</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Email & Mobile</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Wallet</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Join Date</th>
                  <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {currentUsers.map((user) => {
                  const isUpdating = activeUserId === user._id;

                  
                  // Format user._id into a short DBF id code
                  const shortId = `DBF-${user._id?.slice(-4).toUpperCase() || "1022"}`;

                  const formattedJoinDate = user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })
                    : "12 Oct 2023";

                  return (
                    <tr key={user._id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] ${user.isActive ? 'bg-[#2B5240]' : 'bg-[#E08D60]'}`}>
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#332520] text-[15px]">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-[11px] text-[#808080] font-medium uppercase tracking-wider">
                              ID: {shortId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[14px] text-[#4F4F4F]">{user.email}</span>
                          <span className="text-[11px] text-[#808080] font-semibold">{user.mobile || "No Mobile"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-bold">
                        <span className={(user.walletBalance ?? 0) < 0 ? 'text-[#D32F2F]' : (user.walletBalance ?? 0) < 400 ? 'text-[#E65100]' : 'text-[#2E7D32]'}>
                          ₹{(user.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[13px] text-[#827873] font-medium">
                        {formattedJoinDate}
                      </td>
                      <td className="px-8 py-5">
                        <button
                          disabled={isUpdating}
                          className={`px-4 py-2 rounded-lg text-white ${
                            user.isActive
                              ? "bg-red-500"
                              : "bg-green-600"
                          } ${isUpdating ? "opacity-70 cursor-not-allowed" : ""}`}
                          onClick={() => handleToggle(user._id, user.isActive)}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-12 text-center text-[#808080]">
                      No users found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          <div className="px-8 py-5 border-t border-[#F5F5F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-[13px] font-medium text-[#827873]">
              Showing {filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </span>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center text-[#827873] hover:bg-[#FAFAFA] disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold flex items-center justify-center border transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-[#2B5240] border-[#2B5240] text-white' 
                      : 'bg-white border-[#E0E0E0] text-[#332520] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-[#E0E0E0] flex items-center justify-center text-[#827873] hover:bg-[#FAFAFA] disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM WIDGETS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DAILY SIGNUPS CHART PLACEHOLDER */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col justify-between">


            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-[#332520]">Daily Signups</h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#827873]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A6C4B4]" /> Signups
                </span>
              </div>
            </div>

            {/* Custom Flex Chart */}
            <div className="h-[180px] flex items-end gap-3 px-2">
              {(dashboard?.dailySignups || [
                { day: "Mon", reg: 0 },
                { day: "Tue", reg: 0 },
                { day: "Wed", reg: 0 },
                { day: "Thu", reg: 0 },
                { day: "Fri", reg: 0 },
                { day: "Sat", reg: 0 },
                { day: "Sun", reg: 0 }
              ]).map((item, idx, arr) => {
                const maxReg = Math.max(...arr.map(d => d.reg), 5);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full relative flex flex-col justify-end h-[140px] rounded-lg overflow-hidden bg-[#FAFAFA]" title={`${item.reg} signups`}>
                      <div
                        style={{ height: `${(item.reg / maxReg) * 140}px` }}
                        className="w-full bg-[#A6C4B4] rounded-t-sm transition-all group-hover:opacity-90 flex items-start justify-center pt-1"
                      >
                        {item.reg > 0 && (
                          <span className="text-[10px] font-bold text-[#2B5240] leading-none select-none">
                            {item.reg}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#827873]">{item.day}</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Users;




