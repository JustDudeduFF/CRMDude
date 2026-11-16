import { useRecordView, RecordToolbar, RecordFooter } from './SubscriberSection';
import React, { useEffect, useState } from 'react'
import DeleteIcon from './drawables/trash.png'
import ExpandIcon from './drawables/eye.png'
import { API, API_ORIGIN } from '../../FirebaseConfig';
import { FaFileAlt, FaHistory, FaUserCircle, FaTrashAlt, FaExternalLinkAlt } from 'react-icons/fa';

export default function DocumetUploadTable() {
  const username = localStorage.getItem('susbsUserid');
  const [arraydocument, setArrayDocument] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchdocs = async () => {
    setIsLoading(true); setLoadError('');
    try {
      const response = await API.get(`/subscriber/documents/${username}`);
      setArrayDocument(Array.isArray(response.data) ? response.data : Object.values(response.data || {}));
    } catch (error) { setLoadError('Unable to load documents. Please refresh to try again.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchdocs();
  }, []);

  const deleteFileFromUrl = async (documentname, key) => {
    const deleteData = {
      _id: key,
      modifiedby: localStorage.getItem('contact'),
      documentname: documentname,
    };

    try {
      await API.delete(`/subscriber/documents/${username}`, {
        data: deleteData,
      });
      fetchdocs();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const recordView = useRecordView(arraydocument, { statusKey: 'source' });

  return (
    <div className="doc-table-wrapper sub-record-panel">
      {loadError && <div className="sub-record-alert" role="alert">{loadError}</div>}
      <RecordToolbar view={recordView} label="documents" filename="subscriber-documents" loading={isLoading} exportDisabled={!!loadError} onRefresh={fetchdocs}/>
      <div className="table-responsive">
        <table className="doc-modern-table">
          <thead>
            <tr>
              <th>Source</th>
              <th><FaFileAlt className="me-2" />Document Name</th>
              <th><FaHistory className="me-2" />Uploaded Date</th>
              <th><FaUserCircle className="me-2" />Uploaded By</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={5} className="sub-record-empty" role="status">Loading documents…</td></tr> : loadError ? <tr><td colSpan={5} className="sub-record-empty">Refresh to reload documents.</td></tr> : recordView.count > 0 ? (
              recordView.records.map(({ source, date, modifiedby, documentname, url, _id }, index) => (
                <tr key={index}>
                  <td>
                    <span className={`source-badge ${source?.toLowerCase() === 'system' ? 'sys' : 'usr'}`}>
                      {source}
                    </span>
                  </td>
                  <td className="doc-name-cell">{documentname}</td>
                  <td className="doc-date-cell">{date}</td>
                  <td className="doc-user-cell">{modifiedby}</td>
                  <td>
                    <div className="doc-action-btns">
                      <a
                        href={String(url || '').startsWith('/') ? `${API_ORIGIN}${url}` : url}
                        target='_blank'
                        rel="noopener noreferrer"
                        aria-label={`View ${documentname}`}
                        className="action-link view"
                        title="View Document"
                      >
                        <img className='doc-icon-img' src={ExpandIcon} alt='expand' />
                      </a>
                      <button
                        onClick={() => deleteFileFromUrl(documentname, _id)}
                        className="action-link delete"
                        aria-label={`Delete ${documentname}`}
                        title="Delete Document"
                      >
                        <img className='doc-icon-img' src={DeleteIcon} alt='delete' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="doc-no-data">
                  <div className="empty-state py-5">
                    <p className="mb-0 text-muted">No documents available in the repository.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <RecordFooter view={recordView} label="documents"/>

      <style>{`
        .doc-table-wrapper {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          overflow: hidden;
        }

        .doc-modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .doc-modern-table thead th {
          background: #f8fafc;
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .doc-modern-table tbody td {
          padding: 12px 20px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          color: #334155;
        }

        /* Source Badge */
        .source-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .source-badge.sys { background: #f0fdf4; color: #16a34a; border: 1px solid #bcf0da; }
        .source-badge.usr { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

        .doc-name-cell { font-weight: 600; color: #1e293b; }
        .doc-date-cell { color: #64748b; font-weight: 500; }
        .doc-user-cell { color: #64748b; }

        /* Actions */
        .doc-action-btns {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .action-link {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
          display: flex;
          align-items: center;
        }

        .action-link:hover {
          transform: translateY(-2px);
        }

        .doc-icon-img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .doc-no-data {
          text-align: center;
          background: #fdfdfd;
        }

        .doc-modern-table tbody tr:hover {
          background-color: #f8fafc;
        }

        @media (max-width: 768px) {
          .doc-modern-table thead { display: none; }
          .doc-modern-table tbody td {
            display: block;
            text-align: right;
            border-bottom: none;
            padding: 8px 20px;
          }
          .doc-modern-table tbody td::before {
            content: attr(data-label);
            float: left;
            font-weight: 800;
            color: #64748b;
            font-size: 11px;
          }
          .doc-modern-table tbody tr {
            display: block;
            border-bottom: 5px solid #f1f5f9;
            padding: 10px 0;
          }
          .doc-action-btns { justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}
