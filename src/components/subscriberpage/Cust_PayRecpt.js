import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link, useLocation, useNavigate } from 'react-router-dom';
import ReceiptModify from './ReceiptModify';
import PaymetTable from './PaymetTable';
import ProtectedRoute from '../ProtectedRoute'

export default function Cust_PayRecpt() {
  const location = useLocation();
  const {userid} = location.state || {};

  const navigate = useNavigate();
  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'2'}}>
          <h2>Payments & Receipts</h2>
        </div>
        <div style={{flex:'4'}}>
            <div style={{width:'max-content', float:'right'}}>
              
                <button onClick={() => {
                    navigate('collect', {state: {userid}});
                }} type="button" className="btn btn-outline-success">Create Receipt</button>
                <img src={Excel_Icon} className='img_download_icon'></img>
                <img src={PDF_Icon} className='img_download_icon'></img>

            </div>
        </div>
    </div>
    <div style={{flex:'9'}}>
      <Routes>
        <Route path='/' element={<PaymetTable/>}/>
        <Route path='collect' element={<ProtectedRoute permission="COLLECT_PAYMENT"><ReceiptModify/></ProtectedRoute>}/>
        <Route path='modify' element={<ReceiptModify/>}/>
      </Routes>
    </div>

    </>

  )
}
