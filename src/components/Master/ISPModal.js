import { get, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { db } from "../../FirebaseConfig";
import 'react-toastify/dist/ReactToastify.css';

const ISPModal = ({ show, unShow }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [ispCode, setIspCode] = useState('');
  const [ispName, setIspName] = useState('');

  const ispData = {
    ispcode: ispCode,
    ispname: ispName,
    ispdate: currentDate,
  };

  useEffect(() => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    setCurrentDate(formattedDate);
  }, []);

  const handleClick = async () => {
    const ispRef = ref(db, `Master/ISPs/${ispCode}`);

    const ispSnap = await get(ispRef);

    if (ispSnap.exists()) {
      toast.error('ISP Code Already exists!', {

        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    } else {
      await set(ispRef, ispData);
      toast.success('ISP Added Successfully!', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="d-flex flex-row">
          <h5 style={{ flex: '1' }}>Add ISP - Internet Service Provider</h5>
          <button onClick={unShow} className="btn-close"></button>
        </div>

        <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">ISP Code</label>
            <input
              onChange={(e) => setIspCode(e.target.value)}
              className="form-control"
              value={ispCode}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label">ISP Name</label>
            <input
              onChange={(e) => setIspName(e.target.value)}
              className="form-control"
              value={ispName}
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">ISP Added On</label>
            <input
              type="text"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="form-control"
            />
          </div>
        </form>

        <button onClick={handleClick} className="btn btn-outline-info mt-4">
          Add Device
        </button>
      </div>
      <ToastContainer className="mt-5" />
    </div>
  );
};

export default ISPModal;
