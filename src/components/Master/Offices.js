import React, { useState, useEffect } from "react";
import OfficeModal from "./OfficeModal";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";

export default function Offices() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayoffice, setArrayOffice] = useState([]);
  const officeRef = ref(db, "Master/Offices");

  const fetchOffices = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/offices?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to load Offices", { autoClose: 2000 });

      setArrayOffice(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Company Office Location and Address
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_OFFICE")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-right"
        >
          Add New Office
        </button>
      </div>
      <ToastContainer />
      <OfficeModal show={showModal} notshow={() => setShowModal(false)} />

      <table className="table">
        <thead>
          <tr>
            <th scope="col">S. No.</th>
            <th scope="col">Office Name</th>
            <th scope="col">Address</th>
            <th scope="col">Latitude / Longitude</th>
          </tr>
        </thead>

        <tbody className="table-group-divider">
          {arrayoffice.map((office, index) => (
            <tr key={office.name}>
              <td>{index + 1}</td>
              <td className="text-primary text-decoration-underline">
                {office.name}
              </td>
              <td>{office.address}</td>
              <td>{`${office.lat} / ${office.long}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
