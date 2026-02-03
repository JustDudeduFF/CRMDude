import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../../FirebaseConfig";
import { FaIndustry, FaMapMarkedAlt, FaTimes, FaCheckCircle } from "react-icons/fa";

const MakerModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [dMakername, setdMakerName] = useState("");
  const [dMakeraddress, setdMakerAddress] = useState("");

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    if (!dMakername.trim()) {
      return toast.warn("Please enter a company name");
    }

    const data = {
      name: dMakername,
      partnerId: partnerId,
      code: dMakername,
      address: dMakeraddress,
    };

    try {
      const response = await API.post(`/master/devicemaker?partnerId=${partnerId}`, data);
      if (response.status !== 200)
        return toast.error("Failed to add Maker Name", { autoClose: 2000 });

      toast.success("Manufacturer added successfully");
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.log(e);
      toast.error("Internal Server Error");
    }
  };

  if (!show) return null;

  return (
    <div className="maker-modal-overlay">
      <div className="maker-modal-card">
        {/* Header Section */}
        <div className="maker-modal-header">
          <div className="header-icon-box">
            <FaIndustry />
          </div>
          <div className="header-text">
            <h5>Register Manufacturer</h5>
            <p>Add a new device maker to your database</p>
          </div>
          <button className="maker-close-icon" onClick={() => notshow(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <div className="maker-modal-body">
          <form className="maker-grid-form">
            <div className="maker-input-wrapper full-width">
              <label><FaIndustry className="me-2" /> Company Name</label>
              <input
                autoFocus
                onChange={(e) => {
                  setdMakerName(capitalizeFirstLetter(e.target.value));
                }}
                value={dMakername}
                type="text"
                placeholder="e.g. Samsung Electronics"
                className="maker-input-field"
              />
            </div>

            <div className="maker-input-wrapper full-width">
              <label><FaMapMarkedAlt className="me-2" /> Company Address</label>
              <textarea
                onChange={(e) => setdMakerAddress(e.target.value)}
                value={dMakeraddress}
                placeholder="Enter full factory or office address"
                className="maker-input-field maker-textarea"
                rows="3"
              />
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="maker-modal-footer">
          <button onClick={() => notshow(false)} className="maker-btn-cancel">
            Discard
          </button>
          <button onClick={handleClick} className="maker-btn-submit">
            <FaCheckCircle className="me-2" /> Save Manufacturer
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .maker-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(5px);
          display: flex; justify-content: center; align-items: center;
          z-index: 10000; padding: 20px;
        }

        .maker-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 550px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: makerPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes makerPop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .maker-modal-header {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; gap: 16px; position: relative;
        }

        .header-icon-box {
          width: 48px; height: 48px; background: #e0e7ff; color: #4338ca;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }

        .header-text h5 { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.15rem; }
        .header-text p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .maker-close-icon {
          position: absolute; right: 24px; top: 24px;
          background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s;
        }
        .maker-close-icon:hover { color: #ef4444; }

        .maker-modal-body { padding: 30px 24px; }
        .maker-grid-form { display: flex; flex-direction: column; gap: 20px; }

        .maker-input-wrapper { display: flex; flex-direction: column; gap: 8px; }
        .maker-input-wrapper label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }

        .maker-input-field {
          padding: 14px; border: 2px solid #e2e8f0; border-radius: 12px;
          font-size: 1rem; transition: all 0.2s; outline: none; background: #fcfdfe;
        }

        .maker-input-field:focus {
          border-color: #6366f1; background: #fff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .maker-textarea { resize: none; font-family: inherit; }

        .maker-modal-footer {
          padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;
          display: flex; gap: 12px;
        }

        .maker-btn-cancel, .maker-btn-submit {
          flex: 1; padding: 14px; border-radius: 12px; font-weight: 700;
          cursor: pointer; transition: 0.2s; font-size: 0.95rem;
          display: flex; align-items: center; justify-content: center;
        }

        .maker-btn-cancel { background: #fff; border: 2px solid #e2e8f0; color: #64748b; }
        .maker-btn-cancel:hover { background: #f1f5f9; }

        .maker-btn-submit { background: #4f46e5; border: none; color: white; }
        .maker-btn-submit:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); }

        @media (max-width: 600px) {
          .maker-modal-overlay { align-items: flex-end; padding: 0; }
          .maker-modal-card { border-radius: 24px 24px 0 0; animation: makerSlideUp 0.4s ease-out; }
          .maker-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes makerSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MakerModal;