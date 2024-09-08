import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import SubscriberPersonal from './SubscriberPersonal';
import RechargeTable from './RechargeTable';

export default function SubscriberDetails() {


  return (
    
    <>
    
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'2'}}>
                <h2>Connection Info</h2>
            
            </div>
            <div style={{color:'green'}}>
                <span>Recent Note :- </span><span style={{maxWidth:"max-content", height:'10px'}}>Remarks Particular Only</span>
            </div>
            <div style={{flex:'4'}}>
                <div style={{width:'max-content', float:'right'}}>
                <Link id='link' to='rechargeinfo'>
                    <button type="button" className="btn btn-outline-success">Recharge Info</button></Link>
                    <Link style={{marginLeft:'10px'}} id='link' to='addproduct'>
                    <button type="button" className="btn btn-outline-secondary">Edit Info</button></Link>
                    <img src={Excel_Icon} className='img_download_icon'></img>
                    <img src={PDF_Icon} className='img_download_icon'></img>
                </div>
            </div>
        </div>
        

        <div style={{flex:"10"}}>
            <Routes>
                <Route path='/' element={<SubscriberPersonal />} />
                <Route path='rechargeinfo' element={<RechargeTable/>}/>
            </Routes>
        </div>
    </>
    
    )
}
