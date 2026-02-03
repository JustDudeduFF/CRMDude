import React, { useState, useEffect } from "react";
import MakerModal from "./MakerModal";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaMicrochip, FaPlus, FaMapMarkerAlt, FaHashtag, FaIndustry } from 'react-icons/fa';

export default function DeviceMakers() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraydMaker, setArraydMaker] = useState([]);

  const fetchdMakers = async () => {
    try {
      const response = await API.get(`/master/devicemaker?partnerId=${partnerId}`);

      if (response.status !== 200)
        return toast.error("Failed to Load Makers Name", { autoClose: 2000 });

      setArraydMaker(response.data);
    } catch (e) {
      console.log(e);
      toast.error("Internal Server Error");
    }
  };

  useEffect(() => {
    fetchdMakers();
  }, []);

  return (
    <div className="dmaker-page-container">
      <ToastContainer position="top-right" />
      
      {/* Redesigned Header */}
      <div className="dmaker-header-card">
        <div className="dmaker-title-group">
          <div className="dmaker-icon-badge">
            <FaMicrochip />
          </div>
          <div>
            <h5 className="dmaker-main-title">Device Manufacturers</h5>
            <p className="dmaker-sub-title">Manage hardware suppliers and factory locations</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_DEVICE_MAKER")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="dmaker-add-button"
        >
          <FaPlus /> <span>New Manufacturer</span>
        </button>
      </div>

      <MakerModal 
        show={showModal} 
        notshow={() => {
          setShowModal(false);
          fetchdMakers(); // Added refresh logic on modal close
        }} 
      />

      {/* Table & Mobile Card Section */}
      <div className="dmaker-table-card">
        <div className="dmaker-responsive-wrapper">
          <table className="dmaker-custom-table">
            <thead>
              <tr>
                <th><FaHashtag className="me-2" /> S. No.</th>
                <th><FaIndustry className="me-2" /> Maker Name</th>
                <th><FaMapMarkerAlt className="me-2" /> Factory Address</th>
              </tr>
            </thead>

            <tbody>
              {arraydMaker.length > 0 ? (
                arraydMaker.map(({ name, address }, index) => (
                  <tr key={index}>
                    <td className="dmaker-sn-cell">
                      <span className="dmaker-mobile-label">S.No:</span>
                      {index + 1}
                    </td>
                    <td className="dmaker-name-cell">
                      <span className="dmaker-mobile-label">Manufacturer:</span>
                      <span className="dmaker-link">{name}</span>
                    </td>
                    <td className="dmaker-address-cell">
                      <span className="dmaker-mobile-label">Address:</span>
                      {address || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="dmaker-no-data">
                    No manufacturers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .dmaker-page-container {
          padding: 1.5rem;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Header Card Styling */
        .dmaker-header-card {
          background: #ffffff;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          margin-bottom: 1.5rem;
          border-top: 4px solid #6366f1;
        }

        .dmaker-title-group { display: flex; align-items: center; gap: 1rem; }
        .dmaker-icon-badge {
          width: 48px; height: 48px; background: #eef2ff; color: #6366f1;
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem;
        }

        .dmaker-main-title { margin: 0; font-weight: 800; color: #1e293b; font-size: 1.1rem; }
        .dmaker-sub-title { margin: 0; font-size: 0.85rem; color: #64748b; }

        .dmaker-add-button {
          background: #6366f1; color: white; border: none; padding: 12px 24px;
          border-radius: 10px; font-weight: 600; display: flex; align-items: center;
          gap: 8px; transition: 0.2s; cursor: pointer;
        }
        .dmaker-add-button:hover { background: #4f46e5; transform: translateY(-1px); }

        /* Table Card Styling */
        .dmaker-table-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .dmaker-custom-table { width: 100%; border-collapse: collapse; }
        .dmaker-custom-table thead th {
          background: #f1f5f9; padding: 1.1rem 1.5rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;
        }

        .dmaker-custom-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: 0.2s; }
        .dmaker-custom-table tbody tr:hover { background: #fdfeff; }

        .dmaker-custom-table td { padding: 1.2rem 1.5rem; font-size: 0.95rem; color: #334155; }
        .dmaker-link { color: #6366f1; font-weight: 700; text-decoration: underline; cursor: pointer; }
        .dmaker-sn-cell { color: #94a3b8; font-weight: 600; }
        .dmaker-address-cell { color: #64748b; max-width: 400px; }

        .dmaker-mobile-label { display: none; }
        .dmaker-no-data { text-align: center; padding: 3rem !important; color: #94a3b8; font-style: italic; }

        /* Mobile Optimization */
        @media (max-width: 768px) {
          .dmaker-page-container { padding: 10px; }
          .dmaker-header-card { flex-direction: column; gap: 1rem; text-align: center; padding: 1.5rem; }
          .dmaker-title-group { flex-direction: column; }
          .dmaker-add-button { width: 100%; justify-content: center; }

          /* Table to Card conversion */
          .dmaker-custom-table thead { display: none; }
          .dmaker-custom-table, .dmaker-custom-table tbody, .dmaker-custom-table tr, .dmaker-custom-table td {
            display: block; width: 100%;
          }
          .dmaker-custom-table tr { 
            margin-bottom: 15px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; 
          }
          .dmaker-custom-table td { 
            display: flex; justify-content: space-between; align-items: flex-start;
            padding: 10px; border: none; text-align: right;
          }
          .dmaker-mobile-label { 
            display: block; font-weight: 700; color: #94a3b8; font-size: 0.75rem; 
            text-transform: uppercase; text-align: left; 
          }
          .dmaker-link { text-decoration: none; }
          .dmaker-address-cell { max-width: 100%; padding-left: 20px; }
        }
      `}</style>
    </div>
  );
}