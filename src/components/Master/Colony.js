import React, { useState, useEffect } from "react";
import ColonyModal from "./ColonyModal";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { FaMapMarkerAlt, FaPlus, FaCity, FaHashtag } from 'react-icons/fa';

export default function Colony() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraycolony, setArrayColony] = useState([]);

  const fetchColony = async () => {
    try {
      const response = await API.get(`/master/colony?partnerId=${partnerId}`);
      if (response.status !== 200) {
        return toast.error("Failed to load Colony");
      }
      setArrayColony(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Error fetching Colony data");
    }
  };

  useEffect(() => {
    fetchColony();
  }, []);

  return (
    <div className="colony-dashboard-wrapper">
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Header Section */}
      <div className="colony-header-card">
        <div className="title-area">
          <div className="icon-circle">
            <FaMapMarkerAlt />
          </div>
          <div className="text-content">
            <h2>Location Management</h2>
            <p>Manage company colonies and addresses</p>
          </div>
        </div>
        <button
          onClick={() =>
            hasPermission("ADD_COLONY")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="add-colony-btn"
        >
          <FaPlus /> <span>Add New Colony</span>
        </button>
      </div>

      <ColonyModal show={showModal} notshow={() => setShowModal(false)} />

      {/* Table Section */}
      <div className="colony-table-container">
        <table className="colony-styled-table">
          <thead>
            <tr>
              <th className="hide-on-mobile" style={{ width: "100px" }}><FaHashtag /> S. No.</th>
              <th><FaMapMarkerAlt /> Colony Name</th>
              <th><FaCity /> Under Company</th>
            </tr>
          </thead>

          <tbody>
            {arraycolony.length > 0 ? (
              arraycolony.map(({ name, undercompany }, index) => (
                <tr key={name}>
                  <td className="sn-column hide-on-mobile">{index + 1}</td>
                  <td className="colony-name-column" data-label="Colony">
                    <span className="name-link">{name}</span>
                  </td>
                  <td className="company-column" data-label="Company">
                    <span className="company-badge">{undercompany}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-state">
                  No colony data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        /* Desktop & General Styles */
        .colony-dashboard-wrapper {
          padding: 2rem;
          background: #fdfdfd;
          min-height: 100vh;
        }

        .colony-header-card {
          background: #ffffff;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          border-left: 5px solid #10b981;
        }

        .title-area { display: flex; align-items: center; gap: 1.2rem; }
        
        .icon-circle {
          background: #ecfdf5;
          color: #10b981;
          min-width: 45px;
          height: 45px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .title-area p { margin: 0; font-size: 0.875rem; color: #64748b; }

        .add-colony-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .colony-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .colony-styled-table { width: 100%; border-collapse: collapse; }
        .colony-styled-table thead th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #475569;
          border-bottom: 2px solid #f1f5f9;
        }

        .colony-styled-table tbody td {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.95rem;
          color: #334155;
        }

        .name-link { color: #2563eb; font-weight: 600; cursor: pointer; }
        .company-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Mobile Specific Responsiveness */
        @media (max-width: 768px) {
          .colony-dashboard-wrapper { padding: 1rem; }
          
          .colony-header-card {
            flex-direction: column;
            gap: 1.5rem;
            align-items: flex-start;
            padding: 1.2rem;
          }

          .add-colony-btn { width: 100%; justify-content: center; }
          .title-area p { font-size: 0.75rem; }

          /* Force table to not be a table */
          .colony-styled-table thead { display: none; } /* Hide headers */
          
          .colony-styled-table, 
          .colony-styled-table tbody, 
          .colony-styled-table tr, 
          .colony-styled-table td { 
            display: block; 
            width: 100%; 
          }

          .colony-styled-table tr {
            margin-bottom: 1rem;
            border: 1px solid #f1f5f9;
            border-radius: 10px;
            padding: 0.5rem 0;
          }

          .colony-styled-table td {
            text-align: right;
            padding: 0.8rem 1rem;
            position: relative;
            border-bottom: 1px solid #f8fafc;
          }

          .colony-styled-table td:last-child { border-bottom: none; }

          /* Create labels for the "fake" table */
          .colony-styled-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 1rem;
            width: 45%;
            text-align: left;
            font-weight: 700;
            font-size: 0.8rem;
            color: #94a3b8;
            text-transform: uppercase;
          }

          .hide-on-mobile { display: none !important; }
          
          .company-badge { display: inline-block; }
        }
      `}</style>
    </div>
  );
}