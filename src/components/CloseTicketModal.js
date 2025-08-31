import React, { useEffect, useState } from "react";
import "./SmallModal.css"; // Add your styles here
import { onValue, ref, update } from "firebase/database";
import { api, db, api2 } from "../FirebaseConfig";
import axios from "axios";
import { toast } from "react-toastify";

const CloseTicketModal = ({ show, ticketno, closeModal }) => {
  const partnerId = localStorage.getItem('partnerId');
  const [arrayemp, setEmpArray] = useState([]);
  const [closeby, setCloseBy] = useState("");
  const [rac, setRAC] = useState("");
  const empRef = ref(db, `users`);

      const fetchEmp = async () => {
        try{
            const response = await axios.get(`${api2}/subscriber/users?partnerId=${partnerId}`);
            const data = response.data
            
            setEmpArray(data.length > 0 ? data : [...data]);
        }catch(e){
            console.log(e);
        }
    }

  useEffect(() => {

      fetchEmp();

  }, [ticketno]);


  const closeTicket = async (e) => {
    e.prevenDefault();
    try{
      const response = await axios.put("https://api.justdude.in:5000/mobile/updateticket/"+ticketno._id, {
        status:"Completed",
        closeby:closeby,
        remarks:rac,
        partnerId:partnerId
      });

      if(response.status !== 200) return toast.error("Failed to Update Ticket", {autoClose:2000})

        toast.success("Ticket Closed Successfully", {autoClose:2000})

    }catch(e){
      console.log(e)
    }
  }



  if (!show) return null;

  return (
    <div className="modal-background">
      <div className="modal-data">
        <div className="d-flex flex-row">
          <h4 style={{ flex: "1", color:'blue' }}>Close Subscriber Ticket</h4>
          <button onClick={closeModal} className="btn-close"></button>
        </div>
        <p style={{ color: "blue" }}>{`Ticket Id :- ${ticketno.Ticketno}`}</p>
        <div>
          <form className="row g-3">
            <div className="col">
              <label className="form-label">Closed By</label>
              <select
                onChange={(e) => setCloseBy(e.target.value)}
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

            <div className="col">
              <label className="form-label">RCA</label>
              <input
                onChange={(e) => setRAC(e.target.value)}
                type="text"
                className="form-control"
              ></input>
            </div>
          </form>
        </div>

        <button className="btn btn-success" onClick={closeTicket}>
          Close Ticket
        </button>
        {/* <button className='btn btn-warning ms-3' onClick={tempClose}>Close as Opened</button> */}
      </div>
    </div>
  );
};

export default CloseTicketModal;
