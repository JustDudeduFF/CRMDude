import React, { useEffect, useState } from "react";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";
import { api2 } from "../../FirebaseConfig";

const EmployeeProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeData, setEmployeeData] = useState({});
  const [stats, setStats] = useState({
    complaintsThisMonth: 0,
    avgCloseTime: "0 days",
    totalComplaints: 0,
    resolvedComplaints: 0,
    attendanceRate: "0%",
    performanceScore: "0/5.0",
  });
  const { permissions } = usePermissions();
  const empid = localStorage.getItem("empid");
  const empContact = localStorage.getItem("contact");

  // Function to format backend permissions into categorized array
  const formatPermissionsForUI = (backendPermissions) => {
    // Helper function to format permission names
    const formatPermissionName = (permission) => {
      return permission
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .replace(/\bC\b/g, "Customer") // Replace 'C' with 'Customer'
        .replace(/\bEmp\b/g, "Employee") // Replace 'Emp' with 'Employee'
        .replace(/\bJc\b/g, "Job Card") // Replace 'Jc' with 'Job Card'
        .replace(/\bMsg\b/g, "Message"); // Replace 'Msg' with 'Message'
    };

    // Categorize permissions
    const categorizePermissions = (permissionList) => {
      const categories = {
        Write: [], // CREATE operations (ADD, CREATE)
        Update: [], // UPDATE operations (EDIT, UPDATE, CHANGE)
        Read: [], // READ operations (VIEW, DOWNLOAD)
        Delete: [], // DELETE operations (CANCEL, DELETE, REMOVE)
        Action: [], // Other specific actions
      };

      permissionList.forEach((permission) => {
        const upperPerm = permission.toUpperCase();
        const formattedName = formatPermissionName(permission);

        if (upperPerm.includes("ADD") || upperPerm.includes("CREATE")) {
          categories["Write"].push(formattedName);
        } else if (
          upperPerm.includes("EDIT") ||
          upperPerm.includes("UPDATE") ||
          upperPerm.includes("CHANGE")
        ) {
          categories["Update"].push(formattedName);
        } else if (
          upperPerm.includes("VIEW") ||
          upperPerm.includes("DOWNLOAD")
        ) {
          categories["Read"].push(formattedName);
        } else if (
          upperPerm.includes("CANCEL") ||
          upperPerm.includes("DELETE") ||
          upperPerm.includes("REMOVE")
        ) {
          categories["Delete"].push(formattedName);
        } else {
          categories["Action"].push(formattedName);
        }
      });

      // Filter out empty categories and format for UI
      return Object.entries(categories)
        .filter(([category, permissions]) => permissions.length > 0)
        .map(([category, permissions]) => ({
          category,
          permissions,
        }));
    };

    return categorizePermissions(backendPermissions);
  };

  // Sample employee data
  const employee = {
    id: "EMP001",
    name: "Sarah Johnson",
    position: "Senior Software Engineer",
    department: "Engineering",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    email: "sarah.johnson@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "March 15, 2022",
    employeeId: "ENG-001",
    manager: "John Smith",
    status: "Active",
  };

  const accountDetails = {
    salary: "$95,000",
    bankAccount: "**** **** **** 1234",
    taxId: "***-**-1234",
    benefits: ["Health Insurance", "Dental", "401k", "PTO"],
    workSchedule: "Monday - Friday, 9:00 AM - 5:00 PM",
  };

  const attendanceData = [
    {
      date: "2024-07-26",
      status: "Present",
      checkIn: "9:05 AM",
      checkOut: "5:15 PM",
      hours: "8h 10m",
    },
    {
      date: "2024-07-25",
      status: "Present",
      checkIn: "8:55 AM",
      checkOut: "5:30 PM",
      hours: "8h 35m",
    },
    {
      date: "2024-07-24",
      status: "Present",
      checkIn: "9:10 AM",
      checkOut: "5:05 PM",
      hours: "7h 55m",
    },
    {
      date: "2024-07-23",
      status: "Present",
      checkIn: "9:00 AM",
      checkOut: "5:20 PM",
      hours: "8h 20m",
    },
    {
      date: "2024-07-22",
      status: "Absent",
      checkIn: "-",
      checkOut: "-",
      hours: "-",
    },
    {
      date: "2024-07-21",
      status: "Present",
      checkIn: "8:45 AM",
      checkOut: "5:10 PM",
      hours: "8h 25m",
    },
    {
      date: "2024-07-20",
      status: "Present",
      checkIn: "9:15 AM",
      checkOut: "5:25 PM",
      hours: "8h 10m",
    },
  ];

  const permission = formatPermissionsForUI(permissions);

  const StatCard = ({ icon, title, value, trend, colorClass = "warning" }) => (
    <div className="col-md-6 col-lg-3 mb-3">
      <div
        className="card shadow-sm h-100"
        style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h6 className="text-muted mb-2">{title}</h6>
              <h3 className={`text-${colorClass} mb-1 fw-bold`}>{value}</h3>
              {trend && (
                <small className="text-success">
                  <i className="fas fa-arrow-up me-1"></i>
                  {trend}
                </small>
              )}
            </div>
            <div
              className={`bg-${colorClass} bg-opacity-10`}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className={`fas ${icon} text-${colorClass}`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, active, onClick }) => (
    <li className="nav-item" role="presentation">
      <button
        className={`nav-link fw-semibold ${active ? "active" : ""}`}
        style={{ borderRadius: "8px", marginRight: "8px" }}
        onClick={() => onClick(id)}
        type="button"
      >
        {label}
      </button>
    </li>
  );

  const fetchEmpData = async () => {
    try {
      const response = await axios.get(api2 + "/employees/" + empid);
      if (response.status === 200) {
        setEmployeeData(response.data);
      }
    } catch (e) {
      console.log("Error fetching attendance data:", e);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get(
        `${api2}/employees/${"9266125451"}/myactivecomplaints?month=${new Date().getMonth()}`
      );
      if (response.status === 200) {
        const data = response.data;
        setStats({
          complaintsThisMonth: data.complaints.length,
          avgCloseTime: data.averageCloseTime || "0 days",
          totalComplaints: data.complaints.length,
          resolvedComplaints: data.stats.Completed || 0,
          attendanceRate: "100%", // Placeholder, replace with actual logic
          performanceScore: "4.5/5.0", // Placeholder, replace with actual logic
        });
      } else {
        console.error("Failed to fetch tickets:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchEmpData();
    fetchTickets();
  }, []);

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        rel="stylesheet"
      />

      <div
        style={{
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          marginTop: "60px",
        }}
      >
        <div className="container-fluid px-4 py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              {/* Header Card */}
              <div className="card mb-4 shadow-sm">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="rounded-circle"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          border: "4px solid #e3f2fd",
                        }}
                      />
                    </div>
                    <div className="col">
                      <h1 className="h2 mb-1 fw-bold">
                        {employeeData.FULLNAME}
                      </h1>
                      <h5 className="text-muted mb-1">
                        {employeeData.DESIGNATION}
                      </h5>
                      <p className="text-secondary mb-2">
                        {employee.department} Department
                      </p>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-success d-flex align-items-center">
                          <i className="fas fa-check-circle me-1"></i>{" "}
                          {employee.status}
                        </span>
                        <small className="text-muted">
                          ID: {employeeData._id}
                        </small>
                      </div>
                    </div>
                    <div className="col-auto text-end">
                      <small className="text-muted d-block">Joined</small>
                      <strong className="h6">
                        {new Date(employeeData.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="row mb-4">
                <StatCard
                  icon="fa-file-alt"
                  title="You get Complaints This Month"
                  value={stats.complaintsThisMonth}
                  colorClass="warning"
                />
                <StatCard
                  icon="fa-clock"
                  title="Avg Close Time"
                  value={stats.avgCloseTime}
                  trend="-15% vs last month"
                  colorClass="success"
                />
                <StatCard
                  icon="fa-calendar"
                  title="Attendance Rate"
                  value={stats.attendanceRate}
                  trend="+2% vs last month"
                  colorClass="primary"
                />
                <StatCard
                  icon="fa-chart-bar"
                  title="Performance Score"
                  value={stats.performanceScore}
                  trend="+0.3 vs last quarter"
                  colorClass="info"
                />
              </div>

              {/* Navigation Tabs */}
              <ul className="nav nav-pills mb-4" role="tablist">
                <TabButton
                  id="overview"
                  label="Overview"
                  active={activeTab === "overview"}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="account"
                  label="Account Details"
                  active={activeTab === "account"}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="attendance"
                  label="Attendance"
                  active={activeTab === "attendance"}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="permissions"
                  label="Permissions"
                  active={activeTab === "permissions"}
                  onClick={setActiveTab}
                />
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        {/* Personal Details */}
                        <div className="card shadow-sm h-100">
                          <div className="card-header bg-white border-bottom">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-user text-primary me-2"></i>
                              Personal Details
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-12">
                                <div className="d-flex align-items-center">
                                  <i className="fas fa-envelope text-secondary me-3"></i>
                                  <div>
                                    <small className="text-muted d-block">
                                      Email
                                    </small>
                                    <strong>{employeeData.GMAIL}</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="d-flex align-items-center">
                                  <i className="fas fa-phone text-secondary me-3"></i>
                                  <div>
                                    <small className="text-muted d-block">
                                      Phone
                                    </small>
                                    <strong>{employeeData.MOBILE}</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="d-flex align-items-center">
                                  <i className="fas fa-map-marker-alt text-secondary me-3"></i>
                                  <div>
                                    <small className="text-muted d-block">
                                      Office Location
                                    </small>
                                    <strong>
                                      {employeeData.MARKING_OFFICE}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6 mb-4">
                        {/* Complaint Statistics */}
                        <div className="card shadow-sm h-100">
                          <div className="card-header bg-white border-bottom">
                            <h5 className="card-title mb-0">
                              <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                              Complaint Statistics
                            </h5>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-12">
                                <div className="p-3 bg-warning bg-opacity-10 rounded">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold text-warning-emphasis">
                                      Total Complaints
                                    </span>
                                    <span className="h4 mb-0 fw-bold text-warning">
                                      {stats.totalComplaints}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 bg-success bg-opacity-10 rounded">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold text-success-emphasis">
                                      Resolved
                                    </span>
                                    <span className="h4 mb-0 fw-bold text-success">
                                      {stats.resolvedComplaints}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-3 bg-danger bg-opacity-10 rounded">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold text-danger-emphasis">
                                      Pending
                                    </span>
                                    <span className="h4 mb-0 fw-bold text-danger">
                                      {stats.totalComplaints -
                                        stats.resolvedComplaints}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-12">
                                <hr />
                                <div className="d-flex justify-content-between text-muted mb-2">
                                  <small>Resolution Rate</small>
                                  <small>
                                    {Math.round(
                                      (stats.resolvedComplaints /
                                        stats.totalComplaints) *
                                        100
                                    )}
                                    %
                                  </small>
                                </div>
                                <div
                                  className="progress"
                                  style={{ height: "8px" }}
                                >
                                  <div
                                    className="progress-bar bg-success"
                                    style={{
                                      width: `${
                                        (stats.resolvedComplaints /
                                          stats.totalComplaints) *
                                        100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Details Tab */}
                {activeTab === "account" && (
                  <div className="tab-pane fade show active">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white">
                        <h5 className="card-title mb-0">Account Details</h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                Bank Name
                              </label>
                              <p className="h5 font-monospace">
                                {employeeData.BANKNAME}
                              </p>
                            </div>
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                Bank Account Number
                              </label>
                              <p className="h5 font-monospace">
                                {employeeData.ACCOUNTNO}
                              </p>
                            </div>
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                Bank IFSC Code
                              </label>
                              <p className="h5 font-monospace">
                                {employeeData.IFSC}
                              </p>
                            </div>
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                UPI ID
                              </label>
                              <p className="h5 font-monospace">
                                {employeeData.UPI}
                              </p>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                Work Schedule
                              </label>
                              <p className="h6">
                                {accountDetails.workSchedule}
                              </p>
                            </div>
                            <div className="mb-4">
                              <label className="form-label text-muted fw-semibold">
                                Benefits
                              </label>
                              <div className="d-flex flex-wrap gap-2">
                                {accountDetails.benefits.map(
                                  (benefit, index) => (
                                    <span
                                      key={index}
                                      className="badge bg-primary"
                                    >
                                      {benefit}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendance Tab */}
                {activeTab === "attendance" && (
                  <div className="tab-pane fade show active">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white">
                        <h5 className="card-title mb-0">Recent Attendance</h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead
                              style={{
                                backgroundColor: "#f8f9fa",
                                borderBottom: "2px solid #dee2e6",
                              }}
                            >
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Check In</th>
                                <th className="px-4 py-3">Check Out</th>
                                <th className="px-4 py-3">Hours</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendanceData.map((record, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 fw-semibold">
                                    {record.date}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`badge ${
                                        record.status === "Present"
                                          ? "bg-success"
                                          : "bg-danger"
                                      }`}
                                    >
                                      <i
                                        className={`fas ${
                                          record.status === "Present"
                                            ? "fa-check"
                                            : "fa-times"
                                        } me-1`}
                                      ></i>
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-muted">
                                    {record.checkIn}
                                  </td>
                                  <td className="px-4 py-3 text-muted">
                                    {record.checkOut}
                                  </td>
                                  <td className="px-4 py-3 text-muted">
                                    {record.hours}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Permissions Tab */}
                {activeTab === "permissions" && (
                  <div className="tab-pane fade show active">
                    <div className="card shadow-sm">
                      <div className="card-header bg-white">
                        <h5 className="card-title mb-0">
                          <i className="fas fa-shield-alt text-primary me-2"></i>
                          System Permissions
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {permission.map((category, index) => (
                            <div key={index} className="col-md-6 mb-4">
                              <div
                                className="p-4"
                                style={{
                                  border: "1px solid #dee2e6",
                                  borderRadius: "8px",
                                  transition: "box-shadow 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.boxShadow =
                                    "0 2px 8px rgba(0,0,0,0.1)")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.boxShadow = "none")
                                }
                              >
                                <h6 className="fw-bold mb-3">
                                  {category.category}
                                </h6>
                                <div className="d-grid gap-2">
                                  {category.permissions.map(
                                    (permission, permIndex) => (
                                      <div
                                        key={permIndex}
                                        className="d-flex align-items-center"
                                      >
                                        <i className="fas fa-check-circle text-success me-2"></i>
                                        <small>{permission}</small>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfile;
