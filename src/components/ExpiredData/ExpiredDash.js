import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import * as XLSX from "xlsx";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import { API } from "../../FirebaseConfig";
import { 
  FaCalendarAlt, FaMapMarkerAlt, FaGlobe, FaBuilding, 
  FaDatabase, FaExclamationCircle, FaArrowLeft 
} from "react-icons/fa";

const ExpiredDash = () => {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate(); // Navigation hook

  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isp: "All",
    Colony: "All",
    Status: "All",
    Source: "All",
  });

  // 1. Debounced state for API calls
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);
  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueIsp, setUniqueIsp] = useState([]);
  const [uniqueCompany, setUniqueCompany] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Buffer logic (Debounce 500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filter);
    }, 800);

    return () => clearTimeout(handler);
  }, [filter]);

  const downloadExcel = () => {
    const dataToDownload = filterData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expired data");
    XLSX.writeFile(workbook, `Expired_Data_${Date.now()}.xlsx`);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(
        `/reports/expired?partnerId=${partnerId}&startDate=${
          new Date(debouncedFilter.startDate).toISOString().split("T")[0]
        }&endDate=${new Date(debouncedFilter.endDate).toISOString().split("T")[0]}`
      );

      if (response.status !== 200 || !response.data) return;

      const snapshot = response.data;
      const expiredArray = snapshot.data;

      setUniqueIsp([...new Set(expiredArray.map((data) => data.isp))]);
      setUniqueColony([...new Set(expiredArray.map((data) => data.colony))]);
      setUniqueCompany([...new Set(expiredArray.map((data) => data.company))]);
      setArrayData(expiredArray);
    } catch (error) {
      console.error("Error fetching expired users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch only when debounced filter (dates) change
  useEffect(() => {
    fetchData();
  }, [debouncedFilter.startDate, debouncedFilter.endDate]);

  // 4. Local filtering (Immediate UI response)
  useEffect(() => {
    let filteredArray = arrayData;
    if (filter.Status !== "All") filteredArray = filteredArray.filter((data) => data.company === filter.Status);
    if (filter.Source !== "All") filteredArray = filteredArray.filter((data) => data.Source === filter.Source);
    if (filter.isp !== "All") filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    if (filter.Colony !== "All") filteredArray = filteredArray.filter((data) => data.colony === filter.Colony);
    setFilteredData(filteredArray);
  }, [arrayData, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div className="expired-dash-wrapper">
      {/* Header & Back Button */}
      <div className="expired-top-bar">
        <div className="title-section d-flex align-items-center">
          <button className="back-btn-ui me-3" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div>
            <h4 className="m-0 fw-bold text-dark">Expired Subscriptions</h4>
            <p className="text-muted small m-0 d-none-mobile">Partner ID: {partnerId}</p>
          </div>
        </div>
        
        <div className="summary-cards">
          <div className="summary-item total">
            <div className="icon-box"><FaDatabase /></div>
            <div className="summary-info">
              <span className="label">Total Records</span>
              <span className="value">{filterData.length}</span>
            </div>
          </div>
          <button className="download-btn d-none-mobile" onClick={downloadExcel}>
            <img src={ExcelIcon} alt="Export" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-card shadow-sm">
        <div className="filter-grid">
          <div className="filter-field">
            <label><FaCalendarAlt /> Start Date</label>
            <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-field">
            <label><FaCalendarAlt /> End Date</label>
            <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
          </div>
          <div className="filter-field">
            <label><FaMapMarkerAlt /> Colony</label>
            <select name="Colony" value={filter.Colony} onChange={handleFilterChange}>
              <option value="All">All Colonies</option>
              {uniqueColony.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label><FaGlobe /> ISP</label>
            <select name="isp" value={filter.isp} onChange={handleFilterChange}>
              <option value="All">All ISPs</option>
              {uniqueIsp.map((isp, i) => <option key={i} value={isp}>{isp}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label><FaBuilding /> Company</label>
            <select name="Status" value={filter.Status} onChange={handleFilterChange}>
              <option value="All">All Companies</option>
              {uniqueCompany.map((com, i) => <option key={i} value={com}>{com}</option>)}
            </select>
          </div>
        </div>
        <button className="download-btn w-100 mt-3 d-show-mobile" onClick={downloadExcel}>
            <img src={ExcelIcon} alt="Export" /> <span>Export Report</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="table-card shadow-sm">
        <div className="table-responsive-custom">
          <table className="modern-table">
            <thead className="d-none-mobile">
              <tr>
                <th>S.No</th>
                <th>Subscriber Info</th>
                <th>Contact</th>
                <th>Expiry Date</th>
                <th>Due Amount</th>
                <th>Distribution</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted fw-semibold">Syncing Expired Records...</p>
                  </td>
                </tr>
              ) : filterData.length > 0 ? (
                filterData.map((data, index) => (
                  <tr key={index} className={`mobile-row ${data.status === "Terminated" ? "row-terminated" : ""}`}>
                    <td className="text-center font-bold text-muted d-none-mobile">{index + 1}</td>
                    <td data-label="Subscriber">
                      <div className="user-info">
                        <span className="user-id">{data.userid}</span>
                        <span className="user-name" title={data.fullname}>{data.fullname}</span>
                      </div>
                    </td>
                    <td data-label="Contact">{data.mobile}</td>
                    <td data-label="Expiry Date" className="expiry-cell">
                      {new Date(data.expDate).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "2-digit",
                      })}
                    </td>
                    <td data-label="Due Amount" className="due-cell">₹{data.dueamount}</td>
                    <td data-label="Distribution">
                      <div className="dist-info">
                        <small>ISP: {data.isp}</small>
                        <small>Area: {data.colony}</small>
                      </div>
                    </td>
                    <td data-label="Status">
                      <span className={`badge-custom ${data.status === "Terminated" ? "terminated" : "expired"}`}>
                        {data.status || "Expired"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data-msg">
                    <FaExclamationCircle className="mb-2" size={30} />
                    <p>No expired subscriptions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .expired-dash-wrapper { padding: 20px; background-color: #f8f9fc; min-height: 100vh; font-family: 'Inter', sans-serif; }
        
        .back-btn-ui {
          width: 40px; height: 40px; border-radius: 10px; border: none;
          background: #fff; color: #4e73df; display: flex; align-items: center;
          justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;
        }

        .expired-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 15px; }
        .summary-cards { display: flex; gap: 15px; align-items: center; }
        .summary-item { background: #fff; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; gap: 12px; border: 1px solid #e3e6f0; }
        .summary-info .label { font-size: 10px; color: #858796; text-transform: uppercase; display: block; }
        .summary-info .value { font-size: 16px; font-weight: 700; color: #2e2f37; }

        .download-btn { background: #fff; border: 1px solid #1cc88a; color: #1cc88a; padding: 10px 15px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
        .download-btn:hover { background: #1cc88a; color: #fff; }
        .download-btn img { width: 16px; }

        .filter-card { background: #fff; padding: 20px; border-radius: 15px; margin-bottom: 25px; border: 1px solid #e3e6f0; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; }
        .filter-field label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #4e73df; margin-bottom: 5px; }
        .filter-field input, .filter-field select { width: 100%; padding: 8px; border: 1px solid #d1d3e2; border-radius: 8px; font-size: 13px; color: #6e707e; }

        .modern-table { width: 100%; border-collapse: collapse; }
        .modern-table thead th { background: #f8f9fc; color: #4e73df; font-size: 11px; text-transform: uppercase; padding: 12px; text-align: left; border-bottom: 2px solid #e3e6f0; }
        .modern-table tbody td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f1f1; vertical-align: middle; }
        
        .user-id { font-weight: 700; color: #2e2f37; display: block; }
        .user-name { font-size: 11px; color: #858796; }
        .expiry-cell { font-weight: 600; color: #e74a3b; }
        .due-cell { font-weight: 700; }
        .badge-custom { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
        .badge-custom.expired { background: #fff3cd; color: #856404; }
        .badge-custom.terminated { background: #f8d7da; color: #721c24; }

        .d-show-mobile { display: none; }

        @media (max-width: 768px) {
          .d-none-mobile { display: none !important; }
          .d-show-mobile { display: flex; }
          .summary-cards { width: 100%; justify-content: flex-end; }
          .filter-grid { grid-template-columns: 1fr 1fr; }
          
          /* Mobile Card-style Table */
          .modern-table, .modern-table tbody, .modern-table tr, .modern-table td { display: block; width: 100%; }
          .modern-table thead { display: none; }
          .mobile-row { border-bottom: 8px solid #f8f9fc; padding: 15px 10px; }
          .modern-table td { border: none; position: relative; padding: 8px 0 8px 45% !important; text-align: right; border-bottom: 1px dashed #eee; }
          .modern-table td::before { content: attr(data-label); position: absolute; left: 0; width: 40%; text-align: left; font-weight: 700; color: #94a3b8; font-size: 10px; text-transform: uppercase; }
          .user-info, .dist-info { align-items: flex-end; }
        }
      `}</style>
    </div>
  );
};

export default ExpiredDash;