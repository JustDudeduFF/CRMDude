import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import axios from "axios";
import { api, api2 } from "../../FirebaseConfig";
import "../Reports_Others.css";

const ExpiredDash = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [filter, setFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    isp: "All",
    Colony: "All",
    Status: "All",
    Source: "All",
  });
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);
  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueIsp, setUniqueIsp] = useState([]);
  const [uniqueCompany, setUniqueCompany] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const downloadExcel = () => {
    const dataToDownload = filterData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expired data");
    XLSX.writeFile(workbook, `Expired Data-${Date.now()}.xlsx`);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        api2 +
          `/reports/expired?partnerId=${[partnerId]}&startDate=${
            new Date(filter.startDate).toISOString().split("T")[0]
          }&endDate=${new Date(filter.endDate).toISOString().split("T")[0]}`
      );

      if (response.status !== 200 || !response.data) {
        console.error("Invalid response or data");
        return;
      }

      const snapshot = response.data;
      const expiredArray = snapshot.data;

      // Extract unique values for filtering
      const uniqueIsp = [...new Set(expiredArray.map((data) => data.isp))];
      const uniqueColony = [
        ...new Set(expiredArray.map((data) => data.colony)),
      ];
      const uniqueCompany = [
        ...new Set(expiredArray.map((data) => data.company)),
      ];

      // Update state outside the loop
      setUniqueIsp(uniqueIsp);
      setUniqueColony(uniqueColony);
      setUniqueCompany(uniqueCompany);
      setArrayData(expiredArray);
    } catch (error) {
      console.error("Error fetching expired users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter.startDate, filter.endDate]);

  useEffect(() => {
    let filteredArray = arrayData;

    if (filter.Status !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.company === filter.Status
      );
    }

    if (filter.Source !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.Source === filter.Source
      );
    }

    if (filter.isp !== "All") {
      filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    }

    if (filter.Colony !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.colony === filter.Colony
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
        <h5 className="report-title">Your All Expired Data</h5>
        <img
          onClick={downloadExcel}
          src={ExcelIcon}
          className="report-excel-icon"
          alt="Download Excel"
        />
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
          <label className="report-filter-label">Colony Name</label>
          <select
            className="report-filter-select"
            name="Colony"
            value={filter.Colony}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniqueColony.map((ispname, index) => (
              <option key={index} value={ispname}>
                {ispname}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select ISP</label>
          <select
            className="report-filter-select"
            name="isp"
            value={filter.isp}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniqueIsp.map((Colony, index) => (
              <option key={index} value={Colony}>
                {Colony}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select Company</label>
          <select
            className="report-filter-select"
            name="Status"
            value={filter.Status}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniqueCompany.map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
        <div className="report-filter-group">
          <label className="report-filter-label">Select Source</label>
          <select
            className="report-filter-select"
            name="Source"
            placeholder="Colony"
            value={filter.Source}
            onChange={handleFilterChange}
            disabled
          >
            <option value="All">All Source</option>
            <option value="Manual">Manual</option>
            <option value="WhatsApp">Whatsapp Bot</option>
            <option value="Mobile App">Customer App</option>
          </select>
        </div>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S No.</th>
              <th scope="col">User ID</th>
              <th scope="col">FullName</th>
              <th scope="col">Mobile</th>
              <th scope="col">Address</th>
              <th scope="col">Expire Date</th>
              <th scope="col">Due Amount</th>
              <th scope="col">ISP</th>
              <th scope="col">Colony</th>
              <th scope="col">Company</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10">
                  <div className="report-loading-overlay">
                    <div className="report-loading-container">
                      <div
                        className="spinner-border report-loading-spinner"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="report-loading-text">
                        Loading Expired Data...
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filterData.length > 0 ? (
              filterData.map((filterData, index) => (
                <tr
                  className={
                    filterData.status === "Terminated" ? "table-danger" : ""
                  }
                  key={index}
                >
                  <td>{index + 1}</td>
                  <td>{filterData.userid}</td>
                  <td
                    style={{
                      maxWidth: "150px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {filterData.fullname}
                  </td>
                  <td>{filterData.mobile}</td>
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
                  <td>
                    {new Date(filterData.expDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td>{filterData.dueamount}</td>
                  <td>{filterData.isp}</td>
                  <td>{filterData.colony}</td>
                  <td>{filterData.company}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="report-no-data">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiredDash;
