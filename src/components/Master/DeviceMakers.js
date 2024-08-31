import React, { useState, useEffect } from 'react'
import MakerModal from './MakerModal'
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';

export default function DeviceMakers() {

    const [showModal, setShowModal] = useState(false);

    const [arraydMaker, setArraydMaker] = useState([]);
    const dMakerRef = ref(db, 'Master/dMakers')


    
    useEffect(() => {
        const fetchdMakers = onValue(dMakerRef, (dMakerSnap) => {
            try {
                
                if (dMakerSnap.exists()) {
                    const dMakerArray = [];
                    dMakerSnap.forEach(childdMaker => {
                        const dMakeraddress = childdMaker.val().dMakeraddress;
                        const dMakername = childdMaker.key;
                        const dMakerlat = childdMaker.val().dMakerlat;
                        const dMakerlong = childdMaker.val().dMakerlong;
                        

                        dMakerArray.push({ dMakername, dMakeraddress, dMakerlat, dMakerlong});
                    });
                    setArraydMaker(dMakerArray);
                    
                }
            } catch (error) {
                console.error("Error fetching dMakers:", error);
            }
        });

        return () => fetchdMakers();
    }, []);

    

  return (
    <div className='d-flex flex-column ms-3'>
        <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Device Maker Name and Address</h5>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-success justify-content-right'>Add New dMaker</button>

        </div>

        <MakerModal show={showModal} notshow={() => setShowModal(false)}/>

        <table className='table'>
            <thead>
                <tr>
                    <th scope='col'>S. No.</th>
                    <th scope='col'>Maker Name</th>
                    <th scope='col'>Address</th>
                    

                </tr>
            </thead>

            <tbody className='table-group-divider'>
                {arraydMaker.map(({dMakername, dMakeraddress}, index) => (
                    <tr key={dMakername}>
                        <td>{index + 1}</td>
                        <td>{dMakername}</td>
                        <td>{dMakeraddress}</td>
                        

                    </tr>
                ))}

            </tbody>

        </table>

    </div>
  );
}
