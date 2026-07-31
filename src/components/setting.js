import React, { useEffect, useState, useRef } from "react";
import {
  Edit2,
  Save,
  X,
  MessageCircle,
  QrCode,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  SquareCheckBig,
  Globe,
  Info,
} from "lucide-react";
import { API } from "../FirebaseConfig";
import axios from "axios";
import { toast } from "react-toastify";

const CompanyManagement = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const isChecking = useRef(false);

  const [companyData, setCompanyData] = useState({
    name: "---  ---",
    mobile: "+91 000007777",
    email: "info@techcorp.com",
    address: "123 Business Ave, Tech City, TC 12345",
    website: "www.techcorp.com",
    description: "Leading technology solutions provider",
    gstin: "",
    isEmail: false,
    isWhatsapp: false,
    isOnline: false,
    token: "",
    whatsappIntegration: "Checking...",
    whatsappNumber: "",
    whatsappName: "",
    whatsappEngine: "",
    whatsappVersion: "",
    whatsappPresence: "",
  });
  const [restartCooldown, setRestartCooldown] = useState(0);
  const [whatsappQRData, setwhatsappQRData] = useState("");
  const [editData, setEditData] = useState({ ...companyData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...companyData });
  };
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/partner/my/${partnerId}`, {
        partnerData: {
          companyname: editData.name,
          phone: editData.mobile,
          email: editData.email,
          address: editData.address,
          website: editData.website,
          gstin: editData.gstin,
          description: editData.description,
        },
      });

      if (response.status === 200) {
        setCompanyData({ ...editData });
        setIsEditing(false);
        toast.success("Company profile updated successfully!", {
          autoClose: 2000,
        });
      } else {
        toast.error("Failed to update company profile.", {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error("Failed to update company profile.", {
        autoClose: 2000,
      });
    }
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
      const response = await API.get(`/partner/${partnerId}`);
      const data = response.data;
      const updated = {
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
        token: data.whatsappApi,
        whatsappPort: data.whatsappPort || "",
      };
      setCompanyData(updated);
      if (data.isWhatsapp)
        fetchWhatsppStatus(data.whatsappApi, data.whatsappPort);
    } catch (e) {
      console.log(e);
    }
  };

  const checkWhatsapp = async () => {
    if (isChecking.current) return;

    isChecking.current = true;

    try {
      await fetchWhatsppStatus(companyData.token, companyData.whatsappPort);
    } finally {
      isChecking.current = false;
    }
  };

  const fetchWhatsppStatus = async (apiKey, port) => {
    try {
      const baseURL = `https://dudeapi.justdude.in:${port}`;

      const { data } = await axios.get(`${baseURL}/api/sessions/default`, {
        headers: {
          "X-Api-Key": apiKey,
        },
      });

      const connected =
        data.status === "WORKING" && data.engine?.state === "CONNECTED";

      setCompanyData((prev) => ({
        ...prev,
        whatsappIntegration: connected
          ? "Connected"
          : data.status || "Disconnected",
        whatsappNumber: data.me?.id ? data.me.id.replace("@c.us", "") : "",
        whatsappName: data.me?.pushName || "",
        whatsappEngine: data.engine?.engine || "",
        whatsappVersion: data.engine?.WWebVersion || "",
        whatsappPresence: data.presence || "",
      }));

      if (connected) {
        setShowQR(false);
        setwhatsappQRData("");
        return;
      }

      // Get QR only when not connected
      const qr = await axios.get(
        `${baseURL}/api/default/auth/qr?format=image`,
        {
          headers: {
            "X-Api-Key": apiKey,
            Accept: "image/png",
          },
          responseType: "blob",
        },
      );

      const qrUrl = URL.createObjectURL(qr.data);

      setwhatsappQRData(qrUrl);
      setShowQR(true);
    } catch (err) {
      console.log(err);

      setCompanyData((prev) => ({
        ...prev,
        whatsappIntegration: "Offline",
      }));

      setShowQR(false);
    }
  };

  const restartSession = async (apiKey, port) => {
    try {
      const baseURL = `https://dudeapi.justdude.in:${port}`;

      await axios.post(
        `${baseURL}/api/sessions/default/restart`,
        {},
        {
          headers: {
            "X-Api-Key": apiKey,
          },
        },
      );

      // Start 45s cooldown
      setRestartCooldown(45);

      // After restarting, check the status again
      checkWhatsapp();
    } catch (err) {
      console.log("Error restarting session:", err);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    if (restartCooldown <= 0) return;

    const timer = setInterval(() => {
      setRestartCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [restartCooldown]);

  useEffect(() => {
    if (!companyData.token || !companyData.whatsappPort) return;

    checkWhatsapp();

    const interval = setInterval(checkWhatsapp, 5000);

    return () => clearInterval(interval);
  }, [companyData.token, companyData.whatsappPort]);

  return (
    <div className="mgmt-wrapper">
      <div className="container-fluid py-4 max-width-xl">
        {/* Header Action Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-1">Company Profile</h2>
            <p className="text-muted small mb-0">
              Manage your business identity and integrations
            </p>
          </div>
          <div className="action-group">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="btn-modern btn-primary-modern"
              >
                <Edit2 size={18} /> <span>Edit Profile</span>
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  onClick={handleSave}
                  className="btn-modern btn-success-modern"
                >
                  <Save size={18} /> <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-modern btn-outline-modern"
                >
                  <X size={18} /> <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Form Details */}
          <div className="col-xl-8">
            <div className="glass-card p-4">
              <div className="section-title mb-4">
                <Building2 size={20} className="text-primary" />
                <span>General Information</span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="modern-label">Company Legal Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display">{companyData.name}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="modern-label">GSTIN Identification</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.gstin}
                      onChange={(e) =>
                        handleInputChange("gstin", e.target.value)
                      }
                      className="modern-input"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  ) : (
                    <div className="data-display">
                      {companyData.gstin || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="modern-label">
                    <Phone size={14} /> Contact Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.mobile}
                      onChange={(e) =>
                        handleInputChange("mobile", e.target.value)
                      }
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display">{companyData.mobile}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="modern-label">
                    <Mail size={14} /> Business Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display">{companyData.email}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="modern-label">
                    <Globe size={14} /> Official Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display">{companyData.website}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="modern-label">
                    <MapPin size={14} /> Registered Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows="2"
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display address-box">
                      {companyData.address}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="modern-label">
                    <Info size={14} /> Business Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows="3"
                      className="modern-input"
                    />
                  ) : (
                    <div className="data-display description-box">
                      {companyData.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Service Grid */}
              <div className="mt-5">
                <h6 className="fw-bold text-dark mb-3">Activated Services</h6>
                <div className="service-grid">
                  <ServiceToggle
                    label="Email"
                    active={companyData.isEmail}
                    icon={<Mail size={18} />}
                  />
                  <ServiceToggle
                    label="WhatsApp"
                    active={companyData.isWhatsapp}
                    icon={<MessageCircle size={18} />}
                  />
                  <ServiceToggle
                    label="Payments"
                    active={companyData.isOnline}
                    icon={<CreditCard size={18} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Integration Panel */}
          <div className="col-xl-4">
            <div
              className={`glass-card p-4 h-100 ${showQR ? "border-success" : ""}`}
            >
              <div className="section-title mb-4">
                <MessageCircle size={20} className="text-success" />
                <span>WhatsApp Node</span>
              </div>

              <div className="status-banner mb-4">
                <span
                  className={`status-dot ${companyData.whatsappIntegration
                    .toLowerCase()
                    .replace(/ /g, "_")}`}
                ></span>
                <span className="fw-bold">
                  {companyData.whatsappIntegration}
                </span>
              </div>

              <div className="qr-container text-center">
                {/* Connected */}
                {companyData.whatsappIntegration === "Connected" && (
                  <div className="qr-placeholder">
                    <div className="success-icon-wrap">
                      <SquareCheckBig size={64} className="text-success" />
                    </div>

                    <h5 className="mt-3 fw-bold">WhatsApp Connected</h5>

                    <p className="text-muted small">
                      Your WhatsApp instance is connected and active.
                    </p>

                    <div className="mt-3">
                      <div className="data-display">
                        <strong>Status:</strong> Connected
                      </div>

                      <div className="data-display mt-2">
                        <strong>Number:</strong>{" "}
                        {companyData.whatsappNumber || "--"}
                      </div>

                      <div className="data-display mt-2">
                        <strong>Name:</strong>{" "}
                        {companyData.whatsappName || "--"}
                      </div>

                      <div className="data-display mt-2">
                        <strong>Presence:</strong>{" "}
                        {companyData.whatsappPresence}
                      </div>

                      <div className="data-display mt-2">
                        <strong>Engine:</strong> {companyData.whatsappEngine}
                      </div>

                      <div className="data-display mt-2">
                        <strong>Version:</strong> {companyData.whatsappVersion}
                      </div>
                    </div>
                  </div>
                )}

                {/* Need QR */}
                {companyData.whatsappIntegration === "SCAN_QR_CODE" && (
                  <div className="qr-active">
                    <div className="qr-frame">
                      <img
                        src={whatsappQRData}
                        alt="WhatsApp QR"
                        className="qr-img"
                      />
                    </div>

                    <p className="mt-3 text-muted small">
                      Scan this QR code from WhatsApp Linked Devices.
                    </p>
                  </div>
                )}

                {/* Offline */}
                {(companyData.whatsappIntegration === "FAILED" ||
                  companyData.whatsappIntegration === "Offline") && (
                  <div className="qr-placeholder">
                    <div className="success-icon-wrap">
                      <X size={64} className="text-danger" />
                    </div>

                    <h5 className="mt-3 fw-bold text-danger">
                      WhatsApp Offline
                    </h5>

                    <p className="text-muted">
                      WhatsApp server is not reachable or the session has
                      stopped.
                    </p>
                    <button
                      className="btn-modern btn-primary-modern mt-3"
                      disabled={restartCooldown > 0}
                      onClick={() =>
                        restartSession(
                          companyData.token,
                          companyData.whatsappPort,
                        )
                      }
                    >
                      {restartCooldown > 0
                        ? `Retry in ${restartCooldown}s`
                        : "Restart Connection"}
                    </button>
                  </div>
                )}

                {/* Starting */}
                {companyData.whatsappIntegration === "STARTING" && (
                  <div className="qr-placeholder">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    />

                    <h5 className="mt-3">Starting WhatsApp...</h5>

                    <p className="text-muted">
                      Please wait while WhatsApp starts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mgmt-wrapper {
          background-color: #f0f2f5;
          min-height: 100vh;
          padding-top: 0px;
        }
        .max-width-xl { max-width: 100%; margin: 0 auto; }
        .glass-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          transition: transform 0.3s ease;
        }
        .section-title {
          display: flex; align-items: center; gap: 10px;
          font-weight: 800; color: #1e293b; font-size: 1.1rem;
        }
        .modern-label {
          font-size: 0.75rem; font-weight: 700; color: #64748b;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 6px; display: flex; align-items: center; gap: 5px;
        }
        .modern-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 2px solid #e2e8f0; background: #f8fafc;
          transition: all 0.2s;
        }
        .modern-input:focus {
          border-color: #3b82f6; background: #fff; outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .data-display {
          padding: 12px 16px; background: #f8fafc; border-radius: 12px;
          color: #1e293b; font-weight: 500; border: 1px solid #f1f5f9;
        }
        .address-box, .description-box { min-height: 60px; line-height: 1.5; }
        
        .btn-modern {
          padding: 10px 20px; border-radius: 12px; border: none;
          font-weight: 700; display: flex; align-items: center; gap: 8px;
          transition: all 0.2s; cursor: pointer;
        }
        .btn-primary-modern { background: #3b82f6; color: white; }
        .btn-success-modern { background: #10b981; color: white; }
        .btn-outline-modern { background: #f1f5f9; color: #475569; }
        .btn-modern:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .btn-modern:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .service-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px;
        }
        .service-badge {
          display: flex; align-items: center; gap: 10px; padding: 12px;
          border-radius: 14px; border: 1px solid #e2e8f0; background: #fff;
          opacity: 0.5; transition: 0.3s;
        }
        .service-badge.active { opacity: 1; border-color: #3b82f6; background: #eff6ff; color: #1e40af; }

        .status-banner {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; background: #f8fafc; border-radius: 30px; width: fit-content;
        }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot.connected { background: #10b981; box-shadow: 0 0 8px #10b981; }
        .status-dot.failed { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
        .status-dot.stopped { background: #424242; box-shadow: 0 0 8px #424242; }
        .status-dot.scanqrcode { background: #facc15; box-shadow: 0 0 8px #facc15; }

        .qr-frame {
          padding: 15px; background: white; border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: inline-block;
        }
        .qr-img { width: 220px; height: 220px; border-radius: 10px; }
        .success-icon-wrap {
          width: 100px; height: 100px; background: #ecfdf5;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; margin: 0 auto;
        }

        @media (max-width: 768px) {
          .mgmt-wrapper { padding-top: 100px; }
          .action-group .btn-modern { width: 100%; justify-content: center; }
          .service-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

const ServiceToggle = ({ label, active, icon }) => (
  <div className={`service-badge ${active ? "active" : ""}`}>
    <div className="icon-box">{icon}</div>
    <div className="d-flex flex-column">
      <span className="fw-bold small">{label}</span>
      <span style={{ fontSize: "10px" }}>{active ? "Enabled" : "Locked"}</span>
    </div>
  </div>
);

export default CompanyManagement;
