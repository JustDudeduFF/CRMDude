import React, { useState } from "react";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaUserTag, FaTimes, FaCheck, FaBriefcase } from "react-icons/fa";

const DesignationModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [designationname, setdesignationName] = useState("");

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    if (!designationname.trim()) {
      return toast.warn("Please enter a designation name");
    }

    const data = {
      name: designationname,
      partnerId: partnerId,
    };

    try {
      const response = await API.post(`/master/designations?partnerId=${partnerId}`, data);

      if (response.status !== 200) {
        return toast.error("Failed to add designation", { autoClose: 2000 });
      }

      toast.success("Designation added successfully");
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.log(e);
      toast.error("An error occurred");
    }
  };

  if (!show) return null;

  return (
    <div className="modern-modal-overlay">
      <div className="designation-modal-card">
        {/* Header */}
        <div className="modal-header-modern">
          <div className="title-group">
            <div className="icon-circle">
              <FaBriefcase />
            </div>
            <div>
              <h5>Add Designation</h5>
              <p>Create a new role for your organization</p>
            </div>
          </div>
          <button className="close-btn-modern" onClick={() => notshow(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-modern">
          <div className="input-field-group">
            <label>
              <FaUserTag className="me-2" /> Role Name
            </label>
            <input
              autoFocus
              onChange={(e) => {
                setdesignationName(capitalizeFirstLetter(e.target.value));
              }}
              value={designationname}
              type="text"
              placeholder="e.g. Senior Manager"
              className="modern-text-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-modern">
          <button className="btn-modern-secondary" onClick={() => notshow(false)}>
            Cancel
          </button>
          <button className="btn-modern-primary" onClick={handleClick}>
            <FaCheck className="me-2" /> Add Designation
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .modern-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(6px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 15px;
        }

        .designation-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 480px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header-modern {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: flex-start;
        }

        .title-group { display: flex; gap: 16px; align-items: center; }
        .icon-circle {
          width: 44px; height: 44px; background: #e0f2fe; color: #0284c7;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .title-group h5 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #0f172a; }
        .title-group p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .close-btn-modern { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
        .close-btn-modern:hover { color: #ef4444; transform: rotate(90deg); }

        .modal-body-modern { padding: 32px 24px; }
        .input-field-group { display: flex; flex-direction: column; gap: 10px; }
        .input-field-group label { font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }

        .modern-text-input {
          padding: 14px 18px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          outline: none;
          background: #fcfdfe;
        }

        .modern-text-input:focus {
          border-color: #0284c7;
          box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.1);
          background: #fff;
        }

        .modal-footer-modern {
          padding: 20px 24px;
          background: #f8fafc;
          display: flex; gap: 12px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-modern-secondary, .btn-modern-primary {
          flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; 
          cursor: pointer; transition: all 0.2s; font-size: 0.95rem;
          display: flex; align-items: center; justify-content: center;
        }

        .btn-modern-secondary { background: white; border: 2px solid #e2e8f0; color: #64748b; }
        .btn-modern-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }

        .btn-modern-primary { background: #0284c7; border: none; color: white; }
        .btn-modern-primary:hover { background: #0369a1; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3); }

        @media (max-width: 576px) {
          .modern-modal-overlay { align-items: flex-end; padding: 0; }
          .designation-modal-card { 
            border-radius: 24px 24px 0 0; 
            max-width: 100%;
            animation: mobileSlideUp 0.4s cubic-bezier(0, 0, 0.2, 1);
          }
          .modal-footer-modern { flex-direction: column-reverse; padding: 24px; }
          .btn-modern-secondary, .btn-modern-primary { padding: 16px; width: 100%; }
        }

        @keyframes mobileSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DesignationModal;