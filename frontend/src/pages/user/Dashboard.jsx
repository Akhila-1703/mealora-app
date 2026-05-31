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
  const { dashboard, loading, loadDashboard, handleSetAddressOverride } = useUser();

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { addSkip, cancelSkip, fetchSkips } = useSkip();

  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [selectedAddressId, setSelectedAddressId] = React.useState("");

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

  const isLowBalance = (dashboard.walletBalance ?? 0) < 100;

  return (
    <div className="-m-6 md:-m-12 bg-[#FAF8F5] min-h-screen font-['Inter'] flex flex-col">
      
      {/* ================= WARNING BANNER ================= */}
      {/* we conditionally render this high-priority alert if the backend indicates their wallet balance drops below the threshold of 2 meals. this drives immediate conversion for recharges */}
      {dashboard.remainingMeals <= 2 && (
        <div className="w-full bg-[#F4EEE8] border-b border-[#E6E4DF] py-3 px-6 flex items-center justify-center gap-2 text-[#C04E2D] text-sm font-semibold">
          <AlertCircle size={16} />
          {dashboard.message || `Recharge Urgently: Only ${dashboard.remainingMeals} meal left in your balance.`}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-2">
              Hello, {user?.firstName || "Customer"}
            </h1>
            <p className="text-[#827873] text-[15px]">
              Here is your daily meal summary.
            </p>
          </div>
        </div>

        {/* ================= ONBOARDING SECTION ================= */}
        {/* if the user has literally just signed up and hasn't started their subscription yet, we intercept their dashboard feed with this gamified 3-step setup guide */}
        {dashboard.subscriptionStatus === "INACTIVE" && (
          <div className="bg-[#F4EEE8] border border-[#E6E4DF] rounded-2xl p-6 md:p-8 mb-8 text-[#332520] shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#332520] font-['Inter'] mb-2">Welcome! Let's get you started.</h2>
              <p className="text-[#827873] text-[15px] mb-6 max-w-2xl font-['Inter']">
                Complete these quick steps to start receiving delicious, home-style meals delivered right to your door.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Add Money */}
                <div className={`bg-white border border-[#E6E4DF] rounded-xl p-4 flex flex-col ${dashboard.walletBalance >= 100 ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#C04E2D] flex items-center justify-center font-bold text-white shrink-0">
                      {dashboard.walletBalance >= 100 ? <CheckCircle2 size={16} /> : "1"}
                    </div>
                    <span className="font-bold text-[#332520] font-['Inter']">Add Funds</span>
                  </div>
                  <p className="text-[#827873] text-xs leading-relaxed mb-3 flex-1 font-['Inter']">
                    Add money to your wallet to cover your daily meals. Minimum ₹100 required.
                  </p>
                  {dashboard.walletBalance < 100 && (
                    <button onClick={() => navigate("/dashboard/wallet")} className="w-full bg-[#FAF8F5] border border-[#E6E4DF] text-[#332520] py-2.5 rounded-lg text-xs font-bold hover:bg-[#F4EEE8] transition-colors font-['Inter']">
                      Go to Wallet
                    </button>
                  )}
                </div>

                {/* Step 2: Add Address */}
                <div className={`bg-white border border-[#E6E4DF] rounded-xl p-4 flex flex-col ${dashboard.addresses?.length > 0 ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#C04E2D] flex items-center justify-center font-bold text-white shrink-0">
                      {dashboard.addresses?.length > 0 ? <CheckCircle2 size={16} /> : "2"}
                    </div>
                    <span className="font-bold text-[#332520] font-['Inter']">Set Address</span>
                  </div>
                  <p className="text-[#827873] text-xs leading-relaxed mb-3 flex-1 font-['Inter']">
                    Tell us where to deliver your hot dabba every day.
                  </p>
                  {!(dashboard.addresses?.length > 0) && (
                    <button onClick={() => navigate("/dashboard/profile")} className="w-full bg-[#FAF8F5] border border-[#E6E4DF] text-[#332520] py-2.5 rounded-lg text-xs font-bold hover:bg-[#F4EEE8] transition-colors font-['Inter']">
                      Add Address
                    </button>
                  )}
                </div>

                {/* Step 3: Start Subscription */}
                <div className="bg-white border border-[#E6E4DF] rounded-xl p-4 flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#C04E2D] flex items-center justify-center font-bold text-white shrink-0">
                      3
                    </div>
                    <span className="font-bold text-[#332520] font-['Inter']">Start Subscription</span>
                  </div>
                  <p className="text-[#827873] text-xs leading-relaxed mb-3 flex-1 font-['Inter']">
                    Turn on daily deliveries once your wallet is funded and address is set.
                  </p>
                  <button onClick={() => navigate("/dashboard/subscription")} className="w-full bg-[#C04E2D] hover:bg-[#A33F23] text-white py-2.5 rounded-lg text-xs font-bold transition-colors font-['Inter']">
                    Activate Deliveries
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= UPPER SECTION ================= */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          
          <div className={`lg:col-span-2 bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden flex flex-col md:flex-row shadow-sm transition-all duration-300 ${dashboard.deliveryState === "MISSED_CUTOFF" || dashboard.deliveryState === "SKIPPED" ? "opacity-80" : ""}`}>
            {/* Image Side */}
            <div className={`w-full md:w-[45%] h-64 md:h-auto relative shrink-0 bg-[#F5F5F5] transition-all duration-300 ${dashboard.deliveryState === "MISSED_CUTOFF" || dashboard.deliveryState === "SKIPPED" ? "grayscale opacity-70" : ""}`}>
              {isLowBalance ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[#F4EEE8] border-r border-[#E6E4DF]">
                  <Wallet size={40} className="text-[#C04E2D] mb-3 opacity-80" />
                  <h3 className="text-lg font-bold text-[#332520] font-['Inter'] mb-1">Low Balance</h3>
                  <p className="text-[13px] text-[#827873] font-medium leading-tight">
                    No money! Add money in wallet to get your meal.
                  </p>
                </div>
              ) : dashboard.imageUrl ? (
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
              
              {!isLowBalance && (
                dashboard.deliveryState === "SKIPPED" ? (
                  <div className="absolute top-4 left-4 bg-[#827873] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                    <X size={12} strokeWidth={3} /> Meal Skipped
                  </div>
                ) : dashboard.deliveryState === "DELIVERED" ? (
                  <div className="absolute top-4 left-4 bg-[#C04E2D] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 size={12} /> Meal Delivered
                  </div>
                ) : dashboard.deliveryState === "PENDING_BEFORE_CUTOFF" ? (
                  <div className="absolute top-4 left-4 bg-[#F2994A] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                    <Clock size={12} /> Arriving by 1 PM
                  </div>
                ) : dashboard.deliveryState === "MISSED_CUTOFF" ? (
                  <div className="absolute top-4 left-4 bg-[#827873] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                    <X size={12} strokeWidth={3} /> No Meal Today
                  </div>
                ) : (
                  <div className="absolute top-4 left-4 bg-[#F5B7B1] text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                    <Clock size={12} /> Pending
                  </div>
                )
              )}

            </div>
            
            {/* Content Side */}
            <div className="p-6 md:p-8 flex flex-col justify-center w-full">
              {isLowBalance ? (
                <div className="flex flex-col items-center justify-center text-center h-full text-[#827873]">
                  <h2 className="text-2xl font-bold text-[#332520] font-['Inter'] mb-3">Recharge Required</h2>
                  <p className="text-[15px]">Please add funds to your wallet to view and receive today's meal.</p>
                </div>
              ) : (!dashboard.deliveryAddress || dashboard.deliveryAddress === "No active delivery address") ? (
                <div className="flex flex-col items-center justify-center text-center h-full text-[#827873]">
                  <h2 className="text-2xl font-bold text-[#332520] font-['Inter'] mb-3">Address Required</h2>
                  <p className="text-[15px] mb-4">Please add a delivery address to serve your meal to your place.</p>
                  <button 
                    onClick={() => navigate("/dashboard/profile")}
                    className="bg-[#C04E2D] hover:bg-[#A33F23] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-[#219653] text-[13px] font-semibold mb-2">
                    <CheckCircle2 size={16} /> Cooked freshly today
                  </div>
                  
                  <h2 className="text-2xl md:text-[28px] font-bold text-[#332520] font-['Inter'] mb-3 leading-tight line-clamp-3">
                    {dashboard.todayMenu || "No menu available for today"}
                  </h2>
                  
                  <p className="text-[#827873] text-[15px] leading-relaxed mb-8 line-clamp-3">
                    {dashboard.deliveryState === "SKIPPED"
                      ? "You have skipped your meal for today. The amount remains safely in your wallet." 
                      : dashboard.deliveryState === "PENDING_BEFORE_CUTOFF"
                      ? "Your meal is on the way. Arriving by 1 PM." 
                      : dashboard.deliveryState === "DELIVERED"
                      ? "Your meal has been delivered. Enjoy!" 
                      : dashboard.deliveryState === "MISSED_CUTOFF"
                      ? "You missed today's 1:00 PM cutoff. Your deliveries will start tomorrow."
                      : "Meal delivery is pending."}
                  </p>

                  {dashboard.deliveryState !== "DELIVERED" && (
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
                            : "bg-[#C04E2D] hover:bg-[#A33F23] text-white cursor-pointer active:scale-95"
                        }`}
                      >
                        Track
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* WALLET CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#4F4F4F] font-semibold text-sm mb-4">
                <Wallet size={16} /> Wallet Balance
              </div>
              
              <h2 className="text-[42px] font-bold text-[#332520] font-['Inter'] leading-none mb-3 tracking-tight">
                ₹{dashboard.walletBalance ?? 0}
              </h2>
              
              <div className="inline-flex items-center gap-1.5 bg-[#FCE8E8] text-[#991B1B] px-3 py-1.5 rounded-full text-xs font-semibold">
                <AlertCircle size={12} /> Approx. {dashboard.remainingMeals ?? 0} meal remaining
              </div>
            </div>
          </div>
        </div>

        {/* ================= LOWER SECTION ================= */}
        {/* this lower grid holds secondary information like their persistent delivery address mapping and a miniature ledger of their 3 most recent wallet transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* SUBSCRIPTION CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[18px] font-bold text-[#332520] font-['Inter']">Subscription</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                dashboard.subscriptionStatus === "ACTIVE" 
                  ? "bg-[#D1E7DD] text-[#0F5132]" 
                  : "bg-[#F8D7DA] text-[#842029]"
              }`}>
                <CheckCircle2 size={12} /> {dashboard.subscriptionStatus === "ACTIVE" ? "Active" : "Inactive"}
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 mt-auto">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5 text-[#827873] text-xs font-medium font-['Inter']">
                  <MapPin size={13} /> Today's Delivery Address
                </div>
                {dashboard?.addresses?.length > 0 && dashboard.deliveryState !== "DELIVERED" && dashboard.deliveryState !== "SKIPPED" && (
                  <button 
                    onClick={() => {
                      setSelectedAddressId(dashboard.todayAddressOverride || dashboard.addresses.find(a => a.isDefault)?._id || "");
                      setShowAddressModal(true);
                    }}
                    className="text-[#9A3B14] hover:underline text-[11px] font-bold"
                  >
                    Change
                  </button>
                )}
              </div>
              <p className="text-[#332520] font-semibold text-[15px] font-['Inter'] leading-normal">
                {dashboard.deliveryAddress || "No active delivery address"}
              </p>
              {dashboard?.todayAddressOverride && (
                <p className="text-[#2E7D32] text-xs font-semibold mt-1">
                  (Overridden for today)
                </p>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY CARD */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#332520] font-['Inter']">Recent Activity</h3>
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
                          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#827873]">
                            <Utensils size={16} />
                          </div>
                        )}
                        <div>
                          <p className="text-[#332520] font-semibold text-sm">{label}</p>
                          <p className="text-[#808080] text-xs mt-0.5">{formatActivityTime(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${isCredit ? "text-[#2E7D32]" : "text-[#332520]"}`}>
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

      {/* ADDRESS OVERRIDE MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#F5F5F5] flex justify-between items-center">
              <h3 className="text-[18px] font-bold text-[#332520] font-['Inter']">
                Change Address for Today
              </h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-[#808080] hover:text-[#332520]"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-3">
              <p className="text-sm text-[#827873] mb-2">Select where you want your meal delivered today.</p>
              
              {dashboard?.addresses?.map(addr => (
                <div 
                  key={addr._id}
                  onClick={() => setSelectedAddressId(addr._id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedAddressId === addr._id ? 'border-[#9A3B14] bg-[#FFF8F6]' : 'border-[#EBEBEB] hover:border-[#CCCCCC]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#332520] text-sm">{addr.tag}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr._id ? 'border-[#9A3B14]' : 'border-[#CCCCCC]'}`}>
                      {selectedAddressId === addr._id && <div className="w-2 h-2 rounded-full bg-[#9A3B14]"></div>}
                    </div>
                  </div>
                  <p className="text-xs text-[#827873] line-clamp-1">{addr.address}</p>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-[#FAFAFA] border-t border-[#F5F5F5] flex gap-3">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="flex-1 bg-white border border-[#E0E0E0] text-[#4F4F4F] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (selectedAddressId) {
                    await handleSetAddressOverride({ date: getTodayLocalDateStr(), addressId: selectedAddressId });
                  }
                  setShowAddressModal(false);
                }}
                disabled={!selectedAddressId}
                className="flex-1 bg-[#9A3B14] hover:bg-[#7A2E0F] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;


