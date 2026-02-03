import { get, onValue, ref, set, query, orderByChild, equalTo } from 'firebase/database';
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../../FirebaseConfig';
import { User, Phone, MapPin, Briefcase, X, Send } from 'lucide-react'; // Using Lucide for modern icons

export default function CreateEnquiry({ showModal1, modalClose1 }) {
  const myMobile = localStorage.getItem('contact');

  const [arraycompany, setArrayCompany] = useState([]);

  const INITIAL_FORM_STATE = {
    generatedDate: new Date().toISOString().split('T')[0],
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    en_concern: '',
    date: new Date().toISOString().split('T')[0],
    leadsource: 'office',
    generatename: myMobile,
    type: 'enquiry',
    status: 'pending',
    assignedto: ''
  };

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const companyRef = ref(db, 'Master/RMConcern');

  useEffect(() => {
    const unsubscribe = onValue(companyRef, (companySnap) => {
      if (companySnap.exists()) {
        const companyArray = [];
        companySnap.forEach((childs) => {
          const companyname = childs.key;
          companyArray.push(companyname);
        });
        setArrayCompany(companyArray);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.en_concern) {
      alert('Please fill out all required fields.');
      return;
    }

    const leadKey = Date.now();
    const phoneQuery = ref(db, 'Leadmanagment');
    const phoneCheck = query(phoneQuery, orderByChild('phone'), equalTo(formData.phone));

    const checkLeadExist = async () => {
      try {
        const snapshot = await get(phoneCheck);
        if (snapshot.exists()) {
          alert('That Contact No. is Already in Leads');
          return;
        }
        await set(ref(db, `Leadmanagment/${leadKey}`), formData);
        modalClose1();
      } catch (error) {
        console.error('Error handling lead:', error);
      }
    };
    checkLeadExist();
  };

  const memoizedCompanyOptions = useMemo(() =>
    arraycompany.map((companyname, index) => (
      <option value={companyname} key={index}>
        {companyname}
      </option>
    )),
    [arraycompany]
  );

  if (!showModal1) return null;

  return (
    <div className="enquiry-modal-overlay">
      <div className="enquiry-modal-content">
        {/* Modal Header */}
        <div className="enquiry-modal-header">
          <div>
            <h4 className="m-0 fw-bold text-dark">New Enquiry</h4>
            <small className="text-muted">Fill in client details to record a lead</small>
          </div>
          <button type="button" className="close-icon-btn" onClick={modalClose1}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="enquiry-form">
          <div className="form-scroll-area">
            {/* Name Group */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="custom-label">First Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control custom-input"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="custom-label">Last Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control custom-input"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Group */}
            <div className="mb-4">
              <label className="custom-label">Phone Number *</label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  className="form-control custom-input"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter 10 digit number"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="custom-label">Address</label>
              <div className="input-with-icon">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  className="form-control custom-input"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street, City, Area"
                />
              </div>
            </div>

            {/* Particulars */}
            <div className="mb-4">
              <label className="custom-label">Enquiry Particular *</label>
              <div className="input-with-icon">
                <Briefcase size={16} className="input-icon" />
                <select
                  className="form-select custom-input"
                  name="en_concern"
                  value={formData.en_concern}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {memoizedCompanyOptions}
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="modal-footer-actions">
            <button type="button" className="btn btn-light me-2" onClick={modalClose1}>Cancel</button>
            <button type="submit" className="btn btn-primary-custom flex-grow-1">
              <Send size={18} className="me-2" />
              Save Enquiry
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .enquiry-modal-overlay {
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
          z-index: 1050;
          padding: 15px;
        }

        .enquiry-modal-content {
          background: white;
          width: 100%;
          max-width: 550px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .enquiry-modal-header {
          padding: 24px 30px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-icon-btn {
          background: #f8fafc;
          border: none;
          padding: 8px;
          border-radius: 50%;
          color: #64748b;
          transition: all 0.2s;
        }

        .close-icon-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .enquiry-form {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .form-scroll-area {
          padding: 30px;
          overflow-y: auto;
        }

        .custom-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          display: block;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #94a3b8;
        }

        .custom-input {
          padding: 12px 12px 12px 42px !important;
          border-radius: 12px !important;
          border: 1.5px solid #e2e8f0 !important;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .custom-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
          outline: none;
        }

        .modal-footer-actions {
          padding: 20px 30px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          border-radius: 0 0 20px 20px;
        }

        .btn-primary-custom {
          background: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-primary-custom:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        /* Mobile Adjustments */
        @media (max-width: 576px) {
          .enquiry-modal-content {
            max-height: 100vh;
            border-radius: 0;
            position: fixed;
            bottom: 0;
          }

          .enquiry-modal-overlay {
            padding: 0;
          }

          .form-scroll-area {
            padding: 20px;
          }
          
          .modal-footer-actions {
            padding: 15px 20px;
          }
        }
      `}</style>
    </div>
  );
}