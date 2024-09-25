import { get, onValue, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig';

export default function CreateLeadForm({ showModal, modalClose }) {
  const muDesignation = localStorage.getItem('Designation');
  const myMobile = localStorage.getItem('contact');

  const [arraycompany, setArrayCompany] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phone: '',
    companyName: '',
    date: new Date().toISOString().split('T')[0],
    leadsource: muDesignation === 'Sales' ? 'sales_team' : 'employee',
    generatename: myMobile,
    type:'lead'
    
  });

  const companyRef = ref(db, 'Master/companys');

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

    // Cleanup function to detach Firebase listener on unmount
    return () => fetchCompany();
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
    const leadRef = ref(db, `Leadmanagment/leads`);

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
          set(ref(db, `Leadmanagment/leads/${leadKey}`), formData)
            .then(() => {
              modalClose();
              console.log('Lead data uploaded successfully');
            })
            .catch((error) => {
              console.error('Error uploading data:', error);
            });
        }
      } else {
        // In case there are no leads yet, simply add the new lead
        set(ref(db, `Leadmanagment/leads/${leadKey}`), formData)
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
    <div className="container mt-5">
  <div className="card p-4 shadow mb-5 d-flex">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4 className="card-title">Create Lead</h4>
      <button type="button" style={{ marginLeft: 'auto' }} className='btn-close' onClick={modalClose}></button>
    </div>
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
            <label className="form-label">First name</label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last name</label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Company name</label>
            <select
              className="form-select"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
            >
              <option value="">Select an option</option>
              {arraycompany.length > 0 ? (
                arraycompany.map((companyname, index) => (
                  <option value={companyname} key={index}>
                    {companyname}
                  </option>
                ))
              ) : (
                <option value="">No Data Available!</option>
              )}
            </select>
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
