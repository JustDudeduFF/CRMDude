import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import RemarkFollowsTable from './RemarkFollowsTable';
import ModRemFollow from './ModRemFollow';
import AddRemarkFollow from './AddRemarkFollow';

export default function RemakFollowTable() {
  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'2'}}>
        <h2>Remarks & Follow Ups</h2>
        </div>
      <div style={{flex:'4'}}>
              <div style={{width:'max-content', float:'right'}}>
                  <Link id='link' to='add_remark'>
                    <button type="button" className="btn btn-outline-info">Add Remarks</button></Link>
                  <Link style={{marginLeft:'20px'}} id='link' to='add_follow'><button type="button" className="btn btn-outline-primary">Add Follow</button></Link>
                  <img src={Excel_Icon} className='img_download_icon'></img>
                  <img src={PDF_Icon} className='img_download_icon'></img>
              </div>
          </div>
      </div>
    <div style={{flex:'10'}}>
      <Routes>
        <Route path='/' element={<RemarkFollowsTable/>}/>
        <Route path='modremfollow' element={<ModRemFollow/>}/>
        <Route path='add_remark' element={<AddRemarkFollow mode={'remark'}/>}/>
        <Route path='add_follow' element={<AddRemarkFollow mode={'follow'}/>}/>
      </Routes>
    </div>
    </>
  )
}
