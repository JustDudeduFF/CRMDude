import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {  API } from "../../FirebaseConfig";
import { 
  User, ShieldCheck, CreditCard, Save, X, 
  Phone, Briefcase, FileText, Upload, CheckCircle 
} from "lucide-react";

export default function NewEmployee() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // --- Files State ---
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [drivingFile, setDrivingFile] = useState(null);

  // --- Main Employee Data ---
  const [empData, setEmpData] = useState({
    FULLNAME: "", MOBILE: "", GMAIL: "", ADDRESS: "",
    AADHAR: "", DRIVING: "", PAN: "", BANKNAME: "",
    ACCOUNTNO: "", IFSC: "", ACCOUNTNAME: "", UPI: "",
    INTIME_H: "", INTIME_M: "", OUTTIME_H: "", OUTTIME_M: "",
    MARKING_OFFICE: "", DESIGNATION: "", USERTYPE: "", DOJ: "",
  });

  const [arrayoffice, setArrayOffice] = useState([]);
  const [arraydesignation, setArraydesignation] = useState([]);

  // --- Consolidated Permission States ---
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

  // --- Logic Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpData(prev => ({ ...prev, [name]: value }));
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const offRes = await API.get(`/master/offices?partnerId=${partnerId}`);
        const desRes = await API.get(`/master/designations?partnerId=${partnerId}`);
        setArrayOffice(offRes.data || []);
        setArraydesignation(desRes.data || []);
      } catch (err) {
        toast.error("Failed to load master data");
      }
    };
    fetchData();
  }, [partnerId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      // Append Basic Info
      Object.keys(empData).forEach(key => formData.append(key, empData[key]));
      formData.append("partnerId", partnerId);
      formData.append("status", "active");
      formData.append("pass", "123456");

      // Append Permissions
      const permissions = { customerpermission, masterpermission, leadpermission, paymentpermission, networkpermission, attendencepermission, payoutpermission, messagepermission, inventorypermission, employeepermission };
      Object.keys(permissions).forEach(pKey => {
        Object.keys(permissions[pKey]).forEach(subKey => {
          formData.append(`${pKey}[${subKey}]`, String(permissions[pKey][subKey]));
        });
      });

      // Append Files
      if (aadharFile) formData.append("aadhar", aadharFile[0]);
      if (panFile) formData.append("pan", panFile[0]);
      if (drivingFile) formData.append("drivinglicense", drivingFile[0]);

      const response = await API.post(`/employees`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("Employee onboarded successfully!");
        navigate(-1);
      }
    } catch (e) {
      toast.error("Submission failed. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Sub-Component for Permissions ---
  const PermissionCard = ({ title, state, setter }) => (
    <div className="card border-0 shadow-sm mb-3 rounded-3">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h6 className="mb-0 fw-bold">{title}</h6>
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            onChange={createToggleAll(setter)}
            checked={Object.values(state).every(v => v === true)}
          />
        </div>
      </div>
      <div className="card-body bg-light bg-opacity-50">
        <div className="row g-2">
          {Object.keys(state).map(key => (
            <div key={key} className="col-6 col-md-4 col-lg-3">
              <label className={`d-flex align-items-center gap-2 p-2 rounded-2 border bg-white small`}>
                <input 
                  type="checkbox" 
                  name={key} 
                  checked={state[key]} 
                  onChange={createIndividualChange(setter)} 
                  className="form-check-input mt-0"
                />
                <span className="text-truncate text-capitalize">{key.toLowerCase().replace(/_/g, ' ')}</span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 pb-5">
      <ToastContainer />
      
      {/* --- Sticky Header --- */}
      <div className="bg-white sticky-top shadow-sm border-bottom p-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                <User size={24} />
              </div>
              <h5 className="mb-0 fw-bold">New Employee Onboarding</h5>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-light rounded-pill px-3" onClick={() => navigate(-1)}><X size={18} /></button>
              <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={handleSave} disabled={isLoading}>
                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : <Save size={18} />} Save
              </button>
            </div>
          </div>

          <div className="d-flex gap-4 mt-3 nav-tabs-custom">
            <button className={`nav-link-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Basic Details</button>
            <button className={`nav-link-btn ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}>Permissions</button>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {activeTab === 'profile' ? (
          <div className="row g-4">
            {/* Identity Column */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h6 className="fw-bold mb-4 border-start border-primary border-4 ps-2">Personal Information</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input name="FULLNAME" onChange={handleChange} className="form-control border-0 bg-light" placeholder="John Doe" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Mobile Number *</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">+91</span>
                      <input name="MOBILE" maxLength={10} onChange={handleChange} className="form-control border-0 bg-light" />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold">Address</label>
                    <textarea name="ADDRESS" onChange={handleChange} className="form-control border-0 bg-light" rows="2"></textarea>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Designation</label>
                    <select name="DESIGNATION" onChange={handleChange} className="form-select border-0 bg-light">
                      <option value="">Select...</option>
                      {arraydesignation.map((d, i) => <option key={i} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">User Access Type</label>
                    <select name="USERTYPE" onChange={handleChange} className="form-select border-0 bg-light">
                      <option value="">Choose...</option>
                      <option value="mobile">Mobile App</option>
                      <option value="web">Web Dashboard</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Joining Date</label>
                    <input type="date" name="DOJ" onChange={handleChange} className="form-control border-0 bg-light" />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
                <h6 className="fw-bold mb-4 border-start border-success border-4 ps-2">Banking & Payouts</h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Bank Name</label>
                    <input name="BANKNAME" onChange={handleChange} className="form-control border-0 bg-light" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Account Number</label>
                    <input name="ACCOUNTNO" onChange={handleChange} className="form-control border-0 bg-light" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">IFSC Code</label>
                    <input name="IFSC" onChange={handleChange} className="form-control border-0 bg-light" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">UPI ID</label>
                    <input name="UPI" onChange={handleChange} className="form-control border-0 bg-light" />
                  </div>
                </div>
              </div>
            </div>

            {/* Document Column */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                <h6 className="fw-bold mb-4 d-flex align-items-center gap-2"><FileText size={18}/> Documents</h6>
                
                <div className="mb-4">
                  <label className="form-label small fw-bold">Aadhaar Card</label>
                  <div className={`upload-box p-3 border-dashed rounded-3 text-center ${aadharFile ? 'border-success' : 'border-secondary'}`}>
                    <input type="file" id="up-aadhar" hidden onChange={(e) => setAadharFile(e.target.files)} />
                    <label htmlFor="up-aadhar" className="cursor-pointer mb-0">
                      {aadharFile ? <CheckCircle className="text-success mb-2" /> : <Upload className="text-muted mb-2" />}
                      <p className="small mb-0 text-muted">{aadharFile ? aadharFile[0].name : "Upload Aadhaar"}</p>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">PAN Card</label>
                  <div className={`upload-box p-3 border-dashed rounded-3 text-center ${panFile ? 'border-success' : 'border-secondary'}`}>
                    <input type="file" id="up-pan" hidden onChange={(e) => setPanFile(e.target.files)} />
                    <label htmlFor="up-pan" className="cursor-pointer mb-0">
                      {panFile ? <CheckCircle className="text-success mb-2" /> : <Upload className="text-muted mb-2" />}
                      <p className="small mb-0 text-muted">{panFile ? panFile[0].name : "Upload PAN"}</p>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Driving License</label>
                  <div className={`upload-box p-3 border-dashed rounded-3 text-center ${drivingFile ? 'border-success' : 'border-secondary'}`}>
                    <input type="file" id="up-dl" hidden onChange={(e) => setDrivingFile(e.target.files)} />
                    <label htmlFor="up-dl" className="cursor-pointer mb-0">
                      {drivingFile ? <CheckCircle className="text-success mb-2" /> : <Upload className="text-muted mb-2" />}
                      <p className="small mb-0 text-muted">{drivingFile ? drivingFile[0].name : "Upload License"}</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <PermissionCard title="Customer Access" state={customerpermission} setter={setCustomerPermission} />
            <PermissionCard title="Master Controls" state={masterpermission} setter={setMasterPermission} />
            <PermissionCard title="Lead Management" state={leadpermission} setter={setLeadPermission} />
            <PermissionCard title="Payment & Collections" state={paymentpermission} setter={setPaymentPermission} />
            <PermissionCard title="Network & Infrastructure" state={networkpermission} setter={setNetworkPermission} />
            <PermissionCard title="Inventory Management" state={inventorypermission} setter={setInventoryPermission} />
            <PermissionCard title="Attendance Settings" state={attendencepermission} setter={setAttendencePermission} />
            <PermissionCard title="Employee & HR" state={employeepermission} setter={setEmployeePermission} />
          </div>
        )}
      </div>

      <style>{`
        .nav-link-btn { border: none; background: none; padding: 10px 5px; font-weight: 600; color: #777; border-bottom: 3px solid transparent; transition: 0.3s; }
        .nav-link-btn.active { color: var(--bs-primary); border-bottom-color: var(--bs-primary); }
        .border-dashed { border: 2px dashed #dee2e6; }
        .cursor-pointer { cursor: pointer; }
        .animate-fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}