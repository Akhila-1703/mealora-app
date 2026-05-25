import React, { useEffect } from "react";
import useAdmin from "../../hooks/useAdmin";

import {
  heading,
  subText,
  card,
  dangerBadge,
} from "../../styles/common";


function LowBalanceUsers() {
  const { users, fetchUsers, loading } = useAdmin();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const lowUsers = users.filter((u) => u.walletBalance <= 50);

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className={heading}>Low Balance Users</h1>
        <p className={subText}>
          Users needing recharge
        </p>
      </div>

      <div className={card}>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : lowUsers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            No data available
          </p>
        ) : (
          <div className="flex flex-col gap-3">

            {lowUsers.map((user) => (
              <div
                key={user._id}
                className="flex justify-between text-sm border-b pb-2"
              >
                <span>{user.email}</span>

                <span className={dangerBadge}>
                  ₹{user.walletBalance}
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default LowBalanceUsers;