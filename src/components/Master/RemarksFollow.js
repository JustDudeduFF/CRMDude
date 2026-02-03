import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import RemarkFollowModal from "./RemarkFollowModal";
import { API } from "../../FirebaseConfig";
import { MessageSquareText, Plus, Calendar, Hash, ChevronRight } from "lucide-react";

export default function RemarksFollow() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const [arrayticket, setArrayTicket] = useState([]);

  const fetchRMConcerns = async () => {
    try {
      const response = await API.get(`/master/remark-follow?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to Load Concerns", { autoClose: 2000 });

      setArrayTicket(response.data);
    } catch (e) {
      console.error(e);
      toast.error("Network Error: Could not fetch concerns");
    }
  };

  useEffect(() => {
    fetchRMConcerns();
  }, []);

  return (
    <div className="rm-container">
      <ToastContainer position="top-right" />
      
      {/* Dynamic Header Section */}
      <div className="rm-header-card">
        <div className="rm-header-info">
          <div className="rm-icon-wrapper">
            <MessageSquareText size={24} />
          </div>
          <div>
            <h5 className="rm-title">Remark & Follow-up Concerns</h5>
            <p className="rm-subtitle">Define categories for ticketing and follow-up tracking</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="rm-add-btn"
        >
          <Plus size={18} />
          <span>Add Concern</span>
        </button>
      </div>

      {/* Modal Integration */}
      <RemarkFollowModal 
        show={showModal} 
        notshow={(success) => {
          setShowModal(false);
          if(success === true) fetchRMConcerns(); // Refresh list on success
        }} 
      />

      {/* Responsive Content Area */}
      <div className="rm-content-wrapper">
        <div className="rm-table-responsive">
          <table className="rm-table">
            <thead>
              <tr>
                <th><Hash size={14} className="me-1" /> S.No.</th>
                <th>Concern Name</th>
                <th><Calendar size={14} className="me-1" /> Added On</th>
                <th className="desktop-only">Status</th>
              </tr>
            </thead>

            <tbody>
              {arrayticket.length > 0 ? (
                arrayticket.map(({ name, createdAt }, index) => (
                  <tr key={name || index}>
                    <td className="rm-td-index">
                      <span className="mobile-label">Index:</span>
                      {index + 1}
                    </td>
                    <td className="rm-td-name">
                      <span className="mobile-label">Concern:</span>
                      <span className="rm-name-highlight">{name}</span>
                    </td>
                    <td className="rm-td-date">
                      <span className="mobile-label">Date:</span>
                      {new Date(createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="desktop-only">
                      <div className="rm-status-badge">Active</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="rm-empty-state">
                    <div className="empty-content">
                      <MessageSquareText size={40} />
                      <p>No concerns available. Start by adding a new one.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .rm-container { padding: 1.5rem; background: #f8fafc; min-height: 100vh; }

        /* Header Styling */
        .rm-header-card {
          background: #ffffff; padding: 1.5rem 2rem; border-radius: 16px;
          display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 2rem;
          border-left: 5px solid #f59e0b;
        }
        .rm-header-info { display: flex; align-items: center; gap: 1rem; }
        .rm-icon-wrapper { 
          background: #fff7ed; color: #f59e0b; padding: 12px; border-radius: 12px;
        }
        .rm-title { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.2rem; }
        .rm-subtitle { margin: 0; font-size: 0.85rem; color: #64748b; }

        .rm-add-btn {
          background: #f59e0b; color: white; border: none; padding: 10px 20px;
          border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.2s;
        }
        .rm-add-btn:hover { background: #d97706; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }

        /* Table Styling */
        .rm-content-wrapper { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .rm-table { width: 100%; border-collapse: collapse; }
        .rm-table thead { background: #fdfaf6; }
        .rm-table th { 
          padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; 
          text-transform: uppercase; color: #92400e; font-weight: 700;
          border-bottom: 1px solid #fef3c7;
        }
        .rm-table td { padding: 1.2rem 1.5rem; font-size: 0.95rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
        .rm-table tbody tr:hover { background: #fffcf0; }

        .rm-name-highlight { color: #2563eb; font-weight: 600; text-decoration: underline; cursor: pointer; }
        .rm-status-badge { 
          background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; 
          font-size: 0.75rem; font-weight: 700; display: inline-block;
        }

        .rm-empty-state { text-align: center; padding: 4rem !important; color: #94a3b8; }
        .empty-content { display: flex; flex-direction: column; align-items: center; gap: 10px; }

        .mobile-label { display: none; }

        @media (max-width: 768px) {
          .rm-container { padding: 1rem; }
          .rm-header-card { flex-direction: column; text-align: center; gap: 1.5rem; }
          .rm-header-info { flex-direction: column; }
          .rm-add-btn { width: 100%; justify-content: center; }

          .rm-table thead { display: none; }
          .rm-table tr { 
            display: block; margin: 1rem; border: 1px solid #f1f5f9; 
            border-radius: 12px; padding: 1rem; background: #fff;
          }
          .rm-table td { 
            display: flex; justify-content: space-between; padding: 8px 0;
            border: none; text-align: right;
          }
          .rm-table td:not(:last-child) { border-bottom: 1px dashed #f1f5f9; }
          .mobile-label { display: block; font-weight: 800; color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; text-align: left; }
          .desktop-only { display: none; }
        }
      `}</style>
    </div>
  );
}