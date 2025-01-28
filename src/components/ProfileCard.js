import React, { useState } from 'react';
import profile from './subscriberpage/drawables/man.png'
import './Profile_Card.css'
import MyAttendnence_logo from './subscriberpage/drawables/attendance.png'
import Change_Password from './subscriberpage/drawables/reset-password.png'
import Arrow from './subscriberpage/drawables/arrow.png'
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import { api, db } from '../FirebaseConfig';
import { ref, update } from 'firebase/database';

export default function Profile_Card() {
    const navigate = useNavigate();
    const [passmodal, setShowPassModal] = useState(false);
    const [oldpass, setoldpass] = useState("");
    const [newpass, setenewpass] = useState("");

    const handleUserLogout = () => {
        localStorage.removeItem('contact');
        localStorage.removeItem('Name');
        localStorage.removeItem('Designation');
        navigate('/');
    };


    const handlePassClick = () => {
        setShowPassModal(true);
    }

    const updatePass = async() => {
        const response = await axios.get(api+`/users/${localStorage.getItem('contact')}`);
        if(response.status !== 200) return;

        const data = response.data;
        if(data){
            const pass = data.pass;
            if(oldpass === pass && newpass !==  null){
                const newp = {
                    pass:newpass
                }

                await update(ref(db, `users/${localStorage.getItem('contact')}`), newp).then(() => {
                    alert("Password Changed")
                    handleUserLogout();
                });
            }else{
                alert("Old Password not matched or new Password is empty");
            }
        }

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
        <Modal show={passmodal} onHide={() => setShowPassModal(false)}>
            <Modal.Header>
                <Modal.Title>
                    Change Password
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <div className='col-md'>
                        <label className='form-label'>Enter Old Password</label>
                        <input onChange={(e) => setoldpass(e.target.value)} className='form-control' type='text'></input>
                    </div>

                    <div className='col-md'>
                        <label className='form-label'>Enter New Password</label>
                        <input onChange={(e) => setenewpass(e.target.value)} className='form-control' type='text'></input>
                    </div>


                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={updatePass} className='btn btn-primary'>Update</button>
                <button onClick={() => setShowPassModal(false)} className='btn btn-outline-secondary'>Cancel</button>
            </Modal.Footer>
        </Modal>
        </div>
    
    
  )
}

