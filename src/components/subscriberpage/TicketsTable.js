import React from 'react'
import { BrowserRouter as Router, Routes,Route, useNavigate } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import TicketTable from './TicketTable';
import NewTicket from './NewTicket';
import ModifyTicket from './ModifyTicket';
import ProtectedRoute from '../ProtectedRoute';

export default function TicketsTable() {
  const navigate = useNavigate();
  const generatetickets = localStorage.getItem('generatetickets');
  return (
        <>
    
         <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'2'}}>
            <h2>Tickets</h2>
            </div>
            <div style={{flex:'4'}}>
                <div style={{width:'max-content', float:'right'}}>
                
                    <button
                    onClick={() => {
                      if(generatetickets === 'true'){
                        navigate('newticket');
                      }else{
                        alert('You are not allowed to generate ticket');
                      }
                    }}
                     type="button" className="btn btn-outline-primary">Genearte Ticket</button>
                    <img src={Excel_Icon} className='img_download_icon'></img>
                    <img src={PDF_Icon} className='img_download_icon'></img>
                </div>
            </div>
        </div>
        <div style={{flex:'10'}}>
            <Routes>
                <Route path='/' element={<TicketTable/>}/>
                <Route path='newticket' element={<ProtectedRoute permission="CREATE_TICKET"><NewTicket/></ProtectedRoute>}/>
                <Route path='modifyticket' element={<ModifyTicket/>}/>
            </Routes>
        </div>
        </>
    
  )
}
