import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { 
  User, Mail, Phone, MapPin, AlertTriangle, CheckCircle2, 
  Clock, Calendar, BarChart3, ShieldCheck, Landmark, 
  CreditCard, Hash, QrCode, Briefcase, ChevronRight, 
  FileText, Activity, Loader2, Globe, ArrowUpRight
} from "lucide-react";

// --- Enhanced Sub-Components ---
const StatCard = ({ Icon, title, value, trend, colorClass = "blue" }) => (
  <div className="col-6 col-lg-3 mb-3">
    <div className="card shadow-sm border-0 h-100 overflow-hidden position-relative">
      <div className={`position-absolute top-0 start-0 h-100 bg-${colorClass}`} style={{ width: '4px' }}></div>
      <div className="card-body p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className={`p-2 rounded-circle bg-${colorClass} bg-opacity-10 text-${colorClass}`}>
            <Icon size={20} />
          </div>
          {trend && (
            <span className="badge bg-success bg-opacity-10 text-success small border-0">
              <ArrowUpRight size={12} className="me-1" />{trend}
            </span>
          )}
        </div>
        <p className="text-muted small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{title}</p>
        <h4 className="fw-bold mb-0">{value}</h4>
      </div>
    </div>
  </div>
);

const InfoRow = ({ Icon, label, value, isCode }) => (
  <div className="d-flex align-items-center p-3 mb-2 bg-white border border-light-subtle rounded-4 transition-hover shadow-sm-hover">
    <div className="me-3 p-2 bg-primary bg-opacity-10 text-primary rounded-3">
      <Icon size={18} />
    </div>
    <div className="overflow-hidden">
      <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.5px' }}>{label}</small>
      <span className={`d-block text-truncate fw-semibold ${isCode ? "font-monospace text-primary" : "text-dark"}`}>
        {value || "Not Provided"}
      </span>
    </div>
  </div>
);

