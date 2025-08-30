import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import RemarkFollowsTable from './RemarkFollowsTable';
import ModRemFollow from './ModRemFollow';
import AddRemarkFollow from './AddRemarkFollow';
import './RemakFollowTable.css';

export default function RemakFollowTable() {
  return (
    <div className="remark-follow-table-container">
      <div className="remark-follow-table-header">
        <div className="remark-follow-table-title">
          <h2>Remarks & Follow Ups</h2>
        </div>
        <div className="remark-follow-table-actions">
          <Link to='add_remark'>
            <button type="button" className="remark-follow-table-btn remark-follow-table-btn-outline-info">Add Remarks</button>
          </Link>
          <Link to='add_follow'>
            <button type="button" className="remark-follow-table-btn remark-follow-table-btn-outline-primary">Add Follow</button>
          </Link>
          <img src={Excel_Icon} className='remark-follow-table-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='remark-follow-table-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="remark-follow-table-content">
        <Routes>
          <Route path='/' element={<RemarkFollowsTable/>}/>
          <Route path='modremfollow' element={<ModRemFollow/>}/>
          <Route path='add_remark' element={<AddRemarkFollow mode={'remark'}/>}/>
          <Route path='add_follow' element={<AddRemarkFollow mode={'follow'}/>}/>
        </Routes>
      </div>
    </div>
  )
}
