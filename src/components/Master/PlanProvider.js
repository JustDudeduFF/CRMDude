import React, { useEffect, useState } from "react";
import { usePermissions } from "../PermissionProvider";
import { Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { API } from "../../FirebaseConfig";
import { LayoutGrid, Plus, Calendar, User, ShieldCheck, X } from "lucide-react";

export default function PlanProvider() {
  const { hasPermission } = usePermissions();
  const partnerId = localStorage.getItem("partnerId");
  const [showmodal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [providerArray, setProviderArray] = useState([]);

  const fetchData = async () => {
    try {
      const response = await API.get(`/master/planprovider?partnerId=${partnerId}`);
      if (response.status === 200) {
        setProviderArray(response.data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showmodal]);

  const saveProvider = async () => {
    if (!name.trim()) return toast.warn("Provider name is required");

    const data = {
      name: name,
      modifiedby: localStorage.getItem("Name"),
      partnerId: partnerId,
      code: name
    };

    try {
      const response = await API.post(`/master/planprovider?partnerId=${partnerId}`, data);
      if (response.status !== 200) return toast.error("Failed to add Provider");

      toast.success("Provider Added Successfully");
      setShowModal(false);
      setName(""); 
    } catch (e) {
      console.log(e);
      toast.error("Internal Server Error");
    }
  };

  return (
    <div className="plan-provider-wrapper">
      <ToastContainer position="top-right" />
      
      {/* Dynamic Header */}
      <div className="pp-header">
        <div className="pp-title-section">
          <div className="pp-icon-bg">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h5 className="pp-main-title">Plan Providers</h5>
            <p className="pp-subtitle">Manage service providers and subscription tiers</p>
          </div>
        </div>
        
        <button
          onClick={() =>
            hasPermission("ADD_PLAN")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="pp-add-btn"
        >
          <Plus size={18} /> <span>New Provider</span>
        </button>
      </div>

      {/* Responsive Table/Card Container */}
      <div className="pp-card-container">
        <div className="pp-table-responsive">
          <table className="pp-custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Provider Name</th>
                <th><Calendar size={14} className="me-1" /> Registration Date</th>
                <th><User size={14} className="me-1" /> Modified By</th>
              </tr>
            </thead>
            <tbody>
              {providerArray.length > 0 ? (
                providerArray.map(({ name, createdAt, modifiedby }, index) => (
                  <tr key={index}>
                    <td className="pp-index-cell">
                        <span className="mobile-only-label">S.No: </span>
                        {index + 1}
                    </td>
                    <td className="pp-name-cell">
                        <span className="mobile-only-label">Provider: </span>
                        <span className="pp-highlight">{name}</span>
                    </td>
                    <td className="pp-date-cell">
                        <span className="mobile-only-label">Date: </span>
                        {new Date(createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </td>
                    <td className="pp-user-cell">
                        <span className="mobile-only-label">Admin: </span>
                        <div className="pp-badge">{modifiedby}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="pp-empty">No providers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styled Modal */}
      <Modal 
        show={showmodal} 
        onHide={() => setShowModal(false)}
        centered
        className="pp-modal"
      >
        <div className="pp-modal-content">
            <div className="pp-modal-header">
                <h5 className="m-0">Add Plan Provider</h5>
                <button className="close-x" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <Modal.Body className="py-4">
                <div className="pp-input-group">
                    <label className="pp-label">Provider Name</label>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        className="pp-input"
                        type="text"
                        placeholder="e.g. Premium Health"
                        value={name}
                    />
                </div>
            </Modal.Body>
            <div className="pp-modal-footer">
                <button onClick={() => setShowModal(false)} className="pp-btn-ghost">
                    Cancel
                </button>
                <button onClick={saveProvider} className="pp-btn-solid">
                    <ShieldCheck size={18} className="me-2" /> Confirm Add
                </button>
            </div>
        </div>
      </Modal>

      <style>{`
        .plan-provider-wrapper { padding: 2rem; background: #f8fafc; min-height: 100vh; }
        
        .pp-header { 
            display: flex; justify-content: space-between; align-items: center; 
            margin-bottom: 2rem; background: #fff; padding: 1.5rem; border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .pp-title-section { display: flex; align-items: center; gap: 1rem; }
        .pp-icon-bg { 
            background: #eff6ff; color: #3b82f6; padding: 12px; border-radius: 10px;
        }
        .pp-main-title { margin: 0; font-weight: 700; color: #1e293b; }
        .pp-subtitle { margin: 0; font-size: 0.85rem; color: #64748b; }

        .pp-add-btn {
            background: #3b82f6; color: #fff; border: none; padding: 10px 20px;
            border-radius: 8px; font-weight: 600; display: flex; align-items: center; gap: 8px;
            transition: all 0.2s;
        }
        .pp-add-btn:hover { background: #2563eb; transform: translateY(-1px); }

        .pp-card-container { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        .pp-custom-table { width: 100%; border-collapse: collapse; }
        .pp-custom-table thead { background: #f1f5f9; }
        .pp-custom-table th { padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
        .pp-custom-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #334155; }
        
        .pp-highlight { color: #3b82f6; font-weight: 600; text-decoration: underline; }
        .pp-badge { background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; display: inline-block; }
        .pp-empty { text-align: center; padding: 3rem; color: #94a3b8; }

        .mobile-only-label { display: none; }

        /* Modal Styling */
        .pp-modal-content { border-radius: 16px; border: none; overflow: hidden; }
        .pp-modal-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; }
        .close-x { background: none; border: none; color: #94a3b8; }
        .pp-input-group { display: flex; flex-direction: column; gap: 8px; }
        .pp-label { font-weight: 600; font-size: 0.9rem; color: #475569; }
        .pp-input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; outline: none; }
        .pp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
        .pp-modal-footer { padding: 1.5rem; background: #f8fafc; display: flex; gap: 1rem; }
        .pp-btn-ghost { flex: 1; background: none; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-weight: 600; color: #64748b; }
        .pp-btn-solid { flex: 1; background: #3b82f6; color: #fff; border: none; padding: 10px; border-radius: 8px; font-weight: 600; display: flex; align-items: center; justify-content: center; }

        @media (max-width: 768px) {
            .plan-provider-wrapper { padding: 1rem; }
            .pp-header { flex-direction: column; gap: 1rem; text-align: center; }
            .pp-title-section { flex-direction: column; }
            .pp-add-btn { width: 100%; justify-content: center; }

            .pp-custom-table thead { display: none; }
            .pp-custom-table tr { display: block; padding: 1rem; border-bottom: 1px solid #f1f5f9; }
            .pp-custom-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; border: none; }
            .mobile-only-label { display: block; font-weight: 700; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; }
        }
      `}</style>
    </div>
  );
}