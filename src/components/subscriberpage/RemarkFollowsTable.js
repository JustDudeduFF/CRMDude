import { child, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../FirebaseConfig';

export default function () {
  const username = localStorage.getItem('subsUserid');
  const [arrayremark, setArrayRemark] = useState([]);

  const remarkRef = ref(db, `Subscriber/${username}/Remarks`);

  useEffect(() => {
    const fetchdata = onValue(remarkRef, (remarkSnap => {
      if(remarkSnap.exists()){
        const remarkArray = [];
        remarkSnap.forEach(child => {
          const remarkno = child.val().remarkno;
          const type = child.val().type;
          const date = child.val().date;
          const description = child.val().description;
          const modifiedBy = child.val().modifiedBy;
          const modifiedon = child.val().modifiedon;
          const assigndate = child.val().assigndate;
          remarkArray.push({remarkno, type, date, description, modifiedon, modifiedBy});
        });
        setArrayRemark(remarkArray);
      }
    }));

    return () => fetchdata();
  }, [username]);
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th  scope="col">Action ID</th>
                        <th  scope='col'>Action Type</th>
                        <th  scope="col">Action Date</th>
                        <th  scope="col">Description</th>
                        <th  scope="col">Assign Date</th>
                        <th  scope="col">Modified By</th>
                        <th  scope="col">Modified On</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                  {arrayremark.length > 0 ? (
                    arrayremark.map(({remarkno, type, date, description, modifiedon, modifiedBy, assigndate}, index) => (
                      <tr key={index}>
                    <td><Link style={{color:'red', cursor:'pointer', fontWeight:'bold'}} id='link' to='modremfollow'>{remarkno}</Link></td>
                    <td>{type}</td>
                    <td>{date}</td>
                    <td>{description}</td>
                    <td>{assigndate}</td>
                    <td>{modifiedBy}</td>
                    <td>{modifiedon}</td>
                    
                    
                </tr>
                    ))
                  ) : (
                    <td colSpan='8' style={{textAlign:'center'}}>No Data Found</td>
                  )
                }
                
                </tbody>

                </table>

            </div>

    </div>
  )
}
