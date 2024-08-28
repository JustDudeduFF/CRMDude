import React, { useEffect, useState } from 'react'
import { db } from '../FirebaseConfig'
import { get, ref, update } from 'firebase/database'
import { useNavigate } from 'react-router-dom'
import PasswordModal from './PasswordModal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


export default function Loginlayout() {

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2]= useState('');



  useEffect(() => {
    if(localStorage.getItem('contact')){
      navigate('/dashboard');
    }
  })
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  
  const userRef = ref(db, `users/${contact}`);

  
  
  const contactChange = (event) => {
    setContact(event.target.value);
  }

  const passwordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleClick = async () => {
    if(contact === ''){
      alert('Enter Contact No.')
    }else{
      
    
    setLoading(true);
    
    try{
      
      const snapshot = await get(userRef);

      if(snapshot.exists()){
        
        const name = snapshot.val().fullname;
        const designation = snapshot.val().designation;
        if(snapshot.hasChild('pass')){
          const fetchPass = snapshot.val().pass;
          if(fetchPass === password){
            setLoading(false);
          localStorage.setItem('contact', contact);
          localStorage.setItem('Name', name);
          localStorage.setItem('Designation', designation);
          navigate('/dashboard');
          }else{
            alert('Password Not Matched');
          }  
          
        }else{
          setShowModal(true);
        } 
      }else{
        setLoading(false  );
        alert('UserName Not Found');
      }
    }catch (error){
      console.log(error);
    }
    }
  
    
    
  }

  return (
    <>
    <div style={{float: 'right'}} className='login-div'>
        <h1>Login</h1>
        <h3>CRM Dude, Your Imaginaiton Our Creation</h3>
        <label>Contact No.</label><br></br>
        <input className='input_login' type='tel' value={contact} onChange={contactChange}></input><br></br>
        <label>Password</label><br></br>
        <input onChange={passwordChange} value={password} className='input_login' type='password'></input><br></br>
        <button onClick={handleClick} className='btn_login'>Login</button>
        <ToastContainer/>

        <PasswordModal show={showModal} changePassword2={(e)=> setPassword2(e.target.value)} changePassword={(e) => setPassword1(e.target.value)} onClose={() => {
          if(password1 === password2){
            update(userRef, {pass:password1})
            setShowModal(false);
          }else{
            toast.error('Password is Not Matched', {
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
            });
          }
        }}/>
        {loading && <p>Loading...</p>}
    </div></>
  )
}




