import React, { useState } from "react";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaMoneyBillWave, FaTimes, FaCheckCircle, FaFileInvoiceDollar } from 'react-icons/fa';

const DebitCreditNoteModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [ticketname, setticketName] = useState("");

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    if (!ticketname.trim()) {
      return toast.warn("Please enter a particular name", { autoClose: 2000 });
    }

    const data = {
      name: ticketname,
      partnerId: partnerId,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await API.post(`/master/debit-credit?partnerId=${partnerId}`, data);

      if (response.status !== 200)
        return toast.error("Failed to add Concern", { autoClose: 2000 });
      
      toast.success("Particular added successfully!");
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.log(e);
      toast.error("An error occurred");
    }
  };

  if (!show) return null;

  return (
    <div className="dc-modal-overlay">
      <div className="dc-modal-card">
        {/* Header */}
        <div className="dc-modal-header">
          <div className="dc-header-left">
            <div className="dc-icon-box">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <h5>Add Particulars</h5>
              <p>Debit and Credit Management</p>
            </div>
          </div>
          <button className="dc-close-btn" onClick={notshow}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="dc-modal-body">
          <div className="dc-input-wrapper">
            <label className="dc-label">
              <FaMoneyBillWave className="me-2" /> Particular Name
            </label>
            <input
              autoFocus
              value={ticketname}
              onChange={(e) => setticketName(capitalizeFirstLetter(e.target.value))}
              type="text"
              placeholder="e.g. Refund Processing"
              className="dc-modern-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="dc-modal-footer">
          <button className="dc-btn-cancel" onClick={notshow}>
            Cancel
          </button>
          <button className="dc-btn-submit" onClick={handleClick}>
            <FaCheckCircle className="me-2" /> Add Concern
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .dc-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(5px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 15px;
        }

        .dc-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 500px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: dcFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dcFadeUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .dc-modal-header {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .dc-header-left { display: flex; gap: 16px; align-items: center; }
        .dc-icon-box {
          width: 48px; height: 48px; background: #ecfdf5; color: #059669;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }

        .dc-header-left h5 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #1e293b; }
        .dc-header-left p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .dc-close-btn { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
        .dc-close-btn:hover { color: #ef4444; }

        .dc-modal-body { padding: 32px 24px; }
        .dc-input-wrapper { display: flex; flex-direction: column; gap: 10px; }
        .dc-label { font-size: 0.9rem; font-weight: 600; color: #475569; display: flex; align-items: center; }

        .dc-modern-input {
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          outline: none;
          background: #fcfdfe;
        }

        .dc-modern-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 4px rgba(5, 150, 105, 0.1);
          background: #fff;
        }

        .dc-modal-footer {
          padding: 20px 24px;
          background: #f8fafc;
          display: flex; gap: 12px;
        }

        .dc-btn-cancel, .dc-btn-submit {
          flex: 1; padding: 12px; border-radius: 10px; font-weight: 600; 
          cursor: pointer; transition: all 0.2s; font-size: 0.95rem;
          display: flex; align-items: center; justify-content: center;
        }

        .dc-btn-cancel { background: white; border: 2px solid #e2e8f0; color: #64748b; }
        .dc-btn-cancel:hover { background: #f1f5f9; color: #334155; }

        .dc-btn-submit { background: #059669; border: none; color: white; }
        .dc-btn-submit:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

        @media (max-width: 576px) {
          .dc-modal-overlay { align-items: flex-end; padding: 0; }
          .dc-modal-card { 
            border-radius: 24px 24px 0 0; 
            max-width: 100%;
            animation: dcSlideUpMobile 0.4s cubic-bezier(0, 0, 0.2, 1);
          }
          .dc-modal-footer { flex-direction: column-reverse; padding: 24px; }
          .dc-btn-cancel, .dc-btn-submit { padding: 16px; }
        }

        @keyframes dcSlideUpMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DebitCreditNoteModal;