import { api2, db } from "../../FirebaseConfig";
import { get, ref, update, limitToLast } from "firebase/database";
import React, { useEffect, useState } from "react";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function RechargeTable() {
  const username = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const [arrayplan, setArrayPlan] = useState([]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        `${api2}/subscriber/planinfo/${username}?partnerId=${partnerId}`
      );
      if (response.status === 200) {
        const plans = response.data;
        const planArray = Object.keys(plans).map((key) => ({
          plankey: key,
          ...plans[key],
        }));
        setArrayPlan(planArray);
      } else {
        console.error("Failed to fetch plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      alert("Something went wrong while fetching plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [username]);

  const rollback = async (plankey) => {
    console.log(hasPermission);
    if (hasPermission("ROLLBACK_PLAN")) {
      try {
        const response = await axios.post(`${api2}/subscriber/rollback`, {
          plankey: plankey,
          username: username,
          contact: localStorage.getItem("contact"),
        });
        if (response.status === 200) {
          toast.success("Plan rolled back successfully", {
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          });
          fetchPlans();
        }
      } catch (error) {
        console.error("Error during rollback:", error);
        toast.error(error.message, {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      alert("Permission Denied!");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div style={{ overflowY: "auto" }}>
        <table style={{ borderCollapse: "collapse" }} className="table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Plan Name</th>
              <th scope="col">Amount</th>
              <th scope="col">ISP</th>
              <th scope="col">Start Date</th>
              <th scope="col">End Date</th>
              <th scope="col">Action</th>
              <th scope="col">Completed By</th>
              <th scope="col">Completed On</th>
              <th scope="col">Remarks</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arrayplan.length > 0 ? (
              arrayplan.map(
                (
                  {
                    planInfoKey,
                    planName,
                    planAmount,
                    isp,
                    action,
                    completedby,
                    activationDate,
                    expiryDate,
                    updatedAt,
                    remarks,
                  },
                  index
                ) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td
                      style={{ color: "green ", cursor: "pointer" }}
                      className="btn"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {planName}
                    </td>
                    <ul className="dropdown-menu">
                      <li onClick={() => rollback(planInfoKey)}>
                        RollBack Plan
                      </li>
                    </ul>
                    <td>{Number(planAmount).toFixed(2)}</td>
                    <td>{isp}</td>
                    <td>
                      {new Date(activationDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td>
                      {new Date(expiryDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td>{action}</td>
                    <td>{completedby}</td>
                    <td>
                      {new Date(updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td>{remarks}</td>
                  </tr>
                )
              )
            ) : (
              <td>No Information Found</td>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
