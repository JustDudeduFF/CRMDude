import React, { useState, useEffect } from "react";
import { API } from "../FirebaseConfig";
import * as XLSX from "xlsx";
import { FaFileExcel, FaCalendarAlt, FaUserTie, FaTools, FaChartLine } from "react-icons/fa";

export default function DashSecDiv() {
  const partnerId = localStorage.getItem("partnerId");
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [year, setYear] = useState(currentYear);
  const [userData, setUserData] = useState([]);
  const [installationData, setInstallationData] = useState([]);
  const [ticketNatureData, setTicketNatureData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSecDiv = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/dashboard-data/second-div?partnerId=${partnerId}&year=${year}`);
      const { revenueCount, installationTrend, ticketNature } = response.data;
      if (revenueCount) setUserData(revenueCount);
      if (installationTrend) setInstallationData(installationTrend);
      if (ticketNature) setTicketNatureData(ticketNature);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMonthlyInstallations = async (month, year) => {
    try {
      const response = await API.get(`/dashboard-data/second-div/monthly-installations?month=${month}&year=${year}`);
      if (!response.data) return;
      const worksheet = XLSX.utils.json_to_sheet(response.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${month}-${year}`);
      XLSX.writeFile(workbook, `${month}-${year}-installations.xlsx`);
    } catch (error) {
      console.error("Error downloading installations:", error);
    }
  };

  useEffect(() => {
    fetchSecDiv();
  }, [year]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    // Uses font-family: inherit to match your Navbar
    <div className="container-fluid py-4" style={{ fontFamily: 'inherit', backgroundColor: '#fdfdfd' }}>
      
      {/* Header Section - Matched to Navbar spacing */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center px-3">
          <h4 className="fw-bold m-0" style={{ color: '#334155' }}>Operational Overview</h4>
          <div className="d-flex align-items-center gap-2">
            <label className="small fw-bold text-muted mb-0">Filter Year:</label>
            <select
              className="form-select form-select-sm shadow-sm border-light"
              style={{ width: '110px', borderRadius: '6px' }}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Table Card */}
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold mb-0"><FaUserTie className="me-2 text-primary" />Employee Collection</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 custom-dash-table">
                  <thead>
                    <tr className="bg-light">
                      <th className="ps-4 py-3 text-uppercase small text-muted">S.No</th>
                      <th className="py-3 text-uppercase small text-muted">Employee</th>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                        <th key={m} className="py-3 text-uppercase small text-muted">{m}</th>
                      ))}
                      <th className="pe-4 py-3 text-uppercase small text-muted text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.map((user, index) => (
                      <tr key={index}>
                        <td className="ps-4 text-muted">{index + 1}</td>
                        <td className="fw-semibold">{user.name}</td>
                        {Object.values(user.monthlyData).map((val, i) => (
                          <td key={i} className="text-secondary">₹{val.toLocaleString()}</td>
                        ))}
                        <td className="pe-4 text-end fw-bold text-dark">₹{user.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Installation Trend */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold mb-0"><FaChartLine className="me-2 text-success" />Installation Trend</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 custom-dash-table">
                  <thead>
                    <tr>
                      <th className="ps-4 py-3 text-muted small uppercase">Month</th>
                      <th className="py-3 text-muted small uppercase">Status</th>
                      <th className="pe-4 py-3 text-end text-muted small uppercase">Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(installationData).map(([month, count]) => (
                      <tr key={month}>
                        <td className="ps-4 fw-medium">{month}</td>
                        <td>
                          <span className={`badge ${count > 0 ? 'bg-success' : 'bg-light text-muted'} rounded-pill px-3`}>
                            {count} Units
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button
                            className="btn btn-sm btn-link text-decoration-none fw-bold p-0"
                            onClick={() => downloadMonthlyInstallations(month, year)}
                            disabled={count === 0}
                          >
                            <FaFileExcel className="me-1" /> EXCEL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Nature */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom-0 pt-4 px-4">
              <h5 className="fw-bold mb-0"><FaTools className="me-2 text-danger" />Ticket Nature</h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="mt-2">
                {Object.entries(ticketNatureData).map(([concern, count], index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center py-3 border-bottom border-light">
                    <span className="text-muted fw-medium small">{concern}</span>
                    <span className="fw-bold text-dark">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-dash-table thead th {
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 600;
        }
        .custom-dash-table tbody td {
          padding-top: 1rem;
          padding-bottom: 1rem;
          font-size: 0.9rem;
          border-bottom: 1px solid #f8fafc;
        }
        .custom-dash-table tr:hover {
          background-color: #f8fafc;
        }
        .btn-link:hover {
          color: #157347 !important;
        }
      `}</style>
    </div>
  );
}