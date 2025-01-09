import { get, ref } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import * as XLSX from 'xlsx';
import { db } from '../../FirebaseConfig';
import ExcelIcon from '../subscriberpage/drawables/xls.png'
import axios from 'axios';


const ExpiredDash = () => {

    const [filter, setFilter] = useState({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], isp: 'All', Colony: 'All', Status: 'All', Source: 'All' });
    const [arrayData, setArrayData] = useState([]);
    const [filterData, setFilteredData] = useState([]);
    const [uniqueColony, setUniqueColony] = useState([]);
    const [uniqueIsp, setUniqueIsp] = useState([]);
    const [uniqueCompany, setUniqueCompany] = useState([]);

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
    }


    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.post('https://api.justdude.in/expiredUser');
          
          if (response.status !== 200 || !response.data) {
            console.error("Invalid response or data");
            return;
          }
      
          const snapshot = response.data;
          const today = new Date();
          const expiredArray = [];
      
          // Iterate through each user in the snapshot
          Object.keys(snapshot).forEach((key) => {
            const user = snapshot[key]; // Access user data
            if (!user || !user.connectionDetails) return; // Skip invalid data
      
            const {
              username: userid,
              fullName: fullname,
              mobileNo: mobile,
              installationAddress: address,
              company,
              colonyName: colony,
              connectionDetails: {
                expiryDate: expDate,
                dueAmount: dueamount,
                planAmount: planamount,
                planName: planname,
                isp,
              },
            } = user;
      
            // Check if the user has an expired plan
            if (expDate && new Date(expDate) < today) {
              expiredArray.push({
                fullname,
                mobile,
                address,
                company,
                colony,
                expDate,
                dueamount,
                planamount,
                planname,
                isp,
                userid,
              });
            }
          });
      
          // Extract unique values for filtering
          const uniqueIsp = [...new Set(expiredArray.map((data) => data.isp))];
          const uniqueColony = [...new Set(expiredArray.map((data) => data.colony))];
          const uniqueCompany = [...new Set(expiredArray.map((data) => data.company))];
      
          // Update state outside the loop
          setUniqueIsp(uniqueIsp);
          setUniqueColony(uniqueColony);
          setUniqueCompany(uniqueCompany);
          setArrayData(expiredArray);
      
        } catch (error) {
          console.error("Error fetching expired users:", error);
        }
      };
      

        

        fetchData();
    }, []);

    useEffect(() => {
            let filteredArray = arrayData;
            
        
            if (filter.Status !== 'All') {
                filteredArray = filteredArray.filter((data) => data.company === filter.Status);
            }
        
            if(filter.Source !== 'All'){
                filteredArray = filteredArray.filter((data) => data.Source === filter.Source);
            }
        
            if(filter.isp !== 'All'){
              filteredArray = filteredArray.filter((data) => data.isp === filter.isp);
            }
        
            if(filter.Colony !== 'All'){
              filteredArray = filteredArray.filter((data) => data.colony === filter.Colony);
            }
        
            // Filter by Date Range
            if (filter.startDate && filter.endDate) {
              const startDate = new Date(filter.startDate).getTime();
              const endDate = new Date(filter.endDate).getTime();
              filteredArray = filteredArray.filter((data) => {
                  const creationDate = new Date(data.expDate).getTime();
                  return creationDate >= startDate && creationDate <= endDate;
              });
          }
        
            setFilteredData(filteredArray);
        }, [arrayData, filter]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
      };

  return (
    <div style={{marginTop:'4.5%', marginLeft:'10px', marginRight:'10px'}}>
        <div className='d-flex flex-row'>
            <h4 style={{flex:'1'}}>Your All Expired Data</h4>
            <img onClick={downloadExcel} src={ExcelIcon} className='img_download_icon'></img>
        </div>

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
        <label className='form-label'>Colony Name</label>
        <select 
            type="text" 
            className="form-control" 
            name="Colony"  
            value={filter.Colony} 
            onChange={handleFilterChange} 
            >
              <option value='All'>All</option>
              {
                uniqueColony.map((ispname, index) => (
                  <option key={index} value={ispname}>{ispname}</option>
                ))
              }

            </select>
        </div>
        <div className='col-md-4 mt-2'>
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
                uniqueIsp.map((Colony, index) => (
                  <option key={index} value={Colony}>{Colony}</option>
                ))
              }

            </select>
        </div>

        <div className='col-md-4 mt-2'>
          <label className='form-label'>Select Company</label>
          <select 
            type="text" 
            className="form-control" 
            name="Status" 
            value={filter.Status} 
            onChange={handleFilterChange} 
            >

              <option value="All">All</option>
              {
                uniqueCompany.map((company, index) => (
                    <option key={index} value={company}>{company}</option>
                ))
              }

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
          disabled
          >

          <option value="All">All Source</option>
          <option value="Manual">Manual</option>
          <option value="WhatsApp">Whatsapp Bot</option>
          <option value="Mobile App">Customer App</option>
          </select>
        </div>
      </div>

      <div>
        <table className='table table-bordered table-striped table-hover align-middle'>
          <thead className='table-success'>
            <tr>
              <th scope='col'>S No.</th>
              <th scope="col">User ID</th>
              <th scope="col">FullName</th>
              <th scope="col">Mobile</th>
              <th scope="col">Address</th>
              <th scope="col">Expire Date</th>
              <th scope="col">Due Amount</th>
              <th scope="col">ISP</th>
              <th scope='col'>Colony</th>
              <th scope="col">Company</th>
              {/* Add more headers as needed */}
            </tr>
          </thead>
          <tbody>
            {
              filterData.length > 0 ? (
                filterData.map((filterData, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{filterData.userid}</td>
                    <td style={{maxWidth:'150px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{filterData.fullname}</td>
                    <td>{filterData.mobile}</td>
                    <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{filterData.address}</td>
                    
                    <td>{new Date(filterData.expDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'})}</td>
                    
                    <td>{filterData.dueamount}</td>
                    <td>{filterData.isp}</td>
                    <td>{filterData.colony}</td>
                    <td>{filterData.company}</td>
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

export default ExpiredDash
