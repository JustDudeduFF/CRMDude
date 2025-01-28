// src/components/TicketData/TicketdataDash.js
import React, { useState, useCallback, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { api, db } from '../../FirebaseConfig';
import ExcelIcon from '../subscriberpage/drawables/xls.png'
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function TicketdataDash() {
  const [filter, setFilter] = useState({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], isp: 'All', Colony: 'All', Status: 'All', Source: 'All' });
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);

  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueIsp, setUniqueIsp] = useState([]);

  // const convertTo24HourFormat = (time) => {
  //   const [timePart, modifier] = time.split(" "); // Split time and AM/PM 
  //   let [hours, minutes, seconds] = timePart.split(":").map(Number);
  
  //   if (modifier === "AM" && hours === 12) {
  //     hours = 0; // 12 AM is 00:xx:xx in 24-hour format
  //   } else if (modifier === "PM" && hours !== 12) {
  //     hours += 12; // Convert PM hours (e.g., 1 PM becomes 13:xx:xx)
  //   }
  
  //   // Return the time in HH:MM:SS (24-hour format)
  //   return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  // };

  // const calculateTimeDifference = (assigndate, assigntime, closedate, closetime) => {
  //   // If `closedate` or `closetime` is null, use the current date and time
  //   const now = new Date();
  //   if (!closedate) closedate = now.toISOString().split("T")[0]; // Current date in YYYY-MM-DD format
  //   if (!closetime) closetime = now.toLocaleTimeString("en-US"); // Current time in 12-hour format
  
  //   // Convert times to 24-hour format
  //   const start24 = convertTo24HourFormat(assigntime);
  //   const end24 = convertTo24HourFormat(closetime);
  
  //   // Create Date objects for assigned and closed times
  //   const start = new Date(`${assigndate}T${start24}`);
  //   const end = new Date(`${closedate}T${end24}`);
  
  //   // Calculate the difference in milliseconds
  //   const differenceInMs = end - start;
  
  //   // Convert milliseconds to minutes
  //   const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
  
  //   // Convert minutes to hours and minutes
  //   const hours = Math.floor(differenceInMinutes / 60);
  //   const minutes = differenceInMinutes % 60;
  //   return { hours, minutes };
  // };


  const fetchExpandData = async() => {
    try{
      const subsResponse = await axios.get(api+`/tickets?date=${new Date(filter.startDate).getTime()} ${new Date(filter.endDate).getTime()}&statusq=${filter.Status}`);


      if(subsResponse.status !== 200) return;
      const subsSnap = subsResponse.data;
      const dataArray = [];
      Object.keys(subsSnap).forEach((keys) => {
        const childSnap = subsSnap[keys];
        dataArray.push(childSnap);
      });


      const isps = [...new Set(dataArray.map((data) => data.isp))];
      const colonys = [...new Set(dataArray.map((data) => data.Colony))];
      setUniqueIsp(isps);
      setUniqueColony(colonys);
      setArrayData(dataArray);

      
      
    }catch(e){
      console.log(e);
    }
  }
  
  


    useEffect(() => {

    fetchExpandData();
      
  }, [filter.startDate, filter.endDate, filter.Status]);


  useEffect(() => {
    let filteredArray = arrayData;
    

    if(filter.Source !== 'All'){
        filteredArray = filteredArray.filter((data) => data.source === filter.Source);
    }

    if(filter.isp !== 'All'){
      filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    }

    if(filter.Colony !== 'All'){
      filteredArray = filteredArray.filter((data) => data.Colony === filter.Colony);
    }

    setFilteredData(filteredArray);
}, [arrayData, filter]);


// Function to download the selected rows in Excel format
const downloadExcel = () => {
  const dataToDownload = filterData;
  if (dataToDownload.length === 0) {
    alert('No data to download');
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets data');
  XLSX.writeFile(workbook, `Tickets Data.xlsx`);
};

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  

  return (
    <div style={{marginTop:'4.5%', marginLeft:'10px', marginRight:'10px'}}>
      <div className='d-flex flex-row'>
        <h4 style={{flex:'1'}}>Your All Tickets Data</h4>
        <img alt='Excel' onClick={downloadExcel} src={ExcelIcon} className='img_download_icon'></img>
      </div>
      
      
      {/* Filter Section */}
      <div className='container d-flex flex-wrap justify-content-center align-items-center mb-3'>
        <div className='col-md-4 '>
          <label className='form-label'>Select Start Date</label>
          <input 
            type="date" 
            className="form-control" 
            name="startDate" 
            placeholder="Start Date" 
            value={filter.startDate} 
            onChange={handleFilterChange} 
          />
        </div>
        <div className='col-md-4'>
        <label className='form-label'>Select End Date</label>
          <input 
            type="date" 
            className="form-control" 
            name="endDate" 
            placeholder="End Date" 
            value={filter.endDate} 
            onChange={handleFilterChange} 
          />
        </div>
        <div className='col-md-4'>
        <label className='form-label'>Select ISP</label>
        <select 
            type="text" 
            className="form-control" 
            name="isp"  
            value={filter.isp} 
            onChange={handleFilterChange} 
            >
              <option value='All'>All</option>
              {
                uniqueIsp.map((ispname, index) => (
                  <option key={index} value={ispname}>{ispname}</option>
                ))
              }

            </select>
        </div>
        <div className='col-md-4 mt-2'>
        <label className='form-label'>Select Colony</label>
        <select 
            type="text" 
            className="form-control" 
            name="Colony" 
            value={filter.Colony} 
            onChange={handleFilterChange} 
            >

              <option value='All'>All</option>
              {
                uniqueColony.map((Colony, index) => (
                  <option key={index} value={Colony}>{Colony}</option>
                ))
              }

            </select>
        </div>

        <div className='col-md-4 mt-2'>
          <label className='form-label'>Select Status</label>
          <select 
            type="text" 
            className="form-control" 
            name="Status" 
            placeholder="Colony" 
            value={filter.Status} 
            onChange={handleFilterChange} 
            >

              <option value="All">All Tickets</option>
              <option value="Pending">Open Tickets</option>
              <option value="Completed">Closed Tickets</option>
              <option value="Open">Pending Tickets</option>
              <option value="Unassigned">Unassigned Tickets</option>

            </select>
        </div>

        <div className='col-md-4 mt-2'>
        <label className='form-label'>Select Source</label>
          <select 
          type="text" 
          className="form-control" 
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

      {/* Tickets Table */}
      <div className='table-responsive'>
        <table className='table table-bordered table-striped table-hover align-middle text-center'>
          <thead className='table-success'>
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
              <th scope='col'>Status</th>
              {/* Add more headers as needed */}
            </tr>
          </thead>
          <tbody>
            {
              filterData.length > 0 ? (
                filterData.map((filterData, index) => (
                  <tr key={index}>
                    <td>{filterData.Ticketno}</td>
                    <td>{filterData.creationdate}</td>
                    <td>{filterData.fullName}</td>
                    <td>{filterData.subsID}</td>
                    <td>{filterData.Concern}</td>
                    <td>{filterData.mobileNo}</td>
                    <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{filterData.address}</td>
                    <td>{filterData.isp}</td>
                    <td>{filterData.Colony}</td>
                    <td>{filterData.completedby}</td>
                    <td>{filterData.Status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>
                    No Data Available
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}