// src/components/TicketData/TicketdataDash.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for back button
import { API } from "../../FirebaseConfig";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import * as XLSX from "xlsx";
import { 
  FaTicketAlt, 
  FaFilter, 
  FaMapMarkerAlt, 
  FaPhoneAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft // Added for back button
} from "react-icons/fa";

export default function TicketdataDash() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate(); // Navigation hook
  
  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isp: "All",
    Colony: "All",
    Status: "Pending",
    Source: "All",
  });
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);

  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueIsp, setUniqueIsp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExpandData = async () => {
      setIsLoading(true);
      try {
        const subsResponse = await API.get(
          `/reports/tickets?partnerId=${partnerId}&startDate=${
            new Date(filter.startDate).toISOString().split("T")[0]
          }&endDate=${
            new Date(filter.endDate).toISOString().split("T")[0]
            }&status=${filter.Status}`
        );

        if (subsResponse.status !== 200) return;
        const subsSnap = subsResponse.data;
        const dataArray = subsSnap.data;

        const isps = [...new Set(dataArray.map((data) => data.isp))];
        const colonys = [...new Set(dataArray.map((data) => data.Colony))];
        setUniqueIsp(isps);
        setUniqueColony(colonys);
        setArrayData(dataArray);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpandData();
  }, [filter.startDate, filter.endDate, filter.Status]);

  useEffect(() => {
    let filteredArray = arrayData;

    if (filter.Source !== "All") {
      filteredArray = filteredArray.filter((data) => data.source === filter.Source);
    }
    if (filter.isp !== "All") {
      filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    }
    if (filter.Colony !== "All") {
      filteredArray = filteredArray.filter((data) => data.Colony === filter.Colony);
    }

    setFilteredData(filteredArray);
  }, [arrayData, filter]);

  const downloadExcel = () => {
    const dataToDownload = filterData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets data");
    XLSX.writeFile(workbook, `Tickets_Report_${filter.Status}.xlsx`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return <span className="ticket-badge b-success"><FaCheckCircle /> Closed</span>;
    if (s === 'pending') return <span className="ticket-badge b-warning"><FaClock /> Pending</span>;
    return <span className="ticket-badge b-danger"><FaExclamationCircle /> {status}</span>;
  };

  return (
    <div className="ticket-dash-container">
      {/* Header Section */}
      <div className="ticket-header-card shadow-sm">
        <div className="header-left">
          {/* BACK BUTTON */}
          <button className="back-btn-round" onClick={() => navigate(-1)} title="Go Back">
             <FaArrowLeft />
          </button>
          
          <div className="icon-box d-none-mobile"><FaTicketAlt /></div>
          <div>
            <h3>Ticket Registry</h3>
            <p className="d-none-mobile">Managing {filterData.length} queries</p>
          </div>
        </div>
        <button className="export-excel-btn" onClick={downloadExcel}>
          <img src={ExcelIcon} alt="XLS" />
          <span className="d-none-mobile">Export</span>
        </button>
      </div>

      {/* Modern Filter Strip */}
      <div className="ticket-filter-grid shadow-sm">
        <div className="filter-item">
          <label><FaClock /> Start</label>
          <input type="date" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-item">
          <label><FaClock /> End</label>
          <input type="date" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-item">
          <label><FaFilter /> Status</label>
          <select name="Status" value={filter.Status} onChange={handleFilterChange}>
            <option value="All">All Tickets</option>
            <option value="Completed">Closed</option>
            <option value="Pending">Pending</option>
            <option value="Unassigned">Unassigned</option>
          </select>
        </div>
        <div className="filter-item">
          <label><FaFilter /> Source</label>
          <select name="Source" value={filter.Source} onChange={handleFilterChange}>
            <option value="All">All Sources</option>
            <option value="Manual">Manual</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Mobile App">App</option>
          </select>
        </div>
        <div className="filter-item">
          <label>ISP</label>
          <select name="isp" value={filter.isp} onChange={handleFilterChange}>
            <option value="All">All ISPs</option>
            {uniqueIsp.map((isp, i) => <option key={i} value={isp}>{isp}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Colony</label>
          <select name="Colony" value={filter.Colony} onChange={handleFilterChange}>
            <option value="All">All Colonies</option>
            {uniqueColony.map((col, i) => <option key={i} value={col}>{col}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="ticket-table-wrapper shadow-sm">
        <div className="table-responsive">
          <table className="ticket-modern-table">
            <thead className="d-none-mobile">
              <tr>
                <th>Ticket ID</th>
                <th>Subscriber Info</th>
                <th>Concern & Source</th>
                <th>Location Details</th>
                <th>Technical Info</th>
                <th>Resolution</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="table-loader">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Fetching Records...</p>
                  </td>
                </tr>
              ) : filterData.length > 0 ? (
                filterData.map((data, index) => (
                  <tr key={index} className="mobile-card-row">
                    <td className="ticket-id-cell" data-label="ID">#{data.Ticketno}</td>
                    <td data-label="Subscriber">
                      <div className="user-info">
                        <span className="u-name">{data.fullName}</span>
                        <span className="u-id">{data.subsID}</span>
                        <span className="u-phone"><FaPhoneAlt size={10}/> {data.mobileNo}</span>
                      </div>
                    </td>
                    <td data-label="Concern">
                      <div className="concern-text">{data.Concern}</div>
                      <span className="source-tag">{data.source || 'Manual'}</span>
                    </td>
                    <td data-label="Location">
                      <div className="addr-box">
                        <p className="addr-text" title={data.address}>{data.address}</p>
                        <span className="colony-tag"><FaMapMarkerAlt size={10}/> {data.Colony}</span>
                      </div>
                    </td>
                    <td data-label="Technical">
                      <div className="isp-text">{data.isp}</div>
                      <div className="date-text">{data.creationdate}</div>
                    </td>
                    <td data-label="Resolution">
                      <div className="completed-by">
                        <label className="d-none-mobile">Resolved By:</label>
                        <span>{data.completedby || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td data-label="Status">{getStatusBadge(data.Status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-table-state">
                    No tickets found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .ticket-dash-container {
          padding: 15px;
          background: #f8f9fc;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* Header Card */
        .ticket-header-card {
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border: 1px solid #e3e6f0;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        
        .back-btn-round {
          width: 35px; height: 35px; border-radius: 50%; border: 1px solid #d1d3e2;
          background: #fff; color: #4e73df; display: flex; align-items: center;
          justify-content: center; cursor: pointer; transition: 0.2s;
        }
        .back-btn-round:hover { background: #4e73df; color: white; border-color: #4e73df; }

        .icon-box { 
          width: 40px; height: 40px; background: #4e73df; 
          border-radius: 10px; display: flex; align-items: center; 
          justify-content: center; color: white; font-size: 18px;
        }
        .header-left h3 { margin: 0; font-size: 18px; font-weight: 800; color: #2e384d; }
        .header-left p { margin: 0; font-size: 12px; color: #858796; }
        
        .export-excel-btn {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #d1d3e2;
          padding: 8px 12px; border-radius: 8px; font-weight: 700;
          color: #2e384d; font-size: 13px;
        }
        .export-excel-btn img { width: 18px; }

        /* Filter Grid */
        .ticket-filter-grid {
          background: white; padding: 15px; border-radius: 12px;
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 12px; margin-bottom: 20px; border: 1px solid #e3e6f0;
        }
        .filter-item { display: flex; flex-direction: column; gap: 5px; }
        .filter-item label { font-size: 11px; font-weight: 700; color: #4e73df; display: flex; align-items: center; gap: 4px; }
        .filter-item input, .filter-item select {
          padding: 8px; border: 1px solid #d1d3e2; border-radius: 6px; font-size: 12px; outline: none; width: 100%;
        }

        /* Table Styling */
        .ticket-table-wrapper { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e3e6f0; }
        .ticket-modern-table { width: 100%; border-collapse: collapse; }
        .ticket-modern-table thead th {
          background: #f8f9fc; padding: 12px 15px; text-align: left;
          font-size: 11px; font-weight: 700; color: #4e73df; text-transform: uppercase;
        }
        .ticket-modern-table tbody td { padding: 12px 15px; border-bottom: 1px solid #f1f1f1; vertical-align: middle; }
        
        .ticket-id-cell { font-weight: 800; color: #4e73df; font-size: 13px; }
        .u-name { font-weight: 700; color: #2e384d; font-size: 13px; display: block; }
        .u-id { font-size: 10px; color: #858796; display: block; }
        .u-phone { font-size: 11px; color: #4e73df; font-weight: 600; }
        .concern-text { font-size: 12px; color: #2e384d; font-weight: 600; }
        .source-tag { font-size: 9px; background: #eaecf4; padding: 1px 6px; border-radius: 4px; color: #4e73df; font-weight: 800; }
        .addr-text { font-size: 11px; color: #858796; margin: 0; }
        .ticket-badge { padding: 4px 10px; border-radius: 15px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
        .b-success { background: #d1e7dd; color: #0f5132; }
        .b-warning { background: #fff3cd; color: #664d03; }
        .b-danger { background: #f8d7da; color: #842029; }

        /* MOBILE RESPONSIVENESS */
        @media (max-width: 768px) {
          .d-none-mobile { display: none !important; }
          .ticket-filter-grid { grid-template-columns: repeat(2, 1fr); }
          
          /* Force table to not be a table */
          .ticket-modern-table, .ticket-modern-table tbody, .ticket-modern-table tr, .ticket-modern-table td { 
            display: block; 
            width: 100%; 
          }
          
          .mobile-card-row {
            border-bottom: 8px solid #f8f9fc;
            padding: 15px;
            position: relative;
          }

          .ticket-modern-table td {
            text-align: right;
            padding: 8px 0;
            border: none;
            position: relative;
            padding-left: 45%;
            min-height: 35px;
          }

          .ticket-modern-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 0;
            width: 40%;
            text-align: left;
            font-weight: 700;
            font-size: 11px;
            color: #4e73df;
            text-transform: uppercase;
          }

          .user-info, .addr-box, .completed-by { align-items: flex-end; text-align: right; }
          .addr-text { white-space: normal; max-width: 100%; }
        }

        @media (max-width: 480px) {
          .ticket-filter-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}