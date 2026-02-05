import React, { useEffect, useState, useRef } from "react";
import Due_Icon from "./drawables/rupeenew.png";
import Cust_Ledger from "./Cust_Ledger";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Cust_PayRecpt from "./Cust_PayRecpt";
import TicketsTable from "./TicketsTable";
import InventoryTable from "./InventoryTable";
import DebitCreditTable from "./DebitCreditTable";
import RemakFollowTable from "./RemakFollowTable";
import DocumentUpload from "./DocumentUpload";
import SubscriberDetails from "./SubscriberDetails";
import SubscriberLogs from "./SubscriberLogs";
import { ProgressBar } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { Modal } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import io from "socket.io-client"; // Fixed import
import {
  FaUser,
  FaHistory,
  FaReceipt,
  FaTicketAlt,
  FaBoxes,
  FaFileInvoiceDollar,
  FaComments,
  FaFolderOpen,
  FaListUl,
  FaCalendarAlt,
  FaSyncAlt,
  FaExchangeAlt,
  FaClipboardList,
  FaPencilAlt,
  FaGlobe,
} from "react-icons/fa";

export default function Subscriber() {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const socketRef = useRef(null);
  const username = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();
  const location = useLocation();

  const demoProfile = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  // --- ALL ORIGINAL STATES PRESERVED ---
  const [company, setCompany] = useState("");
  const [userid, setUserID] = useState("");
  const [fullName, setFullName] = useState("");
  const [expiryModal, setExpiryModal] = useState(false);
  const [ispModal, setISPModal] = useState(false);
  const [newExp, setNewExp] = useState("");
  const [newISP, setNewISP] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTerminated, setIsTeminated] = useState(false);
  const [cuPlanCode, setCuPlanCode] = useState({
    isPlanCode: false,
    plancode: "",
  });
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [activationDate, setActivationDate] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [remaindays, setRemainDays] = useState(0);
  const [status, setStatus] = useState("Active");
  const [dueamount, setDueAmount] = useState(0);
  const [profile, setProfile] = useState("");
  const [modalChangeplan, setModalChangePlan] = useState(false);
  const [renewmodal, setRenewModal] = useState(false);
  const [provide, setProvide] = useState([]);
  const [ispArray, setIspArray] = useState([]);
  const [isps, setIsps] = useState([]);
  const [plans, setPlans] = useState([]);
  const [changePlanData, setChangePlanData] = useState({
    provider: "All",
    isp: "All",
    planname: "",
    activationDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    planAmount: "",
    bandwidth: "",
    planperiod: "",
    periodtime: "",
    baseamount: "",
    remarks: "",
    plancode: "",
  });

  // --- LOGIC ---
  useEffect(() => {
    fetchData();
    fetchUserData();
  }, [username]);

  useEffect(() => {
    socketRef.current = io("https://api.justdude.in:5000");
    socketRef.current.on("subscribers-update", () => fetchUserData());
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [username]);

  const fetchUserData = async () => {
    try {
      const response = await API.get(`/subscriber?id=${username}`);
      if (response.data) {
        const u = response.data;
        setFullName(u.fullname || "");
        setCompany(u.company || "");
        setUserID(u.username || "");
        setIsTeminated(u.status === "Terminated");
        setPlanName(u.planName || "");
        setPlanAmount(u.planAmount || "");
        setActivationDate(u.activationDate || "");
        setExpiryDate(u.expiryDate || "");
        setIsp(u.isp || "");
        setDueAmount(u.dueAmount || 0);
        setCuPlanCode({ isPlanCode: !!u.plancode, plancode: u.plancode || "" });
        setProfile(u.profilePhoto);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (expiryDate) {
      const daysDiff = Math.ceil(
        (new Date(expiryDate).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      );
      setStatus(
        isTerminated ? "Terminated" : daysDiff < 0 ? "Inactive" : "Active",
      );
      setRemainDays(daysDiff);
    }
  }, [expiryDate, isTerminated]);

  const updateExpirationDate = (newActivationDate, duration, unit) => {
    const date = new Date(newActivationDate);

    // Extend the date based on the unit from Firebase
    if (unit === "Months") {
      date.setMonth(date.getMonth() + Number(duration));
    } else if (unit === "Years") {
      date.setFullYear(date.getFullYear() + Number(duration));
    } else if (unit === "Days") {
      date.setDate(date.getDate() + Number(duration));
    }

    const expDate = new Date(date.setDate(date.getDate() - 1))
      .toISOString()
      .split("T")[0];
    return expDate;
  };

  const savePlan = async (text) => {
    if (
      changePlanData.provider === "All" ||
      changePlanData.isp === "All" ||
      changePlanData.planAmount === "" ||
      changePlanData.planname === ""
    ) {
      toast.error("Something went wrong", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const renewData = {
        subscriber: username,
        partnerId: partnerId,
        plancode: changePlanData.plancode,
        renewDate: changePlanData.activationDate,
        remarks: changePlanData.remarks,
        action: text,
        expiryDate: changePlanData.expiryDate,
        completedby: localStorage.getItem("contact"),
        bandwidth: changePlanData.bandwidth,
        provider: changePlanData.provider,
        isp: changePlanData.isp,
        planname: changePlanData.planname,
        planamount: changePlanData.planAmount,
      };

      const response = await API.put(
        `/subscriber/${username}/renew`,
        renewData,
      );

      if (response.status !== 200)
        return toast.error("Failed to Renew Plan", { autoClose: 2000 });

      toast.success(response.data.message, { autoClose: 2000 });
    } catch (e) {
      toast.error("Failed to Update Plan", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log(e);
    } finally {
      setChangePlanData({
        provider: "All",
        isp: "",
        planname: "",
        activationDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        planAmount: "",
        bandwidth: "",
        planperiod: "",
        periodtime: "",
        baseamount: "",
        remarks: "",
        plancode: "",
      });
      setModalChangePlan(false);
      setRenewModal(false);
      fetchUserData();
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      const ispResponse = await API.get(
        `/subscriber/isps?partnerId=${partnerId}`,
      );
      const planResponse = await API.get(
        `/addnew/broadbandplan?partnerId=${partnerId}`,
      );

      if (ispResponse.status !== 200 || planResponse.status !== 200) {
        console.log("One or More axios Issue for fetch");
        return;
      }

      const ispData = ispResponse.data;
      if (ispData) {
        setIspArray(ispData);
      }

      const planData = planResponse.data.plans;

      if (planData) {
        const array = [];
        Object.keys(planData).forEach((key) => {
          const plans = planData[key];
          const planKey = key;
          array.push({ ...plans, planKey });
        });

        const provider = [...new Set(array.map((data) => data.provider))];
        const isp = [...new Set(array.map((data) => data.isp))];

        setProvide(provider);
        setIsps(isp);
        setPlans(array);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRenew = () => {
    if (!hasPermission("RENEW_PLAN")) return toast.error("Permission Denied!");
    if (cuPlanCode.isPlanCode) {
      setRenewModal(true);
      const cuObj = plans.find((data) => data.code === cuPlanCode.plancode);
      if (cuObj) {
        const expDate = new Date(expiryDate);
        expDate.setDate(expDate.getDate() + 1);

        setChangePlanData({
          ...changePlanData,
          provider: cuObj.provider,
          isp: isp,
          planname: cuObj.planname,
          bandwidth: cuObj.bandwidth,
          expiryDate: updateExpirationDate(
            new Date(expDate).toISOString().split("T")[0],
            cuObj.periodtime,
            cuObj.planperiod,
          ),
          planAmount: planAmount,
          planperiod: cuObj.planperiod,
          periodtime: cuObj.periodtime,
          plancode: cuPlanCode.plancode,
        });
      }
    } else {
      toast.error("Cannot Renew Plan without a valid Plan Code!", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="crm-main-container">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER SECTION */}
      <div className="crm-header-card shadow">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="crm-avatar-box">
                <img
                  src={profile || demoProfile}
                  onError={(e) => (e.target.src = demoProfile)}
                  className="crm-avatar-img"
                  alt="Profile"
                />
                <span
                  className={`crm-indicator ${status.toLowerCase()}`}
                ></span>
              </div>
            </div>
            <div className="col text-white">
              <h2 className="fw-bold mb-0">{fullName || "Subscriber"}</h2>
              <p className="opacity-75 mb-2">
                <FaUser size={12} /> {userid} | {company}
              </p>

              {/* MOBILE ONLY DUE & ACTIONS */}
              <div className="d-md-none mb-3">
                <div className="d-flex align-items-center justify-content-between bg-black bg-opacity-10 p-2 rounded-3 mb-2">
                  <div className="d-flex align-items-center">
                    <img
                      src={Due_Icon}
                      style={{
                        height: "20px",
                        filter: "brightness(0) invert(1)",
                      }}
                      alt="Due"
                    />
                    <span className="ms-2 fw-bold">₹{dueamount}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm crm-action-btn py-1"
                      onClick={handleRenew}
                    >
                      <FaSyncAlt size={10} /> Renew
                    </button>
                    <button
                      className="btn btn-sm crm-action-btn py-1"
                      onClick={() => setModalChangePlan(true)}
                    >
                      <FaExchangeAlt size={10} /> Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-auto">
                  <div className="crm-stat-item">
                    <small>PLAN</small>
                    <h6>{`${planName}@${planAmount || "N/A"}` || "N/A"}</h6>
                  </div>
                </div>
                {/* ... (Keep other stat items: Activation, Expiry, ISP, Remain Days) */}
                <div className="col-auto">
                  <div className="crm-stat-item">
                    <small>ACTIVE DATE</small>
                    <h6>
                      {activationDate
                        ? new Date(activationDate).toLocaleDateString("en-GB")
                        : "---"}
                    </h6>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="crm-stat-item">
                    <small>
                      EXPIRY DATE
                      <FaPencilAlt
                        onClick={() => setExpiryModal(true)}
                        className="ms-2 mb-1"
                        style={{ cursor: "pointer" }}
                        size={13}
                      />
                    </small>

                    <h6>
                      {expiryDate
                        ? new Date(expiryDate).toLocaleDateString("en-GB")
                        : "---"}
                    </h6>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="crm-stat-item">
                    <small>
                      ISP
                      <FaPencilAlt
                        onClick={() => setISPModal(true)}
                        className="ms-2 mb-1"
                        style={{ cursor: "pointer" }}
                        size={13}
                      />
                    </small>
                    <h6>{isp ? isp : "---"}</h6>
                  </div>
                </div>
                <div className="col-auto">
                  <div className="crm-stat-item">
                    <small>Remain Days</small>
                    <h6>{remaindays ? remaindays : "---"}</h6>
                  </div>
                </div>
              </div>
            </div>

            {/* DESKTOP ONLY DUE & ACTIONS (Keep as is) */}
            <div className="col-md-4 col-lg-3 text-end d-none d-md-block">
              <div className="crm-due-badge mb-3">
                <img src={Due_Icon} className="due-icon" alt="Due" />
                <div className="text-start ms-2">
                  <small className="d-block opacity-75 text-white">
                    Total Due
                  </small>
                  <h3 className="fw-bold mb-0 text-white">₹{dueamount}</h3>
                </div>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button className="btn crm-action-btn" onClick={handleRenew}>
                  <FaSyncAlt /> Renew
                </button>
                <button
                  className="btn crm-action-btn"
                  onClick={() => setModalChangePlan(true)}
                >
                  <FaExchangeAlt /> Change
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION & CONTENT */}
      <div className="container-fluid mt-3">
        <div className="row g-3">
          {/* SIDEBAR / MOBILE NAV */}
          <div className="col-12 col-lg-3">
            <div className="crm-nav-card shadow-sm">
              <div className="crm-nav-wrapper">
                <div className="nav-title d-none d-lg-block">MAIN MENU</div>
                <Link
                  to="/dashboard/subscriber"
                  className={`crm-nav-link ${location.pathname === "/dashboard/subscriber" ? "active" : ""}`}
                >
                  <FaListUl className="me-2" /> Summary
                </Link>
                <div
                  onClick={() =>
                    navigate("/dashboard/subscriber/ledger", {
                      state: { username },
                    })
                  }
                  className={`crm-nav-link ${location.pathname.includes("ledger") ? "active" : ""}`}
                >
                  <FaHistory className="me-2" /> Ledger
                </div>
                <div
                  onClick={() =>
                    navigate("/dashboard/subscriber/paymentreceipt", {
                      state: { username },
                    })
                  }
                  className={`crm-nav-link ${location.pathname.includes("paymentreceipt") ? "active" : ""}`}
                >
                  <FaReceipt className="me-2" /> Payments
                </div>
                <Link
                  to="/dashboard/subscriber/tickets"
                  className={`crm-nav-link ${location.pathname.includes("tickets") ? "active" : ""}`}
                >
                  <FaTicketAlt className="me-2" /> Tickets
                </Link>
                <Link
                  to="/dashboard/subscriber/inventory"
                  className={`crm-nav-link ${location.pathname.includes("inventory") ? "active" : ""}`}
                >
                  <FaBoxes className="me-2" /> Inventory
                </Link>
                <Link
                  to="/dashboard/subscriber/dcnote"
                  className={`crm-nav-link ${location.pathname.includes("dcnote") ? "active" : ""}`}
                >
                  <FaFileInvoiceDollar className="me-2" /> DC Notes
                </Link>
                <Link
                  to="/dashboard/subscriber/remarkfollow"
                  className={`crm-nav-link ${location.pathname.includes("remarkfollow") ? "active" : ""}`}
                >
                  <FaComments className="me-2" /> Remarks
                </Link>
                <Link
                  to="/dashboard/subscriber/documents"
                  className={`crm-nav-link ${location.pathname.includes("documents") ? "active" : ""}`}
                >
                  <FaFolderOpen className="me-2" /> Documents
                </Link>
                <Link
                  to="/dashboard/subscriber/logsubs"
                  className={`crm-nav-link ${location.pathname.includes("logsubs") ? "active" : ""}`}
                >
                  <FaClipboardList className="me-2" /> Activity Logs
                </Link>
              </div>
            </div>
          </div>

          {/* VIEWPORT */}
          <div className="col-12 col-lg-9">
            <div className="crm-content-card shadow-sm bg-white">
              <Routes>
                <Route path="/*" element={<SubscriberDetails />} />
                <Route path="ledger/*" element={<Cust_Ledger />} />
                <Route path="paymentreceipt/*" element={<Cust_PayRecpt />} />
                <Route path="tickets/*" element={<TicketsTable />} />
                <Route path="inventory/*" element={<InventoryTable />} />
                <Route path="dcnote/*" element={<DebitCreditTable />} />
                <Route path="remarkfollow/*" element={<RemakFollowTable />} />
                <Route path="documents/*" element={<DocumentUpload />} />
                <Route path="logsubs" element={<SubscriberLogs />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>

      <Modal
        className="crm-modern-modal"
        centered
        show={expiryModal}
        onHide={() => setExpiryModal(false)}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">
            <FaCalendarAlt className="me-2 text-primary" /> Update Expiry Date
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="container-fluid px-0">
            <div className="row g-3">
              <div className="col-12">
                <label className="crm-label-sm">NEW EXPIRY DATE</label>
                <input
                  className="form-control crm-input"
                  type="date"
                  value={newExp}
                  onChange={(e) => setNewExp(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <div className="d-flex w-100 gap-2">
            <button
              onClick={() => setExpiryModal(false)}
              className="btn btn-light fw-bold flex-grow-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await API.put(
                    `subscriber/udpateconnectioninfo/${username}`,
                    {
                      expiryDate: newExp,
                    },
                  );
                  if (response.status === 200) {
                    toast.success("Expiry Date Updated Successfully", {
                      autoClose: 2000,
                    });
                    fetchUserData();
                    setExpiryModal(false);
                  } else {
                    toast.error("Failed to Update Expiry Date", {
                      autoClose: 2000,
                    });
                  }
                } catch (e) {
                  toast.error("Error Updating Expiry Date", {
                    autoClose: 2000,
                  });
                  console.log(e);
                }
              }}
              className="btn crm-btn-gradient fw-bold flex-grow-1 py-2"
            >
              Update Expiry
            </button>
          </div>
        </Modal.Footer>
        <style>{`
          .crm-modern-modal .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 15px 50px rgba(0,0,0,0.1);
          }
          .crm-label-sm {
            font-size: 0.7rem;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
          }
          .crm-input {
            border-radius: 10px;
            padding: 10px 15px;
            border: 1px solid #e2e8f0;
            font-weight: 500;
            color: #1e293b;
          }
          .crm-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .crm-btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: transform 0.2s;
          }
          .crm-btn-gradient:hover {
            color: white;
            transform: translateY(-2px);
            opacity: 0.9;
          }
        `}</style>
      </Modal>

            <Modal
        className="crm-modern-modal"
        centered
        show={ispModal}
        onHide={() => setISPModal(false)}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">
            <FaGlobe className="me-2 text-primary" /> Update ISP
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="container-fluid px-0">
            <div className="row g-3">
              <div className="col-12">
                <label className="crm-label-sm">ISP (Internet Service Provider)</label>
                <select
                  className="form-control crm-input"
                  type="text"
                  value={newISP}
                  onChange={(e) => setNewISP(e.target.value)}
                >
                  <option value="" disabled>Select ISP</option>
                  {ispArray.map((ispItem, index) => (
                    <option key={index} value={ispItem}>
                      {ispItem}
                    </option>
                  ))}

                </select>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <div className="d-flex w-100 gap-2">
            <button
              onClick={() => setExpiryModal(false)}
              className="btn btn-light fw-bold flex-grow-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  const response = await API.put(
                    `subscriber/udpateconnectioninfo/${username}`,
                    {
                      isp: newISP,
                    },
                  );
                  if (response.status === 200) {
                    toast.success("ISP Updated Successfully", {
                      autoClose: 2000,
                    });
                    fetchUserData();
                    setISPModal(false);
                  } else {
                    toast.error("Failed to Update ISP", {
                      autoClose: 2000,
                    });
                  }
                } catch (e) {
                  toast.error("Error Updating ISP", {
                    autoClose: 2000,
                  });
                  console.log(e);
                }
              }}
              className="btn crm-btn-gradient fw-bold flex-grow-1 py-2"
            >
              Update
            </button>
          </div>
        </Modal.Footer>
        <style>{`
          .crm-modern-modal .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 15px 50px rgba(0,0,0,0.1);
          }
          .crm-label-sm {
            font-size: 0.7rem;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
          }
          .crm-input {
            border-radius: 10px;
            padding: 10px 15px;
            border: 1px solid #e2e8f0;
            font-weight: 500;
            color: #1e293b;
          }
          .crm-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .crm-btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: transform 0.2s;
          }
          .crm-btn-gradient:hover {
            color: white;
            transform: translateY(-2px);
            opacity: 0.9;
          }
        `}</style>
      </Modal>

      {/* REDESIGNED RENEWAL MODAL */}
      <Modal
        show={renewmodal}
        onHide={() => setRenewModal(false)}
        centered
        className="crm-modern-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">
            <FaSyncAlt className="me-2 text-primary" /> Renew Customer Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="container-fluid px-0">
            {/* Current Plan Display */}
            <div className="mb-4 p-3 rounded-3 bg-light border">
              <label className="crm-label-sm">CURRENT ACTIVE PLAN</label>
              <div className="fw-bold text-primary h5 mb-0">
                {changePlanData.planname || "No Plan Selected"}
              </div>
            </div>

            <div className="row g-3">
              {/* Activation Date */}
              <div className="col-md-6">
                <label className="crm-label-sm">ACTIVATION DATE</label>
                <input
                  className="form-control crm-input"
                  type="date"
                  defaultValue={
                    new Date(
                      new Date(expiryDate).setDate(
                        new Date(expiryDate).getDate() + 1,
                      ),
                    )
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      activationDate: e.target.value,
                      expiryDate: updateExpirationDate(
                        e.target.value,
                        changePlanData.periodtime,
                        changePlanData.planperiod,
                      ),
                    })
                  }
                />
              </div>

              {/* Expiry Date */}
              <div className="col-md-6">
                <label className="crm-label-sm">NEW EXPIRY DATE</label>
                <input
                  value={changePlanData.expiryDate}
                  className="form-control crm-input bg-light"
                  type="date"
                  disabled
                />
              </div>

              {/* Remarks */}
              <div className="col-12">
                <label className="crm-label-sm">REMARKS</label>
                <textarea
                  placeholder="Enter renewal remarks..."
                  rows="2"
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      remarks: e.target.value,
                    })
                  }
                  className="form-control crm-input"
                ></textarea>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <div className="d-flex w-100 gap-2">
            <button
              onClick={() => setRenewModal(false)}
              className="btn btn-light fw-bold flex-grow-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={(e) => savePlan("Renewal")}
              className="btn crm-btn-gradient fw-bold flex-grow-1 py-2"
            >
              Confirm Renewal
            </button>
          </div>
        </Modal.Footer>

        <style>{`
          .crm-modern-modal .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 15px 50px rgba(0,0,0,0.1);
          }
          .crm-label-sm {
            font-size: 0.7rem;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
          }
          .crm-input {
            border-radius: 10px;
            padding: 10px 15px;
            border: 1px solid #e2e8f0;
            font-weight: 500;
            color: #1e293b;
          }
          .crm-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .crm-btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: transform 0.2s;
          }
          .crm-btn-gradient:hover {
            color: white;
            transform: translateY(-2px);
            opacity: 0.9;
          }
        `}</style>
      </Modal>

      {/* REDESIGNED CHANGE PLAN MODAL */}
      <Modal
        show={modalChangeplan}
        onHide={() => setModalChangePlan(false)}
        centered
        className="crm-modern-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">
            <FaExchangeAlt className="me-2 text-primary" /> Change Customer Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="container-fluid px-0">
            <div className="row g-3">
              {/* Provider Selection */}
              <div className="col-md-6">
                <label className="crm-label-sm">SELECT PROVIDER *</label>
                <select
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      provider: e.target.value,
                    })
                  }
                  className="form-select crm-input"
                >
                  <option>Choose...</option>
                  {provide.map((data, index) => (
                    <option key={index}>{data}</option>
                  ))}
                </select>
              </div>

              {/* ISP Selection */}
              <div className="col-md-6">
                <label className="crm-label-sm">SELECT ISP *</label>
                <select
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      isp: e.target.value,
                    })
                  }
                  className="form-select crm-input"
                >
                  <option>Choose...</option>
                  {ispArray.map((data, index) => (
                    <option key={index} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Selection */}
              <div className="col-12">
                <label className="crm-label-sm">SELECT PLAN *</label>
                <select
                  onChange={(e) => {
                    const selectKey = e.target.value;
                    const selectedObj = plans.find(
                      (data) => data.code === selectKey,
                    );
                    if (selectedObj) {
                      setChangePlanData({
                        ...changePlanData,
                        provider: selectedObj.provider,
                        isp: changePlanData.isp,
                        planAmount: selectedObj.planamount,
                        planname: selectedObj.planname,
                        bandwidth: selectedObj.bandwidth,
                        periodtime: selectedObj.periodtime,
                        planperiod: selectedObj.planperiod,
                        expiryDate: updateExpirationDate(
                          changePlanData.activationDate,
                          selectedObj.periodtime,
                          selectedObj.planperiod,
                        ),
                        baseamount: selectedObj.planamount,
                        plancode: selectedObj.code,
                      });
                    }
                  }}
                  className="form-select crm-input"
                >
                  <option>Choose...</option>
                  {/* Note: I'm using plans.filter as a fallback for filterPlan logic */}
                  {plans
                    .filter(
                      (p) =>
                        (changePlanData.provider === "All" ||
                          p.provider === changePlanData.provider) &&
                        (changePlanData.isp === "All" ||
                          p.isp === changePlanData.isp),
                    )
                    .map((data, index) => (
                      <option key={index} value={data.code}>
                        {data.planname} ({data.bandwidth})
                      </option>
                    ))}
                </select>
              </div>

              {/* Activation Date */}
              <div className="col-md-6">
                <label className="crm-label-sm">ACTIVATION DATE *</label>
                <input
                  defaultValue={changePlanData.activationDate}
                  onChange={(e) => {
                    setChangePlanData({
                      ...changePlanData,
                      activationDate: e.target.value,
                      expiryDate: updateExpirationDate(
                        e.target.value,
                        changePlanData.periodtime,
                        changePlanData.planperiod,
                      ),
                    });
                  }}
                  className="form-control crm-input"
                  type="date"
                />
              </div>

              {/* New Expiry Date */}
              <div className="col-md-6">
                <label className="crm-label-sm">NEW EXPIRY DATE</label>
                <input
                  value={changePlanData.expiryDate}
                  className="form-control crm-input bg-light"
                  type="date"
                  disabled
                />
              </div>

              {/* Base Amount */}
              <div className="col-md-6">
                <label className="crm-label-sm">BASE AMOUNT</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    ₹
                  </span>
                  <input
                    value={changePlanData.baseamount}
                    className="form-control crm-input bg-light border-start-0"
                    type="text"
                    disabled
                  />
                </div>
              </div>

              {/* Custom Amount */}
              <div className="col-md-6">
                <label className="crm-label-sm">CUSTOM AMOUNT *</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    ₹
                  </span>
                  <input
                    defaultValue={changePlanData.planAmount}
                    onChange={(e) =>
                      setChangePlanData({
                        ...changePlanData,
                        planAmount: e.target.value,
                      })
                    }
                    className="form-control crm-input border-start-0"
                    type="text"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="col-12">
                <label className="crm-label-sm">REMARKS</label>
                <textarea
                  placeholder="Reason for plan change..."
                  rows="2"
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      remarks: e.target.value,
                    })
                  }
                  className="form-control crm-input"
                ></textarea>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <div className="d-flex w-100 gap-2">
            <button
              onClick={() => setModalChangePlan(false)}
              className="btn btn-light fw-bold flex-grow-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={() => savePlan("Plan Change")}
              className="btn crm-btn-gradient fw-bold flex-grow-1 py-2"
            >
              Update Plan
            </button>
          </div>
        </Modal.Footer>
        <style>{`
          .crm-modern-modal .modal-content {
            border-radius: 20px;
            border: none;
            box-shadow: 0 15px 50px rgba(0,0,0,0.1);
          }
          .crm-label-sm {
            font-size: 0.7rem;
            font-weight: 800;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
          }
          .crm-input {
            border-radius: 10px;
            padding: 10px 15px;
            border: 1px solid #e2e8f0;
            font-weight: 500;
            color: #1e293b;
          }
          .crm-input:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .crm-btn-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            transition: transform 0.2s;
          }
          .crm-btn-gradient:hover {
            color: white;
            transform: translateY(-2px);
            opacity: 0.9;
          }
        `}</style>
      </Modal>

      <style>{`
        .crm-main-container { background: #f0f2f5; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        
        .crm-header-card { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          padding: 35px 20px; border-radius: 0 0 20px 20px;
        }

        .crm-avatar-box { position: relative; width: 100px; height: 100px; }
        .crm-avatar-img { width: 100%; height: 100%; border-radius: 15px; object-fit: cover; border: 3px solid rgba(255,255,255,0.3); background: white; }
        .crm-indicator { position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #764ba2; }
        .crm-indicator.active { background: #2ecc71; }
        .crm-indicator.inactive { background: #e74c3c; }

        .crm-stat-item { border-left: 2px solid rgba(255,255,255,0.2); padding-left: 12px; }
        .crm-stat-item small { display: block; font-size: 0.65rem; opacity: 0.8; letter-spacing: 0.5px; }
        .crm-stat-item h6 { font-weight: 700; margin-bottom: 0; }

        .crm-due-badge { background: rgba(0,0,0,0.15); padding: 10px 20px; border-radius: 12px; display: inline-flex; align-items: center; }
        .due-icon { height: 35px; filter: brightness(0) invert(1); }
        .crm-action-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white; font-weight: 600; font-size: 0.85rem; }
        .crm-action-btn:hover { background: white; color: #764ba2; }

        /* Navigation Responsive Logic */
        .crm-nav-card { background: white; border-radius: 15px; overflow: hidden; }
        .nav-title { padding: 15px 20px; font-weight: 800; font-size: 0.75rem; color: #8a94ad; }

        @media (max-width: 991px) {
          .crm-nav-wrapper { display: flex; overflow-x: auto; padding: 10px; gap: 8px; scrollbar-width: none; }
          .crm-nav-wrapper::-webkit-scrollbar { display: none; }
          .crm-nav-link { 
            white-space: nowrap; flex: 0 0 auto; 
            padding: 8px 16px !important; border-radius: 10px !important; 
            background: #f8fafc; color: #64748b !important; border: none !important;
          }
          .crm-nav-link.active { background: #667eea !important; color: white !important; }
        }

        @media (min-width: 992px) {
          .crm-nav-link { 
            display: flex; align-items: center; padding: 12px 20px; 
            color: #4a5568; font-weight: 600; text-decoration: none !important; 
            border-left: 4px solid transparent; transition: 0.2s; cursor: pointer;
          }
          .crm-nav-link:hover { background: #f7fafc; color: #667eea; }
          .crm-nav-link.active { background: #f0f3ff; color: #667eea; border-left-color: #667eea; }
        }

        .crm-content-card { border-radius: 15px; min-height: 60vh; }
      `}</style>
    </div>
  );
}
