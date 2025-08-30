import React, { useState, useEffect } from "react";
import DesignationModal from "./DesignationModal";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";

export default function Designation() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraydesignation, setArraydesignation] = useState([]);

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/designations?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to load Designations", { autoClose: 2000 });

      setArraydesignation(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Company designation Location and Address
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_DESIGNATION")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-right"
        >
          Add New designation
        </button>
      </div>
      <ToastContainer />
      <DesignationModal show={showModal} notshow={() => setShowModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Designation Name</th>
              <th scope="col">Add Date</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {arraydesignation.map(({ name, createdAt }, index) => (
              <tr key={name}>
                <td>{index + 1}</td>
                <td className="text-primary text-decoration-underline">
                  {name}
                </td>
                <td>
                  {new Date(createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
