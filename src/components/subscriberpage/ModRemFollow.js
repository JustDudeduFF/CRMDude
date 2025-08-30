import { get, ref, update as firebaseUpdate } from "firebase/database"; // Renamed update import
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api2, db } from "../../FirebaseConfig";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

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

  const remarkRef = ref(db, `Subscriber/${username}/Remarks/${remarkno}`);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        api2 + "/subscriber/followup/" + remarkno
      );

      if (response.status !== 200)
        return toast.error("Failed to load data", { autoClose: 2000 });
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
      const response = await axios.get(
        api2 + "/subscriber/users?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to Load Employess", { autoClose: 2000 });
      const data = response.data;
      setEmpArray(data);
    } catch (err) {
      console.log("Error While Get Employees:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [username, remarkno]);

  // Renamed update function to avoid conflict with Firebase's update function
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedData = {
      status: status,
      description: newdescription || description,
      assign: assign,
      subscriber: username,
    };

    try {
      const response = await axios.put(
        api2 + "/subscriber/updateremarkfollow/" + remarkno,
        updatedData
      );

      if (response.status !== 200)
        return toast.error("Failed to Update", { autoClose: 2000 });

      navigate(-1);
    } catch (err) {
      toast.error("Failed To Update Follow Up", { autoClose: 2000 });
      console.log("Error While Update Follow Up:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer />
      <div
        style={{
          flex: "1",
          margin: "20px",
          border: "1px solid gray",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px gray",
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Action ID</label>
            <input
              type="text"
              className="form-control"
              value={remarkno}
              readOnly
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Action Type</label>
            <input className="form-control" value="Follow Up" readOnly />
          </div>

          <div className="col-md-2">
            <label className="form-label">Particular</label>
            <input className="form-control" value={remarkconcern} readOnly />
          </div>

          <div className="col-md-2">
            <label className="form-label">Action Date</label>
            <input value={date} className="form-control" type="date" readOnly />
          </div>

          <div className="col-md-2">
            <label className="form-label">Follow Status</label>
            <select
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Description</label>
            <input
              defaultValue={description}
              onChange={(e) => setNewDescription(e.target.value)}
              type="text"
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Assign To</label>
            <select defaultValue={assign} className="form-select">
              <option value={""}>Choose...</option>
              <option value={empid}>My Self</option>
              {empArray.length > 0 ? (
                empArray.map((emp, index) => (
                  <option key={index} value={emp.empmobile}>
                    {emp.empname}
                  </option>
                ))
              ) : (
                <option value={""}>No Employees Found</option>
              )}
            </select>
          </div>

          <div className="col-8">
            <button
              onClick={handleUpdate}
              type="submit"
              className="btn btn-outline-secondary"
            >
              Update Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
