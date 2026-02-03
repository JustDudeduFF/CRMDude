import React, { useState, useEffect } from "react";
import CompanynModal from "./CompanyModal";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { FaBuilding, FaPlus, FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaHashtag } from 'react-icons/fa';
import { API } from "../../FirebaseConfig";

export default function Company() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const [showGlobalCompany, setShowGlobalCompany] = useState(false);
  const { hasPermission } = usePermissions();

  const [companyDetails, setCompanyDetails] = useState({
    companyname: "",
    companyaddress: "",
    companymobile: "",
    companygmail: "",
    companycity: "",
    companypincode: "",
    companycode: "global",
    companyGSTIN: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails({ ...companyDetails, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post(`/master/globalcompany`, {
        ...companyDetails,
        partnerId: partnerId,
      });
      if (response.status !== 200) {
        return toast.error("Failed to add global company");
      }
      toast.success("Global company added successfully!");
      setShowGlobalCompany(false);
    } catch (e) {
      console.log(e);
      toast.error("Error adding global company");
    }
  };

  const [arraycompany, setArraycompany] = useState([]);

  const fetchCompany = async () => {
    try {
      const response = await API.get(`/master/company?partnerId=${partnerId}`);
      if (response.status !== 200)
        return toast.error("Failed to load Companies");

      const data = await response.json();
      setArraycompany(data);
    } catch (e) {
      console.log(e);
      toast.error("Error fetching company data");
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <div className="company-dashboard-wrapper">
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Header Card */}
      <div className="company-header-card">
        <div className="title-area">
          <div className="icon-circle">
            <FaBuilding />
          </div>
          <div className="text-content">
            <h2>Company Management</h2>
            <p>Directory of registered company locations and contact details</p>
          </div>
        </div>
        <div className="action-buttons">
          <button
            onClick={() => setShowGlobalCompany(true)}
            className="btn-global"
          >
            <FaGlobe /> Global Setup
          </button>
          <button
            onClick={() =>
              hasPermission("ADD_COMPANY")
                ? setShowModal(true)
                : alert("Permission Denied")
            }
            className="btn-add"
          >
            <FaPlus /> Add Company
          </button>
        </div>
      </div>

      <CompanynModal show={showModal} notshow={() => setShowModal(false)} />

      {/* Table Section */}
      <div className="company-table-container">
        <div className="table-responsive-custom">
          <table className="company-styled-table">
            <thead>
              <tr>
                <th className="hide-mobile"><FaHashtag /> S. No.</th>
                <th>Code</th>
                <th><FaBuilding /> Company Name</th>
                <th className="hide-tablet"><FaMapMarkerAlt /> Address</th>
                <th className="hide-mobile"><FaEnvelope /> Email</th>
                <th><FaPhone /> Mobile</th>
                <th className="hide-tablet">Pincode</th>
                <th className="hide-mobile">City</th>
              </tr>
            </thead>

            <tbody>
              {arraycompany.length > 0 ? (
                arraycompany.map(
                  ({ name, address, mobile, city, email, pincode, code }, index) => (
                    <tr key={name}>
                      <td className="hide-mobile sn-cell">{index + 1}</td>
                      <td className="code-cell"><span className="badge-code">{code}</span></td>
                      <td className="name-cell">
                        <span className="name-link">{name}</span>
                      </td>
                      <td className="hide-tablet address-cell">{address}</td>
                      <td className="hide-mobile">{email}</td>
                      <td>{mobile}</td>
                      <td className="hide-tablet">{pincode}</td>
                      <td className="hide-mobile">{city}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="8" className="empty-state">No company records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bootstrap Modal - Redesigned via CSS */}
      <Modal 
        show={showGlobalCompany} 
        onHide={() => setShowGlobalCompany(false)}
        centered
        className="custom-global-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title><FaGlobe /> Add Global Company</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className="custom-form">
            <div className="form-grid">
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control type="text" name="companyname" value={companyDetails.companyname} onChange={handleChange} required placeholder="Enter name" />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Company GSTIN</Form.Label>
                <Form.Control type="text" name="companyGSTIN" value={companyDetails.companyGSTIN} onChange={handleChange} required placeholder="GST Number" />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="companyaddress" value={companyDetails.companyaddress} onChange={handleChange} required />
            </Form.Group>

            <div className="form-grid">
              <Form.Group className="mb-3">
                <Form.Label>Gmail</Form.Label>
                <Form.Control type="email" name="companygmail" value={companyDetails.companygmail} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control type="text" name="companymobile" value={companyDetails.companymobile} onChange={handleChange} required />
              </Form.Group>
            </div>

            <div className="form-grid">
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control type="text" name="companycity" value={companyDetails.companycity} onChange={handleChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Pincode</Form.Label>
                <Form.Control type="text" name="companypincode" value={companyDetails.companypincode} onChange={handleChange} required />
              </Form.Group>
            </div>

            <div className="modal-actions">
              <Button variant="light" onClick={() => setShowGlobalCompany(false)}>Cancel</Button>
              <Button variant="success" type="submit">Save Global Company</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style>{`
        .company-dashboard-wrapper { padding: 2rem; background: #f8fafc; min-height: 100vh; }

        .company-header-card {
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          margin-bottom: 2rem;
          border-left: 5px solid #2563eb;
        }

        .title-area { display: flex; align-items: center; gap: 1rem; }
        .icon-circle { 
          background: #eff6ff; color: #2563eb; width: 48px; height: 48px; 
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }

        .text-content h2 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #1e293b; }
        .text-content p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .action-buttons { display: flex; gap: 12px; }
        .btn-add, .btn-global {
          padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; display: flex;
          align-items: center; gap: 8px; transition: all 0.2s; border: none;
        }
        .btn-add { background: #10b981; color: white; }
        .btn-add:hover { background: #059669; transform: translateY(-1px); }
        .btn-global { background: #f1f5f9; color: #475569; }
        .btn-global:hover { background: #e2e8f0; }

        .company-table-container { background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
        .company-styled-table { width: 100%; border-collapse: collapse; }
        
        .company-styled-table thead th {
          background: #f8fafc; padding: 1rem 1.5rem; text-align: left;
          font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
          color: #64748b; border-bottom: 2px solid #f1f5f9;
        }

        .company-styled-table tbody td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
        
        .badge-code { background: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-weight: 600; }
        .name-link { color: #2563eb; font-weight: 600; text-decoration: underline; cursor: pointer; }
        
        /* Modal Customization */
        .custom-form .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

        @media (max-width: 1024px) {
          .hide-tablet { display: none; }
          .company-header-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .action-buttons { width: 100%; }
          .btn-add, .btn-global { flex: 1; justify-content: center; }
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none; }
          .company-dashboard-wrapper { padding: 1rem; }
          .custom-form .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}