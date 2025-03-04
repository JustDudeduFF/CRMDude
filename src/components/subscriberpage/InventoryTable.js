import React from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import InventorysTable from './InventorysTable';
import AddInvetory from './AddInvetory';
import InventryModify from './InventryModify';
import ProtectedRoute from '../ProtectedRoute';


export default function InventoryTable() {
  return (
    <>
    
        <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'2'}}>
            <h2>Inventory</h2>
            </div>
            <div style={{flex:'4'}}>
                <div style={{width:'max-content', float:'right'}}>
                <Link id='link' to='addproduct'>
                    <button type="button" className="btn btn-outline-warning">Add Product</button></Link>
                    <img src={Excel_Icon} className='img_download_icon'></img>
                    <img src={PDF_Icon} className='img_download_icon'></img>
                </div>
            </div>
        </div>
        <div style={{flex:'10'}}>
            <Routes>
                <Route path='/' element={<InventorysTable/>}/>
                <Route path='addproduct' element={<ProtectedRoute permission="ADD_DEVICE"><AddInvetory/></ProtectedRoute>}/> 
                <Route path='modinvent' element={<ProtectedRoute permission="CHANGE_DEVICE_STATUS"><InventryModify/></ProtectedRoute>}/>
            </Routes>
        </div>
        </>

  )
}
