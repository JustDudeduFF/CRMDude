// src/components/DueData/DueDash.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import * as XLSX from "xlsx";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import { API } from "../../FirebaseConfig";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaUserTie,
  FaCheckCircle,
  FaRupeeSign,
  FaArrowLeft, // Added for back button
} from "react-icons/fa";

export default function DueDash() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate(); // Hook for back button

  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isp: "All",
    Colony: "All",
    Status: "All",
    Company: "All",
  });
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);
  const [uniqueColony, setUniqueColony] = useState([]);
  const [unique, setUniqueUser] = useState([]);
  const [uniqueCompany, setUniqueCompany] = useState([]);
  const [uniquestatus, setUniqueStatus] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 800); // 500ms buffer

    return () => {
      clearTimeout(handler); // Cancel the timer if user changes filter again before 500ms
    };
  }, [filter]);

  function formatRevenue(amount) {
    return amount.toLocaleString("en-IN");
  }

  const downloadExcel = () => {
    const dataToDownload = filterData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Due Amount data");
    XLSX.writeFile(workbook, `Due_Amount_Report_${Date.now()}.xlsx`);
  };

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(
        `/reports/dueAmount?partnerId=${partnerId}&startDate=${
          new Date(filter.startDate).toISOString().split("T")[0]
        }&endDate=${new Date(filter.endDate).toISOString().split("T")[0]}`,
      );

      if (response.status !== 200 || !response.data) return;
      const arrayData = response.data;

      if (arrayData) {
        setArrayData(arrayData.dueArray);
        setTotalDue(arrayData.total.totalAmount);
        setUniqueUser([
          ...new Set(arrayData.dueArray.map((data) => data.lastrenew)),
        ]);
        setUniqueColony([
          ...new Set(arrayData.dueArray.map((data) => data.colony)),
        ]);
        setUniqueCompany([
          ...new Set(arrayData.dueArray.map((data) => data.company)),
        ]);
        setUniqueStatus([
          ...new Set(arrayData.dueArray.map((data) => data.status)),
        ]);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [debouncedFilter.startDate, debouncedFilter.endDate]);

  useEffect(() => {
    let filteredArray = arrayData;
    // We use the immediate 'filter' here so the list updates instantly
    // for local dropdowns (ISP, Colony, etc.)
    if (filter.Company !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.company === filter.Company,
      );
    if (filter.isp !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.lastrenew === filter.isp,
      );
    if (filter.Colony !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.colony === filter.Colony,
      );
    if (filter.Status !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.status === filter.Status,
      );

    setFilteredData(filteredArray);
    setCurrentPage(1);
  }, [arrayData, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filterData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="due-dash-container">
      {/* Header with Back Button */}
      <div className="due-dash-header">
        <div className="d-flex align-items-center">
          <button
            className="back-btn-ui"
            onClick={() => navigate(-1)}
            title="Go Back"
          >
            <FaArrowLeft />
          </button>
          <h5 className="ms-3 mb-0 fw-bold text-dark">Outstanding Dues</h5>
        </div>
        <div className="export-action-card d-none-mobile">
          <button className="excel-btn" onClick={downloadExcel}>
            <img src={ExcelIcon} alt="XLSX" /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="due-dash-stats">
        <div className="stat-card">
          <div className="stat-icon due">
            <FaRupeeSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Outstanding Due</span>
            <h3 className="stat-value">₹{formatRevenue(totalDue)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUserTie />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Debtors</span>
            <h3 className="stat-value">{filterData.length} Customers</h3>
          </div>
        </div>
        {/* Mobile Export Button */}
        <div className="export-action-card d-show-mobile">
          <button className="excel-btn w-100" onClick={downloadExcel}>
            <img src={ExcelIcon} alt="XLSX" /> Export Report
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="due-filter-card">
        <div className="filter-header">
          <h6>
            <FaCalendarAlt className="me-2" /> Range & Filters
          </h6>
        </div>
        <div className="filter-grid">
          <div className="field">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="field">
            <label>Renewed By</label>
            <select name="isp" value={filter.isp} onChange={handleFilterChange}>
              <option value="All">All Staff</option>
              {unique.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Colony</label>
            <select
              name="Colony"
              value={filter.Colony}
              onChange={handleFilterChange}
            >
              <option value="All">All Areas</option>
              {uniqueColony.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              name="Status"
              value={filter.Status}
              onChange={handleFilterChange}
            >
              <option value="All">All Status</option>
              {uniquestatus.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Company</label>
            <select
              name="Company"
              value={filter.Company}
              onChange={handleFilterChange}
            >
              <option value="All">All Companies</option>
              {uniqueCompany.map((item, i) => (
                <option key={i} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="due-table-card">
        <div className="table-responsive">
          <table className="due-modern-table">
            <thead className="d-none-mobile">
              <tr>
                <th>S.No</th>
                <th>Subscriber Info</th>
                <th>Activated</th>
                <th>Contact</th>
                <th>Due Amount</th>
                <th>Address</th>
                <th>Management</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div
                      className="spinner-grow text-primary"
                      role="status"
                    ></div>
                    <p className="mt-2 text-muted">
                      Calculating Due Amounts...
                    </p>
                  </td>
                </tr>
              ) : currentTickets.length > 0 ? (
                currentTickets.map((data, index) => (
                  <tr key={index} className="mobile-row">
                    <td className="text-center d-none-mobile">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td data-label="Subscriber">
                      <div className="user-id-cell">{data.userid}</div>
                      <div className="user-name-cell">{data.name}</div>
                    </td>
                    <td data-label="Activated" className="text-nowrap">
                      {new Date(data.activateDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>
                    <td data-label="Contact">{data.mobile}</td>
                    <td data-label="Due Amount" className="due-amount-cell">
                      ₹{data.dueAmount}
                    </td>
                    <td data-label="Address" className="address-cell">
                      <span title={data.address}>{data.address}</span>
                    </td>
                    <td data-label="Management">
                      <div className="mgmt-stack">
                        <span>
                          <FaUserTie className="icon" /> {data.lastrenew}
                        </span>
                        <span>
                          <FaMapMarkerAlt className="icon" /> {data.colony}
                        </span>
                        <span className="d-none-mobile">
                          <FaBuilding className="icon" /> {data.company}
                        </span>
                      </div>
                    </td>
                    <td data-label="Status">
                      <span
                        className={`status-badge ${data.status.toLowerCase()}`}
                      >
                        {data.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data-cell">
                    No due records found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        {totalPages > 1 && (
          <div className="due-pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <div className="page-numbers">
              <button className="active">{currentPage}</button>
              <span className="mx-2">of {totalPages}</span>
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .due-dash-container { padding: 15px; background: #f4f7fe; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .due-dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        
        .back-btn-ui {
          width: 40px; height: 40px; border-radius: 10px; border: none;
          background: #fff; color: #4f46e5; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: pointer; transition: 0.2s;
        }
        .back-btn-ui:hover { background: #4f46e5; color: #fff; }

        /* Stats Section */
        .due-dash-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: #fff; padding: 20px; border-radius: 16px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .stat-icon { width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: 15px; }
        .stat-icon.due { background: #fee2e2; color: #ef4444; }
        .stat-icon.users { background: #e0e7ff; color: #4f46e5; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .stat-value { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }

        .excel-btn { background: #fff; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; cursor: pointer; }
        .excel-btn img { width: 18px; }

        /* Filter Section */
        .due-filter-card { background: #fff; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden; }
        .filter-header { background: #fafbff; padding: 12px 20px; border-bottom: 1px solid #f1f5f9; }
        .filter-header h6 { margin: 0; font-size: 14px; font-weight: 700; color: #475569; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; padding: 15px; }
        .field label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px; display: block; }
        .field input, .field select { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #1e293b; }

        /* Table Section */
        .due-table-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .due-modern-table { width: 100%; border-collapse: collapse; }
        .due-modern-table thead th { background: #fafbff; padding: 12px 15px; font-size: 11px; font-weight: 700; color: #64748b; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .due-modern-table tbody td { padding: 12px 15px; font-size: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .user-id-cell { font-weight: 700; color: #4f46e5; }
        .user-name-cell { font-size: 11px; color: #64748b; }
        .due-amount-cell { font-weight: 800; color: #ef4444; }
        .status-badge { padding: 3px 8px; border-radius: 5px; font-size: 10px; font-weight: 700; text-transform: capitalize; }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.expired { background: #fee2e2; color: #991b1b; }

        .due-pagination { padding: 15px; display: flex; justify-content: space-between; align-items: center; }

        /* RESPONSIVE LOGIC */
        .d-show-mobile { display: none; }
        
        @media (max-width: 768px) {
            .d-none-mobile { display: none !important; }
            .d-show-mobile { display: block; }
            .due-dash-stats { grid-template-columns: 1fr; }
            .filter-grid { grid-template-columns: 1fr 1fr; }
            
            /* Table to Card conversion */
            .due-modern-table, .due-modern-table tbody, .due-modern-table tr, .due-modern-table td { display: block; width: 100%; }
            .due-modern-table thead { display: none; }
            .mobile-row { border-bottom: 10px solid #f4f7fe; padding: 15px; }
            .due-modern-table td { border: none; position: relative; padding: 8px 0 8px 45% !important; text-align: right; border-bottom: 1px dashed #f1f5f9; }
            .due-modern-table td:last-child { border-bottom: none; }
            .due-modern-table td::before { content: attr(data-label); position: absolute; left: 0; width: 40%; text-align: left; font-weight: 700; color: #94a3b8; font-size: 10px; text-transform: uppercase; }
            
            .mgmt-stack { align-items: flex-end; }
        }
      `}</style>
    </div>
  );
}
