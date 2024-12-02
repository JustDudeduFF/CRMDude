import React, { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function InventorysTable() {
  const username = localStorage.getItem('susbsUserid');
  const navigate = useNavigate();
  const [arrayinventry, setArrayInventry] = useState([]);

  useEffect(() => {
    if (!username) {
      console.error("User ID not found in localStorage.");
      return;
    }

    const inventryRef = ref(db, `Subscriber/${username}/Inventory`);
    const listener = onValue(inventryRef, (inventrySnap) => {
      if (inventrySnap.exists()) {
        const inventryArray = [];
        inventrySnap.forEach((Childinv) => {
          const productcode = Childinv.key || 'Unknown Code';
          const {
            amount = 0,
            date = 'N/A',
            deviceSerialNumber = 'N/A',
            devicename = 'N/A',
            modifiedby = 'Unknown',
            remarks = 'No remarks',
            status = 'Unknown',
          } = Childinv.val();

          inventryArray.push({
            productcode,
            amount,
            date,
            deviceSerialNumber,
            devicename,
            modifiedBy: modifiedby,
            remarks,
            status,
          });
        });

        setArrayInventry(inventryArray);
      } else {
        setArrayInventry([]);
      }
    });

    return () => off(inventryRef, listener); // Clean up the listener
  }, [username]);

  return (
    <div>
      <div style={{ overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }} className="table">
          <thead>
            <tr>
              <th style={{ width: '120px' }} scope="col">Product Code</th>
              <th style={{ width: '120px' }} scope="col">Date</th>
              <th style={{ width: '160px' }} scope="col">Product Name</th>
              <th style={{ width: '160px' }} scope="col">Product Serial No.</th>
              <th style={{ width: '90px' }} scope="col">Amount</th>
              <th style={{ width: '120px' }}>Remarks</th>
              <th style={{ width: '130px' }}>Modified By</th>
              <th style={{ width: '90px' }}>Status</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arrayinventry.length > 0 ? (
              arrayinventry.map(({ productcode, amount, date, deviceSerialNumber, devicename, modifiedBy, remarks, status }, index) => (
                <tr key={index}>
                  <td
                    style={{ color: 'green', cursor: 'pointer' }}
                    onClick={() => {
                      if (status === 'Activated') {
                        navigate('modinvent', { state: { productcode } });
                      } else {
                        alert('Not Modifiable');
                      }
                    }}
                  >
                    {productcode}
                  </td>
                  <td>{date}</td>
                  <td>{devicename}</td>
                  <td>{deviceSerialNumber}</td>
                  <td>{`${amount}.00`}</td>
                  <td>{remarks}</td>
                  <td>{modifiedBy}</td>
                  <td style={{ color: status === 'Activated' ? 'green' : 'red' }}>{status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No Inventory data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
