import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import TicketModal from "./TicketModal";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { LifeBuoy, Plus, Calendar, Tag, AlertCircle, Search } from "lucide-react";

export default function TicketConcerns() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayticket, setArrayTicket] = useState([]);

  const fetchTickets = async () => {
    try {
      const response = await API.get(`/master/ticketconcern?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to Load Ticket Concerns", {
          autoClose: 2000,
        });

      setArrayTicket(response.data);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while fetching concerns.");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="tc-page-container">
      <ToastContainer position="top-right" />
      
      {/* Header Section */}
      <div className="tc-glass-header">
        <div className="tc-header-content">
          <div className="tc-icon-wrapper">
            <LifeBuoy size={28} />
          </div>
          <div className="tc-text-stack">
            <h5 className="tc-main-title">Support Ticket Concerns</h5>
            <p className="tc-sub-title">Define and manage categories for incoming support requests</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_TICKET_CONCERNS")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="tc-action-btn"
        >
          <Plus size={18} />
          <span>Add Concern</span>
        </button>
      </div>

      <TicketModal 
        show={showModal} 
        notshow={(status) => {
            setShowModal(false);
            if(status === true) fetchTickets(); // Refresh list if a new concern was added
        }} 
      />

      {/* Main Content */}
      <div className="tc-table-card">
        <div className="tc-table-responsive">
          <table className="tc-custom-table">
            <thead>
              <tr>
                <th><Tag size={14} className="me-2" /> S. No.</th>
                <th>Concern Name</th>
                <th><Calendar size={14} className="me-2" /> Registered Date</th>
                <th className="desktop-only text-end">Trend</th>
              </tr>
            </thead>

            <tbody>
              {arrayticket.length > 0 ? (
                arrayticket.map(({ ticketname, date }, index) => (
                  <tr key={ticketname || index}>
                    <td className="tc-td-index">
                      <span className="mobile-label">S.No:</span>
                      {index + 1}
                    </td>
                    <td className="tc-td-name">
                      <span className="mobile-label">Concern:</span>
                      <span className="tc-name-link">{ticketname}</span>
                    </td>
                    <td className="tc-td-date">
                      <span className="mobile-label">Date:</span>
                      {new Date(date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="desktop-only text-end">
                      <span className="tc-status-dot"></span>
                      <span className="tc-faint-text">System Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="tc-empty-state">
                    <AlertCircle size={32} className="mb-2" />
                    <p>No Ticket Concerns Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .tc-page-container {
          padding: 2rem;
          background: #f1f5f9;
          min-height: 100vh;
        }

        .tc-glass-header {
          background: #ffffff;
          padding: 1.5rem 2.5rem;
          border-radius: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border-left: 6px solid #ef4444;
        }

        .tc-header-content { display: flex; align-items: center; gap: 1.5rem; }
        
        .tc-icon-wrapper {
          width: 56px; height: 56px; background: #fee2e2; color: #ef4444;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
        }

        .tc-main-title { margin: 0; font-weight: 800; color: #0f172a; font-size: 1.25rem; letter-spacing: -0.02em; }
        .tc-sub-title { margin: 0; font-size: 0.85rem; color: #64748b; }

        .tc-action-btn {
          background: #0f172a; color: white; border: none; padding: 12px 24px;
          border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.3s;
        }

        .tc-action-btn:hover { background: #334155; transform: scale(1.02); }

        .tc-table-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .tc-custom-table { width: 100%; border-collapse: collapse; }
        .tc-custom-table thead th {
          background: #f8fafc; padding: 1.25rem 2rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; color: #64748b;
          font-weight: 800; border-bottom: 1px solid #e2e8f0;
        }

        .tc-custom-table td { padding: 1.25rem 2rem; font-size: 0.95rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .tc-custom-table tbody tr:hover { background: #fdf2f2; }

        .tc-name-link { color: #dc2626; font-weight: 700; text-decoration: underline; cursor: pointer; }
        .tc-status-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; margin-right: 8px; }
        .tc-faint-text { color: #94a3b8; font-size: 0.85rem; font-weight: 600; }

        .tc-empty-state { text-align: center; padding: 5rem !important; color: #cbd5e1; }
        .mobile-label { display: none; }

        @media (max-width: 991px) {
          .tc-page-container { padding: 1rem; }
          .tc-glass-header { flex-direction: column; gap: 1.5rem; text-align: center; padding: 2rem; }
          .tc-header-content { flex-direction: column; }
          .tc-action-btn { width: 100%; justify-content: center; }

          .tc-custom-table thead { display: none; }
          .tc-custom-table tr { 
            display: block; margin: 1rem; border: 1px solid #e2e8f0; 
            border-radius: 15px; padding: 1rem; background: #fff;
          }
          .tc-custom-table td { 
            display: flex; justify-content: space-between; padding: 10px 0;
            border: none; text-align: right; font-size: 0.9rem;
          }
          .tc-custom-table td:not(:last-child) { border-bottom: 1px dashed #f1f5f9; }
          .mobile-label { display: block; font-weight: 800; color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; }
          .desktop-only { display: none; }
        }
      `}</style>
    </div>
  );
}