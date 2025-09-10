import React, { useEffect, useState } from "react";
import {
  Edit2,
  Save,
  X,
  Plus,
  MessageCircle,
  QrCode,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  SquareCheckBig 
} from "lucide-react";
import axios from "axios";
import { api2 } from "../FirebaseConfig";
import { data } from "react-router-dom";

const CompanyManagement = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedCompanyForWhatsApp, setSelectedCompanyForWhatsApp] =
    useState("");

  // Main company data
  const [companyData, setCompanyData] = useState({
    name: "TechCorp Solutions",
    mobile: "+1-555-0123",
    email: "info@techcorp.com",
    address: "123 Business Ave, Tech City, TC 12345",
    website: "www.techcorp.com",
    description: "Leading technology solutions provider",
    CreditCard: "",
    isEmail: false,
    isWhatsapp: false,
    isOnline: false,
    token:""
  });

  const [whatsappQRData, setwhatsappQRData] = useState("");

  const [editData, setEditData] = useState({ ...companyData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...companyData });
  };

  const handleSave = () => {
    setCompanyData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...companyData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };


  const fetchCompany = async () => {
    try {
      const response = await axios.get(api2 + "/partner/" + partnerId);
      const data = response.data;
      setCompanyData({
        name: data.companyname,
        mobile: data.phone,
        email: data.email,
        address: data.address,
        website: data.website,
        gstin: data.gstin,
        isEmail: data.isEmail,
        isWhatsapp: data.isWhatsapp,
        isOnline: data.isPayment,
        whatsappIntegration: data.isWhatsapp
          ? "Service Running"
          : "Not Activated",
          token:data.whatsappApi
      });

      if (data.isWhatsapp) {
        fetchWhatsppStatus(data.whatsappApi);
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };

  const fetchWhatsppStatus = async (token) => {
    try {
      const resposne = await axios.get(
        "https://api.justdude.in:4000/api/status?token=" + token
      );
      const data = resposne.data;
      if (!data.ready) {
        const res = await axios.get("https://api.justdude.in:4000/api/qr?token=" + token);
        setwhatsappQRData(res.data.qrCode);
        setShowQR(true);
        return;
      }
      setShowQR(false);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <>
      <div
        className="container-fluid py-4"
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          marginTop: "4%",
        }}
      >
        <div className="row g-4">
          {/* Main Company Details */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0 d-flex align-items-center">
                  <Building2 className="me-2 text-primary" />
                  Company Details
                </h4>
                <div className="btn-group">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="btn btn-primary d-flex align-items-center"
                    >
                      <Edit2 size={16} className="me-1" />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn btn-success d-flex align-items-center me-2"
                      >
                        <Save size={16} className="me-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-secondary d-flex align-items-center"
                      >
                        <X size={16} className="me-1" />
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      <div className="form-control bg-light">
                        {companyData.name}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">GSTIN</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.gstin}
                        onChange={(e) =>
                          handleInputChange("gstin", e.target.value)
                        }
                        className="form-control"
                        placeholder="Enter GST Number"
                      />
                    ) : (
                      <div className="form-control bg-light">
                        {companyData.gstin || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center">
                      <Phone size={16} className="me-1" />
                      Mobile
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.mobile}
                        onChange={(e) =>
                          handleInputChange("mobile", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      <div className="form-control bg-light">
                        {companyData.mobile}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label d-flex align-items-center">
                      <Mail size={16} className="me-1" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      <div className="form-control bg-light">
                        {companyData.email}
                      </div>
                    )}
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editData.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      <div className="form-control bg-light">
                        {companyData.website}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label d-flex align-items-center">
                      <MapPin size={16} className="me-1" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        rows="2"
                        className="form-control"
                      />
                    ) : (
                      <div
                        className="form-control bg-light"
                        style={{ minHeight: "60px" }}
                      >
                        {companyData.address}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    {isEditing ? (
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows="3"
                        className="form-control"
                      />
                    ) : (
                      <div
                        className="form-control bg-light"
                        style={{ minHeight: "80px" }}
                      >
                        {companyData.description}
                      </div>
                    )}
                  </div>

                  {/* View-only checkbox fields */}
                  <div className="col-12">
                    <hr className="my-3" />
                    <h6 className="text-muted mb-3">Service Options</h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={companyData.isEmail || false}
                            disabled
                            id="emailService"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="emailService"
                          >
                            <Mail size={16} className="me-1" />
                            Email Service
                          </label>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={companyData.isWhatsapp || false}
                            disabled
                            id="whatsappService"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="whatsappService"
                          >
                            <MessageCircle size={16} className="me-1" />
                            WhatsApp Service
                          </label>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={companyData.isPayment || false}
                            disabled
                            id="paymentService"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="paymentService"
                          >
                            <CreditCard size={16} className="me-1" />
                            Payment Service
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp QR Section */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <MessageCircle className="me-2 text-success" />
                  {`WhatsApp Integration (${companyData.whatsappIntegration})`}
                </h5>
              </div>

              <div className="card-body text-center">
                {showQR ? (
                  <div className="d-flex flex-column align-items-center">
                    <div
                      className="d-flex flex-column align-items-center justify-content-center border rounded p-4 mt-2"
                      style={{
                        width: "200px",
                        height: "200px",
                        backgroundColor: "#fff",
                      }}
                    >
                      <img
                        style={{ width: "200px", height: "200px" }}
                        src={whatsappQRData}
                      ></img>

                      <small
                        className="text-primary text-break mt-1"
                        style={{ fontSize: "10px" }}
                      >
                        {}...
                      </small>
                    </div>
                    <div className="mt-3">
                      <small className="text-muted d-block mb-2">
                        Scan to start WhatsApp chat
                      </small>
                      <button
                        onClick={() => setShowQR(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Hide QR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      className="d-flex align-items-center justify-content-center border border-dashed rounded mb-3"
                      style={{
                        width: "200px",
                        height: "200px",
                        margin: "0 auto",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <SquareCheckBig size={80} className="text-muted" />
                    </div>
                    <button
                      disabled={whatsappQRData}
                      onClick={() => fetchWhatsppStatus(companyData.token)}
                      className="btn btn-success d-flex align-items-center mx-auto"
                    >
                      <QrCode size={16} className="me-2" />
                      {whatsappQRData ? "Refresh" : "Activated"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyManagement;
