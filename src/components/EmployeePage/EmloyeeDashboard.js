import React, {  useEffect, useState } from 'react'

import './EmpCSS.css'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import NewEmployee from './NewEmployee'
import EmpDash from './EmpDash'
import { db } from '../../FirebaseConfig'
import { onValue, ref } from 'firebase/database'
import EmpDetails from './EmpDetails'


export default function EmloyeeDashboard() {
  const [text, setText] = useState('1.1');
  const [employeName, setEmployename] = useState([]);
  const [employemobile, setEmployeMobile] = useState([]);
  const navigate = useNavigate();
  
  

  
  useEffect(() => {
    // Reference to the Firebase database path
    const dbRef = ref(db, 'users');

    // Set up a listener for real-time updates
    const unsubscribe = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        const names = [];
        const mobiles = [];
        snapshot.forEach((childSnapshot) => {
          const fullname = childSnapshot.val().fullname;
          const mobile = childSnapshot.val().mobile;
          names.push(fullname);
          mobiles.push(mobile);
          
        });
        // Update state with the fetched names
        setEmployename(names);
        setEmployeMobile(mobiles);
      } else {
        console.log('No data available');
      }
    });

    // Cleanup function to remove the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const showEmpDetail = (mobile) => {
    navigate('empdetail/*', { state:{mobile}});

  }
  

  const handleClickNew = () =>{
    setText('1.1');
  }

  const handleClick = () => {
    
    // Update the state with the new string
    setText('0');

    
  };
  
  return (
    <div style={{marginTop:'4.5%', display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', display:'flex', flexDirection:'row', margin:'10px'}}>
        <div style={{flex:'1'}}>
          <Link style={{color:'black'}} id='link' to='/dashboard/employees'>
          <h3 style={{cursor:'pointer'}} onClick={handleClickNew} >Manage Employees</h3>
          </Link>
        </div>
        <div style={{width:'max-content', float:'right'}}>
          <Link id='link' to='newemployee'> 
          <button onClick={handleClick} className='btn btn-outline-info'>Add New Employee</button>
          </Link>

        </div>
      </div>



      <div style={{display:'flex', flexDirection:'row', margin:'10px'}}>


        <div style={{flex:`${text}`, overflowY:'auto', height:'79vh', scrollbarWidth:'none', transition:'linear 0.3s'}}>
        <ol className="list-group list-group">
          {employeName.map((name, index) => (
            <li onClick={() => showEmpDetail(employemobile[index])} className="list-group-item justify-content-between align-items-start mt-2" key={index}>
              <div className='fw-light'>{name}</div>
              <div>{employemobile[index]}</div> 

            </li>
          ))}
          
        </ol>
        
        </div>

        <div style={{flex:'7', marginLeft:'10px', height:'79vh'}}>
          
          <Routes>
            <Route path='/' element={<EmpDash/>}/>
            <Route path='empdetail/*' element={<EmpDetails/>}/>
            <Route path='newemployee/*' element={<NewEmployee/>}/>
          </Routes>
        </div>
      </div>

    </div>
  )
}
