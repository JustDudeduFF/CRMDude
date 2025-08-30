// src/components/TicketData/TicketdataDash.js
import React, { useState, useEffect } from "react";
import { api2 } from "../../FirebaseConfig";
import ExcelIcon from "../subscriberpage/drawables/xls.png";
import * as XLSX from "xlsx";
import axios from "axios";
import "../Reports_Others.css";

export default function TicketdataDash() {
  const partnerId = localStorage.getItem("partnerId");
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
        const subsResponse = await axios.get(
          api2 +
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
      filteredArray = filteredArray.filter(
        (data) => data.source === filter.Source
      );
    }

    if (filter.isp !== "All") {
      filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    }

    if (filter.Colony !== "All") {
      filteredArray = filteredArray.filter(
        (data) => data.Colony === filter.Colony
      );
    }

    setFilteredData(filteredArray);
  }, [arrayData, filter]);

  // Function to download the selected rows in Excel format
  const downloadExcel = () => {
    const dataToDownload = filterData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets data");
    XLSX.writeFile(workbook, `Tickets Data.xlsx`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title">Your All Tickets Data</h5>
        <img
          alt="Excel"
          onClick={downloadExcel}
          src={ExcelIcon}
          className="report-excel-icon"
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
          <label className="report-filter-label">Select ISP</label>
          <select
            className="report-filter-select"
            name="isp"
            value={filter.isp}
            onChange={handleFilterChange}
          >
            <option value="All">All</option>
            {uniqueIsp.map((ispname, index) => (
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
            placeholder="Colony"
            value={filter.Status}
            onChange={handleFilterChange}
          >
            <option value="All">All Tickets</option>
            <option value="Completed">Closed Tickets</option>
            <option value="Pending">Pending Tickets</option>
            <option value="Unassigned">Unassigned Tickets</option>
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
              <th scope="col">Ticket ID</th>
              <th scope="col">Date</th>
              <th scope="col">Customer Name</th>
              <th scope="col">UserId</th>
              <th scope="col">Ticket Concern</th>
              <th scope="col">Mobile</th>
              <th scope="col">Installation Address</th>
              <th scope="col">ISP</th>
              <th scope="col">Colony</th>
              <th scope="col">Completed by</th>
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
                      <p className="report-loading-text">Loading Tickets...</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filterData.length > 0 ? (
              filterData.map((filterData, index) => (
                <tr key={index}>
                  <td>{filterData.Ticketno}</td>
                  <td>{filterData.creationdate}</td>
                  <td>{filterData.fullName}</td>
                  <td>{filterData.subsID}</td>
                  <td>{filterData.Concern}</td>
                  <td>{filterData.mobileNo}</td>
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
                  <td>{filterData.isp}</td>
                  <td>{filterData.Colony}</td>
                  <td>{filterData.completedby}</td>
                  <td>{filterData.Status}</td>
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
