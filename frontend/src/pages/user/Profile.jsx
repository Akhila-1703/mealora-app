import React, { useEffect, useState, useRef } from "react";
import { 
  User, Mail, Phone, Map, Leaf, Wallet, Bell, MessageCircle, ChevronRight, LogOut, Pencil 
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAuthStore from "../../store/authStore";
import useUser from "../../hooks/useUser";

const Profile = () => {
  const { updateProfile, logout, loading } = useAuth();
  const { user } = useAuthStore();
  const { dashboard, loadDashboard } = useUser();

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    mobile: user?.mobile || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.profileImageUrl || null);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setForm((prev) => {
          if (!prev.firstName && !prev.lastName) {
            return {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              username: user.username || "",
              mobile: user.mobile || "",
            };
          }
          return prev;
        });
        setPreview((prev) => prev || user.profileImageUrl || null);
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = () => {
    const formData = new FormData();
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("username", form.username);
    formData.append("mobile", form.mobile);
    if (avatarFile) {
      formData.append("profileImageUrl", avatarFile);
    }
    updateProfile(formData);
  };

  const formatJoinDate = (createdAt) => {
    if (!createdAt) return "Oct 2023";
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-12 -mt-6">
      
      {/* HEADER ROW */}
      <div className="w-full px-4 md:px-8 pt-8 pb-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[3px] border-[#E0EFE5] p-1 overflow-hidden relative">
              <img 
                src={preview || "/default-avatar.png"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full bg-[#F5F5F5]"
              />
            </div>
            <div className="absolute bottom-1 right-2 w-8 h-8 bg-[#C04E2D] rounded-full flex items-center justify-center border-2 border-white text-white shadow-sm hover:scale-105 transition-transform">
              <Pencil size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
          </div>
          
          <div className="flex flex-col items-center md:items-start justify-center h-full pt-4 md:pt-6">
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#1A1A1A] font-['Fraunces'] leading-none mb-3 text-center md:text-left">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center gap-2 text-[#C04E2D] font-semibold text-sm">
              <div className="w-5 h-5 rounded-full border border-[#C04E2D] flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              Premium Member since {formatJoinDate(user?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* PERSONAL INFO CARD */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 md:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-[#F5F5F5] pb-4">
              <div className="flex items-center gap-3 text-[#C04E2D]">
                <User size={22} strokeWidth={2.5} />
                <h2 className="text-[22px] font-bold font-['Fraunces']">Personal Information</h2>
              </div>
              <button className="text-[13px] font-bold text-[#666666] hover:text-[#1A1A1A] transition-colors">
                Edit All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Full Name</label>
                <input 
                  value={`${form.firstName} ${form.lastName}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split(" ");
                    setForm({ ...form, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" });
                  }}
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Email Address</label>
                <input 
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#808080] focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Phone Number</label>
                <input 
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Primary Delivery Address</label>
                <input 
                  disabled
                  value={dashboard?.deliveryAddress || "No address set"}
                  className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl pl-4 pr-12 py-3.5 text-[15px] font-medium text-[#808080] truncate focus:outline-none cursor-not-allowed"
                />
                <div className="absolute right-4 top-[38px] text-[#808080]">
                  <Map size={20} />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#F5F5F5] pt-6">
              <button 
                onClick={handleUpdateProfile}
                disabled={loading}
                className="bg-[#C04E2D] hover:bg-[#A64225] text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all active:scale-95 shadow-sm min-w-[160px]"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* SUSTAINABILITY CARD */}
          <div className="bg-[#C04E2D] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-md mt-2">
            <div className="relative z-10">
              <div className="flex items-center gap-2 font-semibold text-lg mb-8 tracking-wide">
                <Leaf size={20} className="fill-white" />
                Sustainability Impact
              </div>
              
              <div className="flex items-start gap-12 md:gap-24 mb-10">
                <div className="flex flex-col gap-1 relative">
                  <span className="text-[44px] md:text-[56px] font-bold font-['Inter'] leading-none">142</span>
                  <span className="text-sm font-medium text-[#F4EEE8]">Single-use plastics saved</span>
                  <div className="absolute right-[-24px] md:right-[-48px] top-4 bottom-0 w-px bg-[#D96544]"></div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[44px] md:text-[56px] font-bold font-['Inter'] leading-none">4.2<span className="text-3xl md:text-4xl">kg</span></span>
                  <span className="text-sm font-medium text-[#F4EEE8]">Carbon footprint reduced</span>
                </div>
              </div>

              <p className="text-[#F4EEE8] italic font-medium">
                "You're in the top 5% of eco-conscious diners this month!"
              </p>
            </div>

            <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.15] pointer-events-none text-white">
              <svg width="250" height="250" viewBox="0 0 200 200" fill="none">
                <path d="M100 20L150 100H120L160 160H40L80 100H50L100 20Z" fill="currentColor"/>
                <path d="M85 160H115V200H85V160Z" fill="currentColor"/>
                <path d="M150 60L190 120H170L200 160H100L130 120H110L150 60Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* STATS CONTAINERS */}
          <div className="bg-[#F6F6F6] rounded-3xl p-4 flex flex-col gap-4 shadow-inner">
            <div className="bg-white rounded-2xl p-5 flex justify-between items-center shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#4F4F4F]">Wallet Balance</span>
                <span className="text-[22px] font-bold text-[#1A1A1A]">₹{dashboard?.walletBalance?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#F4EEE8] flex items-center justify-center text-[#C04E2D]">
                <Wallet size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#4F4F4F]">Active Plan</span>
                <span className="text-[15px] font-bold text-[#C04E2D]">
                  {dashboard?.subscriptionStatus === "ACTIVE" ? "Weekly Flex - Lunch" : "No Active Plan"}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#C04E2D] rounded-full" style={{ width: `${(dashboard?.remainingMeals || 0) / 7 * 100}%` }}></div>
                </div>
                <span className="text-[12px] font-medium text-[#666666]">
                  {dashboard?.remainingMeals || 0}/7 deliveries complete
                </span>
              </div>
            </div>
          </div>

          {/* ACCOUNT SETTINGS */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 shadow-sm">
            <h3 className="text-[12px] font-bold text-[#1A1A1A] tracking-wider uppercase mb-6">Account Settings</h3>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3 text-[#333333]">
                  <Bell size={20} strokeWidth={2} />
                  <span className="text-[15px] font-medium">Push Notifications</span>
                </div>
                <div className="w-11 h-6 bg-[#C04E2D] rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3 text-[#333333]">
                  <Mail size={20} strokeWidth={2} />
                  <span className="text-[15px] font-medium">Email Updates</span>
                </div>
                <div className="w-11 h-6 bg-[#C04E2D] rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3 text-[#333333]">
                  <MessageCircle size={20} strokeWidth={2} />
                  <span className="text-[15px] font-medium">WhatsApp Alerts</span>
                </div>
                <div className="w-11 h-6 bg-[#E0E0E0] rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-5 border-b border-[#F5F5F5] cursor-pointer hover:bg-[#FAFAFA] -mx-2 px-2 rounded-lg transition-colors">
                <span className="text-[15px] font-bold text-[#C04E2D]">Change Password</span>
                <ChevronRight size={20} className="text-[#C04E2D]" />
              </div>

              <div 
                onClick={logout}
                className="flex justify-between items-center py-5 cursor-pointer hover:bg-[#FFF4F4] -mx-2 px-2 rounded-lg transition-colors mt-1"
              >
                <span className="text-[15px] font-bold text-[#D32F2F]">Logout</span>
                <LogOut size={20} className="text-[#D32F2F]" />
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Profile;