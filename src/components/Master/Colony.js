import React, { useState, useEffect } from 'react'
import ColonyModal from './ColonyModal';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';

export default function Colony() {

    const [showModal, setShowModal] = useState(false);

    const [arraycolony, setArrayColony] = useState([]);
    const colonyRef = ref(db, 'Master/Colonys')


    useEffect(() => {
        const unsubscribeColony = onValue(colonyRef, (colonynap) => {
            if (colonynap.exists()) {
                const colonyArray = [];
                colonynap.forEach(childcolony => {
                    const colonyname = childcolony.key;
                    const undercompany = childcolony.val().undercompany;
    
                    colonyArray.push({ colonyname, undercompany });
                });
                setArrayColony(colonyArray);
                
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
    
        return () => unsubscribeColony(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Company Colony Location and Address</h5>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-success justify-content-right'>Add New Colony</button>

        </div>
        <ToastContainer/>
        <ColonyModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Colony Name</th>
                    <th scope='col'>Under Company</th>
                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arraycolony.map(({colonyname, undercompany}, index) => (
                    <tr key={colonyname}>
                        <td>{index + 1}</td>
                        <td>{colonyname}</td>
                        <td>{undercompany}</td>
                    </tr>
                ))

                }

            </tbody>

        </table>

    </div>
  )
}
