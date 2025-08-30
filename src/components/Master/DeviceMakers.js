import React, { useState, useEffect } from "react";
import MakerModal from "./MakerModal";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";
import { toast } from "react-toastify";

export default function DeviceMakers() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arraydMaker, setArraydMaker] = useState([]);
  const dMakerRef = ref(db, "Master/dMakers");

  const fetchdMakers = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/devicemaker?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to Load Makers Name", { autoClose: 2000 });

      setArraydMaker(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchdMakers();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Device Maker Name and Address
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_DEVICE_MAKER")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-right"
        >
          Add New dMaker
        </button>
      </div>

      <MakerModal show={showModal} notshow={() => setShowModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Maker Name</th>
              <th scope="col">Address</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {arraydMaker.map(({ name, address }, index) => (
              <tr key={name}>
                <td>{index + 1}</td>
                <td className="text-primary text-decoration-underline">
                  {name}
                </td>
                <td>{address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
