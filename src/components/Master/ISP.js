import React, { useState, useEffect } from "react";
import ISPModal from "./ISPModal";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaGlobe, FaPlus, FaCalendarAlt, FaUsers, FaHashtag, FaNetworkWired } from 'react-icons/fa';

export default function ISP() {
  const partnerId = localStorage.getItem("partnerId");
  const [showispmodal, setShowIspModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayisp, setArrayIsp] = useState([]);

  const fetchIsps = async () => {
    try {
      const response = await API.get(`/master/isps?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to load ISPs", { autoClose: 2000 });

      setArrayIsp(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Network error: Could not fetch ISPs");
    }
  };

  useEffect(() => {
    fetchIsps();
  }, []);

  return (
    <div className="isp-master-wrapper">
      <ToastContainer position="top-right" />
      
      {/* Dynamic Header Section */}
      <div className="isp-header-glass">
        <div className="isp-title-block">
          <div className="isp-icon-box">
            <FaNetworkWired />
          </div>
          <div>
            <h5 className="isp-title-text">ISP Directory</h5>
            <p className="isp-subtitle-text">Manage upstream providers and network gateways</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_ISP")
              ? setShowIspModal(true)
              : alert("Permission Denied")
          }
          className="isp-add-btn"
        >
          <FaPlus /> <span>Register New ISP</span>
        </button>
      </div>

      <ISPModal 
        show={showispmodal} 
        unShow={() => {
          setShowIspModal(false);
          fetchIsps(); // Refresh data on modal close
        }} 
      />

      {/* Main Table Section */}
      <div className="isp-content-card">
        <div className="isp-table-scroll-container">
          <table className="isp-modern-table">
            <thead>
              <tr>
                <th><FaHashtag /> S. No.</th>
                <th><FaGlobe /> ISP Name</th>
                <th><FaCalendarAlt /> Added Date</th>
                <th><FaUsers /> Total Users</th>
                <th><FaHashtag /> ISP Code</th>
              </tr>
            </thead>

            <tbody>
              {arrayisp.length > 0 ? (
                arrayisp.map(({ name, code, date }, index) => (
                  <tr key={code}>
                    <td className="cell-sn">
                      <span className="m-label">Rank:</span>
                      {index + 1}
                    </td>
                    <td className="cell-name">
                      <span className="m-label">ISP:</span>
                      <span className="isp-brand-name">{name}</span>
                    </td>
                    <td className="cell-date">
                      <span className="m-label">Since:</span>
                      {new Date(date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="cell-users">
                      <span className="m-label">Users:</span>
                      <span className="isp-user-count">--</span>
                    </td>
                    <td className="cell-code">
                      <span className="m-label">Code:</span>
                      <code className="isp-code-badge">{code}</code>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="isp-empty-view">
                    No Internet Service Providers found in the registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .isp-master-wrapper {
          padding: 2rem;
          background-color: #f0f4f8;
          min-height: 100vh;
        }

        /* Header Styling */
        .isp-header-glass {
          background: #ffffff;
          padding: 1.5rem 2.5rem;
          border-radius: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          border-left: 5px solid #3b82f6;
        }

        .isp-title-block { display: flex; align-items: center; gap: 1.2rem; }
        .isp-icon-box {
          width: 50px; height: 50px; background: #eff6ff; color: #3b82f6;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }

        .isp-title-text { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.2rem; letter-spacing: -0.02em; }
        .isp-subtitle-text { margin: 0; font-size: 0.85rem; color: #64748b; }

        .isp-add-btn {
          background: #3b82f6; color: white; border: none; padding: 12px 24px;
          border-radius: 12px; font-weight: 700; display: flex; align-items: center;
          gap: 10px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
        }
        .isp-add-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); }

        /* Table Card Styling */
        .isp-content-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .isp-modern-table { width: 100%; border-collapse: collapse; }
        .isp-modern-table thead th {
          background: #f8fafc; padding: 1.2rem 1.5rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; color: #475569; 
          font-weight: 700; border-bottom: 2px solid #f1f5f9;
        }

        .isp-modern-table tbody tr { border-bottom: 1px solid #f8fafc; transition: 0.2s; }
        .isp-modern-table tbody tr:hover { background: #f1f7ff; }

        .isp-modern-table td { padding: 1.3rem 1.5rem; font-size: 0.95rem; color: #334155; }
        
        .isp-brand-name { color: #2563eb; font-weight: 700; text-decoration: underline; cursor: pointer; }
        .isp-code-badge { 
          background: #f1f5f9; color: #475569; padding: 4px 8px; 
          border-radius: 6px; font-family: monospace; font-weight: 600;
        }
        .isp-user-count { color: #94a3b8; font-style: italic; }
        .cell-sn { color: #94a3b8; font-weight: 600; }

        .m-label { display: none; }
        .isp-empty-view { text-align: center; padding: 5rem !important; color: #94a3b8; }

        /* Responsive Logic */
        @media (max-width: 992px) {
          .isp-master-wrapper { padding: 10px; }
          .isp-header-glass { flex-direction: column; gap: 1.5rem; text-align: center; padding: 2rem 1.5rem; }
          .isp-title-block { flex-direction: column; }
          .isp-add-btn { width: 100%; justify-content: center; }

          /* Mobile Card View */
          .isp-modern-table thead { display: none; }
          .isp-modern-table, .isp-modern-table tbody, .isp-modern-table tr, .isp-modern-table td {
            display: block; width: 100%;
          }
          .isp-modern-table tr { 
            margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem; 
            background: #fff;
          }
          .isp-modern-table td { 
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 5px; border: none; text-align: right;
          }
          .isp-modern-table td:not(:last-child) { border-bottom: 1px dashed #f1f5f9; }
          
          .m-label { 
            display: block; font-weight: 800; color: #94a3b8; font-size: 0.7rem; 
            text-transform: uppercase; letter-spacing: 0.05em;
          }
          .isp-brand-name { text-decoration: none; }
        }
      `}</style>
    </div>
  );
}