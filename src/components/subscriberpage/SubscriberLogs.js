import { get, ref } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import { db } from '../../FirebaseConfig';

export default function SubscriberLogs() {
  const username = localStorage.getItem('susbsUserid');
  const [logArray, setLogArray] = useState([]);
  const [usersLookup, setUsersLookup] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = ref(db, `users`);
      const userSnap = await get(userRef);
  
      if (userSnap.exists()) {
        const lookup = {};
  
        userSnap.forEach((user) => {
          const userId = user.key;
          const name = user.val().FULLNAME;
  
          lookup[userId] = name || 'Unknown User';
        });
        
        setUsersLookup(lookup); // Update the lookup after processing all users
      }
    };
  
    const fetchLogs = async (lookup) => {
      const logRef = ref(db, `Subscriber/${username}/logs`);
      const logSnap = await get(logRef);
  
      if (logSnap.exists()) {
        const array = [];
        logSnap.forEach((child) => {
          const date = child.val().date;
          const description = child.val().description;
          const modifiedby = child.val().modifiedby; // Use lookup for modifiedby
  
          array.push({ date, description, modifiedby });
        });
        setLogArray(array);
      }
    };
  
    const fetchData = async () => {
      await fetchUser();
      setTimeout(() => {
        fetchLogs(usersLookup);
      }, 500); // Delay to ensure lookup is populated (if needed)
    };
  
    fetchData();
  }, [username]);
  

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'2'}}>
        <h2>Subscriber Logs</h2>

      </div>

      <div style={{flex:'10'}}>
        <table className='table'>
          <thead>
            <tr className='table-primary'>
              <th scope='col'>Date</th>
              <th scope='col'>Description</th>
              <th scope='col'>Update By</th>
            </tr>
          </thead>

          <tbody className='table-group-divider'>
            {
              logArray.length > 0 ? (
                logArray.map((data, index) => (
                  <tr key={index}>
                    <td>{new Date(data.date).toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'})}</td>
                    <td>{data.description}</td>
                    <td>{usersLookup[data.modifiedby]}</td>
                  </tr>
                ))
              ) : (
                <tr>There is no any logs!</tr>
              )
            }
          </tbody>

        </table>

      </div>

    </div>
  )
}
