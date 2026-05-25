import React, { useEffect, useState } from "react";
import useSubscription from "../../hooks/useSubscription";

import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { ClipboardCheck, Utensils, PauseCircle, PlayCircle, MapPin, AlertTriangle, Leaf, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  heading,
  subText,
  card,
  input,
  primaryBtn,
  outlineBtn,
  successBadge,
  dangerBadge,
} from "../../styles/common";

function Subscription() {
  const navigate = useNavigate();

  const {
    subscription,
    loading,
    fetchSubscription,
    handleCreateSubscription,
    handleUpdateSubscription,
    handleStatusChange,
  } = useSubscription();

  const [form, setForm] = useState({
    address: subscription?.address || "",
    city: subscription?.city || "",
    pincode: subscription?.pincode || "",
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (subscription) {
      queueMicrotask(() => {
        setForm((prev) => {
          // Only update if current form is "empty"
          if (!prev.address && !prev.city) {
            return {
              address: subscription.address || "",
              city: subscription.city || "",
              pincode: subscription.pincode || "",
            };
          }
          return prev;
        });
      });
    }
  }, [subscription]);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {

    await handleUpdateSubscription(form);

    setEditing(false);
  };

  if (loading && !subscription) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>

        <h1 className={heading}>
          Subscription
        </h1>

        <p className={subText}>
          Manage your meal plan and delivery details
        </p>

      </div>

      {!subscription ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT: CREATE FORM */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="text-[#114232] flex items-center justify-center">
                <ClipboardCheck size={28} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] font-['Fraunces']">
                Create Your Subscription
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">
                  Delivery Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  placeholder="Enter your full street address, building number, and landmarks..."
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333] placeholder-[#A0A0A0] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">
                    City
                  </label>
                  <input
                    name="city"
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333] placeholder-[#A0A0A0] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">
                    Pincode
                  </label>
                  <input
                    name="pincode"
                    type="text"
                    placeholder="6-digit PIN"
                    value={form.pincode}
                    onChange={handleChange}
                    className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333] placeholder-[#A0A0A0] transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => handleCreateSubscription(form)}
                disabled={loading}
                className="w-full bg-[#114232] hover:bg-[#0D3326] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm active:scale-[0.98] shadow-sm flex items-center justify-center mt-4 cursor-pointer"
              >
                {loading ? "Processing..." : "Start Subscription"}
              </button>
            </div>
          </div>

          {/* RIGHT: DEFAULT PLAN DETAILS */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 shadow-sm flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] font-['Fraunces'] border-b border-[#F5F5F5] pb-4">
              Default Plan Details
            </h2>

            <div className="flex flex-col">
              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <span className="text-sm font-medium text-[#666666]">Plan Type</span>
                <span className="text-sm font-bold text-[#1A1A1A]">REGULAR (Lunch Only)</span>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <span className="text-sm font-medium text-[#666666]">Rate</span>
                <span className="text-sm font-bold text-[#1A1A1A]">₹100 per meal</span>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-sm font-medium text-[#666666]">Status</span>
                <span className="bg-[#D1E7DD] text-[#0F5132] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>
            </div>

            <p className="text-xs text-[#808080] italic leading-relaxed mt-6 border-t border-[#F5F5F5] pt-4">
              * This is our standard office-delivery plan. You can customize meal preferences after starting.
            </p>
          </div>
        </div>
      ) : (

        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* PLAN DETAILS CARD */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32]">
                      <Utensils size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Fraunces']">
                        Lunch Only
                      </h2>
                      <p className="text-sm text-[#808080] mt-1 tracking-wider uppercase">
                        DBF - {subscription._id?.slice(0, 6)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                    subscription.status === "ACTIVE" 
                      ? "bg-[#2E7D32] text-white shadow-sm" 
                      : "bg-[#F5F5F5] text-[#808080]"
                  }`}>
                    {subscription.status}
                  </div>
                </div>

                <div className="w-full h-px bg-[#F5F5F5] my-6"></div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#808080] uppercase tracking-widest">Rate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[#1A1A1A]">₹{subscription.mealPrice}</span>
                      <span className="text-xs font-medium text-[#666666]">/meal</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#808080] uppercase tracking-widest">Started On</span>
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 justify-end">
                    <span className="text-[10px] font-bold text-[#808080] uppercase tracking-widest mb-1">Lifecycle</span>
                    {subscription.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleStatusChange({ status: "PAUSED" })}
                        disabled={loading}
                        className="bg-[#9A4600] hover:bg-[#7A3700] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm w-full"
                      >
                        <PauseCircle size={16} />
                        Pause Subscription
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange({ status: "ACTIVE" })}
                        disabled={loading}
                        className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm w-full"
                      >
                        <PlayCircle size={16} />
                        Resume Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* DELIVERY ADDRESS CARD */}
              <div className="bg-white rounded-2xl border border-[#EBEBEB] p-8 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-[#1A1A1A] font-['Fraunces']">
                    Delivery Address
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#4F4F4F]">Edit Address</span>
                    <div 
                      onClick={() => setEditing(!editing)}
                      className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 ${editing ? 'bg-[#114232]' : 'bg-[#E0E0E0]'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${editing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                </div>

                {!editing ? (
                  <>
                    <div className="bg-[#F5F5F5] rounded-xl p-4 flex items-center gap-3">
                      <div className="text-[#666666]">
                        <MapPin size={20} />
                      </div>
                      <p className="text-[#333333] font-medium text-[15px]">
                        {subscription.address}, {subscription.city} {subscription.pincode}
                      </p>
                    </div>

                    <div className="bg-[#FFF4F4] border border-[#FFE0E0] rounded-xl p-4 flex gap-3 text-[#D32F2F]">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-medium leading-relaxed">
                        <span className="font-bold">Note:</span> Address updates are blocked 3 hours prior to tomorrow's delivery (Cutoff: 10:00 AM)
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 bg-[#F9F9F9] p-6 rounded-xl border border-[#EEEEEE]">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">Street Address</label>
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">City</label>
                        <input
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-bold text-[#4F4F4F] tracking-wide">Pincode</label>
                        <input
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#114232] text-[#333333]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#114232] hover:bg-[#0D3326] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm"
                      >
                        {loading ? "Saving..." : "Save Address"}
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-white border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#4F4F4F] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* MEAL CALENDAR CARD */}
              <div className="bg-[#F4F9F6] rounded-2xl border border-[#E0EFE5] p-8 shadow-sm flex flex-col">
                <h2 className="text-xl font-bold text-[#114232] font-['Fraunces'] mb-4 flex items-center gap-2">
                  Meal Calendar
                </h2>
                
                <p className="text-sm text-[#4F4F4F] leading-relaxed mb-6">
                  Your dabba is scheduled for delivery every weekday between <span className="font-bold text-[#1A1A1A]">12:45 PM</span> and <span className="font-bold text-[#1A1A1A]">1:15 PM</span>.
                </p>

                <button 
                  onClick={() => navigate("/dashboard/skip")}
                  className="w-full bg-transparent border border-[#2E7D32] hover:bg-[#2E7D32] hover:text-white text-[#2E7D32] font-semibold py-3 rounded-xl transition-all duration-300 text-sm"
                >
                  View Delivery History
                </button>
              </div>

              {/* BADGES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#EEEEEE] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-24">
                  <Leaf size={20} className="text-[#114232]" />
                  <span className="text-xs font-bold text-[#1A1A1A]">Eco-Packaging</span>
                </div>
                <div className="bg-[#EEEEEE] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-24">
                  <ShieldCheck size={20} className="text-[#114232]" />
                  <span className="text-xs font-bold text-[#1A1A1A]">Hygiene Certified</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {!loading && subscription === null && (
        <EmptyState message="Subscription data not available" />
      )}

    </div>
  );
}

export default Subscription;