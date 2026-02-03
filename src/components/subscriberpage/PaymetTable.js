
import React, { useEffect, useState } from "react";
import { Modal, Button, Table, Badge, Spinner } from "react-bootstrap";
import { usePermissions } from "../PermissionProvider";
import { API } from "../../FirebaseConfig";
import { FaEdit, FaTimesCircle, FaShareAlt, FaDownload, FaHistory, FaUserEdit, FaCreditCard, FaCalendarAlt } from 'react-icons/fa';

export default function PaymetTable() {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const userid = localStorage.getItem("susbsUserid");
  const [arraypayment, setArrayPayment] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [userMap, setUserMap] = useState({});
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const tempupdate = localStorage.getItem("tempupdate");

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let paymentsArray = [];
      const response = await API.get(`/subscriber/payments?id=${userid}`);
      if (response.status !== 200) return console.log("Error fetching payments");
      const data = response.data;
      Object.keys(data).forEach((key) => {
        const payment = data[key];
        paymentsArray.push({
          ...payment,
          amount: parseFloat(payment.amount) || 0,
          discount: parseFloat(payment.discount) || 0,
        });
      });
      setArrayPayment(paymentsArray);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchUserData = async () => {
    let maping = {};
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status !== 200) return console.log("Error fetching user data");
      const data = response.data;
      setUserData(Object.values(data)); 
      Object.keys(data).forEach((key) => {
        const user = data[key];
        maping[user.empmobile] = user.empname;
      });
      setUserMap(maping);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    const response = await API.get(`/subscriber?id=${userid}`);
    if (response.status !== 200) return alert("Failed To Fetch");
    setCustomerData(response.data);
  };

  useEffect(() => {
    fetchPayments();
    fetchUserData();
    fetchCustomerData();
  }, [userid, tempupdate]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const updatePayment = async (updatedPayment) => {
    try {
      const response = await API.put(`/subscriber/payment/${updatedPayment.receiptNo}`, {
        updatedPayment,
        userId: customerData.userKey,
        currentDueAmount: parseInt(customerData.dueAmount, 10),
        modifiedBy: localStorage.getItem("contact"),
      });
      if (response.status !== 200) throw new Error("Failed to update payment");
      alert("Payment updated successfully!");
      localStorage.setItem("tempupdate", Date.now());
    } catch (error) {
      alert(error.response?.data?.error || "An error occurred while updating.");
    }
  };

  const handleEdit = () => {
    if (currentPayment.authorized) {
      alert(`That Receipt is authorized it could not be modified`);
      return;
    }
    if (hasPermission("EDIT_PAYMENT")) {
      setSelectedPayment(currentPayment);
      setIsModalOpen(true);
      setShowOptionsModal(false);
    } else {
      alert("Permission Denied");
      setShowOptionsModal(false);
    }
  };

  const handleCancel = async () => {
    if (!hasPermission("CANCEL_RECEIPT")) { alert("Permission Denied!"); return; }
    if (currentPayment.authorized) { alert(`That Receipt is authorized it could not be canceled`); return; }
    if (currentPayment.status === "cancel") { alert(`That Receipt is already canceled`); return; }

    const receiptNo = currentPayment.receiptNo.includes("-") ? currentPayment.receiptNo.split("-")[1] : currentPayment.receiptNo;
    try {
      await API.put(`/subscriber/payment/cancel/${receiptNo}`, {
        userId: customerData.userKey,
        discountKey: currentPayment?.discountkey,
        logKey: Date.now(),
        receiptAmount: parseInt(currentPayment.amount, 10) + parseInt(currentPayment?.discount || 0, 10),
        currentDueAmount: parseInt(customerData.dueAmount || 0, 10),
        modifiedBy: localStorage.getItem("contact"),
        originalAmount: currentPayment.amount,
        originalDiscount: currentPayment.discount,
      });
      setShowOptionsModal(false);
      alert("Receipt Canceled");
    } catch (error) {
      alert("Failed to cancel receipt.");
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await API.get(`/pdf/download/${currentPayment?._id}?partnerId=${partnerId}&subscriberId=${localStorage.getItem("susbsUserid")}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${currentPayment?._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) { console.log("Error:", e); }
  };

  const handleShareInvoice = () => { setShowOptionsModal(false); };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'cancel') return <Badge className="status-pill status-cancel">Canceled</Badge>;
    if (s === 'pending') return <Badge className="status-pill status-pending text-dark">Pending</Badge>;
    return <Badge className="status-pill status-paid">Paid</Badge>;
  };

  return (
    <div className="payment-master-wrapper">
      
      {/* Options Modal */}
      <Modal show={showOptionsModal} onHide={() => setShowOptionsModal(false)} centered className="modern-system-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Receipt Management</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="receipt-infobar mb-4">
             <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize:'0.65rem'}}>Reference Number</small>
                  <span className="fw-bold fs-5 text-indigo">{currentPayment?.receiptNo}</span>
                </div>
                <div className="text-end">
                   <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize:'0.65rem'}}>Amount</small>
                   <span className="fw-bold text-dark fs-5">₹{currentPayment?.amount}</span>
                </div>
             </div>
          </div>
          <div className="options-grid-modern">
            <button className="grid-opt-btn opt-cancel" onClick={handleCancel}>
              <div className="opt-icon"><FaTimesCircle /></div>
              <span>Cancel</span>
            </button>
            <button className="grid-opt-btn opt-share" onClick={handleShareInvoice}>
              <div className="opt-icon"><FaShareAlt /></div>
              <span>Share</span>
            </button>
            <button className="grid-opt-btn opt-edit" onClick={handleEdit}>
              <div className="opt-icon"><FaEdit /></div>
              <span>Modify</span>
            </button>
            <button className="grid-opt-btn opt-download" onClick={() => hasPermission("DOWNLOAD_INVOICE") ? handleDownloadInvoice() : alert("Permission Denied")}>
              <div className="opt-icon"><FaDownload /></div>
              <span>PDF</span>
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={isModalOpen} onHide={closeModal} centered className="modern-system-modal">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Edit Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {selectedPayment && (
            <div className="row g-3">
              <div className="col-6">
                <label className="field-label">Collected Amount</label>
                <div className="input-group-modern">
                    <span className="input-icon-text">₹</span>
                    <input type="number" className="modern-input-field" value={selectedPayment.amount} onChange={(e) => setSelectedPayment({...selectedPayment, amount: e.target.value})} />
                </div>
              </div>
              <div className="col-6">
                <label className="field-label">Discount Given</label>
                <div className="input-group-modern">
                    <span className="input-icon-text">₹</span>
                    <input type="number" className="modern-input-field" value={selectedPayment.discount} onChange={(e) => setSelectedPayment({...selectedPayment, discount: e.target.value})} />
                </div>
              </div>
              <div className="col-12">
                <label className="field-label"><FaUserEdit className="me-1"/> Staff Member</label>
                <select className="modern-select-field" value={selectedPayment.collectedBy} onChange={(e) => setSelectedPayment({...selectedPayment, collectedBy: e.target.value})}>
                  {userData.map((user) => (
                    <option key={user.empmobile} value={user.empmobile}>{user.empname}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="field-label"><FaCreditCard className="me-1"/> Mode</label>
                <select className="modern-select-field" value={selectedPayment.paymentMode} onChange={(e) => setSelectedPayment({...selectedPayment, paymentMode: e.target.value})}>
                  {["Paytm", "PhonePe", "Google Pay", "Cash", "NEFT"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-6">
                <label className="field-label"><FaCalendarAlt className="me-1"/> Date</label>
                <input type="date" className="modern-input-field" value={selectedPayment.receiptDate} onChange={(e) => setSelectedPayment({...selectedPayment, receiptDate: e.target.value})} />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={closeModal} className="fw-bold px-4 rounded-pill">Discard</Button>
          <Button className="btn-indigo-gradient px-4 border-0 fw-bold rounded-pill" onClick={() => { updatePayment(selectedPayment); closeModal(); }}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Main Table Container */}
      <div className="ledger-card shadow-sm border-0">

        <div className="table-responsive">
          <Table hover className="ledger-modern-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Receipt ID</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th className="text-end">Amount</th>
                <th>Method</th>
                <th>Staff</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-5"><Spinner animation="border" variant="primary" size="sm" /></td></tr>
              ) : arraypayment.length > 0 ? (
                arraypayment.map((payment, index) => (
                  <tr key={index} className={payment.status?.toLowerCase() === "cancel" ? "row-is-canceled" : ""}>
                    <td className="text-muted small">{index + 1}</td>
                    <td>
                      <button 
                        className="receipt-id-btn"
                        onClick={(e) => { e.preventDefault(); setCurrentPayment(payment); setShowOptionsModal(true); }}
                      >
                        {payment.receiptNo}
                      </button>
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td className="text-nowrap">{payment.receiptDate}</td>
                    <td className="fw-bold text-dark text-end">₹{payment.amount.toLocaleString()}</td>
                    <td><span className="mode-pill">{payment.paymentMode}</span></td>
                    <td className="small">{userMap[payment.collectedBy] || "N/A"}</td>
                    <td className="narration-text">{payment.narration || "---"}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center py-5 text-muted">No transaction history found</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <style>{`
        .payment-master-wrapper { padding: 5px; font-family: 'Inter', sans-serif; }
        .text-indigo { color: #4f46e5; }
        .btn-indigo-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; }

        /* Ledger Card Styling */
        .ledger-card { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
        .ledger-header-area { padding: 25px; border-bottom: 1px solid #f1f5f9; background: #fff; }
        .header-icon-circle { width: 45px; height: 45px; background: #eef2ff; color: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }

        /* Modern Table */
        .ledger-modern-table thead th { 
          background: #f8fafc; color: #64748b; font-size: 0.7rem; 
          text-transform: uppercase; letter-spacing: 1px; border-top: none; padding: 18px 15px; font-weight: 800;
        }
        .ledger-modern-table tbody td { padding: 16px 15px; vertical-align: middle; border-bottom: 1px solid #f8fafc; font-size: 0.88rem; color: #334155; }
        .receipt-id-btn { border: none; background: #e2e8f0; color: #475569; font-weight: 700; padding: 4px 12px; border-radius: 8px; font-size: 0.85rem; transition: 0.2s; }
        .receipt-id-btn:hover { background: #6d28d9; color: white; transform: translateY(-1px); }
        .row-is-canceled { opacity: 0.5; background: #fff1f2; }
        
        .status-pill { padding: 5px 12px; border-radius: 50px; font-weight: 700; font-size: 0.65rem; text-transform: uppercase; }
        .status-paid { background: #d1fae5; color: #d1fae5; }
        .status-cancel { background: #fee2e2; color: #b91c1c; }
        .status-pending { background: #fef9c3; color: #fef9c3; }
        
        .mode-pill { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; color: #475569; font-weight: 700; border: 1px solid #e2e8f0; }
        .narration-text { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #94a3b8; font-size: 0.75rem; }

        /* Options Grid Modern */
        .receipt-infobar { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .options-grid-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .grid-opt-btn { 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff;
          font-weight: 700; font-size: 0.8rem; transition: 0.2s; gap: 10px;
        }
        .grid-opt-btn .opt-icon { font-size: 1.5rem; }
        .grid-opt-btn:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .opt-cancel:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        .opt-edit:hover { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; }
        .opt-download:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
        .opt-share:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }

        /* Form Fields */
        .field-label { font-size: 0.7rem; font-weight: 800; color: #475569; margin-bottom: 6px; text-transform: uppercase; display: block; }
        .input-group-modern { position: relative; display: flex; align-items: center; }
        .input-icon-text { position: absolute; left: 15px; font-weight: 700; color: #94a3b8; }
        .modern-input-field { width: 100%; padding: 10px 15px 10px 35px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; }
        .modern-select-field { width: 100%; padding: 10px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; appearance: none; background: #fff; cursor: pointer; outline: none; }
        .modern-input-field:focus, .modern-select-field:focus { border-color: #4f46e5; }
      `}</style>
    </div>
  );
}