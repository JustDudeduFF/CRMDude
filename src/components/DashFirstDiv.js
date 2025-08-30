import React, { useEffect, useState } from "react";
import Router_Img from "./subscriberpage/drawables/wireless-router.png";
import Rupee_Icon from "./subscriberpage/drawables/rupee.png";
import DueRupee_Icon from "./subscriberpage/drawables/rupeenew.png";
import Tickets_Icon from "./subscriberpage/drawables/complain.png";
import ExcelIcon from "./subscriberpage/drawables/xls.png";
import DashExpandView from "./DashExpandView";
import ExpandIcon from "./subscriberpage/drawables/expand-arrows.png";
import ExpandTickets from "./ExpandTickets";
import ExpandRevenue from "./ExpandRevenue";
import { useNavigate } from "react-router-dom";
import DashSecDiv from "./DashSecDiv";
import { usePermissions } from "./PermissionProvider";
import { Modal } from "react-bootstrap";
import axios from "axios";
import {
  isThisISOWeek,
  isThisMonth,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";
import * as XLSX from "xlsx";
import ExpiredUsersBarChart from "./ExpiredUsersBarChart";
import { api2 } from "../FirebaseConfig";
import "./DashFirstDiv.css";

const api = process.env.REACT_APP_API_URL;

export default function DashFirstDiv() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const partnerId = localStorage.getItem("partnerId");

  const [openticktes, setOpenTickets] = useState(0);
  const [unassignedtickets, setUnassignedTickets] = useState(0);
  const [closedtickets, setCloseTickets] = useState(0);

  const [dueArrayWeek, setDueArrayWeek] = useState(0);
  const [dueArrayMonth, setDueArrayMonth] = useState(0);
  const [dueArrayToday, setDueArrayToday] = useState(0);
  const [last5days, setLast5days] = useState({});
  const [upcoming5days, setUpcoming5Dats] = useState({});

  const [dashboardAmount, setDashboardAmount] = useState({
    todayAmount: 0,
    cashAmount: 0,
    onlineAmount: 0,
    monthWise: 0,
    totalAmount: 0,
  });

  const [showExpanView, setShowExpandView] = useState(false);
  const [expandDataType, setExpandDataType] = useState("");

  const [showTicketExpand, setShowTicketExpand] = useState(false);
  const [ticketsType, setTicketType] = useState("");

  const [showrevenueexpand, setRevenueExpand] = useState(false);

  const [arryadue, setDueArray] = useState(0);

  const [attendenceArray, setAttendenceArray] = useState([]);
  const [state, setState] = useState({
    companyArray: [],
    installationArray: [],
    newInstallations: 0,
    newInstallationsToday: 0,
    newInstallationsWeek: 0,
  });
  const [followupArray, setFollowUpArray] = useState([]);
  const [filteIns, setFilterIns] = useState({
    company: "All",
    day: "Month",
  });
  const [filterInsArray, setFilterInsArray] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showInsModal, setShowInsModal] = useState(false);

  const downloadExcel = () => {
    console.log(filterInsArray);
    const extractedData = filterInsArray.map((item, index) => ({
      "S No.": index + 1,
      UserName: item.username,
      "Customer Name": item.fullName,
      Mobile: item.mobileNo,
      "Installation Address": item.installationAddress,
      Email: item.email,
      "Registration Date": new Date(item.createdAt).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short", year: "2-digit" }
      ),
      "Plan Name": item.connectionDetails.planName,
      "Plan Amount": item.connectionDetails.planAmount,
      Colony: item.colonyName,
      Company: item.company,
      "Activation Date": new Date(
        item.connectionDetails.activationDate
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      "Expiry Date": new Date(
        item.connectionDetails.expiryDate
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      }),
      ISP: item.connectionDetails.isp,
      "Due Amount": item.connectionDetails.dueAmount || 0,
      "CAF Document": item.connectionDetails.isCafDocument ? "Yes" : "No",
      "Identity Proof": item.connectionDetails.isIdentityProof ? "Yes" : "No",
      "Address Proof": item.connectionDetails.isAddressProof ? "Yes" : "No",
      Status:
        item.isTerminate === true
          ? "Terminated"
          : new Date(item.connectionDetails?.expiryDate) < new Date()
          ? "InActive"
          : "Active",
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(extractedData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Installation");
    XLSX.writeFile(workbook, `Installation Data.xlsx`);
  };

  const getLast5DaysExpiredDetails = (expiredData) => {
    const result = {};

    // Data comes directly as expiredDetails object with dates
    if (expiredData && typeof expiredData === "object") {
      Object.keys(expiredData).forEach((date) => {
        const expiredUsers = expiredData[date]; // Array of expired users for each date
        if (Array.isArray(expiredUsers)) {
          result[date] = expiredUsers.length; // Count users per day
        }
      });
    }

    return result; // Return the count of expired users per day
  };

  const getUpcoming5DaysRenewalDetails = (renewalData) => {
    const result = {};

    // Data comes directly as upcomingRenew object with dates
    if (renewalData && typeof renewalData === "object") {
      Object.keys(renewalData).forEach((date) => {
        const renewalUsers = renewalData[date]; // Array of renewal users for each date
        if (Array.isArray(renewalUsers)) {
          result[date] = renewalUsers.length; // Count users per day
        }
      });
    }

    return result;
  };

  useEffect(() => {
    setIsLoading(true);

    fetchData();
  }, []);

  function openPayroll() {
    navigate("/dashboard/payrollandattendence");
  }

  const fetchData = async () => {
    try {
      // Run all API calls concurrently using Promise.all
      const [dashBoardData, newInstallationData] = await Promise.all([
        axios.get(`${api2}/dashboard-data?partnerId=${partnerId}`),
        axios.get(
          `${api2}/dashboard-data/installations?partnerId=${partnerId}`
        ),
      ]);

      // Check for response status once
      if (dashBoardData.status !== 200 || newInstallationData.status !== 200) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = dashBoardData.data;
      const installationData = newInstallationData.data;

      // Process subscriber data
      const subsData = data.installations;
      if (subsData) {
        const newInstallations = subsData.newInstallations;
        const newInstallationsToday = subsData.newInstallationsToday;
        const newInstallationsWeek = subsData.newInstallationsWeek;

        // Batch state updates
        setState((prevState) => ({
          ...prevState,
          companyArray: installationData.companyArray,
          installationArray: installationData.installationArray,
          newInstallations,
          newInstallationsToday,
          newInstallationsWeek,
        }));
      }

      // Process last 5 days expired data
      if (data.Expired && typeof data.Expired === "object") {
        const expiredDetails = getLast5DaysExpiredDetails(data.Expired);
        setLast5days(expiredDetails);
      } else {
        setLast5days({});
      }

      // Process upcoming 5 days renewal data
      if (data.upcomingRenew && typeof data.upcomingRenew === "object") {
        const renewalDetails = getUpcoming5DaysRenewalDetails(
          data.upcomingRenew
        );
        setUpcoming5Dats(renewalDetails);
      }

      const dashRevenue = data.revenuedata;
      if (dashRevenue) {
        setDashboardAmount({
          todayAmount: dashRevenue.todayAmount,
          cashAmount: dashRevenue.cashAmount,
          onlineAmount: dashRevenue.onlineAmount,
          monthWise: dashRevenue.monthWise,
        });
      }

      const dashDue = data.due;
      if (dashDue) {
        setDueArrayMonth(dashDue.totalMonth);
        setDueArrayWeek(dashDue.totalWeek);
        setDueArrayToday(dashDue.totalToday);
        setDueArray(dashDue.totalAll);
      }

      const dashTicket = data.ticketCount;
      if (dashTicket) {
        setOpenTickets(dashTicket.open);
        setCloseTickets(dashTicket.closed);
        setUnassignedTickets(dashTicket.unassigned);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  function formatRevenue(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const isValidDate = (dateString) => {
    return (
      dateString && typeof dateString === "string" && dateString.trim() !== ""
    );
  };

  useEffect(() => {
    let filterArray = state.installationArray;

    if (filteIns.company !== "All") {
      filterArray = filterArray.filter(
        (data) => data.company === filteIns.company
      );
    }

    if (filteIns.day !== "Month") {
      switch (filteIns.day) {
        case "Month":
          filterArray = filterArray.filter(
            (data) =>
              isValidDate(data.createdAt) &&
              isThisMonth(parseISO(data.createdAt))
          );
          break;
        case "Today":
          filterArray = filterArray.filter(
            (data) =>
              isValidDate(data.createdAt) && isToday(parseISO(data.createdAt))
          );
          break;
        case "Yesterday":
          filterArray = filterArray.filter(
            (data) => isValidDate(data.createdAt) && isYesterday(data.createdAt)
          );
          break;
        case "This Week":
          filterArray = filterArray.filter(
            (data) =>
              isValidDate(data.createdAt) &&
              isThisISOWeek(parseISO(data.createdAt))
          );
          break;
      }
    }

    setFilterInsArray(filterArray);
  }, [filteIns, state.installationArray]);

  return (
    <>
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard data...</p>
        </div>
      ) : (
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="dashboard-row">
              {/* Attendance Section */}
              {hasPermission("VIEW_ATTENDENCE") ? (
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-clock"></i>
                      Daily Attendance Logs
                    </h3>
                    <img
                      onClick={() => openPayroll()}
                      alt="Expand"
                      className="expand-icon"
                      src={ExpandIcon}
                    />
                  </div>
                  <div className="table-container">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>S. No.</th>
                          <th>Full Name</th>
                          <th>In Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendenceArray.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.fullname}</td>
                            <td>{item.intime}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  item.status === "Absent"
                                    ? "status-absent"
                                    : item.status === "Present"
                                    ? "status-present"
                                    : "status-late"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="dashboard-card">
                  <div className="charts-container">
                    <div className="chart-card">
                      <h3 className="chart-title">Expired Users</h3>
                      {Object.keys(last5days).length > 0 ? (
                        <ExpiredUsersBarChart
                          onBarClick={(clickedData, index) => {
                            setExpandDataType("Expiring " + clickedData);
                            setShowExpandView(true);
                          }}
                          data={last5days}
                          type={"expire"}
                        />
                      ) : (
                        <p>Loading chart...</p>
                      )}
                    </div>

                    <div className="chart-card">
                      <h3 className="chart-title">My Follows</h3>
                      <div className="table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>S. No.</th>
                              <th>User ID</th>
                              <th>Description</th>
                              <th>Particular</th>
                            </tr>
                          </thead>
                          <tbody>
                            {followupArray.map((item, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td
                                  className="clickable text-primary"
                                  onClick={() => {
                                    const userKey = item.userid;
                                    localStorage.setItem(
                                      "susbsUserid",
                                      userKey
                                    );
                                    navigate(
                                      "/dashboard/subscriber/remarkfollow",
                                      { state: { userKey } }
                                    );
                                  }}
                                >
                                  {item.userid}
                                </td>
                                <td
                                  style={{
                                    maxWidth: "200px",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {item.description}
                                </td>
                                <td>{item.particular}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts and Installation Section */}
              <div className="dashboard-card">
                <div className="charts-container">
                  <div className="chart-card">
                    <h3 className="chart-title">Upcoming Renewal</h3>
                    {Object.keys(upcoming5days).length > 0 ? (
                      <ExpiredUsersBarChart
                        onBarClick={(clickedData, index) => {
                          setExpandDataType("Expiring " + clickedData);
                          setShowExpandView(true);
                        }}
                        data={upcoming5days}
                        type={"renewal"}
                      />
                    ) : (
                      <p>Loading chart...</p>
                    )}
                  </div>

                  <div
                    className="metric-card installation-card clickable"
                    onClick={() => setShowInsModal(true)}
                  >
                    <div className="card-header">
                      <div className="card-title">
                        <img
                          alt="Router"
                          className="card-icon"
                          src={Router_Img}
                        />
                        New Installations
                      </div>
                      <div className="metric-value">
                        {state.newInstallations}
                      </div>
                    </div>
                    <div className="sub-metrics">
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          {state.newInstallationsToday}
                        </div>
                        <div className="sub-metric-label">
                          Today's Installations
                        </div>
                      </div>
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          {state.newInstallationsWeek}
                        </div>
                        <div className="sub-metric-label">
                          Weekly Installations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue, Due, and Tickets Section */}
              <div className="dashboard-card">
                <div className="charts-container">
                  {/* Revenue Card */}
                  <div
                    className="metric-card revenue-card clickable"
                    onClick={() => setRevenueExpand(true)}
                  >
                    <div className="card-header">
                      <div className="card-title">
                        <img
                          alt="Revenue"
                          className="card-icon"
                          src={Rupee_Icon}
                        />
                        This Month Revenue
                      </div>
                      <img
                        alt="Expand"
                        className="expand-icon"
                        src={ExpandIcon}
                      />
                    </div>
                    <div className="metric-value">
                      ₹{formatRevenue(dashboardAmount.monthWise)}.00
                    </div>
                    <div className="sub-metrics">
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          ₹{formatRevenue(dashboardAmount.todayAmount)}.00
                        </div>
                        <div className="sub-metric-label">Today's Revenue</div>
                      </div>
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          ₹{formatRevenue(dashboardAmount.cashAmount)}.00
                        </div>
                        <div className="sub-metric-label">Cash Collection</div>
                      </div>
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          ₹{formatRevenue(dashboardAmount.onlineAmount)}.00
                        </div>
                        <div className="sub-metric-label">
                          Online Collection
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Amount Card */}
                  <div
                    className="metric-card due-card clickable"
                    onClick={() => {
                      setExpandDataType("Due Month");
                      setShowExpandView(true);
                    }}
                  >
                    <div className="card-header">
                      <div className="card-title">
                        <img
                          alt="Due"
                          className="card-icon"
                          src={DueRupee_Icon}
                        />
                        Month Due Amount
                      </div>
                    </div>
                    <div className="metric-value">
                      ₹{formatRevenue(dueArrayMonth)}.00
                    </div>
                    <div className="sub-metrics">
                      <div
                        className="sub-metric clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandDataType("Due All");
                          setShowExpandView(true);
                        }}
                      >
                        <div className="sub-metric-value">
                          ₹{formatRevenue(arryadue)}.00
                        </div>
                        <div className="sub-metric-label">Total Due Amount</div>
                      </div>
                      <div
                        className="sub-metric clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandDataType("Due Week");
                          setShowExpandView(true);
                        }}
                      >
                        <div className="sub-metric-value">
                          ₹{formatRevenue(dueArrayWeek)}.00
                        </div>
                        <div className="sub-metric-label">Weekly Due</div>
                      </div>
                      <div
                        className="sub-metric clickable"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandDataType("Due Today");
                          setShowExpandView(true);
                        }}
                      >
                        <div className="sub-metric-value">
                          ₹{formatRevenue(dueArrayToday)}.00
                        </div>
                        <div className="sub-metric-label">
                          Today's Due Amount
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tickets Card */}
                  <div className="metric-card tickets-card">
                    <div className="card-header">
                      <div className="card-title">
                        <img
                          alt="Tickets"
                          className="card-icon"
                          src={Tickets_Icon}
                        />
                        Current Open Tickets
                      </div>
                      <img
                        alt="Expand"
                        className="expand-icon"
                        onClick={() => {
                          setShowTicketExpand(true);
                          setTicketType("Open Tickets");
                        }}
                        src={ExpandIcon}
                      />
                    </div>
                    <div className="metric-value">{openticktes}</div>
                    <div className="sub-metrics">
                      <div className="sub-metric">
                        <div className="sub-metric-value">
                          {unassignedtickets}
                        </div>
                        <div className="sub-metric-label">
                          Unassigned Tickets
                        </div>
                      </div>
                      <div className="sub-metric">
                        <div className="sub-metric-value">{closedtickets}</div>
                        <div className="sub-metric-label">Closed Tickets</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modals */}
            <DashExpandView
              show={showExpanView}
              datatype={expandDataType}
              modalShow={() => setShowExpandView(false)}
            />
            <ExpandTickets
              viewShow={showTicketExpand}
              ticketType={ticketsType}
              closeView={() => setShowTicketExpand(false)}
            />
            <ExpandRevenue
              show={showrevenueexpand}
              modalShow={() => setRevenueExpand(false)}
            />

            <Modal
              show={showInsModal}
              onHide={() => setShowInsModal(false)}
              size="xl"
            >
              <Modal.Header>
                <Modal.Title>This Month New User</Modal.Title>
                <div className="col-md-3 ms-auto">
                  <label className="form-label">Select Company</label>
                  <select
                    onChange={(e) =>
                      setFilterIns({ ...filteIns, company: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="All">All</option>
                    {state.companyArray.map((company, index) => (
                      <option key={index} value={company}>
                        {company}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 ms-auto">
                  <label className="form-label">Select Day</label>
                  <select
                    onChange={(e) =>
                      setFilterIns({ ...filteIns, day: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="Month">This Month</option>
                    <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="This Week">This Week</option>
                  </select>
                </div>
                <img
                  onClick={downloadExcel}
                  className="excel-download-icon ms-auto"
                  alt="excel"
                  src={ExcelIcon}
                />
              </Modal.Header>

              <Modal.Body>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>S No</th>
                      <th>Date</th>
                      <th>UserID</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Address</th>
                      <th>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterInsArray.length > 0 ? (
                      filterInsArray.map((data, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            {new Date(data.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              }
                            )}
                          </td>
                          <td>{data.username}</td>
                          <td>{data.fullName}</td>
                          <td>{data.mobileNo}</td>
                          <td
                            style={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {data.installationAddress}
                          </td>
                          <td>{data.company}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          style={{ textAlign: "center", padding: "20px" }}
                        >
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Modal.Body>
            </Modal>
          </div>

          <DashSecDiv />
        </div>
      )}
    </>
  );
}
