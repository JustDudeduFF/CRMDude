import React, { useState } from 'react';
import { X, Save, Building2, Smartphone, Mail, Globe, ShieldCheck, MessageSquare, CreditCard } from 'lucide-react';

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
    <div className="ep-modal-overlay">
      <div className="ep-modal-container">
        {/* Header */}
        <div className="ep-modal-header">
          <div className="ep-header-title">
            <div className="ep-icon-bg">
              <Building2 size={24} />
            </div>
            <div>
              <h3>Partner Configuration</h3>
              <p>Update company details and integration settings</p>
            </div>
          </div>
          <button className="ep-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="ep-modal-form">
          <div className="ep-scroll-area">
            
            {/* Section 1: Core Profile */}
            <div className="ep-form-section">
              <h4 className="section-tag"><User size={14} /> Basic Profile</h4>
              <div className="ep-grid">
                <div className="ep-input-group">
                  <label>Partner Name</label>
                  <input name="partnerName" value={formData.partnerName} onChange={handleChange} placeholder="Full Name" required />
                </div>
                <div className="ep-input-group">
                  <label>Company Name</label>
                  <input name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Legal Entity Name" required />
                </div>
                <div className="ep-input-group">
                  <label>Mobile Number</label>
                  <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+91..." />
                </div>
                <div className="ep-input-group">
                  <label>Email Address</label>
                  <input name="email" value={formData.email} onChange={handleChange} placeholder="contact@company.com" />
                </div>
                <div className="ep-input-group full-width">
                  <label>GSTIN</label>
                  <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="ep-input-group full-width">
                  <label>Business Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows="2" placeholder="Street, City, State, PIN" />
                </div>
              </div>
            </div>

            {/* Section 2: Communication Integration */}
            <div className="ep-form-section">
              <h4 className="section-tag"><MessageSquare size={14} /> Communication Settings</h4>
              <div className="ep-toggle-card">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>WhatsApp Automation</strong>
                    <span>Enable automated alerts via WhatsApp</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="enableWhatsapp" checked={formData.enableWhatsapp} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>
                {formData.enableWhatsapp && (
                  <div className="ep-input-group animated-fade">
                    <label>WhatsApp API Key</label>
                    <input name="whatsappApiKey" value={formData.whatsappApiKey} onChange={handleChange} type="password" />
                  </div>
                )}

                <div className="toggle-divider"></div>

                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>Email SMTP</strong>
                    <span>Send invoices and reports via Email</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="enableEmail" checked={formData.enableEmail} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>
                {formData.enableEmail && (
                  <div className="ep-grid-2 animated-fade">
                    <div className="ep-input-group">
                      <label>SMTP Host</label>
                      <input name="emailHost" value={formData.emailHost} onChange={handleChange} placeholder="smtp.gmail.com" />
                    </div>
                    <div className="ep-input-group">
                      <label>Port</label>
                      <input name="emailPort" value={formData.emailPort} onChange={handleChange} placeholder="587" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Payment Gateway */}
            <div className="ep-form-section">
              <h4 className="section-tag"><CreditCard size={14} /> Razorpay Integration</h4>
              <div className="ep-toggle-card accent-blue">
                <div className="toggle-item">
                  <div className="toggle-info">
                    <strong>Online Payments</strong>
                    <span>Allow subscribers to pay via Gateway</span>
                  </div>
                  <label className="switch">
                    <input type="checkbox" name="enableOnlinePayment" checked={formData.enableOnlinePayment} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>
                {formData.enableOnlinePayment && (
                  <div className="ep-grid-1 animated-fade">
                    <div className="ep-input-group">
                      <label>Key ID</label>
                      <input name="razorpayKeyId" value={formData.razorpayKeyId} onChange={handleChange} placeholder="rzp_live_..." />
                    </div>
                    <div className="ep-input-group">
                      <label>Key Secret</label>
                      <input name="razorpayKeySecret" value={formData.razorpayKeySecret} onChange={handleChange} type="password" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="ep-modal-footer">
            <button type="button" className="ep-btn-secondary" onClick={onClose}>Discard Changes</button>
            <button type="submit" className="ep-btn-primary">
              <Save size={18} /> Update Partner
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .ep-modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
          display: flex; justify-content: center; align-items: center; z-index: 9999;
          padding: 1rem;
        }

        .ep-modal-container {
          background: #f8fafc; width: 100%; max-width: 700px;
          max-height: 90vh; border-radius: 24px; display: flex; flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden;
        }

        .ep-modal-header {
          background: white; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center;
        }

        .ep-header-title { display: flex; align-items: center; gap: 1rem; }
        .ep-icon-bg { 
          background: #eff6ff; color: #3b82f6; padding: 12px; border-radius: 12px;
        }
        .ep-header-title h3 { margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 800; }
        .ep-header-title p { margin: 0; font-size: 0.85rem; color: #64748b; }

        .ep-close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }

        .ep-modal-form { display: flex; flex-direction: column; overflow: hidden; }
        .ep-scroll-area { padding: 2rem; overflow-y: auto; flex: 1; }

        .ep-form-section { margin-bottom: 2rem; }
        .section-tag { 
          font-size: 0.75rem; font-weight: 800; color: #94a3b8; 
          text-transform: uppercase; letter-spacing: 0.1em;
          display: flex; align-items: center; gap: 6px; margin-bottom: 1rem;
        }

        .ep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .ep-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-top: 1rem; }
        .full-width { grid-column: span 2; }

        .ep-input-group { display: flex; flex-direction: column; gap: 6px; }
        .ep-input-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .ep-input-group input, .ep-input-group textarea {
          padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 0.95rem; outline: none; transition: 0.2s;
        }
        .ep-input-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

        .ep-toggle-card { 
          background: white; border-radius: 16px; padding: 1.25rem; 
          border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .toggle-item { display: flex; justify-content: space-between; align-items: center; }
        .toggle-info { display: flex; flex-direction: column; }
        .toggle-info strong { font-size: 0.95rem; color: #1e293b; }
        .toggle-info span { font-size: 0.8rem; color: #64748b; }
        .toggle-divider { height: 1px; background: #f1f5f9; margin: 1.25rem 0; }

        /* Switch Styling */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { 
          position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #cbd5e1; transition: .4s; border-radius: 34px;
        }
        .slider:before {
          position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
          background-color: white; transition: .4s; border-radius: 50%;
        }
        input:checked + .slider { background-color: #3b82f6; }
        input:checked + .slider:before { transform: translateX(20px); }

        .ep-modal-footer {
          padding: 1.5rem 2rem; background: white; border-top: 1px solid #e2e8f0;
          display: flex; justify-content: flex-end; gap: 1rem;
        }
        .ep-btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .ep-btn-primary { background: #1e293b; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }

        .animated-fade { animation: fadeIn 0.3s ease; margin-top: 1rem; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .ep-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
          .ep-scroll-area { padding: 1.25rem; }
          .ep-modal-footer { flex-direction: column-reverse; }
          .ep-btn-primary, .ep-btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default EditPartnerModal;