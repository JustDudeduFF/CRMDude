  import { get, push, ref, set, update } from "firebase/database";
  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { API } from "../../FirebaseConfig";
  import { toast, ToastContainer } from "react-toastify";
  import { FaFileInvoice, FaCalendarAlt, FaMoneyBillWave, FaPenNib, FaPlusCircle } from 'react-icons/fa';

  export default function CreateNote(props) {
    const partnerId = localStorage.getItem("partnerId");
    const { notety } = props;
    const username = localStorage.getItem("susbsUserid");
    const navigate = useNavigate();

    const [note, setNote] = useState(Date.now);
    const [arrayparticular, setArrayParticular] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [amount, setAmount] = useState("");
    const [particular, setParticular] = useState("");
    const [remarks, setRemarks] = useState("");

    const fetchparticular = async () => {
      try {
        const response = await API.get(
          `/subscriber/dcnoteparticular?partnerId=${partnerId}`
        );
        if (response.status !== 200) return console.log("Error fetching particulars");
        const data = response.data;
        if (data) {
          setArrayParticular(data);
        }
      } catch (error) {
        console.error("Error fetching particulars:", error);
      }
    };

    useEffect(() => {
      fetchparticular();
    }, []);

    const createnote = async () => {
      const notetype = notety === "danger" ? "Debit Note" : "Credit Note";

      const dcnoteData = {
        noteno: note,
        notetype: notetype,
        notedate: date,
        notefor: particular,
        amount: amount,
        modifiedby: localStorage.getItem("contact"),
        modifiedon: new Date().toISOString().split("T")[0],
        remarks: remarks,
        subscriber: username,
        partnerId: partnerId,
      };

      try {
        const response = await API.post(`/subscriber/dcnote`, dcnoteData);

        if (response.status !== 201) return console.log("Error creating note");
        toast.success(
          `${notety === "danger" ? "Debit" : "Credit"} Note Created Successfully!`
        );
        setTimeout(() => navigate(-1), 1500);
      } catch (error) {
        console.error("Error creating note:", error);
        toast.error(`Error creating ${notety === "danger" ? "Debit" : "Credit"} Note`);
      }
    };

    const isDebit = notety === "danger";
    const themeColor = isDebit ? "#dc3545" : "#198754";

    return (
      <div className="create-note-wrapper">
        <ToastContainer position="top-right" theme="colored" />
        
        <div className="form-card shadow-sm border-0">
          {/* Header Section */}
          <div className="card-header-custom" style={{ backgroundColor: themeColor, padding: '0.8rem 1.2rem' }}>
            <h6 className="mb-0 text-white fw-bold" style={{ fontSize: '0.9rem' }}>
              <FaPlusCircle className="me-2" />
              Create {isDebit ? "Debit" : "Credit"} Note
            </h6>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.7rem' }}>Transaction Entry for {username}</p>
          </div>

          <div className="card-body p-3 p-md-4">
            <form className="row g-3">
              
              {/* Note No. (Read Only) */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                  <FaFileInvoice className="me-1" /> Note Number
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-0"
                  style={{ fontSize: '0.8rem', fontWeight: '600' }}
                  defaultValue={note}
                  readOnly
                />
              </div>

              {/* Note Date */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                  <FaCalendarAlt className="me-1" /> Note Date
                </label>
                <input
                  defaultValue={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="form-control form-control-sm border-2 shadow-none"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>

              {/* Particulars (Select) */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                  Particulars
                </label>
                <select
                  onChange={(e) => setParticular(e.target.value)}
                  className="form-select form-select-sm border-2 shadow-none"
                  style={{ fontSize: '0.8rem' }}
                >
                  <option value="">Choose...</option>
                  {arrayparticular.map((item, index) => (
                    <option key={index} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                  <FaMoneyBillWave className="me-1" /> Amount (₹)
                </label>
                <input
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  placeholder="0.00"
                  className="form-control form-control-sm border-2 shadow-none"
                  style={{ fontWeight: '700', color: themeColor, fontSize: '0.8rem' }}
                />
              </div>

              {/* Narration */}
              <div className="col-12">
                <label className="form-label fw-bold text-muted text-uppercase" style={{ fontSize: '11px' }}>
                  <FaPenNib className="me-1" /> Narration / Remarks
                </label>
                <textarea
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="2"
                  className="form-control form-control-sm border-2 shadow-none"
                  placeholder="Details..."
                  style={{ fontSize: '0.8rem' }}
                ></textarea>
              </div>

              {/* Submit Section */}
              <div className="col-12 mt-3">
                <button
                  onClick={createnote}
                  type="button"
                  className={`btn btn-sm w-100 py-2 shadow-sm fw-bold text-uppercase ${isDebit ? 'btn-debit' : 'btn-credit'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  Create {isDebit ? "Debit" : "Credit"} Note
                </button>
                <button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  className="btn btn-link w-100 mt-1 text-decoration-none text-muted"
                  style={{ fontSize: '0.7rem' }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>

        <style>{`
          .create-note-wrapper {
            padding: 1rem;
            background: #f8fafc;
            min-height: 100vh;
            font-family: 'Inter', sans-serif;
          }

          .form-card {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
          }

          .card-header-custom {
            padding: 0.8rem 1.2rem;
          }

          .form-control, .form-select {
            border-radius: 8px;
            border: 1px solid #edf2f7;
            transition: all 0.2s ease-in-out;
          }

          .form-control:focus, .form-select:focus {
            border-color: ${themeColor};
          }

          .btn-debit {
            background-color: #dc3545;
            color: white;
            border-radius: 8px;
          }

          .btn-credit {
            background-color: #198754;
            color: white;
            border-radius: 8px;
          }

          @media (max-width: 768px) {
            .create-note-wrapper { padding: 0.5rem; }
            .card-body { padding: 1rem; }
          }
        `}</style>
      </div>
    );
  }