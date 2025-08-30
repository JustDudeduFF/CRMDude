import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link, useLocation, useNavigate } from 'react-router-dom';
import ReceiptModify from './ReceiptModify';
import PaymetTable from './PaymetTable';
import ProtectedRoute from '../ProtectedRoute'
import './Cust_PayRecpt.css';

export default function Cust_PayRecpt() {
  const location = useLocation();
  const {userid} = location.state || {};

  const navigate = useNavigate();
  return (
    <div className="cust-pay-receipt-container">
      <div className="cust-pay-receipt-header">
        <div className="cust-pay-receipt-title">
          <h2>Payments & Receipts</h2>
        </div>
        <div className="cust-pay-receipt-actions">
          <button onClick={() => {
              navigate('collect', {state: {userid}});
          }} type="button" className="cust-pay-receipt-btn cust-pay-receipt-btn-outline-success">Create Receipt</button>
          <img src={Excel_Icon} className='cust-pay-receipt-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='cust-pay-receipt-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="cust-pay-receipt-content">
        <Routes>
          <Route path='/' element={<PaymetTable/>}/>
          <Route path='collect' element={<ProtectedRoute permission="COLLECT_PAYMENT"><ReceiptModify/></ProtectedRoute>}/>
          <Route path='modify' element={<ReceiptModify/>}/>
        </Routes>
      </div>
    </div>
  )
}
