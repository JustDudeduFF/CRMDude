import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';

const CloseTicketModal = ({ show, ticketno, closeModal}) => {
    const [arrayemp, setEmpArray] = useState([]);
    const [closeby, setCloseBy] = useState('');
    const [rac, setRAC] = useState('');
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


    const closrTicket = async (event) => {
        event.preventDefault();
        
         // Destructure ticketno to extract subsID and Ticketno
        const ticketRef = ref(db, `Subscriber/${ticketno.subsID}/Tickets/${ticketno.Ticketno}`);
        const globalTicketsRef = ref(db, `Global Tickets/${ticketno.Ticketno}`);
        
        const newTicketData = {
          closedate: new Date().toISOString().split('T')[0],
          closeby: closeby, // Assuming `closeby` is coming from the component's state
          closetime: new Date().toLocaleTimeString(),
          status: 'Completed',
          rac: rac, // Assuming `rac` is also coming from the component's state
        };
      
        // Ensure both closeby and rac fields are filled before closing the ticket
        if (closeby !== '' && rac !== '') {
          try {
            // Update Global Tickets data
            await update(globalTicketsRef, newTicketData);
            
            // After Global Tickets update is successful, update Subscriber Tickets data
            await update(ticketRef, newTicketData);
      
            // Close the modal and display the success alert
            closeModal(); 
            alert(`${ticketno.Ticketno} is Closed By ${closeby}`);
          } catch (error) {
            console.error('Error closing ticket:', error);
            alert('Failed to close the ticket. Please try again.');
          }
        } else {
          // Alert if closeby or rac is missing
          alert('Please choose an employee name and fill in the RCA.');
        }
      };
      


      const tempClose = async (event) => {
        event.preventDefault();
        // Destructure ticketno to extract subsID and Ticketno
        const ticketRef = ref(db, `Subscriber/${ticketno.subsID}/Tickets/${ticketno.Ticketno}`);
        const globalTicketsRef = ref(db, `Global Tickets/${ticketno.Ticketno}`);
        
        const newTicketData = {
          closedate: new Date().toISOString().split('T')[0],
          closeby: closeby, // Assuming `closeby` is coming from the component's state
          closetime: new Date().toLocaleTimeString(),
          status: 'Open',
          rac: rac, // Assuming `rac` is also coming from the component's state
        };
      
        // Ensure both closeby and rac fields are filled before closing the ticket
        if (closeby !== '' && rac !== '') {
          try {
            // Update Global Tickets data
            await update(globalTicketsRef, newTicketData);
            
            // After Global Tickets update is successful, update Subscriber Tickets data
            await update(ticketRef, newTicketData);
      
            // Close the modal and display the success alert
            closeModal(); 
            alert(`${ticketno.Ticketno} is Closed By ${closeby}`);
          } catch (error) {
            console.error('Error closing ticket:', error);
            alert('Failed to close the ticket. Please try again.');
          }
        } else {
          // Alert if closeby or rac is missing
          alert('Please choose an employee name and fill in the RCA.');
        }
      };
      
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <div className='d-flex flex-row'>
      <h4 style={{flex:'1'}}>Close Subscriber Ticket</h4>
      <button onClick={closeModal} className='btn-close'></button>
      </div>
      <p style={{color:'blue'}}>{`Ticket Id :- ${ticketno.Ticketno}`}</p>
        <div>
            <form className='row g-3'>
                <div className='col'>
                <label className='form-label'>Closed By</label>
                <select onChange={(e) => setCloseBy(e.target.value)} className='form-select mb-3'>
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

                <div className='col'>
                    <label className='form-label'>RCA</label>
                    <input onChange={(e) => setRAC(e.target.value)} type='text' className='form-control'></input>
                </div>
            </form>
        </div>
      
      <button className='btn btn-success' onClick={closrTicket}>Close Ticket</button>
      <button className='btn btn-warning mt-3' onClick={tempClose}>Close as Opened</button>
    </div>
    </div>
  );
};

export default CloseTicketModal;