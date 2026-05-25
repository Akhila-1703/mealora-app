import React from "react";

const EmptyState = ({ message = "No data available" }) => {
  return (
    <div className="text-center text-gray-400 py-10 text-sm">
      {message}
    </div>
  );
};

export default EmptyState;