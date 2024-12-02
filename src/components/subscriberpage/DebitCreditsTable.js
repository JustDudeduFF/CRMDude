import { onValue, ref, off } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../FirebaseConfig';

export default function DebitCreditsTable() {
  const username = localStorage.getItem('susbsUserid');
  const [arraynotes, setArrayNotes] = useState([]);
  const navigate = useNavigate();

  // Firebase reference
  const notesRef = ref(db, `Subscriber/${username}/dcnotes`);

  useEffect(() => {
    // Fetch notes from Firebase
    const fetchnotes = onValue(notesRef, (noteSnap) => {
      if (noteSnap.exists()) {
        const notesArray = [];
        noteSnap.forEach((child) => {
          const noteData = child.val();
          const noteno = noteData.noteno || 'N/A';
          const notetype = noteData.notetype || 'N/A';
          const notedate = noteData.notedate || 'N/A';
          const notefor = noteData.notefor || 'N/A';
          const amount = noteData.amount || 0;
          const modifiedBy = noteData.modifiedby || 'N/A';
          const modifiedon = noteData.modifiedon || 'N/A';
          const remarks = noteData.remarks || 'No remarks';

          notesArray.push({
            noteno,
            notetype,
            notedate,
            notefor,
            amount,
            modifiedBy,
            modifiedon,
            remarks,
          });
        });
        setArrayNotes(notesArray);
      } else {
        setArrayNotes([]);
      }
    });

    // Cleanup the listener on unmount
    return () => {
      off(notesRef); // Remove listener to prevent memory leaks
    };
  }, [username]);

  return (
    <div>
      <div style={{ overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }} className="table">
          <thead>
            <tr>
              <th scope="col">Note No.</th>
              <th scope="col">Note Type</th>
              <th scope="col">Note Date</th>
              <th scope="col">Note For</th>
              <th scope="col">Amount</th>
              <th scope="col">Modified By</th>
              <th scope="col">Modified On</th>
              <th scope="col">Remarks</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arraynotes.length > 0 ? (
              arraynotes.reverse().map(
                (
                  {
                    noteno,
                    notetype,
                    notedate,
                    notefor,
                    amount,
                    modifiedBy,
                    modifiedon,
                    remarks,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td
                      onClick={() =>
                        navigate('modnote', { state: { noteno: noteno } })
                      }
                      style={{
                        color: notetype === 'Debit Note' ? 'red' : 'green',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      {noteno}
                    </td>
                    <td>{notetype}</td>
                    <td>{notedate}</td>
                    <td>{notefor}</td>
                    <td>{`${amount}.00`}</td>
                    <td>{modifiedBy}</td>
                    <td>{modifiedon}</td>
                    <td>{remarks}</td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No Debit and Credit Notes Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
