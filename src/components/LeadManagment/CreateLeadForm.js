import { get, onValue, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig';
import { User, Mail, Phone, MapPin, Building, UserCheck, X, Send } from 'lucide-react';

export default function CreateLeadForm({ showModal, modalClose }) {
  const muDesignation = localStorage.getItem('Designation');
  const myMobile = localStorage.getItem('contact');
  const [arrayemp, setEmpArray] = useState([]);
  const [arraycompany, setArrayCompany] = useState([]);

  const [formData, setFormData] = useState({
    generatedDate: new Date().toISOString().split('T')[0],
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phone: '',
    companyName: '',
    assignedto: '',
    date: new Date().toISOString().split('T')[0],
    leadsource: muDesignation === 'Sales' ? 'sales_team' : 'employee',
    generatename: myMobile,
    type: 'lead',
    status: 'assigned'
  });

  const companyRef = ref(db, 'Master/companys');
  const empRef = ref(db, `users`);

  useEffect(() => {
    const fetchCompany = onValue(companyRef, (companySnap) => {
      if (companySnap.exists()) {
        const companyArray = [];
        companySnap.forEach((childs) => {
          const companyname = childs.key;
          companyArray.push(companyname);
        });
        setArrayCompany(companyArray);
      }
    });

    const fetchUsers = onValue(empRef, (empSnap) => {
      const nameArray = [];
      empSnap.forEach((child) => {
        const empname = child.val().FULLNAME;
        const empmobile = child.key;
        nameArray.push({ empname, empmobile });
      });
      setEmpArray(nameArray);
    });

    return () => { fetchCompany(); fetchUsers() };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.companyName) {
      alert('Please fill out all required fields.');
      return;
    }

    const leadKey = Date.now();
    const leadRef = ref(db, `Leadmanagment`);

    const checkLeadExist = async () => {
      const leadSnap = await get(leadRef);
      if (leadSnap.exists()) {
        const listPhone = [];
        leadSnap.forEach((child) => {
          const list = child.val().phone;
          listPhone.push(list);
        });
        if (listPhone.includes(formData.phone)) {
          alert('That Contact No. is Already in Leads');
        } else {
          set(ref(db, `Leadmanagment/${leadKey}`), formData)
            .then(() => {
              modalClose();
              console.log('Lead data uploaded successfully');
            })
            .catch((error) => {
              console.error('Error uploading data:', error);
            });
        }
      } else {
        set(ref(db, `Leadmanagment/${leadKey}`), formData)
          .then(() => {
            modalClose();
            console.log('Lead data uploaded successfully');
          })
          .catch((error) => {
            console.error('Error uploading data:', error);
          });
      }
    };

    checkLeadExist();
  };

  if (!showModal) return null;

  return (
    <div className="lead-modal-overlay">
      <div className="lead-modal-container">
        {/* Header */}
        <div className="lead-modal-header">
          <div className="header-text">
            <h4 className="m-0 fw-bold">Create New Lead</h4>
            <p className="text-muted small m-0">Enter the details of the prospect to assign them.</p>
          </div>
          <button className="close-circle-btn" onClick={modalClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-scroll-container">
            {/* Name Section */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="custom-label">First Name *</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="custom-input"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul"
                    required
                  />
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="custom-label">Last Name *</label>
                <div className="input-icon-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="custom-input"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sharma"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="custom-label">Phone Number *</label>
                <div className="input-icon-wrapper">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    className="custom-input"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10 digit mobile"
                    required
                  />
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="custom-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="custom-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@mail.com"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="custom-label">Location / Address</label>
              <div className="input-icon-wrapper">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  className="custom-input"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, Area"
                />
              </div>
            </div>

            {/* Selection Section */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="custom-label">Company Name *</label>
                <div className="input-icon-wrapper">
                  <Building size={16} className="input-icon" />
                  <select
                    className="custom-select"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Company</option>
                    {arraycompany.map((name, i) => (
                      <option key={i} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group flex-1">
                <label className="custom-label">Assign To Employee</label>
                <div className="input-icon-wrapper">
                  <UserCheck size={16} className="input-icon" />
                  <select
                    name="assignedto"
                    className="custom-select"
                    value={formData.assignedto}
                    onChange={handleInputChange}
                  >
                    <option value="">Choose Employee</option>
                    {arrayemp.map((emp, i) => (
                      <option key={i} value={emp.empmobile}>{emp.empname}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="lead-modal-footer">
            <button type="button" className="btn-cancel" onClick={modalClose}>Cancel</button>
            <button type="submit" className="btn-submit">
              <Send size={18} />
              <span>Create Lead</span>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .lead-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .lead-modal-container {
          background: white;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .lead-modal-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .close-circle-btn {
          background: #f8fafc;
          border: none;
          padding: 8px;
          border-radius: 50%;
          color: #64748b;
          transition: 0.2s;
        }

        .close-circle-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .form-scroll-container {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .flex-1 { flex: 1; }

        .custom-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          pointer-events: none;
        }

        .custom-input, .custom-select {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 14px;
          transition: 0.2s;
          outline: none;
        }

        .custom-input:focus, .custom-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .lead-modal-footer {
          padding: 16px 24px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }

        .btn-submit {
          flex: 1;
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .btn-submit:hover {
          background: #1d4ed8;
        }

        @media (max-width: 640px) {
          .lead-modal-overlay {
            padding: 0;
            align-items: flex-end;
          }

          .lead-modal-container {
            border-radius: 24px 24px 0 0;
            max-width: 100%;
          }

          .form-row {
            flex-direction: column;
            gap: 0;
          }

          .form-scroll-container {
            max-height: 80vh;
          }
          
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
}