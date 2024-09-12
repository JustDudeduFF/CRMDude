import { get, ref } from 'firebase/database';
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

  const noteRef = ref(db, `Subscriber/${username}/dcnotes/${noteno}`);

  useEffect(() => {
    const fetchdata = async () => {
      const noteSnap = await get(noteRef);

      setParticular(noteSnap.val().notefor);
      setAmount(noteSnap.val().amount);
      setDate(noteSnap.val().notedate);
      setRemarks(noteSnap.val().remarks);
      setNoteType(noteSnap.val().notetype);

      
    }

    return () => fetchdata();
  }, [noteno]);

  // const updatenote = async() => {
  //     const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);
  //     const dueSnap = await get(dueRef);
  //     const dueAmount = dueSnap.val().dueAmount;

  //     const updatenote = 

  // }


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
            <input onChange={(e) => setAmount(e.target.value)} defaultValue={amount} type="number" className="form-control"></input>
          </div>
          
          
          <div className="col-md-8">
            <label className="form-label">Narration</label>
            <input defaultValue={remarks} onChange={(e) => setRemarks(e.target.value)} type="text" className="form-control"></input>
          </div>
          <div className="col-8">
            <button  type="button" className='btn btn-outline-secondary'>Update Note</button>
          </div>
        </form>

      </div>

    </div>  
  )
}
