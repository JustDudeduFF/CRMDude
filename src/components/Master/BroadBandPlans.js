import React, { useEffect, useState } from "react";
import { ref, update } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { Modal } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { FaPlus, FaEdit, FaCheckCircle, FaTimesCircle, FaGlobe, FaUserTag } from 'react-icons/fa';

export default function BroadBandPlans() {
  const partnerId = localStorage.getItem("partnerId");
  const [showplanmodal, setShowPlanModal] = useState(false);
  const [arrayplan, setArrayPlan] = useState([]);
  const [showmodal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [planDetails, setPlanDetails] = useState({
    planname: "",
    planamount: "",
    provider: "",
    planperiod: "",
    periodtime: "",
    isp: "All",
    bandwidth: "",
    company: "",
    isWeb: false,
    isActive: true,
    onLead: false,
    partnerId: partnerId,
    code: "",
  });

  const [editPlan, SetEditPlan] = useState({
    plankey: "",
    planname: "",
    planamount: "",
    periodtype: "",
    periodtime: "",
    isActive: false,
    isWeb: false,
    onLead: false,
  });

  const [provider, setProvider] = useState([]);
  const [isps, setIsps] = useState([]);
  const [companys, setCompanys] = useState([]);
  const { hasPermission } = usePermissions();

  const fetchData = async () => {
    try {
      const provResponse = await API.get(`/master/planprovider?partnerId=${partnerId}`);
      const ispResponse = await API.get(`/master/isps?partnerId=${partnerId}`);
      const compResponse = await API.get(`/master/company?partnerId=${partnerId}`);
      const planResponse = await API.get(`/master/broadbandplan?partnerId=${partnerId}`);

      if (planResponse.status !== 200) {
        toast.error("Failed To get Plans");
      }

      const planData = planResponse.data;
      if (planData) {
        const array = Object.keys(planData).map(key => ({
          key,
          ...planData[key],
        }));
        setArrayPlan(array);
      }

      if (provResponse.status === 200) setProvider(Object.values(provResponse.data));
      if (ispResponse.status === 200) setIsps(Object.values(ispResponse.data));
      if (compResponse.status === 200) setCompanys(Object.values(compResponse.data));

    } catch (e) {
      console.log(e);
    }
  };

  const saveplan = async () => {
    const planCode = planDetails.planamount + planDetails.planperiod + planDetails.periodtime + planDetails.bandwidth + Date.now();

    if (!planDetails.planamount || !planDetails.periodtime || !planDetails.planname || !planDetails.bandwidth) {
      toast.error("Fill All Required Details");
      return;
    }

    try {
      const response = await API.post(`/master/broadbandplan?partnerId=${partnerId}`, {
        ...planDetails,
        code: planCode,
      });
      if (response.status === 200) {
        setShowModal(false);
        setPlanDetails({
          planname: "", planamount: "", provider: "", planperiod: "", periodtime: "",
          isp: "All", bandwidth: "", company: "", isWeb: false, isActive: true,
          onLead: false, partnerId: partnerId, code: "",
        });
        fetchData();
        toast.success("Plan Added Successfully");
      }
    } catch (e) {
      toast.error("Something went wrong!");
    }
  };

  const updatePlan = async () => {
    const data = {
      planamount: editPlan.planamount,
      planperiod: editPlan.periodtype,
      isActive: editPlan.isActive,
      isWeb: editPlan.isWeb,
      onLead: editPlan.onLead,
      periodtime: editPlan.periodtime,
      planname: editPlan.planname,
    };

    try {
      const response = await API.put(`/master/broadbandplan/${editPlan.plankey}?partnerId=${partnerId}`, data);
      if (response.status === 200) {
        setEditModal(false);
        fetchData();
        toast.success("Plan Updated");
      }
    } catch (e) {
      toast.error("Update Failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="plan-dashboard-wrapper">
      <ToastContainer position="top-right" />
      
      {/* Header Section */}
      <div className="plan-header-card">
        <div className="title-section">
          <h2>Broadband Plan Master</h2>
          <p>Manage and configure your service packages</p>
        </div>
        <button
          onClick={() => hasPermission("ADD_PLAN") ? setShowModal(true) : alert("Permission Denied")}
          className="create-plan-btn"
        >
          <FaPlus /> Create New Plan
        </button>
      </div>

      {/* Table Section */}
      <div className="plan-table-container">
        <table className="custom-plan-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Plan Details</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>ISP & Provider</th>
              <th>Company</th>
              <th className="text-center">Visibility</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {arrayplan.map((data, index) => (
              <tr key={index} className={!data.isActive ? "inactive-row" : ""}>
                <td className="sn-cell">{index + 1}</td>
                <td className="name-cell">
                  <div className="plan-primary-name">{data.planname}</div>
                  <div className="plan-id-tag">ID: {data._id?.slice(-6)}</div>
                </td>
                <td className="amount-cell">₹{data.planamount}</td>
                <td><span className="duration-badge">{data.periodtime} {data.planperiod}</span></td>
                <td>
                    <div className="provider-info">{data.provider}</div>
                    <div className="isp-info">{data.isp}</div>
                </td>
                <td><div className="company-text">{data.company}</div></td>
                <td>
                  <div className="visibility-icons">
                    <span title="Web Visibility" className={data.isWeb ? "v-active" : "v-inactive"}><FaGlobe /></span>
                    <span title="Lead Show" className={data.onLead ? "v-active" : "v-inactive"}><FaUserTag /></span>
                    <span title="Status" className={data.isActive ? "v-active" : "v-inactive"}>{data.isActive ? <FaCheckCircle /> : <FaTimesCircle />}</span>
                  </div>
                </td>
                <td className="text-center">
                  <button className="edit-icon-btn" onClick={() => {
                    SetEditPlan({
                      plankey: data._id, planamount: data.planamount, planname: data.planname,
                      isActive: data.isActive, isWeb: data.isWeb, onLead: data.onLead,
                      periodtime: data.periodtime, periodtype: data.planperiod,
                    });
                    setEditModal(true);
                  }}>
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal show={showmodal} onHide={() => setShowModal(false)} centered size="lg">
        <div className="modal-custom-content">
            <Modal.Header closeButton>
                <Modal.Title>Configuration - New Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row g-3">
                    <div className="col-md-12">
                        <label className="custom-label">Plan Name *</label>
                        <input className="custom-input" placeholder="e.g. Ultra High Speed 100" onChange={(e) => setPlanDetails({...planDetails, planname: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">Provider Name *</label>
                        <select className="custom-select" onChange={(e) => setPlanDetails({...planDetails, provider: e.target.value})}>
                            <option value="">Choose...</option>
                            {provider.map((data, i) => <option key={i}>{data.name}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">Plan Amount (₹) *</label>
                        <input type="number" className="custom-input" onChange={(e) => setPlanDetails({...planDetails, planamount: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                        <label className="custom-label">Period Type *</label>
                        <select className="custom-select" onChange={(e) => setPlanDetails({...planDetails, planperiod: e.target.value})}>
                            <option value="">Choose...</option>
                            <option>Months</option><option>Days</option><option>Years</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="custom-label">Period Time *</label>
                        <input type="number" className="custom-input" onChange={(e) => setPlanDetails({...planDetails, periodtime: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                        <label className="custom-label">Bandwidth (Mbps) *</label>
                        <input type="number" className="custom-input" onChange={(e) => setPlanDetails({...planDetails, bandwidth: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">ISP (Locked)</label>
                        <select className="custom-select" disabled value={planDetails.isp}>
                            <option value="All">All</option>
                            {isps.map((data, i) => <option key={i}>{data.ispname}</option>)}
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">Company Name *</label>
                        <select className="custom-select" onChange={(e) => setPlanDetails({...planDetails, company: e.target.value})}>
                            <option value="">Choose...</option>
                            {companys.map((data, i) => <option key={i}>{data.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12 mt-4 d-flex gap-4">
                        <div className="custom-checkbox">
                            <input type="checkbox" id="isWebC" checked={planDetails.isWeb} onChange={(e) => setPlanDetails({...planDetails, isWeb: e.target.checked})} />
                            <label htmlFor="isWebC">Show on Website</label>
                        </div>
                        <div className="custom-checkbox">
                            <input type="checkbox" id="isActiveC" checked={planDetails.isActive} onChange={(e) => setPlanDetails({...planDetails, isActive: e.target.checked})} />
                            <label htmlFor="isActiveC">Is Active</label>
                        </div>
                        <div className="custom-checkbox">
                            <input type="checkbox" id="onLeadC" checked={planDetails.onLead} onChange={(e) => setPlanDetails({...planDetails, onLead: e.target.checked})} />
                            <label htmlFor="onLeadC">Show on Lead</label>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={() => setShowModal(false)} className="btn-cancel">Close</button>
                <button onClick={saveplan} className="btn-save">Save Plan</button>
            </Modal.Footer>
        </div>
      </Modal>

      {/* Edit Modal - Keeps same structure as Create for consistency */}
      <Modal show={editModal} onHide={() => setEditModal(false)} centered>
        <div className="modal-custom-content">
            <Modal.Header closeButton>
                <Modal.Title>Update Plan Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row g-3">
                    <div className="col-12">
                        <label className="custom-label">Plan Name</label>
                        <input className="custom-input bg-light" value={editPlan.planname} disabled />
                    </div>
                    <div className="col-12">
                        <label className="custom-label">Plan Amount *</label>
                        <input className="custom-input" type="number" defaultValue={editPlan.planamount} onChange={(e) => SetEditPlan({...editPlan, planamount: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">Period Type *</label>
                        <select className="custom-select" defaultValue={editPlan.periodtype} onChange={(e) => SetEditPlan({...editPlan, periodtype: e.target.value})}>
                            <option>Months</option><option>Days</option><option>Years</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="custom-label">Period Time *</label>
                        <input className="custom-input" defaultValue={editPlan.periodtime} onChange={(e) => SetEditPlan({...editPlan, periodtime: e.target.value})} />
                    </div>
                    <div className="col-12 mt-3">
                         <div className="custom-checkbox mb-2">
                            <input type="checkbox" id="eWeb" checked={editPlan.isWeb} onChange={(e) => SetEditPlan({...editPlan, isWeb: e.target.checked})} />
                            <label htmlFor="eWeb">Show on Website</label>
                        </div>
                        <div className="custom-checkbox mb-2">
                            <input type="checkbox" id="eActive" checked={editPlan.isActive} onChange={(e) => SetEditPlan({...editPlan, isActive: e.target.checked})} />
                            <label htmlFor="eActive">Is Active</label>
                        </div>
                        <div className="custom-checkbox mb-2">
                            <input type="checkbox" id="eLead" checked={editPlan.onLead} onChange={(e) => SetEditPlan({...editPlan, onLead: e.target.checked})} />
                            <label htmlFor="eLead">Show on Lead</label>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={() => setEditModal(false)} className="btn-cancel">Cancel</button>
                <button onClick={updatePlan} className="btn-save btn-update">Update Details</button>
            </Modal.Footer>
        </div>
      </Modal>

      <style>{`
        .plan-dashboard-wrapper { padding: 30px; background: #f8f9fc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .plan-header-card { 
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); 
            padding: 25px 35px; border-radius: 16px; display: flex; 
            justify-content: space-between; align-items: center; 
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2); margin-bottom: 30px;
        }
        .title-section h2 { color: white; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
        .title-section p { color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px; }
        
        .create-plan-btn { 
            background: white; color: #1e3a8a; border: none; padding: 12px 24px; 
            border-radius: 10px; font-weight: 600; display: flex; align-items: center; 
            gap: 10px; transition: all 0.3s ease;
        }
        .create-plan-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); background: #f1f5f9; }

        .plan-table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .custom-plan-table { width: 100%; border-collapse: collapse; }
        .custom-plan-table thead th { background: #f1f5f9; padding: 18px; text-align: left; font-size: 13px; color: #475569; font-weight: 600; }
        .custom-plan-table tbody td { padding: 18px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; }
        
        .plan-primary-name { font-weight: 600; color: #1e3a8a; }
        .plan-id-tag { font-size: 11px; color: #94a3b8; }
        .amount-cell { font-weight: 700; color: #059669; }
        .duration-badge { background: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
        
        .provider-info { font-weight: 500; }
        .isp-info { font-size: 12px; color: #64748b; }
        
        .visibility-icons { display: flex; gap: 15px; justify-content: center; }
        .v-active { color: #10b981; }
        .v-inactive { color: #cbd5e1; }
        
        .edit-icon-btn { background: #f1f5f9; border: none; width: 35px; height: 35px; border-radius: 8px; color: #475569; transition: all 0.2s; }
        .edit-icon-btn:hover { background: #3b82f6; color: white; }
        
        .inactive-row { background-color: #fff1f2; opacity: 0.8; }

        /* Modal Styles */
        .modal-custom-content { border: none; border-radius: 20px; }
        .custom-label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; display: block; }
        .custom-input, .custom-select { 
            width: 100%; padding: 10px 15px; border: 1.5px solid #e2e8f0; 
            border-radius: 10px; outline: none; transition: border-color 0.2s; 
        }
        .custom-input:focus { border-color: #3b82f6; }
        .custom-checkbox { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .custom-checkbox input { width: 18px; height: 18px; cursor: pointer; }
        .custom-checkbox label { font-size: 14px; color: #1e293b; cursor: pointer; }
        
        .btn-save { background: #3b82f6; color: white; border: none; padding: 10px 25px; border-radius: 10px; font-weight: 600; }
        .btn-cancel { background: transparent; color: #64748b; border: none; padding: 10px 20px; font-weight: 600; }
        .btn-update { background: #1e3a8a; }
      `}</style>
    </div>
  );
}