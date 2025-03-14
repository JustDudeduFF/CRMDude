import { get, ref, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { db } from '../../FirebaseConfig';



export default function InventryModify() {
  const location = useLocation();
  const username = localStorage.getItem('susbsUserid');
  const {productcode} = location.state || {};

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [produtname, setProductName] = useState('');
  const [serialno, setSerialNo] = useState('');
  const [remarks2, setRemarks2] = useState('');
  const [status, setStatus] = useState('');
  const [inatinventry, setInAtInventry] = useState('');



  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:'1px solid black', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px gray'}}>
      <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Product Code</label>
            <input type="text" className="form-control" defaultValue={productcode} readOnly></input>
          </div>
          
          <div className="col-md-2">
          <label className="form-label">
            Product Add Date
          </label><br></br>
              <input type="date" className="form-control" defaultValue={date} readOnly></input>
        </div>
          
          <div className="col-md-3">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" defaultValue={amount} readOnly></input>
          </div>
         
          <div className="col-md-2">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-control" defaultValue={produtname} readOnly></input>
          </div>
          <div className="col-md-3">
            <label className="form-label">Product Serial No.</label>
            <input type="text" className="form-control" defaultValue={serialno} readOnly></input>
          </div>
          <div className="col-md-6">
            <label className="form-label">Remarks</label>
            <input onChange={(e) => setRemarks2(e.target.value)} type="text" className="form-control" ></input>
          </div>
          <div className="col-md-4">
            <label className="form-label">Action On Product</label>
            <select onChange={(e) => setStatus(e.target.value)} className="form-select">
              <option value=''>Choose...</option>
              <option value='damaged' >Damaged</option>
              <option value='repair'>On Repair</option>
            </select>
          </div>
          
        </form>
        <button type="button" className="btn btn-outline-secondary col-md-3 mt-3">Update</button>

      </div>



    </div>  
  )
}
