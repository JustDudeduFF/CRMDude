import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import ReceiptModify from './ReceiptModify';
import PaymetTable from './PaymetTable';

export default function Cust_PayRecpt() {
  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'2'}}>
          <h2>Payments & Receipts</h2>
        </div>
        <div style={{flex:'4'}}>
            <div style={{width:'max-content', float:'right'}}>
              <Link id='link' to='collect'>
                <button type="button" className="btn btn-outline-success">Create Receipt</button></Link>
                <img src={Excel_Icon} className='img_download_icon'></img>
                <img src={PDF_Icon} className='img_download_icon'></img>

            </div>
        </div>
    </div>
    <div style={{flex:'9'}}>
      <Routes>
        <Route path='/' element={<PaymetTable/>}/>
        <Route path='collect' element={<ReceiptModify/>}/>
        <Route path='modify' element={<ReceiptModify/>}/>
      </Routes>
    </div>

    </>

  )
}
