import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { FaFileExcel } from "react-icons/fa";
import { api2 } from "../FirebaseConfig";

export default function DashSecDiv() {
  const partnerId = localStorage.getItem("partnerId");
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
  }

  const [year, setYear] = useState(currentYear);
  const [userData, setUserData] = useState([]);
  const [installationData, setInstallationData] = useState([]);
  const [ticketNatureData, setTicketNatureData] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Loader state

  const fetchSecDiv = async () => {
    setIsLoading(true); // Start loading

    try {
      // Run all API calls concurrently using Promise.all
      const dashSecDiv = await axios.get(
        api2 +
          "/dashboard-data/second-div?partnerId=" +
          partnerId +
          "&year=" +
          year
      );
      // Check for response status once
      if (dashSecDiv.status !== 200) {
        throw new Error("Failed to fetch data");
      }

      const data = dashSecDiv.data;

      const revenueData = data.revenueCount;
      if (revenueData) {
        setUserData(revenueData);
      }

      const installationData = data.installationTrend;
      if (installationData) {
        setInstallationData(installationData);
      }

      const ticketeData = data.ticketNature;
      if (ticketeData) {
        setTicketNatureData(ticketeData);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const downloadMonthlyInstallations = async (month, year) => {
    try {
      const response = await axios.get(
        `${api2}/dashboard-data/second-div/monthly-installations?month=${month}&year=${year}`
      );

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
  }, [year]); // Add year as dependency

  // Add loader component
  const Loader = () => (
    <div className="text-center my-3">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="d-flex flex-column mt-4">
          <div className="mb-4">
            <div className="d-flex flex-row justify-content-between">
              <h4 className="fw-bold">Employee Collection</h4>
              <label className="form-label fw-bold">Select Year</label>
              <select
                className="form-select w-25 mb-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-container">
              <table className="dashboard-table">
                <thead className="table-success">
                  <tr>
                    <th className="text-start" scope="col">
                      S.No
                    </th>
                    <th className="text-start" scope="col">
                      Employee Name
                    </th>
                    <th className="text-start" scope="col">
                      Jan
                    </th>
                    <th className="text-start" scope="col">
                      Feb
                    </th>
                    <th className="text-start" scope="col">
                      Mar
                    </th>
                    <th className="text-start" scope="col">
                      Apr
                    </th>
                    <th className="text-start" scope="col">
                      May
                    </th>
                    <th className="text-start" scope="col">
                      Jun
                    </th>
                    <th className="text-start" scope="col">
                      Jul
                    </th>
                    <th className="text-start" scope="col">
                      Aug
                    </th>
                    <th className="text-start" scope="col">
                      Sep
                    </th>
                    <th className="text-start" scope="col">
                      Oct
                    </th>
                    <th className="text-start" scope="col">
                      Nov
                    </th>
                    <th className="text-start" scope="col">
                      Dec
                    </th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.map((user, index) => {
                    const { name, monthlyData, total } = user;

                    return (
                      <tr key={index}>
                        <td className="text-start">{index + 1}</td>
                        <td className="text-start">{name}</td>
                        <td className="text-start">
                          ₹ {monthlyData.jan.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.feb.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.mar.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.apr.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.may.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.jun.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.jul.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.aug.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.sep.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.oct.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.nov.toLocaleString()}
                        </td>
                        <td className="text-start">
                          ₹ {monthlyData.dec.toLocaleString()}
                        </td>
                        <td className="fw-bold">₹ {total.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="container mb-4">
            <div className="d-flex flex-row justify-content-between">
              <h4 className="fw-bold">Installation Trend</h4>
              <label className="form-label fw-bold">Select Year</label>
              <select
                className="form-select w-25 mb-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-container">
              <table className="dashboard-table">
                <thead className="table-primary">
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Month</th>
                    <th scope="col">Installation</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(installationData).map(
                    ([month, count], index) => (
                      <tr key={month}>
                        <td>{index + 1}</td>
                        <td>{month}</td>
                        <td>{count}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              downloadMonthlyInstallations(month, year)
                            }
                            disabled={count === 0}
                          >
                            <FaFileExcel /> Excel
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex flex-row justify-content-between">
              <h4 className="fw-bold">Ticket Nature</h4>
              <label className="form-label fw-bold">Select Year</label>
              <select
                className="form-select w-25 mb-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {years.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="table-container">
              <table className="dashboard-table">
                <thead className="table-danger">
                  <tr>
                    <th scope="col">S.No</th>
                    <th scope="col">Ticket Nature</th>
                    <th scope="col">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(ticketNatureData).map(
                    ([concern, count], index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{concern}</td>
                        <td>{count}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
