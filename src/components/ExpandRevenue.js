import React, { useEffect, useState } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';
import LockIcon from './subscriberpage/drawables/lock.png';
import { usePermissions } from './PermissionProvider';
import axios from 'axios';

export default function ExpandRevenue({ show, modalShow }) {
  const {hasPermission} = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [filterUser, setFilterUser] = useState(''); 

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

  const fetchRevenue = async () => {
    try {
      // Fetch data from the API
      const response = await axios.get(`https://api.justdude.in/subscriber/revenue?count=50&search=${filterUser}`);
  
      if (response.status !== 200 || !response.data) {
        return;
      }
      const arrayData = response.data.arrayLenght.data;
      const array = [];
      Object.keys(arrayData).forEach((key) => {
        const userData = arrayData[key];
        array.push(userData);
      });
      setArrayData(array);
  
  
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  useEffect(() => {
    fetchRevenue();
}, []);

  

  
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
          <form style={{ flex: '1' }} className="row g-3">
          <div className='col-md-4'>  
              <label className='form-label'>Search UserId</label>
              <input onChange={(e) => setFilterUser(e.target.value)} className='form-control' type='text' placeholder='e.g. UserID' onKeyDown={(e) => {
                if(e.key === "Enter"){
                  e.preventDefault();
                  fetchRevenue();
                }
              }}></input>
            </div>
            <div className="col-md-4">
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
                arrayData.map((receipt, index) => (
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
                    <td>{receipt.Collected_By}</td>
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
