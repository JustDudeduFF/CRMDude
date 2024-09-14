import { get, push, ref, set, update } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import { db } from '../../FirebaseConfig';
import { useNavigate } from 'react-router-dom';


export default function CreateNote(props) {
    const {notety} = props;
    const username = localStorage.getItem('susbsUserid');
    const navigate = useNavigate();

    const [note, setNote] = useState(Date.now);
    const [arrayparticular, setArrayParticular] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState('');
    const [particular, setParticular] = useState('');
    const [remarks, setRemarks] = useState('');

    const particularRef = ref(db, `Master/DBConcern`);

    useEffect(() => {
      const fetchparticular = async () => {
        const particularSnap = await get(particularRef);
        if(particularSnap.exists()){
          const particularArray = [];
          particularSnap.forEach(Child => {
            const name = Child.key;
            particularArray.push(name);
          });
          setArrayParticular(particularArray);
        }
      }

      fetchparticular();
    }, [particularRef]);

    const createnote = async() => {
      const notetype = notety === 'danger' ? 'Debit Note' : 'Credit Note';

      const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);
      const dueSnap = await get(dueRef);
      const dueAmount = dueSnap.val().dueAmount;





      const debitdata = {
        noteno: note,
        notetype: notetype,
        notedate: date,
        notefor: particular,
        amount: amount,
        modifiedby: localStorage.getItem('Name'),
        modifiedon: new Date().toISOString().split('T')[0],
        remarks: remarks
      }

      const ledgerdata = {
        type: notetype,
        date: new Date().toISOString().split('T')[0],
        creditamount: notety === 'danger' ? '0' : amount,
        debitamount: notety === 'danger' ? amount : '0',
        particular: particular
      }

      const newdue = {
        dueAmount: notety === 'danger' ? parseInt(dueAmount) + parseInt(amount) : parseInt(dueAmount) - parseInt(amount)
      }

      try{
        await update(dueRef, newdue);
        await set(ref(db, `Subscriber/${username}/ledger/${note}`), ledgerdata);
        await set(ref(db, `Subscriber/${username}/dcnotes/${note}`), debitdata);
        navigate(-1);
      }catch(error){
        alert('Failed to Add: ', error);
      }
      

      
    }

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:notety === 'danger' ? '1px solid red' : '1px solid green', padding:'10px', borderRadius:'5px', boxShadow:notety === 'danger' ? '0 0 10px red' : '0 0 10px green'}}>
      <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Note No.</label>
            <input type="text" className="form-control" defaultValue={note} onChange={(e) => setNote(e.target.value)} readOnly></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Particular</label>
            <select onChange={(e) => setParticular(e.target.value)} className="form-select">
              <option value='' disabled>Choose...</option>
              {
                arrayparticular.map((particular, index) => (
                  <option key={index} value={particular}>{particular}</option>
                ))
              }
            </select>
          </div>
          <div className="col-md-2">
          <label className="form-label">
            Note Date
          </label>
          <input defaultValue={date} onChange={(e) => setDate(e.target.value)} type='date' className='form-control'></input>
        </div>
          
          <div className="col-md-3">
            <label className="form-label">Amount</label>
            <input onChange={(e) => setAmount(e.target.value)} type="number" className="form-control" ></input>
          </div>

          
          
          <div className="col-md-8">
            <label className="form-label">Narration</label>
            <input onChange={(e) => setRemarks(e.target.value)} type="text" className="form-control" ></input>
          </div>
          <div className="col-8">
            <button onClick={createnote} type="button" className={`btn ${notety === 'danger' ? 'btn-outline-danger' : 'btn-outline-success'}`}>{`${notety === "danger" ? 'Create Debit Note' : ' Create Credit Note'}`}</button>
          </div>
        </form>

      </div>

    </div>
  )
}
