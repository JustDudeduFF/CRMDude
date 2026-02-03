import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API } from "../../FirebaseConfig";
import { FaGlobe, FaBarcode, FaCalendarCheck, FaTimes, FaPlusCircle } from "react-icons/fa";

const ISPModal = ({ show, unShow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [currentDate, setCurrentDate] = useState("");
  const [ispCode, setIspCode] = useState("");
  const [ispName, setIspName] = useState("");

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    setCurrentDate(formattedDate);
  }, []);

  const handleClick = async () => {
    if (!ispCode || !ispName) {
      return toast.warn("Please fill in all required fields");
    }

    const data = {
      code: ispCode,
      name: ispName,
      date: currentDate,
    };

    try {
      const response = await API.post(`/master/isps?partnerId=${partnerId}`, data);

      if (response.status !== 200)
        return toast.error("Failed to Add ISP", { autoClose: 2000 });
      
      toast.success("ISP Registered Successfully!");
      setTimeout(() => unShow(true), 800);
    } catch (e) {
      console.log(e);
      toast.error("An error occurred");
    }
  };

  if (!show) return null;

  return (
    <div className="isp-modal-overlay">
      <div className="isp-modal-card">
        {/* Header */}
        <div className="isp-modal-header">
          <div className="isp-header-left">
            <div className="isp-icon-box">
              <FaGlobe />
            </div>
            <div>
              <h5>Add New ISP</h5>
              <p>Register a new Internet Service Provider</p>
            </div>
          </div>
          <button className="isp-close-x" onClick={() => unShow(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="isp-modal-body">
          <form className="isp-form-grid">
            <div className="isp-input-group col-span-2">
              <label><FaBarcode className="me-2" /> ISP Code</label>
              <input
                onChange={(e) => setIspCode(e.target.value)}
                className="isp-input"
                value={ispCode}
                placeholder="Ex: ISP-001"
              />
            </div>

            <div className="isp-input-group col-span-4">
              <label><FaGlobe className="me-2" /> ISP Name</label>
              <input
                onChange={(e) => setIspName(e.target.value)}
                className="isp-input"
                value={ispName}
                placeholder="Ex: Fiber Connect"
              />
            </div>

            <div className="isp-input-group col-span-6">
              <label><FaCalendarCheck className="me-2" /> ISP Added On</label>
              <input
                type="text"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="isp-input"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="isp-modal-footer">
          <button onClick={() => unShow(false)} className="isp-btn-secondary">
            Cancel
          </button>
          <button onClick={handleClick} className="isp-btn-primary">
            <FaPlusCircle className="me-2" /> Register ISP
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .isp-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 10000; padding: 20px;
        }

        .isp-modal-card {
          background: #fff;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: ispFadeIn 0.3s ease-out;
        }

        @keyframes ispFadeIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .isp-modal-header {
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
        }

        .isp-header-left { display: flex; gap: 15px; align-items: center; }
        .isp-icon-box {
          width: 42px; height: 42px; background: #dbeafe; color: #2563eb;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .isp-header-left h5 { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.1rem; }
        .isp-header-left p { margin: 0; font-size: 0.8rem; color: #64748b; }

        .isp-close-x { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem; }
        .isp-close-x:hover { color: #ef4444; }

        .isp-modal-body { padding: 24px; }
        .isp-form-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .col-span-2 { grid-column: span 2; }
        .col-span-4 { grid-column: span 4; }
        .col-span-6 { grid-column: span 6; }

        .isp-input-group { display: flex; flex-direction: column; gap: 8px; }
        .isp-input-group label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; }

        .isp-input {
          padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px;
          font-size: 0.95rem; transition: 0.2s; outline: none;
        }
        .isp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }

        .isp-modal-footer {
          padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;
          display: flex; gap: 12px;
        }

        .isp-btn-secondary, .isp-btn-primary {
          flex: 1; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s;
        }

        .isp-btn-secondary { background: white; border: 2px solid #e2e8f0; color: #64748b; }
        .isp-btn-secondary:hover { background: #f1f5f9; }

        .isp-btn-primary { background: #2563eb; border: none; color: white; }
        .isp-btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }

        @media (max-width: 600px) {
          .isp-modal-overlay { align-items: flex-end; padding: 0; }
          .isp-modal-card { border-radius: 20px 20px 0 0; animation: ispSlideUp 0.4s ease-out; }
          .isp-form-grid { grid-template-columns: 1fr; }
          .col-span-2, .col-span-4, .col-span-6 { grid-column: span 1; }
          .isp-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes ispSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ISPModal;