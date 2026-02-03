import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import ReportDash from "./ReportDash";
import { API } from "../FirebaseConfig";
import TicketdataDash from "./TicketData/TicketdataDash";
import RevenueDash from "./ExpiredData/RevenueDash";
import ExpiredDash from "./ExpiredData/ExpiredDash";
import DueDash from "./ExpiredData/DueDash";
import { toast } from "react-toastify";
import { FaTicketAlt, FaMoneyBillWave, FaHistory, FaUserClock, FaRedoAlt, FaChevronRight, FaChartLine } from "react-icons/fa";
import "./Reports.css";

export default function Reports() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();
  const location = useLocation();

  const [text, setText] = useState(1.1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    ticket: 0,
    due: 0,
    revenue: 0,
    expire: 0,
  });

  function formatRevenue(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const isSpecificReport =
    location.pathname !== "/dashboard/reports" &&
    location.pathname.includes("/reports");

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/reports/dash?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to fetch Data", {
          autoClose: 2000,
          position: "top-right",
        });

      const resData = response.data;
      setData({
        ticket: resData.ticketCount,
        expire: resData.expiredCount,
        due: resData.totalDue,
        revenue: resData.totalRevenue,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const navItems = [
    { label: "Tickets", value: `Open: ${data.ticket}`, path: "/tickets", icon: <FaTicketAlt />, color: "#4e73df" },
    { label: "Due Amount", value: `₹${formatRevenue(data.due)}`, path: "/dueamount", icon: <FaMoneyBillWave />, color: "#e74a3b" },
    { label: "Payment Revenue", value: `₹${formatRevenue(data.revenue)}`, path: "/revenue", icon: <FaChartLine />, color: "#1cc88a" },
    { label: "Expire User Report", value: `Expired: ${data.expire}`, path: "/expired", icon: <FaUserClock />, color: "#f6c23e" },
    { label: "Online Renew List", value: `Renewals: 0`, path: "/renews", icon: <FaRedoAlt />, color: "#36b9cc" },
  ];

  return (
    <div className="reports-master-wrapper">
      {isLoading ? (
        <div className="reports-loading-overlay">
          <div className="spinner-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p>Syncing Report Engine...</p>
          </div>
        </div>
      ) : (
        <div className="reports-layout-grid">
          {/* Enhanced Sidebar */}
          <aside className={`reports-sidebar-nav ${isSpecificReport ? "is-collapsed" : ""}`}>
            <div className="sidebar-header" onClick={() => { setText(1.1); navigate("/dashboard/reports"); }}>
              <div className="header-icon"><FaHistory /></div>
              <div className="header-text">
                <h4>Subscriber Reports</h4>
                <span>Partner Portal</span>
              </div>
            </div>

            <nav className="reports-menu">
              {navItems.map((item, idx) => {
                const isActive = location.pathname.includes(item.path);
                return (
                  <div 
                    key={idx} 
                    className={`menu-item-card ${isActive ? 'active' : ''}`}
                    onClick={() => { setText(0); navigate(`/dashboard/reports${item.path}`); }}
                  >
                    <div className="item-icon" style={{ color: item.color }}>{item.icon}</div>
                    <div className="item-details">
                      <span className="item-label">{item.label}</span>
                      <span className="item-stat">{item.value}</span>
                    </div>
                    <FaChevronRight className="arrow-icon" />
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className={`reports-view-port ${isSpecificReport ? "is-expanded" : ""}`}>
            <div className="content-card shadow-sm">
              <Routes>
                <Route path="/" element={<ReportDash />} />
                <Route path="/tickets/*" element={<TicketdataDash />} />
                <Route path="/revenue/*" element={<RevenueDash />} />
                <Route path="/expired/*" element={<ExpiredDash />} />
                <Route path="/dueamount/*" element={<DueDash />} />
              </Routes>
            </div>
          </main>
        </div>
      )}

      <style>{`
        .reports-master-wrapper {
          background-color: #f0f2f5;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .reports-layout-grid {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Sidebar Styling */
        .reports-sidebar-nav {
          width: 320px;
          background: #fff;
          border-right: 1px solid #e3e6f0;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }

        .reports-sidebar-nav.is-collapsed {
          width: 0;
          opacity: 0;
          pointer-events: none;
        }

        .sidebar-header {
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          background: linear-gradient(to right, #ffffff, #f8f9fc);
          border-bottom: 1px solid #f1f1f1;
        }

        .header-icon {
          font-size: 24px;
          color: #4e73df;
        }

        .header-text h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #2e384d;
        }

        .header-text span {
          font-size: 12px;
          color: #a0aec0;
          font-weight: 600;
        }

        .reports-menu {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .menu-item-card {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #f8f9fc;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          position: relative;
        }

        .menu-item-card:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #e3e6f0;
        }

        .menu-item-card.active {
          background: #4e73df;
          color: #fff;
        }

        .menu-item-card.active .item-icon,
        .menu-item-card.active .item-label,
        .menu-item-card.active .item-stat,
        .menu-item-card.active .arrow-icon {
          color: #fff !important;
        }

        .item-icon {
          font-size: 20px;
          margin-right: 15px;
          width: 25px;
          display: flex;
          justify-content: center;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .item-label {
          font-size: 14px;
          font-weight: 700;
          color: #4a5568;
        }

        .item-stat {
          font-size: 12px;
          font-weight: 600;
          color: #718096;
        }

        .arrow-icon {
          font-size: 12px;
          color: #cbd5e0;
        }

        /* Main View Port */
        .reports-view-port {
          flex: 1;
          padding: 0px;
          overflow-y: auto;
          background: #f8f9fc;
          transition: all 0.4s ease;
        }

        .content-card {
          background: transparent;
          min-height: 100%;
        }

        /* Loading State */
        .reports-loading-overlay {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
        }

        .spinner-center {
          text-align: center;
        }

        .spinner-center p {
          margin-top: 15px;
          font-weight: 600;
          color: #4e73df;
          letter-spacing: 0.5px;
        }

        @media (max-width: 992px) {
          .reports-sidebar-nav {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
          }
          .reports-sidebar-nav.is-collapsed {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}