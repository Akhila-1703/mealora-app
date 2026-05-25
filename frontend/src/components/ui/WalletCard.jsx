import React from "react";

import { highlightCard } from "../../styles/common";

const WalletCard = ({ balance }) => {
  return (
    <div className={highlightCard}>
      <p className="text-sm opacity-80">Wallet Balance</p>
      <h2 className="text-3xl font-bold mt-2">₹{balance}</h2>
    </div>
  );
};

export default WalletCard;