import React, { useState, useEffect } from "react";
import { API } from "../../FirebaseConfig";
import {
  Cpu,
  Hash,
  Monitor,
  Settings,
  Save,
  X,
  HardDrive,
  Layers,
  Tag,
} from "lucide-react";

export default function RackDataModal({
  show,
  officename,
  closeModal,
  count = 0,
  rackId,
  officeKey,
  onDeviceAdded,
}) {
  const [device, setDevice] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceKey, setDeviceKey] = useState(count + 1);
  const [serialNo, setSerialNo] = useState("");
  const [loading, setLoading] = useState(false);

  // OLT state
  const [manufacturer, setManufacturer] = useState("");
  const [oltType, setOltType] = useState("");
  const [ponRange, setPonRange] = useState("4");
  const [sfpRange, setSfpRange] = useState("4");
  const [ethernetRange, setEthernetRange] = useState("4");

  // Switch state
  const [isethernet, setIsEthernet] = useState(true);
  const [swethernetrange, setSWEthernetRange] = useState("8");
  const [swsfpsrange, setSWSfpsRange] = useState("4");
  const [swmanufacture, setSWManufacture] = useState("");
  const [swisp, setSWIsp] = useState("");

  // FMS state
  const [fmsname, setFMSName] = useState("");
  const [fmsrange, setFMSRange] = useState("48");

  // Update default deviceKey and deviceId when modal opens or count changes
  useEffect(() => {
    const nextKey = Number(count) + 1;
    setDeviceKey(nextKey);
    if (device) {
      setDeviceId(`${device.toUpperCase()}-${String(nextKey).padStart(2, "0")}`);
    }
  }, [count, device, show]);

  // Reset form when modal closes
  const handleClose = () => {
    setDevice("");
    setDeviceId("");
    setSerialNo("");
    setManufacturer("");
    setOltType("");
    setPonRange("4");
    setSfpRange("4");
    setEthernetRange("4");
    setSWManufacture("");
    setSWIsp("");
    setSWEthernetRange("8");
    setSWSfpsRange("4");
    setFMSName("");
    setFMSRange("48");
    closeModal();
  };

  const handleDeviceChange = (selectedDevice) => {
    setDevice(selectedDevice);
    if (selectedDevice) {
      setDeviceId(`${selectedDevice.toUpperCase()}-${String(deviceKey).padStart(2, "0")}`);
    } else {
      setDeviceId("");
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();

    if (!rackId || !officeKey) {
      alert("Error: Rack ID or Office Key is missing.");
      return;
    }

    const cleanDeviceId = deviceId.trim();
    if (!cleanDeviceId || cleanDeviceId.includes(".") || cleanDeviceId.startsWith("$")) {
      alert("Invalid Device ID. Device ID cannot be empty, contain '.', or start with '$'.");
      return;
    }

    let payload = {
      deviceId: cleanDeviceId,
      device,
      deviceKey: Number(deviceKey),
      serialNo: serialNo.trim(),
    };

    if (device === "OLT") {
      payload = {
        ...payload,
        manufacturer: manufacturer.trim(),
        oltType,
        ponRange: Number(ponRange) || 4,
        sfpRange: Number(sfpRange) || 4,
        ethernetRange: Number(ethernetRange) || 4,
      };
    } else if (device === "Switch") {
      payload = {
        ...payload,
        swmanufacture: swmanufacture.trim(),
        swisp: swisp.trim(),
        swethernetrange: isethernet ? Number(swethernetrange) || 8 : 0,
        swsfpsrange: Number(swsfpsrange) || 4,
      };
    } else if (device === "FMS") {
      payload = {
        ...payload,
        fmsname: fmsname.trim(),
        fmsrange: Number(fmsrange) || 48,
      };
    } else {
      alert("Please select a valid device category.");
      return;
    }

    try {
      setLoading(true);
      await API.post(`/rackinfo/${rackId}/offices/${officeKey}/devices`, payload);
      alert(`${device} [${cleanDeviceId}] added successfully!`);

      handleClose();
      if (typeof onDeviceAdded === "function") {
        onDeviceAdded();
      }
    } catch (error) {
      console.error("Error provisioning device:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to deploy device to rack.";
      alert(`Deployment failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-card">
        {/* Header */}
        <div className="modal-header-styled">
          <div className="d-flex align-items-center gap-3">
            <div className="icon-badge">
              <PlusSquare size={20} />
            </div>
            <div>
              <h5 className="m-0 fw-bold">Provision New Device</h5>
              <small className="text-muted">
                Rack Position #{deviceKey} | {officename}
              </small>
            </div>
          </div>
          <button onClick={handleClose} className="close-circle-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <form className="modal-body-scrollable" onSubmit={handleDeploy}>
          {/* Primary Section */}
          <div className="form-section">
            <div className="section-title">
              <Cpu size={16} /> Basic Configuration
            </div>
            <div className="row g-3">
              {/* Category */}
              <div className="col-md-6">
                <label className="custom-label">Device Category</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Monitor size={16} />
                  </span>
                  <select
                    className="form-select custom-input"
                    value={device}
                    onChange={(e) => handleDeviceChange(e.target.value)}
                    required
                  >
                    <option value="">Select Category...</option>
                    <option value="OLT">OLT (Optical Line Terminal)</option>
                    <option value="Switch">Network Switch</option>
                    <option value="FMS">FMS (Fiber Mgmt System)</option>
                  </select>
                </div>
              </div>

              {/* Device ID */}
              <div className="col-md-6">
                <label className="custom-label">Device Identifier (Map Key)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Tag size={16} />
                  </span>
                  <input
                    className="form-control custom-input"
                    type="text"
                    placeholder="e.g. OLT001, SW-CORE-01"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Serial Number */}
              <div className="col-md-6">
                <label className="custom-label">Hardware Serial No.</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Hash size={16} />
                  </span>
                  <input
                    className="form-control custom-input"
                    type="text"
                    placeholder="e.g. SN-9920-X1"
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Device Key */}
              <div className="col-md-6">
                <label className="custom-label">Device Key (Rack Slot Index)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <Layers size={16} />
                  </span>
                  <input
                    className="form-control custom-input"
                    type="number"
                    min="1"
                    value={deviceKey}
                    onChange={(e) => setDeviceKey(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Specifications */}
          {device && (
            <div className="form-section animate-slide-in">
              <div className="section-title">
                <Settings size={16} /> {device} Specifications
              </div>

              {/* OLT Specific UI */}
              {device === "OLT" && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="custom-label">Manufacturer</label>
                    <input
                      className="form-control custom-input"
                      type="text"
                      placeholder="e.g. Huawei, ZTE, SYROTECH"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="custom-label">Protocol Type</label>
                    <select
                      className="form-select custom-input"
                      value={oltType}
                      onChange={(e) => setOltType(e.target.value)}
                      required
                    >
                      <option value="">Choose...</option>
                      <option value="EPON">EPON</option>
                      <option value="GPON">GPON</option>
                      <option value="XGS-PON">XGS-PON</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="custom-label">PON Capacity</label>
                    <select
                      className="form-select custom-input"
                      value={ponRange}
                      onChange={(e) => setPonRange(e.target.value)}
                      required
                    >
                      <option value="4">4 Ports</option>
                      <option value="8">8 Ports</option>
                      <option value="16">16 Ports</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="custom-label">Uplink SFP Ports</label>
                    <select
                      className="form-select custom-input"
                      value={sfpRange}
                      onChange={(e) => setSfpRange(e.target.value)}
                      required
                    >
                      <option value="4">4 SFP</option>
                      <option value="8">8 SFP</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="custom-label">Ethernet Uplink</label>
                    <select
                      className="form-select custom-input"
                      value={ethernetRange}
                      onChange={(e) => setEthernetRange(e.target.value)}
                      required
                    >
                      <option value="4">4 Eth</option>
                      <option value="8">8 Eth</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Switch Specific UI */}
              {device === "Switch" && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="custom-label">Vendor / Manufacturer</label>
                    <input
                      className="form-control custom-input"
                      type="text"
                      placeholder="e.g. Cisco, D-Link, MikroTik"
                      value={swmanufacture}
                      onChange={(e) => setSWManufacture(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="custom-label">ISP Assignment</label>
                    <input
                      className="form-control custom-input"
                      type="text"
                      placeholder="e.g. Airtel, Tata, BSNL"
                      value={swisp}
                      onChange={(e) => setSWIsp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="custom-label">Ethernet Capability</label>
                    <select
                      className="form-select custom-input"
                      value={String(isethernet)}
                      onChange={(e) => setIsEthernet(e.target.value === "true")}
                      required
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>
                  {isethernet && (
                    <div className="col-md-6">
                      <label className="custom-label">Ethernet Ports</label>
                      <select
                        className="form-select custom-input"
                        value={swethernetrange}
                        onChange={(e) => setSWEthernetRange(e.target.value)}
                        required
                      >
                        <option value="8">8 Ports</option>
                        <option value="16">16 Ports</option>
                        <option value="24">24 Ports</option>
                        <option value="48">48 Ports</option>
                      </select>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="custom-label">SFP Interface Range</label>
                    <select
                      className="form-select custom-input"
                      value={swsfpsrange}
                      onChange={(e) => setSWSfpsRange(e.target.value)}
                      required
                    >
                      <option value="2">2 SFP</option>
                      <option value="4">4 SFP</option>
                      <option value="8">8 SFP</option>
                    </select>
                  </div>
                </div>
              )}

              {/* FMS Specific UI */}
              {device === "FMS" && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="custom-label">Module / Shelf Name</label>
                    <input
                      className="form-control custom-input"
                      type="text"
                      placeholder="e.g. FMS-RACK-01"
                      value={fmsname}
                      onChange={(e) => setFMSName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="custom-label">Patch Panel Ports</label>
                    <select
                      className="form-select custom-input"
                      value={fmsrange}
                      onChange={(e) => setFMSRange(e.target.value)}
                      required
                    >
                      <option value="12">12 Ports</option>
                      <option value="24">24 Ports</option>
                      <option value="48">48 Ports</option>
                      <option value="96">96 Ports</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="modal-footer-styled">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save-device"
              disabled={!device || loading}
            >
              <Save size={18} /> {loading ? "Deploying..." : "Deploy to Rack"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 15px;
        }

        .custom-modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 650px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-header-styled {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .icon-badge {
          background: #3b82f6;
          color: white;
          padding: 10px;
          border-radius: 12px;
          display: flex;
        }

        .close-circle-btn {
          background: white;
          border: 1px solid #e2e8f0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          color: #64748b;
        }

        .close-circle-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .modal-body-scrollable {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 13px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .custom-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }

        .custom-input {
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .custom-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .modal-footer-styled {
          padding-top: 20px;
          margin-top: 20px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 20px;
          border-radius: 10px;
          background: #f1f5f9;
          border: none;
          color: #64748b;
          font-weight: 600;
          transition: 0.2s;
        }

        .btn-save-device {
          padding: 10px 24px;
          border-radius: 10px;
          background: #2563eb;
          color: white;
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: 0.2s;
        }

        .btn-save-device:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .btn-save-device:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .animate-slide-in {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .custom-modal-card {
            max-height: 95vh;
            border-radius: 24px 24px 0 0;
          }

          .custom-modal-overlay {
            padding: 0;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
}

function PlusSquare(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}