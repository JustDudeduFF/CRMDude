import Lottie from "lottie-react";
import React from "react";
import EmpDashAnimaiton from "./EMPdraw/EmpDashAnimation.json";

export default function EmpDash() {
  return (
    <div className="employee-animation-container">
      <Lottie animationData={EmpDashAnimaiton}></Lottie>
    </div>
  );
}
