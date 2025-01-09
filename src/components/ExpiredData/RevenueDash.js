import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { db } from '../../FirebaseConfig';
import * as XLSX from 'xlsx';
import ExcelIcon from '../subscriberpage/drawables/xls.png'
import axios from 'axios';
import { use } from 'react';


const RevenueDash = () => {
    const [filter, setFilter] = useState({ startDate: '', endDate: '', isp: 'All', Colony: 'All', Status: 'All', Source: 'All' });
    const [arrayData, setArrayData] = useState([]);
    const [filterData, setFilteredData] = useState([]);
    
    const [uniqueColony, setUniqueColony] = useState([]);
    const [uniqueMode, setUniqueMode] = useState([]);

    const [userLookup, setUserLookup] = useState({});

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

    useEffect(() => {

        const fetchUser = async() => {
            const userRef = ref(db, `users`);
            const userSnap = await get(userRef);

            if(userSnap.exists()){
                const lookup = {};
                userSnap.forEach((child) => {
                    const name = child.val().FULLNAME;
                    const mobile = child.val().MOBILE;

                    lookup[mobile] = name;
                });

                setUserLookup(lookup);
            }
        }
        // const fetchRevenue = async() => {
        //     const subsRef = ref(db, `Subscriber`);
        //     const snapshot = await get(subsRef);
        //     if(snapshot.exists()){
        //         const receiptArray = [];
        //         snapshot.forEach((subscriberChild) => {
        //         const userId = subscriberChild.val().username;
        //         const colonyName = subscriberChild.val().colonyName;
        //         const fullName = subscriberChild.val().fullName;
        //         const address = subscriberChild.val().installationAddress;
        //         const mobileNo = subscriberChild.val().mobileNo;
        //         const userPayments = subscriberChild.child('payments');
        //         userPayments.forEach((paymentChild) => {
        //             const paymentData = paymentChild.val();
        //             const receiptno = paymentChild.key;
        //             const { amount, collectedBy, discount, paymentMode, receiptDate, transactionNo, authorized } = paymentData;
        //             receiptArray.push({
        //                 mobileNo: mobileNo,
        //                 address: address,
        //                 fullName: fullName,
        //                 colonyName: colonyName,
        //                 ReceiptNo: receiptno,
        //                 UserID: userId,
        //                 Amount: amount,
        //                 discount: discount,
        //                 TransactionID: transactionNo,
        //                 Collected_By: collectedBy,
        //                 PaymentMode: paymentMode,
        //                 Receipt_Date: receiptDate,
        //                 authorized // Ensure you have 'authorized' in your payment data
        //             });
        //         });
        //         const paymentmode = [...new Set(receiptArray.map((data) => data.PaymentMode))];
        //         const colonys = [...new Set(receiptArray.map((data) => data.colonyName))];
        //         setUniqueMode(paymentmode);
        //         setUniqueColony(colonys);
        //         });
        //         setArrayData(receiptArray);
        //     }
        // }

        const fetchRevenue = async () => {
          try {
            // Fetch data from the API
            const response = await axios.post('http://api.sigmanetworks.in:5000/subscriber');
            console.log('Response status:', response.status);
        
            if (response.status !== 200 || !response.data) {
              console.error('Invalid response or data');
              return;
            }
        
            const snapshot = response.data;
            console.log('Snapshot:', snapshot);
        
            // Ensure snapshot is a valid object
            if (!snapshot || typeof snapshot !== 'object') {
              console.error('Snapshot is not a valid object');
              return;
            }
        
            const receiptArray = [];
        
            // Iterate through the snapshot to process data
            Object.keys(snapshot).forEach((userId) => {
              const user = snapshot[userId];
              if (!user || typeof user !== 'object') return; // Skip invalid user entries
        
              const colonyName = user.colonyName || 'Unknown Colony';
              const fullName = user.fullName || 'Unknown Name';
              const address = user.installationAddress || 'Unknown Address';
              const mobileNo = user.mobileNo || 'Unknown Mobile';
              const company = user.company || 'Unknown Company'
              const userPayments = user.payments;
        
              // Ensure payments exist and are an object
              if (!userPayments || typeof userPayments !== 'object') return;
        
              // Process payments for each user
              Object.keys(userPayments).forEach((paymentKey) => {
                const payment = userPayments[paymentKey];
                if (!payment || typeof payment !== 'object') return; // Skip invalid payments
        
                const { amount, collectedBy, discount, paymentMode, receiptDate, transactionNo, authorized } = payment;
        
                receiptArray.push({
                  mobileNo: mobileNo,
                  address: address,
                  fullName: fullName,
                  colonyName: colonyName,
                  company: company,
                  ReceiptNo: paymentKey, // Use paymentKey as receipt number
                  UserID: userId,
                  Amount: amount || 0,
                  discount: discount || 0,
                  TransactionID: transactionNo || 'N/A',
                  Collected_By: collectedBy || 'Unknown',
                  PaymentMode: paymentMode || 'Unknown',
                  Receipt_Date: receiptDate || 'Unknown',
                  authorized: authorized || false, // Default to false if not provided
                });
              });
            });
        
            // Calculate unique payment modes and colonies
            const paymentModes = [...new Set(receiptArray.map((data) => data.PaymentMode))];
            const colonies = [...new Set(receiptArray.map((data) => data.colonyName))];
        
            // Update state
            setUniqueMode(paymentModes);
            setUniqueColony(colonies);
            setArrayData(receiptArray);
        
          } catch (error) {
            console.error('Error fetching revenue:', error);
          }
        };
        
        

        fetchUser();
        fetchRevenue();
    }, []);

    useEffect(() => {
        let filteredArray = arrayData;
        
    
        if (filter.Status !== 'All') {
            filteredArray = filteredArray.filter((data) => data.authorized === filter.Status);
        }
    
        if(filter.Source !== 'All'){
            filteredArray = filteredArray.filter((data) => data.Source === filter.Source);
        }
    
        if(filter.isp !== 'All'){
          filteredArray = filteredArray.filter((data) => data.PaymentMode === filter.isp);
        }
    
        if(filter.Colony !== 'All'){
          filteredArray = filteredArray.filter((data) => data.colonyName === filter.Colony);
        }
    
        // Filter by Date Range
        if (filter.startDate && filter.endDate) {
          const startDate = new Date(filter.startDate).getTime();
          const endDate = new Date(filter.endDate).getTime();
          filteredArray = filteredArray.filter((data) => {
              const creationDate = new Date(data.Receipt_Date).getTime();
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
        <h4 style={{flex:'1'}}>Your All Revenue Data</h4>
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
        <label className='form-label'>Payment Mode</label>
        <select 
            type="text" 
            className="form-control" 
            name="isp"  
            value={filter.isp} 
            onChange={handleFilterChange} 
            >
              <option value='All'>All</option>
              {
                uniqueMode.map((ispname, index) => (
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
            value={filter.Status} 
            onChange={handleFilterChange} 
            >

              <option value="All">All</option>
              <option value={true}>Authorized</option>
              <option value={false}>UnAuthorized</option>

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

      {/* Tickets Table */}
      <div className='table-responsive'>
        <table className='table table-bordered table-striped table-hover align-middle text-center'>
          <thead className='table-success'>
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
              {/* Add more headers as needed */}
            </tr>
          </thead>
          <tbody>
            {
              filterData.length > 0 ? (
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
                    <td>{userLookup[filterData.Collected_By]}</td>
                    <td>{filterData.authorized ? "Authorized" : "UnAuthorized"}</td>
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

export default RevenueDash
