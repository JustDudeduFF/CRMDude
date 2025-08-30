import React, { useEffect, useState } from 'react'
import * as XLSX from 'xlsx';
import ExcelIcon from '../subscriberpage/drawables/xls.png'
import axios from 'axios';
import { api, api2 } from '../../FirebaseConfig';
import '../Reports_Others.css';

const RevenueDash = () => {
    const partnerId = localStorage.getItem('partnerId')
    const [filter, setFilter] = useState({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], isp: 'All', Colony: 'All', Status: 'All', Company: 'All' });
    const [arrayData, setArrayData] = useState([]);
    const [filterData, setFilteredData] = useState([]);
    
    const [uniqueColony, setUniqueColony] = useState([]);
    const [uniqueMode, setUniqueMode] = useState([]);
    const [uniqueCompany, setUniqueCompany] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const downloadExcel = () => {
        const dataToDownload = filterData;
          if (dataToDownload.length === 0) {
            alert('No data to download');
            return;
          }
        
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue data');
          XLSX.writeFile(workbook, `Revenue Data.xlsx`);
    }

    const fetchRevenue = async () => {
      setIsLoading(true);
      try {
        // Fetch data from the API
        const response = await axios.get(api2+`/reports/revenue?partnerId=${partnerId}&startDate=${new Date(filter.startDate).toISOString().split('T')[0]}&endDate=${new Date(filter.endDate).toISOString().split('T')[0]}`);
    
        if (response.status !== 200 || !response.data) {
          return;
        }
        const arrayData = response.data.data;
        const array = [];
        Object.keys(arrayData).forEach((key) => {
          const userData = arrayData[key];
          array.push(userData);
        });
        const paymentModes = [...new Set(array.map((data) => data.PaymentMode))];
        const colonies = [...new Set(array.map((data) => data.colonyName))];
        const company = [...new Set(array.map((data) => data.company))];
        
        // Update state
        setUniqueMode(paymentModes);
        setUniqueColony(colonies);   
        setUniqueCompany(company);   
        setArrayData(array);
    
    
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }finally{
        setIsLoading(false);
      }
    };

    useEffect(() => {
        fetchRevenue();
    }, [filter.startDate, filter.endDate]);

    useEffect(() => {
        let filteredArray = arrayData;
        
    
        if (filter.Status !== 'All') {
            filteredArray = filteredArray.filter((data) => data.authorized === filter.Status);
        }
    
        if(filter.Company !== 'All'){
            filteredArray = filteredArray.filter((data) => data.company === filter.Company);
        }
    
        if(filter.isp !== 'All'){
          filteredArray = filteredArray.filter((data) => data.PaymentMode === filter.isp);
        }
    
        if(filter.Colony !== 'All'){
          filteredArray = filteredArray.filter((data) => data.colonyName === filter.Colony);
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
            <h5 className="report-title">Your All Revenue Data</h5>
            <img alt='Excel' onClick={downloadExcel} src={ExcelIcon} className="report-excel-icon" />
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
                <label className="report-filter-label">Payment Mode</label>
                <select 
                    className="report-filter-select" 
                    name="isp"  
                    value={filter.isp} 
                    onChange={handleFilterChange} 
                >
                    <option value='All'>All</option>
                    {uniqueMode.map((ispname, index) => (
                        <option key={index} value={ispname}>{ispname}</option>
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
                    <option value='All'>All</option>
                    {uniqueColony.map((Colony, index) => (
                        <option key={index} value={Colony}>{Colony}</option>
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
                    <option value={true}>Authorized</option>
                    <option value={false}>UnAuthorized</option>
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
                            <option key={index} value={company}>{company}</option>
                        ))
                    ) : (
                        <option value=''>No Data Found</option>
                    )}
                </select>
            </div>
        </div>

        <div className="report-table-container">
            <table className="report-table">
                <thead>
                    <tr>
                        <th scope='col'>S No</th>
                        <th scope="col">User ID</th>
                        <th scope="col">Date</th>
                        <th scope="col">Customer Name</th>
                        <th scope="col">Mobile</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Discount</th>
                        <th scope="col">Installation Address</th>
                        <th scope='col'>Payment Mode</th>
                        <th scope="col">Colony</th>
                        <th scope="col">Collected By</th>
                        <th scope='col'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="12">
                                <div className="report-loading-overlay">
                                    <div className="report-loading-container">
                                        <div className="spinner-border report-loading-spinner" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="report-loading-text">Loading Revenue Data...</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : filterData.length > 0 ? (
                        filterData.map((filterData, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{filterData.UserID}</td>
                                <td>{new Date(filterData.Receipt_Date).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'})}</td>
                                <td>{filterData.fullName}</td>
                                <td>{filterData.mobileNo}</td>
                                <td>{filterData.Amount}</td>
                                <td>{filterData.discount}</td>
                                <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{filterData.address}</td>
                                <td>{filterData.PaymentMode}</td>
                                <td>{filterData.colonyName}</td>
                                <td>{filterData.Collected_By}</td>
                                <td>{filterData.authorized ? "Authorized" : "UnAuthorized"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" className="report-no-data">
                                No Data Available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default RevenueDash
