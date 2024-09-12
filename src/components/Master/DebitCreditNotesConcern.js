import React, { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import DebitCreditNoteModal from './DebitCreditNoteModal';

export default function DebitCreditNotesConcern() {

    const [showModal, setShowModal] = useState(false);

    const [arrayticket, setArrayTicket] = useState([]);
    const ticketRef = ref(db, 'Master/DBConcern')


    useEffect(() => {
        const unsubscribetickets = onValue(ticketRef, (ticketSnap) => {
            if (ticketSnap.exists()) {
                const ticketArray = [];
                ticketSnap.forEach(childticket => {
                    const ticketname = childticket.key;
                    const date = childticket.val().date;
                    
    
                    ticketArray.push({ ticketname, date});
                });
                setArrayTicket(ticketArray);
                
            } else {
                toast.error('No Data Found!', {
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
        });
    
        return () => unsubscribetickets(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Debit and Credit particulars</h5>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-success justify-content-right'>Add Concern</button>

        </div>
        <ToastContainer/>
        <DebitCreditNoteModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Particular Name</th>
                    <th scope='col'>Added On</th>
                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                
                {arrayticket.length > 0 ? (
                    arrayticket.map(({ticketname, date}, index) => (
                        <tr key={ticketname}>
                            <td>{index + 1}</td>
                            <td>{ticketname}</td>
                            <td>{date}</td>
                            
    
                        </tr>
                    ))
    
                ) : (
                    <tr>No Concerns Availabale</tr>
                )
                }

            </tbody>

        </table>

    </div>
  )
}
