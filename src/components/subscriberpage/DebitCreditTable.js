import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import DebitCreditsTable from './DebitCreditsTable';
import CreateNote from './CreateNote';
import ModDCNote from './ModDCNote';
import ProtectedRoute from '../ProtectedRoute';
import './DebitCreditTable.css';

export default function DebitCreditTable() {
  return (
    <>
      <div className="debit-credit-table-header">
        <div className="debit-credit-table-title">
          <h2>Debit & Credit Notes</h2>
        </div>
        <div className="debit-credit-table-actions">
          <Link to='/dashboard/subscriber/dcnote/add_dnotes'>
            <button type="button" className="debit-credit-table-btn debit-credit-table-btn-outline-danger">Add Debit Note</button>
          </Link>
          <Link to='/dashboard/subscriber/dcnote/add_cnotes'>
            <button type="button" className="debit-credit-table-btn debit-credit-table-btn-outline-success">Add Credit Note</button>
          </Link>
          <img src={Excel_Icon} className='debit-credit-table-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='debit-credit-table-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="debit-credit-table-content">
        <Routes>
          <Route path='/' element={<DebitCreditsTable/>}/>
          <Route path='add_dnotes' element={<ProtectedRoute permission="CREATE_CREDIT"><CreateNote notety={"danger"}/></ProtectedRoute>}/>
          <Route path='add_cnotes' element={<ProtectedRoute permission="CREATE_DEBIT"><CreateNote notety={"success"}/></ProtectedRoute>}/>
          <Route path='modnote' element={<ModDCNote/>}/>
        </Routes>
      </div>
      </>
  )
}
