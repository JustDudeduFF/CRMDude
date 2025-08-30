import React, { useEffect, useState } from 'react';
import Excel_Icon from './drawables/xls.png';
import PDF_Icon from './drawables/pdf.png';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { api2 } from '../../FirebaseConfig';
import './Cust_Ledger.css';

export default function Cust_Ledger() {
  const userid = localStorage.getItem('susbsUserid');
  const [isLoading, setIsLoading] = useState(true);

  const [arrayledger, setArrayLedger] = useState([])

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr; // fallback if invalid date
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

const fetchLedger = async () => {
  setIsLoading(true);

  try {
    const response = await axios.get(`${api2}/subscriber/ledger?id=${userid}`);
    
    if (response.status !== 200 || !response.data) {
      toast.error("Failed to load ledger data");
      return;
    }

    const data = response.data;

    // Normalize to array (supporting both object and array formats)
    const entries = Array.isArray(data) ? data : Object.values(data);

    // Clean and format data
    const formattedLedger = entries.map(entry => ({
      type: entry.type || "N/A",
      date: formatDate(entry.date) || "",
      particular: entry.particular || "N/A",
      debitamount: Number(entry.debitamount) || 0,
      creditamount: Number(entry.creditamount) || 0,
    }));

    // Optional: sort by date (descending)
    formattedLedger.sort((a, b) => new Date(b.date) - new Date(a.date));

    // ✅ Overwrite, not append
    setArrayLedger(formattedLedger);
  } catch (e) {
    console.error("Ledger fetch error:", e);
    toast.error("Something went wrong while fetching ledger");
  } finally {
    setIsLoading(false);
  }
};



  useEffect(() => {
    if (!userid) {
      console.error("User ID not provided");
      return;
    }
    fetchLedger();
  }, [userid]);

  let runningBalance = 0;

  return (
    <>
    <ToastContainer />
      <div className="cust-ledger-container">
        <div className="cust-ledger-header">
          <h2 className="cust-ledger-title">Customer Ledger</h2>
          <div className="cust-ledger-actions">
            <img src={Excel_Icon} alt="Download Excel" className="cust-ledger-download-icon" />
            <img src={PDF_Icon} alt="Download PDF" className="cust-ledger-download-icon" />
          </div>
        </div>

        <div className="cust-ledger-table-container">
          <table className="cust-ledger-table">
            <thead>
              <tr>
                <th scope="col">S. No.</th>
                <th scope="col">Type</th>
                <th scope="col">Date</th>
                <th scope="col">Particulars</th>
                <th scope="col">Dr. Amount</th>
                <th scope="col">Cr. Amount</th>
                <th scope="col">Balance</th>
                <th scope="col">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {
                isLoading ? (
                  <tr>
                    <td colSpan="8">
                      <div className="cust-ledger-loading">
                        <div className="cust-ledger-loading-spinner">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                        <div className="cust-ledger-loading-text">Loading...</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  arrayledger.length > 0 ? (
                    arrayledger.map(({ type, date, particular, debitamount, creditamount }, index) => {
                      runningBalance += debitamount - creditamount;
      
                      return (
                        <tr className={debitamount > 0 ? 'table-danger' : 'table-success'} key={index}>
                          <td>{index + 1}</td>
                          <td>{type}</td>
                          <td>{formatDate(date)}</td>
                          <td>{particular}</td>
                          <td className={debitamount > 0 ? 'cust-ledger-debit' : ''}>
                            {debitamount.toFixed(2)}
                          </td>
                          <td className={creditamount > 0 ? 'cust-ledger-credit' : ''}>
                            {creditamount.toFixed(2)}
                          </td>
                          <td className="cust-ledger-balance">{runningBalance.toFixed(2)}</td>
                          <td>{/* Optional: Add remarks if needed */}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="cust-ledger-no-data">No ledger data found</td>
                    </tr>
                  )
                  
                )
              }
            
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
