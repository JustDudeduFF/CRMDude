import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { 
  FaRegStickyNote, 
  FaUserEdit, 
  FaCalendarCheck, 
  FaTasks, 
  FaInfoCircle, 
  FaPlusCircle,
  FaArrowLeft,
  FaHistory
} from 'react-icons/fa';

export default function AddRemarkFollow(props) {
  const partnerId = localStorage.getItem("partnerId");
  const { mode } = props;
  const username = localStorage.getItem("susbsUserid");
  const empid = localStorage.getItem("contact");
  const navigate = useNavigate();

  const [ArrayConcern, setArrayConcern] = useState([]);
  const [description, setDescription] = useState("");
  const [remarkparticular, setRemarkParticular] = useState("");
  const [followDate, setFollowDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [empArray, SetEmpArray] = useState([]);
  const [assign, SetAssign] = useState("");

  const isFollow = mode === "follow";
  // Alignment with Cust_PayRecpt colors: Indigo for Follow-up, Emerald for Remarks
  const themeColor = isFollow ? "#4f46e5" : "#10b981"; 

  const fetchconcerns = async () => {
    try {
      const response = await API.get(
        `/subscriber/rfconcerns?partnerId=${partnerId}`
      );
      if (response.status !== 200) return toast.error("Failed to get Particulars");
      setArrayConcern(response.data || []);
    } catch (err) {
      toast.error("Error fetching concerns");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await API.get(
        `/subscriber/users?partnerId=${partnerId}`
      );
      if (response.status !== 200) return toast.error("Failed to fetch Employees");
      SetEmpArray(response.data || []);
    } catch (err) {
      console.log("Failed to Fetch Employees", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchconcerns();
  }, []);

  const savedata = async () => {
    const remarkno = Date.now();
    const type = isFollow ? "Follow Up" : "Remarks";

    const followdata = {
      particular: remarkparticular,
      remarkKey: remarkno,
      type: type,
      date: new Date().toISOString().split("T")[0],
      description: description,
      modifiedby: localStorage.getItem("Name"),
      modifiedon: new Date().toISOString().split("T")[0],
      status: isFollow ? "pending" : "completed",
      followupdate: followDate,
      subscriber: username,
      partnerId: partnerId,
      assign: assign,
    };

    try {
      const response = await API.post(`/subscriber/addremarkfollow`, followdata);
      if (response.status !== 200) return toast.error("Failed to Add " + mode);
      toast.success(`${type} Added!`);
      setTimeout(() => navigate(-1), 1000);
    } catch (e) {
      console.log(e);
      toast.error("API Error");
    }
  };

  return (
    <div className="rf-wrapper">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      

      {/* CONTENT AREA */}
      <div className="rf-card shadow-sm">
        <div className="rf-body p-4">
          <form className="row g-4">
            
            <div className="col-md-3">
              <label className="field-label-sm"><FaInfoCircle className="me-1" style={{color: themeColor}}/> Entry Type</label>
              <input
                type="text"
                className="modern-input-field bg-light border-0 fw-bold"
                value={isFollow ? "FOLLOW UP" : "REMARK"}
                style={{ color: themeColor }}
                readOnly
              />
            </div>

            <div className="col-md-3">
              <label className="field-label-sm"><FaCalendarCheck className="me-1" style={{color: themeColor}}/> {isFollow ? "Follow Up Date" : "Date"}</label>
              <input
                onChange={(e) => setFollowDate(e.target.value)}
                className="modern-input-field"
                type="date"
                defaultValue={followDate}
                disabled={!isFollow}
              />
            </div>

            <div className="col-md-3">
              <label className="field-label-sm"><FaTasks className="me-1" style={{color: themeColor}}/> Category Particular</label>
              <select onChange={(e) => setRemarkParticular(e.target.value)} className="modern-select-field">
                <option value="">Select Category...</option>
                {ArrayConcern.map((concern, index) => (
                  <option key={index} value={concern}>{concern}</option>
                ))}
              </select>
            </div>

            {isFollow && (
              <div className="col-md-3">
                <label className="field-label-sm"><FaUserEdit className="me-1" style={{color: themeColor}}/> Assign Task To</label>
                <select onChange={(e) => SetAssign(e.target.value)} className="modern-select-field">
                  <option value="">Choose Employee...</option>
                  <option value={empid}>Assign to Myself</option>
                  {empArray.map((emp, index) => (
                    <option key={index} value={emp.empmobile}>{emp.empname}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-12">
              <label className="field-label-sm"><FaRegStickyNote className="me-1" style={{color: themeColor}}/> Detailed Description</label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                className="modern-input-field"
                rows="3"
                placeholder="Type relevant details here..."
              ></textarea>
            </div>

            <div className="col-12 mt-4 d-flex justify-content-end gap-2">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-sm btn-light border rounded-pill px-4 fw-bold text-muted"
              >
                Cancel
              </button>
              <button
                onClick={savedata}
                type="button"
                className="btn btn-sm rounded-pill px-4 fw-bold text-white border-0 shadow-sm"
                style={{ background: isFollow ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <FaPlusCircle className="me-2" />
                Save {isFollow ? "Follow Up" : "Remark"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .rf-wrapper { padding: 15px; font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 90vh; }
        
        .rf-nav {
          background: #fff;
          padding: 12px 25px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #edf2f7;
        }

        .header-icon-circle {
          width: 42px; height: 42px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .nav-info { display: flex; align-items: center; }

        .back-btn {
          width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;
          color: #64748b; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
          transition: 0.2s;
        }
        .back-btn:hover { background: #4f46e5; color: #fff; border-color: #4f46e5; }

        .rf-card { max-width: 1000px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #eef2f6; }
        
        .field-label-sm { font-size: 0.7rem; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; display: block; }
        
        .modern-input-field, .modern-select-field {
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 2px solid #f1f5f9;
          font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.3s;
          background-color: #ffffff;
        }

        .modern-input-field:focus, .modern-select-field:focus { 
          border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); 
        }

        @media (max-width: 768px) {
          .rf-nav { flex-direction: column; gap: 15px; text-align: center; }
          .nav-actions { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}