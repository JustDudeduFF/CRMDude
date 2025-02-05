import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { usePermissions } from "./PermissionProvider";
import Denied from './subscriberpage/drawables/permissionAnimate.json'
import Lottie from 'lottie-react';
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ permission, children, Icon }) => {
  const { hasPermission } = usePermissions();
  const [modalShow, setModalShow] = useState(false);
  const navigate = useNavigate();

  if (!hasPermission(permission)) {
    // Show the modal if permission is denied
    setTimeout(() => setModalShow(true), 0); // Use a timeout to avoid calling `setState` during rendering
    return (
      <>
        
        <Modal show={modalShow} onHide={() => {setModalShow(false); navigate(-1) }} centered>
          <div className='d-flex flex-column container justify-content-center align-items-center p-3'>
              <h3 className='fw-bold text-danger'>Permission Denied</h3>
              <Lottie className='w-50' animationData={Denied}></Lottie>
              <span>Please Contact Admin!</span>
          </div>
        </Modal>
      </>
    );
  }

  // Render the children if permission is granted
  return children;
};

export default ProtectedRoute;
