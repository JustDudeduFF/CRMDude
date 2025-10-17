import React, { useEffect, useState, useRef } from "react";
import Due_Icon from "./drawables/rupeenew.png";
import Cust_Ledger from "./Cust_Ledger";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
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
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { Modal, Spinner } from "react-bootstrap";
import { api2 } from "../../FirebaseConfig";
import { io } from "socket.io-client";
import "./Subscriber.css";

export default function Subscriber() {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const socketRef = useRef(null);
  const username = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();

  //Use States For Fill All Details
  const [company, setCompany] = useState("");
  const [userid, setUserID] = useState("");
  const [fullName, setFullName] = useState("");
  const [expiryModal, setExpiryModal] = useState(false);
  const [newExp, setNewExp] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTerminated, setIsTeminated] = useState(false);
  const [terminateRemark, setTerminateRemark] = useState("");
  const [temptermstatus, setTempTermStatus] = useState();
  const [cuPlanCode, setCuPlanCode] = useState({
    isPlanCode: false,
    plancode: "",
  });

  const [subscriberChanged, setSubscriberChanged] = useState(false);

  // Connection Details
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [activationDate, setActivationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(null);
  const [registerationdate, setRegistrationDate] = useState("");
  const [remaindays, setRemainDays] = useState(0);
  const [status, setStatus] = useState("Active");
  const [dueamount, setDueAmount] = useState(0);
  const [profile, setProfile] = useState("");
  const [ispChangeModal, setIspChangeModal] = useState(false);
  const [ispArray, setIspArray] = useState([]);
  const [selectedIsp, setSelectedIsp] = useState("");
  const [showTerimate, setShowTerminate] = useState(false);

  const [modalChangeplan, setModalChangePlan] = useState(false);
  const [renewmodal, setRenewModal] = useState(false);
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

  const [provide, setProvide] = useState([]);
  const [isps, setIsps] = useState([]);
  const [plans, setPlans] = useState([]);

  const [filterPlan, setFilterPlans] = useState([]);

  const [loader, setLoader] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  useEffect(() => {
    socketRef.current = io("https://api.justdude.in:5000");

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    socketRef.current.on("subscribers-update", () => {
      fetchUserData();
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("🔌 Disconnected from WebSocket server");
      }
    };
  }, [username]);

  // useEffect(() => {
  //     fetchUserData();
  // }, [username])
  // ...existing code...
  // Fix: Define fetchUserData to fetch and set user details from backend
  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${api2}/subscriber?id=${username}`);
      if (response.data) {
        const userData = response.data;
        if (!userData) {
          // Handle null userData gracefully
          setFullName("");
          setCompany("");
          setUserID("");
          setRegistrationDate("");
          setIsTeminated(false);
          setPlanName("");
          setPlanAmount("");
          setActivationDate("");
          setExpiryDate("");
          setIsp("");
          setDueAmount(0);
          setCuPlanCode({ isPlanCode: false, plancode: "" });
          return;
        }
        setFullName(userData.fullname || "");
        setCompany(userData.company || "");
        setUserID(userData.username || "");
        setRegistrationDate(userData.createdAt || "");
        setIsTeminated(userData.status == "Terminated" || false);
        setPlanName(userData.planName || "");
        setPlanAmount(userData.planAmount || "");
        setActivationDate(userData.activationDate === '' ? "2000-01-01" : userData.activationDate);
        setExpiryDate(userData.expiryDate === '' ? "2000-01-01" : userData.expiryDate);
        setIsp(userData.isp || "");
        setDueAmount(userData.dueAmount || 0);
        setCuPlanCode({
          isPlanCode: !!userData.plancode,
          plancode: userData.plancode || "",
        });
        setProfile(userData.profilePhoto);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchData = async () => {
    try {
      const ispResponse = await axios.get(
        api2 + "/subscriber/isps?partnerId=" + partnerId
      );
      const planResponse = await axios.get(
        api2 + "/addnew/broadbandplan?partnerId=" + partnerId
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

  useEffect(() => {
    fetchData();
  }, [username]);

  useEffect(() => {
    if (expiryDate) {
      const calculateDaysBetween = () => {
        const start = new Date();
        const end = new Date(expiryDate);

        // Calculate the difference in time
        const timeDiff = end.getTime() - start.getTime();

        // Convert time difference from milliseconds to days
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysDiff < 0) {
          setStatus("Inactive");
        } else {
          setStatus("Active");
        }

        if (isTerminated) setStatus("Terminated");

        setRemainDays(daysDiff);
      };

      calculateDaysBetween();
    }
  }, [expiryDate]);

  const teminateUser = async () => {
    const terminate = {
      isTeminated: temptermstatus,
      terminateRemark,
    };

    try {
      await axios.put(
        `${api2}/subscriber/updatesubsindividual/${username}`,
        terminate
      );
      toast.success(`User Status Updated`, {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const updateISP = async () => {
    setIspChangeModal(false);
    setLoader(true);
    const ispData = {
      isp: selectedIsp,
    };
    try {
      await axios.put(
        `${api2}/subscriber/udpateconnectioninfo/${username}`,
        ispData
      );
      toast.success(`ISP Changed`, {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    let filterArray = plans;

    if (changePlanData.provider !== "All") {
      filterArray = filterArray.filter(
        (data) => data.provider === changePlanData.provider
      );
    }

    setFilterPlans(filterArray);
  }, [changePlanData]);

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

      const response = await axios.put(
        `${api2}/subscriber/${username}/renew`,
        renewData
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

  // Fix: Define updateExpiry for expiry modal in correct scope
  const updateExpiry = async () => {
    setLoading(true);
    try {
      await axios.put(`${api2}/subscriber/udpateconnectioninfo/${username}`, {
        expiryDate: newExp,
      });
      setExpiryDate(newExp);
      toast.success("Expiry date updated!", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setExpiryModal(false);
    } catch (error) {
      toast.error("Failed to update expiry date", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="subscriber-container">
      {loader && (
        <div className="subscriber-spinner-wrapper">
          <div className="subscriber-spinner-content">
            <ProgressBar
              height="80"
              width="80"
              radius="9"
              color="blue"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <br></br>
            <label className="subscriber-spinner-label">Fetching Data...</label>
          </div>
        </div>
      )}
      <div className="subscriber-main-content">
        <div className="subscriber-profile-section">
          <img
            className="subscriber-profile-image"
            src={profile}
            alt="subscriber Image"
          ></img>
        </div>
        <ToastContainer
          style={{ position: "fixed", top: "5%", right: "3.5%" }}
        />
        <div className="subscriber-info-section">
          <div className="subscriber-basic-info">
            <div className="subscriber-name-section">
              <Link
                className="subscriber-name-link"
                to="/dashboard/subscriber"
                state={{ username: userid }}
              >
                {fullName || ""}
              </Link>
              <div className="subscriber-status-badges">
                <span className="subscriber-status-prepaid">Prepaid</span>
                <span> | </span>
                <span className="subscriber-status-paid">
                  {dueamount > 0 ? "Due" : "Paid"}
                </span>
                <span> | </span>
                <span
                  className={
                    status === "Active"
                      ? "subscriber-status-active"
                      : status === "Inactive"
                      ? "subscriber-status-inactive"
                      : "subscriber-status-terminated"
                  }
                >
                  {status}
                </span>
              </div>
            </div>
            <div className="subscriber-details-card">
              <div className="subscriber-details-row">
                <div className="subscriber-detail-column">
                  <div className="subscriber-detail-label">User ID</div>
                  <div className="subscriber-detail-value">
                    <h5>{userid}</h5>
                  </div>

                  <div className="subscriber-detail-label">
                    Registration Date
                  </div>
                  <div className="subscriber-detail-value">
                    {registerationdate}
                  </div>
                </div>

                <div className="subscriber-detail-column">
                  <div className="subscriber-detail-label">Company Name</div>
                  <div className="subscriber-detail-value">
                    <h5>{company}</h5>
                  </div>

                  <div className="subscriber-detail-label">Connection Type</div>
                  <div className="subscriber-detail-value">FTTH</div>
                </div>
              </div>
            </div>
          </div>
          <div className="subscriber-plan-section">
            <div className="subscriber-plan-row">
              <div className="subscriber-plan-column">
                <div className="subscriber-plan-label">Active Plan</div>
                <div className="subscriber-plan-value">
                  <h6>{planName}</h6>
                </div>

                <div className="subscriber-plan-label">Start Date</div>
                <div className="subscriber-plan-value">
                  <h6>
                    {new Date(activationDate)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      .replace(",", "")}
                  </h6>
                </div>

                <div className="subscriber-plan-label">
                  End Date
                  <span
                    onClick={() => setExpiryModal(true)}
                    className="subscriber-edit-badge"
                  >
                    Edit
                  </span>
                </div>
                <div className="subscriber-plan-value">
                  <h6>
                    {new Date(expiryDate)
                      .toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                      .replace(",", "")}
                  </h6>
                </div>

                <div className="subscriber-plan-label">Amount</div>
                <div className="subscriber-plan-value">
                  <h6>{`${parseInt(planAmount)}.00`}</h6>
                </div>
              </div>
              <div className="subscriber-plan-column">
                <div className="subscriber-plan-label">
                  ISP
                  <span
                    onClick={() => setIspChangeModal(true)}
                    className="subscriber-edit-badge"
                  >
                    Edit
                  </span>
                </div>
                <div className="subscriber-plan-value">
                  <h6>{isp}</h6>
                </div>

                <div className="subscriber-plan-label">Data</div>
                <div className="subscriber-plan-value">
                  <h6>Unlimited</h6>
                </div>

                <div className="subscriber-plan-label">
                  Status
                  <span
                    onClick={() => setShowTerminate(true)}
                    className="subscriber-edit-badge"
                  >
                    Edit
                  </span>
                </div>
                <div className="subscriber-plan-value">
                  <h6
                    className={
                      status === "Active"
                        ? "subscriber-status-active"
                        : status === "Inactive"
                        ? "subscriber-status-inactive"
                        : "subscriber-status-terminated"
                    }
                  >
                    {status}
                  </h6>
                </div>

                <div className="subscriber-plan-label">Days Remains</div>
                <div className="subscriber-plan-value">
                  <h6>{remaindays}</h6>
                </div>
              </div>

              <div className="subscriber-due-section">
                <div
                  className={`subscriber-due-card ${
                    dueamount < 0
                      ? "positive"
                      : dueamount > 0
                      ? "negative"
                      : "neutral"
                  }`}
                >
                  <div className="subscriber-due-icon">
                    <img alt="Due Amount" src={Due_Icon}></img>
                  </div>
                  <div className="subscriber-due-info">
                    <div className="subscriber-due-amount">{dueamount}</div>
                    <div className="subscriber-due-label">Due Amount</div>
                  </div>
                </div>
                <div className="subscriber-actions-section">
                  <div className="subscriber-action-buttons">
                    <button
                      onClick={() => {
                        console.log(cuPlanCode);
                        if (!hasPermission("RENEW_PLAN")) {
                          toast.error("Permission Denied!", {
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                          });
                          return;
                        }

                        if (cuPlanCode.isPlanCode) {
                          setRenewModal(true);
                          const cuObj = plans.find(
                            (data) => data.code === cuPlanCode.plancode
                          );
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
                                cuObj.planperiod
                              ),
                              planAmount: planAmount,
                              planperiod: cuObj.planperiod,
                              periodtime: cuObj.periodtime,
                              plancode: cuPlanCode.plancode,
                            });
                          }
                        }
                      }}
                      type="button"
                      className="subscriber-action-btn subscriber-action-btn-info"
                      disabled={!cuPlanCode.isPlanCode || isTerminated}
                    >
                      Renew Subscription
                    </button>
                    <button
                      onClick={() => {
                        hasPermission("CHANGE_PLAN")
                          ? setModalChangePlan(true)
                          : toast.error("Permission Denied", {
                              autoClose: 3000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                            });
                      }}
                      type="button"
                      className="subscriber-action-btn subscriber-action-btn-outline-danger"
                      disabled={isTerminated}
                    >
                      Change Plan
                    </button>
                  </div>

                  <div className="subscriber-coins-section">
                    <span>Tokens Balance :- </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="subscriber-navigation-section">
        <div className="subscriber-sidebar">
          <div
            onClick={() => {
              navigate("/dashboard/subscriber/ledger", { state: { username } });
            }}
            className="subscriber-nav-option"
          >
            <label>Ledger</label>
          </div>

          <div
            onClick={() => {
              navigate("/dashboard/subscriber/paymentreceipt", {
                state: { username },
              });
            }}
            className="subscriber-nav-option"
          >
            <label>Payments Receipts</label>
          </div>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/tickets"
          >
            <label>Tickets</label>
          </Link>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/inventory"
          >
            <label>Inventory</label>
          </Link>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/dcnote"
          >
            <label>Debit/Credit Notes</label>
          </Link>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/remarkfollow"
          >
            <label>Remarks & Follow Ups</label>
          </Link>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/documents"
          >
            <label>Documents</label>
          </Link>

          <Link
            className="subscriber-nav-option"
            to="/dashboard/subscriber/logsubs"
          >
            <label>Subscriber Logs</label>
          </Link>
        </div>

        <div className="subscriber-content-area">
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

      <Modal
        show={expiryModal}
        onHide={() => setExpiryModal(false)}
        className="subscriber-modal"
      >
        <Modal.Header>
          <Modal.Title>Change Expiry Date</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Processing, please wait...</p>
            </div>
          ) : (
            <div className="subscriber-modal-container">
              <div className="subscriber-modal-field subscriber-modal-field-margin">
                <label className="subscriber-form-label">
                  Select New Expiry
                </label>
                <input
                  defaultValue={
                    expiryDate
                      ? new Date(expiryDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => setNewExp(e.target.value)}
                  type="date"
                  className="subscriber-form-control"
                ></input>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={updateExpiry}
            className="subscriber-btn subscriber-btn-primary"
          >
            Update
          </button>
          <button
            onClick={() => setExpiryModal(false)}
            className="subscriber-btn subscriber-btn-secondary"
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={ispChangeModal}
        onHide={() => setIspChangeModal(false)}
        className="subscriber-modal"
      >
        <Modal.Header>
          <Modal.Title>Change Customer ISP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subscriber-modal-container">
            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Select ISP</label>
              <select
                onChange={(e) => setSelectedIsp(e.target.value)}
                className="subscriber-form-select"
              >
                <option value="">Choose...</option>
                {ispArray.length > 0 ? (
                  ispArray.map((isp, index) => (
                    <option key={index} value={isp}>
                      {isp}
                    </option>
                  ))
                ) : (
                  <option value="">No ISP Found</option>
                )}
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={updateISP}
            className="subscriber-btn subscriber-btn-primary"
          >
            Update
          </button>
          <button
            onClick={() => setIspChangeModal(false)}
            className="subscriber-btn subscriber-btn-secondary"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showTerimate}
        onHide={() => setShowTerminate(false)}
        className="subscriber-modal"
      >
        <Modal.Header>
          <Modal.Title>Terminated User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subscriber-modal-container">
            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">
                Select Account Status
              </label>
              <select
                onChange={(e) => setTempTermStatus(e.target.value === "true")}
                className="subscriber-form-select"
              >
                <option value={isTerminated}>Choose...</option>
                <option value={isTerminated ? "false" : "true"}>
                  {isTerminated ? "Active" : "Terminated"}
                </option>
              </select>
            </div>

            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Enter Remarks</label>
              <input
                onChange={(e) => setTerminateRemark(e.target.value)}
                className="subscriber-form-control"
                type="text"
                placeholder="e.g. Reason or Remark"
              ></input>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={teminateUser}
            className="subscriber-btn subscriber-btn-primary"
          >
            Update
          </button>
          <button
            onClick={() => setShowTerminate(false)}
            className="subscriber-btn subscriber-btn-outline-secondary"
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={modalChangeplan}
        onHide={() => setModalChangePlan(false)}
        className="subscriber-modal"
      >
        <Modal.Header>
          <Modal.Title>Change Customer Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subscriber-modal-container">
            <div className="subscriber-modal-row">
              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-right-margin">
                <label className="subscriber-form-label">
                  Select Provider *
                </label>
                <select
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      provider: e.target.value,
                    })
                  }
                  className="subscriber-form-select"
                >
                  <option>Choose...</option>
                  {provide.map((data, index) => (
                    <option key={index}>{data}</option>
                  ))}
                </select>
              </div>

              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-left-margin">
                <label className="subscriber-form-label">Select ISP *</label>
                <select
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      isp: e.target.value,
                    })
                  }
                  className="subscriber-form-select"
                >
                  <option>Choose...</option>
                  {ispArray.map((data, index) => (
                    <option key={index} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Select Plan *</label>
              <select
                onChange={(e) => {
                  const selectKey = e.target.value;
                  const selectedObj = plans.find(
                    (data) => data.code === selectKey
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
                        selectedObj.planperiod
                      ),
                      baseamount: selectedObj.planamount,
                      plancode: selectedObj.code,
                    });
                  }
                }}
                className="subscriber-form-select"
              >
                <option>Choose...</option>
                {filterPlan.map((data, index) => (
                  <option key={index} value={data.code}>
                    {data.planname}
                  </option>
                ))}
              </select>
            </div>

            <div className="subscriber-modal-row">
              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-right-margin">
                <label className="subscriber-form-label">
                  Activation Date *
                </label>
                <input
                  defaultValue={changePlanData.activationDate}
                  onChange={(e) => {
                    setChangePlanData({
                      ...changePlanData,
                      activationDate: e.target.value,
                      expiryDate: updateExpirationDate(
                        e.target.value,
                        changePlanData.periodtime,
                        changePlanData.planperiod
                      ),
                    });
                  }}
                  className="subscriber-form-control"
                  type="date"
                ></input>
              </div>

              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-left-margin">
                <label className="subscriber-form-label">Expiry Date</label>
                <input
                  value={changePlanData.expiryDate}
                  className="subscriber-form-control"
                  type="date"
                  disabled
                ></input>
              </div>
            </div>

            <div className="subscriber-modal-row">
              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-right-margin">
                <label className="subscriber-form-label">Base Amount</label>
                <input
                  value={changePlanData.baseamount}
                  className="subscriber-form-control"
                  type="text"
                  disabled
                ></input>
              </div>

              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-left-margin">
                <label className="subscriber-form-label">Custom Amount *</label>
                <input
                  defaultValue={changePlanData.planAmount}
                  onChange={(e) =>
                    setChangePlanData({
                      ...changePlanData,
                      planAmount: e.target.value,
                    })
                  }
                  className="subscriber-form-control"
                  type="text"
                ></input>
              </div>
            </div>

            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Remarks</label>
              <input
                onChange={(e) =>
                  setChangePlanData({
                    ...changePlanData,
                    remarks: e.target.value,
                  })
                }
                className="subscriber-form-control"
                type="text"
              ></input>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="subscriber-modal-footer">
            <button
              onClick={() => savePlan("Plan Change")}
              className="subscriber-btn subscriber-btn-success subscriber-btn-margin-right"
            >
              Update Plan
            </button>
            <button
              onClick={() => setModalChangePlan(false)}
              className="subscriber-btn subscriber-btn-outline-secondary subscriber-btn-margin-left"
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>

      <Modal
        show={renewmodal}
        onHide={() => setRenewModal(false)}
        className="subscriber-modal"
      >
        <Modal.Header>
          <Modal.Title>Renew Customer Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="subscriber-modal-container">
            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Current Plan</label>
              <input
                defaultValue={changePlanData.planname}
                className="subscriber-form-control"
                disabled
              ></input>
            </div>

            <div className="subscriber-modal-row">
              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-right-margin">
                <label className="subscriber-form-label">Activation Date</label>
                <input
                  className="subscriber-form-control"
                  type="date"
                  defaultValue={
                    new Date(
                      new Date(expiryDate).setDate(
                        new Date(expiryDate).getDate() + 1
                      )
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
                        changePlanData.planperiod
                      ),
                    })
                  }
                ></input>
              </div>

              <div className="subscriber-modal-field subscriber-modal-field-margin subscriber-modal-field-half subscriber-modal-field-left-margin">
                <label className="subscriber-form-label">Expiry Date</label>
                <input
                  value={changePlanData.expiryDate}
                  className="subscriber-form-control"
                  type="date"
                  disabled
                ></input>
              </div>
            </div>

            <div className="subscriber-modal-field subscriber-modal-field-margin">
              <label className="subscriber-form-label">Remarks</label>
              <input
                onChange={(e) =>
                  setChangePlanData({
                    ...changePlanData,
                    remarks: e.target.value,
                  })
                }
                className="subscriber-form-control"
                type="text"
              ></input>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="subscriber-modal-footer">
            <button
              onClick={(e) => savePlan("Renewal")}
              className="subscriber-btn subscriber-btn-primary subscriber-btn-margin-right"
            >
              Renew Plan
            </button>
            <button
              onClick={() => setRenewModal(false)}
              className="subscriber-btn subscriber-btn-outline-secondary subscriber-btn-margin-left"
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
