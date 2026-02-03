import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLink, FaDatabase, FaFileUpload, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { API } from "../FirebaseConfig";


export default function NewUserAdd() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();

  // --- ALL ORIGINAL STATES PRESERVED ---
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [installationAddress, setInstallationAddress] = useState("");
  const [colonyName, setColonyName] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [refundableAmount, setRefundableAmount] = useState("");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [conectiontyp, setConnectionTyp] = useState("");
  const [category, setCategory] = useState("All");
  const [deviceMaker, setDeviceMaker] = useState("All");
  const [filterDevice, setFilterDevice] = useState([]);
  const [deviceSerialNumber, setDeviceSerialNumber] = useState({ serial: "", mac: "" });
  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [cafDocuments, setCafDocuments] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [arraycolony, setArraycolony] = useState([]);
  const [arrayplan, setArrayplan] = useState([]);
  const [arrayisp, setArrayisp] = useState([]);
  const [arrayprovider, setArrayProvider] = useState([]);
  const [arraydevice, setArraydevice] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [arraymaker, setArrayMaker] = useState([]);
  const [planDuration, setPlanDuration] = useState(0); 
  const [durationUnit, setDurationUnit] = useState("");
  const [planData, setPlanData] = useState({
    provider: "All", isp: "All", planname: "", activationDate: new Date().toISOString().split("T")[0],
    expiryDate: "", planAmount: "", bandwidth: "", planperiod: "", periodtime: "",
    baseamount: "", remarks: "", plancode: "", installby: "", leadby: "",
  });
  const [arrayuser, setArrayUser] = useState([]);
  const [filterPlans, setFilterPlans] = useState([]);
  const [loader, setLoader] = useState(false);

  // --- ALL ORIGINAL LOGIC PRESERVED ---
  useEffect(() => { initialData(); }, []);

  const initialData = async () => {
    try {
      const [responsePlan, responseColony, responseIsp, responseUsers] = await Promise.all([
        API.get(`/addnew/broadbandplan?partnerId=${partnerId}`),
        API.get(`/subscriber/colonys?partnerId=${partnerId}`),
        API.get(`/subscriber/isps?partnerId=${partnerId}`),
        API.get(`/subscriber/users?partnerId=${partnerId}`),
      ]);
      if (responsePlan.status !== 200 || responseColony.status !== 200 || responseUsers.status !== 200 || responseIsp.status !== 200) return;
      if (responseColony.data) setArraycolony(responseColony.data);
      if (responsePlan.data.plans) {
        const array = Object.keys(responsePlan.data.plans).map(key => ({ ...responsePlan.data.plans[key], planKey: key }));
        setArrayProvider([...new Set(array.map(d => d.provider))]);
        setArrayplan(array);
      }
      if (responseIsp.data) {
        setArrayisp(Object.keys(responseIsp.data).map(key => responseIsp.data[key]));
      }
      if (responseUsers.data) {
        setArrayUser(Object.keys(responseUsers.data).map(key => ({
          name: responseUsers.data[key].empname,
          mobile: responseUsers.data[key].empmobile
        })));
      }
    } catch (e) { console.log(e); }
  };

  const updateExpirationDate = (newActivationDate, duration, unit) => {
    const date = new Date(newActivationDate);
    if (unit === "Months") date.setMonth(date.getMonth() + parseInt(duration));
    else if (unit === "Years") date.setFullYear(date.getFullYear() + parseInt(duration));
    else if (unit === "Days") date.setDate(date.getDate() + parseInt(duration));
    setExpiryDate(date.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    if (!fullName || !username || !mobileNo || !company || !installationAddress || !conectiontyp || !planData.isp) {
      toast.error("Mandatory fields must not be empty");
      setLoader(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("company", company);
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("mobileNo", mobileNo);
      formData.append("email", email);
      formData.append("installationAddress", installationAddress);
      formData.append("colonyName", colonyName);
      formData.append("state", state);
      formData.append("pinCode", pinCode);
      formData.append("isp", planData.isp);
      formData.append("planName", planData.planname);
      formData.append("planAmount", planAmount);
      formData.append("securityDeposit", securityDeposit);
      formData.append("refundableAmount", refundableAmount);
      formData.append("activationDate", activationDate);
      formData.append("expiryDate", expiryDate);
      formData.append("conectiontyp", conectiontyp);
      formData.append("bandwidth", planData.bandwidth);
      formData.append("provider", planData.provider);
      formData.append("createdAt", new Date().toISOString().split("T")[0]);
      formData.append("installedby", planData.installby);
      formData.append("leadby", planData.leadby);
      formData.append("completedby", localStorage.getItem("contact"));
      formData.append("plancode", planData.plancode);
      formData.append("source", "Web CRM");
      formData.append("documents[addressProof]", "1");
      formData.append("documents[identityProof]", "1");
      formData.append("documents[cafDocument]", "1");
      formData.append("documents[profilePhoto]", "1");
      if (addressProof) formData.append("addressProof", addressProof);
      if (identityProof) formData.append("identityProof", identityProof);
      if (cafDocuments) formData.append("cafDocument", cafDocuments);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      const resp = await API.post(`/addnew?partnerId=${partnerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (resp.status === 200) {
        toast.success("Subscriber added successfully!");
        localStorage.setItem("susbsUserid", resp.data.message.split(" ")[2]);
        navigate("/dashboard/subscriber");
      }
    } catch (e) { toast.error("Error adding subscriber."); } finally { setLoader(false); }
  };

  useEffect(() => {
    let dev = arraydevice;
    if (category !== "All") dev = dev.filter(d => d.devicecategry === category);
    if (deviceMaker !== "All") dev = dev.filter(d => d.makername === deviceMaker);
    setFilterDevice(dev);
  }, [category, deviceMaker, arraydevice]);

  useEffect(() => {
    let p = arrayplan;
    if (planData.provider !== "All") p = p.filter(d => d.provider === planData.provider);
    setFilterPlans(p);
  }, [planData.provider, planData.isp, arrayplan]);

  return (
    <div className="new-user-main" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "30px 0" }}>
      <ToastContainer />
      
      {loader && (
        <div className="custom-loader-overlay">
          <div className="loader-box">
            <ProgressBar height="80" width="80" color="#007bff" />
            <h5 className="mt-3 text-white">Uploading Data...</h5>
          </div>
        </div>
      )}

      <div className="container">
        {/* Page Header */}
        {/* <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between bg-white p-4 rounded-4 shadow-sm">
              <div>
                <h3 className="fw-bold mb-1 text-primary">Add New Subscriber</h3>
                <span className="text-muted small">Enter registration details for the new user profile</span>
              </div>
            </div>
          </div>
        </div> */}

        <div className="row g-4">
          {/* LEFT COLUMN: BASIC INFO */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold"><FaUser className="me-2 text-primary" /> Basic Information</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Company (Auto-Selected)</label>
                    <input value={company} className="form-control bg-light" disabled placeholder="Select colony first" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Colony Name *</label>
                    <select onChange={(e) => {
                      const sel = e.target.value; setColonyName(sel);
                      const obj = arraycolony.find(c => c.name === sel);
                      setCompany(obj ? obj.undercompany : "");
                    }} className="form-select border-primary-subtle" required>
                      <option value="">Choose Colony...</option>
                      {arraycolony.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Full Name *</label>
                    <input onChange={(e) => setFullName(e.target.value)} type="text" className="form-control" placeholder="John Doe" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Username *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">@</span>
                      <input onChange={(e) => setUsername(e.target.value)} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Mobile No. *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">+91</span>
                      <input onChange={(e) => setMobileNo(e.target.value)} maxLength={10} type="text" className="form-control" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Email Address</label>
                    <input onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" placeholder="example@mail.com" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">Installation Address *</label>
                    <textarea onChange={(e) => setInstallationAddress(e.target.value)} className="form-control" rows="2"></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">State</label>
                    <input onChange={(e) => setState(e.target.value)} type="text" className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">PIN Code</label>
                    <input onChange={(e) => setPinCode(e.target.value)} type="text" className="form-control" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold"><FaLink className="me-2 text-success" /> Connection & Plan Details</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Select ISP *</label>
                    <select onChange={(e) => setPlanData({...planData, isp: e.target.value})} className="form-select border-success-subtle">
                      <option value="">Choose...</option>
                      {arrayisp.map((isp, i) => <option key={i} value={isp}>{isp}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Provider</label>
                    <select onChange={(e) => setPlanData({...planData, provider: e.target.value})} className="form-select">
                      <option value="All">All Providers</option>
                      {arrayprovider.map((p, i) => <option key={i} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Plan Name *</label>
                    <select onChange={(e) => {
                      const sel = e.target.value;
                      const obj = arrayplan.find(p => p.planKey === sel);
                      if (obj) {
                        setPlanAmount(obj.planamount);
                        setPlanData({...planData, plancode: sel, bandwidth: obj.bandwidth, provider: obj.provider, planname: obj.planname });
                        setPlanDuration(obj.periodtime); setDurationUnit(obj.planperiod);
                        updateExpirationDate(activationDate, obj.periodtime, obj.planperiod);
                      }
                    }} className="form-select border-success-subtle">
                      <option value="">Select Plan</option>
                      {filterPlans.map((p, i) => <option key={i} value={p.planKey}>{p.planname}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Plan Amount</label>
                    <input value={planAmount} onChange={(e) => setPlanAmount(e.target.value)} className="form-control fw-bold text-success" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Security Deposit</label>
                    <input onChange={(e) => { setSecurityDeposit(e.target.value); setRefundableAmount(e.target.value); }} type="text" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Refundable Amount</label>
                    <input value={refundableAmount} onChange={(e) => setRefundableAmount(e.target.value)} type="text" className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Activation Date</label>
                    <input value={activationDate} type="date" onChange={(e) => {
                      setActivationDate(e.target.value);
                      updateExpirationDate(e.target.value, planDuration, durationUnit);
                    }} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Expiry Date</label>
                    <input value={expiryDate} type="date" disabled className="form-control bg-light" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Connection Type *</label>
                    <select onChange={(e) => setConnectionTyp(e.target.value)} className="form-select border-success-subtle">
                      <option value="">Choose...</option>
                      <option value="FTTH">FTTH</option>
                      <option value="EtherNet">EtherNet</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INVENTORY & DOCS */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold"><FaDatabase className="me-2 text-warning" /> Inventory</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Device Maker</label>
                  <select onChange={(e) => setDeviceMaker(e.target.value)} className="form-select">
                    <option value="All">All Makers</option>
                    {arraymaker.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Category</label>
                  <select onChange={(e) => setCategory(e.target.value)} className="form-select">
                    <option value="All">All Categories</option>
                    {arraycategory.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">MAC / Serial No *</label>
                  <input onChange={(e) => {
                    const mac = e.target.value;
                    const dev = arraydevice.find(d => d.macno === mac);
                    if (dev) setDeviceSerialNumber({ ...deviceSerialNumber, mac, serial: dev.serialno });
                  }} className="form-control border-warning-subtle" list="devList" placeholder="Search..." />
                  <datalist id="devList">
                    {filterDevice.map((d, i) => <option key={i} value={d.macno}>{d.serialno}</option>)}
                  </datalist>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Installed By *</label>
                  <select onChange={(e) => setPlanData({...planData, installby: e.target.value})} className="form-select border-warning-subtle">
                    <option value="">Select Personnel</option>
                    {arrayuser.map((u, i) => <option key={i} value={u.mobile}>{u.name}</option>)}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-bold">Lead By *</label>
                  <select onChange={(e) => setPlanData({...planData, leadby: e.target.value})} className="form-select border-warning-subtle">
                    <option value="">Select Lead</option>
                    {arrayuser.map((u, i) => <option key={i} value={u.name}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold"><FaFileUpload className="me-2 text-danger" /> Documents</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Identity Proof</label>
                  <input onChange={(e) => setIdentityProof(e.target.files[0])} type="file" className="form-control form-control-sm" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Address Proof</label>
                  <input onChange={(e) => setAddressProof(e.target.files[0])} type="file" className="form-control form-control-sm" />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">CAF Documents</label>
                  <input onChange={(e) => setCafDocuments(e.target.files[0])} type="file" className="form-control form-control-sm" />
                </div>
                <div className="mb-0">
                  <label className="form-label small fw-bold">Profile Photo</label>
                  <input onChange={(e) => setProfilePhoto(e.target.files[0])} type="file" className="form-control form-control-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON SECTION */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="p-4 bg-white rounded-4 shadow-sm text-center border">
              <p className="text-muted small mb-3"><FaExclamationTriangle className="text-warning me-1" /> Please verify all details before uploading to the server.</p>
              <button onClick={handleSubmit} className="btn btn-primary btn-lg px-3 py-3 rounded-3 fw-bold shadow-sm">
                <FaCheckCircle className="me-2" /> UPLOAD SUBSCRIBER DETAILS
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .form-control, .form-select {
          border-radius: 8px;
          padding: 10px 15px;
          border: 1px solid #dee2e6;
        }
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          border-color: #007bff;
        }
        .custom-loader-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.85); z-index: 10000;
          display: flex; justify-content: center; align-items: center;
        }
        .loader-box { text-align: center; }
        .card { transition: all 0.3s; }
        .card:hover { transform: translateY(-5px); }

        @media (max-width: 768px) {
          .container-fluid { padding: 10px !important; }
          .card-body { padding: 15px; }
          .btn-lg { font-size: 1.1rem; }
          h4 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
}