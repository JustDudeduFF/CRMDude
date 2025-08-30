import React from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import InventorysTable from './InventorysTable';
import AddInvetory from './AddInvetory';
import InventryModify from './InventryModify';
import ProtectedRoute from '../ProtectedRoute';
import './InventoryTable.css';


export default function InventoryTable() {
  return (
    <div className="inventory-table-container">
      <div className="inventory-table-header">
        <div className="inventory-table-title">
          <h2>Inventory</h2>
        </div>
        <div className="inventory-table-actions">
          <Link to='addproduct'>
            <button type="button" className="inventory-table-btn inventory-table-btn-outline-warning">Add Product</button>
          </Link>
          <img src={Excel_Icon} className='inventory-table-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='inventory-table-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="inventory-table-content">
        <Routes>
          <Route path='/' element={<InventorysTable/>}/>
          <Route path='addproduct' element={<ProtectedRoute permission="ADD_DEVICE"><AddInvetory/></ProtectedRoute>}/> 
          <Route path='modinvent' element={<ProtectedRoute permission="CHANGE_DEVICE_STATUS"><InventryModify/></ProtectedRoute>}/>
        </Routes>
      </div>
    </div>
  )
}
