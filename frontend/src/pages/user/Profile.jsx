import React, { useEffect, useState, useRef } from "react";
import { 
  User, Mail, Phone, Map, Leaf, Wallet, Bell, MessageCircle, ChevronRight, LogOut, Pencil 
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useAuthStore from "../../store/authStore";
import useUser from "../../hooks/useUser";
import useMenu from "../../hooks/useMenu";
import useSubscription from "../../hooks/useSubscription";

const Profile = () => {
  const { updateProfile, changePassword, logout, loading } = useAuth();
  const { user } = useAuthStore();
  const { dashboard, loadDashboard } = useUser();
  const { weeklyMenu, fetchWeeklyMenu } = useMenu();
  const { handleUpdateSubscription, handleCreateSubscription } = useSubscription();

  const fileInputRef = useRef(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  
  const [isEditing, setIsEditing] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(user?.emailUpdates ?? true);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: "",
    address: "",
    city: "Hyderabad", // Default or user input
    pincode: "",
    isDefault: false
  });

  const {
    handleAddAddress,
    handleEditAddress,
    handleDeleteAddress
  } = useUser();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    mobile: user?.mobile || "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.profileImageUrl || null);

  // mounting the component lifecycle and hydrating initial state from the server
  useEffect(() => {
    loadDashboard();
    fetchWeeklyMenu();
  }, [loadDashboard, fetchWeeklyMenu]);

  // mounting the component lifecycle and hydrating initial state from the server
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
        setEmailUpdates(user.emailUpdates ?? true);
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
            <h1 className="text-[24px] md:text-[32px] font-bold tracking-tight text-[#332520] leading-[1.1] font-['Inter'] mb-3 text-center md:text-left">
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
                <h2 className="text-[22px] font-bold font-['Inter']">Personal Information</h2>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-[13px] font-bold text-[#827873] hover:text-[#332520] transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Details"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Full Name</label>
                <input 
                  disabled={!isEditing}
                  value={`${form.firstName} ${form.lastName}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split(" ");
                    setForm({ ...form, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" });
                  }}
                  className={`w-full border rounded-xl px-4 py-3.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#C04E2D] ${!isEditing ? "bg-[#FAFAFA] border-[#E0E0E0] text-[#808080] cursor-not-allowed" : "bg-white border-[#C04E2D] text-[#332520]"}`}
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
                  disabled={!isEditing}
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className={`w-full border rounded-xl px-4 py-3.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#C04E2D] ${!isEditing ? "bg-[#FAFAFA] border-[#E0E0E0] text-[#808080] cursor-not-allowed" : "bg-white border-[#C04E2D] text-[#332520]"}`}
                />
              </div>
              </div>

            {isEditing && (
              <div className="flex justify-end border-t border-[#F5F5F5] pt-6">
                <button 
                  onClick={async () => {
                    handleUpdateProfile();
                    setIsEditing(false);
                  }}
                  disabled={loading}
                  className="bg-[#C04E2D] hover:bg-[#A64225] text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all active:scale-95 shadow-sm min-w-[160px]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* SAVED ADDRESSES CARD */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 md:p-8 shadow-sm mt-2">
            <div className="flex justify-between items-center mb-6 border-b border-[#F5F5F5] pb-4">
              <div className="flex items-center gap-3 text-[#C04E2D]">
                <Map size={22} strokeWidth={2.5} />
                <h2 className="text-[22px] font-bold font-['Inter']">Saved Addresses</h2>
              </div>
              <button 
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({ tag: "", address: "", city: "", pincode: "", isDefault: false });
                  setShowAddressModal(true);
                }}
                className="text-[13px] font-bold text-[#C04E2D] hover:text-[#A64225] transition-colors bg-[#FCE8E8] px-4 py-2 rounded-lg"
              >
                + Add New
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard?.addresses?.map((addr) => (
                <div key={addr._id} className={`p-5 rounded-2xl border ${addr.isDefault ? 'border-[#C04E2D] bg-[#FFF8F6]' : 'border-[#F5F5F5] bg-[#FAFAFA]'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#332520]">{addr.tag}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-white bg-[#C04E2D] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingAddress(addr._id);
                          setAddressForm({
                            tag: addr.tag,
                            address: addr.address,
                            city: addr.city,
                            pincode: addr.pincode,
                            isDefault: addr.isDefault
                          });
                          setShowAddressModal(true);
                        }}
                        className="text-[#827873] hover:text-[#C04E2D]"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#4F4F4F] leading-relaxed mb-3">
                    {addr.address}<br />
                    {addr.city}, {addr.pincode}
                  </p>
                  
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleEditAddress(addr._id, { isDefault: true })}
                      className="text-xs font-semibold text-[#C04E2D] hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
              
              {(!dashboard?.addresses || dashboard.addresses.length === 0) && (
                <div className="col-span-1 md:col-span-2 text-center py-8 bg-[#FAFAFA] rounded-2xl border border-[#F5F5F5]">
                  <Map size={32} className="mx-auto text-[#CCCCCC] mb-3" />
                  <p className="text-[#808080] font-medium">No saved addresses found.</p>
                  <p className="text-sm text-[#A0A0A0] mt-1">Add an address to receive your meals.</p>
                </div>
              )}
            </div>
          </div>

          {/* RECENT MEALS CARD */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 md:p-8 shadow-sm mt-2">
            <div className="flex justify-between items-center mb-6 border-b border-[#F5F5F5] pb-4">
              <div className="flex items-center gap-3 text-[#C04E2D]">
                <Leaf size={22} strokeWidth={2.5} />
                <h2 className="text-[22px] font-bold font-['Inter']">Recent Meals</h2>
              </div>
              <div className="text-[13px] font-bold text-[#827873]">
                Total Served: <span className="text-[#332520]">{dashboard?.servedMealsCount || 0}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              {dashboard?.recentServedMeals?.map((menu, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-[#F5F5F5] bg-[#FAFAFA]">
                  <div>
                    <h3 className="font-bold text-[#332520]">{menu.day}</h3>
                    <p className="text-sm text-[#827873]">{menu.mealName}</p>
                    <p className="text-xs text-[#808080] mt-1">{new Date(menu.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-[10px] font-bold text-[#C04E2D] bg-[#FCE8E8] px-3 py-1 rounded-full uppercase tracking-wider">
                    Served
                  </div>
                </div>
              ))}
              {(!dashboard?.recentServedMeals || dashboard.recentServedMeals.length === 0) && (
                <p className="text-[#808080] italic text-sm">No recent meals found.</p>
              )}
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
                <span className="text-[22px] font-bold text-[#332520]">₹{dashboard?.walletBalance?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#F4EEE8] flex items-center justify-center text-[#C04E2D]">
                <Wallet size={20} />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#4F4F4F]">Active Plan</span>
                <span className="text-[15px] font-bold text-[#C04E2D]">
                  Pay-Per-Meal
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[#827873]">
                  Your meals are automatically deducted from your wallet balance.
                </span>
              </div>
            </div>
          </div>

          {/* ACCOUNT SETTINGS */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 shadow-sm">
            <h3 className="text-[12px] font-bold text-[#332520] tracking-wider uppercase mb-6">Account Settings</h3>
            
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-4 border-b border-[#F5F5F5]">
                <div className="flex items-center gap-3 text-[#332520]">
                  <Mail size={20} strokeWidth={2} />
                  <span className="text-[15px] font-medium">Email Updates</span>
                </div>
                <div 
                  onClick={() => {
                    const newValue = !emailUpdates;
                    setEmailUpdates(newValue);
                    const formData = new FormData();
                    formData.append("emailUpdates", newValue);
                    updateProfile(formData);
                  }}
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${emailUpdates ? 'bg-[#C04E2D]' : 'bg-[#E0E0E0]'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${emailUpdates ? 'right-[2px]' : 'left-[2px]'}`}></div>
                </div>
              </div>

              <div 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex justify-between items-center py-5 border-b border-[#F5F5F5] cursor-pointer hover:bg-[#FAFAFA] -mx-2 px-2 rounded-lg transition-colors"
              >
                <span className="text-[15px] font-bold text-[#C04E2D]">Change Password</span>
                <ChevronRight size={20} className={`text-[#C04E2D] transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
              </div>

              {showPasswordForm && (
                <div className="flex flex-col gap-3 py-4 border-b border-[#F5F5F5] animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-2.5 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                  <button 
                    onClick={() => {
                      if (!passwordForm.oldPassword || !passwordForm.newPassword) return;
                      changePassword(passwordForm);
                      setPasswordForm({ oldPassword: "", newPassword: "" });
                      setShowPasswordForm(false);
                    }}
                    disabled={loading || !passwordForm.oldPassword || !passwordForm.newPassword}
                    className="bg-[#C04E2D] hover:bg-[#A64225] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 mt-2"
                  >
                    Update Password
                  </button>
                </div>
              )}

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

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#F5F5F5] flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#332520] font-['Inter']">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-[#808080] hover:text-[#332520]"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Label (e.g., Home, Office)</label>
                <input 
                  value={addressForm.tag}
                  onChange={e => setAddressForm({...addressForm, tag: e.target.value})}
                  placeholder="e.g. Home"
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#4F4F4F]">Complete Address</label>
                <textarea 
                  rows={3}
                  value={addressForm.address}
                  onChange={e => setAddressForm({...addressForm, address: e.target.value})}
                  placeholder="Street, Building, Landmark"
                  className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#4F4F4F]">City</label>
                  <input 
                    value={addressForm.city}
                    onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                    placeholder="City"
                    className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-[#4F4F4F]">Pincode</label>
                  <input 
                    value={addressForm.pincode}
                    onChange={e => setAddressForm({...addressForm, pincode: e.target.value})}
                    placeholder="Pincode"
                    className="w-full border border-[#E0E0E0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-4 h-4 text-[#C04E2D] focus:ring-[#C04E2D] border-[#E0E0E0] rounded"
                />
                <span className="text-sm font-medium text-[#4F4F4F]">Set as Default Delivery Address</span>
              </label>
            </div>
            
            <div className="p-6 bg-[#FAFAFA] border-t border-[#F5F5F5] flex justify-between gap-3">
              {editingAddress ? (
                <button 
                  onClick={async () => {
                    await handleDeleteAddress(editingAddress);
                    setShowAddressModal(false);
                  }}
                  className="text-[#D32F2F] font-bold text-sm hover:underline px-2"
                >
                  Delete Address
                </button>
              ) : <div></div>}
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddressModal(false)}
                  className="bg-white border border-[#E0E0E0] text-[#4F4F4F] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (editingAddress) {
                      await handleEditAddress(editingAddress, addressForm);
                    } else {
                      await handleAddAddress(addressForm);
                    }
                    setShowAddressModal(false);
                  }}
                  disabled={!addressForm.tag || !addressForm.address}
                  className="bg-[#C04E2D] hover:bg-[#A64225] text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;

