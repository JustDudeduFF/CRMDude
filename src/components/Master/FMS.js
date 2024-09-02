import React, { useState, useEffect } from 'react'
import FMSModal from './FMSModal';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';

export default function FMS() {

    const [showModal, setShowModal] = useState(false);

    const [arrayfms, setArrayfms] = useState([]);
    const fmsRef = ref(db, 'Master/FMS')
    

    useEffect(() => {
        const unsubscribefms = onValue(fmsRef, (fmsnap) => {
            if (fmsnap.exists()) {
                const fmsArray = [];
                fmsnap.forEach(childfms => {
                    const fmsname = childfms.key;
                    const fmscode = childfms.val().fmscode;
                    const fmsport = childfms.val().fmsport;
                    const fmscolor = childfms.val().fmscolor;


                    
    
                    fmsArray.push({fmsname, fmscode, fmsport, fmscolor});
                });
                setArrayfms(fmsArray);
                
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
    
        return () => unsubscribefms(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>FMS Information</h5>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-success justify-content-right'>Add New fms</button>

        </div>
        <ToastContainer/>
        <FMSModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>FMS Code</th>
                    <th scope='col'>FMS Name</th>
                    <th scope='col'>FMS Color</th>
                    <th scope='col'>FMS Max Port</th>
                  
                    

                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arrayfms.map(({fmsname, fmscode, fmsport, fmscolor}, index) => (
                    <tr key={fmsname}>
                        <td>{index + 1}</td>
                        <td>{fmscode}</td>
                        <td>{fmsname}</td>
                        <td>{fmsport}</td>
                        <td>{fmscolor}</td>
                        
                    </tr>
                ))

                }

            </tbody>

        </table>

    </div>
  )
}
