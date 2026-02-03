import React from 'react';
import { Lock, ShieldCheck, EyeOff } from 'lucide-react'; // Optional: if you use lucide-react

const PasswordModal = ({ show, onClose, changePassword, changePassword2 }) => {
  if (!show) return null;

  return (
    <div className="pw-overlay">
      <div className="pw-card">
        <div className="pw-header">
          <div className="pw-icon-circle">
            <Lock size={24} />
          </div>
          <h2>Secure Your Account</h2>
          <p>Please create a strong numeric password to continue</p>
        </div>

        <div className="pw-body">
          <div className="pw-input-group">
            <label>New Password</label>
            <div className="pw-input-wrapper">
              <input 
                type='number' 
                placeholder="••••" 
                onChange={changePassword} 
                className='pw-input'
              />
            </div>
          </div>

          <div className="pw-input-group">
            <label>Confirm Password</label>
            <div className="pw-input-wrapper">
              <input 
                type='number' 
                placeholder="••••" 
                onChange={changePassword2} 
                className='pw-input'
              />
            </div>
          </div>
        </div>

        <div className="pw-footer">
          <button className="pw-submit-btn" onClick={onClose}>
            <ShieldCheck size={18} />
            <span>Set Password</span>
          </button>
        </div>
      </div>

      <style>{`
        .pw-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; padding: 20px;
        }
        .pw-card {
          background: #ffffff; width: 100%; max-width: 400px;
          border-radius: 24px; padding: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pw-header { text-align: center; margin-bottom: 2rem; }
        .pw-icon-circle {
          width: 56px; height: 56px; background: #eff6ff; color: #3b82f6;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .pw-header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; font-weight: 800; }
        .pw-header p { margin: 0.5rem 0 0; font-size: 0.9rem; color: #64748b; line-height: 1.4; }

        .pw-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .pw-input-group { display: flex; flex-direction: column; gap: 6px; }
        .pw-input-group label { font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }
        
        .pw-input {
          width: 100%; padding: 12px 16px; border-radius: 12px;
          border: 2px solid #e2e8f0; font-size: 1rem; outline: none;
          transition: all 0.2s ease; background: #f8fafc;
        }
        .pw-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        
        /* Remove arrows from number input */
        .pw-input::-webkit-outer-spin-button,
        .pw-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        .pw-footer { margin-top: 2rem; }
        .pw-submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: #10b981; color: white; font-weight: 700; font-size: 1rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .pw-submit-btn:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3); }
        .pw-submit-btn:active { transform: translateY(0); }

        @media (max-width: 480px) {
          .pw-card { padding: 1.5rem; border-radius: 20px; }
          .pw-header h2 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
};

export default PasswordModal;