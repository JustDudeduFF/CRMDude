import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';
import './InventorysTable.css';

export default function InventorysTable() {
  const username = localStorage.getItem('susbsUserid');
  const { hasPermission } = usePermissions();
  const [inventoryArray, setInventoryArray] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [modify, setModify] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ amount: 0, status: 'Activated' });

  const apiBase = '/api/subscriber'; // Replace with your API base

  // Fetch inventory from backend
  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${apiBase}/${username}/inventory`);
      if (res.data?.inventory) {
        setInventoryArray(res.data.inventory);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      toast.error('Failed to load inventory', { autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Update device
  const updateDevice = async () => {
    if (!selectedDevice) return;

    const { _id, amount: oldAmount, status: oldStatus } = selectedDevice;
    const { amount: newAmount, status: newStatus } = updateInfo;

    if (Number(newAmount) === Number(oldAmount) && newStatus === oldStatus) {
      toast.error('Please update some field', { autoClose: 3000 });
      return;
    }

    const remark = {
      action: '',
      oldAmount,
      newAmount,
      oldStatus,
      newStatus,
      performedBy: username,
      timestamp: new Date(),
    };

    if (Number(newAmount) !== Number(oldAmount)) remark.action += 'Amount Updated; ';
    if (newStatus !== oldStatus) remark.action += 'Status Updated';

    try {
      const res = await axios.put(`${apiBase}/${username}/inventory/${_id}`, {
        amount: newAmount,
        status: newStatus,
        remark,
      });

      if (res.data?.success) {
        toast.success('Device updated successfully', { autoClose: 3000 });
        fetchInventory();
        setModify(false);
        setSelectedDevice(null);
      }
    } catch (err) {
      console.error('Failed to update device:', err);
      toast.error('Failed to update device', { autoClose: 3000 });
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Date</th>
              <th>Product Name</th>
              <th>Serial No.</th>
              <th>Amount</th>
              <th>Remarks</th>
              <th>Modified By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryArray.length ? (
              inventoryArray.map((device, idx) => (
                <tr key={idx}>
                  <td
                    onClick={() => {
                      if (!hasPermission("CHANGE_DEVICE_STATUS")) {
                        toast.error('Permission Denied', { autoClose: 3000 });
                        return;
                      }
                      if (device.status !== 'Activated') {
                        toast.error('Device is Not Active', { autoClose: 3000 });
                        return;
                      }
                      setSelectedDevice(device);
                      setUpdateInfo({ amount: device.amount, status: device.status });
                      setModify(true);
                    }}
                  >
                    {device.ledgerkey || device._id}
                  </td>
                  <td>{new Date(device.date).toLocaleDateString()}</td>
                  <td>{device.devicename}</td>
                  <td>{device.deviceSerialNumber}</td>
                  <td>{device.amount.toFixed(2)}</td>
                  <td>{device.remarks || '-'}</td>
                  <td>{device.modifiedby || '-'}</td>
                  <td className={`inventory-status ${device.status === 'Activated' ? 'inventory-status-active' : 'inventory-status-inactive'}`}>
                    {device.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No Inventory data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for editing */}
      <Modal show={modify} onHide={() => setModify(false)} className="inventory-modal">
        <Modal.Header>
          <Modal.Title>Modify Device</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='container d-flex flex-column'>
            <div className='col-md'>
              <label className='inventory-form-label'>Device Amount</label>
              <input
                type='number'
                className='inventory-form-control'
                value={updateInfo.amount}
                onChange={e => setUpdateInfo({ ...updateInfo, amount: e.target.value })}
              />
            </div>

            <div className='col-md mt-3'>
              <label className='inventory-form-label'>Device Status</label>
              <select
                className='inventory-form-control'
                value={updateInfo.status}
                onChange={e => setUpdateInfo({ ...updateInfo, status: e.target.value })}
              >
                <option value='Activated'>Activated</option>
                <option value='Damaged'>Damaged</option>
                <option value='On Repair'>On Repair</option>
                <option value='Returned'>Returned</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={updateDevice} className='inventory-btn inventory-btn-primary'>Update</button>
          <button onClick={() => setModify(false)} className='inventory-btn inventory-btn-outline-secondary'>Close</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
