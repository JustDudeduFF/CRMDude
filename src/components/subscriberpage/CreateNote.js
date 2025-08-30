import { get, push, ref, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { api2, db } from "../../FirebaseConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

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
      const response = await axios.get(
        api2 + "/subscriber/dcnoteparticular?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return console.log("Error fetching particulars");
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
      const response = await axios.post(
        `${api2}/subscriber/dcnote`,
        dcnoteData
      );

      if (response.status !== 201) return console.log("Error creating note");
      toast.success(
        `${
          notety === "danger" ? "Debit" : "Credit"
        } Note Created Successfully!`,
        {
          autoClose: 3000,
        }
      );
      navigate(-1);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error(
        `Error creating ${notety === "danger" ? "Debit" : "Credit"} Note`,
        {
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer />
      <div
        style={{
          flex: "1",
          margin: "20px",
          border: notety === "danger" ? "1px solid red" : "1px solid green",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: notety === "danger" ? "0 0 10px red" : "0 0 10px green",
        }}
      >
        <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Note No.</label>
            <input
              type="text"
              className="form-control"
              defaultValue={note}
              onChange={(e) => setNote(e.target.value)}
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Particular</label>
            <select
              onChange={(e) => setParticular(e.target.value)}
              className="form-select"
            >
              <option value="">Choose...</option>
              {arrayparticular.map((particular, index) => (
                <option key={index} value={particular}>
                  {particular}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Note Date</label>
            <input
              defaultValue={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="form-control"
            ></input>
          </div>

          <div className="col-md-3">
            <label className="form-label">Amount</label>
            <input
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className="form-control"
            ></input>
          </div>

          <div className="col-md-8">
            <label className="form-label">Narration</label>
            <input
              onChange={(e) => setRemarks(e.target.value)}
              type="text"
              className="form-control"
            ></input>
          </div>
          <div className="col-8">
            <button
              onClick={createnote}
              type="button"
              className={`btn ${
                notety === "danger"
                  ? "btn-outline-danger"
                  : "btn-outline-success"
              }`}
            >{`${
              notety === "danger" ? "Create Debit Note" : " Create Credit Note"
            }`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
