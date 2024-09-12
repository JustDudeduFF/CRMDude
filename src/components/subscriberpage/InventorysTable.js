
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';


export default function InventorysTable() {
    const username = localStorage.getItem('susbsUserid');
    const inventryRef = ref(db, `Subscriber/${username}/Inventory`);
    const navigate = useNavigate();

    const [arrayinventry, setArrayInventry] = useState([]);

    useEffect(() => {
        const fetchInventry = onValue(inventryRef, (inventrySnap => {
            if(inventrySnap.exists()){
                const invenryArray = [];
                inventrySnap.forEach(Childinv => {
                    const productcode = Childinv.key;
                    const amount = Childinv.val().amount;
                    const date = Childinv.val().date;
                    const deviceSerialNumber = Childinv.val().deviceSerialNumber;
                    const devicename = Childinv.val().devicename;
                    const modifiedBy = Childinv.val().modifiedby;
                    const remarks = Childinv.val().remarks;
                    const status = Childinv.val().status;
                    invenryArray.push({productcode, amount, date, deviceSerialNumber, devicename, modifiedBy, remarks, status});
                });

                setArrayInventry(invenryArray);
            }
        }));

        return () => fetchInventry();
    }, [username]);

  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th style={{width:'120px'}} scope='col'>Product Code</th>
                        <th style={{width:'120px'}} scope="col">Date</th>
                        <th style={{width:'160px'}} scope="col">Product Name</th>
                        <th style={{width:'160px'}} scope="col">Product Serial No.</th>
                        <th style={{width:'90px'}} scope="col">Amount</th>
                        <th style={{width:'120px'}}>Remarks</th>
                        <th style={{width:'130px'}}>Modify By</th>
                        <th style={{width:'90px'}}>Status</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                    {arrayinventry.length > 0 ? (
                        arrayinventry.map(({productcode, amount, date, deviceSerialNumber, devicename, modifiedBy, remarks, status}, index) => (
                            <tr key={index}>
                                <td style={{color:'green', cursor:'pointer'}} onClick={() => {
                                    if(status === 'Activated'){
                                        navigate('modinvent', {state: {productcode: productcode}});
                                    }else{
                                        alert('Now Modifiable');
                                    }
                                }}>{productcode}</td>
                                <td>{date}</td>
                                <td>{devicename}</td>
                                <td>{deviceSerialNumber}</td>
                                <td>{`${amount}.00`}</td>
                                <td>{remarks}</td>
                                <td>{modifiedBy}</td>
                                <td style={{color:status === 'Activated' ? 'green' : 'red'}}>{status}</td>
                            </tr>
                        ))
                    ) : (
                        <td colSpan="8" style={{ textAlign: 'center' }}>No Inventory data found</td>
                    )
                }
                
                </tbody>

                </table>

            </div>
            </div>
    
  )
}
