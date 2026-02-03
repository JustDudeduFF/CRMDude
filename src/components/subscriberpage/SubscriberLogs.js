import React, { useEffect, useState } from "react";
import { API } from "../../FirebaseConfig";
import { FaHistory, FaUserEdit, FaCalendarDay, FaListAlt } from "react-icons/fa";

export default function SubscriberLogs() {
  const username = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const [logArray, setLogArray] = useState([]);
  const [usersLookup, setUsersLookup] = useState({});

  const fetchlogs = async () => {
    try {
      const response = await API.get(`/subscriber/logs/${username}`);
      setLogArray(response.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const fetchusers = async () => {
    let maping = {};
    try {
      const response = await API.get(
        `/subscriber/users?partnerId=${partnerId}`
      );
      const data = response.data;
      Object.keys(data).forEach((key) => {
        const user = data[key];
        maping[user.empmobile] = user.empname;
      });
      setUsersLookup(maping);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchlogs();
    fetchusers();
  }, []);

  return (
    <div className="logs-master-wrapper">
      {/* Header Card */}
      <div className="logs-header-card shadow-sm">
        <div className="d-flex align-items-center">
          <div className="logs-icon-box">
            <FaHistory />
          </div>
          <div>
            <h2 className="logs-main-title">Subscriber Activity Logs</h2>
            <p className="logs-subtitle">Detailed history of profile updates and interactions</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="logs-content-body shadow-sm">
        <div className="table-responsive">
          <table className="logs-modern-table">
            <thead>
              <tr>
                <th><FaCalendarDay className="me-2" /> Date</th>
                <th><FaListAlt className="me-2" /> Description</th>
                <th><FaUserEdit className="me-2" /> Updated By</th>
              </tr>
            </thead>
            <tbody>
              {logArray.length > 0 ? (
                logArray.map((data, index) => (
                  <tr key={index}>
                    <td className="logs-date-cell">
                      <div className="date-wrapper">
                        <span className="date-main">
                          {new Date(data.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="date-time text-muted">
                          {new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="logs-desc-cell">
                      <div className="desc-text">{data.description}</div>
                    </td>
                    <td className="logs-user-cell">
                      <span className="user-badge">
                        {usersLookup[data.modifiedby] || data.modifiedby || "System"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="logs-empty-state">
                    <div className="empty-box py-5">
                      <p className="mb-0">No logs found for this subscriber.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .logs-master-wrapper {
          padding: 20px;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .logs-header-card {
          background: white;
          border-radius: 16px;
          padding: 20px 25px;
          margin-bottom: 25px;
          border: 1px solid #eef2f6;
        }

        .logs-icon-box {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-right: 18px;
        }

        .logs-main-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .logs-subtitle {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .logs-content-body {
          background: white;
          border-radius: 16px;
          border: 1px solid #edf2f7;
          overflow: hidden;
        }

        .logs-modern-table {
          width: 100%;
          border-collapse: collapse;
        }

        .logs-modern-table thead th {
          background: #f8fafc;
          padding: 15px 20px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          border-bottom: 2px solid #e2e8f0;
        }

        .logs-modern-table tbody td {
          padding: 16px 20px;
          font-size: 14px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .date-wrapper {
          display: flex;
          flex-direction: column;
        }

        .date-main {
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
        }

        .date-time {
          font-size: 11px;
        }

        .desc-text {
          color: #334155;
          line-height: 1.5;
          font-weight: 500;
        }

        .user-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          display: inline-block;
        }

        .logs-empty-state {
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }

        .logs-modern-table tbody tr:hover {
          background-color: #fbfcfe;
        }

        @media (max-width: 768px) {
          .logs-modern-table thead { display: none; }
          .logs-modern-table tbody td {
            display: block;
            width: 100%;
            text-align: right;
            padding: 10px 20px;
            border: none;
          }
          .logs-modern-table tbody td::before {
            content: attr(data-label);
            float: left;
            font-weight: 800;
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
          }
          .logs-modern-table tbody tr {
            border-bottom: 8px solid #f8fafc;
            display: block;
          }
        }
      `}</style>
    </div>
  );
}