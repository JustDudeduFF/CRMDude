import React, { useEffect, useState } from 'react';
import Animationlogin from './Animationlogin';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "./subscriberpage/drawables/android-chrome-512x512.png";
import { FaPhoneAlt, FaLock } from 'react-icons/fa';
import { API } from '../FirebaseConfig';
import e from 'cors';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (localStorage.getItem('contact')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const contactChange = (event) => setContact(event.target.value);
  const passwordChange = (event) => setPassword(event.target.value);

  const handleClick = async () => {
    if (contact === '') {
      toast.error('Enter Contact No.', { autoClose: 2000 });
      return;
    }
    setLoading(true);
    try {
      const res = await API.post(`/auth/login`, {
        phone: contact,
        password
      });

      const data = await res.data;
      setLoading(false);
      if (res.status === 200) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('contact', contact);
        localStorage.setItem('empid', data.user.id);
        localStorage.setItem('Name', data.user.name);
        localStorage.setItem('Designation', data.user.role);
        localStorage.setItem('partnerId', data.user.partnerId);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Invalid Credentials');
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message || 'Error connecting to server', {
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="login-split-wrapper">
      <ToastContainer />
      
      {/* LEFT SIDE: ANIMATION & BRANDING */}
      <div className="login-side-visual d-none d-lg-flex">
        <div className="visual-overlay"></div>
        <div className="animation-container">
          <Animationlogin />
        </div>
        <div className="brand-content">
          <img src={logo} alt="Logo" className="brand-logo-large" />
          <h1 className="display-4 fw-bold text-white">CRM Dude</h1>
          <p className="lead text-white-50">Empowering your business connectivity with smart management tools.</p>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="login-side-form">
        <div className="form-container">
          {/* Mobile Logo (only shows on small screens) */}
          <div className="d-lg-none text-center mb-4">
            <img src={logo} alt="Logo" style={{width: '60px'}} />
            <h3 className="fw-bold purple-text mt-2">CRM Dude</h3>
          </div>

          <div className="form-header mb-4">
            <h2 className="fw-bold text-dark">Login</h2>
            <p className="text-muted">Enter your credentials to access your account</p>
          </div>

          <div className="login-form-body">
            <div className="form-group mb-3">
              <label className="login-label-sm">Contact Number</label>
              <div className="modern-input-wrapper">
                <FaPhoneAlt className="input-icon" />
                <input 
                  type='tel' 
                  value={contact} 
                  onChange={contactChange} 
                  placeholder="98765 43210" 
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="login-label-sm">Password</label>
              <div className="modern-input-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type='password' 
                  value={password} 
                  onChange={passwordChange} 
                  placeholder="••••••••" 
                  className="modern-input"
                />
              </div>
            </div>

            <button 
              onClick={handleClick} 
              className="modern-login-btn" 
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : 'Sign In'}
            </button>

            <div className="text-center mt-5">
              <p className="small text-muted mb-0">© 2024 CRM Dude</p>
              <p className="small text-muted">Your Imagination Our Creation</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-split-wrapper {
          display: flex;
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        /* Visual Side (Left) */
        .login-side-visual {
          flex: 1.2;
          position: relative;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .visual-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.2) 100%);
          z-index: 1;
        }

        .animation-container {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          opacity: 0.6;
        }

        .brand-content {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 40px;
          max-width: 500px;
        }

        .brand-logo-large {
          width: 120px;
          height: 120px;
          margin-bottom: 2rem;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
        }

        /* Form Side (Right) */
        .login-side-form {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #fff;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
        }

        .purple-text {
          color: #764ba2;
        }

        .login-label-sm {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
          display: block;
        }

        .modern-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .modern-input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #f1f5f9;
          background: #f8fafc;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .modern-input:focus {
          outline: none;
          background: #fff;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .modern-login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          margin-top: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .modern-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(118, 75, 162, 0.3);
        }

        .modern-login-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 991px) {
          .login-side-form {
            background: #f8fafc;
          }
        }
      `}</style>
    </div>
  );
}