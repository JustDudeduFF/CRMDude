import { get, ref, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../FirebaseConfig';
import { FaBoxes, FaHistory, FaTools, FaExclamationTriangle, FaClipboardList } from 'react-icons/fa';

export default function InventryModify() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('susbsUserid');
  const { productcode } = location.state || {};

  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [produtname, setProductName] = useState('');
  const [serialno, setSerialNo] = useState('');
  const [remarks2, setRemarks2] = useState('');
  const [status, setStatus] = useState('');
  const [inatinventry, setInAtInventry] = useState('');

  return (
    <div className="inventory-modify-container p-3">
      
      {/* SECTION 1: PRODUCT SUMMARY (READ ONLY) */}
      <div className="summary-card shadow-sm mb-4">
        <div className="card-header-custom bg-light border-bottom">
          <FaBoxes className="me-2 text-warning" />
          <span className="fw-bold text-dark">Hardware Information</span>
        </div>
        <div className="p-4">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="field-label-sm">Product Code</label>
              <div className="read-only-box">{productcode || 'N/A'}</div>
            </div>
            <div className="col-md-2">
              <label className="field-label-sm">Purchase Date</label>
              <div className="read-only-box">{date || '---'}</div>
            </div>
            <div className="col-md-2">
              <label className="field-label-sm">Name</label>
              <div className="read-only-box text-truncate">{produtname || '---'}</div>
            </div>
            <div className="col-md-3">
              <label className="field-label-sm">Serial Number</label>
              <div className="read-only-box">{serialno || '---'}</div>
            </div>
            <div className="col-md-3">
              <label className="field-label-sm">Valuation (Amount)</label>
              <div className="read-only-box">₹ {amount || '0.00'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATUS UPDATE FORM */}
      <div className="modify-card shadow-lg">
        <div className="card-header-custom amber-gradient text-white">
          <FaTools className="me-2" />
          <span className="fw-bold">Update Product Status</span>
        </div>
        
        <div className="p-4">
          <form className="row g-4">
            <div className="col-md-4">
              <label className="modern-label">
                <FaExclamationTriangle className="me-1 text-warning"/> Current Condition/Action
              </label>
              <select 
                onChange={(e) => setStatus(e.target.value)} 
                className="modern-select"
                value={status}
              >
                <option value=''>Select Condition...</option>
                <option value='damaged'>Damaged / Non-Functional</option>
                <option value='repair'>Sent for Repair</option>
              </select>
            </div>

            <div className="col-md-8">
              <label className="modern-label">
                <FaClipboardList className="me-1 text-warning"/> Modification Remarks
              </label>
              <input 
                onChange={(e) => setRemarks2(e.target.value)} 
                type="text" 
                className="modern-input" 
                placeholder="Enter reason for status change (e.g., Screen cracked, faulty battery)"
              />
            </div>

            <div className="col-12 mt-4 pt-3 border-top">
              <div className="d-flex gap-2 justify-content-end">
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="btn btn-light rounded-pill px-4 fw-bold"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-amber-gradient rounded-pill px-5 border-0 py-2 fw-bold text-white shadow"
                >
                  Update Inventory
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .inventory-modify-container { font-family: 'Inter', sans-serif; }
        
        /* Summary Card Styling */
        .summary-card { background: #fff; border-radius: 12px; border: 1px solid #eef2f6; overflow: hidden; }
        .read-only-box { 
          background: #fdfaf5; padding: 10px 15px; border-radius: 8px; border: 1px solid #fed7aa;
          font-weight: 700; color: #9a3412; font-size: 0.85rem;
        }

        /* Modify Card Styling */
        .modify-card { background: #fff; border-radius: 15px; border: none; overflow: hidden; }
        .card-header-custom { padding: 15px 25px; display: flex; align-items: center; }
        .amber-gradient { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); }
        
        .field-label-sm { font-size: 0.65rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .modern-label { font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 8px; display: block; }

        .modern-input, .modern-select {
          width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #f1f5f9;
          font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s;
        }
        .modern-input:focus, .modern-select:focus { border-color: #f59e0b; background: #fff; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }

        .btn-amber-gradient { 
          background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); 
          transition: 0.3s;
        }
        .btn-amber-gradient:hover { transform: translateY(-2px); opacity: 0.95; }
      `}</style>
    </div>
  );
}