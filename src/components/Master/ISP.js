import React, { useState, useEffect } from "react";
import ISPModal from "./ISPModal";
import { ref, onValue } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";
import { toast } from "react-toastify";

export default function ISP() {
  const partnerId = localStorage.getItem("partnerId");
  const [showispmodal, setShowIspModal] = useState(false);
  const { hasPermission } = usePermissions();
  const [arrayisp, setArrayIsp] = useState([]);
  const ispRef = ref(db, "Master/ISPs");

  const fetchIsps = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/isps?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to load ISPs", { autoClose: 2000 });

      setArrayIsp(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchIsps();
  }, []);
  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          ISP - Internet Service Provider List
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_ISP")
              ? setShowIspModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-end mb-2"
        >
          Add New ISP
        </button>
      </div>

      <ISPModal show={showispmodal} unShow={() => setShowIspModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">ISP Name</th>
              <th scope="col">ISP Added Date</th>
              <th scope="col">No. of Users</th>
              <th scope="col">ISP Code</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arrayisp.map(({ name, code, date }, index) => (
              <tr key={code}>
                <td>{index + 1}</td>
                <td className="text-primary text-decoration-underline">
                  {name}
                </td>
                <td>
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td></td>
                <td>{code}</td>
              </tr>
            ))}
            <tr></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
