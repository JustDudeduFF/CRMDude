import React, { useEffect, useState } from "react";
import "./EmpCSS.css";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import NewEmployee from "./NewEmployee";
import EmpDash from "./EmpDash";
import { api2 } from "../../FirebaseConfig";
import EmpDetails from "./EmpDetails";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

export default function EmloyeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [filterEmployees, setFilterEmployees] = useState([]);
  const [search, setSearch] = useState("All");
  const partnerId = localStorage.getItem("partnerId");

  const navigate = useNavigate();

  const fetchEmp = async () => {
    try {
      const response = await axios.get(
        api2 + "/subscriber/users?partnerId=" + partnerId
      );

      if (response.status !== 200)
        return toast.error("Failed to Load Employees", { autoClose: 2000 });

      setEmployees(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchEmp();
  }, []);

  const showEmpDetail = (mobile) => {
    navigate("/dashboard/employees/empdetail", { state: { mobile } });
  };

  useEffect(() => {
    let filter = employees;

    if (search !== "All") {
      const searchLower = search.toLowerCase();

      filter = filter.filter(
        (emp) =>
          emp.empname.toLowerCase().includes(searchLower) ||
          emp.empmobile.toLowerCase().includes(searchLower)
      );
    }

    setFilterEmployees(filter);
  }, [search, employees]); // also add employees as dependency if it can change

  const handleClickNew = () => {
    // Navigation to main employee list
  };

  const handleClick = () => {
    // Navigation to add new employee
  };

  return (
    <div className="employee-dashboard-container">
      <ToastContainer />
      <div className="employee-header">
        <div>
          <Link to="/dashboard/employees">
            <h3 className="employee-title" onClick={handleClickNew}>
              Manage Employees
            </h3>
          </Link>
        </div>
        <div>
          <Link to="/dashboard/employees/newemployee">
            <button onClick={handleClick} className="add-employee-btn">
              Add New Employee
            </button>
          </Link>
        </div>
      </div>

      <div className="employee-layout">
        <div className="employee-sidebar employee-sidebar-fixed">
          <div className="employee-search-container">
            <label className="employee-search-label">Search</label>
            <input
              className="employee-search-input"
              placeholder="e.g. name, mobile"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className="employee-list">
            {filterEmployees.map((emp, index) => (
              <li
                onClick={() => showEmpDetail(emp._id)}
                className="employee-list-item"
                key={index}
              >
                <div className="employee-name">{emp.empname}</div>
                <div className="employee-mobile">{emp.empmobile}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="employee-main-content employee-main-content-fixed">
          <Routes>
            <Route path="/" element={<EmpDash />} />
            <Route path="empdetail/*" element={<EmpDetails />} />
            <Route path="newemployee/*" element={<NewEmployee />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
