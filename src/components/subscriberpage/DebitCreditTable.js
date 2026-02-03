import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import DebitCreditsTable from './DebitCreditsTable';
import CreateNote from './CreateNote';
import ModDCNote from './ModDCNote';
import ProtectedRoute from '../ProtectedRoute';
import { FaPlusCircle, FaMinusCircle, FaFileInvoiceDollar, FaArrowLeft } from 'react-icons/fa';

export default function DebitCreditTable() {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we are currently looking at an 'Add' or 'Modify' screen
  const isFormView = location.pathname.includes('add_') || location.pathname.includes('modnote');

  return (
    <div className="dc-master-container p-3">
      {/* HEADER SECTION */}
      <div className="dc-header-card shadow-sm mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          
          <div className="d-flex align-items-center">
            <div className="dc-header-icon me-3">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <h4 className="fw-bold mb-0">
                {isFormView ? "Note Entry" : "Debit & Credit Notes"}
              </h4>
              <p className="text-muted small mb-0 d-none d-sm-block">
                {isFormView ? "Fill in the details to create a new entry" : "Manage customer billing adjustments and ledger entries"}
              </p>
            </div>
          </div>

          <div className="dc-actions-wrapper">
            {/* DYNAMIC NAVIGATION: SHOW BACK BUTTON IN FORM, SHOW ADD BUTTONS IN TABLE */}
            {isFormView ? (
              <button 
                type="button" 
                className="dc-btn dc-btn-back" 
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="me-2" /> Back to List
              </button>
            ) : (
              <div className="dc-btn-group me-3">
                <Link to='/dashboard/subscriber/dcnote/add_dnotes' className="text-decoration-none">
                  <button type="button" className="dc-btn dc-btn-debit">
                    <FaMinusCircle className="me-2" /> Add Debit
                  </button>
                </Link>
                <Link to='/dashboard/subscriber/dcnote/add_cnotes' className="text-decoration-none">
                  <button type="button" className="dc-btn dc-btn-credit">
                    <FaPlusCircle className="me-2" /> Add Credit
                  </button>
                </Link>
              </div>
            )}

            {!isFormView && (
              <div className="dc-export-group ps-3 border-start d-none d-sm-flex">
                <img src={Excel_Icon} className='dc-download-img' alt="Excel" title="Export Excel" />
                <img src={PDF_Icon} className='dc-download-img' alt="PDF" title="Export PDF" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="dc-content-viewport">
        <Routes>
          <Route path='/' element={<DebitCreditsTable/>}/>
          <Route path='add_dnotes' element={
            <ProtectedRoute permission="CREATE_CREDIT">
              <CreateNote notety={"danger"}/>
            </ProtectedRoute>
          }/>
          <Route path='add_cnotes' element={
            <ProtectedRoute permission="CREATE_DEBIT">
              <CreateNote notety={"success"}/>
            </ProtectedRoute>
          }/>
          <Route path='modnote' element={<ModDCNote/>}/>
        </Routes>
      </div>

      <style>{`
        .dc-master-container {
          background-color: #f8f9fa;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .dc-header-card {
          background: #ffffff;
          padding: 15px 25px;
          border-radius: 16px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .dc-header-icon {
          width: 44px;
          height: 44px;
          background: #f0f4ff;
          color: #4361ee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          border-radius: 12px;
        }

        .dc-actions-wrapper {
          display: flex;
          align-items: center;
        }

        .dc-btn-group {
          display: flex;
          gap: 12px;
        }

        .dc-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          border: none;
          transition: 0.2s all ease;
          display: flex;
          align-items: center;
        }

        .dc-btn-back {
          background-color: #f1f3f5;
          color: #495057;
          border: 1px solid #dee2e6;
        }

        .dc-btn-back:hover {
          background-color: #e9ecef;
          color: #000;
          transform: translateX(-3px);
        }

        .dc-btn-debit {
          background-color: #fff5f5;
          color: #e03131;
          border: 1px solid #ffa8a8;
        }

        .dc-btn-debit:hover {
          background-color: #e03131;
          color: #ffffff;
        }

        .dc-btn-credit {
          background-color: #f4fce3;
          color: #2f9e44;
          border: 1px solid #b2f2bb;
        }

        .dc-btn-credit:hover {
          background-color: #2f9e44;
          color: #ffffff;
        }

        .dc-export-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .dc-download-img {
          width: 26px;
          height: 26px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .dc-actions-wrapper {
            width: 100%;
          }
          .dc-btn-group, .dc-btn-back {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}