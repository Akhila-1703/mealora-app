import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowUpRight, History, CreditCard, ReceiptIndianRupee, TrendingUp, Plus, X, ArrowLeft, CheckCircle } from "lucide-react";
import useWallet from "../../hooks/useWallet";
import useSubscription from "../../hooks/useSubscription";
import useAuthStore from "../../store/authStore";

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
  const { user } = useAuthStore();

  const [amount, setAmount] = useState("");

  // MODAL & MOCK STRIPE STATES
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(1000);
  const [showStripe, setShowStripe] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // STRIPE FORM STATES
  const [emailInput, setEmailInput] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [country, setCountry] = useState("India");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (user) {
      setEmailInput(user.email || "");
      setCardName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
    }
  }, [user]);

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
    setSelectedPackage(Number(amount));
    setShowStripe(true);
    setIsTopUpOpen(true);
    setAmount("");
  };

  // FORMATTERS FOR CARD INPUTS
  const handleCardNoChange = (e) => {
    let raw = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    let formatted = "";
    for (let i = 0; i < raw.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += raw[i];
    }
    setCardNo(formatted);
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    let formatted = "";
    if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)} / ${raw.slice(2, 4)}`;
    } else {
      formatted = raw;
    }
    setCardExpiry(formatted);
  };

  const handleCvcChange = (e) => {
    let raw = e.target.value.replace(/[^0-9]/gi, "");
    setCardCvc(raw.slice(0, 3));
  };

  const handleStripePay = async (e) => {
    e.preventDefault();
    if (!cardNo || cardNo.replace(/\s+/g, "").length < 16) {
      setFormError("Please enter a valid 16-digit card number.");
      return;
    }
    if (!cardExpiry || cardExpiry.length < 7) {
      setFormError("Please enter a valid expiry date (MM / YY).");
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setFormError("Please enter a valid 3-digit CVC.");
      return;
    }
    if (!cardName.trim()) {
      setFormError("Please enter the cardholder's name.");
      return;
    }

    setFormError("");
    setIsPaying(true);

    // Simulate mock Stripe payment delay before committing database credit transaction
    setTimeout(async () => {
      try {
        await handleAddMoney(selectedPackage, "CARD");
        setIsPaying(false);
        setPaymentSuccess(true);
        // Clear card data
        setCardNo("");
        setCardExpiry("");
        setCardCvc("");
      } catch (err) {
        setIsPaying(false);
        setFormError("Failed to update wallet balance. Please try again.");
      }
    }, 2000);
  };

  const handleReturnFromSuccess = () => {
    setPaymentSuccess(false);
    setShowStripe(false);
    setIsTopUpOpen(false);
    fetchWallet();
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
              <h2 className="text-5xl font-black text-[#332520] tracking-tight font-['Inter']">₹{(balance ?? 0).toLocaleString('en-IN')}</h2>
              <p className="text-[13px] font-medium text-[#827873] mt-2 flex items-center gap-2 font-['Inter']">
                <ReceiptIndianRupee size={16} /> Ready for {remainingMeals} meals
              </p>
            </div>
            <div className="p-4 bg-[#C04E2D] text-white rounded-[14px] shadow-sm">
              <WalletIcon size={32} />
            </div>
          </div>

          {/* Add money button matching mockup */}
          <div className="mt-6 relative z-10">
            <button
              onClick={() => {
                setSelectedPackage(1000);
                setIsTopUpOpen(true);
              }}
              className="bg-[#C04E2D] hover:bg-[#A34226] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-sm font-['Inter'] cursor-pointer"
            >
              <Plus size={14} /> Add money
            </button>
          </div>
        </motion.div>

        {/* STATS CARD */}
        <motion.div 
          variants={itemVariants}
          className={`${glassCard} rounded-[14px] p-8 flex flex-col justify-between`}
        >
          <div>
            <p className={statLabel}>This Month Spent</p>
            <h3 className="text-2xl font-bold text-[#332520] font-['Inter']">₹{monthlySpent || 0}</h3>
          </div>
          <div className="pt-4 border-t border-[#E6E4DF]">
            <p className={statLabel}>Total Recharged</p>
            <h3 className="text-2xl font-bold text-[#332520] font-['Inter']">₹{totalAdded || 0}</h3>
          </div>
        </motion.div>
      </motion.div>

      <div className="w-full mt-6">
        {/* TRANSACTIONS */}
        {(balance ?? 0) < 100 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full ${glassCard} rounded-[14px] p-8 flex flex-col items-center justify-center text-center`}
          >
            <div className="w-16 h-16 bg-[#F4EEE8] rounded-full flex items-center justify-center mx-auto mb-4 text-[#C04E2D]">
              <WalletIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#332520] font-['Inter'] mb-2">Insufficient Balance</h2>
            <p className="text-[#827873] text-sm leading-relaxed mb-6">
              Please add money to your wallet to view your transaction history and unlock your meal calendar.
            </p>
            <button 
              onClick={() => {
                setSelectedPackage(1000);
                setIsTopUpOpen(true);
              }}
              className="bg-[#C04E2D] hover:bg-[#A34226] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              Top Up Now
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full ${glassCard} rounded-[14px] p-8`}
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

                      <div className={`text-lg font-black font-['Inter'] ${isCredit ? "text-[#C04E2D]" : "text-[#332520]"}`}>
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

      {/* ================= MODAL TOP UP SYSTEM ================= */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Inter']">
          
          {/* PACKAGE SELECTOR VIEW */}
          {!showStripe && !paymentSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-[#E6E4DF] text-[#332520]"
            >
              <button 
                onClick={() => setIsTopUpOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-[22px] font-bold text-[#332520] font-['Inter'] leading-tight mb-2">
                Top up wallet
              </h2>
              <p className="text-[13px] text-[#827873] leading-relaxed mb-6">
                Pick a package. You'll be redirected to Stripe to pay via UPI or Card.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { amount: 500, meals: 5 },
                  { amount: 1000, meals: 10, popular: true },
                  { amount: 2000, meals: 20 },
                  { amount: 5000, meals: 50 }
                ].map((pkg) => (
                  <button
                    key={pkg.amount}
                    onClick={() => setSelectedPackage(pkg.amount)}
                    className={`p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between h-[100px] cursor-pointer ${
                      selectedPackage === pkg.amount
                        ? "border-[#C04E2D] bg-[#FAF8F5] ring-2 ring-[#C04E2D]/10"
                        : "border-[#EBEBEB] bg-white hover:border-[#C04E2D]/40"
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-3 bg-[#C04E2D] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
                        Popular
                      </span>
                    )}
                    <span className="text-[20px] font-black font-['Inter']">₹{pkg.amount}</span>
                    <span className="text-[11px] font-medium text-[#827873]">≈ {pkg.meals} meals</span>
                  </button>
                ))}
              </div>

              <div className="mb-8 p-4 bg-[#FAF8F5] rounded-xl border border-[#E6E4DF] text-[11px] leading-relaxed text-[#827873]">
                <span className="font-bold text-[#332520] block mb-1">💡 Test Mode Notice</span>
                Amounts are server-defined for security. Stripe test mode — use card: <span className="font-bold font-mono bg-white px-1 py-0.5 border border-[#E6E4DF] rounded text-[#C04E2D]">4242 4242 4242 4242</span> with any future date & CVC.
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsTopUpOpen(false)}
                  className="px-6 py-3 rounded-xl border border-[#E6E4DF] text-xs font-bold text-[#827873] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowStripe(true)}
                  className="px-6 py-3 rounded-xl bg-[#C04E2D] text-white text-xs font-bold hover:bg-[#C04E2D]/90 transition-all shadow-sm cursor-pointer"
                >
                  Pay ₹{selectedPackage.toLocaleString()} with Stripe
                </button>
              </div>
            </motion.div>
          )}

          {/* STRIPE CHECKOUT MOCK LAYOUT */}
          {showStripe && !paymentSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col md:flex-row text-[#332520]"
            >
              {/* LEFT PANEL */}
              <div className="w-full md:w-[45%] bg-[#FAF8F5] border-b md:border-b-0 md:border-r border-[#E6E4DF] p-8 md:p-16 flex flex-col justify-between">
                <div>
                  <button 
                    onClick={() => setShowStripe(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-[#827873] hover:text-[#332520] transition-colors mb-12 cursor-pointer"
                  >
                    <ArrowLeft size={16} /> Back to MealOra
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#332520] text-white flex items-center justify-center font-bold text-sm font-['Inter']">
                      M
                    </div>
                    <span className="font-bold text-lg">MealOra</span>
                    <span className="bg-[#E6E4DF] text-[#332520] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      Sandbox
                    </span>
                  </div>

                  <p className="text-sm text-[#827873] mb-4">Recharge Kitchen Wallet</p>
                  <h1 className="text-5xl font-black tracking-tight text-[#332520] font-['Inter']">
                    ₹{selectedPackage.toFixed(2)}
                  </h1>
                </div>

                <div className="hidden md:block text-xs text-[#827873] leading-relaxed">
                  <p className="font-bold text-[#332520] mb-1">Stripe Sandbox Account</p>
                  <p>This is a simulated transaction. Card details will not be charged.</p>
                </div>
              </div>

              {/* RIGHT PANEL (PAYMENT FORM) */}
              <div className="w-full md:w-[55%] bg-white p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
                <div className="max-w-md w-full mx-auto">
                  <h2 className="text-xl font-bold mb-6 text-[#332520]">Payment Details</h2>

                  {formError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleStripePay} className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <label className="block text-xs font-bold text-[#827873] uppercase tracking-wider mb-2">
                        Contact Information
                      </label>
                      <input 
                        type="email" 
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full border border-[#E6E4DF] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D]"
                      />
                    </div>

                    {/* Card Info */}
                    <div>
                      <label className="block text-xs font-bold text-[#827873] uppercase tracking-wider mb-2">
                        Card Information
                      </label>
                      
                      <div className="border border-[#E6E4DF] rounded-lg divide-y divide-[#E6E4DF] overflow-hidden">
                        {/* Card Number */}
                        <div className="flex items-center bg-white px-3 py-3.5">
                          <CreditCard size={18} className="text-[#827873] mr-3" />
                          <input 
                            type="text" 
                            required
                            placeholder="1234 5678 1234 5678"
                            value={cardNo}
                            onChange={handleCardNoChange}
                            className="w-full text-sm focus:outline-none placeholder-gray-400 font-mono tracking-wider"
                          />
                        </div>

                        {/* Expiry & CVC */}
                        <div className="flex divide-x divide-[#E6E4DF] bg-white">
                          <input 
                            type="text" 
                            required
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="w-1/2 px-3 py-3.5 text-sm focus:outline-none placeholder-gray-400 font-mono tracking-wider"
                          />
                          <input 
                            type="password" 
                            required
                            placeholder="CVC"
                            value={cardCvc}
                            onChange={handleCvcChange}
                            className="w-1/2 px-3 py-3.5 text-sm focus:outline-none placeholder-gray-400 font-mono tracking-wider"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#827873] uppercase tracking-wider mb-2">
                        Cardholder Name
                      </label>
                      <input 
                        type="text" 
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Full name on card"
                        className="w-full border border-[#E6E4DF] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D]"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-xs font-bold text-[#827873] uppercase tracking-wider mb-2">
                        Country or Region
                      </label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full border border-[#E6E4DF] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04E2D]/20 focus:border-[#C04E2D] bg-white"
                      >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isPaying}
                      className="w-full bg-[#0070F3] hover:bg-[#0060DF] text-white font-bold py-3.5 rounded-lg text-[15px] shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPaying ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        `Pay ₹${selectedPackage.toLocaleString()}`
                      )}
                    </button>
                  </form>
                </div>

                <div className="mt-12 text-center text-[11px] text-[#827873] max-w-md w-full mx-auto flex items-center justify-between border-t border-[#E6E4DF] pt-6">
                  <span>Powered by <strong>stripe</strong></span>
                  <div className="flex gap-4">
                    <span className="hover:underline cursor-pointer">Terms</span>
                    <span className="hover:underline cursor-pointer">Privacy</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS MODAL SCREEN */}
          {paymentSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-[#E6E4DF] text-[#332520] font-['Inter']"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} />
              </div>

              <h2 className="text-[24px] font-bold text-[#332520] font-['Inter'] leading-tight mb-2">
                Payment Successful!
              </h2>
              <p className="text-sm text-[#827873] leading-relaxed mb-8">
                ₹{selectedPackage.toLocaleString()} has been credited to your MealOra kitchen wallet.
              </p>

              <button
                onClick={handleReturnFromSuccess}
                className="w-full bg-[#2B5240] hover:bg-[#1E3A2E] text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer shadow-sm"
              >
                Return to Wallet
              </button>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}

export default Wallet;

