import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import axios from "axios";
import { api, api2 } from "../../FirebaseConfig";
import "../Reports_Others.css";

export default function DueDash() {
  const partnerId = localStorage.getItem("partnerId");
  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isp: "All",
    Colony: "All",
    Status: "All",
    Company: "All",
  });
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);

  const [uniqueColony, setUniqueColony] = useState([]);
  const [unique, setUniqueUser] = useState([]);
  const [uniqueCompany, setUniqueCompany] = useState([]);
  const [uniquestatus, setUniqueStatus] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  function formatRevenue(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    XLSX.writeFile(workbook, `Due Amount Data-${Date.now()}.xlsx`);
  };

  const fetchRevenue = async () => {
    setIsLoading(true);
    try {
      // Fetch data from the API
      const response = await axios.get(
        api2 +
        `/reports/dueAmount?partnerId=${partnerId}&startDate=${new Date(filter.startDate).toISOString().split("T")[0]
        }&endDate=${new Date(filter.endDate).toISOString().split("T")[0]}`
      );

      if (response.status !== 200 || !response.data) {
        return;
      }
      const arrayData = response.data;

      if (arrayData) {
        setArrayData(arrayData.dueArray);
        setTotalDue(arrayData.total.totalAmount);

        const complete = [
          ...new Set(arrayData.dueArray.map((data) => data.lastrenew)),
        ];
        const colonies = [
          ...new Set(arrayData.dueArray.map((data) => data.colony)),
        ];
        const company = [
          ...new Set(arrayData.dueArray.map((data) => data.company)),
        ];
        const status = [
          ...new Set(arrayData.dueArray.map((data) => data.status)),
        ];

        // Update state
        setUniqueUser(complete);
        setUniqueColony(colonies);
        setUniqueCompany(company);
        setUniqueStatus(status);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [filter.startDate, filter.endDate]);

  useEffect(() => {
    let filteredArray = arrayData;

    if (filter.Company !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.company === filter.Company
      );
    }

    if (filter.isp !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.lastrenew === filter.isp
      );
    }

    if (filter.Colony !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.colony === filter.Colony
      );
    }

    if (filter.Status !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.status === filter.Status
      );
    }

    setFilteredData(filteredArray);
  }, [arrayData, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title">Your All Due Amount Data</h5>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="report-total-danger">
            Total Due Amount of Sheet: ₹{formatRevenue(totalDue)}
          </span>
          <img
            alt="Excel"
            onClick={downloadExcel}
            src={ExcelIcon}
            className="report-excel-icon"
          />
        </div>
      </div>

      <div className="report-filters">
        <div className="report-filter-group">
          <label className="report-filter-label">Select Start Date</label>
          <input
            type="date"
            className="report-filter-input"
            name="startDate"
            placeholder="Start Date"
            value={filter.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select End Date</label>
          <input
            type="date"
            className="report-filter-input"
            name="endDate"
            placeholder="End Date"
            value={filter.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Renewed By</label>
          <select
            className="report-filter-select"
            name="isp"
            value={filter.isp}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {unique.map((ispname, index) => (
              <option key={index} value={ispname}>
                {ispname}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select Colony</label>
          <select
            className="report-filter-select"
            name="Colony"
            value={filter.Colony}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniqueColony.map((Colony, index) => (
              <option key={index} value={Colony}>
                {Colony}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select Status</label>
          <select
            className="report-filter-select"
            name="Status"
            value={filter.Status}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniquestatus.map((data, index) => (
              <option key={index} value={data}>
                {data}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select Company</label>
          <select
            className="report-filter-select"
            name="Company"
            placeholder="Colony"
            value={filter.Company}
            onChange={handleFilterChange}
          >
            <option value="All">All Company</option>
            {uniqueCompany.length > 0 ? (
              uniqueCompany.map((company, index) => (
                <option key={index} value={company}>
                  {company}
                </option>
              ))
            ) : (
              <option value="">No Data Found</option>
            )}
          </select>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S No</th>
              <th scope="col">User ID</th>
              <th scope="col">Activate Date</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Mobile</th>
              <th scope="col">Due Amount</th>
              <th scope="col">Installation Address</th>
              <th scope="col">Renew By</th>
              <th scope="col">Colony</th>
              <th scope="col">Company</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11">
                  <div className="report-loading-overlay">
                    <div className="report-loading-container">
                      <div
                        className="spinner-border report-loading-spinner"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="report-loading-text">
                        Loading Due Amount...
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filterData.length > 0 ? (
              filterData.map((filterData, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{filterData.userid}</td>
                  <td>
                    {new Date(filterData.activateDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "2-digit" }
                    )}
                  </td>
                  <td>{filterData.name}</td>
                  <td>{filterData.mobile}</td>
                  <td>{filterData.dueAmount}</td>
                  <td
                    style={{
                      maxWidth: "250px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {filterData.address}
                  </td>
                  <td>{filterData.lastrenew}</td>
                  <td>{filterData.colony}</td>
                  <td>{filterData.company}</td>
                  <td>{filterData.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="report-no-data">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
