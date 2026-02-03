import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';
import { API } from '../../FirebaseConfig';
import { FaEdit, FaBoxOpen, FaUserEdit, FaHistory, FaTools, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function InventorysTable() {
  const username = localStorage.getItem('susbsUserid');
  const { hasPermission } = usePermissions();
  const [inventoryArray, setInventoryArray] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modify, setModify] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ amount: 0, status: 'Activated' });

  const fetchInventory = async () => {
    try {
      const res = await API.get(`/subscriber/inventorylist/${username}`);
      setInventoryArray(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      toast.error('Failed to load inventory');
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateDevice = async () => {
    if (!selectedDevice) return;
    const { _id, amount: oldAmount, status: oldStatus } = selectedDevice;
    const { amount: newAmount, status: newStatus } = updateInfo;

    if (Number(newAmount) === Number(oldAmount) && newStatus === oldStatus) {
      toast.warn('No changes detected');
      return;
    }

    const remark = {
      action: '',
      oldAmount, newAmount,
      oldStatus, newStatus,
      performedBy: username,
      timestamp: new Date(),
    };

    if (Number(newAmount) !== Number(oldAmount)) remark.action += 'Amount Updated; ';
    if (newStatus !== oldStatus) remark.action += 'Status Updated';

    try {
      const res = await API.put(`/subscriber/${username}/inventory/${_id}`, {
        amount: newAmount,
        status: newStatus,
        remark,
      });

      if (res.data?.success) {
        toast.success('Device updated successfully');
        fetchInventory();
        setModify(false);
      }
    } catch (err) {
      toast.error('Failed to update device');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'activated': case 'active': return 'badge-status-success';
      case 'damaged': return 'badge-status-danger';
      case 'on repair': return 'badge-status-warning';
      default: return 'badge-status-neutral';
    }
  };

  return (
    <div className="inventory-grid-container">
      <ToastContainer />
      
      <div className="table-responsive shadow-sm rounded-4 border bg-white">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">Product Code</th>
              <th>Date</th>
              <th>Hardware Description</th>
              <th>Serial / MAC</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryArray.length ? (
              inventoryArray.map((device, idx) => (
                <tr key={idx} className="inventory-row">
                  <td className="ps-4 fw-bold text-primary" style={{fontSize: '0.85rem'}}>
                    #{device.ledgerkey || device._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="text-muted small">
                    {new Date(device.assignedAt).toLocaleDateString("en-GB", {day:'2-digit', month:'short', year:'2-digit'})}
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark">{device.itemMaker}</span>
                      <span className="text-muted extra-small">{device.itemCategory}</span>
                    </div>
                  </td>
                  <td className="small font-monospace text-secondary">
                    {device.serialNumber}<br/>
                    <span className="text-muted" style={{fontSize: '0.7rem'}}>{device.macAddress}</span>
                  </td>
                  <td className="fw-bold text-dark">₹{device.amount}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button 
                      className="btn-action-edit"
                      onClick={() => {
                        if (!hasPermission("CHANGE_DEVICE_STATUS")) {
                          toast.error('Permission Denied');
                          return;
                        }
                        setSelectedDevice(device);
                        setUpdateInfo({ amount: device.amount, status: device.status });
                        setModify(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-5">
                  <FaBoxOpen size={40} className="text-light mb-2 d-block mx-auto" />
                  <span className="text-muted">No Inventory items found in your record</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL REDESIGN */}
      <Modal show={modify} onHide={() => setModify(false)} centered className="modern-inventory-modal">
        <Modal.Header className="amber-gradient-header text-white border-0 p-4">
          <Modal.Title className="h5 fw-bold d-flex align-items-center">
            <FaTools className="me-2" /> Modify Device Info
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <div className="row g-3">
            <div className="col-12">
              <label className="modern-modal-label">Update Valuation (Amount)</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">₹</span>
                <input
                  type='number'
                  className='form-control border-start-0 ps-0'
                  value={updateInfo.amount}
                  onChange={e => setUpdateInfo({ ...updateInfo, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="col-12 mt-3">
              <label className="modern-modal-label">Current Availability Status</label>
              <select
                className='form-select'
                value={updateInfo.status}
                onChange={e => setUpdateInfo({ ...updateInfo, status: e.target.value })}
              >
                <option value='Activated'>Activated / Healthy</option>
                <option value='Damaged'>Damaged / Broken</option>
                <option value='On Repair'>Sent for Repairing</option>
                <option value='Returned'>Returned to Hub</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0 p-4 pt-0 d-flex gap-2">
          <button onClick={() => setModify(false)} className='btn btn-light rounded-pill px-4 fw-bold'>Cancel</button>
          <button onClick={updateDevice} className='btn-amber-gradient rounded-pill px-5 border-0 py-2 fw-bold shadow-sm'>
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .inventory-grid-container { font-family: 'Inter', sans-serif; }
        .table thead th { 
          font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; 
          font-weight: 700; color: #64748b; padding-top: 15px; padding-bottom: 15px;
        }
        .extra-small { font-size: 0.7rem; }
        .inventory-row { transition: all 0.2s; }
        .inventory-row:hover { background-color: #fffbeb !important; }
        
        .status-pill {
          padding: 6px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;
        }
        .badge-status-success { background: #dcfce7; color: #166534; }
        .badge-status-danger { background: #fee2e2; color: #991b1b; }
        .badge-status-warning { background: #fef3c7; color: #92400e; }
        .badge-status-neutral { background: #f1f5f9; color: #475569; }

        .btn-action-edit {
          width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0;
          background: #fff; color: #64748b; transition: 0.3s;
        }
        .btn-action-edit:hover { background: #f59e0b; color: #fff; border-color: #f59e0b; }

        .amber-gradient-header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); }
        .modern-modal-label { font-size: 0.8rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; display: block; }
        
        .btn-amber-gradient { 
          background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white;
        }
      `}</style>
    </div>
  );
}