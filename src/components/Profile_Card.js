import React, { useState } from 'react';
import profile from './subscriberpage/drawables/man.png'
import './Profile_Card.css'
import MyAttendnence_logo from './subscriberpage/drawables/attendance.png'
import Change_Password from './subscriberpage/drawables/reset-password.png'
import Arrow from './subscriberpage/drawables/arrow.png'
import { useNavigate } from 'react-router-dom';

export default function Profile_Card() {
    const navigate = useNavigate();

    const handleUserLogout = () => {
        localStorage.removeItem('contact');
        localStorage.removeItem('Name');
        localStorage.removeItem('Designation');
        navigate('/');
    };


    const handlePassClick = () => {
        navigate('/dashboad/migrate')
    }
    

    const items=[
        {text: "Profile View", icon: profile},
        {text: "My Attenence", icon: MyAttendnence_logo},
        {text: "Change Password", icon: Change_Password, onClick: handlePassClick},
        {text: "Logout", icon: Arrow, onClick: handleUserLogout}
    ]

    

  return (    
    
        <div style={{zIndex: '1', borderRadius: '8px', position: 'absolute', boxShadow: '0 0 10px gray', backgroundColor: 'white', width:'200px', padding:'1px',top: '11%', right: '0', marginRight: '7%'}}>
        
        <ul style={{alignContent: 'center', margin: 'auto', padding: '8px'}}> 
            {items.map((item, index) =>(
                <li style={{borderBottom: '1px solid gray', padding: '3px', cursor: 'pointer'}} key={index} className='list-item' onClick={item.onClick}>
                    <img src={item.icon} alt='' className='icon'></img>
                    {item.text}
                </li>
            ))}
        </ul>
        </div>
    
    
  )
}

