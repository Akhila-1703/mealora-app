import React, { useEffect, useState } from "react";
import useSkip from "../../hooks/useSkip";
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, format, isSameMonth, isBefore, 
  isToday, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, X } from "lucide-react";
import Loader from "../../components/common/Loader";

import useUser from "../../hooks/useUser";

const SkipMeal = () => {
  const { skips, todayStatus, fetchSkips, addSkip, cancelSkip, loading } = useSkip();
  const { dashboard, loading: dashboardLoading, loadDashboard } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchSkips();
    if (!dashboard) loadDashboard();
  }, [fetchSkips, dashboard, loadDashboard]);

  const currentHour = new Date().getHours();
  // Cutoff for skipping is 11 AM based on backend
  const isSkipCutoffPassed = currentHour >= 11;
  // Visual shading rule: daily after 1 pm the today should be marked as shaded
  const isVisualShadedCutoffPassed = currentHour >= 13;

  const today = new Date();
  
  const startOfTodayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Date-fns calendar generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = async (day) => {
    const isPastDay = isBefore(day, startOfTodayDay);
    const isTodayDay = isToday(day);
    
    // Cannot interact with past days
    if (isPastDay) return;
    
    // Cannot interact with today if skip cutoff is passed
    if (isTodayDay && isSkipCutoffPassed) return;

    const formattedDate = format(day, "yyyy-MM-dd");
    const isSkipped = skips.some(s => s.date === formattedDate);

    if (isSkipped) {
      await cancelSkip(formattedDate);
    } else {
      await addSkip([formattedDate]);
    }
  };

  const handleTodayToggle = async () => {
    if (isSkipCutoffPassed && !todayStatus?.isSkipped) return;

    try {
      if (todayStatus?.isSkipped) {
        await cancelSkip(todayStatus.date);
      } else {
        await addSkip([todayStatus.date]);
      }

      // Ensure UI updates immediately after toggle/cancel
      await fetchSkips();
    } catch (err) {
      console.error("Failed to toggle today skip", err);
    }
  };

  // Calculate current month's skips for the sidebar
  const currentMonthSkips = skips.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  }).length;

  if ((loading && skips.length === 0) || dashboardLoading || !dashboard) return <Loader />;

  if ((dashboard.walletBalance ?? 0) < 100) {
    return (
      <div className="w-full bg-[#FAF8F5] min-h-screen flex flex-col items-center justify-center p-6 text-center font-['Inter']">
        <div className="bg-white p-8 rounded-2xl border border-[#EBEBEB] shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-[#F4EEE8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C04E2D]">
            <CalendarIcon size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#332520] font-['Inter'] mb-2">Insufficient Balance</h2>
          <p className="text-[#827873] text-sm mb-6 leading-relaxed">
            Please add money to your wallet to view and manage your meal calendar.
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
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-2">
              Manage Deliveries
            </h1>
            <p className="text-[#827873] text-[15px]">
              Plan your week. Skip days you don't need a meal. Cutoff is 11:00 AM for same-day changes.
            </p>
          </div>
          
          {/* MONTH SELECTOR */}
          <div className="flex items-center gap-4 bg-white border border-[#EBEBEB] rounded-full px-4 py-2.5 shadow-sm">
            <button onClick={prevMonth} className="text-[#827873] hover:text-[#332520] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-[#332520] min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button onClick={nextMonth} className="text-[#827873] hover:text-[#332520] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* ================= TODAY BANNER ================= */}
        <div className="w-full bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F4EEE8]"></div>
          <div className="pl-4">
            <h3 className="text-lg font-bold text-[#332520] mb-1 font-['Inter']">Today's Status</h3>
            <p className="text-[#808080] text-xs font-bold uppercase tracking-widest mb-3">
              {format(today, "EEE, dd MMM, yyyy")}
            </p>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${todayStatus?.isSkipped ? 'bg-red-100 text-red-700' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                {todayStatus?.isSkipped ? "SKIPPED" : "ACTIVE"}
              </span>
              {isSkipCutoffPassed && !todayStatus?.isSkipped && (
                <span className="text-[#D32F2F] text-sm font-semibold">
                  You cannot skip today's meal after 11:00 AM
                </span>
              )}
            </div>
          </div>
          
          <button 
            disabled={loading || (isSkipCutoffPassed && !todayStatus?.isSkipped)}
            onClick={handleTodayToggle}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              isSkipCutoffPassed && !todayStatus?.isSkipped
                ? "bg-[#E6B3A6] text-white opacity-80 cursor-not-allowed" // Muted red/brown
                : todayStatus?.isSkipped
                ? "bg-[#FAF8F5] text-[#332520] border border-[#E6E4DF] hover:bg-[#F4EEE8]"
                : "bg-[#C04E2D] text-white hover:bg-[#A34226] shadow-sm"
            }`}
          >
            {todayStatus?.isSkipped ? "Cancel Skip" : isSkipCutoffPassed ? "Cutoff Passed" : "Skip Today"}
          </button>
        </div>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
            {/* Skips This Month */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4EEE8] rounded-bl-[100px] -z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-[#C04E2D] font-bold mb-4">
                  <CalendarIcon size={20} /> Skips This Month
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-[40px] font-black text-[#332520] font-['Inter'] leading-none">
                    {currentMonthSkips}
                  </span>
                </div>
                <p className="text-[#808080] text-xs leading-relaxed">
                  Skipped meals are credited to your MealOra Wallet automatically.
                </p>
              </div>
            </div>

            {/* Status Legend */}
            <div className="bg-[#FCFBF9] rounded-2xl border border-[#EBEBEB] p-6 shadow-sm">
              <h4 className="text-xs font-bold tracking-widest uppercase text-[#332520] mb-4 font-['Inter']">Status Legend</h4>
              <div className="flex flex-col gap-3 text-sm text-[#4F4F4F] font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#EBEBEB] border border-[#D1D1D1]"></div>
                  Shaded Region (Past)
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-white border border-[#D1D1D1]"></div>
                  Bright Region (Upcoming)
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#C04E2D] text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  Delivered
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#F2994A] text-white flex items-center justify-center">
                    <X size={12} strokeWidth={3} />
                  </div>
                  Skipped
                </div>
              </div>
            </div>
          </div>

          {/* CALENDAR GRID */}
          <div className="flex-1 bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden shadow-sm flex flex-col">
            {/* Days of week */}
            <div className="grid grid-cols-7 border-b border-[#EBEBEB] bg-[#FAFAFA]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-bold text-[#808080] uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Cells */}
            <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[120px]">
              {calendarDays.map((day, idx) => {
                const isPastDay = isBefore(day, startOfTodayDay);
                const isTodayDay = isToday(day);
                const isShaded = isPastDay || (isTodayDay && isVisualShadedCutoffPassed);
                const formattedDate = format(day, "yyyy-MM-dd");
                const isSkipped = skips.some(s => s.date === formattedDate);
                
                const userStartDate = new Date(dashboard.subscriptionStartDate || new Date());
                userStartDate.setHours(0, 0, 0, 0);
                const isBeforeSubscription = isBefore(day, userStartDate);
                
                const isDelivered = dashboard?.servedMealsDates?.includes(formattedDate) || false;
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                const isInteractive = !isPastDay && !(isTodayDay && isSkipCutoffPassed);

                return (
                  <div 
                    key={idx}
                    onClick={() => isInteractive && handleDayClick(day)}
                    className={`
                      border-b border-r border-[#EBEBEB] relative p-2 transition-colors duration-200
                      ${isShaded ? 'bg-[#FAFAFA]' : 'bg-white'}
                      ${isTodayDay ? 'ring-2 ring-inset ring-[#C04E2D] bg-[#FFF5F0]' : ''}
                      ${isInteractive ? 'cursor-pointer hover:bg-[#F8F8F8]' : 'cursor-default'}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                    `}
                  >
                    <span className={`absolute top-2 right-2 text-sm font-semibold ${isTodayDay ? 'text-[#C04E2D]' : 'text-[#4F4F4F]'}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Icons */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center w-full">
                      {isSkipped && (
                        <div className="w-6 h-6 rounded-full bg-[#F2994A] text-white flex items-center justify-center shadow-sm transform transition-transform hover:scale-110">
                          <X size={14} strokeWidth={3} />
                        </div>
                      )}
                      {isDelivered && (
                        <div className="w-6 h-6 rounded-full bg-[#C04E2D] text-white flex items-center justify-center shadow-sm">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SkipMeal;

