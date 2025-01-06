// src/components/TicketData/TicketdataDash.js
import React, { useState, useCallback, useEffect } from 'react';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import ExcelIcon from '../subscriberpage/drawables/xls.png'
import * as XLSX from 'xlsx';

export default function TicketdataDash() {
  const [filter, setFilter] = useState({ startDate: '', endDate: '', isp: 'All', Colony: 'All', Status: 'All', Source: 'All' });
  const [arrayData, setArrayData] = useState([]);
  const [filterData, setFilteredData] = useState([]);

  const [uniqueColony, setUniqueColony] = useState([]);
  const [uniqueIsp, setUniqueIsp] = useState([]);


  const fetchExpandData = useCallback(() => {
    const pendingTicketsRef = ref(db, `Global Tickets`);
    const subsRef = ref(db, `Subscriber`);
    const usersRef = ref(db, `users`);
  
    // Step 1: Fetch all users and store them in a lookup object
    get(usersRef).then((userSnap) => {
      const usersLookup = {};
      userSnap.forEach((childSnap) => {
        const userId = childSnap.key;
        const { fullname } = childSnap.val();
        usersLookup[userId] = fullname; // Create a dictionary with userid -> fullname
      });
  
      // Step 2: Fetch subscribers
      onValue(subsRef, (subsSnap) => {
        const subsArray = [];
        subsSnap.forEach((childSnap) => {
          const fullName = childSnap.val().fullName;
          const isp = childSnap.child("connectionDetails").val().isp;
          const colonyName = childSnap.val().colonyName;
          const mobileNo = childSnap.val().mobileNo;
          const userId = childSnap.key;
          const address = childSnap.val().installationAddress;
  
          subsArray.push({ fullName, isp, colonyName, mobileNo, userId, address });
        });
  
        const isps = [...new Set(subsArray.map((data) => data.isp))];
        const colonys = [...new Set(subsArray.map((data) => data.colonyName))];
        setUniqueIsp(isps);
        setUniqueColony(colonys);
  
        // Step 4: Fetch tickets only after subscribers are ready
        onValue(pendingTicketsRef, (dataSnap) => {
          try {
            const dataArray = [];
            dataSnap.forEach((childSnap) => {
              const {
                userid,
                source,
                generatedDate,
                closeby,
                ticketconcern,
                status,
              } = childSnap.val();
  
              const assignedPersonName = usersLookup[closeby] || closeby; // Lookup user name or fallback to userid
              const matchedUser = subsArray.find((data) => data.userId === userid);
  
              if (matchedUser) {
                dataArray.push({
                  Ticketno: childSnap.key,
                  subsID: userid,
                  source,
                  creationdate: generatedDate,
                  completed: assignedPersonName, // Use user's name from lookup
                  Concern: ticketconcern,
                  Status: status,
                  Colony: matchedUser.colonyName,
                  fullName: matchedUser.fullName,
                  isp: matchedUser.isp,
                  mobileNo: matchedUser.mobileNo,
                  address: matchedUser.address,
                });
              }
            });
  
            setArrayData(dataArray);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        });
      });
    }).catch((error) => {
      console.error("Error fetching users:", error);
    });
  }, []);
  


    useEffect(() => {
      
          fetchExpandData();
      
  }, [fetchExpandData]);


  useEffect(() => {
    let filteredArray = arrayData;
    

    if (filter.Status !== 'All') {
        filteredArray = filteredArray.filter((data) => data.Status === filter.Status);
    }

    if(filter.Source !== 'All'){
        filteredArray = filteredArray.filter((data) => data.source === filter.Source);
    }

    if(filter.isp !== 'All'){
      filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
    }

    if(filter.Colony !== 'All'){
      filteredArray = filteredArray.filter((data) => data.Colony === filter.Colony);
    }

    // Filter by Date Range
    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate).getTime();
      const endDate = new Date(filter.endDate).getTime();
      filteredArray = filteredArray.filter((data) => {
          const creationDate = new Date(data.creationdate).getTime();
          return creationDate >= startDate && creationDate <= endDate;
      });
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
        <img onClick={downloadExcel} src={ExcelIcon} className='img_download_icon'></img>
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
                    <td>{filterData.completed}</td>
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