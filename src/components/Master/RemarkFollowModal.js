import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../../FirebaseConfig";
import { MessageSquareText, PlusCircle, X, AlertCircle } from "lucide-react";

const RemarkFollowModal = ({ show, notshow }) => {
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
      name: ticketname,
      partnerId: partnerId,
      code: ticketname,
    };

    try {
      const response = await API.post(`/master/remark-follow?partnerId=${partnerId}`, data);

      if (response.status !== 200)
        return toast.error("Failed to Add Concern", { autoClose: 2000 });
      
      toast.success("Concern added successfully");
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    }
  };

  if (!show) return null;

  return (
    <div className="remark-modal-overlay">
      <div className="remark-modal-card">
        {/* Header Section */}
        <div className="remark-modal-header">
          <div className="remark-header-left">
            <div className="remark-icon-box">
              <MessageSquareText size={22} />
            </div>
            <div>
              <h5>Follow-up Concerns</h5>
              <p>Add new remark or concern category</p>
            </div>
          </div>
          <button className="remark-close-btn" onClick={() => notshow(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Body Section */}
        <div className="remark-modal-body">
          <div className="remark-input-container">
            <label className="remark-label">
              <AlertCircle size={14} className="me-1" /> Concern Name
            </label>
            <input
              autoFocus
              onChange={(e) => {
                setticketName(capitalizeFirstLetter(e.target.value));
              }}
              value={ticketname}
              type="text"
              placeholder="e.g., Billing Discrepancy"
              className="remark-input"
            />
            <small className="remark-helper">
              This name will appear in ticket dropdowns.
            </small>
          </div>
        </div>

        {/* Action Footer */}
        <div className="remark-modal-footer">
          <button onClick={() => notshow(false)} className="remark-btn-cancel">
            Cancel
          </button>
          <button onClick={handleClick} className="remark-btn-submit">
            <PlusCircle size={18} className="me-2" /> Add Concern
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .remark-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 10000; padding: 1.5rem;
        }

        .remark-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 480px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: remarkIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes remarkIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .remark-modal-header {
          padding: 1.5rem;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
        }

        .remark-header-left { display: flex; align-items: center; gap: 12px; }
        .remark-icon-box {
          width: 42px; height: 42px; background: #fff7ed; color: #f59e0b;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
        }

        .remark-header-left h5 { margin: 0; font-weight: 700; color: #1e293b; font-size: 1.1rem; }
        .remark-header-left p { margin: 0; font-size: 0.8rem; color: #64748b; }

        .remark-close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
        .remark-close-btn:hover { color: #ef4444; }

        .remark-modal-body { padding: 2rem 1.5rem; }
        .remark-input-container { display: flex; flex-direction: column; gap: 8px; }
        
        .remark-label { 
          font-size: 0.75rem; font-weight: 700; color: #475569; 
          text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center;
        }

        .remark-input {
          padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px;
          font-size: 1rem; transition: 0.2s; outline: none; background: #fcfdfe;
        }

        .remark-input:focus {
          border-color: #f59e0b; background: #fff;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
        }

        .remark-helper { font-size: 0.75rem; color: #94a3b8; }

        .remark-modal-footer {
          padding: 1.25rem 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9;
          display: flex; gap: 12px;
        }

        .remark-btn-cancel, .remark-btn-submit {
          flex: 1; padding: 12px; border-radius: 12px; font-weight: 700;
          cursor: pointer; transition: 0.2s; border: none; display: flex; align-items: center; justify-content: center;
        }

        .remark-btn-cancel { background: #fff; border: 1px solid #e2e8f0; color: #64748b; }
        .remark-btn-cancel:hover { background: #f1f5f9; }

        .remark-btn-submit { background: #f59e0b; color: white; }
        .remark-btn-submit:hover { background: #d97706; transform: translateY(-1px); }

        @media (max-width: 640px) {
          .remark-modal-overlay { align-items: flex-end; padding: 0; }
          .remark-modal-card { border-radius: 20px 20px 0 0; animation: remarkSlideUp 0.4s ease-out; }
          .remark-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes remarkSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RemarkFollowModal;