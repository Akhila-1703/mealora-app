import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, History, CreditCard, ReceiptIndianRupee, TrendingUp, Plus } from "lucide-react";
import useWallet from "../../hooks/useWallet";
import useSubscription from "../../hooks/useSubscription";

import {
  pageTitle,
  subText,
  input,
  primaryBtn,
  statLabel,
  glassCard,
} from "../../styles/common";

function Wallet() {
  const {
    balance,
    transactions,
    loading,
    fetchWallet,
    handleAddMoney,
  } = useWallet();

  const { subscription } = useSubscription();

  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const mealPrice = subscription?.mealPrice || 100;
  const remainingMeals = Math.floor((balance || 0) / mealPrice);
  const now = new Date();

  const monthlySpent = transactions
    ?.filter(
      (t) =>
        t.type === "DEBIT" &&
        new Date(t.createdAt).getMonth() === now.getMonth() &&
        new Date(t.createdAt).getFullYear() === now.getFullYear()
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const totalAdded = transactions
    ?.filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) return;
    await handleAddMoney(Number(amount));
    setAmount("");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* HEADER */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10"
      >
        <h1 className={pageTitle}>Wallet <span className="text-[#C04E2D]">Credits</span></h1>
        <p className={subText}>Manage your balance and track meal deductions.</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        {/* BALANCE CARD */}
        <motion.div 
          variants={itemVariants}
          className={`md:col-span-2 ${glassCard} rounded-[14px] p-8 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C04E2D]/5 rounded-bl-full" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className={statLabel}>Available Balance</p>
              <h2 className="text-5xl font-black text-[#332520] tracking-tight font-['Fraunces']">₹{balance ?? 0}</h2>
              <p className="text-[13px] font-medium text-[#827873] mt-2 flex items-center gap-2 font-['Inter']">
                <ReceiptIndianRupee size={16} /> Ready for {remainingMeals} meals
              </p>
            </div>
            <div className="p-4 bg-[#C04E2D] text-white rounded-[14px] shadow-sm">
              <WalletIcon size={32} />
            </div>
          </div>
        </motion.div>

        {/* STATS CARD */}
        <motion.div 
          variants={itemVariants}
          className={`${glassCard} rounded-[14px] p-8 flex flex-col justify-between`}
        >
          <div>
            <p className={statLabel}>This Month Spent</p>
            <h3 className="text-2xl font-bold text-[#332520] font-['Fraunces']">₹{monthlySpent || 0}</h3>
          </div>
          <div className="pt-4 border-t border-[#E6E4DF]">
            <p className={statLabel}>Total Recharged</p>
            <h3 className="text-2xl font-bold text-[#332520] font-['Fraunces']">₹{totalAdded || 0}</h3>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ADD MONEY */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`lg:col-span-1 ${glassCard} rounded-[14px] p-8 h-fit sticky top-24`}
        >
          <h2 className="text-xl font-bold font-serif mb-6 flex items-center gap-2 text-[#332520]">
            <Plus className="text-[#C04E2D]" size={24} />
            Top Up Wallet
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className="py-3 rounded-[12px] border border-[#E6E4DF] text-sm font-semibold text-[#332520] hover:border-[#C04E2D] hover:text-[#C04E2D] hover:bg-[#FAF8F5] transition-all active:scale-95 font-['Inter']"
              >
                + ₹{amt}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <p className={statLabel}>Custom Amount</p>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`${input} py-4 text-lg font-bold`}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`${primaryBtn} w-full py-4 flex items-center justify-center gap-2`}
            >
              {loading ? "Processing..." : (
                <>
                  Add Money <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 p-4 bg-[#FAF8F5] rounded-[12px] border border-[#E6E4DF]">
            <p className="text-[10px] font-black text-[#827873] uppercase tracking-widest mb-2 flex items-center gap-2 font-['Inter']">
              <CreditCard size={12} /> Secure Payment
            </p>
            <p className="text-[11px] leading-relaxed text-[#827873] font-['Inter']">
              Payments are processed securely via our banking partner. Credits are added instantly.
            </p>
          </div>
        </motion.div>

        {/* TRANSACTIONS */}
        {(balance ?? 0) < 100 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-2 ${glassCard} rounded-[14px] p-8 flex flex-col items-center justify-center text-center`}
          >
            <div className="w-16 h-16 bg-[#FCE8E8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#991B1B]">
              <WalletIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] font-['Fraunces'] mb-2">Insufficient Balance</h2>
            <p className="text-[#666666] text-sm leading-relaxed">
              Please add money to your wallet to view your transaction history and unlock your meal calendar.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`lg:col-span-2 ${glassCard} rounded-[14px] p-8`}
          >
            <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-[#332520]">
              <History className="text-[#827873]" size={24} />
              Recent Activity
            </h2>
            <span className="text-xs font-bold text-[#827873] uppercase tracking-widest font-['Inter']">
              {transactions?.length || 0} Transactions
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#C04E2D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !transactions?.length ? (
            <div className="text-center py-20 text-[#827873]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium italic font-['Inter']">No transactions found yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                let label = tx.reason || "Transaction";
                if (tx.reason === "MEAL_LUNCH") label = "Lunch Deduction";
                if (tx.reason === "MEAL_DINNER") label = "Dinner Deduction";

                return (
                  <div
                    key={tx._id}
                    className="flex justify-between items-center p-5 rounded-[14px] border border-[#E6E4DF] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-[12px] ${isCredit ? 'bg-[#F4EEE8] text-[#C04E2D]' : 'bg-white border border-[#E6E4DF] text-[#827873]'}`}>
                        {isCredit ? <TrendingUp size={20} /> : <ReceiptIndianRupee size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#332520] leading-none mb-1 font-['Inter']">
                          {label}
                        </p>
                        <p className="text-[10px] font-bold text-[#827873] uppercase tracking-widest font-['Inter'] mt-1.5">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className={`text-lg font-black font-['Fraunces'] ${isCredit ? "text-[#C04E2D]" : "text-[#332520]"}`}>
                      {isCredit ? "+" : "-"}₹{tx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
        )}

      </div>
    </div>
  );
}

export default Wallet;