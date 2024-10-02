import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { get, onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';

const QuickCollection = ({show, collectdata, closeModal}) => {
    const [dueamount, setDueAmount] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [transactionid, setTransactionId] = useState('');

    const [paymentMode, setPaymentMode] = useState('');
    const [arrayMode, setArrayMode] = useState([]);


    const paymentkey = Date.now();
    
    

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
      <div className='d-flex flex-row'>
      <h5 style={{flex:'1'}}>{`Collect Payments of ${collectdata.fullName}`}</h5>
      <button onClick={closeModal} className='btn-close'></button>
      </div>
      <p style={{color:'blue'}}>{`User Id : ${collectdata.username}`}</p>
      <form className='row g-3'>
        <div className='col-md-6'>
            <label className='form-label'>Due Amount</label>
            <input onChange={(e) => setDueAmount(e.target.value)} type='number' defaultValue={collectdata.planAmount} className='form-control'></input>
        </div>

        <div className='col-md-6'>
            <label className='form-label'>Payment Mode</label>
            <select onChange={(e) => setPaymentMode(e.target.value)} className="form-select">
            <option defaultValue>Choose...</option>
            <option value="Paytm">Paytm</option>
            <option value="PhonePe">PhonePe</option>
            <option value="Google Pay">Google Pay</option>
            <option value="Cheque">Cheque</option>
            <option value="NEFT">NEFT</option>
            <option value="Cash">Cash</option>
            <option value="Online to ISP">Online to ISP</option>
            <option value="Amazon Pay">Amazon Pay</option>
            </select>
        </div>

        <div className='col-md-6'>
            <label className='form-label'>Discount</label>
            <input defaultValue={dueamount} onChange={(e) => setDiscount(e.target.value)} type='number' className='form-control'></input>
        </div>

        <div className='col-md-6'>
            <label className='form-label'>Transaction Id</label>
            <input onChange={(e) => setTransactionId(e.target.value)} type='text' className='form-control'></input>
        </div>
        
      </form>
      
      <button className='btn btn-success mt-3' onClick={'handleSubmit'}>Collect Payment</button>
    </div>
    </div>
  );
};

export default QuickCollection;