import React from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import {
  FaWifi,
  FaBuilding,
  FaMicrochip,
  FaUserTag,
  FaTicketAlt,
  FaRegMoneyBillAlt,
  FaHistory,
  FaGlobe,
  FaMapMarkedAlt,
  FaLayerGroup,
  FaCogs,
  FaArrowLeft
} from "react-icons/fa";

import BroadBandPlans from "./BroadBandPlans";
import ISP from "./ISP";
import Offices from "./Offices";
import DeviceMakers from "./DeviceMakers";
import Designation from "./Designation";
import Company from "./Company";
import Colony from "./Colony";
import TicketConcerns from "./TicketConcerns";
import DebitCreditNotesConcern from "./DebitCreditNotesConcern";
import RemarksFollow from "./RemarksFollow";
import PlanProvider from "./PlanProvider";

export default function MasterDash() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "BroadBand Plans", path: "broadbandplan", icon: <FaWifi /> },
    { name: "ISPs", path: "isps", icon: <FaGlobe /> },
    { name: "Offices", path: "offices", icon: <FaBuilding /> },
    { name: "Device Maker", path: "dmaker", icon: <FaMicrochip /> },
    { name: "Plan Provider", path: "planprovider", icon: <FaLayerGroup /> },
    { name: "Designations", path: "designation", icon: <FaUserTag /> },
    { name: "Tickets Concerns", path: "ticketconcern", icon: <FaTicketAlt /> },
    { name: "Companies", path: "company", icon: <FaBuilding /> },
    { name: "Colony", path: "colony", icon: <FaMapMarkedAlt /> },
    {
      name: "Debit or Credit",
      path: "dbparticular",
      icon: <FaRegMoneyBillAlt />,
    },
    { name: "Remark or Follow UP", path: "remarkfollow", icon: <FaHistory /> },
  ];

  const currentPath = location.pathname.split("/").pop();

  return (
    <div className="master-admin-wrapper">
      {/* Sidebar Navigation */}
      <aside className="master-sidebar">
        <div className="sidebar-brand">
          <div onClick={() => navigate("/dashboard")} className="back-icon">
            <FaArrowLeft />
          </div>
          <div className="brand-icon">
            <FaCogs />
          </div>
          <div className="brand-text">
            <span>Admin</span>
            <small>Master Control</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map((item) => (
              <li
                key={item.path}
                onClick={() => navigate(`/dashboard/master/${item.path}`)}
                className={`nav-item ${currentPath === item.path ? "active" : ""}`}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.name}</span>
                {currentPath === item.path && (
                  <div className="active-indicator" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Stage */}
      <main className="master-workspace">

        <div className="workspace-body">
          <Routes>
            <Route path="broadbandplan" element={<BroadBandPlans />} />
            <Route path="isps" element={<ISP />} />
            <Route path="offices" element={<Offices />} />
            <Route path="dmaker" element={<DeviceMakers />} />
            <Route path="designation" element={<Designation />} />
            <Route path="company" element={<Company />} />
            <Route path="colony" element={<Colony />} />
            <Route path="ticketconcern" element={<TicketConcerns />} />
            <Route path="dbparticular" element={<DebitCreditNotesConcern />} />
            <Route path="remarkfollow" element={<RemarksFollow />} />
            <Route path="planprovider" element={<PlanProvider />} />
          </Routes>
        </div>
      </main>

      <style>{`
        .master-admin-wrapper {
          display: flex;
          height: 100vh;
          background: #f4f7fe;
          overflow: hidden;
        }

        /* Sidebar Styling */
        .master-sidebar {
          width: 280px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);;
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 10px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .sidebar-brand {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .brand-icon {
          font-size: 1.5rem;
          color: #38bdf8;
        }

        .back-icon {
          font-size: 1.2rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 100%;
          transition: background 0.3s, color 0.3s;
        }
          
        .back-icon:hover {
            color: #38bdf8;
        }

        .brand-text span { display: block; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.5px; }
        .brand-text small { color: white; font-size: 0.75rem; text-transform: uppercase; }

        .sidebar-nav { flex: 1; overflow-y: auto; padding: 1rem 0.75rem; }
        .nav-menu { list-style: none; padding: 0; margin: 0; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
          position: relative;
          margin-bottom: 4px;
        }

        .nav-item:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
        .nav-item.active { background: #38bdf8; color: black; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3); }

        .nav-item .icon { font-size: 1.1rem; display: flex; align-items: center; }
        .nav-item .label { font-size: 0.9rem; font-weight: 500; }

        /* Workspace Styling */
        .master-workspace {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .workspace-header {
          background: white;
          padding: 1.25rem 2.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .workspace-header h2 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700; }

        .workspace-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        /* Tablet & Mobile Responsiveness */
        @media (max-width: 992px) {
          .master-admin-wrapper { flex-direction: column; }
          .master-sidebar { width: 100%; height: auto; }
          .sidebar-brand { padding: 1rem; }
          .sidebar-nav { overflow-x: auto; padding: 0.5rem; }
          .nav-menu { display: flex; gap: 8px; }
          .nav-item { white-space: nowrap; padding: 8px 16px; }
          .workspace-body { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
