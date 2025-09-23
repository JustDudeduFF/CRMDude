import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import ReportDash from "./ReportDash";
import axios from "axios";
import { api, api2 } from "../FirebaseConfig";
import TicketdataDash from "./TicketData/TicketdataDash";
import RevenueDash from "./ExpiredData/RevenueDash";
import ExpiredDash from "./ExpiredData/ExpiredDash";
import DueDash from "./ExpiredData/DueDash";
import { toast } from "react-toastify";
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

  // Check if current route is any specific report (not the main reports page)
  const isSpecificReport =
    location.pathname !== "/dashboard/reports" &&
    location.pathname.includes("/reports");

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        api2 + "/reports/dash?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to fetch Data", {
          autoClose: 2000,
          position: "top-right",
        });

      const data = response.data;

      setData({
        ticket: data.ticketCount,
        expire: data.expiredCount,
        due: data.totalDue,
        revenue: data.totalRevenue,
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

  return (
    <>
      {isLoading ? (
        <div className="reports-loading-container">
          <div className="spinner-border reports-loading-spinner" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="reports-loading-text">Loading Reports data...</p>
        </div>
      ) : (
        <div className="reports-container">
          <div className="reports-content">
            <div className="reports-header">
              <h3
                onClick={() => {
                  setText(1.1);
                  navigate("/dashboard/reports");
                }}
                className="reports-title"
              >
                Subscriber Reports
              </h3>
            </div>

            <div className="reports-layout">
              <div
                className={`reports-sidebar ${isSpecificReport ? "reports-sidebar-hidden" : ""
                  }`}
                style={{ flex: `${text}` }}
              >
                <ul className="reports-list">
                  <li
                    onClick={() => {
                      setText(0);
                      navigate("/dashboard/reports/tickets");
                    }}
                    className="reports-list-item"
                  >
                    <div className="reports-item-title">Tickets</div>
                    <div className="reports-item-value">{`Open Tickets : ${data.ticket}`}</div>
                  </li>

                  <li
                    onClick={() => {
                      setText(0);
                      navigate("/dashboard/reports/dueamount");
                    }}
                    className="reports-list-item"
                  >
                    <div className="reports-item-title">Due Amount</div>
                    <div className="reports-item-value">{`Total Due : ₹${formatRevenue(data.due)}`}</div>
                  </li>

                  <li
                    onClick={() => {
                      setText(0);
                      navigate("/dashboard/reports/revenue");
                    }}
                    className="reports-list-item"
                  >
                    <div className="reports-item-title">Payment Revenue</div>
                    <div className="reports-item-value">{`Mon Revenue : ₹${formatRevenue(data.revenue)}`}</div>
                  </li>

                  <li
                    onClick={() => {
                      setText(0);
                      navigate("/dashboard/reports/expired");
                    }}
                    className="reports-list-item"
                  >
                    <div className="reports-item-title">Expire User Report</div>
                    <div className="reports-item-value">{`Month Expired : ${data.expire}`}</div>
                  </li>

                  <li
                    onClick={() => {
                      setText(0);
                      navigate("/dashboard/reports/renews");
                    }}
                    className="reports-list-item"
                  >
                    <div className="reports-item-title">Online Renew List</div>
                    <div className="reports-item-value">{`Month Renews: ${0}`}</div>
                  </li>
                </ul>
              </div>

              <div
                className={`reports-main-content ${isSpecificReport ? "reports-main-content-expanded" : ""
                  }`}
              >
                <Routes>
                  <Route path="/" element={<ReportDash />} />
                  <Route path="/tickets/*" element={<TicketdataDash />} />
                  <Route path="/revenue/*" element={<RevenueDash />} />
                  <Route path="/expired/*" element={<ExpiredDash />} />
                  <Route path="/dueamount/*" element={<DueDash />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
