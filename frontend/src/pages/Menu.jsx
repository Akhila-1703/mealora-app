import React, { useEffect } from "react";
import useMenu from "../hooks/useMenu";

import {
  heading,
  subText,
  card,
} from "../styles/common";

function Menu() {
  const {
    weeklyMenu = [],
    loading,
    fetchWeeklyMenu,
  } = useMenu();

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const orderedMenus = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
    .map((day) =>
      weeklyMenu.find(
        (m) => m?.day?.toLowerCase() === day.toLowerCase()
      )
    )
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className={heading}>
          Weekly Menu
        </h1>

        <p className={subText}>
          Check your weekly meals
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className={card}>
          <p className="text-sm text-gray-500">
            Loading menu details...
          </p>
        </div>
      ) : orderedMenus.length === 0 ? (
        <div className={card}>
          <p className="text-sm text-gray-400 text-center py-6">
            No menu available currently
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {orderedMenus.map((item) => {
            const dishes =
              item?.items?.length > 0
                ? item.items
                : item?.lunchMenu
                    ?.split(",")
                    .map((dish) => dish.trim())
                    .filter(Boolean) || [];

            return (
              <div
                key={item._id}
                className={`${card} p-0 overflow-hidden flex flex-col group`}
              >

                {/* IMAGE */}
                {item?.imageUrl ? (
                  <div className="w-full h-48 relative overflow-hidden">

                    <img
                      src={item.imageUrl}
                      alt={item.title || item.day}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />

                  </div>
                ) : (
                  <div className="w-full h-48 bg-slate-50 flex items-center justify-center text-slate-300">
                    <p className="font-bold text-[10px] uppercase tracking-widest">
                      No Image
                    </p>
                  </div>
                )}

                {/* CONTENT */}
                <div className="p-6">

                  <div className="flex justify-between items-center gap-2 mb-3">

                    <p className="font-black text-xs uppercase tracking-widest text-slate-400">
                      {item.day}
                    </p>



                  </div>

                  {/* TITLE */}
                  <h3 className="font-bold text-base text-slate-800 mb-2">

                    {item?.title ||
                      "Standard Lunch"}

                  </h3>

                  {/* DESCRIPTION */}
                  {item?.description && (
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* DISHES */}
                  <div className="flex flex-wrap gap-2 mt-3">

                    {dishes.length > 0 ? (
                      dishes.map((dish, index) => (
                        <span
                          key={index}
                          className="
                            text-[11px]
                            bg-slate-50
                            text-slate-600
                            font-bold
                            px-3
                            py-1.5
                            rounded-lg
                            border
                            border-slate-100
                          "
                        >
                          {dish}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">
                        No dishes added
                      </span>
                    )}

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}

export default Menu;
