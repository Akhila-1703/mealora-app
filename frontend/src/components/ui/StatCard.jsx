import React from "react";

import { statCard, statNumber, statLabel } from "../../styles/common";

const StatCard = ({ title, value, extra }) => {
  return (
    <div className={`${statCard} p-4`}>
      <p className={statLabel}>{title}</p>

      <h2 className={`${statNumber} mt-1`}>
        {value}
      </h2>

      {extra && (
        <p className="text-xs text-gray-500 mt-1">
          {extra}
        </p>
      )}
    </div>
  );
};

export default StatCard;