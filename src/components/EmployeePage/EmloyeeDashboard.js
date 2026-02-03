import React, { useEffect, useState, useCallback } from "react";
import "./EmpCSS.css";
import { Link, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NewEmployee from "./NewEmployee";
import EmpDash from "./EmpDash";
import { API, api2 } from "../../FirebaseConfig";
import EmpDetails from "./EmpDetails";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { 
  Users, UserPlus, Search, ChevronRight, User, 
  Phone, Loader2, Menu, X 
} from "lucide-react";

export default function EmloyeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [filterEmployees, setFilterEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const fetchEmp = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status === 200) setEmployees(response.data);
    } catch (e) {
      toast.error("Network Error: Could not fetch employees");
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { fetchEmp(); }, [fetchEmp]);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    setFilterEmployees(employees.filter(emp => 
      emp.empname?.toLowerCase().includes(searchLower) || 
      emp.empmobile?.toLowerCase().includes(searchLower)
    ));
  }, [search, employees]);

  const showEmpDetail = (id) => {
    navigate("/dashboard/employees/empdetail", { state: { mobile: id } });
  };

  return (
    <div className="employee-dashboard-wrapper bg-light min-vh-100">
      <ToastContainer />

      {/* --- Mobile Navigation Header --- */}
      <div className="d-lg-none d-flex align-items-center justify-content-between p-3 bg-white shadow-sm sticky-top">
        <button className="btn btn-light border-0" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <h6 className="mb-0 fw-bold text-primary">Employee Manager</h6>
        <Link to="/dashboard/employees/newemployee" className="text-primary">
          <UserPlus size={22} />
        </Link>
      </div>

      <div className="container-fluid p-0">
        <div className="row g-0">
          
          {/* --- Sidebar (Hidden on Mobile, Drawer Style) --- */}
          <div className={`col-lg-3 col-xl-2 employee-sidebar-container ${isSidebarOpen ? 'show-sidebar' : ''}`}>
            {/* Backdrop for mobile */}
            <div className="sidebar-backdrop d-lg-none" onClick={() => setIsSidebarOpen(false)}></div>
            
            <aside className="employee-sidebar bg-white border-end h-100 d-flex flex-column">
              <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-white sticky-top">
                <span className="fw-bold text-muted small text-uppercase">Directory</span>
                <button className="btn d-lg-none p-0" onClick={() => setIsSidebarOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-3">
                <div className="position-relative">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                  <input
                    className="form-control ps-5 bg-light border-0 py-2 rounded-3"
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-grow-1 overflow-auto">
                {loading ? (
                  <div className="text-center p-5"><Loader2 className="animate-spin text-primary" /></div>
                ) : (
                  <ul className="list-unstyled mb-0">
                    {filterEmployees.map((emp) => (
                      <li key={emp._id} onClick={() => showEmpDetail(emp._id)} className="employee-list-item px-3 py-3 border-bottom d-flex align-items-center justify-content-between cursor-pointer">
                        <div className="d-flex align-items-center truncate">
                          <div className="avatar-sm bg-primary bg-opacity-10 text-primary rounded-circle p-2 me-3">
                            <User size={18} />
                          </div>
                          <div className="text-truncate" style={{ maxWidth: '140px' }}>
                            <div className="fw-bold text-dark small text-truncate">{emp.empname}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{emp.empmobile}</div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-muted" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>

          {/* --- Main Content Area --- */}
          <div className="col-lg-9 col-xl-10 main-content-area vh-100 overflow-auto">
            {/* Desktop-only Header */}
            <div className="d-none d-lg-flex justify-content-between align-items-center p-4 bg-white border-bottom">
              <h4 className="fw-bold mb-0">Employee Portal</h4>
              <Link to="/dashboard/employees/newemployee" className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2">
                <UserPlus size={18} /> Add New
              </Link>
            </div>

            <div className="p-3 p-md-4">
              <Routes>
                <Route path="/" element={<EmpDash />} />
                <Route path="empdetail/*" element={<EmpDetails />} />
                <Route path="newemployee/*" element={<NewEmployee />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop & Layout Logic */
        .main-content-area { background: #f8f9fa; }
        .employee-list-item:hover { background-color: #f1f5f9; cursor: pointer; }
        
        /* Sidebar Mobile Drawer Logic */
        @media (max-width: 991.98px) {
          .employee-sidebar-container {
            position: fixed;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            z-index: 1050;
            transition: left 0.3s ease;
          }
          .employee-sidebar-container.show-sidebar {
            left: 0;
          }
          .employee-sidebar {
            width: 280px;
            position: relative;
            z-index: 1051;
            box-shadow: 5px 0 15px rgba(0,0,0,0.1);
          }
          .sidebar-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(2px);
          }
          .main-content-area {
            height: calc(100vh - 60px) !important;
          }
        }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}