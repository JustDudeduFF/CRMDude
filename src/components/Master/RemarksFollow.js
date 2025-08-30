import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import RemarkFollowModal from "./RemarkFollowModal";
import axios from "axios";

export default function RemarksFollow() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);

  const [arrayticket, setArrayTicket] = useState([]);

  const fetchRMConcerns = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/remark-follow?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to Load Remark and Follow Up Concents", {
          autoClose: 2000,
        });

      setArrayTicket(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchRMConcerns();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Remark or Follow Up Concern
        </h5>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-outline-success justify-content-right"
        >
          Add Concern
        </button>
      </div>
      <ToastContainer />
      <RemarkFollowModal show={showModal} notshow={() => setShowModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Concern Name</th>
              <th scope="col">Added On</th>
              <th scope="col">Last Month Generated</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {arrayticket.length > 0 ? (
              arrayticket.map(({ name, createdAt }, index) => (
                <tr key={name}>
                  <td>{index + 1}</td>
                  <td className="text-primary text-decoration-underline">
                    {name}
                  </td>
                  <td>
                    {new Date(createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>No Concerns Availabale</tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
