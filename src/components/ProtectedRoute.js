import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { usePermissions } from "./PermissionProvider";
import Denied from './subscriberpage/drawables/permissionAnimate.json';
import Lottie from 'lottie-react';
import { useNavigate } from "react-router-dom";
import { FiShieldOff, FiArrowLeft } from "react-icons/fi";

const ProtectedRoute = ({ permission, children, Icon }) => {
  const { hasPermission } = usePermissions();
  const [modalShow, setModalShow] = useState(false);
  const navigate = useNavigate();

  if (!hasPermission(permission)) {
    // Show the modal if permission is denied
    setTimeout(() => setModalShow(true), 0);
    
    return (
      <>
        <Modal 
          show={modalShow} 
          onHide={() => { setModalShow(false); navigate(-1); }} 
          centered
          backdrop="static"
          contentClassName="access-denied-modal"
          style={{ zIndex: 3000 }} // Ensure it sits above your other redesigned modals
        >
          <div className="denied-container">
            {/* Header/Banner Section */}
            <div className="denied-header">
              <div className="denied-icon-wrap">
                <FiShieldOff size={28} />
              </div>
            </div>

            <div className="denied-content">
              <h2 className="denied-title">Restricted Access</h2>
              <p className="denied-text">
                Your current account doesn't have the <strong>{permission.replace(/_/g, ' ')}</strong> permission required to view this section.
              </p>

              <div className="lottie-wrapper">
                <Lottie 
                  animationData={Denied} 
                  loop={true} 
                  className="denied-lottie"
                />
              </div>

              <div className="admin-notice">
                <span>Please contact your system administrator to request access.</span>
              </div>
            </div>

            <div className="denied-footer">
              <button 
                className="go-back-btn" 
                onClick={() => { setModalShow(false); navigate(-1); }}
              >
                <FiArrowLeft size={18} />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </Modal>

        <style>{`
          .access-denied-modal {
            border: none !important;
            border-radius: 24px !important;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.15) !important;
          }
          
          .denied-container {
            background: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .denied-header {
            width: 100%;
            height: 80px;
            background: #fef2f2;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          }

          .denied-icon-wrap {
            background: #ef4444;
            color: white;
            padding: 15px;
            border-radius: 18px;
            box-shadow: 0 8px 16px -4px rgba(239, 68, 68, 0.4);
            position: absolute;
            bottom: -25px;
          }

          .denied-content {
            padding: 45px 30px 20px;
            text-align: center;
          }

          .denied-title {
            color: #1e293b;
            font-weight: 800;
            font-size: 1.5rem;
            margin-bottom: 12px;
          }

          .denied-text {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 20px;
          }

          .denied-text strong {
            color: #ef4444;
            text-transform: uppercase;
            font-size: 0.85rem;
          }

          .lottie-wrapper {
            width: 180px;
            margin: 0 auto 20px;
          }

          .admin-notice {
            background: #f8fafc;
            padding: 12px 20px;
            border-radius: 12px;
            border: 1px dashed #e2e8f0;
            color: #475569;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .denied-footer {
            width: 100%;
            padding: 0 30px 30px;
          }

          .go-back-btn {
            width: 100%;
            background: #1e293b;
            color: white;
            border: none;
            padding: 14px;
            border-radius: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.2s;
            cursor: pointer;
          }

          .go-back-btn:hover {
            background: #334155;
            transform: translateY(-2px);
          }

          @media (max-width: 576px) {
            .denied-content { padding: 40px 20px 15px; }
            .denied-title { font-size: 1.25rem; }
            .lottie-wrapper { width: 140px; }
          }
        `}</style>
      </>
    );
  }

  return children;
};

export default ProtectedRoute;