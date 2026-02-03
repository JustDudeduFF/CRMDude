import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import SubscriberPersonal from "./SubscriberPersonal";
import RechargeTable from "./RechargeTable";
import { Modal } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { toast } from "react-toastify";
import { FaUserEdit, FaReceipt, FaInfoCircle, FaIdBadge } from "react-icons/fa";
import "./SubscriberDetails.css";

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
          const userData = userRes.data;
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
        className="crm-theme-modal"
      >
        <Modal.Header closeButton className="modal-gradient-header text-white">
          <Modal.Title className="fw-bold">
            Update Subscriber Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Full Name</label>
              <input
                className="form-control theme-input"
                value={subsDetail.name}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, name: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-theme-label">User ID</label>
              <input
                className="form-control theme-input"
                value={subsDetail.username}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, username: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Mobile Number</label>
              <input
                className="form-control theme-input"
                type="number"
                value={subsDetail.mobile}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, mobile: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Alternate Number</label>
              <input
                className="form-control theme-input"
                type="number"
                value={subsDetail.alternate}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, alternate: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Email</label>
              <input
                className="form-control theme-input"
                type="mail"
                value={subsDetail.email}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, email: e.target.value })
                }
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Connection Type</label>
              <select
                className="form-control theme-input"
                type="mail"
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
            <div className="col-12 col-md-6">
              <label className="form-theme-label">Colony Name</label>
              <select
                className="form-control theme-input"
                type="text"
                value={subsDetail.colonyname}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, colonyname: e.target.value })
                }
              >
                <option value="">Select Colony...</option>
                {arrayColony.map((colony, index) => (
                  <option key={index} value={colony.name}>
                    {colony.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-theme-label">Installation Address</label>
              <textarea
                className="form-control theme-input"
                rows="2"
                value={subsDetail.address}
                onChange={(e) =>
                  setSubsDetail({ ...subsDetail, address: e.target.value })
                }
              />
            </div>
            {/* Colony and other fields follow the same theme-input class */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-light border px-4"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
          <button className="btn theme-btn-submit px-4" onClick={handleUpdate}>
            Save Changes
          </button>
        </Modal.Footer>
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
