import { ref, onValue, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaTicketAlt, FaInfoCircle, FaCheckCircle, FaUserCheck, FaCalendarCheck, FaTools } from 'react-icons/fa';

export default function ModifyTicket() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();

  const [closeby, setCloseBy] = useState("");
  const [status, setStatus] = useState("");
  const [currenttime, setCurrentTime] = useState(new Date());
  const [arrayemp, setArrayEmp] = useState([]);
  const [rac, setRAC] = useState("");
  const location = useLocation();
  const username = localStorage.getItem("susbsUserid");
  const { ticket } = location.state || {};
  const subsname = localStorage.getItem("subsname");
  const subscontact = localStorage.getItem("subscontact");
  const company = localStorage.getItem("company");

  const handleCloseTicket = async () => {
    if (!status || !closeby || !rac) {
      toast.warn("Please complete all resolution fields");
      return;
    }

    const newticketdata = {
      closedate: new Date().toISOString().split("T")[0],
      closeby: closeby,
      closetime: currenttime.toLocaleTimeString(),
      status: status,
      rac: rac,
      username: username,
    };

    try {
      const response = await API.put(`/subscriber/ticket/${ticket.ticketno}`, {
        ...newticketdata
      });

      if (response.status === 200) {
        toast.success("Ticket Closed Successfully");
        setTimeout(() => navigate(-1), 1500);
      } else {
        toast.error("Failed to close ticket");
      }
    } catch (error) {
      console.log(`Error :- ${error}`);
      toast.error("Internal Server Error");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const fetchemp = async () => {
      try {
        const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
        if (response.status === 200) {
          setArrayEmp(response.data);
        }
      } catch (error) {
        console.log(`Error :- ${error}`);
      }
    };

    fetchemp();
    return () => clearInterval(timer);
  }, [username, partnerId]);

  return (
    <div className="modify-ticket-container">
      <ToastContainer />

      {/* SECTION 1: TICKET SUMMARY (READ ONLY) */}
      <div className="summary-card shadow-sm mb-4">
        <div className="card-header-custom bg-light">
          <FaInfoCircle className="me-2 text-primary" />
          <span className="fw-bold">Original Ticket Details</span>
        </div>
        <div className="p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="field-label-sm">Ticket ID</label>
              <div className="read-only-box">{ticket.ticketno}</div>
            </div>
            <div className="col-md-3">
              <label className="field-label-sm">Nature of Concern</label>
              <div className="read-only-box">{ticket.ticketconcern}</div>
            </div>
            <div className="col-md-3">
              <label className="field-label-sm">Generated On</label>
              <div className="read-only-box">{ticket.assigndate}</div>
            </div>
            <div className="col-md-3">
              <label className="field-label-sm">Assigned Personnel</label>
              <div className="d-flex align-items-center read-only-box">
                {ticket.assignto}
                <span className="badge bg-soft-success text-success ms-auto" style={{cursor: 'pointer'}}>Change</span>
              </div>
            </div>
            <div className="col-md-12">
              <label className="field-label-sm">Problem Description</label>
              <div className="read-only-box min-h-60">{ticket.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MODIFICATION FORM */}
      <div className="modify-card shadow-lg">
        <div className="card-header-custom indigo-grad text-white">
          <FaTools className="me-2" />
          <span className="fw-bold">Ticket Resolution & Modification</span>
        </div>
        
        <div className="p-4">
          <form className="row g-4">
            <div className="col-md-4">
              <label className="modern-label"><FaCheckCircle className="me-1 text-indigo"/> Action on Ticket *</label>
              <select onChange={(e) => setStatus(e.target.value)} className="modern-select">
                <option value="">Select Status...</option>
                <option value="Completed">Completed / Fixed</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="modern-label"><FaUserCheck className="me-1 text-indigo"/> Resolved By *</label>
              <select onChange={(e) => setCloseBy(e.target.value)} className="modern-select">
                <option value="">Choose Employee...</option>
                {arrayemp.length > 0 ? (
                  arrayemp.map(({ empname, empmobile }, index) => (
                    <option key={index} value={empmobile}>{empname}</option>
                  ))
                ) : (
                  <option value="">No Employee Available</option>
                )}
              </select>
            </div>

            <div className="col-md-4">
              <label className="modern-label"><FaCalendarCheck className="me-1 text-indigo"/> Resolution Date</label>
              <input type="date" className="modern-input" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="col-md-12">
              <label className="modern-label">Root Cause Analysis (RCA) / Action Taken *</label>
              <textarea 
                onChange={(e) => setRAC(e.target.value)}
                className="modern-input" 
                rows="3"
                placeholder="Describe what action was taken to fix this issue..."
              ></textarea>
            </div>

            <div className="col-12 mt-4">
               <hr />
               <div className="d-flex gap-2 justify-content-end">
                  <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4">Cancel</button>
                  <button type="button" onClick={handleCloseTicket} className="btn-indigo-gradient rounded-pill px-5 border-0 py-2 fw-bold">
                    Update & Close Ticket
                  </button>
               </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .modify-ticket-container { font-family: 'Inter', sans-serif; }
        
        /* Summary Card Styling */
        .summary-card { background: #fff; border-radius: 12px; border: 1px solid #eef2f6; overflow: hidden; }
        .read-only-box { 
          background: #f8fafc; padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0;
          font-weight: 600; color: #475569; font-size: 0.9rem;
        }
        .min-h-60 { min-height: 60px; }

        /* Modify Card Styling */
        .modify-card { background: #fff; border-radius: 15px; border: none; overflow: hidden; }
        .card-header-custom { padding: 15px 25px; display: flex; align-items: center; font-size: 1rem; }
        .indigo-grad { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
        
        .field-label-sm { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .modern-label { font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 8px; display: block; }

        .modern-input, .modern-select {
          width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #f1f5f9;
          font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s;
        }
        .modern-input:focus, .modern-select:focus { border-color: #4f46e5; background: #fff; }

        .bg-soft-success { background: #d1fae5; }
        .text-indigo { color: #4f46e5; }

        .btn-indigo-gradient { 
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
          color: white; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); transition: 0.3s;
        }
        .btn-indigo-gradient:hover { transform: translateY(-2px); opacity: 0.9; }
      `}</style>
    </div>
  );
}