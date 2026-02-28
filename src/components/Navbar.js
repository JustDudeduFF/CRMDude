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
import {
  FiRefreshCw,
  FiX,
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { io } from "socket.io-client";
import { set } from "date-fns";

export default function Navbar() {
  const name = localStorage.getItem("Name");
  const designation = localStorage.getItem("Designation");
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();
  const socketRef = React.useRef();

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
  const [showConfirm, setShowConfirm] = useState({
    show: false,
    id: null,
  });
  const [dynamicbtntext, setDynamicBtnText] = useState({
    text: "Cancel",
    btnstatus: false,
  });
  const [showAlert, setShowAlert] = useState({
    show: false,
    type: "success",
    message: {},
  });

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

  useEffect(() => {
    socketRef.current = io("https://api.justdude.in:5002", {
      auth: {
        partnerId,
      },
      transports: ["websocket"],
    });


    socketRef.current.on("online-renew-list", (data) => {
      const { eventType, change } = data;


      // Option 1: Simple refetch (safe but heavier)
      fetchRenewals();

      if (eventType === "online-renew-new") {
        const data = change.fullDocument || {};
        setShowAlert({
          show: true,
          type: "success",
          message: {...data},
      });
    }

    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [partnerId]);

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      const response = await API.get(`/navbar/stats?partnerId=${partnerId}`);
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
      const response = await API.get(
        "/navbar/renewals?partnerId=" + partnerId + "&status=Pending",
      );
      if (response.status === 200) {
        setRenewArray(response.data);
        setCurrentRenewal(response.data.length);
      }
    } catch (error) {
      console.error("Error fetching renewals:", error);
    }
  };

  const handleISPRenew = async (id) => {
    setDynamicBtnText({
      text: "Processing...",
      btnstatus: true,
    });
    try {
      const response = await API.put(
        "/navbar/renewal/" +
          id +
          `?partnerId=${partnerId}&status=Completed&user=${localStorage.getItem("contact")}`,
      );

      if (response.status === 200) {
        toast.success("Renewal Processed", { autoClose: 3000 });
        fetchRenewals();
        setShowConfirm({ show: false, id: null });
        setDynamicBtnText({
          text: "Cancel",
          btnstatus: false,
        });
      } else {
        toast.error("Failed To Process Renewal", { autoClose: 3000 });
      }
    } catch (e) {
      console.error("Error processing renewal:", e);
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
                  .filter((user) =>
                    minDue
                      ? Number(user.dueAmount || 0) >= Number(minDue)
                      : true,
                  )
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
        className="modal-xl"
      >
        <Modal.Body>
          <div className="tk-overlay">
            <div className="tk-container" style={{ maxWidth: "1100px" }}>
              {/* Header */}
              <header className="tk-header">
                <div className="tk-header-info">
                  <div
                    className="tk-title-icon"
                    style={{ background: "#f0fdf4", color: "#15803d" }}
                  >
                    <FiRefreshCw size={20} />
                  </div>
                  <div>
                    <h3>Online Renew List</h3>
                    <p>Manage and track recent subscription renewals</p>
                  </div>
                </div>
                <div className="tk-header-actions">
                  <button
                    className="tk-btn-close"
                    onClick={() => setShowModal(false)}
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </header>

              {/* Filters Grid */}
              {/* <div className="tk-filters">
                <div className="tk-filter-grid">
                  <div className="tk-input-group">
                    <label>
                      <FiSearch size={12} /> Search UserID
                    </label>
                    <input placeholder="Search ID..." type="text" />
                  </div>
                  <div className="tk-input-group">
                    <label>
                      <FiClock size={12} /> Select Day
                    </label>
                    <select>
                      <option>Today</option>
                      <option>This Week</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <div className="tk-input-group">
                    <label>Select Source</label>
                    <select>
                      <option>All Sources</option>
                      <option>Web Portal</option>
                      <option>Mobile App</option>
                    </select>
                  </div>
                  <div className="tk-input-group">
                    <label>Status</label>
                    <select>
                      <option>Pending</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
              </div> */}

              {/* Main Content Area */}
              <main className="tk-main">
                <div className="tk-table-wrapper desktop-only">
                  <table className="tk-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>User Details</th>
                        <th>Contact Info</th>
                        <th>Installation Address</th>
                        <th>Source</th>
                        <th>ISP</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renewalArray.length > 0 ? (
                        renewalArray.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <div className="tk-user-cell">
                                <span className="tk-uid">{item.username}</span>
                                <span className="tk-co">
                                  {item.subscriberName}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="tk-user-cell">
                                <span style={{ fontSize: "0.85rem" }}>
                                  {item.mobileNo}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="tk-concern-cell">
                                <p
                                  title={item.address}
                                  style={{ maxWidth: "250px" }}
                                >
                                  {item.address}
                                </p>
                              </div>
                            </td>
                            <td>
                              <span className="tk-status-pill unassigned">
                                {item.source}
                              </span>
                            </td>
                            <td>
                              <span className="tk-status-pill unassigned">
                                {item.isp}
                              </span>
                            </td>
                            <td>
                              <div
                                onClick={() =>
                                  setShowConfirm({ show: true, id: item._id })
                                }
                                className="tk-actions"
                              >
                                <button className="tk-act-btn-done">
                                  <FiCheckCircle size={14} /> Done
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="tk-no-data">
                            No Recent Renewal Found!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </main>

              {/* Footer */}
              <footer className="tk-footer">
                <div className="tk-pagination">
                  <span className="tk-pag-info">
                    Total Records: {renewalArray.length}
                  </span>
                </div>
              </footer>

              <style>{`
.tk-overlay {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
    background: rgba(15, 23, 42, 0.7); 
    backdrop-filter: blur(4px);
    display: flex; 
    align-items: center; 
    justify-content: center; 
    z-index: 9999; 
    padding: 1rem;
}

.tk-container {
    background: #f8fafc; 
    width: 100%; 
    max-width: 1100px; 
    height: 90vh;
    border-radius: 16px; 
    display: flex; 
    flex-direction: column; 
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
}

/* --- Header Section --- */
.tk-header {
    padding: 1.25rem 1.5rem; 
    background: #fff; 
    border-bottom: 1px solid #e2e8f0;
    display: flex; 
    justify-content: space-between; 
    align-items: center;
}

.tk-header-info { 
    display: flex; 
    align-items: center; 
    gap: 1rem; 
}

.tk-title-icon { 
    background: #eff6ff; 
    color: #3b82f6; 
    padding: 10px; 
    border-radius: 10px; 
}

.tk-header-info h3 { 
    margin: 0; 
    font-size: 1.25rem; 
    font-weight: 700; 
    color: #1e293b; 
}

.tk-header-info p { 
    margin: 0; 
    font-size: 0.85rem; 
    color: #64748b; 
}

.tk-btn-close { 
    background: none; 
    border: none; 
    color: #94a3b8; 
    cursor: pointer; 
    transition: 0.2s; 
}

.tk-btn-close:hover { 
    color: #ef4444; 
}

/* --- Filters Grid --- */
.tk-filters { 
    padding: 1.25rem 1.5rem; 
    background: #fff; 
    border-bottom: 1px solid #e2e8f0; 
}

.tk-filter-grid { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 1.25rem; 
}

.tk-input-group { 
    display: flex; 
    flex-direction: column; 
    gap: 6px; 
}

.tk-input-group label { 
    font-size: 0.75rem; 
    font-weight: 600; 
    color: #64748b; 
    display: flex; 
    align-items: center; 
    gap: 4px; 
}

.tk-input-group input, 
.tk-input-group select {
    padding: 8px 12px; 
    border: 1px solid #e2e8f0; 
    border-radius: 8px; 
    font-size: 0.9rem; 
    outline: none; 
    transition: 0.2s;
    background: #fff;
}

.tk-input-group input:focus, 
.tk-input-group select:focus { 
    border-color: #3b82f6; 
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); 
}

/* --- Main Content & Table --- */
.tk-main { 
    flex: 1; 
    overflow-y: auto; 
    padding: 1.5rem; 
}

.tk-table-wrapper { 
    width: 100%; 
    overflow-x: auto; 
}

.tk-table { 
    width: 100%; 
    border-collapse: separate; 
    border-spacing: 0; 
}

.tk-table th { 
    background: #f8fafc; 
    padding: 12px 16px; 
    text-align: left; 
    font-size: 0.8rem; 
    font-weight: 600; 
    color: #64748b; 
    text-transform: uppercase; 
    border-bottom: 1px solid #e2e8f0; 
}

.tk-table td { 
    padding: 16px; 
    border-bottom: 1px solid #f1f5f9; 
    font-size: 0.9rem; 
    color: #334155; 
}

/* --- Cell Styling --- */
.tk-user-cell { 
    display: flex; 
    flex-direction: column; 
}

.tk-uid { 
    font-weight: 700; 
    color: #1e293b; 
}

.tk-co { 
    font-size: 0.75rem; 
    color: #94a3b8; 
}

.tk-concern-cell p { 
    margin: 4px 0 0; 
    font-size: 0.8rem; 
    color: #64748b; 
    max-width: 250px; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
}

.tk-status-pill { 
    padding: 4px 10px; 
    border-radius: 20px; 
    font-size: 0.75rem; 
    font-weight: 600; 
    text-transform: capitalize; 
}

.tk-status-pill.unassigned { 
    background: #f1f5f9; 
    color: #475569; 
}

/* --- Action Button (Done) --- */
.tk-act-btn-done {
    border: none;
    background: #f0fdf4;
    color: #15803d;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: 0.2s;
}

.tk-act-btn-done:hover {
    background: #dcfce7;
    transform: translateY(-1px);
}

/* --- Footer & Empty States --- */
.tk-footer { 
    padding: 1rem 1.5rem; 
    background: #fff; 
    border-top: 1px solid #e2e8f0; 
}

.tk-pagination { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
}

.tk-pag-info { 
    font-size: 0.9rem; 
    color: #64748b; 
    font-weight: 500; 
}

.tk-no-data {
    text-align: center;
    padding: 3rem !important;
    color: #94a3b8;
    font-weight: 500;
}

/* --- Responsive Helpers --- */
.desktop-only { display: table; }

@media (max-width: 900px) {
    .tk-filter-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 500px) {
    .tk-filter-grid { grid-template-columns: 1fr; }
}
    `}</style>
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

      <Modal
        show={showConfirm.show}
        onHide={() => {
          setDynamicBtnText({
            text: "Cancel",
            btnstatus: false,
          });
          setShowConfirm({ show: false, id: null });
        }}
        centered
      >
        <Modal.Body>
          <div className="tk-overlay">
            <div
              className="tk-container"
              style={{ maxWidth: "450px", height: "auto" }}
            >
              {/* Header - Minimal version of your main header */}
              <header
                className="tk-header"
                style={{ borderBottom: "none", paddingBottom: "0.5rem" }}
              >
                <div className="tk-header-info">
                  <div
                    className="tk-title-icon"
                    style={{ background: "#fef2f2", color: "#ef4444" }}
                  >
                    <FiAlertCircle size={20} />
                  </div>
                  <div>
                    <h3>Confirm Action</h3>
                  </div>
                </div>
                <button
                  className="tk-btn-close"
                  onClick={() => {
                    setDynamicBtnText({
                      text: "Cancel",
                      btnstatus: false,
                    });
                    setShowConfirm({ show: false, id: null });
                  }}
                >
                  <FiX size={24} />
                </button>
              </header>

              {/* Body Content */}
              <main
                className="tk-main"
                style={{ textAlign: "center", padding: "1.5rem 2rem" }}
              >
                <div className="tk-confirm-content">
                  <h4
                    style={{
                      color: "#1e293b",
                      marginBottom: "8px",
                      fontSize: "1.1rem",
                    }}
                  >
                    Are you sure?
                  </h4>
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    You are about to mark this renewal as{" "}
                    <strong>Completed</strong>. This action cannot be undone.
                  </p>
                </div>
              </main>

              {/* Footer - Using your button styles */}
              <footer
                className="tk-footer"
                style={{
                  borderTop: "none",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="tk-btn-secondary"
                  onClick={() => setShowConfirm({ show: false, id: null })}
                >
                  {dynamicbtntext.text}
                </button>
                <button
                  onClick={() => handleISPRenew(showConfirm.id)}
                  className="tk-act-btn-done"
                  disabled={dynamicbtntext.btnstatus}
                >
                  Yes, Process it
                </button>
              </footer>
            </div>

            <style>{`/* --- Confirmation Modal Specific Layout --- */

            .tk-overlay {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100%; 
    height: 100%;
    background: rgba(15, 23, 42, 0.7); 
    backdrop-filter: blur(4px);
    display: flex; 
    align-items: center; 
    justify-content: center; 
    z-index: 9999; 
    padding: 1rem;
}

/* Small-sized container for confirmations */
.tk-container-confirm {
    background: #f8fafc; 
    width: 100%; 
    border-radius: 16px; 
    display: flex; 
    flex-direction: column; 
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    animation: tk-modal-pop 0.2s ease-out;
}

.tk-act-btn-done {
    border: none;
    background: #abfac3;
    color: #15803d;
    cursor: pointer;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: 0.2s;
}

.tk-act-btn-done:hover {
    background: #dcfce7;
    transform: translateY(-1px);
}

@keyframes tk-modal-pop {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

/* Central Content Styling */
.tk-confirm-body {
    padding: 2rem 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.tk-confirm-body h4 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e293b;
}

.tk-confirm-body p {
    margin: 0;
    font-size: 0.95rem;
    color: #64748b;
    line-height: 1.5;
}

/* --- Confirmation Buttons --- */

.tk-confirm-footer {
    padding: 1.25rem 1.5rem;
    background: #fff;
    display: flex;
    justify-content: center;
    gap: 12px;
    border-top: 1px solid #f1f5f9;
}

/* Secondary (Cancel) Button */
.tk-btn-secondary {
    flex: 1;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tk-btn-secondary:hover {
    background: #f8fafc;
    color: #1e293b;
    border-color: #cbd5e1;
}

/* Primary (Action) Button */
.tk-btn-primary-action {
    flex: 1;
    border: none;
    background: #3b82f6; /* Use #ef4444 for Delete/Warning actions */
    color: #fff;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.tk-btn-primary-action:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px -1px rgba(59, 130, 246, 0.3);
}

.tk-btn-primary-action:active {
    transform: translateY(0);
}

/* Warning/Danger Variation */
.tk-btn-danger-action {
    background: #ef4444;
}

.tk-btn-danger-action:hover {
    background: #dc2626;
}`}</style>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showAlert.show}
        onHide={() => setShowAlert({ show: false, type: "", message: {} })}
        centered
        size="md"
        className="tk-alert-modal"
      >
        <style>{`
    .tk-alert-modal .modal-content {
      border: none;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
      background: #f8fafc;
    }

    .tk-alert-header {
      padding: 1.25rem 1.5rem;
      background: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: none;
    }

    .tk-alert-icon-box {
      background: #eff6ff;
      color: #3b82f6;
      padding: 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      animation: tk-pulse-ring 2s infinite;
    }

    @keyframes tk-pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
      100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
    }

    .tk-alert-body {
      padding: 2rem 1.5rem;
      text-align: center;
    }

    .tk-alert-title {
      color: #1e293b;
      font-weight: 800;
      font-size: 1.25rem;
      margin-top: 1rem;
    }

    .tk-alert-text {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-top: 0.5rem;
    }

    .tk-info-pill {
      background: #f1f5f9;
      padding: 12px;
      border-radius: 12px;
      margin-top: 1.5rem;
      border: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .tk-alert-footer {
      padding: 1.25rem;
      background: #fff;
      display: flex;
      gap: 12px;
      border: none;
    }

    .tk-btn-dismiss {
      flex: 1;
      background: #fff;
      border: 1px solid #e2e8f0;
      color: #64748b;
      font-weight: 600;
      padding: 10px;
      border-radius: 10px;
      transition: 0.2s;
    }

    .tk-btn-dismiss:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .tk-btn-view {
      flex: 1;
      background: #3b82f6;
      border: none;
      color: #fff;
      font-weight: 600;
      padding: 10px;
      border-radius: 10px;
      transition: 0.2s;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
    }

    .tk-btn-view:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
  `}</style>

        <Modal.Header className="tk-alert-header">
          <div className="d-flex align-items: center">
            <div className="tk-alert-icon-box">
              <FiBell size={22} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Renewal Notification
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Live Update
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAlert({ show: false, type: "", message: {} })}
            style={{ background: "none", border: "none", color: "#94a3b8" }}
          >
            <FiX size={24} />
          </button>
        </Modal.Header>

        <Modal.Body className="tk-alert-body">
          <div
            style={{
              color: "#22c55e",
              background: "#f0fdf4",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            <FiCheckCircle size={30} />
          </div>

          <h4 className="tk-alert-title">New Renewal Detected!</h4>
          <p className="tk-alert-text">
            A subscription has been successfully renewed online <br />
            <strong>User ID: {showAlert.message.username || "Pending"}</strong>
          </p>

          <div className="tk-info-pill">
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Renew Plan: {showAlert.message.planName || "N/A"}
            </span>
            <span
              style={{
                fontWeight: "700",
                color: "#334155",
                fontSize: "0.85rem",
              }}
            >
              {showAlert.message.action || "N/A"}
            </span>
          </div>
        </Modal.Body>

        <Modal.Footer className="tk-alert-footer">
          <button
            className="tk-btn-dismiss"
            onClick={() => setShowAlert({ show: false, type: "", message: {} })}
          >
            Dismiss
          </button>
          <button
            className="tk-btn-view"
            onClick={() => {
              setShowAlert({ show: false, type: "", message: {} });
              setShowModal(true);
            }}
          >
            Open Renew List
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
