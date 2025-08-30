import React from "react";
import Lottie from "lottie-react";
import animationData from "./frontanimation.json";
import "./Login.css";

export default function Animation_login() {
  return (
    <>
      <div
        style={{
          marginLeft: "30px",
          marginTop: "50px",
          width: "700px",
          height: "700px",
        }}
      >
        {" "}
        {/* Adjust size as needed */}
        <Lottie animationData={animationData} />
      </div>
    </>
  );
}
