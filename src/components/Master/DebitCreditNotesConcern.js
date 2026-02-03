import React, { useState, useEffect } from "react";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import DebitCreditNoteModal from "./DebitCreditNoteModal";
import { usePermissions } from "../PermissionProvider";
import { FaFileInvoiceDollar, FaPlus, FaCalendarAlt, FaHashtag, FaInfoCircle } from 'react-icons/fa';

export default function DebitCreditNotesConcern() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayticket, setArrayTicket] = useState([]);

  const fetchDBCocerns = async () => {
    try {
      const response = await API.get(`/master/debit-credit?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to Load Particulars", { autoClose: 2000 });

      setArrayTicket(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Error fetching data");
    }
  };

  useEffect(() => {
    fetchDBCocerns();
  }, []);

  return (
    <div className="dc-container">
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Header Section */}
      <div className="dc-header-card">
        <div className="dc-title-section">
          <div className="dc-icon-circle">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h5 className="dc-main-title">Debit & Credit Particulars</h5>
            <p className="dc-subtitle">Manage accounting categories and transaction reasons</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_DEBIT_CREDIT_CONCERN")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="dc-add-btn"
        >
          <FaPlus /> <span>Add Concern</span>
        </button>
      </div>

      <DebitCreditNoteModal
        show={showModal}
        notshow={() => {
          setShowModal(false);
          fetchDBCocerns(); // Refresh list after adding
        }}
      />

      {/* Table Section */}
      <div className="dc-table-wrapper">
        <div className="dc-table-responsive">
          <table className="dc-custom-table">
            <thead>
              <tr>
                <th><FaHashtag className="me-2" />S. No.</th>
                <th><FaInfoCircle className="me-2" />Particular Name</th>
                <th><FaCalendarAlt className="me-2" />Added On</th>
              </tr>
            </thead>

            <tbody>
              {arrayticket.length > 0 ? (
                arrayticket.map(({ name, createdAt }, index) => (
                  <tr key={index}>
                    <td className="dc-sn-cell">
                      <span className="mobile-label">S.No:</span>
                      {index + 1}
                    </td>
                    <td className="dc-name-cell">
                      <span className="mobile-label">Name:</span>
                      <span className="dc-particular-link">{name}</span>
                    </td>
                    <td className="dc-date-cell">
                      <span className="mobile-label">Date:</span>
                      {new Date(createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="dc-empty-state">
                    No Concerns Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .dc-container {
          padding: 1.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Header Styling */
        .dc-header-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          border-left: 6px solid #10b981;
        }

        .dc-title-section { display: flex; align-items: center; gap: 1rem; }
        .dc-icon-circle {
          width: 45px; height: 45px; background: #ecfdf5; color: #10b981;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .dc-main-title { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.1rem; }
        .dc-subtitle { margin: 0; font-size: 0.85rem; color: #64748b; }

        .dc-add-btn {
          background: #10b981; color: white; border: none; padding: 10px 20px;
          border-radius: 10px; font-weight: 600; display: flex; align-items: center;
          gap: 8px; transition: 0.2s;
        }
        .dc-add-btn:hover { background: #059669; transform: translateY(-1px); }

        /* Table Styling */
        .dc-table-wrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .dc-custom-table { width: 100%; border-collapse: collapse; }
        .dc-custom-table thead th {
          background: #f1f5f9; padding: 1rem 1.5rem; text-align: left;
          font-size: 0.8rem; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;
        }

        .dc-custom-table tbody td {
          padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9;
          font-size: 0.95rem; color: #334155;
        }

        .dc-particular-link { color: #2563eb; font-weight: 600; text-decoration: underline; cursor: pointer; }
        .dc-sn-cell { color: #64748b; font-weight: 500; }
        .dc-date-cell { color: #475569; font-weight: 500; }

        .mobile-label { display: none; }

        .dc-empty-state { text-align: center; padding: 3rem !important; color: #94a3b8; font-style: italic; }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .dc-container { padding: 10px; }
          .dc-header-card { flex-direction: column; gap: 1rem; align-items: stretch; text-align: center; }
          .dc-title-section { flex-direction: column; }
          .dc-add-btn { justify-content: center; width: 100%; padding: 15px; }

          /* Force table to not be a table */
          .dc-custom-table thead { display: none; }
          .dc-custom-table, .dc-custom-table tbody, .dc-custom-table tr, .dc-custom-table td {
            display: block; width: 100%;
          }

          .dc-custom-table tr {
            margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 10px; background: #fff;
          }

          .dc-custom-table td {
            display: flex; justify-content: space-between; align-items: center;
            border: none; padding: 8px 10px; text-align: right;
          }

          .mobile-label {
            display: block; font-weight: 700; color: #64748b;
            text-transform: uppercase; font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}