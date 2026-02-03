import Lottie from "lottie-react";
import React from "react";
import EmpDashAnimaiton from "./EMPdraw/EmpDashAnimation.json";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  ArrowUpRight, 
  LayoutDashboard 
} from "lucide-react";

export default function EmpDash() {
  // Example stats - these could eventually come from props or a fetch call
  const summaryStats = [
    { label: "Total Staff", value: "24", icon: Users, color: "text-primary", bg: "bg-primary" },
    { label: "On Duty", value: "18", icon: UserCheck, color: "text-success", bg: "bg-success" },
    { label: "On Leave", value: "6", icon: UserMinus, color: "text-danger", bg: "bg-danger" },
  ];

  return (
    <div className="container-fluid p-0">
      {/* Welcome Header */}
      <div className="d-flex align-items-center mb-4">
        <div className="p-2 bg-white shadow-sm rounded-3 me-3">
          <LayoutDashboard className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Employee Overview</h4>
          <p className="text-muted small mb-0">Select an employee from the sidebar to view details</p>
        </div>
      </div>

      {/* Summary Mini-Cards */}
      <div className="row g-3 mb-4">
        {summaryStats.map((stat, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className={`p-2 ${stat.bg} bg-opacity-10 rounded-3`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div className="text-success small fw-medium d-flex align-items-center">
                  <ArrowUpRight size={14} /> 12%
                </div>
              </div>
              <div className="mt-3">
                <h3 className="fw-bold mb-0">{stat.value}</h3>
                <span className="text-muted small fw-semibold text-uppercase">{stat.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Animation Section */}
      <div className="card border-0 shadow-sm rounded-4 p-5 bg-white d-flex justify-content-center align-items-center">
        <div style={{ maxWidth: "450px", width: "100%" }} className="employee-animation-container">
          <Lottie animationData={EmpDashAnimaiton} loop={true} />
        </div>
        <div className="text-center mt-4">
          <h5 className="fw-bold text-dark">Workforce Management System</h5>
          <p className="text-muted mx-auto" style={{ maxWidth: "300px" }}>
            Access employee profiles, manage attendance, and track performance records from the side navigation.
          </p>
        </div>
      </div>
    </div>
  );
}