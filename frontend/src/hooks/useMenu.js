import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

import {
  getTodayMenu,
  getWeeklyMenu,
} from "../api/menuApi";

const useMenu = () => {
  const [todayMenu, setTodayMenu] = useState(null);

  const [weeklyMenu, setWeeklyMenu] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchTodayMenu = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getTodayMenu();

      setTodayMenu(
        res?.data?.payload ||
        res?.payload ||
        null
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load today's menu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeeklyMenu = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getWeeklyMenu();

      setWeeklyMenu(
        res?.data?.payload ||
        res?.payload ||
        []
      );
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load weekly menu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    await Promise.all([
      fetchTodayMenu(),
      fetchWeeklyMenu(),
    ]);
  }, [
    fetchTodayMenu,
    fetchWeeklyMenu,
  ]);

  // mounting the component lifecycle and hydrating initial state from the server
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    todayMenu,
    weeklyMenu,
    menu: weeklyMenu,
    loading,
    fetchTodayMenu,
    fetchWeeklyMenu,
    fetchMenu,
  };
};

export default useMenu;