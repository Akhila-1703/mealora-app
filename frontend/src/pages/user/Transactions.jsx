import React, { useEffect } from "react";
import useWallet from "../../hooks/useWallet";

import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";

import {
  heading,
  subText,
  card,
} from "../../styles/common";

function Transactions() {
  const { transactions, loading, fetchWallet } = useWallet();

  // mounting the component lifecycle and hydrating initial state from the server
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className={heading}>Transactions</h1>
        <p className={subText}>Your wallet activity</p>
      </div>

      {/* Transactions List */}
      <div className={card}>

        {loading ? (
          <Loader />
        ) : !transactions || transactions.length === 0 ? (
          <EmptyState message="No transactions found" />
        ) : (
          <div className="flex flex-col gap-3">

            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex justify-between items-center border-b pb-2 text-sm"
              >
                {/* Description */}
                <span className="text-gray-700">
                  {tx.description || tx.reason || "Transaction"}
                </span>

                {/* Amount */}
                <span
                  className={
                    tx.amount > 0
                      ? "text-green-600 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {tx.amount > 0 ? "+" : "-"}₹{Math.abs(tx.amount)}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Transactions;

