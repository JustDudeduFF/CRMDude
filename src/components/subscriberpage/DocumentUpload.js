import React from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import DocumetUploadTable from './DocumetUploadTable';
import AddNewDoc from './AddNewDoc';

export default function DocumentUpload() {
  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'2'}}>
        <h2>Documets and Forms</h2>
        </div>
        <div style={{flex:'4'}}>
              <div style={{width:'max-content', float:'right'}}>
                  <Link id='link' to='upload_doc'>
                    <button type="button" className="btn btn-outline-secondary">Upload Document</button></Link>
                  <img src={Excel_Icon} className='img_download_icon'></img>
                  <img src={PDF_Icon} className='img_download_icon'></img>
              </div>
          </div>
    </div>
    <div style={{flex:'10', marginTop:'20px'}}>
      <Routes>
        <Route path='/' element={<DocumetUploadTable/>}/>
        <Route path='upload_doc' element={<AddNewDoc/>}/>
      </Routes>
    </div>
    </>
    
  )
}
