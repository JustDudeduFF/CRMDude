import React, { useState } from 'react';
import './EditPartnerModal.css';

const EditPartnerModal = ({ isOpen, onClose, partnerData, onSave }) => {
  const [formData, setFormData] = useState({
    partnerName: partnerData?.partnerName || '',
    companyName: partnerData?.companyName || '',
    mobile: partnerData?.mobile || '',
    email: partnerData?.email || '',
    gstin: partnerData?.gstin || '',
    address: partnerData?.address || '',
    enableWhatsapp: partnerData?.enableWhatsapp || false,
    enableEmail: partnerData?.enableEmail || false,
    enableOnlinePayment: partnerData?.enableOnlinePayment || false,
    whatsappApiKey: partnerData?.whatsappApiKey || '',
    emailHost: partnerData?.emailHost || '',
    emailPort: partnerData?.emailPort || '',
    razorpayKeyId: partnerData?.razorpayKeyId || '',
    razorpayKeySecret: partnerData?.razorpayKeySecret || ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
        <div className="expand-modal">
          <div className="expand-modal-content">
            <div className="expand-modal-header">
              <h4 className="modal-title">Payment Authorization</h4>
              <div className="modal-actions">
                <img
                  onClick={() => downloadExcel(true)}
                  src={ExcelIcon}
                  alt="excel"
                  className="excel-download-icon ms-auto"
                />
                <button
                  className="btn-close"
                  onClick={() => {
                    modalShow();
                    setSelectedRows([]);
                  }}
                />
              </div>
            </div>
    
            <form className="filter-form">
              <div className="form-group">
                <label>Start Date</label>
                <input className="form-control" type="date" />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input className="form-control" type="date" />
              </div>
              <div className="form-group">
                <label>Search user ID</label>
                <input
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="form-control"
                  type="text"
                  placeholder="e.g. UserID"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchRevenue();
                    }
                  }}
                />
              </div>
              <div className="form-group">
                <label>Authorization</label>
                <button
                  onClick={handleAuthorize}
                  disabled={selectedRows.length === 0}
                  className={
                    selectedRows.length === 0
                      ? "btn btn-disabled"
                      : "btn btn-success"
                  }
                >
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
  );
};

export default EditPartnerModal;
