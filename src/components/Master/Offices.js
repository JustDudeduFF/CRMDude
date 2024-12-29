import React, { useState, useEffect } from 'react'
import OfficeModal from './OfficeModal'
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';

export default function Offices() {

    const [showModal, setShowModal] = useState(false);
    const {hasPermission} = usePermissions();
    const [arrayoffice, setArrayOffice] = useState([]);
    const officeRef = ref(db, 'Master/Offices')


    useEffect(() => {
        const unsubscribeOffices = onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                const OfficeArray = [];
                officeSnap.forEach(childOffice => {
                    const officename = childOffice.key;
                    const officeaddress = childOffice.val().officeaddress;
                    const officelat = childOffice.val().officelat;
                    const officelong = childOffice.val().officelong;
    
                    OfficeArray.push({ officename, officeaddress, officelat, officelong });
                });
                setArrayOffice(OfficeArray);
                
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
    
        return () => unsubscribeOffices(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Company Office Location and Address</h5>
            <button onClick={() => hasPermission("ADD_OFFICE") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success justify-content-right'>Add New Office</button>

        </div>
        <ToastContainer/>
        <OfficeModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Office Name</th>
                    <th scope='col'>Address</th>
                    <th scope='col'>Latitude / Longitude</th>

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arrayoffice.map(({officename, officeaddress, officelat, officelong}, index) => (
                    <tr key={officename}>
                        <td>{index + 1}</td>
                        <td>{officename}</td>
                        <td>{officeaddress}</td>
                        <td>{`${officelat} / ${officelong}`}</td>

                    </tr>
                ))

                }

            </tbody>

        </table>

    </div>
  )
}
