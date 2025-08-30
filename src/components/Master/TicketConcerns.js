import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import TicketModal from "./TicketModal";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";

export default function TicketConcerns() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayticket, setArrayTicket] = useState([]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/ticketconcern?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to Load Ticket Concents", {
          autoClose: 2000,
        });

      setArrayTicket(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Ticket Concerns
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_TICKET_CONCERNS")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-right"
        >
          Add Concern
        </button>
      </div>
      <ToastContainer />
      <TicketModal show={showModal} notshow={() => setShowModal(false)} />
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
              arrayticket.map(({ ticketname, date }, index) => (
                <tr key={ticketname}>
                  <td>{index + 1}</td>
                  <td className="text-primary text-decoration-underline">
                    {ticketname}
                  </td>
                  <td>
                    {new Date(date).toLocaleDateString("en-GB", {
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
