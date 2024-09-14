import { get, ref, update } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom'
import { db } from '../../FirebaseConfig';



export default function ModDCNote() {
  const location = useLocation();
  const {noteno} = location.state || {};
  const username = localStorage.getItem('susbsUserid');

  const [amount, setAmount] = useState('');
  const [particular, setParticular] = useState('');
  const [remarks, setRemarks] = useState('');
  const [notetype, setNoteType] = useState('');
  const [date, setDate] = useState('');
  const [dueAmount, setDueAmount] = useState('');


  const [newamount, setNewAmount] = useState('');

  const noteRef = ref(db, `Subscriber/${username}/dcnotes/${noteno}`);
  const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);



  useEffect(() => {
    const fetchdata = async () => {
      const noteSnap = await get(noteRef);
      const dueSnap = await get(dueRef);

      setParticular(noteSnap.val().notefor);
      setAmount(noteSnap.val().amount);
      setDate(noteSnap.val().notedate);
      setRemarks(noteSnap.val().remarks);
      setNoteType(noteSnap.val().notetype);
      setDueAmount(dueSnap.val().dueAmount);

    }

    return () => fetchdata();
  }, [noteno]);

  const updatenote = async() => {
      
      const ledgerRef = ref(db, `Subscriber/${username}/ledger/${noteno}`);
      const dbRef = ref(db, `Subscriber/${username}/dcnotes/${noteno}`);


      const updatenote = {
        remarks: remarks,
        amount: parseInt(newamount),
      }

      const updateledger = {
        creditamount: notetype === 'Debit Note' ? '0' : newamount,
        debitamount: notetype === 'Debit Note' ? newamount : '0'
      }

      const newdue = {
        dueAmount: notetype === 'Debit Note' ? (parseInt(dueAmount) - parseInt(amount)) + parseInt(newamount) : (parseInt(dueAmount) - parseInt(amount)) - parseInt(newamount)
      }

      try{
        await update(dueRef, newdue);
        await update(ledgerRef, updateledger);
        await update(dbRef, updatenote);
      }catch(error){
        alert("Failed :-", error);
      }

  }


  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:'1px solid gray', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px gray'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Note No.</label>
            <input type="text" className="form-control" defaultValue={noteno} readOnly></input>
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Note Type</label>
            <input className='form-control' defaultValue={notetype} readOnly></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Particular</label>
            <input defaultValue={particular} className='form-control' readOnly></input>
          </div>
          <div className="col-md-2">
          <label className="form-label">
            Note Date
          </label>
          <input onChange={(e) => setDate(e.target.value)} defaultValue={date} className='form-control' type='date'></input>
        </div>
          
          <div className="col-md-3">
            <label className="form-label">Amount</label>
            <input onChange={(e) => setNewAmount(e.target.value)} defaultValue={amount} type="number" className="form-control"></input>
          </div>
          
          
          <div className="col-md-8">
            <label className="form-label">Narration</label>
            <input defaultValue={remarks} onChange={(e) => setRemarks(e.target.value)} type="text" className="form-control"></input>
          </div>
          <div className="col-8">
            <button onClick={updatenote} type="button" className='btn btn-outline-secondary'>Update Note</button>
          </div>
        </form>

      </div>

    </div>  
  )
}
