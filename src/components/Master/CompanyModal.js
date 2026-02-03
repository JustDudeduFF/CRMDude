import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaBuilding, FaIdBadge, FaPhoneAlt, FaEnvelope, 
  FaMapMarkedAlt, FaCity, FaMapPin, FaTimes, FaCalendarAlt 
} from 'react-icons/fa';
import { API } from "../../FirebaseConfig";

const CompanynModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [companycode, setcompanycode] = useState("");
  const [companyname, setcompanyName] = useState("");
  const [companyaddress, setcompanyaddress] = useState("");
  const [companygmail, setcompanygmail] = useState("");
  const [companymobile, setcompanymobile] = useState("");
  const [companycity, setcompanycity] = useState("");
  const [companypincode, setcompanypincode] = useState("");

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    const data = {
      code: companycode,
      name: companyname,
      address: companyaddress,
      email: companygmail,
      mobile: companymobile,
      city: companycity,
      pincode: companypincode,
      partnerId,
    };

    try {
      const response = await API.post(`/master/company?partnerId=${partnerId}`, data);

      if (response.status !== 200)
        return toast.error("Failed to Add Company", { autoClose: 2000 });

      toast.success("Company added successfully!");
      setTimeout(() => notshow(true), 1000);
    } catch (e) {
      console.log(e);
      toast.error("An error occurred while adding company");
    }
  };

  if (!show) return null;

  return (
    <div className="modern-modal-overlay">
      <div className="modern-modal-container">
        {/* Header */}
        <div className="modern-modal-header">
          <div className="header-info">
            <div className="header-icon"><FaBuilding /></div>
            <div>
              <h5>Add New Company</h5>
              <p className="d-none d-sm-block">Register a new business entity in the system</p>
            </div>
          </div>
          <button className="close-x" onClick={notshow}><FaTimes /></button>
        </div>

        {/* Form Body */}
        <div className="modern-modal-body">
          <form className="modern-grid-form">
            
            <div className="form-item span-4">
              <label><FaIdBadge /> Company Code</label>
              <input 
                onChange={(e) => setcompanycode(e.target.value)}
                type="text" placeholder="e.g. CMP-01" 
              />
            </div>

            <div className="form-item span-8">
              <label><FaBuilding /> Company Name</label>
              <input 
                onChange={(e) => setcompanyName(capitalizeFirstLetter(e.target.value))}
                type="text" placeholder="e.g. Global Solutions Ltd" 
              />
            </div>

            <div className="form-item span-12">
              <label><FaMapMarkedAlt /> Office Address</label>
              <input 
                onChange={(e) => setcompanyaddress(e.target.value)}
                type="text" placeholder="Full street address, suite, or building" 
              />
            </div>

            <div className="form-item span-6">
              <label><FaEnvelope /> Business Email</label>
              <div className="input-with-prefix">
                <span className="prefix">@</span>
                <input 
                  onChange={(e) => setcompanygmail(e.target.value)}
                  type="email" placeholder="hr@company.com" 
                />
              </div>
            </div>

            <div className="form-item span-6">
              <label><FaPhoneAlt /> Contact Mobile</label>
              <div className="input-with-prefix">
                <span className="prefix">+91</span>
                <input 
                  onChange={(e) => setcompanymobile(e.target.value)}
                  type="text" placeholder="98765 43210" 
                />
              </div>
            </div>

            <div className="form-item span-4">
              <label><FaCity /> City</label>
              <input 
                onChange={(e) => setcompanycity(e.target.value)}
                type="text" placeholder="City name" 
              />
            </div>

            <div className="form-item span-4">
              <label><FaMapPin /> Pincode</label>
              <input 
                onChange={(e) => setcompanypincode(e.target.value)}
                type="text" placeholder="6-digit code" 
              />
            </div>

            <div className="form-item span-4">
              <label><FaCalendarAlt /> Effective From</label>
              <input type="date" className="date-input" />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="modern-modal-footer">
          <button className="btn-cancel" onClick={notshow}>Cancel</button>
          <button className="btn-submit" onClick={handleClick}>Register Company</button>
        </div>
      </div>

      <ToastContainer position="top-center" />

      <style>{`
        .modern-modal-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex; justify-content: center; align-items: center;
          z-index: 9999; padding: 15px;
        }

        .modern-modal-container {
          background: #ffffff;
          width: 100%; max-width: 750px;
          max-height: 90vh; /* Prevents overflow of viewport */
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalAppear 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalAppear {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modern-modal-header {
          padding: 20px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }

        .header-info { display: flex; gap: 12px; align-items: center; }
        .header-icon {
          width: 40px; height: 40px; background: #e0f2fe; color: #0284c7;
          border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .header-info h5 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
        .header-info p { margin: 0; font-size: 0.8rem; color: #64748b; }

        .close-x { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.2rem; padding: 5px; }

        .modern-modal-body { 
          padding: 24px; 
          overflow-y: auto; 
          flex-grow: 1; 
          scrollbar-width: thin;
        }

        .modern-grid-form { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
        .span-4 { grid-column: span 4; }
        .span-6 { grid-column: span 6; }
        .span-8 { grid-column: span 8; }
        .span-12 { grid-column: span 12; }

        .form-item { display: flex; flex-direction: column; gap: 6px; }
        .form-item label { font-size: 0.75rem; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        
        .form-item input {
          padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px;
          font-size: 0.9rem; transition: 0.2s; outline: none; background: #fcfdfe; width: 100%;
        }
        .form-item input:focus { border-color: #0284c7; background: #fff; }

        .input-with-prefix { display: flex; align-items: stretch; border: 1.5px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
        .input-with-prefix .prefix { background: #f1f5f9; padding: 0 10px; display: flex; align-items: center; color: #64748b; font-weight: 600; font-size: 0.85rem; border-right: 1.5px solid #e2e8f0; }
        .input-with-prefix input { border: none !important; flex: 1; border-radius: 0; }

        .modern-modal-footer {
          padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;
          display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
        }

        .btn-cancel { padding: 10px 20px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; cursor: pointer; }
        .btn-submit { padding: 10px 24px; border-radius: 8px; border: none; background: #0284c7; color: white; font-weight: 700; cursor: pointer; }

        @media (max-width: 768px) {
          .modern-modal-overlay { padding: 0; align-items: flex-end; }
          .modern-modal-container { 
            max-height: 95vh; 
            border-radius: 20px 20px 0 0; 
            animation: slideUpMobile 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .span-4, .span-6, .span-8 { grid-column: span 12; }
          .modern-modal-body { padding: 20px; }
          .modern-modal-footer { 
            flex-direction: column-reverse; 
            padding: 20px;
          }
          .btn-cancel, .btn-submit { width: 100%; padding: 14px; }
          .d-none { display: none !important; }
        }

        @keyframes slideUpMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CompanynModal;