import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { api2 } from "../../FirebaseConfig";

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

  const fetchconcerns = async () => {
    const response = await axios.get(
      api2 + "/subscriber/rfconcerns?partnerId=" + partnerId
    );
    if (response.status !== 200)
      return toast.error("Failed to get Particulars");

    const data = response.data;
    setArrayConcern(data);
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        api2 + "/subscriber/users?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return toast.error("Failed to fetch Employess", { autoClose: 2000 });

      const data = response.data;
      SetEmpArray(data);
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
    const type = mode === "follow" ? "Follow Up" : "Remarks";

    const followdata = {
      particular: remarkparticular,
      remarkKey: remarkno,
      type: type,
      date: new Date().toISOString().split("T")[0],
      description: description,
      modifiedby: localStorage.getItem("Name"),
      modifiedon: new Date().toISOString().split("T")[0],
      status: mode === "follow" ? "pending" : "completed",
      followupdate: followDate,
      subscriber: username,
      partnerId: partnerId,
      assign: assign,
    };

    try {
      const response = await axios.post(
        api2 + "/subscriber/addremarkfollow",
        followdata
      );

      if (response.status !== 200)
        return toast.error("Failed to Add " + mode, { autoClose: 2000 });

      navigate(-1);
    } catch (e) {
      console.log(e);
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
          border: mode === "remark" ? "1px solid skyblue" : "1px solid blue",
          borderRadius: "5px",
          boxShadow: mode === "remark" ? "0 0 10px skyblue" : "0 0 10px blue",
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label className="form-label">Action ID</label>
            <input
              type="email"
              className="form-control"
              value="Auto"
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Action Type</label>
            <input
              type="text"
              className="form-control"
              value={`${mode === "remark" ? "Remark" : "Follow Up"} `}
              readOnly
            ></input>
          </div>

          <div className="col-md-2">
            <label className="form-label">Action Date</label>
            <input
              onChange={(e) => setFollowDate(e.target.date)}
              className="form-control"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              disabled={mode === "remark"}
            ></input>
          </div>

          <div className="col-md-2">
            <label className="form-label">
              {mode === "follow" ? "Follow Up Particular" : "Remark Particular"}
            </label>
            <select
              onChange={(e) => setRemarkParticular(e.target.value)}
              className="form-select"
            >
              <option value="">Choose...</option>
              {ArrayConcern.map((concern, index) => (
                <option key={index} value={concern}>
                  {concern}
                </option>
              ))}
            </select>
          </div>

          {mode === "follow" ? (
            <div className="col-md-3">
              <label className="form-label">Assign To</label>
              <select
                onChange={(e) => SetAssign(e.target.value)}
                className="form-select"
              >
                <option value={""}>Choose...</option>
                <option value={empid}>My Self</option>
                {empArray.length > 0 ? (
                  empArray.map((emp, index) => (
                    <option key={index} value={emp.empmobile}>
                      {emp.empname}
                    </option>
                  ))
                ) : (
                  <option value={""}>No Employee Found</option>
                )}
              </select>
            </div>
          ) : (
            <div></div>
          )}

          <div className="col-md-8">
            <label className="form-label">Description</label>
            <input
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              className="form-control"
            ></input>
          </div>

          <div className="col-8">
            <button
              onClick={savedata}
              type="button"
              className={`btn ${
                mode === "remark" ? "btn-outline-info" : "btn-outline-primary"
              }`}
            >{`${mode === "remark" ? "Add Remark" : "Add Follow Up"}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
