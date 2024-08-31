import React, { useState, useEffect } from 'react'
import ISPModal from './ISPModal'
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';

export default function ISP() {
    const [showispmodal, setShowIspModal] = useState(false);
    const [arrayisp, setArrayIsp] = useState([]);
    const ispRef = ref(db, 'Master/ISPs')


    useEffect(() => {
        const fetchIsps = onValue(ispRef, (ispSnap) => {
            
                if (ispSnap.exists()) {
                    const IspArray = [];
                    ispSnap.forEach(childIsp => {
                        const ispname = childIsp.val().ispname;
                        const ispcode = childIsp.key;
                        const ispdate = childIsp.val().ispdate;
                        

                        IspArray.push({ ispname, ispcode, ispdate});
                        
                    });
                    setArrayIsp(IspArray);
                    console.log(IspArray);
                }
            
        });

        return () => fetchIsps();
    }, []);
  return (
    <div className='d-flex ms-3 flex-column'>
            <div className='d-flex flex-row'>
                <h5 style={{ flex: '1' }}>ISP - Internet Service Provider List</h5>
                <button onClick={() => setShowIspModal(true)} className='btn btn-outline-success justify-content-end mb-2'>
                    Add New ISP
                </button>
            </div>

            <ISPModal show={showispmodal} unShow={() => setShowIspModal(false)}/>
            
            <table className="table">
                <thead>
                    <tr>
                        <th scope='col'>S. No.</th>
                        <th scope='col'>ISP Name</th>
                        <th scope='col'>ISP Added Date</th>
                        <th scope='col'>No. of Users</th>
                        <th scope='col'>ISP Code</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    {arrayisp.map(({ispname, ispcode, ispdate}, index) => (
                        <tr key={ispcode}>
                            <td>{index + 1}</td>
                            <td>{ispname}</td>
                            <td>{ispdate}</td>
                            <td></td>
                            <td>{ispcode    }</td>
                        </tr>
                    ))}
                    <tr>

                    </tr>
                </tbody>
            </table>
        </div>
  );
};
