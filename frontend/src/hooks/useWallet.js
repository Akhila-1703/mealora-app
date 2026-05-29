import { useCallback } from "react";
import useWalletStore from "../store/walletStore";

const useWallet = () => {
  const {
    balance,
    transactions,
    loading,
    fetchWallet,
    addMoneyToWallet,
  } = useWalletStore();

  const handleAddMoney = useCallback((amount, paymentMethod = "CARD") => {
    if (!amount || amount <= 0) return;

    return addMoneyToWallet({
      amount,
      paymentMethod,
    });
  }, [addMoneyToWallet]);

  return {
    balance,
    transactions,
    loading,
    fetchWallet,
    handleAddMoney,
  };
};

export default useWallet;