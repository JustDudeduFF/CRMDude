import React, { useEffect, useState } from "react";
import Menu from "./subscriberpage/drawables/hamburger.png";
import ProfileCard from "./ProfileCard";
import Building_Img from "./subscriberpage/drawables/office-building.png";
import ReportsOthers from "./ReportsOthers";
import { useNavigate } from "react-router-dom";
import UserProfile from "./subscriberpage/drawables/user.png";
import NotificationIcon from "./subscriberpage/drawables/bell.png";
import { Modal, ModalBody, ModalTitle } from "react-bootstrap";
import axios from "axios";
import ExcelIcon from "./subscriberpage/drawables/xls.png";
import { toast, ToastContainer } from "react-toastify";
import { api2 } from "../FirebaseConfig";
import "./Navbar.css";

export default function Navbar() {
  const name = localStorage.getItem("Name");
  const designation = localStorage.getItem("Designation");
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();

  const [issearcfocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [arrayuser, setArrayUser] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [subssearch, setSubsSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [renewalArray, setRenewArray] = useState([]);
  const [currentRenewal, setCurrentRenewal] = useState(0);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [showModal2, setShowModal2] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchRenewals();
  }, []);

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(
        api2 + "/navbar/stats?partnerId=" + partnerId
      );
      if (response.status === 200) {
        setUniqueCompanies(response.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  // Format date as DD-MM-YYYY
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Fetch renewals data
  const fetchRenewals = async () => {
    try {
      const response = await axios.get(api2 + "/renewals");
      if (response.status === 200) {
        setRenewArray(response.data.renewals);
        setCurrentRenewal(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching renewals:", error);
    }
  };

  // Search users
  const getSearchUser = async () => {
    if (!subssearch) return;
    setIsSearchFocused(true);
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `${api2}/navbar/search?query=${subssearch}&partnerId=${partnerId}`
      );
      if (response.status === 200) {
        setArrayUser(response.data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Error searching users");
    } finally {
      setSearchLoading(false);
    }
  };

  // Download users excel
  const downloadUsers = async () => {
    setShowModal2(false);
    toast.warning("Getting Excel", { autoClose: 1000 });

    try {
      const response = await axios.get(api2 + "/navbar/allUserExcel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "All Users.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Excel Downloaded", { autoClose: 3000 });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed To Download Excel", { autoClose: 3000 });
    }
  };

  // Handle subscriber view
  const handleSubsView = (userKey, username) => {
    setIsSearchFocused(false);
    localStorage.setItem("susbsUserid", userKey);
    localStorage.setItem("userid", username);
    localStorage.setItem("tempupdate", Date.now());
    navigate("/dashboard/subscriber", { state: { userKey } });
  };

  const togglevisiblty = () => {
    setIsVisible(!isVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div>
      <ToastContainer />

      {/* Custom Sidebar */}
      <div className={`custom-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h5 className="sidebar-title">Reports and Others</h5>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeSidebar}
          >
            ×
          </button>
        </div>
        <div className="sidebar-body">
          <ReportsOthers onCloseSidebar={closeSidebar} />
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <nav className="navbar fixed-top">
        <div className="container-fluid">
          <h1
            style={{
              fontSize: "40px",
              fontFamily: "cursive",
              textShadow: "2px 2px 5px rgba(0,0,0,0.3)",
            }}
            className="navbar-brand"
            onClick={() => navigate("/dashboard")}
          >
            CRM Dude
          </h1>
          <form className="d-flex" role="search">
            <input
              className="form-control"
              onChange={(e) => setSubsSearch(e.target.value.trim())}
              type="search"
              placeholder="Search"
              aria-label="Search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  getSearchUser();
                }
              }}
            />
            <div className="notification-container">
              <span className="notification-badge">{currentRenewal}</span>
              <img
                alt="online renewal"
                onClick={() => setShowModal(true)}
                className="notification-icon"
                src={NotificationIcon}
              />
            </div>

            <div className="user-profile-section">
              <div onClick={() => setShowModal2(true)} className="company-icon">
                <img
                  alt="all company"
                  className="company-icon"
                  src={Building_Img}
                />
              </div>
              <div className="user-profile-section">
                <img
                  alt="my profile"
                  onClick={togglevisiblty}
                  className="user-avatar"
                  src={UserProfile}
                />
                <div className="user-info">
                  <p className="user-name">{name}</p>
                  <p className="user-designation">{designation}</p>
                </div>
                <img
                  alt="menu"
                  className="menu-icon"
                  onClick={toggleSidebar}
                  src={Menu}
                />
              </div>
            </div>
          </form>
        </div>
      </nav>

      {isVisible && <ProfileCard />}

      {issearcfocused && (
        <div className="search-results">
          <button
            className="btn-close"
            onClick={() => setIsSearchFocused(false)}
          ></button>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              msOverflowStyle: "none",
            }}
          >
            {searchLoading ? (
              <div className="search-loading">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div>Searching...</div>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: "50px" }}>
                      S.No.
                    </th>
                    <th scope="col" style={{ width: "120px" }}>
                      FullName
                    </th>
                    <th scope="col" style={{ width: "120px" }}>
                      User ID
                    </th>
                    <th scope="col" style={{ width: "120px" }}>
                      Mobile
                    </th>
                    <th scope="col" style={{ width: "120px" }}>
                      Expiry Date
                    </th>
                    <th scope="col" style={{ width: "120px" }}>
                      Due Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {arrayuser.length > 0 ? (
                    arrayuser.map(
                      (
                        {
                          username,
                          fullname,
                          mobile,
                          userKey,
                          status,
                          expiryDate,
                          dueAmount,
                        },
                        index
                      ) => (
                        <tr
                          className={
                            status === "Terminated"
                              ? "table-danger"
                              : status === "InActive"
                              ? "table-secondary"
                              : ""
                          }
                          key={index}
                        >
                          <td
                            style={{
                              maxWidth: "50px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            style={{
                              maxWidth: "120px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {fullname}
                          </td>
                          <td
                            style={{
                              color: "#07b1f5",
                              cursor: "pointer",
                              maxWidth: "120px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                            onClick={() => handleSubsView(userKey, username)}
                          >
                            {username}
                          </td>
                          <td
                            style={{
                              maxWidth: "120px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {mobile}
                          </td>
                          <td
                            style={{
                              maxWidth: "120px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {expiryDate ? formatDate(expiryDate) : "-"}
                          </td>
                          <td
                            style={{
                              maxWidth: "120px",
                              height: "40px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              verticalAlign: "middle",
                            }}
                          >
                            {dueAmount}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        className="modal-xl"
      >
        <Modal.Title>
          <h4 className="modal-title">Online Renew List</h4>
        </Modal.Title>
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="container ">
              <form className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Select Source</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
              </form>
            </div>

            <table className="mt-2 table">
              <thead>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">UserId</th>
                  <th scope="col">FullName</th>
                  <th scope="col">Mobile</th>
                  <th scope="col">Installation Address</th>
                  <th scope="col">Source</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {renewalArray.length > 0 ? (
                  renewalArray.map(
                    ({ userid, fullname, mobile, address, source }, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{userid}</td>
                        <td>{fullname}</td>
                        <td>{mobile}</td>
                        <td
                          style={{
                            maxWidth: "250px",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {address}
                        </td>
                        <td>{source}</td>
                        <td>
                          <button className="btn btn-primary">Done</button>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Recent Renewal Found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showModal2} onHide={() => setShowModal2(false)}>
        <Modal.Header>
          <Modal.Title>Company and Customer Stats</Modal.Title>
          <img
            alt="excel"
            onClick={downloadUsers}
            className="excel-download-icon ms-auto"
            src={ExcelIcon}
          />
        </Modal.Header>
        <Modal.Body>
          <ol className="list-group list-group-numbered">
            {uniqueCompanies.map((company, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{company.company}</div>
                  <span className="text-success">
                    Active Users: {company.active || 0}
                  </span>
                </div>
                <span className="badge rounded-pill">
                  {company.expire || 0}
                </span>
              </li>
            ))}
          </ol>
        </Modal.Body>
      </Modal>
    </div>
  );
}
