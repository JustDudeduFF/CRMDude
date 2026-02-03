import React, { useState, useEffect } from "react";
import DesignationModal from "./DesignationModal";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { FaUserShield, FaPlus, FaCalendarAlt, FaIdBadge, FaChevronRight } from 'react-icons/fa';

export default function Designation() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraydesignation, setArraydesignation] = useState([]);

  const fetchDesignations = async () => {
    try {
      const response = await API.get(`/master/designations?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to load Designations", { autoClose: 2000 });

      setArraydesignation(response.data);
    } catch (e) {
      console.log(e);
      toast.error("An error occurred while fetching designations");
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <div className="designation-master-container">
      <ToastContainer position="top-right" />
      
      {/* Dynamic Header Section */}
      <div className="designation-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <FaUserShield />
          </div>
          <div className="text-wrapper">
            <h5>Designation Master</h5>
            <p>Manage organizational hierarchy and role definitions</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_DESIGNATION")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="add-designation-btn"
        >
          <FaPlus /> <span>Add New Designation</span>
        </button>
      </div>

      <DesignationModal 
        show={showModal} 
        notshow={() => {
            setShowModal(false);
            fetchDesignations(); // Refresh list on close
        }} 
      />

      {/* Main Table/Grid Section */}
      <div className="designation-card">
        <div className="table-responsive-wrapper">
          <table className="modern-designation-table">
            <thead>
              <tr>
                <th><FaIdBadge className="me-2" /> S. No.</th>
                <th>Designation Name</th>
                <th><FaCalendarAlt className="me-2" /> Add Date</th>
                <th className="d-mobile-none"></th>
              </tr>
            </thead>

            <tbody>
              {arraydesignation.length > 0 ? (
                arraydesignation.map(({ name, createdAt }, index) => (
                  <tr key={index}>
                    <td className="sn-column">
                      <span className="mobile-only-label">Rank:</span>
                      {index + 1}
                    </td>
                    <td className="name-column">
                      <span className="mobile-only-label">Designation:</span>
                      <span className="designation-pill">{name}</span>
                    </td>
                    <td className="date-column">
                      <span className="mobile-only-label">Created:</span>
                      {new Date(createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td className="action-column d-mobile-none">
                        <FaChevronRight className="faint-arrow" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No designations found for this partner.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .designation-master-container {
          padding: 1.5rem;
          background: #f1f5f9;
          min-height: 100vh;
        }

        /* Header Style */
        .designation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          padding: 1.25rem 2rem;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .header-content { display: flex; gap: 1rem; align-items: center; }
        .icon-wrapper {
          width: 48px; height: 48px; background: #e0f2fe; color: #0369a1;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }
        .text-wrapper h5 { margin: 0; font-weight: 800; color: #0f172a; font-size: 1.15rem; }
        .text-wrapper p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .add-designation-btn {
          background: #0f172a; color: white; border: none; padding: 12px 24px;
          border-radius: 10px; font-weight: 600; display: flex; align-items: center;
          gap: 10px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-designation-btn:hover { background: #334155; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }

        /* Table Card */
        .designation-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .modern-designation-table { width: 100%; border-collapse: collapse; }
        .modern-designation-table thead th {
          background: #f8fafc; padding: 1.25rem 1.5rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;
          border-bottom: 2px solid #f1f5f9;
        }

        .modern-designation-table tbody tr { transition: 0.2s; border-bottom: 1px solid #f8fafc; }
        .modern-designation-table tbody tr:hover { background: #f0f9ff; }

        .modern-designation-table td { padding: 1.25rem 1.5rem; color: #1e293b; font-size: 0.95rem; }

        .designation-pill {
          background: #f1f5f9; color: #2563eb; padding: 6px 14px;
          border-radius: 20px; font-weight: 600; text-decoration: underline;
        }

        .sn-column { font-weight: 700; color: #94a3b8; }
        .date-column { color: #64748b; font-weight: 500; }
        .faint-arrow { color: #cbd5e1; }
        .empty-state { text-align: center; padding: 4rem !important; color: #94a3b8; font-style: italic; }

        .mobile-only-label { display: none; }

        @media (max-width: 768px) {
          .designation-master-container { padding: 10px; }
          .designation-header { 
            flex-direction: column; gap: 1.25rem; text-align: center; padding: 1.5rem;
          }
          .header-content { flex-direction: column; }
          .add-designation-btn { width: 100%; justify-content: center; }

          .modern-designation-table thead { display: none; }
          .modern-designation-table, .modern-designation-table tbody, .modern-designation-table tr, .modern-designation-table td {
            display: block; width: 100%;
          }
          .modern-designation-table tr { 
            margin-bottom: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem;
          }
          .modern-designation-table td { 
            display: flex; justify-content: space-between; padding: 8px 0; border: none;
          }
          .mobile-only-label { display: block; font-weight: 700; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
          .d-mobile-none { display: none; }
          .designation-pill { background: transparent; padding: 0; }
        }
      `}</style>
    </div>
  );
}