import toast from "react-hot-toast";

// existing
export const safePayload = (res) => {
  return res?.data?.payload || res?.payload || null;
};

export const isEmpty = (arr) => {
  return !arr || arr.length === 0;
};

// 🔥 NEW: GLOBAL API HANDLER
export const handleApi = async (apiCall, successMsg) => {
  try {
    const res = await apiCall();

    if (successMsg) {
      toast.success(successMsg);
    }

    return res;
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Something went wrong"
    );
    throw err;
  }
};