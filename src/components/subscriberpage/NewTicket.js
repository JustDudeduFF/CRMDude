
import React, { useEffect, useState } from "react";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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


  const fetchemp = async () => {
    try {
      const response = await axios.get(
        `${api2}/subscriber/users?partnerId=${partnerId}`
      );
      if (response.status !== 200)
        return console.log("Error fetching employee data");
      const data = response.data;
      setArrayEmp(data.length > 0 ? data : [...data]);
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed to fetch employees", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const fetchconcerns = async () => {
    try {
      const response = await axios.get(
        `${api2}/subscriber/ticketconcerns?partnerId=${partnerId}`
      );
      if (response.status !== 200)
        return console.log("Error fetching concern data");
      const data = response.data;
      setArrayConcern(data.length > 0 ? data : [...data]);
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed to fetch concerns", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    setCurrentTime(new Date());

      fetchconcerns();
      fetchemp();
  }, []);

  function generateHappyCode() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const generateTicket = async () => {
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
      const response = await axios.post(`${api2}/subscriber/ticket`, {
        ...ticketdata,
      });

      if (response.status !== 201) {
        toast.error("Failed to generate ticket", {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      // await set(globalticketRef, globalticketdata);
      navigate(-1);
    } catch (error) {
      console.log(`Error:- ${error}`);
      toast.error("Failed", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer />
      <div
        style={{
          flex: "1",
          margin: "20px",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px blue",
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Ticket No.</label>
            <input
              defaultValue="Auto"
              className="form-control"
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">
              Ticket Concern
            </label>
            <select
              onChange={(e) => setTicketConcern(e.target.value)}
              id="inputState"
              className="form-select"
            >
              <option value="">Choose...</option>
              {arrayconcern.length > 0 ? (
                arrayconcern.map((concern, index) => (
                  <option key={index}>{concern.ticketname}</option>
                ))
              ) : (
                <option value="">No Concern Availabale</option>
              )}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Ticket Date</label>
            <input
              value={new Date().toISOString().split("T")[0]}
              type="date"
              className="form-control"
              readOnly
            ></input>
          </div>

          <div className="col-md-2">
            <label className="form-label">Current Time</label>
            <label className="form-control">
              {currenttime.toLocaleTimeString()}
            </label>
          </div>

          <div className="col-md-2">
            <label for="inputZip" className="form-label">
              Assigned To
            </label>
            <select
              onChange={(e) => setAssignEmp(e.target.value)}
              id="inputState"
              className="form-select"
            >
              <option value="">Choose...</option>
              {arrayemp.length > 0 ? (
                arrayemp.map(({ empname, empmobile }, index) => (
                  <option key={index} value={empmobile}>
                    {empname}
                  </option>
                ))
              ) : (
                <option value="">No Employee Availabale</option>
              )}
            </select>
          </div>
          <div className="col-md-8">
            <label for="inputCity" className="form-label">
              Description or Brief
            </label>
            <input
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              className="form-control"
              id="inputCity"
            ></input>
          </div>
        </form>
      </div>

      <button
        onClick={generateTicket}
        className="btn btn-outline-primary ms-5 me-5"
      >
        Generate Ticket
      </button>
    </div>
  );
}
