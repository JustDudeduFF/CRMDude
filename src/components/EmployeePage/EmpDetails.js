import {  API } from "../../FirebaseConfig";
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { 
  User, ShieldCheck, CreditCard, FileText, 
  Save, X, Edit3, ChevronRight, Briefcase, Clock, 
  MapPin, Mail, Landmark, CheckCircle2, AlertCircle
} from "lucide-react";

export default function EmpDetails() {
  const location = useLocation();
  const { mobile } = location.state || {};
  const partnerId = localStorage.getItem("partnerId");

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); 
  const [isEditing, setIsEditing] = useState(false);

  const [empData, setEmpData] = useState({
    _id: "", FULLNAME: "", MOBILE: "", GMAIL: "", ADDRESS: "",
    AADHAR: "", DRIVING: "", PAN: "", BANKNAME: "", ACCOUNTNO: "",
    IFSC: "", ACCOUNTNAME: "", UPI: "", INTIME_H: "", INTIME_M: "",
    OUTTIME_H: "", OUTTIME_M: "", MARKING_OFFICE: "", DESIGNATION: "",
    USERTYPE: "", DOJ: "", status: "active",
  });

  const [arrayoffice, setArrayOffice] = useState([]);
  const [arraydesignation, setArraydesignation] = useState([]);

  // Permissions (Kept exactly as original)
  const [customerpermission, setCustomerPermission] = useState({ VIEW_CUSTOMER: false, ADD_CUSTOMER: false, RENEW_PLAN: false, CHANGE_PLAN: false, EDIT_C_PLAN: false, EDIT_C_INFO: false, CREATE_TICKET: false, CLOSE_TICKET: false, REASSING_TICKET: false, ROLLBACK_PLAN: false, RESEND_CODE: false });
  const [masterpermission, setMasterPermission] = useState({ ADD_PLAN: false, ADD_TICKET_CONCERNS: false, ADD_DEVICE_MAKER: false, ADD_ISP: false, ADD_DESIGNATION: false, ADD_COMPANY: false, ADD_COLONY: false, ADD_DEBIT_CREDIT_CONCERN: false });
  const [leadpermission, setLeadPermission] = useState({ ADD_LEAD: false, CANCEL_LEAD: false, EDIT_LEAD: false, CONVERT_TO_LEAD: false });
  const [paymentpermission, setPaymentPermission] = useState({ COLLECT_PAYMENT: false, PAYMENT_AUTHORIZATION: false, EDIT_PAYMENT: false, CREATE_DEBIT: false, CREATE_CREDIT: false, DOWNLOAD_INVOICE: false, CANCEL_RECEIPT: false });
  const [networkpermission, setNetworkPermission] = useState({ VIEW_RACK: false, UPDATE_RACK: false, ADD_JC: false, ADD_RACK_DEVICE: false });
  const [attendencepermission, setAttendencePermission] = useState({ MARK_ATTENDENCE: false, MARK_ANYWHERE: false, VIEW_ATTENDENCE: false });
  const [payoutpermission, setPayoutPermission] = useState({ VIEW_PAYOUT: false });
  const [messagepermission, setMessagePermission] = useState({ MSG_DUE: false, MSG_EXPIRING: false, MSG_EXPIRED: false, MSG_BULK: false, MSG_PROMOTIONAL: false });
  const [inventorypermission, setInventoryPermission] = useState({ VIEW_INVENTORY: false, CHANGE_DEVICE_STATUS: false, ASSIGN_DEVICE: false, ADD_DEVICE: false });
  const [employeepermission, setEmployeePermission] = useState({ VIEW_EMP: false, EDIT_EMP: false, EDIT_EMP_PERMISSION: false, ADD_EMP: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpData((prev) => ({ ...prev, [name]: value }));
  };

  const createToggleAll = (setter) => (e) => {
    const isChecked = e.target.checked;
    setter(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => updated[key] = isChecked);
      return updated;
    });
  };

  const createIndividualChange = (setter) => (e) => {
    const { name, checked } = e.target;
    setter(prev => ({ ...prev, [name]: checked }));
  };

  const getDetails = useCallback(async () => {
    if (!mobile) return;
    setIsLoading(true);
    try {
      const response = await API.get(`/employees/${mobile}`);
      const u = response.data;
      if (u) {
        setEmpData({ ...u, FULLNAME: u.FULLNAME || "" });
        if (u.customerpermission) setCustomerPermission(u.customerpermission);
        if (u.masterpermission) setMasterPermission(u.masterpermission);
        if (u.leadpermission) setLeadPermission(u.leadpermission);
        if (u.paymentpermission) setPaymentPermission(u.paymentpermission);
        if (u.networkpermission) setNetworkPermission(u.networkpermission);
        if (u.attendencepermission) setAttendencePermission(u.attendencepermission);
        if (u.payoutpermission) setPayoutPermission(u.payoutpermission);
        if (u.messagepermission) setMessagePermission(u.messagepermission);
        if (u.inventorypermission) setInventoryPermission(u.inventorypermission);
        if (u.employeepermission) setEmployeePermission(u.employeepermission);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [mobile]);

  useEffect(() => {
    getDetails();
    const fetchMasters = async () => {
      try {
        const offRes = await API.get(`/master/offices?partnerId=${partnerId}`);
        const desRes = await API.get(`/master/designations?partnerId=${partnerId}`);
        setArrayOffice(offRes.data || []);
        setArraydesignation(desRes.data || []);
      } catch (err) { console.error(err); }
    };
    fetchMasters();
  }, [getDetails, partnerId]);

  const handleSave = async () => {
    try {
      const allData = { 
        ...empData, customerpermission, masterpermission, leadpermission, 
        paymentpermission, networkpermission, attendencepermission, 
        payoutpermission, messagepermission, inventorypermission, employeepermission 
      };
      await API.put(`/employees/${mobile}`, allData);
      toast.success("Details updated successfully");
      setIsEditing(false);
    } catch (e) {
      toast.error("Update failed");
    }
  };

  const PermissionSection = ({ title, state, setter, icon: Icon }) => (
    <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom px-4">
        <div className="d-flex align-items-center gap-2">
          {Icon && <Icon size={18} className="text-primary" />}
          <h6 className="mb-0 fw-bold text-dark">{title}</h6>
        </div>
        <div className="form-check form-switch">
          <input 
            className="form-check-input custom-switch" 
            type="checkbox" 
            disabled={!isEditing}
            onChange={createToggleAll(setter)}
            checked={Object.values(state).every(v => v === true) && Object.values(state).length > 0}
          />
        </div>
      </div>
      <div className="card-body bg-light bg-opacity-25 px-4 py-3">
        <div className="row g-3">
          {Object.keys(state).map(key => (
            <div key={key} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <label className={`permission-tile d-flex align-items-center justify-content-between gap-2 p-3 rounded-3 border transition-all ${state[key] ? 'bg-white border-primary-subtle shadow-sm' : 'bg-white border-light opacity-75'}`}>
                <div className="d-flex align-items-center gap-2 overflow-hidden">
                  <input 
                     type="checkbox" 
                     name={key}
                     checked={state[key]} 
                     disabled={!isEditing}
                     onChange={createIndividualChange(setter)}
                     className="form-check-input flex-shrink-0"
                  />
                  <span className={`small fw-medium text-capitalize text-truncate ${state[key] ? 'text-dark' : 'text-muted'}`}>
                    {key.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </div>
                {state[key] && <CheckCircle2 size={14} className="text-success flex-shrink-0" />}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="employee-details-page bg-light min-vh-100 pb-5">
      <ToastContainer position="bottom-center" />
      
      {/* --- Responsive Header --- */}
      <header className="bg-white shadow-sm border-bottom sticky-top" style={{ zIndex: 1020 }}>
        <div className="container-fluid px-3 px-md-4 py-3">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-square bg-primary-subtle text-primary d-flex align-items-center justify-content-center rounded-3 shadow-sm">
                <User size={24} />
              </div>
              <div className="overflow-hidden">
                <h5 className="mb-0 fw-bold text-dark text-truncate">{empData.FULLNAME || "Employee Detail"}</h5>
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <span className={`badge ${empData.status === 'active' ? 'bg-success' : 'bg-danger'} rounded-pill`} style={{ fontSize: '10px' }}>
                    {empData.status}
                  </span>
                  <span className="d-none d-sm-inline">•</span>
                  <span className="d-flex align-items-center gap-1"><Briefcase size={12} /> {empData.DESIGNATION || 'General'}</span>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              {!isEditing ? (
                <button className="btn btn-primary rounded-3 px-3 px-md-4 d-flex align-items-center gap-2 shadow-sm" onClick={() => setIsEditing(true)}>
                  <Edit3 size={18} /> <span className="d-none d-md-inline">Edit Profile</span>
                </button>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-success rounded-3 px-3 px-md-4 d-flex align-items-center gap-2 shadow-sm" onClick={handleSave}>
                    <Save size={18} /> <span className="d-none d-md-inline">Save Changes</span>
                  </button>
                  <button className="btn btn-outline-secondary rounded-3 px-3 shadow-sm" onClick={() => setIsEditing(false)}>
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex gap-4 mt-3 mb-n3 nav-tabs-modern">
            <button className={`nav-tab-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Basic Info</button>
            <button className={`nav-tab-item ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>Access Rights</button>
          </div>
        </div>
      </header>

      <main className="container-fluid p-3 p-md-4">
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-5">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted animate-pulse">Loading employee data...</p>
          </div>
        ) : (
          <div className="row g-4 animate-fade-in">
            {activeTab === 'profile' ? (
              <>
                {/* Left Column: Core Data */}
                <div className="col-12 col-lg-8">
                  <section className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <div className="p-2 bg-primary bg-opacity-10 rounded-2 text-primary">
                        <FileText size={20} />
                      </div>
                      <h6 className="fw-bold mb-0">Personal & Employment</h6>
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-muted" style={{ letterSpacing: '0.5px' }}>Full Name</label>
                        <div className="input-group input-group-merge">
                          <span className="input-group-text bg-light border-0"><User size={16}/></span>
                          <input name="FULLNAME" value={empData.FULLNAME} onChange={handleChange} readOnly={!isEditing} className={`form-control border-0 bg-light ${isEditing ? 'border-primary-subtle' : ''}`} />
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-muted">Mobile Number</label>
                        <div className="input-group input-group-merge">
                          <span className="input-group-text bg-light border-0 text-muted">+91</span>
                          <input name="MOBILE" value={empData.MOBILE} onChange={handleChange} readOnly={!isEditing} className="form-control border-0 bg-light" />
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-uppercase text-muted">Home Address</label>
                        <div className="input-group input-group-merge">
                          <span className="input-group-text bg-light border-0"><MapPin size={16}/></span>
                          <textarea name="ADDRESS" value={empData.ADDRESS} onChange={handleChange} readOnly={!isEditing} className="form-control border-0 bg-light" rows="2" />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-muted">Official Gmail</label>
                        <div className="input-group input-group-merge">
                          <span className="input-group-text bg-light border-0"><Mail size={16}/></span>
                          <input name="GMAIL" value={empData.GMAIL} onChange={handleChange} readOnly={!isEditing} className="form-control border-0 bg-light" placeholder="email@gmail.com" />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-uppercase text-muted">Designation</label>
                        <select className="form-select border-0 bg-light" disabled={!isEditing} name="DESIGNATION" value={empData.DESIGNATION} onChange={handleChange}>
                          <option value="">Select Role</option>
                          {arraydesignation.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-uppercase text-muted">Status</label>
                        <select className="form-select border-0 bg-light" disabled={!isEditing} value={empData.status} onChange={(e) => setEmpData({...empData, status: e.target.value})}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="col-md-8">
                        <label className="form-label small fw-bold text-uppercase text-muted">Attendance Shift (In-Time)</label>
                        <div className="d-flex align-items-center gap-3">
                           <div className="d-flex align-items-center flex-grow-1 bg-light rounded-3 px-3">
                              <Clock size={16} className="text-muted me-2" />
                              <input name="INTIME_H" value={empData.INTIME_H} onChange={handleChange} readOnly={!isEditing} className="form-control border-0 bg-transparent text-center" placeholder="HH" maxLength="2" />
                              <span className="fw-bold">:</span>
                              <input name="INTIME_M" value={empData.INTIME_M} onChange={handleChange} readOnly={!isEditing} className="form-control border-0 bg-transparent text-center" placeholder="MM" maxLength="2" />
                           </div>
                           <div className="small text-muted fst-italic">24hr format</div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column: Financial Data */}
                <div className="col-12 col-lg-4">
                  <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-primary text-white" style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)' }}>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <Landmark size={20} />
                      <h6 className="fw-bold mb-0">Payout Details</h6>
                    </div>
                    
                    <div className="mb-3 border-bottom border-white border-opacity-25 pb-3">
                      <label className="small opacity-75 d-block mb-1">Bank Name</label>
                      <input name="BANKNAME" value={empData.BANKNAME} onChange={handleChange} readOnly={!isEditing} className="form-control form-control-sm bg-white bg-opacity-10 border-0 text-white placeholder-white-50" />
                    </div>
                    
                    <div className="mb-3 border-bottom border-white border-opacity-25 pb-3">
                      <label className="small opacity-75 d-block mb-1">Account Number</label>
                      <input name="ACCOUNTNO" value={empData.ACCOUNTNO} onChange={handleChange} readOnly={!isEditing} className="form-control form-control-sm bg-white bg-opacity-10 border-0 text-white" />
                    </div>

                    <div className="mb-0">
                      <label className="small opacity-75 d-block mb-1">IFSC Code</label>
                      <input name="IFSC" value={empData.IFSC} onChange={handleChange} readOnly={!isEditing} className="form-control form-control-sm bg-white bg-opacity-10 border-0 text-white" />
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm rounded-4 p-4">
                     <h6 className="fw-bold mb-3 d-flex align-items-center gap-2"><ShieldCheck size={18} className="text-primary"/> Verification</h6>
                     <div className="small p-3 bg-light rounded-3 mb-2 d-flex justify-content-between">
                        <span className="text-muted">Aadhar:</span>
                        <span className="fw-bold">{empData.AADHAR || 'Pending'}</span>
                     </div>
                     <div className="small p-3 bg-light rounded-3 d-flex justify-content-between">
                        <span className="text-muted">PAN Card:</span>
                        <span className="fw-bold text-uppercase">{empData.PAN || 'Pending'}</span>
                     </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12">
                <div className="mb-4 p-3 bg-primary bg-opacity-10 border border-primary-subtle rounded-3 d-flex align-items-start gap-3">
                   <AlertCircle className="text-primary mt-1" size={20} />
                   <div>
                      <p className="small mb-0 fw-medium text-primary">Granular Access Control</p>
                      <p className="small mb-0 text-muted">Use the master switches to grant all permissions in a module or select individual actions below.</p>
                   </div>
                </div>
                <PermissionSection title="Customer Access" icon={User} state={customerpermission} setter={setCustomerPermission} />
                <PermissionSection title="Master Controls" icon={ShieldCheck} state={masterpermission} setter={setMasterPermission} />
                <PermissionSection title="Lead Management" icon={ChevronRight} state={leadpermission} setter={setLeadPermission} />
                <PermissionSection title="Payment & Collections" icon={CreditCard} state={paymentpermission} setter={setPaymentPermission} />
                <PermissionSection title="Network Management" icon={MapPin} state={networkpermission} setter={setNetworkPermission} />
                <PermissionSection title="Inventory Control" icon={Briefcase} state={inventorypermission} setter={setInventoryPermission} />
                <PermissionSection title="Attendance Rules" icon={Clock} state={attendencepermission} setter={setAttendencePermission} />
                <PermissionSection title="HR & Employee" icon={User} state={employeepermission} setter={setEmployeePermission} />
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        /* Custom Modern Tabs */
        .nav-tabs-modern { border-bottom: none; }
        .nav-tab-item { 
          border: none; 
          background: none; 
          padding: 8px 0px 12px 0px; 
          font-weight: 600; 
          color: #94a3b8; 
          position: relative;
          font-size: 0.95rem;
          transition: all 0.3s;
        }
        .nav-tab-item.active { color: #2563eb; }
        .nav-tab-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: #2563eb;
          border-radius: 3px 3px 0 0;
        }

        /* Avatar & Icons */
        .avatar-square { width: 48px; height: 48px; }
        .input-group-merge .input-group-text { border-right: none; }
        .input-group-merge .form-control { border-left: none; }
        
        /* Permission Tiles */
        .permission-tile { cursor: pointer; user-select: none; }
        .permission-tile:hover { transform: translateY(-1px); border-color: #cbd5e1; }
        .custom-switch { width: 2.5em; height: 1.25em; cursor: pointer; }

        /* Animation */
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* Form Overrides */
        .form-control:focus, .form-select:focus {
          box-shadow: none;
          background-color: #fff !important;
          border: 1px solid #2563eb !important;
        }
        .placeholder-white-50::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
}