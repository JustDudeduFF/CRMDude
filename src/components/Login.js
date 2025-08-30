import React, { useEffect, useState } from 'react';
import './Login.css';
import Animationlogin from './Animationlogin';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { api2 } from '../FirebaseConfig';

export default function Login() {
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
      toast.error('Enter Contact No.', { autoClose: 2000 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${api2}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: contact, password })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('contact', contact);
        localStorage.setItem('empid', data.user.id);
        localStorage.setItem('Name', data.user.name);
        localStorage.setItem('Designation', data.user.role);
        localStorage.setItem('partnerId', data.user.partnerId);
        navigate('/dashboard');
      }
    } catch (error) {
      setLoading(false);
      toast.error('Error connecting to server', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        position: "top-center",
      });
    }
  }

  // Only one return at the end
  return (
    <div className="login-page-wrapper">
    <ToastContainer/>
      <div className="crm-logo">
        <span>CRM Dude</span>
      </div>
      <div className="animation-bg">
        <Animationlogin />
      </div>
      <div className="login-center">
        <div className='login-div glass-bg'>
          <h1>Login</h1>
          <h3>CRM Dude, Your Imagination Our Creation</h3>
          <label htmlFor="contact">Contact No.</label>
          <input id="contact" className='input_login' type='tel' value={contact} onChange={contactChange} placeholder="Enter your contact number" />
          <label htmlFor="password">Password</label>
          <input id="password" onChange={passwordChange} value={password} className='input_login' type='password' placeholder="Enter your password" />
          <button onClick={handleClick} className='btn_login' disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>

        </div>
      </div>
    </div>
  );
}
