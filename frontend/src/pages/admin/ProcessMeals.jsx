import React, { useEffect, useState } from "react";
import useAdmin from "../../hooks/useAdmin";
import { 
  Users, 
  MapPin, 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  Ban, 
  Truck, 
  RefreshCw,
  Zap
} from "lucide-react";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { toast } from "react-hot-toast";

const ProcessMeals = () => {
  const {
    todayMeals,
    todayDeliveries,
    processResult,
    billingRuns,
    loading,
    fetchTodayMeals,
    runProcessMeals,
    fetchTodayDeliveries,
    excludeUserAction,
    deliverUserAction,
    fetchBillingRuns,
  } = useAdmin();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchTodayMeals();
    fetchTodayDeliveries();
    fetchBillingRuns();
  }, [fetchTodayMeals, fetchTodayDeliveries, fetchBillingRuns]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([fetchTodayMeals(), fetchTodayDeliveries(), fetchBillingRuns()]);
      toast.success("Operations data refreshed");
    } catch (err) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };


  const handleExclude = async (userId) => {
    try {
      setActionLoadingId(userId);
      await excludeUserAction(userId);
      await Promise.all([fetchTodayMeals(), fetchBillingRuns()]);
      toast.success("User excluded from today's delivery run");
    } catch (err) {
      toast.error("Failed to exclude user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeliver = async (userId) => {
    try {
      setActionLoadingId(userId);
      await deliverUserAction(userId);
      await Promise.all([fetchTodayMeals(), fetchBillingRuns()]);
      toast.success("Meal marked as delivered and billed successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Billing failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const lowBalanceCount = todayDeliveries?.filter(d => (d.walletBalance ?? 0) < 400).length || 0;

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[calc(100vh-80px)] flex flex-col font-['Inter'] pb-12 -mt-6">
      
      {/* HEADER */}
      <div className="w-full px-4 md:px-8 pt-8 pb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h1 className="text-[32px] font-bold text-[#1A1A1A] font-['Fraunces'] leading-none mb-2">
            Operations & Deliveries
          </h1>
          <p className="text-[#666666] text-[15px]">
            Manage today's meal dispatches, billing overrides, and batch processing runs.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
          className="inline-flex items-center gap-2 border border-[#E0E0E0] hover:bg-white bg-[#FAFAFA] text-[#1A1A1A] px-5 py-3 rounded-xl text-[14px] font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          Refresh Operations
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex flex-col gap-8">
        
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#4F4F4F]">
              <Users size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Eligible Deliveries</span>
            </div>
            <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">
              {todayDeliveries?.length || 0}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#C04E2D]">
              <Ban size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase">Skipped Today</span>
            </div>
            <span className="text-[36px] font-bold text-[#1A1A1A] leading-none">
              {todayMeals?.skippedMeals ?? 0}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6 flex flex-col justify-between shadow-sm h-[130px]">
            <div className="flex items-center gap-2 text-[#D32F2F]">
              <AlertTriangle size={18} />
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#D32F2F]">Wallet Warning</span>
            </div>
            <span className="text-[36px] font-bold text-[#D32F2F] leading-none">
              {lowBalanceCount}
            </span>
          </div>

          <div className="bg-[#2B5240] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-[130px] text-white">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[#A6C4B4]">
                <Truck size={18} />
                <span className="text-[11px] font-bold tracking-widest uppercase">Prepped / Billed</span>
              </div>
              <span className="text-[10px] text-[#86A896] font-medium leading-none">Updates after 2:00 PM</span>
            </div>
            <span className="text-[36px] font-bold leading-none">
              {todayDeliveries?.filter(d => d.deliveryStatus === "DELIVERED").length || 0}
            </span>
          </div>
        </div>

        {/* BATCH RUN PANEL */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-xl">
            <h2 className="text-[20px] font-bold text-[#1A1A1A] flex items-center gap-2">
              <Zap size={20} className="text-[#2B5240]" />
              Daily Batch Billing
            </h2>
            <p className="text-[#666666] text-[14px]">
              The system billing run charges all subscribers who are not skipped, active, and have sufficient wallet balances. This executes automatically every day at 2:00 PM.
            </p>
          </div>
          <div className="bg-[#F5F5F5] border border-[#E0E0E0] text-[#666666] px-6 py-4 rounded-2xl font-semibold text-[15px] whitespace-nowrap flex items-center gap-2">
            <CheckCircle size={18} className="text-[#2E7D32]" />
            Automated Schedule Active
          </div>
        </div>

        {/* BATCH RESULTS */}
        {(processResult || (billingRuns && billingRuns.length > 0)) && (
          <div className="bg-white rounded-3xl border border-[#EBEBEB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1A1A1A]">Latest Batch Processing Results</h3>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase ${processResult ? 'bg-[#EDE7F6] text-[#673AB7]' : billingRuns[0]?.status === 'SUCCESS' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#D32F2F]'}`}>
                {processResult ? 'MANUAL RUN' : `AUTO: ${billingRuns[0]?.status || 'PENDING'}`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-[#EBEBEB]">
              <div className="flex flex-col p-4">
                <span className="text-[28px] font-bold text-[#2E7D32]">{processResult?.processed ?? billingRuns[0]?.processedCount ?? 0}</span>
                <span className="text-[13px] text-[#666666]">Successfully Billed</span>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-[28px] font-bold text-[#1A1A1A]">{processResult?.skipped ?? billingRuns[0]?.skippedCount ?? 0}</span>
                <span className="text-[13px] text-[#666666]">Skipped Meals</span>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-[28px] font-bold text-[#D32F2F]">{processResult?.insufficientBalance ?? billingRuns[0]?.insufficientBalanceCount ?? 0}</span>
                <span className="text-[13px] text-[#D32F2F] font-semibold">Insufficient Balance</span>
              </div>
            </div>
          </div>
        )}

        {/* DELIVERIES LIST */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F5]">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">Today's Dispatch Sheet</h2>
          </div>

          {loading && !todayDeliveries?.length ? (
            <div className="p-12"><Loader /></div>
          ) : !todayDeliveries || todayDeliveries.length === 0 ? (
            <div className="p-12">
              <EmptyState message="No deliveries scheduled for today." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F5F5F5]">
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">User</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Delivery Address</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Wallet Balance</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Billing Status</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5]">
                  {todayDeliveries.map((delivery) => {
                    const isLowBalance = (delivery.walletBalance ?? 0) < 400;
                    const isInsufficient = (delivery.walletBalance ?? 0) < (delivery.mealPrice || 100);
                    const isBilled = delivery.deliveryStatus === "DELIVERED";
                    const userId = delivery.user?._id;

                    return (
                      <tr key={userId} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] ${isInsufficient ? 'bg-[#D32F2F]' : isLowBalance ? 'bg-[#F97316]' : 'bg-[#2B5240]'}`}>
                              {getInitials(delivery.user?.firstName, delivery.user?.lastName)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[#1A1A1A] text-[15px]">
                                {delivery.user?.firstName} {delivery.user?.lastName}
                              </span>
                              <span className="text-[13px] text-[#666666]">{delivery.user?.email}</span>
                              <span className="text-[11px] text-[#808080]">{delivery.user?.mobile || "No Mobile"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-start gap-2 max-w-[280px]">
                            <MapPin size={16} className="text-[#808080] shrink-0 mt-0.5" />
                            <span className="text-[14px] text-[#4F4F4F] leading-tight">
                              {delivery.address}
                            </span>
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold ${isInsufficient ? 'bg-[#FFEBEE] text-[#D32F2F]' : isLowBalance ? 'bg-[#FFF3E0] text-[#E65100]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
                            ₹{(delivery.walletBalance || 0).toFixed(2)}
                          </div>
                        </td>

                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${isBilled ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF9C4] text-[#F57F17]'}`}>
                            {isBilled ? (
                              <>
                                <CheckCircle size={12} /> Billed & Dispatched
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={12} /> Pending Billing
                              </>
                            )}
                          </span>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleDeliver(userId)}
                              disabled={isBilled || isInsufficient || actionLoadingId === userId}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${isBilled ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed' : isInsufficient ? 'bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2] cursor-not-allowed' : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-sm'}`}
                            >
                              {actionLoadingId === userId ? "Billing..." : isBilled ? "Billed" : isInsufficient ? "Insufficient" : "Bill & Deliver"}
                            </button>
                            <button
                              onClick={() => handleExclude(userId)}
                              disabled={isBilled || actionLoadingId === userId}
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${isBilled ? 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed' : 'bg-[#C04E2D] hover:bg-[#A03F22] text-white shadow-sm'}`}
                            >
                              Exclude User
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BILLING HISTORY LOG TRACKER */}
        <div className="bg-white rounded-3xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-[#F5F5F5] flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[#1A1A1A]">Billing Run History Tracker</h2>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#808080] bg-[#FAFAFA] border border-[#EBEBEB] px-3 py-1 rounded-full">
              Database Logs
            </span>
          </div>

          {!billingRuns || billingRuns.length === 0 ? (
            <div className="p-8 text-center text-[#808080] text-sm">
              No historical billing run logs found. Runs will be recorded here when they execute.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#F5F5F5]">
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Run Date</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Trigger Method</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080]">Success / Failure</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-center">Billed</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-center">Skipped</th>
                    <th className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase text-[#808080] text-center">Failed Balances</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F5]">
                  {billingRuns.map((run) => (
                    <tr key={run._id} className="hover:bg-[#FAFAFA] transition-colors text-[14px]">
                      <td className="px-8 py-4 font-semibold text-[#1A1A1A]">
                        {run.date}
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${run.executedBy === "ADMIN" ? "bg-[#EDE7F6] text-[#673AB7]" : "bg-[#E3F2FD] text-[#1E88E5]"}`}>
                          {run.executedBy || "SYSTEM"}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${run.status === "SUCCESS" ? "bg-[#E8F5E9] text-[#2E7D32]" : "bg-[#FFEBEE] text-[#D32F2F]"}`}>
                          {run.status === "SUCCESS" ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center font-bold text-[#2E7D32]">
                        {run.processedCount ?? 0}
                      </td>
                      <td className="px-8 py-4 text-center text-[#666666]">
                        {run.skippedCount ?? 0}
                      </td>
                      <td className="px-8 py-4 text-center text-[#C04E2D] font-bold">
                        {run.insufficientBalanceCount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessMeals;