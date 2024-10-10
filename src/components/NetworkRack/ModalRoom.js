import { onValue, ref } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react'
import { db } from '../../FirebaseConfig';

const ModalRoom = ({show, closeModal}) => {


    const [arrayoffice, setArrayOffice] = useState([]);

    const officeRef = ref(db, `Master/Offices`);

    const fetchOffice = useCallback(() => {
        onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                const officeArray = [];
                officeSnap.forEach((officeChild) => {
                    const officename = officeChild.key
                    officeArray.push(officename);
                });
                setArrayOffice(officeArray);
            }
        })
    });

    const handleClick = () => {
        closeModal();
    }

    useEffect(() => {
        if (show) {
            fetchOffice();
        }
    }, [show, fetchOffice]);

    if (!show) return null;
  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <div className='d-flex flex-column'>
            <h5>Select Office</h5>
            <form className='row g-3'>
                <div className='col-md-6'>
                    <label className='form-label'>Office Name</label>
                    <select className='form-select'>
                        <option value=''>Choose...</option>
                        {
                            arrayoffice.length > 0 ? (
                                arrayoffice.map((officename, index) => (
                                    <option key={index} value={officename}>{officename}</option>
                                ))
                            ) : (
                                <option value=''>No Data Availabale!</option>
                            )
                        }
                    </select>
                </div>
                <div className='col-md-6'>
                    <label className='form-label'>Enter Room Name</label>
                    <input type='text' className='form-control'>

                    </input>
                </div>
            </form>

            <button onClick={handleClick} className='btn btn-outline-info mt-5'>Add Server Room</button>
        </div>
      </div>
    </div>
  )
}

export default ModalRoom
