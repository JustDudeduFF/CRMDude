import React, { useEffect, useState } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';
import LockIcon from './subscriberpage/drawables/lock.png';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import { usePermissions } from './PermissionProvider';

export default function ExpandRevenue({ show, modalShow }) {
  const {hasPermission} = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [filteredArray, setFilteredArray] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [filterPeriod, setFilterPeriod] = useState('All Time');
  const [filterStatus, setFilterStatus] = useState('UnAuthorized'); // Default to 'UnAuthorized'
  const [paymentmode, setPaymentMode] = useState('All');

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
    if (show) {
      const receiptRef = ref(db, `Subscriber`);
      onValue(receiptRef, (snapshot) => {
        const receiptArray = [];
        snapshot.forEach((subscriberChild) => {
          const userId = subscriberChild.key;
          const userPayments = subscriberChild.child('payments');
          userPayments.forEach((paymentChild) => {
            const paymentData = paymentChild.val();
            const receiptno = paymentChild.key;
            const { amount, collectedBy, discount, paymentMode, receiptDate, transactionNo, authorized } = paymentData;
            receiptArray.push({
              ReceiptNo: receiptno,
              UserID: userId,
              Amount: amount,
              Discount: discount,
              TransactionID: transactionNo,
              Collected_By: collectedBy,
              PaymentMode: paymentMode,
              Receipt_Date: receiptDate,
              authorized // Ensure you have 'authorized' in your payment data
            });
          });
        });
        setArrayData(receiptArray); // Set arrayData outside the loop
      });
    }
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
  
    setFilteredArray(filter);
  }, [arrayData, filterPeriod, filterStatus, paymentmode]);
  
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
          <form style={{ flex: '2' }} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Select Status</label>
              <select
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="UnAuthorized">UnAuthorized</option>
                <option value="Authorized">Authorized</option>
              </select>
            </div>
            <div className="col-md-3">
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
            <div className="col-md-3">
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
                <th></th>
                <th>S. No.</th>
                <th>User ID</th>
                <th>Receipt Date</th>
                <th>Amount</th>
                <th>Discount</th>
                <th>Transaction ID</th>
                <th>Receipt No</th>
                <th>Collected By</th>
                <th>Payment Mode</th>
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
