import React, { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import TicketModal from './TicketModal';
import { usePermissions } from '../PermissionProvider';

export default function TicketConcerns() {

    const [showModal, setShowModal] = useState(false);
    const {hasPermission} = usePermissions();
    const [arrayticket, setArrayTicket] = useState([]);
    const ticketRef = ref(db, 'Master/Tickets')


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
            <h5 style={{flex:'1'}}>Ticket Concerns</h5>
            <button onClick={() => hasPermission("ADD_TICKEt_CONCERNS") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success justify-content-right'>Add Concern</button>

        </div>
        <ToastContainer/>
        <TicketModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Concern Name</th>
                    <th scope='col'>Added On</th>
                    <th scope='col'>Last Month Generated</th>

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
