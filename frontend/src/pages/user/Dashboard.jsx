import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  User, 
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Utensils,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useUser from "../../hooks/useUser";
import useAuthStore from "../../store/authStore";
import useSkip from "../../hooks/useSkip";
import Loader from "../../components/common/Loader";


const formatActivityTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  const timeStr = date.toLocaleTimeString('en-US', timeOptions);
  
  if (txDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  } else if (txDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  } else {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday}, ${timeStr}`;
  }
};

function Dashboard() {
  const { dashboard, loading, loadDashboard } = useUser();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
 addSkip,
 cancelSkip,
 fetchSkips,
} = useSkip();

  const getTodayLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSkipToday = async () => {
  const todayStr = getTodayLocalDateStr();

  try {

    await addSkip([todayStr]);

    await fetchSkips();

    await loadDashboard();

  } catch (err) {

    console.error(
      "Failed to skip today's meal",
      err
    );

  }
};

  const handleCancelSkip = async () => {
  const todayStr = getTodayLocalDateStr();

  try {

    await cancelSkip(todayStr);

    await fetchSkips();

    await loadDashboard();

  } catch (err) {

    console.error(
      "Failed to cancel today's skip",
      err
    );

  }
};

  const now = new Date();
  const isBefore11 = now.getHours() < 11;

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <Loader />;

  if (!dashboard) return <div className="p-8 text-center text-[#827873]">No dashboard data available</div>;

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen font-['Inter'] flex flex-col">
      
      {/* ================= WARNING BANNER ================= */}
      {dashboard.remainingMeals <= 2 && (
        <div className="w-full bg-[#FCE8E8] border-b border-[#F8D0D0] py-3 px-6 flex items-center justify-center gap-2 text-[#991B1B] text-sm font-semibold">
          <AlertCircle size={16} />
          {dashboard.message || `Recharge Urgently: Only ${dashboard.remainingMeals} meal left in your balance.`}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-[40px] font-bold text-[#1A1A1A] font-['Fraunces'] tracking-tight mb-2">
              Hello, {user?.firstName || "Customer"}
            </h1>
            <p className="text-[#666666] text-[15px]">
              Here is your daily meal summary.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#E8E8E8] flex items-center justify-center text-[#666666] border border-[#D1D1D1] cursor-pointer">
            <User size={20} />
          </div>
        </div>

        {/* ================= UPPER SECTION ================= */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          
          {/* DAILY MEAL CARD (Col span 2) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden flex flex-col md:flex-row shadow-sm">
            {/* Image Side */}
            <div className="w-full md:w-[45%] h-64 md:h-auto relative shrink-0 bg-[#F5F5F5]">
              {dashboard.imageUrl ? (
                <img 
                  src={dashboard.imageUrl} 
                  alt="Today's Meal" 
                  className="w-full h-full object-contain object-center bg-[#F5F5F5] p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#CCCCCC]">
                  <Utensils size={40} />
                </div>
              )}
              
              {dashboard.deliveryState === "SKIPPED" ? (
                <div className="absolute top-4 left-4 bg-[#827873] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <X size={12} strokeWidth={3} /> Meal Skipped
                </div>
              ) : dashboard.deliveryState === "DELIVERED" ? (
                <div className="absolute top-4 left-4 bg-[#114232] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={12} /> Meal Delivered
                </div>
              ) : dashboard.deliveryState === "PENDING_BEFORE_CUTOFF" ? (
                <div className="absolute top-4 left-4 bg-[#F2994A] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <Clock size={12} /> Arriving by 1 PM
                </div>
              ) : (
                <div className="absolute top-4 left-4 bg-[#F5B7B1] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                  <Clock size={12} /> Pending
                </div>
              )}

            </div>
            
            {/* Content Side */}
            <div className="p-6 md:p-8 flex flex-col justify-center w-full">
              <div className="flex items-center gap-1.5 text-[#219653] text-[13px] font-semibold mb-2">
                <CheckCircle2 size={16} /> Cooked freshly today
              </div>
              
              <h2 className="text-2xl md:text-[28px] font-bold text-[#1A1A1A] font-['Fraunces'] mb-3 leading-tight line-clamp-3">
                {dashboard.todayMenu || "No menu available for today"}
              </h2>
              
              <p className="text-[#666666] text-[15px] leading-relaxed mb-8 line-clamp-3">
                {dashboard.deliveryState === "SKIPPED"
                  ? "You have skipped your meal for today. The amount remains safely in your wallet." 
                  : dashboard.deliveryState === "PENDING_BEFORE_CUTOFF"
                  ? "Your meal is on the way. Arriving by 1 PM." 
                  : dashboard.deliveryState === "DELIVERED"
                  ? "Your meal has been delivered. Enjoy!" 
                  : "Meal delivery is pending."}
              </p>

              
              <div className="flex gap-4 mt-auto">
                {dashboard.deliveryState === "SKIPPED" ? (
                  isBefore11 ? (
                    <button
                      onClick={handleCancelSkip}
                      className="flex-1 bg-white hover:bg-[#FAF8F5] text-[#332520] border border-[#E6E4DF] font-semibold py-3 rounded-xl transition-all text-sm active:scale-95 cursor-pointer"
                    >
                      Cancel Skip
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-[#F2F2F2] text-[#827873] font-semibold py-3 rounded-xl text-sm cursor-not-allowed border border-[#EBEBEB]"
                    >
                      Meal Skipped
                    </button>
                  )
                ) : dashboard.deliveryState === "PENDING_BEFORE_CUTOFF" ? (
                  <button
                    onClick={handleSkipToday}
                    className="flex-1 bg-[#FAF8F5] border border-[#E6E4DF] hover:bg-[#F4EEE8] text-[#332520] font-semibold py-3 rounded-xl transition-all text-sm active:scale-95 cursor-pointer"
                  >
                    Skip Today
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-[#F2F2F2] text-[#827873] font-semibold py-3 rounded-xl text-sm cursor-not-allowed border border-[#EBEBEB]"
                  >
                    Cutoff Passed
                  </button>
                )}

                <button 
                  disabled={dashboard.deliveryState === "SKIPPED"}
                  className={`flex-1 font-semibold py-3 rounded-xl transition-all text-sm ${
                      dashboard.deliveryState === "SKIPPED" 
                      ? "bg-[#F5F5F5] text-[#CCCCCC] cursor-not-allowed border border-[#EBEBEB]"
                      : "bg-[#114232] hover:bg-[#0D3326] text-white cursor-pointer active:scale-95"
                  }`}
                >
                  Track
                </button>
              </div>
            </div>
          </div>

          {/* WALLET CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#4F4F4F] font-semibold text-sm mb-4">
                <Wallet size={16} /> Wallet Balance
              </div>
              
              <h2 className="text-[42px] font-bold text-[#333333] font-['Inter'] leading-none mb-3 tracking-tight">
                ₹{dashboard.walletBalance ?? 0}
              </h2>
              
              <div className="inline-flex items-center gap-1.5 bg-[#FCE8E8] text-[#991B1B] px-3 py-1.5 rounded-full text-xs font-semibold">
                <AlertCircle size={12} /> Approx. {dashboard.remainingMeals ?? 0} meal remaining
              </div>
            </div>
            
            <button 
              onClick={() => navigate("/dashboard/wallet")}
              className="w-full bg-[#9A3B14] hover:bg-[#7A2E0F] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm mt-8"
            >
              Add Funds
            </button>
          </div>
        </div>

        {/* ================= LOWER SECTION ================= */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* SUBSCRIPTION CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-[#1A1A1A] font-['Inter']">Subscription</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                dashboard.subscriptionStatus === "ACTIVE" 
                  ? "bg-[#D1E7DD] text-[#0F5132]" 
                  : "bg-[#F8D7DA] text-[#842029]"
              }`}>
                <CheckCircle2 size={12} /> {dashboard.subscriptionStatus === "ACTIVE" ? "Active" : "Inactive"}
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 mt-auto">
              <div className="flex items-center gap-1.5 text-[#666666] text-xs font-medium mb-1.5 font-['Inter']">
                <MapPin size={13} /> Delivery Address
              </div>
              <p className="text-[#1A1A1A] font-semibold text-[15px] font-['Inter'] leading-normal">
                {dashboard.deliveryAddress || "No active delivery address"}
              </p>
            </div>
          </div>

          {/* RECENT ACTIVITY CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1A1A1A] font-['Fraunces']">Recent Activity</h3>
              <button 
                onClick={() => navigate("/dashboard/wallet")}
                className="text-[#2E7D32] text-xs font-bold hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {(!dashboard.recentTransactions || dashboard.recentTransactions.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-6 text-[#808080]">
                  <p className="text-sm italic font-['Inter']">No recent activities</p>
                </div>
              ) : (
                dashboard.recentTransactions.map((tx) => {
                  const isCredit = tx.type === "CREDIT";
                  const label = tx.reason === "RECHARGE" ? "Funds Added" : (tx.reason === "MEAL_DEDUCTED" ? "Meal Deduction" : tx.reason);
                  
                  return (
                    <div key={tx._id} className="flex items-center justify-between font-['Inter']">
                      <div className="flex items-center gap-4">
                        {isCredit ? (
                          <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                            <span className="text-lg font-bold">+</span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#666666]">
                            <Utensils size={16} />
                          </div>
                        )}
                        <div>
                          <p className="text-[#1A1A1A] font-semibold text-sm">{label}</p>
                          <p className="text-[#808080] text-xs mt-0.5">{formatActivityTime(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${isCredit ? "text-[#2E7D32]" : "text-[#1A1A1A]"}`}>
                        {isCredit ? "+" : "-"}₹{tx.amount}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
