import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { onValue, ref } from 'firebase/database';
import { db } from '../FirebaseConfig';

const PasswordModal = ({ show, ticketno, closeModal}) => {
    const [arrayemp, setEmpArray] = useState([]);
    const empRef = ref(db, `users`);

    useEffect(() => {
        const fetchUsers = onValue(empRef, (empSnap) => {
            const nameArray = [];
            empSnap.forEach((child) => {
                const empname = child.val().fullname;
                const empmobile = child.val().mobile;

                nameArray.push({empname, empmobile});
            });
            setEmpArray(nameArray);
        })

        return () => fetchUsers();
    })
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className='d-flex flex-row'>
        <h4 style={{flex:'1'}}>Assign Ticket to Technician</h4>
        <button onClick={closeModal} className='btn-close'></button>
        </div>
        <p style={{color:'blue'}}>{`Ticket Id : ${ticketno}`}</p>
        <div>
            <label className='form-label'>Employee Names</label>
            <select className='form-select mb-3'>
                {
                    arrayemp.length > 0 ? (
                        arrayemp.map(({empname, empmobile}, index) => (
                            <option key={index} value={empname}>{empname}</option>
                        ))
                    ) : (
                        <option value=''>No Data Available!</option>
                    )
                }

            </select>
            </div>
        
        <button className='btn btn-success' onClick={closeModal}>Assign Ticket</button>
      </div>
    </div>
  );
};

export default PasswordModal;