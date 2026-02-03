import React, { useEffect, useState } from "react";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaUserClock, FaUserPlus, FaFileAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';

export default function NewTicket() {
  const partnerId = localStorage.getItem("partnerId");
  const company = localStorage.getItem("company");
  const username = localStorage.getItem("susbsUserid");
  const fullname = localStorage.getItem("subsname");
  const mobile = localStorage.getItem("subscontact");
  const navigate = useNavigate();

  const [arrayconcern, setArrayConcern] = useState([]);
  const [arrayemp, setArrayEmp] = useState([]);
  const [currenttime, setCurrentTime] = useState(new Date());
  const [description, setDescription] = useState("");
  const [ticketconcern, setTicketConcern] = useState("");
  const [assignemp, setAssignEmp] = useState("");

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchemp = async () => {
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status !== 200) return console.log("Error fetching employee data");
      const data = response.data;
      setArrayEmp(data.length > 0 ? data : [...data]);
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed to fetch employees");
    }
  };

  const fetchconcerns = async () => {
    try {
      const response = await API.get(`/subscriber/ticketconcerns?partnerId=${partnerId}`);
      if (response.status !== 200) return console.log("Error fetching concern data");
      const data = response.data;
      setArrayConcern(data.length > 0 ? data : [...data]);
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed to fetch concerns");
    }
  };

  useEffect(() => {
    fetchconcerns();
    fetchemp();
  }, []);

  function generateHappyCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const generateTicket = async () => {
    if (!ticketconcern || !assignemp) {
      toast.warn("Please fill all required fields");
      return;
    }

    const ticketno = `TIC-${Date.now()}`;
    const assigntime = currenttime.toLocaleTimeString();
    const happycode = String(generateHappyCode());

    const ticketdata = {
      generatedBy: localStorage.getItem("contact"),
      source: "Manual",
      ticketno: ticketno,
      ticketconcern: ticketconcern,
      assignto: assignemp,
      description: description,
      assigntime: assigntime,
      assigndate: new Date().toISOString().split("T")[0],
      status: "Pending",
      closedate: "",
      closeby: "",
      closetime: "",
      rac: "",
      happycode: happycode,
      generatedDate: new Date().toISOString().split("T")[0],
      partnerId: partnerId,
      subscriber: username,
      UserKey: username,
    };

    try {
      const response = await API.post(`/subscriber/ticket`, { ...ticketdata });
      if (response.status === 201) {
        toast.success("Ticket Generated Successfully!");
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed to generate ticket");
    }
  };

  return (
    <div className="ticket-redesign-wrapper p-3">
      <ToastContainer />
      
      <div className="ticket-card shadow-sm border-0">

        <div className="ticket-body">
          <form className="row g-4">
            
            {/* Info Row */}
            <div className="col-md-2">
              <label className="field-label">Reference No.</label>
              <input type="text" className="modern-input-field readonly" value="Auto-Generated" readOnly />
            </div>

            <div className="col-md-4">
              <label className="field-label"><FaFileAlt className="me-1"/> Ticket Concern *</label>
              <select onChange={(e) => setTicketConcern(e.target.value)} className="modern-select-field">
                <option value="">Select Concern Type...</option>
                {arrayconcern.length > 0 ? (
                  arrayconcern.map((concern, index) => (
                    <option key={index}>{concern.ticketname}</option>
                  ))
                ) : (
                  <option value="">No Concern Available</option>
                )}
              </select>
            </div>

            <div className="col-md-3">
              <label className="field-label"><FaCalendarAlt className="me-1"/> Date</label>
              <input type="date" className="modern-input-field readonly" value={new Date().toISOString().split("T")[0]} readOnly />
            </div>

            <div className="col-md-3">
              <label className="field-label"><FaClock className="me-1"/> Generation Time</label>
              <div className="time-badge">
                {currenttime.toLocaleTimeString()}
              </div>
            </div>

            {/* Assignment Row */}
            <div className="col-md-4">
              <label className="field-label"><FaUserPlus className="me-1"/> Assign To Personnel *</label>
              <select onChange={(e) => setAssignEmp(e.target.value)} className="modern-select-field">
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

            <div className="col-md-8">
              <label className="field-label"><FaUserClock className="me-1"/> Problem Description</label>
              <input 
                onChange={(e) => setDescription(e.target.value)} 
                type="text" 
                className="modern-input-field" 
                placeholder="Briefly describe the customer issue..."
              />
            </div>

            <div className="col-12 mt-4">
              <div className="d-flex gap-2">
                <button 
                  type="button" 
                  onClick={generateTicket} 
                  className="btn-indigo-gradient rounded-pill px-5 border-0 py-2 fw-bold shadow-sm"
                >
                  Generate Support Ticket
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="btn btn-light rounded-pill px-4 fw-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .ticket-redesign-wrapper { font-family: 'Inter', sans-serif; }
        .ticket-card { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
        .ticket-header { padding: 25px; border-bottom: 1px solid #f1f5f9; background: #fff; }
        .header-icon-circle { width: 45px; height: 45px; background: #eef2ff; color: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .ticket-body { padding: 30px; }

        .field-label { font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; display: block; letter-spacing: 0.5px; }
        
        .modern-input-field { width: 100%; padding: 12px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; color: #334155; }
        .modern-input-field:focus { border-color: #4f46e5; background: #fff; }
        .modern-input-field.readonly { background: #f8fafc; color: #94a3b8; border-style: dashed; }
        
        .modern-select-field { width: 100%; padding: 12px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; background: #fff; outline: none; cursor: pointer; }
        .modern-select-field:focus { border-color: #4f46e5; }

        .time-badge { padding: 12px; background: #f1f5f9; border-radius: 12px; font-family: 'Courier New', monospace; font-weight: 900; color: #4f46e5; text-align: center; font-size: 1rem; border: 2px solid #e2e8f0; }

        .btn-indigo-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; transition: 0.3s; }
        .btn-indigo-gradient:hover { transform: translateY(-2px); opacity: 0.9; }
      `}</style>
    </div>
  );
}