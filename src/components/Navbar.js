import React, { useEffect, useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Building2,
  User,
  X,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import ProfileCard from "./ProfileCard";
import ReportsOthers from "./ReportsOthers";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../FirebaseConfig";
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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterCompany, setFilterCompany] = useState("All");
  const [minDue, setMinDue] = useState(0);

  useEffect(() => {
    fetchCompanies();
    fetchRenewals();
  }, []);

  // Add this inside your NewUserAdd component
  useEffect(() => {
    if (issearcfocused) {
      // Disable background scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable background scroll
      document.body.style.overflow = "auto";
    }

    // Cleanup function to ensure scroll is restored if component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [issearcfocused]);

  // Handle window resize to sync mobile/desktop search states
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setShowSearchInput(false);
      } else {
        setShowMobileSearch(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileSearch) {
        const centerSearch = document.querySelector(".crm-topbar-center");
        const mobileSearchBtn = document.querySelector(
          ".crm-mobile-search-btn",
        );

        if (
          centerSearch &&
          mobileSearchBtn &&
          !centerSearch.contains(event.target) &&
          !mobileSearchBtn.contains(event.target)
        ) {
          setShowMobileSearch(false);
        }
      }
    };

    if (showMobileSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileSearch]);

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const response = await API.get(
        `/navbar/stats?partnerId=${partnerId}`,
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
      const response = await API.get("/renewals");
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
    setShowMobileSearch(false);
    try {
      const response = await API.get(
        `/navbar/search?query=${subssearch}&partnerId=${partnerId}`,
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
      const response = await API.get("/navbar/allUserExcel", {
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
    setShowMobileSearch(false);
    setShowSearchInput(false);
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
            <X size={24} />
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
      <nav className="crm-topbar">
        <div
          className={`crm-topbar-left ${showMobileSearch ? "mobile-search-active" : ""}`}
        >
          {showMobileSearch ? (
            <div className="crm-mobile-search-input-wrapper">
              <input
                className="crm-mobile-search-input"
                type="search"
                placeholder="Search Subscriber..."
                value={subssearch}
                onChange={(e) => setSubsSearch(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    getSearchUser();
                    setShowMobileSearch(false);
                  } else if (e.key === "Escape") {
                    setShowMobileSearch(false);
                    setSubsSearch("");
                  }
                }}
                autoFocus={true}
              />
              <X
                className="crm-mobile-search-close-icon"
                size={20}
                onClick={() => {
                  if (subssearch.trim()) {
                    getSearchUser();
                  }
                  setShowMobileSearch(false);
                  setSubsSearch("");
                }}
              />
            </div>
          ) : (
            <span
              className="crm-logo-text"
              onClick={() => navigate("/dashboard")}
            >
              CRM Dude
            </span>
          )}
        </div>

        <div className="crm-topbar-right">
          <button
            className="crm-mobile-search-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newState = !showMobileSearch;
              setShowMobileSearch(newState);
              if (newState) {
                setShowSearchInput(false);
              }
            }}
            title="Search Subscriber"
            type="button"
          >
            <Search size={18} />
          </button>

          {/* Desktop Search Icon */}
          <div className="crm-desktop-search-wrapper">
            <div
              className={`crm-desktop-search-box ${showSearchInput ? "search-input-visible" : ""}`}
            >
              <input
                className="crm-desktop-search-input"
                type="search"
                placeholder="Search Subscriber..."
                value={subssearch}
                onChange={(e) => setSubsSearch(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    getSearchUser();
                  } else if (e.key === "Escape") {
                    setShowSearchInput(false);
                    setSubsSearch("");
                  }
                }}
                autoFocus={showSearchInput}
              />
              <Search
                className="crm-desktop-search-icon"
                size={20}
                onClick={() => {
                  if (subssearch.trim()) {
                    getSearchUser();
                  } else {
                    setShowMobileSearch(false);
                    setShowSearchInput(!showSearchInput);
                  }
                }}
              />
            </div>
          </div>

          <div
            className="crm-notification-wrapper"
            onClick={() => setShowModal(true)}
          >
            <Bell size={20} />
            {currentRenewal > 0 && (
              <span className="crm-notification-count">{currentRenewal}</span>
            )}
          </div>

          <button
            className="crm-icon-btn"
            onClick={() => setShowModal2(true)}
            title="Company Stats"
          >
            <Building2 size={20} />
          </button>

          <div className="crm-user-box" onClick={togglevisiblty}>
            <div className="crm-user-avatar">
              <User size={20} />
            </div>
            <div className="crm-user-text">
              <span className="crm-user-name">{name}</span>
              <span className="crm-user-role">{designation}</span>
            </div>
          </div>

          <button className="crm-icon-btn" onClick={toggleSidebar} title="Menu">
            <Menu size={20} />
          </button>
        </div>
      </nav>
      {isVisible && <ProfileCard onClose={() => setIsVisible(false)} />}

      {issearcfocused && (
        <div className="search-results-overlay">
          <div className="search-results-header">
            <div className="d-flex align-items-center">
              <h6 className="mb-0 fw-bold me-3">
                Results ({arrayuser.length})
              </h6>
            </div>
            <button
              className="btn-close-custom"
              onClick={() => {
                setIsSearchFocused(false);
                setShowMobileSearch(false);
              }}
            >
              &times;
            </button>
          </div>

          {/* NEW: Filter Bar Section */}
          <div className="filter-bar bg-white px-3 py-2 border-bottom shadow-sm">
            <div className="row g-2">
              <div className="col-6">
                <label className="filter-label">Filter by Company</label>
                <select
                  className="form-select form-select-sm"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                >
                  <option value="All">All Companies</option>
                  {[...new Set(arrayuser.map((u) => u.company))]
                    .filter(Boolean)
                    .map((comp, i) => (
                      <option key={i} value={comp}>
                        {comp}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-6">
                <label className="filter-label">Min. Due Amount</label>
                <input
                  type="number"
                  className="form-select form-select-sm"
                  placeholder="Min ₹"
                  onChange={(e) => setMinDue(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="search-results-body">
            {searchLoading ? (
              <div className="search-loading">
                <Loader2 className="spinner" size={32} />
                <div className="mt-2">Searching...</div>
              </div>
            ) : arrayuser.length > 0 ? (
              <div className="user-cards-container">
                {arrayuser
                  .filter(
                    (user) =>
                      filterCompany === "All" || user.company === filterCompany,
                  )
                  .filter((user) => Number(user.dueAmount || 0) >= minDue)
                  .map((user, index) => {
                    const {
                      username,
                      fullname,
                      mobile,
                      userKey,
                      status,
                      expiryDate,
                      dueAmount,
                      installationAddress,
                      company,
                    } = user;

                    const statusClass =
                      status === "Terminated"
                        ? "status-terminated"
                        : status === "InActive"
                          ? "status-inactive"
                          : "status-active";

                    return (
                      <div
                        className={`user-result-card ${statusClass}`}
                        key={index}
                        onClick={() => handleSubsView(userKey, username)}
                      >
                        <div className="card-top">
                          <span className="company-tag">
                            {company || "No Company"}
                          </span>
                          <div className="due-highlight">
                            <span className="due-label">DUE</span>
                            <span className="due-value">₹{dueAmount || 0}</span>
                          </div>
                        </div>

                        <div className="card-main">
                          <div className="user-info">
                            <div className="fullname">{fullname}</div>
                            <div className="username-id">ID: {username}</div>
                          </div>
                          <span className={`status-pill`}>
                            {status || "Active"}
                          </span>
                        </div>

                        <div className="address-section">
                          <div className="address-text">
                            <strong>Address:</strong>{" "}
                            {installationAddress || "N/A"}
                          </div>
                        </div>

                        <div className="card-footer">
                          <div className="footer-item">
                            <small>Mob:</small> <span>{mobile}</span>
                          </div>
                          <div className="footer-item text-end">
                            <small>Exp:</small>{" "}
                            <span>
                              {expiryDate ? formatDate(expiryDate) : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="no-data-found">
                No data matches your criteria.
              </div>
            )}
          </div>

          <style>{`
      .search-results-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #f4f7f6;
        z-index: 1050;
        display: flex;
        flex-direction: column;
        /* Add these two lines */
        overflow-y: hidden; 
        overscroll-behavior: contain; 
      }

      .search-results-body {
        flex: 1;
        overflow-y: auto; /* This allows ONLY this section to scroll */
        -webkit-overflow-scrolling: touch; /* Smooth scroll for iOS */
        padding: 10px;
      }
      .filter-bar { z-index: 10; }
      .filter-label { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #6c757d; display: block; margin-bottom: 2px; }
      
      .company-tag { 
        background: #e9ecef; color: #495057; font-size: 0.7rem; 
        font-weight: 700; padding: 2px 8px; border-radius: 4px;
        text-transform: uppercase; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }

      .search-results-header { background: #fff; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
      .btn-close-custom { background: #eee; border: none; border-radius: 50%; width: 30px; height: 30px; font-weight: bold; }
      
      .user-result-card {
        background: #fff; border-radius: 12px; padding: 12px; margin-bottom: 12px;
        border-left: 6px solid #07b1f5; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      .status-terminated { border-left-color: #fa5252; }
      .status-inactive { border-left-color: #868e96; }

      .due-highlight { background: #fff5f5; border: 1px solid #ffc9c9; padding: 2px 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; }
      .due-label { font-size: 0.65rem; color: #fa5252; font-weight: 800; }
      .due-value { font-size: 0.9rem; color: #c92a2a; font-weight: 800; }

      .fullname { font-weight: 700; font-size: 1.05rem; color: #212529; }
      .username-id { color: #07b1f5; font-size: 0.85rem; font-weight: 600; }
      
      .address-section { background: #f8f9fa; border-radius: 6px; padding: 6px 10px; margin: 8px 0; border: 1px solid #e9ecef; }
      .address-text { font-size: 0.75rem; color: #495057; }

      .card-footer { display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f1f3f5; }
      .footer-item span { font-weight: 700; font-size: 0.8rem; }
    `}</style>
        </div>
      )}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        className="modal-xl responsive-modal"
      >
        <Modal.Title>
          <h4 className="modal-title modal-title-responsive">
            Online Renew List
          </h4>
        </Modal.Title>
        <Modal.Body className="modal-body-responsive">
          <div className="d-flex flex-column">
            <div className="container-fluid">
              <form className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Select Source</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="table-responsive-wrapper mt-2">
              <table className="table table-responsive">
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
                      (
                        { userid, fullname, mobile, address, source },
                        index,
                      ) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{userid}</td>
                          <td>{fullname}</td>
                          <td>{mobile}</td>
                          <td
                            className="table-cell-truncate"
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
                            <button className="btn btn-primary btn-sm">
                              Done
                            </button>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center" }}>
                        No Recent Renewal Found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showModal2}
        onHide={() => setShowModal2(false)}
        className="responsive-modal"
      >
        <Modal.Header className="modal-header-responsive">
          <Modal.Title className="modal-title-responsive">
            Company and Customer Stats
          </Modal.Title>
          <button
            onClick={downloadUsers}
            className="excel-download-btn"
            title="Download Excel"
          >
            <FileSpreadsheet size={24} />
          </button>
        </Modal.Header>
        <Modal.Body className="modal-body-responsive">
          <ol className="list-group list-group-numbered">
            {uniqueCompanies.map((company, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
              >
                <div className="ms-2 me-auto flex-grow-1">
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
