import React, { useState, useEffect } from 'react'
import DesignationModal from './DesignationModal';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';

export default function Designation() {

    const [showModal, setShowModal] = useState(false);
    const {hasPermission} = usePermissions();
    const [arraydesignation, setArraydesignation] = useState([]);
    const designationRef = ref(db, 'Master/Designations')


    useEffect(() => {
        const unsubscribedesignation = onValue(designationRef, (designationnap) => {
            if (designationnap.exists()) {
                const designationArray = [];
                designationnap.forEach(childdesignation => {
                    const designationname = childdesignation.key;
                    const designationpermissions = childdesignation.val().designationapermission;
    
                    designationArray.push({ designationname, designationpermissions });
                });
                setArraydesignation(designationArray);
                
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
    
        return () => unsubscribedesignation(); // Correct cleanup
    }, []);
    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Company designation Location and Address</h5>
            <button onClick={() => hasPermission("ADD_DESIGNATION") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success justify-content-right'>Add New designation</button>

        </div>
        <ToastContainer/>
        <DesignationModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Designation Name</th>
                    <th scope='col'>Defalut Permissions</th>
                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arraydesignation.map(({designationname, designationpermissions}, index) => (
                    <tr key={designationname}>
                        <td>{index + 1}</td>
                        <td>{designationname}</td>
                        <td>{designationpermissions}</td>
                    </tr>
                ))

                }

            </tbody>

        </table>

    </div>
  )
}
