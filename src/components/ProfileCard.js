import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { User, Calendar, Lock, LogOut, ChevronRight } from "lucide-react";
import "./Profile_Card.css";

export default function Profile_Card({ onClose }) {
  const navigate = useNavigate();
  const cardRef = useRef(null); // Reference to the card container
  const [passmodal, setShowPassModal] = useState(false);

  // Close card when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // If the click is outside the card and the password modal isn't open
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        !passmodal
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, passmodal]);

  const handleUserLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const items = [
    {
      text: "Profile View",
      icon: <User size={18} />,
      onClick: () => {
        navigate("/dashboard/myprofile");
        onClose();
      },
    },
    { text: "My Attendance", icon: <Calendar size={18} />, onClick: () => {} },
    {
      text: "Change Password",
      icon: <Lock size={18} />,
      onClick: () => {
        setShowPassModal(true);
      },
    },
    {
      text: "Logout",
      icon: <LogOut size={18} />,
      onClick: handleUserLogout,
      isLogout: true,
    },
  ];

  return (
    <>
      {/* Semi-transparent overlay to catch clicks and blur background */}
      <div className="crm-profile-overlay">
        <div className="crm-profile-fixed-card" ref={cardRef}>
          <div className="crm-profile-list">
            {items.map((item, index) => (
              <div
                key={index}
                className={`crm-profile-item ${item.isLogout ? "logout-item" : ""}`}
                onClick={item.onClick}
              >
                <div className="item-content">
                  <span className="item-icon">{item.icon}</span>
                  <span className="item-text">{item.text}</span>
                </div>
                <ChevronRight size={14} className="arrow-icon" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        show={passmodal}
        onHide={() => {onClose(); setShowPassModal(false);}}
        centered
        style={{ zIndex: 2000 }}
        contentClassName="security-modal-custom"
      >
        <div className="security-card">
          {/* Header with gradient accent */}
          <div className="security-header">
            <div className="header-content">
              <div className="security-badge">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h5 className="security-title">Security Settings</h5>
                <p className="security-subtitle">
                  Update your account credentials
                </p>
              </div>
            </div>
            <button
              className="close-minimal"
              onClick={() => setShowPassModal(false)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <Modal.Body className="security-body">
            {/* Current Password Field */}
            <div className="input-field-group">
              <label className="input-label">Current Password</label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  className="modern-input"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* New Password Field */}
            <div className="input-field-group">
              <label className="input-label">New Password</label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z"></path>
                </svg>
                <input
                  className="modern-input"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>
              <small className="field-hint">
                Minimum 8 characters with a symbol.
              </small>
            </div>
          </Modal.Body>

          <Modal.Footer className="security-footer">
            <button
              className="cancel-link"
              onClick={() => setShowPassModal(false)}
            >
              Cancel
            </button>
            <button className="submit-action-btn">
              <span>Update Password</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </Modal.Footer>
        </div>

        <style>{`
    .security-modal-custom {
      border: none !important;
      border-radius: 20px !important;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    }
    .security-card { background: #fff; }
    
    .security-header {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border-bottom: 1px solid #f1f5f9;
    }
    .header-content { display: flex; gap: 15px; align-items: center; }
    .security-badge {
      background: #3b82f6; color: white;
      padding: 10px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
    }
    .security-title { font-weight: 800; color: #1e293b; margin: 0; font-size: 1.1rem; }
    .security-subtitle { font-size: 0.8rem; color: #64748b; margin: 0; }
    .close-minimal {
      background: #f1f5f9; border: none; color: #94a3b8;
      padding: 5px; border-radius: 8px; cursor: pointer; transition: 0.2s;
    }
    .close-minimal:hover { background: #fee2e2; color: #ef4444; }

    .security-body { padding: 24px !important; }
    .input-field-group { margin-bottom: 20px; }
    .input-label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: block; }
    
    .input-with-icon { position: relative; }
    .field-icon {
      position: absolute; left: 14px; top: 50%;
      transform: translateY(-50%); color: #94a3b8;
    }
    .modern-input {
      width: 100%; padding: 12px 12px 12px 42px;
      border-radius: 12px; border: 2px solid #e2e8f0;
      font-size: 0.95rem; transition: all 0.2s; background: #f8fafc;
    }
    .modern-input:focus {
      border-color: #3b82f6; background: #fff;
      outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
    .field-hint { font-size: 0.7rem; color: #94a3b8; margin-top: 6px; display: block; }

    .security-footer {
      padding: 16px 24px 24px !important;
      border: none !important;
      display: flex; justify-content: space-between; align-items: center;
    }
    .cancel-link {
      background: transparent; border: none; color: #64748b;
      font-weight: 600; font-size: 0.9rem; cursor: pointer;
    }
    .submit-action-btn {
      background: #1e293b; color: white; border: none;
      padding: 12px 20px; border-radius: 12px;
      font-weight: 700; display: flex; align-items: center; gap: 10px;
      cursor: pointer; transition: 0.2s;
    }
    .submit-action-btn:hover { background: #334155; transform: translateY(-1px); }

    @media (max-width: 576px) {
      .security-footer { flex-direction: column-reverse; gap: 15px; }
      .submit-action-btn { width: 100%; justify-content: center; }
    }
  `}</style>
      </Modal>
    </>
  );
}
