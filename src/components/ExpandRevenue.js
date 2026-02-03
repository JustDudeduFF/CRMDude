import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { usePermissions } from "./PermissionProvider";
import { API } from "../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { 
  X, Download, ShieldCheck, Lock, Calendar, Search, 
  ChevronLeft, ChevronRight, Wallet, User, Receipt 
} from "lucide-react";

export default function ExpandRevenue({ show, modalShow }) {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totals, setTotals] = useState({ amount: 0, discount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    userId: ""
  });

  const [debouncedUserId, setDebouncedUserId] = useState(formData.userId);

  function formatRevenue(amount) {
    return amount.toLocaleString('en-IN');
  }

  const fetchRevenueData = async () => {
    try {
      const response = await API.get(
        `/dashboard-data/payments/${partnerId}?startDate=${formData.startDate}&endDate=${formData.endDate}&username=${formData.userId}`
      );
      setArrayData(response.data.formattedData || []);
      setTotals({
        amount: response.data.totals.totalAmount || 0,
        discount: response.data.totals.totalDiscount || 0,
      });
      setCurrentPage(1);
    } catch (e) {
      console.error("Error fetching revenue data:", e);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [debouncedUserId, formData.startDate, formData.endDate]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedUserId(formData.userId), 300);
    return () => clearTimeout(handler);
  }, [formData.userId]);

  const handleCheckboxChange = (receipt) => {
    setSelectedRows((prev) => 
      prev.includes(receipt._id) ? prev.filter((id) => id !== receipt._id) : [...prev, receipt._id]
    );
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!hasPermission("PAYMENT_AUTHORIZATION")) return toast.error("Permission Denied");

    try {
      const response = await API.patch(`/dashboard-data/payment/authorized`, { ids: selectedRows });
      if (response.status === 200) {
        toast.success(`${response.data.modified} Payments Authorized`);
        setSelectedRows([]);
        fetchRevenueData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const downloadExcel = (selectedOnly = false) => {
    const dataToDownload = selectedOnly 
      ? arrayData.filter(item => selectedRows.includes(item._id)) 
      : arrayData;
      
    if (dataToDownload.length === 0) return toast.warn("No data to download");

    const formattedData = dataToDownload.map((item, index) => ({
      "S. No": index + 1,
      "User ID": item.userid,
      "Date": new Date(item.receiptdate).toLocaleDateString(),
      "Amount": item.amount,
      "Discount": item.discount,
      "TXN ID": item.transactionid,
      "Receipt": item.receiptno,
      "By": item.collectedby,
      "Mode": item.paymentmode,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue");
    XLSX.writeFile(workbook, "Revenue_Report.xlsx");
  };

  if (!show) return null;

  const paginatedData = arrayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(arrayData.length / itemsPerPage);

  return (
    <div className="rev-overlay">
      <ToastContainer position="top-center" />
      <div className="rev-container">
        {/* Updated Header with Integrated Stats */}
        <header className="rev-header">
          <div className="rev-header-left">
            <div className="rev-icon-main"><Wallet size={24} /></div>
            <div>
              <h3>Payment Authorization</h3>
              <p className="mobile-hide">Verify and lock collection records</p>
            </div>
          </div>

          <div className="rev-header-center desktop-only">
             <div className="header-stat">
                <span className="stat-label">Net Collection</span>
                <span className="stat-value">₹{formatRevenue(totals.amount)}</span>
             </div>
             <div className="header-stat-divider"></div>
             <div className="header-stat">
                <span className="stat-label">Discount</span>
                <span className="stat-value discount">₹{formatRevenue(totals.discount)}</span>
             </div>
             <div className="header-stat-divider"></div>
             <div className="header-stat">
                <span className="stat-label">Selected</span>
                <span className="stat-value count">{selectedRows.length}</span>
             </div>
          </div>

          <div className="rev-header-actions">
            <button className="rev-btn-icon excel" onClick={() => downloadExcel(false)} title="Export All">
              <Download size={20} />
            </button>
            <button className="rev-btn-close" onClick={modalShow}><X size={20} /></button>
          </div>
        </header>

        {/* Mobile Stats Bar (Only shows on mobile since desktop moved to header) */}
        <div className="mobile-only rev-mobile-stats">
            <span>Net: <strong>₹{formatRevenue(totals.amount)}</strong></span>
            <span>Selected: <strong>{selectedRows.length}</strong></span>
        </div>

        {/* Filters */}
        <div className="rev-filters">
          <div className="filter-group">
            <div className="input-with-icon">
              <Calendar size={16} />
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="input-with-icon">
              <Calendar size={16} />
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          
          <div className="filter-group-main">
            <div className="input-with-icon search-uid">
              <Search size={16} />
              <input type="text" placeholder="Search User ID..." value={formData.userId} onChange={(e) => setFormData({...formData, userId: e.target.value})} />
            </div>
            
            <button 
              className={`rev-auth-btn ${selectedRows.length > 0 ? 'active' : ''}`}
              onClick={handleAuthorize}
              disabled={selectedRows.length === 0}
            >
              <ShieldCheck size={18} />
              <span>Authorize</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="rev-main">
          <div className="rev-table-wrapper desktop-only">
            <table className="rev-table">
              <thead>
                <tr>
                  <th>Select</th>
                  <th>S.No</th>
                  <th>User ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Discount</th>
                  <th>TXN Details</th>
                  <th>By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? paginatedData.map((receipt, index) => (
                  <tr key={receipt._id} className={receipt.isauthorized ? 'row-locked' : ''}>
                    <td className="text-center">
                      {receipt.isauthorized ? <Lock size={16} className="icon-locked" /> : (
                        <input type="checkbox" checked={selectedRows.includes(receipt._id)} onChange={() => handleCheckboxChange(receipt)} />
                      )}
                    </td>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="text-bold">{receipt.userid}</td>
                    <td>{new Date(receipt.receiptdate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="text-bold">₹{receipt.amount}</td>
                    <td className="text-discount">₹{receipt.discount}</td>
                    <td>
                      <div className="td-stack">
                        <span className="txn-id">{receipt.transactionid}</span>
                        <span className="receipt-no">#{receipt.receiptno}</span>
                      </div>
                    </td>
                    <td>{receipt.collectedby}</td>
                    <td>
                      <span className={`status-pill ${receipt.isauthorized ? 'auth' : 'pend'}`}>
                        {receipt.isauthorized ? 'Authorized' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : <tr><td colSpan="9" className="no-data">No records found</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="rev-mobile-list mobile-only">
            {paginatedData.map((receipt) => (
              <div key={receipt._id} className={`rev-card ${receipt.isauthorized ? 'card-locked' : ''}`}>
                <div className="card-top">
                  <div className="card-user"><User size={14} /> <strong>{receipt.userid}</strong></div>
                  {receipt.isauthorized ? <Lock size={16} className="icon-locked" /> : (
                    <input type="checkbox" checked={selectedRows.includes(receipt._id)} onChange={() => handleCheckboxChange(receipt)} />
                  )}
                </div>
                <div className="card-details">
                  <div className="card-row">
                    <span>{new Date(receipt.receiptdate).toLocaleDateString()}</span>
                    <span className="card-amount">₹{receipt.amount}</span>
                  </div>
                  <div className="card-row secondary">
                    <span><Receipt size={12} /> {receipt.receiptno}</span>
                    <span className="card-mode">{receipt.paymentmode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {totalPages > 1 && (
          <footer className="rev-footer">
            <button className="pag-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft size={18} /></button>
            <span className="pag-text">Page <strong>{currentPage}</strong> of {totalPages}</span>
            <button className="pag-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight size={18} /></button>
          </footer>
        )}
      </div>

      <style>{`
        .rev-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem;
        }
        .rev-container {
          background: #f8fafc; width: 100%; max-width: 1200px; height: 90vh;
          border-radius: 24px; display: flex; flex-direction: column; overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }

        .rev-header {
          padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #e2e8f0;
          display: flex; justify-content: space-between; align-items: center; gap: 1rem;
        }
        .rev-header-left { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
        .rev-icon-main { background: #eff6ff; color: #3b82f6; padding: 10px; border-radius: 12px; }
        .rev-header-left h3 { margin: 0; font-size: 1.15rem; color: #1e293b; font-weight: 800; }
        .rev-header-left p { margin: 0; font-size: 0.75rem; color: #64748b; }

        /* Integrated Header Stats */
        .rev-header-center { display: flex; align-items: center; gap: 1.5rem; background: #f1f5f9; padding: 6px 20px; border-radius: 14px; }
        .header-stat { display: flex; flex-direction: column; align-items: center; }
        .stat-label { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .stat-value { font-size: 0.95rem; font-weight: 800; color: #1e293b; }
        .stat-value.discount { color: #ef4444; }
        .stat-value.count { color: #3b82f6; }
        .header-stat-divider { width: 1px; height: 24px; background: #cbd5e1; }

        .rev-header-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .rev-btn-icon { border: none; background: #f8fafc; width: 38px; height: 38px; border-radius: 10px; cursor: pointer; color: #475569; border: 1px solid #e2e8f0; }
        .rev-btn-close { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 5px; }

        .rev-mobile-stats { background: #1e293b; color: white; padding: 8px 15px; display: flex; justify-content: space-between; font-size: 0.85rem; }

        .rev-filters {
          padding: 1rem 2rem; display: flex; justify-content: space-between; gap: 1rem; background: #fff; border-bottom: 1px solid #e2e8f0;
        }
        .filter-group, .filter-group-main { display: flex; gap: 0.75rem; }
        .input-with-icon {
          position: relative; display: flex; align-items: center; background: #f8fafc;
          border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 10px;
        }
        .input-with-icon input { border: none; background: transparent; padding: 8px 5px; font-size: 0.85rem; outline: none; color: #1e293b; width: 130px;}
        .search-uid input { width: 180px; }

        .rev-auth-btn {
          display: flex; align-items: center; gap: 8px; padding: 0 15px;
          border-radius: 10px; border: none; font-weight: 700; font-size: 0.85rem;
          background: #e2e8f0; color: #94a3b8; transition: 0.3s;
        }
        .rev-auth-btn.active { background: #10b981; color: white; cursor: pointer; }

        .rev-main { flex: 1; overflow-y: auto; padding: 1rem 2rem; }
        .rev-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .rev-table th { text-align: left; padding: 12px; color: #64748b; font-weight: 600; border-bottom: 2px solid #f1f5f9; position: sticky; top: 0; background: white; }
        .rev-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .row-locked { background: #f8fafc; opacity: 0.7; }
        .icon-locked { color: #f59e0b; }
        .text-bold { font-weight: 700; color: #1e293b; }
        .text-discount { color: #ef4444; }
        .status-pill { padding: 3px 8px; border-radius: 5px; font-size: 0.7rem; font-weight: 700; }
        .status-pill.auth { background: #ecfdf5; color: #059669; }
        .status-pill.pend { background: #fff7ed; color: #d97706; }
        
        .rev-footer { padding: 0.75rem 2rem; display: flex; justify-content: center; align-items: center; gap: 1.5rem; background: #fff; border-top: 1px solid #e2e8f0; }
        .pag-btn { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .pag-btn:disabled { opacity: 0.4; }

        .desktop-only { display: flex; }
        .mobile-only { display: none; }

        @media (max-width: 900px) {
          .desktop-only { display: none; }
          .mobile-only { display: block; }
          .rev-header { padding: 1rem; }
          .rev-filters { flex-direction: column; padding: 1rem; }
          .filter-group, .filter-group-main { width: 100%; }
          .input-with-icon { flex: 1; }
          .input-with-icon input { width: 100%; }
          .rev-main { padding: 1rem; }
          .rev-card { background: white; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; border: 1px solid #e2e8f0; }
          .card-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .card-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
          .card-amount { font-weight: 800; }
          .secondary { color: #64748b; font-size: 0.8rem; margin-top: 4px; }
        }
      `}</style>
    </div>
  );
}