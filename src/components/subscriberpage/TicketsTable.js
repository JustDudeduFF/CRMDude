import React from 'react'
import { BrowserRouter as Router, Routes,Route, useNavigate } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import TicketTable from './TicketTable';
import NewTicket from './NewTicket';
import ModifyTicket from './ModifyTicket';
import ProtectedRoute from '../ProtectedRoute';
import './TicketsTable.css';

export default function TicketsTable() {
  const navigate = useNavigate();
  return (
    <div className="tickets-table-container">
      <div className="tickets-table-header">
        <div className="tickets-table-title">
          <h2>Tickets</h2>
        </div>
        <div className="tickets-table-actions">
          <button
            onClick={() => {
              navigate('newticket');
            }}
            type="button" className="tickets-table-btn tickets-table-btn-outline-primary">Generate Ticket</button>
          <img src={Excel_Icon} className='tickets-table-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='tickets-table-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="tickets-table-content">
        <Routes>
          <Route path='/' element={<TicketTable/>}/>
          <Route path='newticket' element={<ProtectedRoute permission="CREATE_TICKET"><NewTicket/></ProtectedRoute>}/>
          <Route path='modifyticket' element={<ProtectedRoute permission="CLOSE_TICKET"><ModifyTicket/></ProtectedRoute>}/>
        </Routes>
      </div>
    </div>
  )
}
