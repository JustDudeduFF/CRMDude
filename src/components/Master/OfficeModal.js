import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../../FirebaseConfig";
import { FaBuilding, FaMapMarkerAlt, FaLocationArrow, FaTimes, FaCheck } from "react-icons/fa";

const OfficeModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem('partnerId');
  const [officename, setOfficeName] = useState('');
  const [officeaddress, setOfficeAddress] = useState('');
  const [officelat, setOfficeLat] = useState('');
  const [officelong, setOfficeLong] = useState('');

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    // Basic validation to prevent empty submissions
    if (!officename || !officeaddress) {
      return toast.warn("Office name and address are required");
    }

    const data = {
      name: officename,
      address: officeaddress,
      lat: officelat,
      long: officelong
    };

    try {
      const response = await API.post(`/master/offices?partnerId=${partnerId}`, data);

      // Fixed: response.status check is more reliable than response !== 200
      if (response.status !== 200) {
        return toast.error('Failed to add Office', { autoClose: 2000 });
      }

      toast.success("Office added successfully");
      setTimeout(() => notshow(true), 800);
    } catch (e) {
      console.log(e);
      toast.error("Internal Server Error");
    }
  };

  if (!show) return null;

  return (
    <div className="office-modal-overlay">
      <div className="office-modal-card">
        {/* Header */}
        <div className="office-modal-header">
          <div className="header-icon-box">
            <FaBuilding />
          </div>
          <div className="header-text">
            <h5>Add Office Location</h5>
            <p>Define a new corporate or branch location</p>
          </div>
          <button className="office-close-x" onClick={() => notshow(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <div className="office-modal-body">
          <form className="office-form-grid">
            <div className="office-field full-width">
              <label><FaBuilding className="me-2" /> Office Name</label>
              <input
                autoFocus
                onChange={(e) => setOfficeName(capitalizeFirstLetter(e.target.value))}
                type="text"
                placeholder="e.g. Head Office"
                className="office-input"
                value={officename}
              />
            </div>

            <div className="office-field full-width">
              <label><FaMapMarkerAlt className="me-2" /> Full Address</label>
              <input
                onChange={(e) => setOfficeAddress(e.target.value)}
                type="text"
                placeholder="Street, City, State, Zip"
                className="office-input"
                value={officeaddress}
              />
            </div>

            <div className="office-coords-row">
              <div className="office-field">
                <label><FaLocationArrow className="me-2" /> Latitude</label>
                <input
                  onChange={(e) => setOfficeLat(e.target.value)}
                  type="number"
                  placeholder="0.0000"
                  step="any"
                  className="office-input"
                  value={officelat}
                />
              </div>

              <div className="office-field">
                <label><FaLocationArrow className="me-2" /> Longitude</label>
                <input
                  onChange={(e) => setOfficeLong(e.target.value)}
                  type="number"
                  placeholder="0.0000"
                  step="any"
                  className="office-input"
                  value={officelong}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Actions */}
        <div className="office-modal-footer">
          <button onClick={() => notshow(false)} className="office-btn-secondary">
            Cancel
          </button>
          <button onClick={handleClick} className="office-btn-primary">
            <FaCheck className="me-2" /> Save Office
          </button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .office-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex; justify-content: center; align-items: center;
          z-index: 10000; padding: 20px;
        }

        .office-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 520px;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: officeModalIn 0.3s ease-out;
        }

        @keyframes officeModalIn {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .office-modal-header {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; gap: 16px; position: relative;
        }

        .header-icon-box {
          width: 44px; height: 44px; background: #ecfdf5; color: #10b981;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .header-text h5 { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.15rem; }
        .header-text p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .office-close-x {
          position: absolute; right: 20px; top: 20px;
          background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.2rem;
        }

        .office-modal-body { padding: 24px; }
        .office-form-grid { display: flex; flex-direction: column; gap: 20px; }
        .office-coords-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .office-field { display: flex; flex-direction: column; gap: 8px; }
        .office-field label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }

        .office-input {
          padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px;
          font-size: 0.95rem; transition: 0.2s; outline: none; background: #fcfdfe;
        }

        .office-input:focus {
          border-color: #10b981; background: #fff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .office-modal-footer {
          padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;
          display: flex; gap: 12px;
        }

        .office-btn-secondary, .office-btn-primary {
          flex: 1; padding: 14px; border-radius: 12px; font-weight: 700;
          cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
        }

        .office-btn-secondary { background: white; border: 2px solid #e2e8f0; color: #64748b; }
        .office-btn-primary { background: #10b981; border: none; color: white; }
        .office-btn-primary:hover { background: #059669; transform: translateY(-1px); }

        @media (max-width: 600px) {
          .office-modal-overlay { align-items: flex-end; padding: 0; }
          .office-modal-card { border-radius: 24px 24px 0 0; animation: officeSlideUp 0.4s ease-out; }
          .office-coords-row { grid-template-columns: 1fr; }
          .office-modal-footer { flex-direction: column-reverse; }
        }

        @keyframes officeSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OfficeModal;