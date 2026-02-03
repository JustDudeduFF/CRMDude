import React from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import TicketTable from './TicketTable';
import NewTicket from './NewTicket';
import ModifyTicket from './ModifyTicket';
import ProtectedRoute from '../ProtectedRoute';
import { FaTicketAlt, FaPlusCircle, FaArrowLeft, FaHistory } from 'react-icons/fa';

export default function TicketsTable() {
  const navigate = useNavigate();
  const location = useLocation();

  // Logic to detect if we are in the "New Ticket" or "Modify" view
  const isFormView = location.pathname.includes('newticket') || location.pathname.includes('modifyticket');

  return (
    <div className="tickets-master-wrapper p-3">
      
      {/* CONDITIONAL HEADER RENDERING */}
      {isFormView ? (
        /* HEADER FOR CREATE/MODIFY TICKET PAGE */
        <div className="ticket-header-modern shadow-sm mb-4">
           <div className="d-flex align-items-center justify-content-between w-100 flex-wrap gap-3">
             <div className="d-flex align-items-center">
                <button className="back-btn-circle me-3" onClick={() => navigate(-1)}>
                   <FaArrowLeft />
                </button>
                <div className="header-icon-container"><FaTicketAlt /></div>
                <div className="ms-3">
                   <h5 className="mb-0 fw-bold header-title">Support Ticket Generation</h5>
                   <p className="text-muted small mb-0 header-subtitle">Assign a new concern to the technical support team</p>
                </div>
             </div>
           </div>
        </div>
      ) : (
        /* STANDARD HEADER FOR TABLE VIEW */
        <div className="ticket-nav-bar shadow-sm mb-4">
          <div className="nav-info-group">
            <div className="nav-icon-square"><FaHistory /></div>
            <div className="ms-3">
              <h4 className="fw-bold mb-0 header-title">Support Tickets</h4>
              <p className="text-muted small mb-0 header-subtitle">Track and manage customer technical complaints</p>
            </div>
          </div>

          <div className="nav-actions-group">
            <button 
              className="generate-ticket-pill" 
              onClick={() => navigate('newticket')}
            >
              <FaPlusCircle /> <span>Generate Ticket</span>
            </button>
            
            <div className="export-separator">
              <img src={Excel_Icon} alt="Excel" className="export-img" title="Export Excel" />
              <img src={PDF_Icon} alt="PDF" className="export-img" title="Export PDF" />
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="ticket-content-body">
        <Routes>
          <Route path='/' element={<TicketTable/>}/>
          <Route path='newticket' element={
            <ProtectedRoute permission="CREATE_TICKET">
              <NewTicket/>
            </ProtectedRoute>
          }/>
          <Route path='modifyticket' element={
            <ProtectedRoute permission="CLOSE_TICKET">
              <ModifyTicket/>
            </ProtectedRoute>
          }/>
        </Routes>
      </div>

      <style>{`
        .tickets-master-wrapper { padding: 5px; font-family: 'Inter', sans-serif; }
        
        /* Form View Header (New Ticket) */
        .ticket-header-modern { 
          background: #fff; 
          padding: 20px 25px; 
          border-radius: 16px; 
          border: 1px solid #eef2f6; 
          display: flex; 
          align-items: center; 
        }
        .header-icon-container { 
          width: 45px; height: 45px; background: #eef2ff; color: #4f46e5; 
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; 
          flex-shrink: 0;
        }
        .back-btn-circle {
          width: 38px; height: 38px; border-radius: 50%; border: none; background: #f8fafc;
          color: #64748b; transition: 0.2s; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .back-btn-circle:hover { background: #4f46e5; color: #fff; transform: translateX(-3px); }

        /* Main Nav Bar (Table View) */
        .ticket-nav-bar {
          background: #fff; padding: 15px 25px; border-radius: 16px;
          display: flex; justify-content: space-between; align-items: center; border: 1px solid #eef2f6;
          flex-wrap: wrap; gap: 15px;
        }
        .nav-info-group { display: flex; align-items: center; }
        .nav-icon-square {
          width: 45px; height: 45px; background: #f0f9ff; color: #0ea5e9;
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
          flex-shrink: 0;
        }
        .nav-actions-group { display: flex; align-items: center; gap: 15px; }
        
        .generate-ticket-pill {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white; border: none; padding: 10px 22px; border-radius: 50px; 
          font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; 
          gap: 10px; transition: 0.3s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          white-space: nowrap;
        }
        .generate-ticket-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3); }
        
        .export-separator { 
          display: flex; gap: 12px; border-left: 2px solid #f1f5f9; 
          padding-left: 15px; align-items: center; 
        }
        .export-img { width: 26px; height: 26px; cursor: pointer; transition: 0.2s; flex-shrink: 0; }
        .export-img:hover { transform: scale(1.1); }

        .ticket-content-body { min-height: 400px; }

        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (max-width: 768px) {
          .ticket-nav-bar, .ticket-header-modern {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px 20px;
          }

          .nav-actions-group {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid #f1f5f9;
            padding-top: 15px;
          }

          .header-title { font-size: 1.1rem; }
          .header-subtitle { font-size: 0.75rem; }
          
          .export-separator {
            border-left: none;
            padding-left: 0;
          }
        }

        @media (max-width: 480px) {
          .nav-actions-group {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .generate-ticket-pill {
            width: 100%;
            justify-content: center;
          }

          .export-separator {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  )
}