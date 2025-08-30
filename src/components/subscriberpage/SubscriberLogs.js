import React, { useEffect, useState } from "react";
import axios from "axios";
import { api2 } from "../../FirebaseConfig";
import "./SubscriberLogs.css";

export default function SubscriberLogs() {
  const username = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const [logArray, setLogArray] = useState([]);
  const [usersLookup, setUsersLookup] = useState({});

  const fetchlogs = async () => {
    const response = await axios.get(`${api2}/subscriber/logs/${username}`);
    setLogArray(response.data);
  };

  const fetchusers = async () => {
    let maping = {};
    const response = await axios.get(
      `${api2}/subscriber/users?partnerId=${partnerId}`
    );
    const data = response.data;
    Object.keys(data).forEach((key) => {
      const user = data[key];
      maping[user.empmobile] = user.empname;
    });
    setUsersLookup(maping);
  };

  useEffect(() => {
    fetchlogs();
    fetchusers();
  }, []);

  return (
    <div className="subscriber-logs-container">
      <div className="subscriber-logs-header">
        <h2 className="subscriber-logs-title">Subscriber Logs</h2>
      </div>

      <div className="subscriber-logs-content">
        <table className="subscriber-logs-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Description</th>
              <th scope="col">Update By</th>
            </tr>
          </thead>

          <tbody>
            {logArray.length > 0 ? (
              logArray.map((data, index) => (
                <tr key={index}>
                  <td>
                    {new Date(data.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td>{data.description}</td>
                  <td>{usersLookup[data.modifiedby]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="subscriber-logs-no-data">
                  There is no any logs!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
