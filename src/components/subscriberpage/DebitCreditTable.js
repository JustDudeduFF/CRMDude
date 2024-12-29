import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import DebitCreditsTable from './DebitCreditsTable';
import CreateNote from './CreateNote';
import ModDCNote from './ModDCNote';
import ProtectedRoute from '../ProtectedRoute';

export default function DebitCreditTable() {
  return (
    <>
     <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'2'}}>
            <h2>Debit & Credit Notes</h2>
            </div>
            <div style={{flex:'4'}}>
                <div style={{width:'max-content', float:'right'}}>
                <Link id='link' to='add_dnotes'>
                    <button type="button" className="btn btn-outline-danger">Add Debit Note</button></Link>
                    <Link style={{marginLeft:'20px'}} id='link' to='add_cnotes'><button type="button" className="btn btn-outline-success">Add Credit Note</button></Link>
                    <img src={Excel_Icon} className='img_download_icon'></img>
                    <img src={PDF_Icon} className='img_download_icon'></img>
                </div>
            </div>
        </div>
        <div style={{flex:'10'}}>
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
