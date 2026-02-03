import React from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'
import DocumetUploadTable from './DocumetUploadTable';
import AddNewDoc from './AddNewDoc';
import { FaFileUpload, FaArrowLeft, FaFolderOpen, FaCloudUploadAlt } from 'react-icons/fa';

export default function DocumentUpload() {
  const location = useLocation();
  const navigate = useNavigate();

  // Logic to determine if we are in the "Upload" view
  const isUploadPage = location.pathname.includes('upload_doc');

  return (
    <div className="doc-master-wrapper">
      {/* HEADER SECTION - Standardized with your other modules */}
      <div className="doc-header-card shadow-sm">
        <div className="doc-header-content">
          
          <div className="doc-title-section">
            {/* BACK BUTTON: Visible only when on the upload sub-page */}
            {isUploadPage && (
              <button className="doc-back-btn me-3" onClick={() => navigate(-1)}>
                <FaArrowLeft />
              </button>
            )}

            <div className="doc-icon-box" style={{ backgroundColor: isUploadPage ? '#eef2ff' : '#f8fafc' }}>
              {isUploadPage ? (
                <FaCloudUploadAlt style={{ color: '#4f46e5' }} />
              ) : (
                <FaFolderOpen style={{ color: '#4f46e5' }} />
              )}
            </div>

            <div className="doc-text-group">
              <h2 className="doc-main-title">
                {isUploadPage ? "Upload New Document" : "Documents and Forms"}
              </h2>
              <p className="doc-subtitle">
                {isUploadPage 
                  ? "Attach files to your customer profile" 
                  : "Manage, view, and export stored subscriber files"}
              </p>
            </div>
          </div>

          <div className="doc-action-group">
            {/* Action Buttons: Hidden during upload to keep UI clean */}
            {!isUploadPage ? (
              <div className="doc-btn-pill-group">
                <Link to='upload_doc' className="doc-link">
                  <button type="button" className="doc-btn-action">
                    <FaFileUpload className="me-2" /> Upload Document
                  </button>
                </Link>
              </div>
            ) : (
              <div className="doc-status-badge">FILE UPLOAD MODE</div>
            )}

            <div className="doc-export-divider"></div>
            <div className="doc-export-icons">
              <img src={Excel_Icon} className='doc-download-img' alt="Excel" title="Export List to Excel" />
              <img src={PDF_Icon} className='doc-download-img' alt="PDF" title="Export List to PDF" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="doc-content-body">
        <Routes>
          <Route path='/' element={<DocumetUploadTable />} />
          <Route path='upload_doc' element={<AddNewDoc />} />
        </Routes>
      </div>

      <style>{`
        .doc-master-wrapper {
          padding: 20px;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .doc-header-card {
          background: white;
          border-radius: 16px;
          padding: 18px 25px;
          margin-bottom: 25px;
          border: 1px solid #eef2f6;
        }

        .doc-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .doc-title-section {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .doc-back-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
          cursor: pointer;
        }

        .doc-back-btn:hover {
          background: #4f46e5;
          color: #fff;
          border-color: #4f46e5;
        }

        .doc-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-right: 18px;
        }

        .doc-main-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .doc-subtitle {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }

        .doc-action-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .doc-btn-action {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          padding: 10px 22px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          transition: 0.3s;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .doc-btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3);
        }

        .doc-status-badge {
          font-size: 11px;
          font-weight: 800;
          color: #4f46e5;
          background: #eef2ff;
          padding: 8px 16px;
          border-radius: 50px;
          letter-spacing: 0.5px;
        }

        .doc-export-divider {
          width: 1px;
          height: 30px;
          background-color: #e2e8f0;
        }

        .doc-export-icons {
          display: flex;
          gap: 12px;
        }

        .doc-download-img {
          width: 26px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .doc-download-img:hover {
          transform: scale(1.15);
        }

        .doc-link { text-decoration: none; }

        /* MOBILE RESPONSIVENESS */
        @media (max-width: 992px) {
          .doc-header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .doc-action-group {
            width: 100%;
            justify-content: space-between;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
          }
          .doc-title-section { width: 100%; }
        }

        @media (max-width: 576px) {
          .doc-subtitle { display: none; }
          .doc-main-title { font-size: 1rem; }
        }
      `}</style>
    </div>
  )
}