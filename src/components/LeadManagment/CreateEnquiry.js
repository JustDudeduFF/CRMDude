import { get, onValue, ref, set, query, orderByChild, equalTo } from 'firebase/database';
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../../FirebaseConfig';
import { debounce } from 'lodash';



export default function CreateEnquiry({ showModal1, modalClose1 }) {
  const myMobile = localStorage.getItem('contact');
  

  const [arraycompany, setArrayCompany] = useState([]);
  

  const INITIAL_FORM_STATE = {
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    en_concern: '',
    date: new Date().toISOString().split('T')[0],
    leadsource: 'office',
    generatename: myMobile,
    type: 'enquiry',
    status: 'pending'
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
        console.log('Lead data uploaded successfully');
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
    <div className="container mt-5">
  <div className="card p-4 shadow mb-5 d-flex">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h4 className="card-title">Create Enquiry</h4>
      <button type="button" style={{ marginLeft: 'auto' }} className='btn-close' onClick={modalClose1}></button>
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
            <label className="form-label">Enquiry Particular</label>
            <select
              className="form-select"
              name="en_concern"
              value={formData.en_concern}
              onChange={handleInputChange}
              required
            >
              <option value="">Select an option</option>
              {memoizedCompanyOptions}
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
