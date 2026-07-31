import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import SubscriberPersonal from "./SubscriberPersonal";
import RechargeTable from "./RechargeTable";
import { Modal } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { toast } from "react-toastify";
import { FaUserEdit, FaReceipt, FaInfoCircle, FaIdBadge } from "react-icons/fa";
import "./SubscriberDetails.css";
import { X } from "lucide-react";

export default function SubscriberDetails() {
  const userid = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const location = useLocation();
  const [showmodal, setShowModal] = useState(false);
  const [arrayColony, setArrayColony] = useState([]);

  const [subsDetail, setSubsDetail] = useState({
    name: "",
    address: "",
    colonyname: "",
    mobile: "",
    alternate: "",
    email: "",
    conectiontyp: "",
    companyname: "",
    username: "",
  });

  const [prevSubsDetail, setPrevSubsDetail] = useState({});

  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        const userRes = await API.get(`/subscriber/?id=${userid}`);
        if (userRes.status === 200 && userRes.data) {
          const userData = userRes.data.result;
          const info = {
            name: userData.fullname || userData.fullName || "",
            address: userData.installationAddress || "",
            colonyname: userData.colonyName || "",
            mobile: userData.mobile || userData.mobileNo || "",
            alternate: userData.alternateNo || "",
            email: userData.email || "",
            conectiontyp:
              userData.connectionType || userData.conectiontyp || "",
            companyname: userData.company || "",
            username: userData.username || "",
          };
          setSubsDetail(info);
        }
      } catch (err) {
        console.error("Error fetching subscriber details:", err);
      }
    };

    const fetchColony = async () => {
      const colonyRes = await API.get(
        `/subscriber/colonys?partnerId=${partnerId}`,
      );
      if (colonyRes.data) setArrayColony(colonyRes.data);
    };

    fetchColony();
    fetchBasicInfo();
  }, [userid, partnerId]);

  const handleUpdate = async () => {
    const changes = [];
    if (JSON.stringify(subsDetail) === JSON.stringify(prevSubsDetail)) {
      toast.error("No changes detected");
      return;
    }

    Object.keys(prevSubsDetail).forEach((key) => {
      if (subsDetail[key] !== prevSubsDetail[key]) {
        changes.push(
          `${key} changed from "${prevSubsDetail[key] || "N/A"}" to "${subsDetail[key]}"`,
        );
      }
    });

    const userData = {
      subscriberId: userid,
      updatedBy: localStorage.getItem("contact"),
      changes: changes,
      fullName: subsDetail.name,
      installationAddress: subsDetail.address,
      colonyName: subsDetail.colonyname,
      mobileNo: subsDetail.mobile,
      alternatNo: subsDetail.alternate,
      email: subsDetail.email,
      company: subsDetail.companyname,
      username: subsDetail.username,
      conectiontyp: subsDetail.conectiontyp,
    };

    try {
      const res = await API.put(`/subscriber/${userid}`, { userData });
      if (res.status === 200) {
        setShowModal(false);
        toast.success("Updated successfully");
        setPrevSubsDetail(subsDetail);
      }
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  return (
    <div className="crm-details-page">
      {/* Header Card with Gradient Theme */}
      <div className="header-card shadow-sm">
        <div className="note-container mb-3">
          <FaInfoCircle className="theme-accent-purple me-2" />
          <span>
            <strong>Recent Note:</strong> Remarks Particular Only
          </span>
        </div>

        <div className="action-grid">
          <Link
            to={
              location.pathname.includes("rechargeinfo")
                ? `/dashboard/subscriber/`
                : "rechargeinfo"
            }
            className="w-100 text-decoration-none"
          >
            <button
              className={`theme-btn ${location.pathname.includes("rechargeinfo") ? "active" : ""}`}
            >
              <FaReceipt className="me-2" />{" "}
              {location.pathname.includes("rechargeinfo")
                ? "Profile Info"
                : "Recharges"}
            </button>
          </Link>
          <button
            className="theme-btn btn-outline-purple"
            onClick={() => {
              setPrevSubsDetail(subsDetail);
              setShowModal(true);
            }}
          >
            <FaUserEdit className="me-2" /> Edit Details
          </button>
        </div>
      </div>

      <div className="content-section mt-3">
        <Routes>
          <Route path="/" element={<SubscriberPersonal />} />
          <Route path="rechargeinfo" element={<RechargeTable />} />
        </Routes>
      </div>

      {/* Styled Modal */}
      <Modal
        show={showmodal}
        onHide={() => setShowModal(false)}
        fullscreen="md-down"
        size="lg"
        centered
        className="subscriber-edit-modal"
      >
        <div className="se-header">
          <div>
            <h3 className="se-title">Update Subscriber Details</h3>
            <p className="se-subtitle">
              Edit contact and installation information
            </p>
          </div>
          <button className="se-close-btn" onClick={() => setShowModal(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="se-body">
          <div className="se-grid">
            <div className="se-field">
              <label className="se-label">Full Name</label>
              <input
                className="se-input"
                value={subsDetail.name}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, name: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label className="se-label">User ID</label>
              <input
                className="se-input"
                value={subsDetail.username}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, username: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label className="se-label">Mobile Number</label>
              <input
                className="se-input"
                type="number"
                value={subsDetail.mobile}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, mobile: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label className="se-label">Alternate Number</label>
              <input
                className="se-input"
                type="number"
                value={subsDetail.alternate}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, alternate: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label className="se-label">Email</label>
              <input
                className="se-input"
                type="email"
                value={subsDetail.email}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, email: e.target.value })
                }
              />
            </div>

            <div className="se-field">
              <label className="se-label">Connection Type</label>
              <select
                className="se-input se-select"
                value={subsDetail.conectiontyp}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, conectiontyp: e.target.value })
                }
              >
                <option value="">Select Connection Type</option>
                <option value="FTTH">FTTH</option>
                <option value="Ethernet">Ethernet</option>
                <option value="Cable">Cable</option>
              </select>
            </div>

            <div className="se-field">
              <label className="se-label">Colony Name</label>
              <select
                className="se-input se-select"
                value={subsDetail.colonyname}
                onChange={(e) => {
                  const selectedColony = arrayColony.find(
                    (colony) => colony.name === e.target.value,
                  );
                  setSubsDetail({
                    ...subsDetail,
                    colonyname: e.target.value,
                    companyname: selectedColony?.undercompany || "",
                  });
                }}
              >
                <option value="">Select Colony...</option>
                {arrayColony.map((colony) => (
                  <option key={colony._id} value={colony.name}>
                    {colony.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="se-field se-field-full">
              <label className="se-label">Installation Address</label>
              <textarea
                className="se-input se-textarea"
                rows="2"
                value={subsDetail.address}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, address: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="se-footer">
          <button className="se-btn-cancel" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button className="btn theme-btn-submit" onClick={handleUpdate}>
            Save Changes
          </button>
        </div>

        <style>{`
    .subscriber-edit-modal .modal-content {
      border: none;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .se-header {
      background: #fff;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #ececec;
    }

    .se-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.01em;
    }

    .se-subtitle {
      margin: 2px 0 0;
      font-size: 0.82rem;
      color: #999;
    }

    .se-close-btn {
      background: #f2f2f2;
      border: none;
      border-radius: 8px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      flex-shrink: 0;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .se-close-btn:hover {
      background: #e8e8e8;
      color: #1a1a1a;
    }

    .se-body {
      background: #fafafa;
      padding: 22px 24px;
      max-height: 65vh;
      overflow-y: auto;
    }

    .se-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .se-field-full {
      grid-column: 1 / -1;
    }

    .se-field {
      display: flex;
      flex-direction: column;
    }

    .se-label {
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #999;
      margin-bottom: 6px;
    }

    .se-input {
      width: 100%;
      border: 1px solid #e2e2e2;
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 0.9rem;
      color: #1a1a1a;
      background: #fff;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .se-input:focus {
      border-color: #999;
      box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
    }

    .se-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23999'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 30px;
    }

    .se-textarea {
      resize: vertical;
      font-family: inherit;
    }

    .se-footer {
      background: #fff;
      padding: 16px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #ececec;
    }

    .se-btn-cancel {
      border: 1px solid #e2e2e2;
      background: #fff;
      color: #666;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 9px 20px;
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .se-btn-cancel:hover {
      background: #f5f5f5;
      color: #1a1a1a;
    }

    .se-btn-save {
      border: none;
      background: #1a1a1a;
      color: #fff;
      font-size: 0.88rem;
      font-weight: 600;
      padding: 9px 22px;
      border-radius: 8px;
      transition: all 0.15s ease;
    }
    .se-btn-save:hover {
      background: #333;
      transform: translateY(-1px);
    }

    @media (max-width: 576px) {
      .se-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
      </Modal>

      <style>{`
        .crm-details-page {border-radius: 15px; background: #f4f6ff; min-height: 100vh; padding: 15px; }
        
        /* Header Card */
        .header-card { background: white; border-radius: 16px; padding: 20px; border: none; }
        .icon-circle-gradient { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 45px; height: 45px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .theme-label-text { font-size: 0.75rem; color: #8e99af; font-weight: 700; text-transform: uppercase; }
        .theme-heading { color: #2d3748; }
        .theme-accent-purple { color: #764ba2; }

        /* Status & Notes */
        .status-badge-glass { background: #f0f3ff; color: #667eea; padding: 5px 15px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; border: 1px solid #dce2ff; }
        .note-container { background: #f8f9ff; border-radius: 10px; padding: 12px; border-left: 4px solid #667eea; font-size: 0.85rem; color: #4a5568; }

        /* Buttons */
        .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .theme-btn { 
          background: #f0f2f5; border: none; padding: 14px; border-radius: 12px; 
          font-weight: 600; color: #4a5568; width: 100%; transition: all 0.3s ease;
        }
        .theme-btn.active { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; box-shadow: 0 4px 12px rgba(118, 75, 162, 0.2);
        }
        .btn-outline-purple { border: 2px solid #e2e8f0; background: transparent; color: #764ba2; }
        .theme-btn-submit { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; }

        /* Modal & Inputs */
        .modal-gradient-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important; }
        .form-theme-label { font-size: 0.75rem; font-weight: 700; color: #667eea; text-transform: uppercase; margin-bottom: 5px; }
        .theme-input { border-radius: 10px !important; border: 1px solid #e2e8f0 !important; padding: 12px !important; }
        .theme-input:focus { border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important; }

        @media (max-width: 576px) {
          .action-btn { font-size: 0.8rem; padding: 12px 5px; }
        }
      `}</style>
    </div>
  );
}
