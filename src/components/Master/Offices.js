import React, { useState, useEffect } from "react";
import OfficeModal from "./OfficeModal";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { FaBuilding, FaPlus, FaMapMarkedAlt, FaCompass, FaExternalLinkAlt } from 'react-icons/fa';

export default function Offices() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayoffice, setArrayOffice] = useState([]);

  const fetchOffices = async () => {
    try {
      const response = await API.get(`/master/offices?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to load Offices", { autoClose: 2000 });

      setArrayOffice(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Error connecting to server");
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  return (
    <div className="offices-container">
      <ToastContainer position="top-right" />
      
      {/* Redesigned Header */}
      <div className="offices-header-card">
        <div className="header-info">
          <div className="header-icon">
            <FaBuilding />
          </div>
          <div className="header-text">
            <h5>Office Directory</h5>
            <p>Manage physical branch locations and GPS coordinates</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_OFFICE")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="add-office-btn"
        >
          <FaPlus /> <span>Register Office</span>
        </button>
      </div>

      <OfficeModal 
        show={showModal} 
        notshow={() => {
            setShowModal(false);
            fetchOffices(); // Auto-refresh list after modal interaction
        }} 
      />

      {/* Main Content Area */}
      <div className="offices-content-card">
        <div className="table-wrapper">
          <table className="modern-office-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Office Name</th>
                <th><FaMapMarkedAlt className="me-2" /> Address</th>
                <th><FaCompass className="me-2" /> Lat / Long</th>
                <th className="desktop-only"></th>
              </tr>
            </thead>

            <tbody>
              {arrayoffice.length > 0 ? (
                arrayoffice.map((office, index) => (
                  <tr key={office.name}>
                    <td className="cell-rank">
                      <span className="mobile-label">S.No:</span>
                      {index + 1}
                    </td>
                    <td className="cell-name">
                      <span className="mobile-label">Office:</span>
                      <span className="office-link-text">{office.name}</span>
                    </td>
                    <td className="cell-address">
                      <span className="mobile-label">Address:</span>
                      {office.address}
                    </td>
                    <td className="cell-coords">
                      <span className="mobile-label">Coordinates:</span>
                      <span className="coord-badge">{office.lat}</span>
                      <span className="coord-divider">/</span>
                      <span className="coord-badge">{office.long}</span>
                    </td>
                    <td className="desktop-only text-end">
                       <FaExternalLinkAlt className="faint-icon" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No office locations found for this partner.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .offices-container {
          padding: 1.5rem;
          background-color: #f4f7fa;
          min-height: 100vh;
        }

        /* Header Card Styling */
        .offices-header-card {
          background: #ffffff;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
          border-left: 6px solid #10b981;
        }

        .header-info { display: flex; align-items: center; gap: 1.25rem; }
        .header-icon {
          width: 50px; height: 50px; background: #ecfdf5; color: #10b981;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }
        .header-text h5 { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.2rem; }
        .header-text p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .add-office-btn {
          background: #10b981; color: white; border: none; padding: 12px 24px;
          border-radius: 10px; font-weight: 700; display: flex; align-items: center;
          gap: 10px; transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
        }
        .add-office-btn:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(16, 185, 129, 0.2); }

        /* Table Area Styling */
        .offices-content-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .modern-office-table { width: 100%; border-collapse: collapse; }
        .modern-office-table thead th {
          background: #f8fafc; padding: 1.25rem 1.5rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; color: #475569; 
          font-weight: 700; border-bottom: 2px solid #f1f5f9;
        }

        .modern-office-table tbody tr { border-bottom: 1px solid #f8fafc; transition: 0.2s; }
        .modern-office-table tbody tr:hover { background: #f0fdf4; }

        .modern-office-table td { padding: 1.2rem 1.5rem; font-size: 0.95rem; color: #334155; vertical-align: middle; }
        
        .office-link-text { color: #059669; font-weight: 700; text-decoration: underline; cursor: pointer; }
        .cell-rank { color: #94a3b8; font-weight: 600; width: 60px; }
        .cell-address { max-width: 350px; color: #64748b; line-height: 1.4; }
        .coord-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-weight: 600; color: #475569; }
        .coord-divider { margin: 0 8px; color: #cbd5e1; }
        
        .faint-icon { color: #cbd5e1; font-size: 0.8rem; }
        .empty-row { text-align: center; padding: 4rem !important; color: #94a3b8; font-style: italic; }

        .mobile-label { display: none; }

        /* Responsive Mobile Layout */
        @media (max-width: 992px) {
          .offices-container { padding: 10px; }
          .offices-header-card { flex-direction: column; gap: 1.5rem; text-align: center; padding: 2rem 1.5rem; }
          .header-info { flex-direction: column; }
          .add-office-btn { width: 100%; justify-content: center; }

          .modern-office-table thead { display: none; }
          .modern-office-table, .modern-office-table tbody, .modern-office-table tr, .modern-office-table td {
            display: block; width: 100%;
          }
          .modern-office-table tr { 
            margin-bottom: 1.5rem; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.2rem; background: #fff;
          }
          .modern-office-table td { 
            display: flex; justify-content: space-between; align-items: flex-start;
            padding: 8px 0; border: none; text-align: right;
          }
          .modern-office-table td:not(:last-child) { border-bottom: 1px dashed #f1f5f9; padding-bottom: 12px; margin-bottom: 8px; }
          
          .mobile-label { 
            display: block; font-weight: 800; color: #94a3b8; font-size: 0.7rem; 
            text-transform: uppercase; text-align: left; 
          }
          .desktop-only { display: none; }
          .cell-address { max-width: 60%; }
        }
      `}</style>
    </div>
  );
}