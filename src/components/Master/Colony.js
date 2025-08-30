import React, { useState, useEffect } from "react";
import ColonyModal from "./ColonyModal";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";

export default function Colony() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraycolony, setArrayColony] = useState([]);

  const fetchColony = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/colony?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return toast.error("Failed to load Colony", { autoClose: 2000 });
      const data = response.data;

      setArrayColony(data);
    } catch (e) {
      console.log(e);
      toast.error("Error fetching Colony data", { autoClose: 2000 });
    }
  };

  useEffect(() => {
    fetchColony();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Company Colony Location and Address
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_COLONY")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-right"
        >
          Add New Colony
        </button>
      </div>
      <ToastContainer />
      <ColonyModal show={showModal} notshow={() => setShowModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Colony Name</th>
              <th scope="col">Under Company</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {arraycolony.map(({ name, undercompany }, index) => (
              <tr key={name}>
                <td>{index + 1}</td>
                <td className="text-primary text-decoration-underline">
                  {name}
                </td>
                <td>{undercompany}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
