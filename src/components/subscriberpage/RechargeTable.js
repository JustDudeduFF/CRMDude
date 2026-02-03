import React, { useEffect, useState } from "react";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaUndo, FaCalendarAlt, FaHistory, FaNetworkWired, FaUserCheck, FaInfoCircle } from 'react-icons/fa';

export default function RechargeTable() {
  const username = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const [arrayplan, setArrayPlan] = useState([]);

  const fetchPlans = async () => {
    try {
      const response = await API.get(
        `/subscriber/planinfo/${username}?partnerId=${partnerId}`
      );
      if (response.status === 200) {
        const plans = response.data;
        const planArray = Object.keys(plans).map((key) => ({
          plankey: key,
          ...plans[key],
        }));
        setArrayPlan(planArray);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plan history");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [username]);

  const rollback = async (plankey) => {
    if (hasPermission("ROLLBACK_PLAN")) {
      try {
        const response = await API.post(`/subscriber/rollback`, {
          plankey: plankey,
          username: username,
          contact: localStorage.getItem("contact"),
        });
        if (response.status === 200) {
          toast.success("Plan rolled back successfully");
          fetchPlans();
        }
      } catch (error) {
        toast.error(error.message || "Rollback failed");
      }
    } else {
      toast.warning("Permission Denied: ROLLBACK_PLAN required");
    }
  };

  return (
    <div className="recharge-master-container">
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
      
      <div className="recharge-card shadow-sm">
        <div className="recharge-header">
          <div className="header-left">
            <div className="icon-badge">
              <FaHistory />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Recharge History</h5>
              <small className="text-muted">Tracking all plans and rollbacks for {username}</small>
            </div>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="recharge-modern-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Plan Details</th>
                <th>Amount</th>
                <th><FaNetworkWired className="me-1"/> ISP</th>
                <th><FaCalendarAlt className="me-1"/> Validity</th>
                <th>Action Type</th>
                <th>Execution</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {arrayplan.length > 0 ? (
                arrayplan.map((plan, index) => (
                  <tr key={index}>
                    <td data-label="S.No." className="text-center-desktop text-muted fw-bold">{index + 1}</td>
                    
                    <td data-label="Plan Details">
                      <div className="dropdown">
                        <span 
                          className="plan-name-link"
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          {plan.planName}
                        </span>
                        <ul className="dropdown-menu shadow border-0 p-2">
                          <li>
                            <button 
                              className="dropdown-item rounded rollback-btn" 
                              onClick={() => rollback(plan.planInfoKey)}
                            >
                              <FaUndo className="me-2 small" /> Rollback Plan
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>

                    <td data-label="Amount" className="fw-bold text-dark">₹{Number(plan.planAmount).toFixed(2)}</td>
                    
                    <td data-label="ISP"><span className="isp-tag">{plan.isp}</span></td>
                    
                    <td data-label="Validity">
                      <div className="validity-stack">
                        <span className="v-start">S: {new Date(plan.activationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                        <span className="v-end">E: {new Date(plan.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                      </div>
                    </td>

                    <td data-label="Action Type">
                      <span className={`action-badge ${plan.action?.toLowerCase()}`}>
                        {plan.action}
                      </span>
                    </td>

                    <td data-label="Execution">
                      <div className="exec-info">
                        <span className="exec-by"><FaUserCheck className="me-1" />{plan.completedby}</span>
                        <span className="exec-at">{new Date(plan.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                      </div>
                    </td>

                    <td data-label="Remarks" className="remarks-cell">
                      <div className="remarks-wrapper" title={plan.remarks}>
                        <FaInfoCircle className="me-1 text-muted" /> {plan.remarks || "---"}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">No Recharge History Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .recharge-master-container {
          padding: 15px;
          background: #f8fafc;
        }

        .recharge-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .recharge-header {
          padding: 18px 25px;
          border-bottom: 1px solid #f1f5f9;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .icon-badge {
          width: 40px;
          height: 40px;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .recharge-modern-table {
          width: 100%;
          border-collapse: collapse;
        }

        .recharge-modern-table thead th {
          background: #f8fafc;
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }

        .recharge-modern-table tbody td {
          padding: 14px 20px;
          font-size: 13px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .plan-name-link {
          color: #4f46e5;
          font-weight: 700;
          cursor: pointer;
        }

        .isp-tag {
          background: #f1f5f9;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
        }

        .validity-stack {
          display: flex;
          flex-direction: column;
          font-size: 11px;
          font-weight: 600;
        }

        .v-start { color: #059669; }
        .v-end { color: #dc2626; }

        .action-badge {
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 10px;
          font-weight: 800;
        }
        .action-badge.recharge { background: #ecfdf5; color: #059669; }
        .action-badge.rollback { background: #fff1f2; color: #e11d48; }

        .exec-info {
          display: flex;
          flex-direction: column;
        }

        .exec-by { font-weight: 700; color: #1e293b; }
        .exec-at { font-size: 11px; color: #94a3b8; }

        .remarks-wrapper {
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* RESPONSIVE CSS */
        @media (max-width: 1100px) {
          .recharge-modern-table thead {
            display: none; /* Hide headers on mobile */
          }

          .recharge-modern-table tbody tr {
            display: block;
            border-bottom: 8px solid #f1f5f9;
            padding: 10px 0;
          }

          .recharge-modern-table tbody td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            text-align: right;
            border-bottom: 1px solid #f1f5f9;
            padding: 12px 20px;
            width: 100%;
            box-sizing: border-box;
          }

          .recharge-modern-table tbody td:last-child {
            border-bottom: none;
          }

          .recharge-modern-table tbody td::before {
            content: attr(data-label); /* Show header from data-label */
            font-weight: 800;
            color: #64748b;
            font-size: 11px;
            text-transform: uppercase;
            text-align: left;
            margin-right: 10px;
          }

          .remarks-wrapper {
            max-width: 180px;
          }

          .validity-stack {
            align-items: flex-end;
          }

          .exec-info {
            align-items: flex-end;
          }
        }

        @media (min-width: 1101px) {
            .text-center-desktop { text-align: center; }
        }
      `}</style>
    </div>
  );
}