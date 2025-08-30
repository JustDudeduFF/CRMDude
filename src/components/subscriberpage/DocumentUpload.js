import React from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import DocumetUploadTable from './DocumetUploadTable';
import AddNewDoc from './AddNewDoc';
import './DocumentUpload.css';

export default function DocumentUpload() {
  return (
    <div className="document-upload-container">
      <div className="document-upload-header">
        <div className="document-upload-title">
          <h2>Documents and Forms</h2>
        </div>
        <div className="document-upload-actions">
          <Link to='upload_doc'>
            <button type="button" className="document-upload-btn document-upload-btn-outline-secondary">Upload Document</button>
          </Link>
          <img src={Excel_Icon} className='document-upload-download-icon' alt="Download Excel" />
          <img src={PDF_Icon} className='document-upload-download-icon' alt="Download PDF" />
        </div>
      </div>
      <div className="document-upload-content">
        <Routes>
          <Route path='/' element={<DocumetUploadTable/>}/>
          <Route path='upload_doc' element={<AddNewDoc/>}/>
        </Routes>
      </div>
        </div>
  )
}
