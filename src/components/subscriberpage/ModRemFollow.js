import { get, ref, update as firebaseUpdate } from 'firebase/database'; // Renamed update import
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../FirebaseConfig';

export default function ModRemFollow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { remarkno } = location.state || {};
  const username = localStorage.getItem('susbsUserid');
  const empid = localStorage.getItem('contact')

  const [status, setStatus] = useState('');
  const [remarkconcern, setRemarkConcern] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const [newdescription, setNewDescription] = useState('');

  const remarkRef = ref(db, `Subscriber/${username}/Remarks/${remarkno}`);
  

  useEffect(() => {
    const fetchData = async () => {
      const remarkSnap = await get(remarkRef);
      if (remarkSnap.exists()) {
        const data = remarkSnap.val();
        setRemarkConcern(data.particular || '');
        setDate(data.modifiedon || '');
        setDescription(data.description || '');
        setStatus(data.status || '');
      }
    };

    fetchData();
  }, [username, remarkno]);

  // Renamed update function to avoid conflict with Firebase's update function
  const handleUpdate = async (e) => {
    e.preventDefault();
    const myfollowRef = ref(db, `users/${empid}/MyFollows/${remarkno}`);


    const updatedData = {
      status: status,
      description: newdescription || description,
    };

    try {
      await firebaseUpdate(remarkRef, updatedData);
      await firebaseUpdate(myfollowRef, updatedData);
      navigate(-1); // Navigate back after successful update
    } catch (error) {
      alert(`Failed to update: ${error}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '1',
          margin: '20px',
          border: '1px solid gray',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px gray',
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Action ID</label>
            <input type="text" className="form-control" value={remarkno} readOnly />
          </div>
          <div className="col-md-2">
            <label className="form-label">Action Type</label>
            <input className="form-control" value="Follow Up" readOnly />
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Particular</label>
            <input className='form-control' value={remarkconcern} readOnly />
          </div>

          <div className="col-md-2">
            <label className="form-label">Action Date</label>
            <input value={date} className="form-control" type="date" readOnly />
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Follow Status</label>
            <select onChange={(e) => setStatus(e.target.value)} className='form-select'>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
            </select>

          </div>

          <div className="col-md-8">
            <label className="form-label">Description</label>
            <input
              defaultValue={description}
              onChange={(e) => setNewDescription(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>

          <div className="col-8">
            <button onClick={handleUpdate} type="submit" className="btn btn-outline-secondary">
              Update Action
            </button>
          </div>
        </form> 
      </div>
    </div>
  );
}
