import React from 'react';
import { Modal } from 'react-bootstrap';
import Denied from './subscriberpage/drawables/permissionAnimate.json';
import Lottie from 'lottie-react';
import './Login.css'

function PermissionDenied({ setshow, setonHide }) {
  if (!setshow) return null;

  return (
    <Modal show={setshow} onHide={setonHide} centered className="expand-modal">
      <div className="expand-modal-content">
        {/* Header */}
        <div className="expand-modal-header">
          <h3 className="modal-title">Permission Denied</h3>
        </div>

        {/* Body */}
        <div className="permission-body">
          <Lottie className="permission-animation" animationData={Denied} />
          <span className="permission-text">Please Contact Admin!</span>
        </div>
      </div>
    </Modal>
  );
}

export default PermissionDenied;
