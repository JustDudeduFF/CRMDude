import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { API } from '../FirebaseConfig';

export default function Loginlayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if(localStorage.getItem('contact')){
      navigate('/dashboard');
    }
  }, [navigate]);

  const contactChange = (event) => {
    setContact(event.target.value);
  }

  const passwordChange = (event) => {
    setPassword(event.target.value);
  }

  const handleClick = async () => {
    if(contact === ''){
      alert('Enter Contact No.')
      return;
    }
    setLoading(true);
    try {
      const res = await API.post(`/auth/login`, {
        phone: contact,
        password
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('contact', contact);
        localStorage.setItem('empid', data.user.id);
        localStorage.setItem('Name', data.user.name);
        localStorage.setItem('Designation', data.user.role);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.log('Error during login:', error);
      setLoading(false);
      toast.error('Error connecting to server', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
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
        {loading && <p>Loading...</p>}
    </div></>
  )
}




