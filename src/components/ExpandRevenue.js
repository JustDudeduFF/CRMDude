import React, { useEffect, useState } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';
import LockIcon from './subscriberpage/drawables/lock.png';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import { usePermissions } from './PermissionProvider';
import axios from 'axios';

export default function ExpandRevenue({ show, modalShow }) {
  const {hasPermission} = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [filteredArray, setFilteredArray] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [filterPeriod, setFilterPeriod] = useState('All Time');
  const [filterStatus, setFilterStatus] = useState('UnAuthorized');
  const [filterUser, setFilterUser] = useState(''); // Default to 'UnAuthorized'
  const [paymentmode, setPaymentMode] = useState('All');
  const [userlookup, setUserLookup] = useState({});

  // Function to download the selected rows in Excel format
  const downloadExcel = (selectedOnly = false) => {
    const dataToDownload = selectedOnly ? selectedRows : arrayData;
    if (dataToDownload.length === 0) {
      alert('No data to download');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue data');
    XLSX.writeFile(workbook, `Revenue Data.xlsx`);
  };

  useEffect(() => {

    const fetchUser = async() => {
        try{
          const userResponse = await axios.get('https://api.justdude.in/users');

          if(userResponse.status !== 200) return;

          const responseData = userResponse.data;

          if(responseData){
            const userLook = {};
            Object.keys(responseData).forEach((key) => {
              const userSnap = responseData[key];

              const empname = userSnap.FULLNAME;
              const mobile = userSnap.MOBILE;

              userLook[mobile] = empname;
            });
            setUserLookup(userLook);
          }
        }catch(e){
          console.log(e);
        }

        
    }

    const fetchRevenue = async () => {
      try {
        // Fetch data from the API
        const response = await axios.get('https://api.justdude.in/subscriber');
    
        if (response.status !== 200 || !response.data) {
          return;
        }
    
        const snapshot = response.data;
    
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
    
        
        setArrayData(receiptArray);
    
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
    };
    
    

    fetchUser();
    fetchRevenue();
}, [show]);

  const isValidDate = (dateString) => {
    return dateString && typeof dateString === 'string' && dateString.trim() !== '';
  };
  
  useEffect(() => {
    let filter = arrayData;
    const currentDate = new Date();
  
    // Filtering based on the selected time period
    switch (filterPeriod) {
      case 'Today':
        filter = arrayData.filter((receipt) =>
          isValidDate(receipt.Receipt_Date) && isToday(parseISO(receipt.Receipt_Date))
        );
        break;
      case 'This Week':
        filter = arrayData.filter((receipt) =>
          isValidDate(receipt.Receipt_Date) && isThisWeek(parseISO(receipt.Receipt_Date))
        );
        break;
      case 'This Month':
        filter = arrayData.filter((receipt) =>
          isValidDate(receipt.Receipt_Date) && isThisMonth(parseISO(receipt.Receipt_Date))
        );
        break;
      case 'Last 7 Days':
        filter = filter.filter((receipt) =>
          isValidDate(receipt.Receipt_Date) && parseISO(receipt.Receipt_Date) >= subDays(currentDate, 7)
        );
        break;
      case 'Last 30 Days':
        filter = filter.filter((receipt) =>
          isValidDate(receipt.Receipt_Date) && parseISO(receipt.Receipt_Date) >= subDays(currentDate, 30)
        );
        break;
      default:
        break;
    }
  
    // Filtering based on authorization status
    if (filterStatus === 'Authorized') {
      filter = filter.filter((receipt) => receipt.authorized === true);
    } else if (filterStatus === 'UnAuthorized') {
      filter = filter.filter((receipt) => receipt.authorized === false || '');
    }
  
    // Filtering based on payment mode
    if (paymentmode !== 'All') {
      filter = filter.filter((receipt) => receipt.PaymentMode === paymentmode);
    }
    

    filter = filter.filter((receipt) => receipt.UserID.toLowerCase().includes(filterUser.toLowerCase())) 
  
    setFilteredArray(filter);
  }, [arrayData, filterPeriod, filterStatus, paymentmode, filterUser]);
  
  const handleAuthorize = async (e) => {
    e.preventDefault();
    if(hasPermission("PAYMENT_AUTHORIZATION")){
      try {
        for (let receipt of selectedRows) {
          const userId = receipt.UserID;
          const receiptno = receipt.ReceiptNo; // Assuming the ReceiptNo is stored in each receipt
          const userRef = ref(db, `Subscriber/${userId}/payments/${receiptno}`);
  
          await update(userRef, {
            authorized: true, // Add `authorized: true` key to the user's node
          });
        }
  
        // Optionally clear the selected rows after authorization
        setSelectedRows([]);
      } catch (error) {
        console.error("Error authorizing users:", error);
        alert("There was an error authorizing the selected rows.");
      }
    }else{
      alert("Permission Denied");
    }
  };

  // Handle checkbox select
  const handleCheckboxChange = (receipt) => {
    setSelectedRows((prevSelected) => {
      if (prevSelected.includes(receipt)) {
        return prevSelected.filter((item) => item !== receipt);
      } else {
        return [...prevSelected, receipt];
      }
    });
  };

  

  if (!show) return null;

  return (
    <div className="modal-body1">
      <div className="modal-data1">
        <div className="modal-inner1">
          <h4 style={{ flex: '1' }}>Payment Authorization</h4>
          <form style={{ flex: '3' }} className="row g-3">
          <div className='col-md-2'>
              <label className='form-label'>Search UserId</label>
              <input onChange={(e) => setFilterUser(e.target.value)} className='form-control' type='text' placeholder='e.g. UserID'></input>
            </div>
            <div className="col-md-2">
              <label className="form-label">Select Status</label>
              <select
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="UnAuthorized">UnAuthorized</option>
                <option value="Authorized">Authorized</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Select Time Period</label>
              <select
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="form-select"
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Select Payment Mode</label>
              <select
                onChange={(e) => setPaymentMode(e.target.value)}
                className="form-select"
              >
                <option value="All">All</option>
                <option value="Cash">Cash</option>
                <option value="Paytm">Paytm</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Google Pay">Google Pay</option>
                <option value="Cheque">Cheque</option>
                <option value="NEFT">NEFT</option>
                <option value="Online to ISP">Online to ISP</option>
                <option value="Amazon Pay">Amazon Pay</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Authorization</label>
              <button
                onClick={handleAuthorize}
                disabled={selectedRows.length === 0} // Button is enabled only when rows are selected
                className={selectedRows.length === 0 ? "btn form-control btn-disabled mb-2 me-5" : "btn form-control btn-success mb-2 me-5"}
              >
                Authorize
              </button>
            </div>
          </form>

          <img
            onClick={() => downloadExcel(true)} // Download only selected rows
            src={ExcelIcon}
            alt="excel"
            className="img_download_icon"
          />
          <button
            style={{ right: '5%' }}
            className="btn-close"
            onClick={() => {
              modalShow();
              setSelectedRows([]);
            }}
          ></button>
        </div>
        <div style={{ overflow: 'hidden', height: '80vh', overflowY: 'auto' }}>
          <table className="table">
            <thead className="table-success">
              <tr>
                <th scope='col'></th>
                <th scope='col'>S. No.</th>
                <th scope='col'>User ID</th>
                <th scope='col'>Receipt Date</th>
                <th scope='col'>Amount</th>
                <th scope='col'>Discount</th>
                <th scope='col'>Transaction ID</th>
                <th scope='col'>Receipt No</th>
                <th scope='col'>Collected By</th>
                <th scope='col'>Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {arrayData.length > 0 ? (
                filteredArray.map((receipt, index) => (
                  <tr key={index}>
                    <td>
                      {receipt.authorized ? (
                        <img src={LockIcon} alt="Lock" style={{ width: '25px', height: '25px' }} />
                      ) : (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(receipt)}
                          onChange={() => handleCheckboxChange(receipt)}
                        />
                      )}
                    </td>
                    <td>{index + 1}</td>
                    <td>{receipt.UserID}</td>
                    <td>{new Date(receipt.Receipt_Date).toLocaleDateString('en-GB', {
                      day:'2-digit',
                      month:'short',
                      year:'numeric'
                    }).replace(',','')}</td>
                    <td>{receipt.Amount}</td>
                    <td>{receipt.Discount}</td>
                    <td>{receipt.TransactionID}</td>
                    <td>{`REC-${receipt.ReceiptNo}`}</td>
                    <td>{userlookup[receipt.Collected_By]}</td>
                    <td>{receipt.PaymentMode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center' }}>
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
