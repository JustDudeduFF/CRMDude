import { ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaSave, 
  FaUserEdit, 
  FaCalendarAlt, 
  FaListUl, 
  FaFingerprint,
  FaCheckCircle
} from 'react-icons/fa';

export default function ModRemFollow() {
  const partnerId = localStorage.getItem("partnerId");
  const location = useLocation();
  const navigate = useNavigate();
  const { remarkno } = location.state || {};
  const username = localStorage.getItem("susbsUserid");
  const empid = localStorage.getItem("contact");

  const [status, setStatus] = useState("");
  const [remarkconcern, setRemarkConcern] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [assign, setAssign] = useState("");
  const [newdescription, setNewDescription] = useState("");
  const [empArray, setEmpArray] = useState([]);

  // Logic remains untouched
  const fetchData = async () => {
    try {
      const response = await API.get(`/subscriber/followup/${remarkno}`);
      if (response.status !== 200) return toast.error("Failed to load data", { autoClose: 2000 });
      const data = response.data;
      setStatus(data.status);
      setDate(data.followupdate);
      setDescription(data.description);
      setAssign(data.assign);
      setRemarkConcern(data.particular);
    } catch (err) {
      console.log("Error While Fetch Remark:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status !== 200) return toast.error("Failed to Load Employees", { autoClose: 2000 });
      setEmpArray(response.data || []);
    } catch (err) {
      console.log("Error While Get Employees:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [username, remarkno]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const updatedData = {
      status: status,
      description: newdescription || description,
      assign: assign,
      subscriber: username,
    };

    try {
      const response = await API.put(`/subscriber/updateremarkfollow/${remarkno}`, updatedData);
      if (response.status !== 200) return toast.error("Failed to Update", { autoClose: 2000 });
      toast.success("Updated Successfully");
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      toast.error("Failed To Update Follow Up", { autoClose: 2000 });
      console.log("Error While Update Follow Up:", err);
    }
  };

  return (
    <div className="mod-rf-container">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      <div className="mod-rf-card shadow-sm">
        {/* Header Section */}
        <div className="mod-rf-header">
          <div className="d-flex align-items-center">
            <div className="header-icon-box">
              <FaUserEdit />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-dark">Modify Follow Up</h5>
              <p className="mb-0 text-muted small">Update status and notes for Action #{remarkno}</p>
            </div>
          </div>
        </div>

        <div className="mod-rf-body p-4">
          <form onSubmit={handleUpdate} className="row g-4">
            
            {/* Action ID - Read Only */}
            <div className="col-md-3">
              <label className="mod-rf-label"><FaFingerprint className="me-1"/> Action ID</label>
              <input type="text" className="mod-rf-input bg-light border-0 fw-bold" value={remarkno} readOnly />
            </div>

            {/* Action Type - Read Only */}
            <div className="col-md-3">
              <label className="mod-rf-label"><FaListUl className="me-1"/> Action Type</label>
              <input className="mod-rf-input bg-light border-0" value="Follow Up" readOnly />
            </div>

            {/* Particular - Read Only */}
            <div className="col-md-3">
              <label className="mod-rf-label">Particular</label>
              <input className="mod-rf-input bg-light border-0" value={remarkconcern} readOnly />
            </div>

            {/* Action Date - Read Only */}
            <div className="col-md-3">
              <label className="mod-rf-label"><FaCalendarAlt className="me-1"/> Follow Date</label>
              <input value={date} className="mod-rf-input bg-light border-0" type="date" readOnly />
            </div>

            {/* Follow Status - Editable */}
            <div className="col-md-4">
              <label className="mod-rf-label"><FaCheckCircle className="me-1"/> Update Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mod-rf-select"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Assign To - Editable */}
            <div className="col-md-4">
              <label className="mod-rf-label">Assign To</label>
              <select 
                value={assign} 
                onChange={(e) => setAssign(e.target.value)}
                className="mod-rf-select"
              >
                <option value={""}>Choose...</option>
                <option value={empid}>My Self</option>
                {empArray.map((emp, index) => (
                  <option key={index} value={emp.empmobile}>{emp.empname}</option>
                ))}
              </select>
            </div>

            {/* Description - Editable */}
            <div className="col-12">
              <label className="mod-rf-label">Notes / Description</label>
              <textarea
                defaultValue={description}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mod-rf-input"
                rows="3"
                placeholder="Update notes here..."
              ></textarea>
            </div>

            {/* Footer Actions */}
            <div className="col-12 mt-4 d-flex justify-content-end gap-2">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-light border px-4 rounded-pill fw-bold text-muted"
              >
                Discard
              </button>
              <button
                type="submit"
                className="btn px-4 rounded-pill fw-bold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', border: 'none' }}
              >
                <FaSave className="me-2" /> Update Action
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .mod-rf-container {
          padding: 20px;
          background-color: #f8fafc;
          min-height: 80vh;
        }

        .mod-rf-card {
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #eef2f6;
        }

        .mod-rf-header {
          padding: 20px 25px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
        }

        .header-icon-box {
          width: 45px;
          height: 45px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-right: 15px;
        }

        .mod-rf-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          display: block;
        }

        .mod-rf-input, .mod-rf-select {
          width: 100%;
          padding: 10px 15px;
          border-radius: 10px;
          border: 2px solid #f1f5f9;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: 0.2s;
        }

        .mod-rf-input:focus, .mod-rf-select:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .bg-light { background-color: #f8fafc !important; }

        @media (max-width: 768px) {
          .mod-rf-container { padding: 10px; }
          .mod-rf-body { padding: 20px; }
        }
      `}</style>
    </div>
  );
}