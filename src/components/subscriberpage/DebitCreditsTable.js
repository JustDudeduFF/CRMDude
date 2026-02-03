import { onValue, ref, off } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { FaEdit, FaInbox } from "react-icons/fa"; // Added for empty state and actions

export default function DebitCreditsTable() {
  const partnerId = localStorage.getItem("partnerId");
  const username = localStorage.getItem("susbsUserid");
  const [arraynotes, setArrayNotes] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/subscriber/dcnotes/${username}`);
      if (response.status !== 200) return;
      
      const notesData = response.data;
      const notesArray = Object.keys(notesData).map((key) => ({
        noteno: notesData[key].noteno || "N/A",
        notetype: notesData[key].notetype || "N/A",
        notedate: notesData[key].notedate || "N/A",
        notefor: notesData[key].notefor || "N/A",
        amount: notesData[key].amount || "0",
        modifiedBy: notesData[key].modifiedby || "N/A",
        modifiedon: notesData[key].modifiedon || "N/A",
        remarks: notesData[key].remarks || "N/A",
      }));
      setArrayNotes(notesArray);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    let maping = {};
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status === 200) {
        const data = response.data;
        Object.keys(data).forEach((key) => {
          const user = data[key];
          maping[user.empmobile] = user.empname;
        });
        setUserMap(maping);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchUserData();
  }, [username]);

  return (
    <div className="dc-table-container shadow-sm">
      <div className="table-responsive custom-scrollbar">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th className="ps-4">Note No.</th>
              <th>Type</th>
              <th>Date</th>
              <th>Particulars</th>
              <th className="text-end">Amount</th>
              <th>Modified By</th>
              <th>Modified On</th>
              <th className="pe-4">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" className="py-5 text-center">
                  <div className="spinner-border text-primary me-2" role="status"></div>
                  <span className="text-muted fw-medium">Loading ledger entries...</span>
                </td>
              </tr>
            ) : arraynotes.length > 0 ? (
              [...arraynotes].reverse().map((note, index) => (
                <tr key={index} className="dc-row">
                  <td className="ps-4">
                    <span 
                      className="dc-clickable-no fw-bold"
                      onClick={() => navigate("modnote", { state: { noteno: note.noteno } })}
                    >
                      {note.noteno}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-custom ${note.notetype === "Debit Note" ? "bg-debit" : "bg-credit"}`}>
                      {note.notetype}
                    </span>
                  </td>
                  <td className="text-nowrap">{note.notedate}</td>
                  <td className="text-muted fw-medium">{note.notefor}</td>
                  <td className="text-end fw-bold text-dark">
                    ₹{Number(note.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="user-avatar-sm me-2">
                        {(userMap[note.modifiedBy] || "U").charAt(0)}
                      </div>
                      <span className="small">{userMap[note.modifiedBy] || note.modifiedBy}</span>
                    </div>
                  </td>
                  <td className="text-nowrap small text-muted">{note.modifiedon}</td>
                  <td className="pe-4">
                    <div className="remarks-cell text-truncate" title={note.remarks}>
                      {note.remarks}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-5 text-center">
                  <div className="empty-state">
                    <FaInbox size={40} className="text-light-gray mb-3" />
                    <p className="text-muted mb-0">No transaction records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .dc-table-container {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #edf2f7;
        }

        .table thead th {
          background-color: #f8fafc;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 16px 12px;
          border-bottom: 1px solid #edf2f7;
        }

        .dc-row {
          transition: background-color 0.2s ease;
        }

        .dc-row td {
          padding: 16px 12px;
          color: #334155;
          font-size: 0.875rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .dc-clickable-no {
          color: #4f46e5;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          background: #eef2ff;
          transition: all 0.2s;
        }

        .dc-clickable-no:hover {
          background: #4338ca;
          color: #ffffff;
          text-decoration: none;
        }

        /* Badge Styling */
        .badge-custom {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 700;
          display: inline-block;
        }

        .bg-debit {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .bg-credit {
          background-color: #dcfce7;
          color: #16a34a;
        }

        /* Avatar Styling */
        .user-avatar-sm {
          width: 24px;
          height: 24px;
          background: #e2e8f0;
          color: #475569;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .remarks-cell {
          max-width: 200px;
          font-style: italic;
          color: #94a3b8;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .text-light-gray {
          color: #e2e8f0;
        }

        @media (max-width: 992px) {
          .remarks-cell {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}