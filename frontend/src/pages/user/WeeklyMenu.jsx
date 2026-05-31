import React, { useEffect } from "react";
import { format, isTomorrow, addDays } from "date-fns";
import useMenu from "../../hooks/useMenu";
import useSkip from "../../hooks/useSkip";
import { Check, X, ChevronLeft, ChevronRight, Utensils } from "lucide-react";

import useUser from "../../hooks/useUser";

const WeeklyMenu = () => {
  const { menu = [], fetchMenu } = useMenu();
  const { fetchSkips, addSkip, cancelSkip, skips } = useSkip();
  const { dashboard, loadDashboard } = useUser();



  // mounting the component lifecycle and hydrating initial state from the server
  useEffect(() => {
    fetchMenu();
    fetchSkips();
    if (!dashboard) loadDashboard();
  }, [fetchMenu, fetchSkips, dashboard, loadDashboard]);

  const todayDate = new Date();


  // Today's Day Name
  const todayDay = format(todayDate, "EEEE");
  const todayMenu = menu.find((m) => m.day === todayDay);

  // Generate next 7 days starting from tomorrow
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    return addDays(todayDate, i + 1);
  });

  const handleSkipToggle = async (dateStr, isAlreadySkipped) => {
    try {
      if (isAlreadySkipped) {
        await cancelSkip(dateStr);
      } else {
        await addSkip([dateStr]);
      }

      // refresh view immediately (today badge + cards)
      await fetchSkips();
    } catch (err) {
      console.error("Failed to toggle skip", err);
    }
  };

  // Mock static chef and nutrition info to match visual mockup perfectly
  const getMockNutrition = (index) => {
    const nutritionList = [
      { calories: "650", protein: "22g", carbs: "45g", tag: "North Indian Special" },
      { calories: "480", protein: "18g", carbs: "52g", tag: "Light & Fresh" },
      { calories: "720", protein: "32g", carbs: "60g", tag: "Protein Packed" },
      { calories: "550", protein: "15g", carbs: "48g", tag: "Continental" },
      { calories: "680", protein: "20g", carbs: "50g", tag: "Chef's Special" },
      { calories: "590", protein: "24g", carbs: "42g", tag: "Balanced Choice" },
      { calories: "610", protein: "21g", carbs: "47g", tag: "Artisanal Feast" },
    ];
    return nutritionList[index % nutritionList.length];
  };

  if (!dashboard) {
    return (
      <div className="w-full bg-[#FAF8F5] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C04E2D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if ((dashboard?.walletBalance ?? 0) < 100) {
    return (
      <div className="w-full bg-[#FAF8F5] min-h-screen flex flex-col items-center justify-center p-6 text-center font-['Inter']">
        <div className="bg-white p-8 rounded-2xl border border-[#EBEBEB] shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-[#F4EEE8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C04E2D]">
            <Utensils size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#332520] font-['Inter'] mb-2">Insufficient Balance</h2>
          <p className="text-[#827873] text-sm mb-6 leading-relaxed">
            Please add money to your wallet to view the upcoming weekly menu.
          </p>
          <a 
            href="/dashboard/wallet"
            className="block w-full bg-[#C04E2D] hover:bg-[#A34226] text-white font-semibold py-3 rounded-xl transition-all"
          >
            Add Funds
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen font-['Inter'] flex flex-col items-center">
      <div className="max-w-6xl w-full mx-auto px-6 py-10">

        {/* ================= TODAY'S DELIVERY ================= */}
        <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-6">
          Today's Delivery
        </h1>

        {todayMenu ? (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden flex flex-col md:flex-row shadow-sm mb-12">
            {/* Left Image column */}
            <div className="w-full md:w-[48%] h-64 md:h-auto relative shrink-0 bg-[#F5F5F5]">
              {todayMenu.imageUrl ? (
                <img 
                  src={todayMenu.imageUrl} 
                  alt="Today's Delivery" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#CCCCCC]">
                  No Image
                </div>
              )}

            </div>

            {/* Right Details column */}
            <div className="p-6 md:p-8 flex flex-col justify-between w-full relative">
              
              {/* Delivery Tag */}
              <div className="absolute top-6 right-6">
                {dashboard?.deliveryState === "SKIPPED" ? (
                  <div
                    className="
                      bg-[#827873]
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >
                    Skipped Today
                  </div>
                ) : dashboard?.deliveryState === "DELIVERED" ? (
                  <div
                    className="
                      bg-[#C04E2D] text-white shadow-sm border border-[#C04E2D]
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >
                    Meal Delivered
                  </div>
                ) : dashboard?.deliveryState === "PENDING_BEFORE_CUTOFF" ? (
                  <div
                    className="
                      bg-[#F4D7B8]
                      text-[#D97706]
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >
                    Arriving by 1 PM
                  </div>
                ) : dashboard?.deliveryState === "MISSED_CUTOFF" ? (
                  <div
                    className="
                      bg-[#827873]
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >
                    No Meal Today
                  </div>
                ) : (
                  <div
                    className="
                      bg-[#F5B7B1]
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      font-bold
                      text-sm
                    "
                  >
                    Pending
                  </div>
                )}
              </div>


              <div>
                <h3 className="text-2xl md:text-[28px] font-bold text-[#332520] font-['Inter'] mb-1 pr-32 leading-tight flex items-center gap-2.5">
                  {todayMenu.title || todayMenu.mealName || todayMenu.lunchMenu || "Lunch Delivery"}

                </h3>
                <p className="text-[#808080] text-sm font-semibold mb-4">
                  {todayMenu.specialTag || getMockNutrition(0).tag}
                </p>

                <p className="text-[#827873] text-[15px] leading-relaxed mb-6">
                  {dashboard?.deliveryState === "SKIPPED"
                      ? "You have skipped today's meal. Your wallet balance remains unchanged."
                      : dashboard?.deliveryState === "DELIVERED"
                      ? "Your meal has been delivered. Enjoy!"
                      : dashboard?.deliveryState === "MISSED_CUTOFF"
                      ? "You missed today's 1:00 PM cutoff. Your deliveries will start tomorrow."
                      : dashboard?.deliveryState === "PENDING_BEFORE_CUTOFF"
                      ? "Your meal is on the way. Arriving by 1 PM."
                      : (todayMenu.description ||
                          "A classic, comforting meal featuring fresh, premium ingredients served perfectly alongside aromatic spiced basmati rice. Accompanied by wholesome rotis and a fresh side salad.")}


                </p>

                {todayMenu.items && todayMenu.items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {todayMenu.items.map((item, idx) => (
                      <span key={idx} className="bg-[#FAF8F5] text-[#2B5240] border border-[#EBEBEB] text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Nutrition Row */}
                <div className="grid grid-cols-3 border-t border-b border-[#F2F2F2] py-4 mb-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-[#332520] font-['Inter']">{getMockNutrition(0).calories}</p>
                    <p className="text-xs text-[#808080] font-medium">Calories</p>
                  </div>
                  <div className="border-l border-r border-[#F2F2F2]">
                    <p className="text-xl font-bold text-[#332520] font-['Inter']">{getMockNutrition(0).protein}</p>
                    <p className="text-xs text-[#808080] font-medium">Protein</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#332520] font-['Inter']">{getMockNutrition(0).carbs}</p>
                    <p className="text-xs text-[#808080] font-medium">Carbs</p>
                  </div>
                </div>
              </div>

              {/* Chef highlight box */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 flex items-center gap-4 border border-[#F0F0F0]">
                <img 
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=120"
                  alt="Chef"
                  className="w-10 h-10 rounded-full object-cover border border-[#E0E0E0]"
                />
                <div>
                  <p className="text-xs font-bold text-[#332520]">Today's Chef: Anjali M.</p>
                  <p className="text-xs text-[#808080] italic">"Slow-cooked the gravy today for extra richness. Enjoy!"</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 text-center text-[#808080] mb-12 shadow-sm">
            No active meal scheduled for today.
          </div>
        )}

        {/* ================= NEXT 7 DAYS ================= */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[18px] md:text-[22px] font-bold text-[#332520] tracking-tight font-['Inter']">
              Next 7 Days
            </h2>
            <p className="text-sm text-[#808080]">Plan your upcoming meals</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-lg border border-[#EBEBEB] bg-white flex items-center justify-center text-[#827873] hover:bg-[#F5F5F5] transition-colors shadow-sm">
              <ChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg border border-[#EBEBEB] bg-white flex items-center justify-center text-[#827873] hover:bg-[#F5F5F5] transition-colors shadow-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {next7Days.map((dayDate, index) => {
            const dayName = format(dayDate, "EEEE");
            const dateStr = format(dayDate, "yyyy-MM-dd");
            const menuItem = menu.find((m) => m.day === dayName);
            const isSkipped = skips.some((s) => s.date === dateStr);
            const mockNutrition = getMockNutrition(index + 1);

            if (!menuItem) return null;

            return (
              <div 
                key={index}
                className={`bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden flex flex-col shadow-sm transition-all duration-300 ${
                  isSkipped ? "opacity-60 grayscale" : ""
                }`}
              >
                {/* Image & Date Badge */}
                <div className="w-full h-44 relative bg-[#F5F5F5] shrink-0">
                  {menuItem.imageUrl ? (
                    <img 
                      src={menuItem.imageUrl} 
                      alt={menuItem.title || menuItem.mealName || menuItem.lunchMenu} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#CCCCCC]">
                      No Image
                    </div>
                  )}

                  {/* Date Badge */}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#332520] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
                    {isTomorrow(dayDate) ? "Tomorrow" : format(dayDate, "EEE, MMM dd")}
                  </span>

                  {/* Skipped overlay badge */}
                  {isSkipped && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="bg-white/95 text-[#D32F2F] text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                        Skipped
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-[#332520] font-['Inter'] mb-1 line-clamp-2 leading-tight flex items-center justify-between gap-2">
                      <span>{menuItem.title || menuItem.mealName || menuItem.lunchMenu}</span>

                    </h4>
                    <p className="text-xs text-[#808080] font-semibold mb-2">
                      {menuItem.specialTag || mockNutrition.tag}
                    </p>
                    {menuItem.description && (
                      <p className="text-xs text-[#827873] line-clamp-2 mb-4">
                        {menuItem.description}
                      </p>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-[#F2F2F2] pt-4 mt-4 flex items-center justify-between text-sm">
                    {isSkipped ? (
                      <>
                        <span className="text-[#808080] font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#D32F2F]"></span> Delivery Skipped
                        </span>
                        <button 
                          onClick={() => handleSkipToggle(dateStr, true)}
                          className="text-[#C04E2D] hover:underline font-bold"
                        >
                          Restore
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[#C04E2D] font-semibold flex items-center gap-1">
                          <Check size={16} /> Confirmed
                        </span>
                        <button 
                          onClick={() => handleSkipToggle(dateStr, false)}
                          className="text-[#C04E2D] hover:underline font-semibold"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default WeeklyMenu;

