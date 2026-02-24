import React from 'react';
import { Construction, X, Clock, Bell } from 'lucide-react';

const DevelopmentModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null;

  return (
    <div className="dev-modal-overlay">
      <style>{`
        .dev-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }
        .dev-modal-card {
          background: white;
          width: 100%;
          max-width: 450px;
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.3s ease-out;
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .icon-container {
          width: 80px;
          height: 80px;
          background: #fff7ed;
          color: #f97316;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #f8fafc;
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          color: #64748b;
          transition: 0.2s;
        }
        .close-btn:hover { background: #f1f5f9; color: #0f172a; }
        .notify-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          margin-top: 1.5rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .notify-btn:hover { background: #1e293b; transform: translateY(-1px); }
      `}</style>

      <div className="dev-modal-card">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="icon-container">
          <Construction size={40} strokeWidth={1.5} />
        </div>

        <h3 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Coming Soon!
        </h3>
        
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
          The <span style={{ color: '#0f172a', fontWeight: 600 }}>{featureName || 'requested feature'}</span> is currently under construction to give you the best experience.
        </p>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          color: '#f97316', 
          background: '#fff7ed',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginTop: '1rem'
        }}>
          <Clock size={16} /> Expected Release: Q2 2026
        </div>

        <button className="notify-btn" onClick={onClose}>
          <Bell size={18} /> Notify Me When Ready
        </button>
      </div>
    </div>
  );
};

export default DevelopmentModal;