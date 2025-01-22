import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../../FirebaseConfig';

export default function () {
  const username = localStorage.getItem('susbsUserid');
  const [arrayremark, setArrayRemark] = useState([]);
  const navigate = useNavigate();

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
          const modifiedBy = child.val().modifiedby;
          const modifiedon = child.val().modifiedon;
          const status = child.val().status;
          remarkArray.push({remarkno, type, date, description, modifiedon, modifiedBy, status});
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
                    <tr className='table-primary'>
                        <th  scope="col">Action ID</th>
                        <th  scope='col'>Action Type</th>
                        <th  scope="col">Action Date</th>
                        <th  scope="col">Description</th>
                        <th  scope="col">Modified By</th>
                        <th  scope="col">Modified On</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                  {arrayremark.length > 0 ? (
                    arrayremark.map(({remarkno, type, date, description, modifiedon, modifiedBy, status}, index) => (
                      <tr className={status === 'pending' ? 'table-danger' : 'table-success'} key={index}>
                    <td onClick={() => 
                      {if(type === 'Follow Up'){
                        navigate('modremfollow', {state: {remarkno: remarkno}});
                      }else{
                        alert('Remarks Are Not Modifiable');
                      }}
                    } style={{color:type === 'Follow Up' ? 'blue' : 'black', cursor:'pointer', fontWeight:'bold'}}>{remarkno}</td>
                    <td>{type}</td>
                    <td>{date}</td>
                    <td>{description}</td>
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
