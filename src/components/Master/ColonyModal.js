import React, { useEffect, useState } from "react";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaMapMarkerAlt, FaCity, FaTimes, FaPlusCircle } from 'react-icons/fa';

const ColonyModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [colonyname, setColonyName] = useState("");
  const [undercompany, setUnderCompany] = useState("");
  const [arraycompany, setArrayCompany] = useState([]);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const fetchCompany = async () => {
    try {
      const response = await API.get(`/master/company?partnerId=${partnerId}`);
      setArrayCompany(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (show) fetchCompany();
  }, [show]);

  const handleClick = async () => {
    if (!colonyname || !undercompany) {
      return toast.warn("Please fill all fields", { autoClose: 2000 });
    }

    const Colonydata = {
      name: colonyname,
      undercompany,
      partnerId: partnerId,
      code: colonyname,
    };

    try {
      const response = await API.post(`/master/colony?partnerId=${partnerId}`, Colonydata);

      if (response.status !== 200)
        return toast.error("Failed to add colony", { autoClose: 2000 });
      
      toast.success("Colony added successfully!");
      setTimeout(() => notshow(true), 1000); // Slight delay for the user to see success
    } catch (e) {
      console.log(e);
      toast.error("Failed to add colony", { autoClose: 2000 });
    }
  };

  if (!show) return null;

  return (
    <div className="colony-modal-overlay">
      <div className="colony-modal-card">
        {/* Header */}
        <div className="modal-header-custom">
          <div className="title-section">
            <div className="icon-wrapper">
              <FaPlusCircle />
            </div>
            <div>
              <h3>Add Colony</h3>
              <p>Register a new location in the system</p>
            </div>
          </div>
          <button className="close-btn" onClick={notshow}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body-custom">
          <div className="input-group-custom">
            <label>
              <FaMapMarkerAlt /> Colony Name
            </label>
            <input
              autoFocus
              value={colonyname}
              onChange={(e) =>
                setColonyName(capitalizeFirstLetter(e.target.value))
              }
              type="text"
              placeholder="e.g. Green Valley"
            />
          </div>

          <div className="input-group-custom">
            <label>
              <FaCity /> Under Company
            </label>
            <div className="select-wrapper">
              <select
                value={undercompany}
                onChange={(e) => setUnderCompany(e.target.value)}
              >
                <option value="">Choose Company...</option>
                {arraycompany.length > 0 ? (
                  arraycompany.map((company, index) => (
                    <option key={index} value={company.name}>
                      {company.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No Company Available</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer-custom">
          <button className="cancel-btn" onClick={notshow}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleClick}>
            Create Colony
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .colony-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
        }

        .colony-modal-card {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header-custom {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #f1f5f9;
        }

        .title-section { display: flex; gap: 16px; }
        
        .icon-wrapper {
          background: #eff6ff;
          color: #2563eb;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }

        .title-section h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
        .title-section p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-btn:hover { color: #ef4444; }

        .modal-body-custom { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

        .input-group-custom { display: flex; flex-direction: column; gap: 8px; }
        .input-group-custom label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .input-group-custom input, 
        .input-group-custom select {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: all 0.2s;
          outline: none;
        }

        .input-group-custom input:focus, 
        .input-group-custom select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .modal-footer-custom {
          padding: 20px 24px;
          background: #f8fafc;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .cancel-btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
        }

        .submit-btn {
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          background: #2563eb;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit-btn:hover { background: #1d4ed8; }

        @media (max-width: 480px) {
          .colony-modal-card { max-width: 100%; border-radius: 12px; }
          .modal-footer-custom { flex-direction: column-reverse; }
          .cancel-btn, .submit-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default ColonyModal;