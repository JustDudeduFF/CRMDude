import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { usePermissions } from "./PermissionProvider";
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
        {/* Permission Denied Modal */}
        <Modal show={modalShow} onHide={() => {setModalShow(false); navigate(-1) }} centered>
          <Modal.Header closeButton>
            <Modal.Title>Permission Denied</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <div className="d-flex flex-column align-items-center">
              {Icon && <img src={Icon} alt="Permission Denied" className="img-fluid mb-3" />}
              <p>You do not have the necessary permissions to access this page.</p>
              <p>Please contact your administrator for assistance.</p>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }

  // Render the children if permission is granted
  return children;
};

export default ProtectedRoute;
