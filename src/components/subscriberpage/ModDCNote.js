import { get, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api2, db } from "../../FirebaseConfig";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function ModDCNote() {
  const partnerId = localStorage.getItem("partnerId");
  const location = useLocation();
  const { noteno } = location.state || {};
  const username = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [particular, setParticular] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notetype, setNoteType] = useState("");
  const [date, setDate] = useState("");
  const [dueAmount, setDueAmount] = useState("");

  const [newamount, setNewAmount] = useState("");

  const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);

  const fetchdata = async () => {
    const response = await axios.get(
      `${api2}/subscriber/dcnotes/${username}?dcnote=${noteno}`
    );
    if (response.status !== 200) return console.log("Error fetching note data");
    const data = response.data;
    if (data) {
      setAmount(data.amount);
      setParticular(data.notefor);
      setRemarks(data.remarks);
      setNoteType(data.notetype);
      setDate(data.notedate);
      setDueAmount(data.dueAmount || "0");
    }
  };

  useEffect(() => {
    return () => fetchdata();
  }, [noteno]);

  const updatenote = async () => {
    const updatedNote = {
      noteno: noteno,
      notetype: notetype,
      notedate: date,
      notefor: particular,
      amount: amount,
      newamount: newamount,
      modifiedby: localStorage.getItem("contact"),
      modifiedon: new Date().toISOString().split("T")[0],
      remarks: remarks,
      subscriber: username,
      partnerId: partnerId,
    };
    try {
      const response = await axios.put(api2 + "/subscriber/dcnote/" + noteno, {
        updatedNote,
      });

      if (response.status === 200) {
        alert("Note updated successfully");
        navigate(-1);
      }
    } catch (e) {
      console.error("Update error:", e);
      toast.error("Failed to update note", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      return;
    }
  };

  const cancelnote = async () => {};

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
            <label className="form-label">Note No.</label>
            <input
              type="text"
              className="form-control"
              defaultValue={noteno}
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Note Type</label>
            <input
              className="form-control"
              defaultValue={notetype}
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Particular</label>
            <input
              defaultValue={particular}
              className="form-control"
              readOnly
            ></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Note Date</label>
            <input
              onChange={(e) => setDate(e.target.value)}
              defaultValue={date}
              className="form-control"
              type="date"
            ></input>
          </div>

          <div className="col-md-3">
            <label className="form-label">Amount</label>
            <input
              onChange={(e) => setNewAmount(e.target.value)}
              defaultValue={amount}
              type="number"
              className="form-control"
            ></input>
          </div>

          <div className="col-md-12">
            <label className="form-label">Narration</label>
            <input
              defaultValue={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              type="text"
              className="form-control"
            ></input>
          </div>
          <div className="col-md-2">
            <button
              onClick={updatenote}
              type="button"
              className="btn btn-outline-secondary"
            >
              Update Note
            </button>
          </div>

          <div className="col-md-2">
            <button
              onClick={cancelnote}
              type="button"
              className="btn btn-danger"
            >
              Cancel Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
