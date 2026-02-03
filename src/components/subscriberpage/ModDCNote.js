import { ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaRegStickyNote, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaEdit, 
  FaTimesCircle, 
  FaArrowLeft 
} from 'react-icons/fa';

export default function ModDCNote() {
  const partnerId = localStorage.getItem("partnerId");
  const location = useLocation();
  const { noteno } = location.state || {};
  const username = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();

  // State Management
  const [amount, setAmount] = useState("");
  const [particular, setParticular] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notetype, setNoteType] = useState("");
  const [date, setDate] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [newamount, setNewAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchdata = async () => {
    try {
      const response = await API.get(
        `/subscriber/dcnotes/${username}?dcnote=${noteno}`
      );
      if (response.status !== 200) return console.log("Error fetching note data");
      const data = response.data;
      if (data) {
        setAmount(data.amount);
        setParticular(data.notefor);
        setRemarks(data.remarks);
        setNoteType(data.notetype);
        setDate(data.notedate);
        setDueAmount(data.dueAmount || "0");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error loading note data");
    }
  };

  useEffect(() => {
    if (noteno) {
      fetchdata();
    }
  }, [noteno]);

  // Updated Function with Confirmation Logic
  const updatenote = async () => {
    const isConfirmed = window.confirm("Are you sure you want to update this Note details?");
    if (!isConfirmed) return;

    setIsSubmitting(true);
    const updatedNote = {
      noteno: noteno,
      notetype: notetype,
      notedate: date,
      notefor: particular,
      amount: amount,
      newamount: newamount,
      modifiedby: localStorage.getItem("contact"),
      modifiedon: new Date().toISOString().split("T")[0],
      remarks: remarks,
      subscriber: username,
      partnerId: partnerId,
    };

    try {
      const response = await API.put(`/subscriber/dcnote/${noteno}`, {
        updatedNote,
      });

      if (response.status === 200) {
        toast.success("Note updated successfully!");
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (e) {
      console.error("Update error:", e);
      toast.error("Failed to update note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logic for Discarding/Canceling changes
  const cancelnote = () => {
    const isConfirmed = window.confirm("Discard all changes and go back?");
    if (isConfirmed) {
      navigate(-1);
    }
  };

  return (
    <div className="dcnote-page-wrapper">
      <ToastContainer position="top-right" theme="colored" autoClose={3000} />
      
      <div className="container-fluid py-4">
        {/* Header Section */}
        <div className="d-flex align-items-center mb-4">
          <button className="back-btn shadow-sm me-3" onClick={() => navigate(-1)} title="Go Back">
            <FaArrowLeft />
          </button>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Modify Debit/Credit Note</h4>
            <p className="text-muted small mb-0">Note Reference: <span className="text-primary fw-bold">{noteno || "N/A"}</span></p>
          </div>
        </div>

        <div className="card border-0 shadow-sm modern-card">
          <div className="card-body p-4 p-md-5">
            <form className="row g-4">
              
              {/* Note Number (Read Only) */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label custom-label"><FaRegStickyNote className="me-2 text-primary"/>Note No.</label>
                <input type="text" className="form-control custom-input bg-readonly" defaultValue={noteno} readOnly />
              </div>

              {/* Note Type (Read Only) */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label custom-label">Note Type</label>
                <input className="form-control custom-input bg-readonly" defaultValue={notetype} readOnly />
              </div>

              {/* Particular (Read Only) */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label custom-label">Particular</label>
                <input defaultValue={particular} className="form-control custom-input bg-readonly" readOnly />
              </div>

              {/* Editable Date */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label custom-label"><FaCalendarAlt className="me-2 text-primary"/>Note Date</label>
                <input 
                  onChange={(e) => setDate(e.target.value)} 
                  value={date} 
                  className="form-control custom-input" 
                  type="date" 
                />
              </div>

              {/* Editable Amount */}
              <div className="col-lg-4 col-md-12">
                <label className="form-label custom-label"><FaMoneyBillWave className="me-2 text-success"/>New Amount</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 fw-bold text-muted">₹</span>
                  <input 
                    onChange={(e) => setNewAmount(e.target.value)} 
                    placeholder={amount}
                    type="number" 
                    className="form-control custom-input border-start-0 ps-0" 
                  />
                </div>
                <small className="text-muted mt-2 d-block">Original Registered Amount: <strong>₹{amount}</strong></small>
              </div>

              {/* Editable Narration */}
              <div className="col-lg-8 col-md-12">
                <label className="form-label custom-label">Narration / Remarks</label>
                <textarea 
                  rows="1"
                  value={remarks} 
                  onChange={(e) => setRemarks(e.target.value)} 
                  className="form-control custom-input"
                  placeholder="Provide details for this modification..."
                ></textarea>
              </div>

              {/* Action Buttons Group */}
              <div className="col-12 mt-5">
                <div className="d-flex flex-wrap gap-3">
                  <button 
                    onClick={updatenote} 
                    type="button" 
                    disabled={isSubmitting}
                    className="btn btn-primary px-5 py-2 fw-bold shadow-sm d-flex align-items-center"
                  >
                    {isSubmitting ? "Updating..." : <><FaEdit className="me-2"/> Update Note</>}
                  </button>
                  <button 
                    onClick={cancelnote} 
                    type="button" 
                    className="btn btn-outline-danger px-5 py-2 fw-bold d-flex align-items-center"
                  >
                    <FaTimesCircle className="me-2"/> Cancel Changes
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        .dcnote-page-wrapper {
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        .modern-card {
          border-radius: 16px;
          overflow: hidden;
        }

        .back-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .back-btn:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          transform: scale(1.05);
        }

        .custom-label {
          font-weight: 700;
          color: #334155;
          font-size: 0.8rem;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .custom-input {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .custom-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
          background-color: #fff;
        }

        .bg-readonly {
          background-color: #f1f5f9 !important;
          color: #475569;
          font-weight: 600;
          border-color: #e2e8f0;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          border: none;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }

        .btn-outline-danger {
          border-radius: 12px;
          border-width: 2px;
          transition: all 0.3s;
        }

        .btn-outline-danger:hover {
          background-color: #ef4444;
          border-color: #ef4444;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .d-flex.flex-wrap.gap-3 {
            flex-direction: column;
          }
          .btn {
            width: 100%;
            justify-content: center;
          }
          .card-body {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}