import { onValue, ref, off } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api2, db } from "../../FirebaseConfig";
import axios from "axios";
import "./DebitCreditsTable.css";

export default function DebitCreditsTable() {
  const partnerId = localStorage.getItem("partnerId");
  const username = localStorage.getItem("susbsUserid");
  const [arraynotes, setArrayNotes] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Firebase reference
  const notesRef = ref(db, `Subscriber/${username}/dcnotes`);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api2}/subscriber/dcnotes/${username}`
      );
      if (response.status !== 200) {
        console.error("Failed to fetch notes");
        return;
      }
      const notesData = response.data;
      const notesArray = Object.keys(notesData).map((key) => ({
        noteno: notesData[key].noteno || "N/A",
        notetype: notesData[key].notetype || "N/A",
        notedate: notesData[key].notedate || "N/A",
        notefor: notesData[key].notefor || "N/A",
        amount: notesData[key].amount || "0",
        modifiedBy: notesData[key].modifiedby || "N/A",
        modifiedon: notesData[key].modifiedon || "N/A",
        remarks: notesData[key].remarks || "N/A",
      }));
      setArrayNotes(notesArray);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    let maping = {};
    try {
      const response = await axios.get(
        `${api2}/subscriber/users?partnerId=${partnerId}`
      );
      if (response.status !== 200)
        return console.log("Error fetching user data");
      const data = response.data;
      Object.keys(data).forEach((key) => {
        const user = data[key];
        maping[user.empmobile] = user.empname;
      });
      setUserMap(maping);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchUserData();
  }, [username]);

  return (
    <div className="debit-credits-container">
      <div className="debit-credits-wrapper">
        <table className="debit-credits-table">
          <thead>
            <tr>
              <th scope="col">Note No.</th>
              <th scope="col">Note Type</th>
              <th scope="col">Note Date</th>
              <th scope="col">Note For</th>
              <th scope="col">Amount</th>
              <th scope="col">Modified By</th>
              <th scope="col">Modified On</th>
              <th scope="col">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11">
                  <div className="debit-credits-loading">
                    <div className="debit-credits-loading-spinner">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div className="debit-credits-loading-text">Loading...</div>
                  </div>
                </td>
              </tr>
            ) : arraynotes.length > 0 ? (
              arraynotes
                .reverse()
                .map(
                  (
                    {
                      noteno,
                      notetype,
                      notedate,
                      notefor,
                      amount,
                      modifiedBy,
                      modifiedon,
                      remarks,
                    },
                    index
                  ) => (
                    <tr key={index}>
                      <td
                        onClick={() =>
                          navigate("modnote", { state: { noteno: noteno } })
                        }
                        className={`debit-credits-note-number ${
                          notetype === "Debit Note" ? "debit" : "credit"
                        }`}
                      >
                        {noteno}
                      </td>
                      <td>{notetype}</td>
                      <td>{notedate}</td>
                      <td>{notefor}</td>
                      <td>{`${amount}.00`}</td>
                      <td>{userMap[modifiedBy]}</td>
                      <td>{modifiedon}</td>
                      <td>{remarks}</td>
                    </tr>
                  )
                )
            ) : (
              <tr>
                <td colSpan="8" className="debit-credits-no-data">
                  No Debit and Credit Notes Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
