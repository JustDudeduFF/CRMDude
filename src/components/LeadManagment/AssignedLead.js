import React from 'react';
import '../SmallModal.css';
import { useEffect, useState } from 'react';
import { onValue, ref, get, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';

const AssignedLead = ({show, closeModal, leadID}) => {
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
        });


        return () => fetchUsers();
    }, []);

    const assignLead = async() => {
    
        const leadRef = ref(db, `Leadmanagment/${leadID}`);
        const leadSnap = await get(leadRef);
        const leadData = leadSnap.val();
        const assignData = {
            assignedto: assignemp,
            date: new Date().toISOString().split('T')[0],
            status: 'assigned',
            type: 'lead'
        }
        update(leadRef, assignData);
        closeModal();
        alert(`${leadData.FirstName} ${leadData.LastName} is assigned to ${assignemp}`);
        
    }

    if(!show){
        return null;
    }
    return (
        <div className='modal-background'>
        <div className='modal-data'>
            <div className='d-flex flex-row'>
                <h4 style={{flex:'1'}}>Assigned Leads</h4>
                <button className='btn-close' onClick={closeModal}></button>
            </div>
            <p>leadID: {leadID}</p>
            <div>
                <label className='form-label'>Employee Names</label>
                <select onChange={(e) => setAssignEmp(e.target.value)} className='form-select'>
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
            <button className='btn btn-success mt-3' onClick={assignLead}>Assign Lead</button>
            </div>
        </div>
    )
}

export default AssignedLead;
