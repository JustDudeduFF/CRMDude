import React, { useEffect, useState } from 'react';
import Excel_Icon from './drawables/xls.png';
import PDF_Icon from './drawables/pdf.png';
import { useLocation } from 'react-router-dom';
import { onValue, ref, off } from 'firebase/database'; // Added 'off' to unsubscribe listener
import { db } from '../../FirebaseConfig';

export default function Cust_Ledger() {
  const location = useLocation();
  const { userid } = location.state || {};

  const [arrayledger, setArrayLedger] = useState([]);

  const lederRef = ref(db, `Subscriber/${userid}/ledger`);

  useEffect(() => {
    // Firebase listener to fetch ledger data
    const fetchledger = onValue(lederRef, (ledgerSnap) => {
      if (ledgerSnap.exists()) {
        const ledgerdataArray = [];
        const debamt =[];
        const creamt = [];
        ledgerSnap.forEach((Childledger) => {
          const type = Childledger.val().type;
          const date = Childledger.val().date;
          const particular = Childledger.val().particular;
          const debitamount = parseFloat(Childledger.val().debitamount);
          const creditamount = parseFloat(Childledger.val().creditamount);
          debamt.push(debitamount);
          creamt.push(creditamount);
          ledgerdataArray.push({ type, date, particular, debitamount, creditamount });
        });
        
        setArrayLedger(ledgerdataArray);
      } else {
        console.log('Data not found');
      }
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      off(lederRef, fetchledger); // Properly remove listener
    };
  }, [userid]);

  let runningBalance = 0;


  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'1'}}>
        <h2>Customer Ledger</h2>
        </div>
        <div style={{flex:'4'}}>
            <div style={{width:'max-content', float:'right'}}>
                <img src={Excel_Icon} className='img_download_icon'></img>
                <img src={PDF_Icon} className='img_download_icon'></img>

            </div>
        </div>
        
    </div>
    <div style={{flex:'10'}}>
    <table className="table">
  <thead>
    <tr>
      <th scope="col">S. No.</th>
      <th scope="col">Type</th>
      <th scope="col">Date</th>
      <th scope="col">Particulars</th>
      <th scope="col">Dr. Amount</th>
      <th scope="col">Cr. Amount</th>
      <th scope="col">Balance</th>
      <th scope="col">Remarks</th>

    </tr>
  </thead>
  <tbody className="table-group-divider">

  {arrayledger.length > 0 ? (
              arrayledger.map(({ type, date, particular, debitamount, creditamount }, index) => {
                // Update the running balance by adding debit and subtracting credit
                runningBalance += debitamount - creditamount;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td> {/* Correct S. No. starts from 1 */}
                    <td>{type}</td>
                    <td>{date}</td>
                    <td>{particular}</td>
                    <td>{debitamount.toFixed(2)}</td> {/* Format to 2 decimal places */}
                    <td>{creditamount.toFixed(2)}</td> {/* Format to 2 decimal places */}
                    <td>{runningBalance.toFixed(2)}</td> {/* Display calculated running balance */}
                    <td>{/* Remarks can be added here if needed */}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No ledger data found</td>
              </tr>
            )}
    
  </tbody>
</table>

    </div>

    </>
  )
}
