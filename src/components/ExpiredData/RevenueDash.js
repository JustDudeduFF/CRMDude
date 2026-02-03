import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import ExcelIcon from '../subscriberpage/drawables/xls.png';
import { API } from '../../FirebaseConfig';
import { 
  FaCalendarAlt, FaWallet, FaTag, FaCheckCircle, 
  FaTimesCircle, FaMapMarkerAlt, FaUserEdit, 
  FaArrowLeft, FaShieldAlt 
} from 'react-icons/fa';

const RevenueDash = () => {
  const partnerId = localStorage.getItem('partnerId');
  
  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isp: 'All',
    Colony: 'All',
    Status: 'All',
    Company: 'All',
  });

  const [debouncedDates, setDebouncedDates] = useState({
    startDate: filter.startDate,
    endDate: filter.endDate
  });

  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]); // State for selected users
  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueMode, setUniqueMode] = useState([]);
  const [uniqueCompany, setUniqueCompany] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState({ amount: 0, discount: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDates({
        startDate: filter.startDate,
        endDate: filter.endDate
      });
    }, 800);
    return () => clearTimeout(handler);
  }, [filter.startDate, filter.endDate]);

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(
        `/reports/revenue?partnerId=${partnerId}&startDate=${debouncedDates.startDate}&endDate=${debouncedDates.endDate}`
      );

      if (response.status !== 200 || !response.data) return;

      const array = Object.values(response.data.data);
      setUniqueMode([...new Set(array.map((data) => data.PaymentMode))]);
      setUniqueColony([...new Set(array.map((data) => data.colonyName))]);
      setUniqueCompany([...new Set(array.map((data) => data.company))]);
      setArrayData(array);
      setTotal({
        amount: response.data.total.totalAmount,
        discount: response.data.total.totalDiscount
      });
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [debouncedDates]);

  useEffect(() => {
    let filteredArray = arrayData;
    if (filter.Status !== 'All') filteredArray = filteredArray.filter((data) => data.authorized === (filter.Status === 'true'));
    if (filter.Company !== 'All') filteredArray = filteredArray.filter((data) => data.company === filter.Company);
    if (filter.isp !== 'All') filteredArray = filteredArray.filter((data) => data.PaymentMode === filter.isp);
    if (filter.Colony !== 'All') filteredArray = filteredArray.filter((data) => data.colonyName === filter.Colony);
    setFilteredData(filteredArray);
    setSelectedIds([]); // Reset selection when filter changes
  }, [arrayData, filter.Status, filter.Company, filter.isp, filter.Colony]);

  function formatRevenue(amount) {
    return amount ? amount.toLocaleString('en-IN') : "0";
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  // Selection Logic
  const handleSelectUser = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(d => d.paymentId));
    }
  };

  const handleAuthorizeSelected = () => {
    if (selectedIds.length === 0) return alert("Select users first");
    console.log("Authorizing IDs:", selectedIds);
    alert(`Authorizing ${selectedIds.length} users...`);
    // Add your API call here
  };

  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const paginatedData = filterData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="revenue-dash-container">
      {/* Top Header Navigation */}
      <div className="dash-top-nav">
        <button className="back-btn" onClick={() => window.history.back()}>
          <FaArrowLeft /> <span>Back</span>
        </button>
        {selectedIds.length > 0 && (
          <button className="bulk-auth-btn" onClick={handleAuthorizeSelected}>
            <FaShieldAlt /> Authorize ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Financial Summary Section */}
      <div className="revenue-stats-grid">
        <div className="rev-stat-card primary">
          <div className="stat-icon-wrap"><FaWallet /></div>
          <div className="stat-content">
            <p className="stat-label">Total Collections</p>
            <h3 className="stat-value">₹{formatRevenue(total.amount)}</h3>
          </div>
        </div>

        <div className="rev-stat-card secondary">
          <div className="stat-icon-wrap"><FaTag /></div>
          <div className="stat-content">
            <p className="stat-label">Total Discounts</p>
            <h3 className="stat-value">₹{formatRevenue(total.discount)}</h3>
          </div>
        </div>
      </div>

      {/* Modern Filter Panel */}
      <div className="revenue-filter-panel shadow-sm">
        <div className="filter-panel-header">
            <h6><FaCalendarAlt className="me-2" /> Collection Filters</h6>
        </div>
        <div className="filter-inner-grid">
          <div className="rev-field">
            <label>Start Date</label>
            <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
          </div>
          <div className="rev-field">
            <label>End Date</label>
            <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
          </div>
          <div className="rev-field">
            <label>Colony</label>
            <select name="Colony" value={filter.Colony} onChange={handleFilterChange}>
              <option value="All">All Areas</option>
              {uniqueColony.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rev-field">
            <label>Status</label>
            <select name="Status" value={filter.Status} onChange={handleFilterChange}>
              <option value="All">All Status</option>
              <option value="true">Authorized</option>
              <option value="false">Unauthorized</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="revenue-table-wrapper shadow-sm">
        <div className="table-responsive">
          <table className="rev-modern-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length > 0 && selectedIds.length === paginatedData.length}
                  />
                </th>
                <th>Subscriber</th>
                <th>Receipt</th>
                <th>Payment</th>
                <th className="hide-mobile">Area</th>
                <th className="hide-mobile">Collector</th>
                <th>Auth</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Calculating...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((data, index) => (
                  <tr key={index} className={selectedIds.includes(data.paymentId) ? 'row-selected' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(data.paymentId)}
                        onChange={() => handleSelectUser(data.paymentId)}
                      />
                    </td>
                    <td>
                      <div className="sub-id">{data.UserID}</div>
                      <div className="sub-name">{data.fullName}</div>
                    </td>
                    <td>
                      <span className="date-badge">
                        {new Date(data.Receipt_Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                    <td>
                      <div className="amount-main">₹{data.Amount}</div>
                      <div className="pay-mode-tag">{data.PaymentMode}</div>
                    </td>
                    <td className="hide-mobile">
                      <div className="area-text">{data.colonyName}</div>
                    </td>
                    <td className="hide-mobile">
                        <div className="collector-info">{data.Collected_By}</div>
                    </td>
                    <td>
                      {data.authorized ? (
                        <FaCheckCircle className="text-success" />
                      ) : (
                        <FaTimesCircle className="text-danger" />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {filterData.length > itemsPerPage && (
          <div className="rev-pagination">
            <button 
              className="page-nav"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >Prev</button>
            <div className="page-indicator"><strong>{currentPage}</strong> / {totalPages}</div>
            <button 
              className="page-nav"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >Next</button>
          </div>
        )}
      </div>

      <style>{`
        .revenue-dash-container { padding: 20px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        /* Header & Action Buttons */
        .dash-top-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .back-btn { background: #fff; border: 1px solid #e2e8f0; padding: 10px 18px; border-radius: 10px; display: flex; align-items: center; gap: 8px; color: #475569; font-weight: 600; cursor: pointer; }
        .bulk-auth-btn { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; display: flex; align-items: center; gap: 8px; cursor: pointer; animation: fadeIn 0.3s ease; }

        .revenue-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .rev-stat-card { background: #fff; padding: 20px; border-radius: 14px; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .stat-icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .rev-stat-card.primary .stat-icon-wrap { background: #eef2ff; color: #4f46e5; }
        .rev-stat-card.secondary .stat-icon-wrap { background: #fff1f2; color: #e11d48; }
        .stat-label { color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; margin: 0; }
        .stat-value { color: #1e293b; font-size: 22px; font-weight: 800; margin: 2px 0 0 0; }

        .revenue-filter-panel { background: #fff; border-radius: 14px; margin-bottom: 20px; border: 1px solid #edf2f7; }
        .filter-panel-header { padding: 12px 20px; border-bottom: 1px solid #f1f5f9; }
        .filter-panel-header h6 { margin: 0; font-size: 13px; color: #475569; }
        .filter-inner-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; padding: 20px; }
        .rev-field label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .rev-field input, .rev-field select { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; }

        .revenue-table-wrapper { background: #fff; border-radius: 14px; border: 1px solid #edf2f7; overflow: hidden; }
        .rev-modern-table { width: 100%; border-collapse: collapse; }
        .rev-modern-table thead th { background: #f8fafc; padding: 15px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
        .rev-modern-table tbody td { padding: 14px 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .row-selected { background-color: #f5f7ff; }
        
        .sub-id { font-weight: 800; color: #4f46e5; font-size: 12px; }
        .sub-name { font-weight: 600; color: #1e293b; font-size: 13px; }
        .date-badge { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #475569; }
        .amount-main { font-weight: 800; font-size: 14px; }
        .pay-mode-tag { font-size: 9px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 3px; }
        .area-text { font-size: 11px; color: #94a3b8; }
        
        .rev-pagination { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
        .page-nav { padding: 6px 15px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; font-size: 12px; cursor: pointer; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .revenue-dash-container { padding: 12px; }
          .hide-mobile { display: none; }
          .filter-inner-grid { grid-template-columns: 1fr 1fr; padding: 15px; }
          .rev-stat-card { padding: 15px; }
          .stat-value { font-size: 18px; }
          .rev-modern-table thead th, .rev-modern-table tbody td { padding: 10px; }
        }
      `}</style>
    </div>
  );
};

export default RevenueDash;