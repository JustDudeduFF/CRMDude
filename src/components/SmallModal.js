import React, { useEffect, useState } from "react";
import "./SmallModal.css";
import { ref } from "firebase/database";
import { API, mobile_api } from "../FirebaseConfig";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const SmallModal = ({ show, ticketno, closeModal }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [arrayemp, setEmpArray] = useState([]);
  const [assignemp, setAssignEmp] = useState("");
  const [description, setDescription] = useState("");
  const fetchEmp = async () => {
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      const data = response.data;
      setEmpArray(Array.isArray(data) && data.length > 0 ? data : []);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (show) {
      fetchEmp();
      setDescription(ticketno?.Description || "");
    }
  }, [show, ticketno]);

  const assignTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${mobile_api}/updateticket/${ticketno._id}`,
        {
          assignto: assignemp,
          partnerId: partnerId,
          description: description, // send updated description if needed
        }
      );

      if (response.status !== 200) {
        return toast.error("Failed to Update Ticket", { autoClose: 2000 });
      }

      toast.success("Ticket Closed Successfully", { autoClose: 2000 });
      closeModal();
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong!", { autoClose: 2000 });
    }
  };

  if (!show) return null;

  return (
    <div className="modal-background">
      <ToastContainer />
      <div className="modal-data">
        <div className="d-flex flex-row">
          <h4 style={{ flex: "1", color: "blue" }}>
            Assign Ticket to Technician
          </h4>
          <button onClick={closeModal} className="btn-close"></button>
        </div>

        <p style={{ color: "blue" }}>{`Ticket Id : ${ticketno?.Ticketno}`}</p>

        <div>
          <label className="form-label">Employee Names</label>
          <select
            onChange={(e) => setAssignEmp(e.target.value)}
            className="form-select mb-3"
          >
            <option value="">Choose...</option>
            {arrayemp.length > 0 ? (
              arrayemp.map(({ empname, empmobile }, index) => (
                <option key={index} value={empmobile}>
                  {empname}
                </option>
              ))
            ) : (
              <option value="">No Data Available!</option>
            )}
          </select>
        </div>

        <div className="col-md">
          <label className="form-label">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            type="text"
          />
        </div>

        <button className="btn btn-success mt-3" onClick={assignTicket}>
          Assign Ticket
        </button>
      </div>
    </div>
  );
};

export default SmallModal;
