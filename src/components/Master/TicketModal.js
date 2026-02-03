import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../../FirebaseConfig";
import { LifeBuoy, X, ShieldCheck, Info } from "lucide-react";

const TicketModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [ticketname, setticketName] = useState("");

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    if (!ticketname.trim()) {
      return toast.warn("Please enter a concern name");
    }

    const data = {
      ticketname: ticketname,
      partnerId: partnerId,
    };

    try {
      const response = await API.post(`/master/ticketconcern?partnerId=${partnerId}`, data);

      if (response.status !== 200) {
        return toast.error("Failed to Add Concerns");
      }

      toast.success("Concern added successfully");
      // Passing true back to trigger refresh in parent component
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  if (!show) return null;

  return (
    <div className="ticket-modal-overlay">
      <div className="ticket-modal-card">
        {/* Header Section */}
        <div className="ticket-modal-header">
          <div className="header-left">
            <div className="header-icon-box">
              <LifeBuoy size={22} />
            </div>
            <div>
              <h5>Add Ticket Concern</h5>
              <p>Categorize new support issues</p>
            </div>
          </div>
          <button className="header-close-btn" onClick={() => notshow(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="ticket-modal-body">
          <div className="ticket-input-group">
            <label className="ticket-label">
              Concern Name
            </label>
            <div className="input-wrapper">
              <input
                autoFocus
                onChange={(e) => {
                  setticketName(capitalizeFirstLetter(e.target.value));
                }}
                value={ticketname}
                type="text"
                placeholder="e.g. System Access Issue"
                className="ticket-input"
              />
            </div>
            <div className="ticket-info-note">
              <Info size={14} />
              <span>This category will be visible to support agents.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="ticket-modal-footer">
          <button onClick={() => notshow(false)} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleClick} className="btn-save">
            <ShieldCheck size={18} className="me-2" /> 
            Save Concern
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .ticket-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 1.25rem;
        }

        .ticket-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 450px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: ticketModalFadeUp 0.3s ease-out;
        }

        @keyframes ticketModalFadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .ticket-modal-header {
          padding: 1.5rem;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .header-left { display: flex; align-items: center; gap: 1rem; }
        
        .header-icon-box {
          width: 40px; height: 40px; background: #fee2e2; color: #ef4444;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }

        .header-left h5 { margin: 0; font-weight: 800; color: #0f172a; font-size: 1.1rem; }
        .header-left p { margin: 0; font-size: 0.8rem; color: #64748b; }

        .header-close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .header-close-btn:hover { color: #ef4444; }

        .ticket-modal-body { padding: 1.5rem; }
        
        .ticket-input-group { display: flex; flex-direction: column; gap: 10px; }
        
        .ticket-label { 
          font-size: 0.75rem; font-weight: 700; color: #475569; 
          text-transform: uppercase; letter-spacing: 0.05em; 
        }

        .ticket-input {
          width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; 
          border-radius: 12px; font-size: 1rem; transition: 0.2s; 
          outline: none; background: #f8fafc;
        }

        .ticket-input:focus {
          border-color: #ef4444; background: #ffffff;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }

        .ticket-info-note { 
          display: flex; align-items: center; gap: 6px; 
          color: #94a3b8; font-size: 0.75rem; margin-top: 4px;
        }

        .ticket-modal-footer {
          padding: 1.25rem 1.5rem; background: #f8fafc;
          border-top: 1px solid #f1f5f9; display: flex; gap: 12px;
        }

        .btn-cancel, .btn-save {
          flex: 1; padding: 12px; border-radius: 12px; font-weight: 700;
          cursor: pointer; transition: 0.2s; border: none; display: flex;
          align-items: center; justify-content: center;
        }

        .btn-cancel { background: #ffffff; border: 1px solid #e2e8f0; color: #64748b; }
        .btn-cancel:hover { background: #f1f5f9; }

        .btn-save { background: #ef4444; color: white; }
        .btn-save:hover { background: #dc2626; transform: translateY(-1px); }

        @media (max-width: 600px) {
          .ticket-modal-overlay { align-items: flex-end; padding: 0; }
          .ticket-modal-card { border-radius: 24px 24px 0 0; animation: ticketSlideUp 0.4s ease-out; }
          .ticket-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes ticketSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TicketModal;