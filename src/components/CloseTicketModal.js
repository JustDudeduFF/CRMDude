import React, { useEffect, useState } from "react";
import { API } from "../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { X, CheckCircle2, UserCircle2, ClipboardCheck, Hash } from "lucide-react";
import axios from "axios";

const CloseTicketModal = ({ show, ticketno, closeModal }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [arrayemp, setEmpArray] = useState([]);
  const [closeby, setCloseBy] = useState("");
  const [rac, setRAC] = useState("");

  const fetchEmp = async () => {
    try {
      const response = await API.get(
        `/subscriber/users?partnerId=${partnerId}`
      );
      setEmpArray(response.data || []);
    } catch (e) {
      console.error("Error fetching employees:", e);
    }
  };

  useEffect(() => {
    if (show) fetchEmp();
  }, [show, ticketno]);

  const closeTicket = async (e) => {
    e.preventDefault();
    
    if (!closeby) return toast.warn("Please select who is closing the ticket");
    if (!rac.trim()) return toast.warn("Root Cause Analysis (RCA) is required");

    try {
      const response = await axios.put(
        `https://api.justdude.in:5000/mobile/updateticket/${ticketno._id}`,
        {
          status: "Completed",
          closeby: closeby,
          remarks: rac,
          partnerId: partnerId,
        }
      );

      if (response.status !== 200) {
        return toast.error("Failed to Update Ticket", { autoClose: 2000 });
      }

      toast.success("Ticket Closed Successfully", { autoClose: 1500 });
      setTimeout(() => closeModal(true), 1600);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during submission");
    }
  };

  if (!show) return null;

  return (
    <div className="res-modal-overlay">
      <div className="res-modal-card">
        {/* Header */}
        <div className="res-modal-header">
          <div className="res-header-info">
            <div className="res-icon-circle">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h5>Resolve Ticket</h5>
              <div className="res-ticket-id">
                <Hash size={12} /> <span>{ticketno?.Ticketno}</span>
              </div>
            </div>
          </div>
          <button onClick={() => closeModal(false)} className="res-close-x">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form className="res-modal-body" onSubmit={closeTicket}>
          <div className="res-input-row">
            <div className="res-form-group">
              <label className="res-label">
                <UserCircle2 size={14} className="me-1" /> Closed By
              </label>
              <select
                onChange={(e) => setCloseBy(e.target.value)}
                className="res-select"
                value={closeby}
                required
              >
                <option value="">Select Employee</option>
                {arrayemp.length > 0 ? (
                  arrayemp.map(({ empname, empmobile }, index) => (
                    <option key={index} value={empmobile}>
                      {empname}
                    </option>
                  ))
                ) : (
                  <option disabled>No employees found</option>
                )}
              </select>
            </div>

            <div className="res-form-group">
              <label className="res-label">
                <ClipboardCheck size={14} className="me-1" /> Root Cause (RCA)
              </label>
              <input
                onChange={(e) => setRAC(e.target.value)}
                type="text"
                placeholder="Briefly explain the resolution..."
                className="res-input"
                value={rac}
                required
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="res-modal-footer">
            <button type="button" onClick={() => closeModal(false)} className="res-btn-secondary">
              Go Back
            </button>
            <button type="submit" className="res-btn-primary">
              Confirm Completion
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .res-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(5px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 1.5rem;
        }

        .res-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 550px;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: resPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes resPop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .res-modal-header {
          padding: 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
        }

        .res-header-info { display: flex; align-items: center; gap: 12px; }
        .res-icon-circle {
          width: 44px; height: 44px; background: #e0e7ff; color: #4338ca;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }

        .res-header-info h5 { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.15rem; }
        .res-ticket-id { 
          display: flex; align-items: center; gap: 4px; 
          font-size: 0.8rem; color: #6366f1; font-weight: 700; background: #eef2ff;
          padding: 2px 8px; border-radius: 6px; margin-top: 2px;
        }

        .res-close-x { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .res-close-x:hover { color: #ef4444; }

        .res-modal-body { padding: 2rem 1.5rem; }
        .res-input-row { display: flex; flex-direction: column; gap: 1.5rem; }
        
        .res-form-group { display: flex; flex-direction: column; gap: 8px; }
        .res-label { 
          font-size: 0.75rem; font-weight: 700; color: #64748b; 
          text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center;
        }

        .res-select, .res-input {
          width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; 
          border-radius: 12px; font-size: 0.95rem; transition: 0.2s; 
          outline: none; background: #fdfdfe; color: #334155;
        }

        .res-select:focus, .res-input:focus {
          border-color: #6366f1; background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .res-modal-footer {
          margin-top: 2rem;
          display: flex; gap: 12px;
        }

        .res-btn-secondary, .res-btn-primary {
          flex: 1; padding: 14px; border-radius: 12px; font-weight: 700;
          cursor: pointer; transition: 0.2s; border: none; font-size: 0.95rem;
        }

        .res-btn-secondary { background: #f1f5f9; color: #475569; }
        .res-btn-secondary:hover { background: #e2e8f0; }

        .res-btn-primary { background: #4338ca; color: white; box-shadow: 0 4px 10px rgba(67, 56, 202, 0.25); }
        .res-btn-primary:hover { background: #3730a3; transform: translateY(-1px); }

        @media (max-width: 600px) {
          .res-modal-overlay { align-items: flex-end; padding: 0; }
          .res-modal-card { border-radius: 24px 24px 0 0; animation: resSlideUp 0.4s ease-out; }
          .res-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes resSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CloseTicketModal;