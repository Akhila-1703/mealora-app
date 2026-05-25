import useSkipStore from "../store/skipStore";

const useSkip = () => {

  const {
    skips,
    todaySkipped,
    loading,
    fetchSkips,
    addSkipMeals,
    removeSkip,
  } = useSkipStore();

  return {

    skips,
    loading,

    todayStatus: todaySkipped?.isSkipped || false,


    fetchSkips,

    addSkip: async (dates) => {

      if (!dates?.length) return;

      return await addSkipMeals(dates);
    },

    cancelSkip: async (date) => {

      if (!date) return;

      return await removeSkip(date);
    },
  };
};

export default useSkip;