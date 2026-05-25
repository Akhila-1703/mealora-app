import React from "react";
import { useNavigate } from "react-router-dom";
import { primaryBtn, heading, subText } from "../styles/common";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">

      <h1 className={heading}>Access Denied</h1>

      <p className={subText}>
        You are not authorized to view this page
      </p>

      <button
        onClick={() => navigate("/")}
        className={primaryBtn}
      >
        Go Home
      </button>

    </div>
  );
}

export default Unauthorized;