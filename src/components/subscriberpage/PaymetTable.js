import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { db } from '../../FirebaseConfig';

export default function PaymetTable() {
  const location = useLocation();
  const {userid} = location.state || {};
  const [arraypayment, setArrayPayment] = useState([]);
  const [showreceiptopt, setShowReceiptOpt] = useState(null);




  const paymentsRef = ref(db, `Subscriber/${userid}/payments`);

  useEffect(() => {
    const fetchpayments = async () => {
      const paymentSnap = await get(paymentsRef);
      if(paymentSnap.exists()){
        const paymentsArray = [];
        paymentSnap.forEach(Childpayment => {
          const source = Childpayment.val().source;
          const receiptNo = Childpayment.val().receiptNo;
          const receiptDate = Childpayment.val().receiptDate;
          const paymentMode = Childpayment.val().paymentMode;
          const bankname = Childpayment.val().bankname;
          const amount = Childpayment.val().amount;
          const discount = Childpayment.val().discount;
          const collectedBy = Childpayment.val().collectedBy;
          const modifiedBy = Childpayment.val().modifiedBy;
          const transactionNo = Childpayment.val().transactionNo;
          const narration = Childpayment.val().narration;
          paymentsArray.push({source, receiptNo, receiptDate, paymentMode, bankname ,amount, discount, collectedBy, modifiedBy, transactionNo, narration})
          
        });
        setArrayPayment(paymentsArray);
      }
    }

    return () => fetchpayments();
  }, [userid]);
  return (
    <div>
      <div style={{overflowY:'auto'}}>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">S. No.</th>
            <th scope="col">Source</th>
            <th scope="col">Receipt No.</th>
            <th scope="col">Receipt Date</th>
            <th scope="col">Amount</th>
            <th scope="col">Discount</th>
            <th scope="col">Payment Mode</th>
            <th style={{width:'150px'}} scope="col">Cheque or Transaction No.</th>
            <th scope="col">Bank Name</th>
            <th scope="col">Collected By</th>
            <th scope="col">Modified By</th>
            <th scope="col">Narration</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">

          {arraypayment.length > 0 ? (
            arraypayment.map(({source, receiptNo, receiptDate, paymentMode, bankname,amount, discount, collectedBy, modifiedBy ,transactionNo, narration}, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{source}</td>
                <td>{receiptNo}</td>
                <td>{receiptDate}</td>
                <td style={{color:'blue'}}>{amount}</td>
                <td style={{color:'green'}}>{discount}</td>
                <td>{paymentMode}</td>
                <td>{transactionNo}</td>
                <td>{bankname}</td>
                <td>{collectedBy}</td>
                <td>{modifiedBy}</td>
                <td>{narration}</td>
              
              </tr>

              
            ))
          ) : (
            <td colSpan="8" style={{ textAlign: 'center' }}>No Payment data found</td>
          )
        }

          
          
        </tbody>
      </table>
      </div>
    

    </div>
  )
}
