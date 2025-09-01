import { get, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { api2, db } from "../../FirebaseConfig";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ISPModal = ({ show, unShow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [currentDate, setCurrentDate] = useState("");
  const [ispCode, setIspCode] = useState("");
  const [ispName, setIspName] = useState("");

  useEffect(() => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = today.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    setCurrentDate(formattedDate);
  }, []);

  const handleClick = async () => {
    const data = {
      code: ispCode,
      name: ispName,
      date: currentDate,
    };

    try {
      const response = await axios.post(
        api2 + "/master/isps?partnerId=" + partnerId,
        data
      );

      if (response.status !== 200)
        return toast.error("Failed to Add ISP", { autoClose: 2000 });
      unShow(true);
    } catch (e) {
      console.log(e);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="d-flex flex-row">
          <h5 style={{ flex: "1" }}>Add ISP - Internet Service Provider</h5>
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
