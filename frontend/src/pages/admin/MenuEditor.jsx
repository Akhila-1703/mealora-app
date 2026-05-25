import React, { useEffect, useState } from "react";
import {
  getWeeklyMenu,
  addMenu,
  updateMenu,
  uploadMenuImage,
} from "../../api/menuApi";
import {
  Plus,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { handleApi, safePayload } from "../../utils/helpers";

const MenuEditor = () => {
  const [menus, setMenus] = useState([]);
  const [, setLoading] = useState(false);
  

  // Active state selection
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weekOffset, setWeekOffset] = useState(0);

  // Get dynamic dates for the week
  const getWeekDates = (offset) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(today.setDate(diff));

    return daysOfWeek.map((day, idx) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + idx);
      return {
        name: day,
        shortName: day.substring(0, 3).toUpperCase(),
        dayNum: date.getDate(),
        monthYear: date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      };
    });
  };

  const weekDates = getWeekDates(weekOffset);
  const currentMonthYear = weekDates.find(d => d.name === selectedDay)?.monthYear || weekDates[0].monthYear;


  // Day-wise local public fallbacks
  const mealImages = {
    Monday: "/mon.png",
    Tuesday: "/tue.png",
    Wednesday: "/wed.png",
    Thursday: "/thu.png",
    Friday: "/fri.png",
    Saturday: "/sat.png",
    Sunday: "/sun.png"
  };

 

  // ================= FETCH =================
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await getWeeklyMenu();
      setMenus(safePayload(res) || []);
    } catch (err) {
      console.error("Fetch menu error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Find the menu object for the selected day
const currentMenuObj = menus.find(
  (m) => m?.day?.toLowerCase() === selectedDay.toLowerCase()
);
  
  const [uploading, setUploading] = useState(false);

  // Meal configurations states
  const [titleInput, setTitleInput] = useState("");
  const [lunchMenuInput, setLunchMenuInput] = useState("");
  

  // Split lunch menu string to render individual cards
  const lunchDishes = lunchMenuInput 
    ? lunchMenuInput.split(",").map(d => d.trim()).filter(Boolean) 
    : [];

  useEffect(() => {
    if (currentMenuObj) {
      setTitleInput(currentMenuObj?.title || "");

setLunchMenuInput(
currentMenuObj?.lunchMenu ||
currentMenuObj?.items?.join(", ") ||
""
);
    } else {
      setTitleInput("");
      setLunchMenuInput("");
    }
  }, [selectedDay, menus]);

const handleSaveSettings = async () => {
  

    if (!titleInput.trim()) {
      alert("Title required");
      return;
    }

    if (!lunchMenuInput.trim()) {
      alert("Add at least one menu item");
      return;
  }
  try {
    setLoading(true);

    if (currentMenuObj) {

await handleApi(
() =>
updateMenu(currentMenuObj.day,{
title:titleInput,
lunchMenu:lunchMenuInput
}),
"Menu updated successfully"
);

}

else {

await handleApi(
() =>
addMenu({
day:selectedDay,
title:titleInput,
lunchMenu:lunchMenuInput
}),
"Menu created successfully"
);

}
      await fetchMenus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await uploadMenuImage(formData);
const uploadData = res?.payload || res?.data || {};

const imageUrl = uploadData.imageUrl;
const imagePublicId = uploadData.imagePublicId;

if (!imageUrl) {
  throw new Error("Cloudinary upload failed");
}

      if (currentMenuObj) {
        await handleApi(
          () => updateMenu(currentMenuObj.day, {
            title: titleInput || currentMenuObj.title || "Standard Lunch",
            lunchMenu: lunchMenuInput || currentMenuObj.lunchMenu || "Standard Lunch",
            imageUrl,
            imagePublicId
          }),
          "Menu image uploaded successfully"
        );
      } else {
        await handleApi(
          () => addMenu({
            day: selectedDay,
            title: titleInput || "Standard Lunch",
            lunchMenu: lunchMenuInput || "Standard Lunch",
            imageUrl,
            imagePublicId
          }),
          "Menu created with image"
        );
      }
      await fetchMenus();
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const addDishToLunch = (title) => {
    if (lunchDishes.includes(title)) return;
    const updated = [...lunchDishes, title].join(", ");
    setLunchMenuInput(updated);
  };

  const removeDishFromLunch = (indexToRemove) => {
    const filtered = lunchDishes.filter((_, idx) => idx !== indexToRemove).join(", ");
    setLunchMenuInput(filtered);
  };


  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-16 -mt-6">
      
      {/* TOP MENU EDITOR HEADER */}
      <div className="w-full px-4 md:px-8 pt-8 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto border-b border-[#EBEBEB]">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <h1 className="text-[26px] font-bold text-[#1A1A1A] font-['Fraunces'] leading-none">
            Menu Planner
          </h1>

        </div>

        <button 
          onClick={fetchMenus}
          className="bg-[#2B5240] hover:bg-[#1A3D2F] text-white px-6 py-2.5 rounded-full font-semibold text-[13px] flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto"
        >
          <Sparkles size={16} />
          Publish Changes
        </button>
      </div>

      {/* SPLIT LAYOUT WRAPPER */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-8">
        
        {/* LEFT COLUMN: DAILY PLANNER */}
        <div className="w-full flex flex-col gap-6">
          
          {/* DAY PICKER BAR */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-4 flex items-center justify-between shadow-sm overflow-x-auto gap-4">
            <div className="flex items-center gap-2.5">
              {weekDates.map((item) => {
                const isSelected = item.name === selectedDay;

                return (
                  <button
                    key={item.name}
                    onClick={() => setSelectedDay(item.name)}
                    className={`flex flex-col items-center justify-center w-[54px] py-3 rounded-xl transition-all ${
                      isSelected 
                        ? 'bg-[#E08D60] text-white shadow-sm font-bold' 
                        : 'bg-[#FAFAFA] hover:bg-[#F0F0F0] text-[#333333] border border-transparent'
                    }`}
                  >
                    <span className="text-[10px] tracking-wider uppercase mb-1 opacity-80">{item.shortName}</span>
                    <span className="text-[17px] font-bold leading-none">{item.dayNum}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-l border-[#F5F5F5] pl-4 whitespace-nowrap">
              <span className="text-[14px] font-bold text-[#1A1A1A]">{currentMonthYear}</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-1.5 hover:bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] text-[#666666]"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-1.5 hover:bg-[#FAFAFA] rounded-lg border border-[#E0E0E0] text-[#666666]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DAILY LUNCH MENU SECTION */}
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 shadow-sm flex flex-col gap-6">
            
            {/* LUNCH IMAGE HEADER CARD */}
            <div className="relative h-[320px] rounded-2xl overflow-hidden shadow-sm">
              <img 
                src={currentMenuObj?.imageUrl || mealImages[selectedDay] || "/mon.png"} 
                alt="Lunch Menu" 
                className="w-full h-full object-cover brightness-[0.65]" 
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                <span className="bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold w-fit uppercase tracking-widest">
                  {selectedDay}'s Menu
                </span>
                <div className="flex flex-col">
                  <h3 className="text-[26px] font-bold font-['Fraunces'] leading-tight">
                    {currentMenuObj?.title || "Standard Lunch Box"}
                  </h3>
                  <p className="text-white/80 text-xs mt-1">
                    Manage the core ingredients & dishes included in this dabba.
                  </p>
                </div>
              </div>
            </div>

            {/* DYNAMIC IMAGE UPLOADER */}
            <div className="flex flex-col gap-2 border-b border-[#F5F5F5] pb-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#666666]">
                Menu Image
              </label>
              
              {uploading ? (
                // Uploading loading state
                <div className="flex flex-col justify-center items-center border-2 border-dashed border-[#E5E5E5] rounded-2xl p-6 bg-[#FAFAFA] h-[120px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C04E2D] mb-2"></div>
                  <span className="text-xs text-[#808080] font-medium">Uploading to Cloudinary...</span>
                </div>
              ) : currentMenuObj?.imageUrl ? (
                // Image already exists -> Show "Replace Menu Image" UI
                <div className="flex items-center justify-between border border-[#EBEBEB] rounded-2xl p-4 bg-[#FAFAFA]">
                  <div className="flex items-center gap-4">
                    <img 
                      src={currentMenuObj.imageUrl} 
                      alt="Current Menu" 
                      className="w-16 h-16 object-cover rounded-xl border border-[#E0E0E0] shadow-sm"
                    />
                    <div>
                      <p className="text-[13px] font-bold text-[#1A1A1A]">Custom Image Active</p>
                      <p className="text-[11px] text-[#808080]">Uploaded to Cloudinary</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="bg-white hover:bg-[#FFF5F0] border border-[#E0E0E0] hover:border-[#C04E2D] hover:text-[#C04E2D] text-[#666666] font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2">
                      <Upload size={14} className="stroke-[2]" />
                      Replace Menu Image
                    </button>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                // Image does not exist -> Show standard full-width dashed box
                <div className="flex flex-col justify-center items-center border-2 border-dashed border-[#E5E5E5] hover:border-[#C04E2D] rounded-2xl p-6 bg-[#FAFAFA] hover:bg-[#FFF5F0] transition-all cursor-pointer relative h-[120px] group">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-[#666666] group-hover:text-[#C04E2D] transition-colors">
                    <Upload className="h-8 w-8 stroke-[1.5]" />
                    <div className="text-center">
                      <p className="text-[13px] font-bold">Click or drag image here to upload</p>
                      <p className="text-[10px] text-[#808080]">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MEAL CONFIGURATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#F5F5F5] pb-6 bg-[#FAFAFA]/50 p-4 rounded-2xl border border-[#EBEBEB]">
              <div className="md:col-span-2 flex items-center justify-between border-b border-[#EBEBEB] pb-2 mb-2">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#1A1A1A]">Meal Configurations</span>
                
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                  Meal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Veg Pulao & Paneer Combo"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="bg-white border border-[#E0E0E0] rounded-xl px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
                  Lunch Menu * (Comma-separated items)
                </label>
                <textarea
                  placeholder="e.g. Vegetable Pulao, Paneer Butter Masala, Onion Raita"
                  value={lunchMenuInput}
                  onChange={(e) => setLunchMenuInput(e.target.value)}
                  rows={2}
                  className="bg-white border border-[#E0E0E0] rounded-xl px-3.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
                />
              </div>

              
              <div className="md:col-span-2 flex justify-end mt-2">
                <button
                  onClick={handleSaveSettings}
                  className="bg-[#2B5240] hover:bg-[#1A3D2F] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* DISHES LIST */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#666666] mb-1">
                Assigned Dishes
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lunchDishes.map((dish, idx) => (
                  <div 
                    key={idx} 
                    className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-2xl p-4 flex justify-between items-center group hover:bg-[#FFF5F0] hover:border-[#E8D2C2] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-[#EBEBEB] flex items-center justify-center text-[#C04E2D]">
                        <Utensils size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1A1A1A] text-[14px]">
                          {dish}
                        </span>
                        <span className="text-[11px] text-[#808080]">
                          Standard Portion
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeDishFromLunch(idx)}
                      className="text-[#666666] hover:text-[#D32F2F] opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {lunchDishes.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-xs text-[#808080] italic bg-[#FAFAFA] border border-dashed border-[#E0E0E0] rounded-2xl">
                    No dishes added yet. Use Add Dish below.
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOM ADD FORM */}
            <div className="border-t border-[#F5F5F5] pt-5 flex gap-3">
              <input 
                type="text" 
                id="customDishInput"
                placeholder="Type custom dish name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.currentTarget;
                    if (input.value.trim()) {
                      addDishToLunch(input.value.trim());
                      input.value = "";
                    }
                  }
                }}
                className="flex-1 bg-[#FAFAFA] border border-[#E0E0E0] rounded-xl px-4 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#C04E2D]"
              />
              <button 
  onClick={() => {
  const input =
    document.getElementById("customDishInput");

  if (!input?.value?.trim()) return;

  addDishToLunch(input.value.trim());
  input.value = "";
}}
                className="bg-[#2B5240] hover:bg-[#1A3D2F] text-white px-5 py-2.5 rounded-xl font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
              >
                <Plus size={16} />
                Add Dish
              </button>
            </div>

          </div>


        </div>



      </div>

    </div>
  );
};

export default MenuEditor;