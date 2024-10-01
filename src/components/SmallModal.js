import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { get, onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';

const SmallModal = ({ show, ticketno, closeModal}) => {
    const [arrayemp, setEmpArray] = useState([]);
    const [assignemp, setAssignEmp] = useState('');
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
    });

    const assignTicket = async(event) => {
        event.preventDefault();
        const ticketRef = ref(db, `Subscriber/${ticketno.subsID}/Tickets/${ticketno.Ticketno}`);
        const globalTicketsRef = ref(db, `Global Tickets/${ticketno.Ticketno}`);
        const ticketSnap = await get(ticketRef);
        if(ticketSnap.hasChild('assigndata')){
            const assigndata = {
                assigndate: new Date().toISOString().split('T')[0],
                assigntime: new Date().toLocaleTimeString(),
                assignto: assignemp
            }
            update(globalTicketsRef, assigndata);
            update(ticketRef, assigndata);
            closeModal();
            alert(`${ticketno.Ticketno} is now assigned to ${assignemp}`)
        }else{
            const assigndata = {
                assignto: assignemp
            }

            update(ticketRef, assigndata).then(() => {
                closeModal();
                alert(`${ticketno.Ticketno} is now assigned to ${assignemp}`)
            })
        }
    }
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <div className='d-flex flex-row'>
      <h4 style={{flex:'1'}}>Assign Ticket to Technician</h4>
      <button onClick={closeModal} className='btn-close'></button>
      </div>
      <p style={{color:'blue'}}>{`Ticket Id : ${ticketno.Ticketno}`}</p>
      <div>
          <label className='form-label'>Employee Names</label>
          <select onChange={(e) => setAssignEmp(e.target.value)} className='form-select mb-3'>
            <option value=''>Choose...</option>
              {
                  arrayemp.length > 0 ? (
                      arrayemp.map(({empname, empmobile}, index) => (
                          <option key={index} value={empmobile}>{empname}</option>
                      ))
                  ) : (
                      <option value=''>No Data Available!</option>
                  )
              }

          </select>
          </div>
      
      <button className='btn btn-success' onClick={assignTicket}>Assign Ticket</button>
    </div>
    </div>
  );
};

export default SmallModal;