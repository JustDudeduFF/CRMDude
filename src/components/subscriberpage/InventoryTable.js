import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import InventorysTable from './InventorysTable';
import AddInvetory from './AddInvetory';
import InventryModify from './InventryModify';
import ProtectedRoute from '../ProtectedRoute';
import { FaBoxes, FaPlus, FaArrowLeft, FaFileDownload, FaWarehouse } from 'react-icons/fa';

export default function InventoryTable() {
  const location = useLocation();

  const isFormView = location.pathname.includes('addproduct') || location.pathname.includes('modinvent');

  return (
    <div className="inventory-master-wrapper p-3">
      
      {/* DYNAMIC HEADER SECTION */}
      {isFormView ? (
        <div className="inventory-header-modern shadow-sm mb-4">
           <div className="d-flex align-items-center">
              <Link to="/dashboard/subscriber/inventory" className="back-btn-circle me-3">
                 <FaArrowLeft />
              </Link>
              <div className="header-icon-container inventory-accent"><FaBoxes /></div>
              <div className="ms-3">
                 <h5 className="mb-0 fw-bold header-title-text">
                    {location.pathname.includes('addproduct') ? "Add New Product" : "Modify Inventory Item"}
                 </h5>
                 <p className="text-muted small mb-0 header-subtitle-text">Update your stock levels and product specifications</p>
              </div>
           </div>
        </div>
      ) : (
        <div className="inventory-nav-bar shadow-sm mb-4">
          <div className="nav-info-group">
            <div className="nav-icon-square inventory-accent-bg"><FaWarehouse /></div>
            <div className="ms-3">
              <h4 className="fw-bold mb-0 header-title-text">Product Inventory</h4>
              <p className="text-muted small mb-0 header-subtitle-text">Manage hardware, devices, and stock availability</p>
            </div>
          </div>

          <div className="nav-actions-group">
            <Link to='addproduct' style={{ textDecoration: 'none' }}>
              <button className="add-product-pill">
                <FaPlus /> <span>Add Product</span>
              </button>
            </Link>
            
            <div className="export-separator">
              <img src={Excel_Icon} alt="Excel" className="export-img" title="Export Excel" />
              <img src={PDF_Icon} alt="PDF" className="export-img" title="Export PDF" />
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC ROUTING CONTENT */}
      <div className="inventory-content-body">
        <Routes>
          <Route path='/' element={<InventorysTable/>}/>
          <Route path='addproduct' element={
            <ProtectedRoute permission="ADD_DEVICE">
              <AddInvetory/>
            </ProtectedRoute>
          }/> 
          <Route path='modinvent' element={
            <ProtectedRoute permission="CHANGE_DEVICE_STATUS">
              <InventryModify/>
            </ProtectedRoute>
          }/>
        </Routes>
      </div>

      <style>{`
        .inventory-master-wrapper { font-family: 'Inter', sans-serif; }
        
        .inventory-header-modern, .inventory-nav-bar { 
          background: #fff; 
          padding: 18px 25px; 
          border-radius: 16px; 
          border: 1px solid #eef2f6; 
          display: flex; 
          align-items: center; 
          justify-content: space-between;
          flex-wrap: wrap; /* Allows wrapping on small screens */
          gap: 15px;
        }

        .header-icon-container, .nav-icon-square {
          width: 45px; height: 45px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
          flex-shrink: 0;
        }

        .inventory-accent { background: #fff8eb; color: #f59e0b; }
        .inventory-accent-bg { background: #fff8eb; color: #f59e0b; }

        .back-btn-circle {
          width: 38px; height: 38px; border-radius: 50%; border: none; background: #f8fafc;
          color: #64748b; transition: 0.2s; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .back-btn-circle:hover { background: #f59e0b; color: #fff; }

        .nav-info-group { display: flex; align-items: center; }
        .nav-actions-group { display: flex; align-items: center; gap: 15px; }
        
        .add-product-pill {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white; border: none; padding: 10px 22px; border-radius: 50px; 
          font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; 
          gap: 10px; transition: 0.3s; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          white-space: nowrap;
        }
        
        .export-separator { 
          display: flex; gap: 12px; border-left: 2px solid #f1f5f9; 
          padding-left: 15px; align-items: center; 
        }
        .export-img { width: 26px; height: 26px; cursor: pointer; transition: 0.2s; }

        /* --- RESPONSIVE MEDIA QUERIES --- */

        @media (max-width: 768px) {
          .inventory-nav-bar, .inventory-header-modern {
            flex-direction: column;
            align-items: flex-start;
            padding: 15px;
          }

          .nav-actions-group {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid #f1f5f9;
            padding-top: 15px;
          }

          .header-title-text { font-size: 1.1rem; }
          .header-subtitle-text { font-size: 0.75rem; }

          .add-product-pill {
            padding: 8px 16px;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .nav-info-group {
            width: 100%;
          }
          .nav-icon-square, .header-icon-container {
            width: 35px; height: 35px; font-size: 1rem;
          }
          .export-separator {
            padding-left: 10px;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}