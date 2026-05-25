import useSubscriptionStore from "../store/subscriptionStore";

const useSubscription = () => {
  const {
    subscription,
    loading,
    fetchSubscription,
    createSub,
    updateSub,
    changeStatus,
  } = useSubscriptionStore();

  return {
    subscription,
    loading,
    fetchSubscription,
    handleCreateSubscription: createSub,
    handleUpdateSubscription: updateSub,
    handleStatusChange: changeStatus,
  };
};

export default useSubscription;