import React, { useEffect, useState } from 'react';
import Excel_Icon from './drawables/xls.png';
import PDF_Icon from './drawables/pdf.png';
import { useLocation } from 'react-router-dom';
import { onValue, ref, off } from 'firebase/database';
import { db } from '../../FirebaseConfig';

export default function Cust_Ledger() {
  const location = useLocation();
  const { userid } = location.state || {};

  const [arrayledger, setArrayLedger] = useState([]);

  useEffect(() => {
    if (!userid) {
      console.error("User ID not provided");
      return;
    }

    const lederRef = ref(db, `Subscriber/${userid}/ledger`);

    // Firebase listener to fetch ledger data
    const fetchledger = onValue(lederRef, (ledgerSnap) => {
      if (ledgerSnap.exists()) {
        const ledgerdataArray = [];

        ledgerSnap.forEach((Childledger) => {
          const data = Childledger.val();
          ledgerdataArray.push({
            type: data.type || "N/A",
            date: data.date || "",
            particular: data.particular || "N/A",
            debitamount: parseFloat(data.debitamount) || 0,
            creditamount: parseFloat(data.creditamount) || 0,
          });
        });

        setArrayLedger(ledgerdataArray);
      } else {
        console.log('Data not found');
        setArrayLedger([]);
      }
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => off(lederRef);
  }, [userid]);

  let runningBalance = 0;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2>Customer Ledger</h2>
        <div>
          <img src={Excel_Icon} alt="Download Excel" className="img_download_icon" />
          <img src={PDF_Icon} alt="Download PDF" className="img_download_icon" />
        </div>
      </div>

      <div>
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
                runningBalance += debitamount - creditamount;

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{type}</td>
                    <td>{date ? new Date(date).toLocaleDateString() : "N/A"}</td>
                    <td>{particular}</td>
                    <td style={{ color: debitamount > 0 ? 'red' : 'inherit' }}>
                      {debitamount.toFixed(2)}
                    </td>
                    <td style={{ color: creditamount > 0 ? 'green' : 'inherit' }}>
                      {creditamount.toFixed(2)}
                    </td>
                    <td>{runningBalance.toFixed(2)}</td>
                    <td>{/* Optional: Add remarks if needed */}</td>
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
  );
}
