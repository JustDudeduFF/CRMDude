import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { FaEdit, FaInfoCircle, FaCalendarAlt, FaUserEdit } from 'react-icons/fa';
import './RemarkFollowsTable.css';

export default function RemarkFollowsTable() {
  const username = localStorage.getItem('susbsUserid');
  const [arrayremark, setArrayRemark] = useState([]);
  const navigate = useNavigate();

  const fetchData = async() => {
    try {
      const response = await API.get(`/subscriber/remarksfollow?id=${username}`);
      if (response.status !== 200) return toast.error('Failed to get Remarks List', {
        autoClose: 2000
      });

      const data = response.data;
      setArrayRemark(data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData();
  }, [username]);

  return (
    <div className="rf-table-container shadow-sm">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      <div className="table-responsive">
        <table className="rf-modern-table">
          <thead>
            <tr>
              <th><FaInfoCircle className="me-1"/> Action ID</th>
              <th>Type</th>
              <th><FaCalendarAlt className="me-1"/> Action Date</th>
              <th>Description</th>
              <th><FaUserEdit className="me-1"/> Modified By</th>
              <th>Modified On</th>
            </tr>
          </thead>
          <tbody>
            {arrayremark.length > 0 ? (
              arrayremark.map(({remarkKey, type, date, description, modifiedon, modifiedBy, status}, index) => {
                const isFollowUp = type === 'Follow Up';
                const isPending = status === 'pending';

                return (
                  <tr key={index} className={isPending ? 'row-pending' : 'row-completed'}>
                    <td 
                      onClick={() => {
                        if (isFollowUp) {
                          navigate('modremfollow', {state: {remarkno: remarkKey}});
                        } else {
                          toast.error('Remarks Not Modifiable!', {autoClose: 2000})
                        }
                      }} 
                      className={`action-id-cell ${isFollowUp ? 'can-edit' : 'is-locked'}`}
                    >
                      <div className="d-flex align-items-center">
                        {isFollowUp && <FaEdit className="edit-indicator me-2" />}
                        {remarkKey}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-type ${isFollowUp ? 'type-follow' : 'type-remark'}`}>
                        {type}
                      </span>
                    </td>
                    <td className="fw-semibold text-slate">{date}</td>
                    <td className="description-cell">
                      <div className="text-truncate-custom" title={description}>
                        {description}
                      </div>
                    </td>
                    <td className="text-muted fw-medium">{modifiedBy}</td>
                    <td className="text-muted small">{modifiedon}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='6' className="no-data-placeholder">
                  <div className="py-5">
                    <p className="mb-0">No Action History Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .rf-table-container {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #edf2f7;
          overflow: hidden;
        }

        .rf-modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .rf-modern-table thead th {
          background: #f8fafc;
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .rf-modern-table tbody td {
          padding: 12px 20px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        /* Status-based Row Styling */
        .row-pending { background-color: #fffafb; }
        .row-completed { background-color: #ffffff; }

        /* Action ID styling */
        .action-id-cell {
          font-family: 'Monaco', 'Consolas', monospace;
          font-weight: 700;
          color: #6366f1;
          cursor: pointer;
          transition: 0.2s;
        }

        .can-edit:hover {
          color: #4338ca;
          text-decoration: underline;
        }

        .is-locked {
          color: #94a3b8;
          cursor: not-allowed;
        }

        .edit-indicator { font-size: 10px; opacity: 0.7; }

        /* Custom Badges */
        .badge-type {
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
        }

        .type-follow {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c3dafe;
        }

        .type-remark {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        /* Utilities */
        .text-slate { color: #1e293b; }
        .description-cell { max-width: 250px; }
        .text-truncate-custom {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .no-data-placeholder {
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }

        .rf-modern-table tbody tr:hover {
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </div>
  )
}