const EmployeeProfile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeData, setEmployeeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    complaintsThisMonth: 0,
    avgCloseTime: "0 days",
    totalComplaints: 0,
    resolvedComplaints: 0,
    attendanceRate: "98%",
    performanceScore: "4.5/5.0",
  });

  const { permissions } = usePermissions();
  const empid = localStorage.getItem("empid");
  const empContact = localStorage.getItem("contact");

  // --- Logic: Permissions Formatter (Unchanged) ---
  const formattedPermissions = useMemo(() => {
    if (!permissions) return [];
    const categories = { Write: [], Update: [], Read: [], Delete: [], Action: [] };
    
    permissions.forEach(perm => {
      const formatted = perm.replace(/_/g, " ").toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
        .replace(/\bC\b/g, "Customer").replace(/\bEmp\b/g, "Employee")
        .replace(/\bJc\b/g, "Job Card").replace(/\bMsg\b/g, "Message");

      const up = perm.toUpperCase();
      if (up.includes("ADD") || up.includes("CREATE")) categories.Write.push(formatted);
      else if (up.includes("EDIT") || up.includes("UPDATE") || up.includes("CHANGE")) categories.Update.push(formatted);
      else if (up.includes("VIEW") || up.includes("DOWNLOAD")) categories.Read.push(formatted);
      else if (up.includes("CANCEL") || up.includes("DELETE") || up.includes("REMOVE")) categories.Delete.push(formatted);
      else categories.Action.push(formatted);
    });

    return Object.entries(categories)
      .filter(([_, perms]) => perms.length > 0)
      .map(([category, perms]) => ({ category, perms }));
  }, [permissions]);

  // --- Logic: Data Fetching (Unchanged) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, ticketRes] = await Promise.all([
        API.get(`/employees/${empid}`),
        API.get(`/employees/${empContact}/myactivecomplaints?month=${new Date().getMonth()}`)
      ]);

      if (empRes.status === 200) setEmployeeData(empRes.data);
      if (ticketRes.status === 200) {
        const data = ticketRes.data;
        setStats(prev => ({
          ...prev,
          complaintsThisMonth: data.complaints?.length || 0,
          avgCloseTime: data.averageCloseTime || "0 days",
          totalComplaints: data.complaints?.length || 0,
          resolvedComplaints: data.stats?.Completed || 0,
        }));
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [empid, empContact]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
      <div className="position-relative">
        <Loader2 className="text-primary animate-spin" size={48} />
        <div className="position-absolute top-50 start-50 translate-middle">
          <User size={20} className="text-primary-emphasis" />
        </div>
      </div>
      <p className="mt-3 text-muted fw-bold text-uppercase small tracking-widest">Initialising Profile</p>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light-subtle pb-5">
      <style>{`
        .animate-spin { animation: spin 1.2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .nav-pills .nav-link { 
          color: #64748b; 
          font-weight: 600; 
          padding: 10px 20px; 
          border-radius: 10px;
          font-size: 0.9rem;
        }
        .nav-pills .nav-link.active { 
          background: #0d6efd; 
          box-shadow: 0 10px 15px -3px rgba(13, 110, 253, 0.25);
        }
        .transition-hover { transition: all 0.2s ease; }
        .transition-hover:hover { transform: translateY(-2px); }
        .shadow-sm-hover:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .glass-header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 0 2rem 2rem;
        }
        .avatar-border { border: 5px solid #fff; outline: 1px solid #e2e8f0; }
        .tracking-widest { letter-spacing: 0.1em; }
        @media (max-width: 768px) {
            .glass-header { border-radius: 0; }
            .mt-mobile-neg { margin-top: -60px !important; }
        }
      `}</style>

      {/* Header Section */}
      <div className="glass-header pb-5 pt-4 px-3 mb-5 position-relative">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="badge bg-white bg-opacity-10 text-white px-3 py-2 rounded-pill small d-flex align-items-center backdrop-blur">
              <Calendar size={14} className="me-2" /> 
              Joined {new Date(employeeData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <div className="d-flex gap-2">
                <div className="bg-success rounded-circle" style={{width: '10px', height: '10px'}}></div>
                <small className="text-white-50 fw-bold text-uppercase">
                  Active
                </small>
            </div>
          </div>
          
          <div className="row align-items-center mt-4">
            <div className="col-12 text-center text-md-start">
               <div className="d-md-flex align-items-center gap-4">
                  <div className="position-relative d-inline-block mb-3 mb-md-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${employeeData.FULLNAME}&background=0D6EFD&color=fff&size=200`} 
                      alt="Avatar" 
                      className="rounded-circle avatar-border shadow-lg"
                      style={{ width: '130px', height: '130px', objectFit: 'cover' }}
                    />
                    <div className="position-absolute bottom-0 end-0 bg-success border border-3 border-white rounded-circle p-2" title="Status: Active"></div>
                  </div>
                  <div className="text-white">
                    <h1 className="fw-black mb-1 display-6">{employeeData.FULLNAME}</h1>
                    <div className="d-flex flex-wrap justify-content-center justify-content-md-start align-items-center gap-3 opacity-75">
                      <span className="d-flex align-items-center"><Briefcase size={16} className="me-2" /> {employeeData.DESIGNATION}</span>
                      <span className="d-none d-md-inline">|</span>
                      <span className="d-flex align-items-center"><MapPin size={16} className="me-2" /> {employeeData.MARKING_OFFICE}</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xl mt-mobile-neg">
        {/* Quick Stats Grid */}
        <div className="row g-3 mb-4">
          <StatCard Icon={FileText} title="Active Tasks" value={stats.complaintsThisMonth} colorClass="primary" trend="+2.4%" />
          <StatCard Icon={CheckCircle2} title="Resolved" value={stats.resolvedComplaints} colorClass="success" />
          <StatCard Icon={Clock} title="Efficiency" value={stats.avgCloseTime} colorClass="info" />
          <StatCard Icon={BarChart3} title="Perf. Score" value={stats.performanceScore} colorClass="warning" />
        </div>

        {/* Floating Navigation */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 sticky-top offset-top-header" style={{ top: '20px', zIndex: 100 }}>
          <div className="card-body p-2 overflow-auto text-nowrap">
            <ul className="nav nav-pills nav-justified gap-2 flex-nowrap">
              {['overview', 'account', 'attendance', 'permissions'].map(t => (
                <li key={t} className="nav-item">
                  <button className={`nav-link text-capitalize border-0 ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5">
                
                {activeTab === "overview" && (
                  <div className="row g-5">
                    <div className="col-lg-7">
                      <h5 className="fw-bold mb-4 d-flex align-items-center">
                        <User size={20} className="me-2 text-primary" /> Profile Identity
                      </h5>
                      <div className="row g-3">
                        <div className="col-md-6"><InfoRow Icon={Mail} label="Email Address" value={employeeData.GMAIL} /></div>
                        <div className="col-md-6"><InfoRow Icon={Phone} label="Contact Mobile" value={employeeData.MOBILE} /></div>
                        <div className="col-md-6"><InfoRow Icon={Globe} label="Region Office" value={employeeData.MARKING_OFFICE} /></div>
                        <div className="col-md-6"><InfoRow Icon={Hash} label="System Identifier" value={employeeData._id} isCode /></div>
                      </div>
                    </div>
                    <div className="col-lg-5">
                      <div className="bg-primary bg-opacity-10 p-4 rounded-4 h-100 border border-primary border-opacity-10">
                        <h6 className="fw-bold mb-4 d-flex align-items-center text-primary">
                          <Activity size={18} className="me-2" /> Month Performance
                        </h6>
                        <div className="text-center py-3 mb-4">
                            <h2 className="display-4 fw-black text-primary mb-0">
                                {Math.round((stats.resolvedComplaints / stats.totalComplaints) * 100) || 0}%
                            </h2>
                            <small className="text-muted fw-bold text-uppercase tracking-widest">Resolution Rate</small>
                        </div>
                        <div className="progress mb-3 bg-white" style={{ height: '10px' }}>
                          <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${(stats.resolvedComplaints / stats.totalComplaints) * 100}%` }}></div>
                        </div>
                        <p className="small text-muted mb-0">
                          Based on <strong>{stats.totalComplaints}</strong> tickets assigned in the current billing cycle.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="p-4 border border-light-subtle rounded-4 bg-light bg-opacity-50">
                        <h6 className="text-uppercase text-muted fw-bold mb-4 d-flex align-items-center">
                            <Landmark size={18} className="me-2" /> Disbursement Channel
                        </h6>
                        <InfoRow Icon={Landmark} label="Bank Institution" value={employeeData.BANKNAME} />
                        <InfoRow Icon={CreditCard} label="Settlement Account" value={employeeData.ACCOUNTNO} isCode />
                        <InfoRow Icon={ChevronRight} label="Routing Code (IFSC)" value={employeeData.IFSC} isCode />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="p-4 border border-light-subtle rounded-4 h-100">
                        <h6 className="text-uppercase text-muted fw-bold mb-4 d-flex align-items-center">
                            <QrCode size={18} className="me-2" /> Digital Payments
                        </h6>
                        <InfoRow Icon={QrCode} label="Personal UPI Alias" value={employeeData.UPI} isCode />
                        <div className="alert alert-warning border-0 bg-warning bg-opacity-10 text-warning-emphasis rounded-4 mt-4 d-flex">
                          <AlertTriangle size={24} className="me-3 flex-shrink-0" />
                          <div>
                            <span className="fw-bold d-block mb-1">Update Protocol</span>
                            <small>Sensitive financial data is locked. Contact your regional manager to initiate a change request.</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "permissions" && (
                  <div className="row g-4">
                    {formattedPermissions.map((cat, i) => (
                      <div key={i} className="col-md-6 col-lg-4">
                        <div className="card h-100 border border-light-subtle shadow-sm transition-hover">
                          <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                            <div className="d-flex align-items-center text-primary">
                              <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                <ShieldCheck size={20} />
                              </div>
                              <h6 className="fw-black mb-0 text-uppercase tracking-wider" style={{fontSize: '0.8rem'}}>{cat.category}</h6>
                            </div>
                          </div>
                          <div className="card-body px-4 pb-4">
                            <hr className="my-3 opacity-10" />
                            <div className="d-flex flex-column gap-3">
                              {cat.perms.map((p, pi) => (
                                <div key={pi} className="d-flex align-items-center">
                                  <CheckCircle2 size={16} className="text-success me-3 flex-shrink-0" />
                                  <span className="text-dark-emphasis fw-medium" style={{fontSize: '0.85rem'}}>{p}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "attendance" && (
                  <div className="text-center py-5">
                    <div className="bg-light d-inline-block p-4 rounded-circle mb-4">
                        <Calendar size={48} className="text-muted opacity-50" />
                    </div>
                    <h5 className="fw-bold">Synchronising Logs</h5>
                    <p className="text-muted mx-auto" style={{maxWidth: '300px'}}>Your attendance history is being updated from the biometric server. Please check back in a few minutes.</p>
                    <div className="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;