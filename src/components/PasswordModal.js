
import React from 'react';
import './Modal.css'; // Add your styles here

const PasswordModal = ({ show, onClose, changePassword, changePassword2 }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay1">
      <div className="modal-content1">
        <h2>Welcome</h2>
        <p>Please Create Your Password</p>
        <div>
            <label className='form-label'>Create Your Password</label>
            <input className='form-control mb-2' type='number' onChange={changePassword}></input>
            <label className='form-label'>Re-Enter Password</label>
            <input className='form-control mb-2' type='number' onChange={changePassword2}></input>
        </div>
        
        <button className='btn btn-success' onClick={onClose}>Create Password</button>
      </div>
    </div>
  );
};

export default PasswordModal;
