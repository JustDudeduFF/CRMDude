import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../../FirebaseConfig';

export default function DebitCreditsTable() {
  const username = localStorage.getItem('susbsUserid');
  const [arraynotes, setArrayNotes] = useState([]);
  const navigate = useNavigate();

  const notesRef = ref(db, `Subscriber/${username}/dcnotes`);


  useEffect(() => {
    const fetchnotes = onValue(notesRef, (noteSnap => {
      if(noteSnap.exists()){
        const notesArray = [];
        noteSnap.forEach(child => {
          const noteno = child.val().noteno;
          const notetype = child.val().notetype;
          const notedate = child.val().notedate;
          const notefor = child.val().notefor;
          const amount = child.val().amount;
          const modifiedBy = child.val().modifiedby;          ;
          const modifiedon = child.val().modifiedon;
          const remarks = child.val().remarks;
          notesArray.push({noteno, notetype, notedate, notefor, amount, modifiedBy, modifiedon, remarks});

        });
        setArrayNotes(notesArray);
      }
    }));

    return () => fetchnotes();
  }, [username]);
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th  scope="col">Note No.</th>
                        <th  scope='col'>Note Type</th>
                        <th  scope="col">Note Date</th>
                        <th  scope="col">Note For</th>
                        <th  scope="col">Amount</th>
                        <th  scope="col">Modified By</th>
                        <th  scope="col">Modified On</th>
                        <th scope='col'>Remarks</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                  {
                    arraynotes.length > 0 ? (
                      arraynotes.slice().reverse().map(({noteno, notetype, notedate, notefor, amount, modifiedBy, modifiedon, remarks}, index) => (
                        <tr key={index}>
                          <td onClick={() => navigate('modnote', {state: {noteno: noteno}})} style={{color:notetype === 'Debit Note' ? 'red' : 'green', cursor:'pointer', fontWeight:'bold'}}>{noteno}</td>
                          <td>{notetype}</td>
                          <td>{notedate}</td>
                          <td>{notefor}</td>
                          <td>{`${amount}.00`}</td>
                          <td>{modifiedBy}</td>
                          <td>{modifiedon}</td>
                          <td>{remarks}</td>
                        </tr>
                      ))
                    ) : (
                      <td colSpan='8' style={{textAlign:'center'}}>No Debit and Credit Notes Available</td>
                    )
                  }
                <tr>
                    
                    
                    
                </tr>
                </tbody>

                </table>

            </div>

    </div>
  )
}
