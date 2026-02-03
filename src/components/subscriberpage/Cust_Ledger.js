import React, { useEffect, useState } from "react";
import Excel_Icon from "./drawables/xls.png";
import PDF_Icon from "./drawables/pdf.png";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaBook, FaArrowUp, FaArrowDown, FaWallet } from 'react-icons/fa';
import { Table, Spinner } from "react-bootstrap";
import "./Cust_Ledger.css";

export default function Cust_Ledger() {
  const userid = localStorage.getItem("susbsUserid");
  const [isLoading, setIsLoading] = useState(true);
  const [arrayledger, setArrayLedger] = useState([]);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/subscriber/ledger?id=${userid}`);
      if (response.status !== 200 || !response.data) {
        toast.error("Failed to load ledger data");
        return;
      }
      const data = response.data;
      const entries = Array.isArray(data) ? data : Object.values(data);
      const formattedLedger = entries.map((entry) => ({
        type: entry.type || "N/A",
        date: formatDate(entry.date) || "",
        particular: entry.particular || "N/A",
        debitamount: Number(entry.debitamount) || 0,
        creditamount: Number(entry.creditamount) || 0,
      }));
      formattedLedger.sort((a, b) => new Date(b.date) - new Date(a.date));
      setArrayLedger(formattedLedger);
    } catch (e) {
      console.error("Ledger fetch error:", e);
      toast.error("Something went wrong while fetching ledger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userid) return;
    fetchLedger();
  }, [userid]);

  let runningBalance = 0;

  return (
    <div className="ledger-main-wrapper">
      <ToastContainer />
      
      {/* HEADER SECTION */}
      <div className="ledger-header-card shadow-sm">
        <div className="d-flex align-items-center">
          <div className="ledger-icon-box">
             <FaBook />
          </div>
          <div className="ms-3">
            <h4 className="fw-bold mb-0">Customer Ledger</h4>
            <p className="text-muted small mb-0">Transaction history and financial statements</p>
          </div>
        </div>

        <div className="ledger-action-group">
          <button className="export-pill me-2">
            <img src={Excel_Icon} alt="Excel" />
            <span>Excel</span>
          </button>
          <button className="export-pill">
            <img src={PDF_Icon} alt="PDF" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="ledger-table-card mt-4 shadow-sm">
        <div className="table-responsive">
          <Table hover className="modern-ledger-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Date</th>
                <th>Particulars</th>
                <th className="text-end">Dr. Amount (Out)</th>
                <th className="text-end">Cr. Amount (In)</th>
                <th className="text-end">Balance</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                    <span className="text-muted">Calculating statement...</span>
                  </td>
                </tr>
              ) : arrayledger.length > 0 ? (
                [...arrayledger]
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(({ type, date, particular, debitamount, creditamount }, index) => {
                    runningBalance += debitamount - creditamount;
                    return (
                      <tr key={index} className={debitamount > 0 ? "row-debit" : "row-credit"}>
                        <td className="text-muted small">{index + 1}</td>
                        <td>
                          <span className={`type-badge ${type.toLowerCase()}`}>
                            {type}
                          </span>
                        </td>
                        <td className="text-nowrap">{formatDate(date)}</td>
                        <td className="particular-cell">{particular}</td>
                        <td className="text-end fw-bold text-danger">
                          {debitamount > 0 ? `-₹${debitamount.toFixed(2)}` : "—"}
                        </td>
                        <td className="text-end fw-bold text-success">
                          {creditamount > 0 ? `+₹${creditamount.toFixed(2)}` : "—"}
                        </td>
                        <td className="text-end">
                          <div className={`balance-chip ${runningBalance > 0 ? 'bal-red' : 'bal-green'}`}>
                            ₹{Math.abs(runningBalance).toFixed(2)} {runningBalance > 0 ? 'Dr' : 'Cr'}
                          </div>
                        </td>
                        <td className="text-muted small italic">---</td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No transactions recorded for this account.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      <style>{`
        .ledger-main-wrapper { padding: 10px; font-family: 'Inter', sans-serif; }
        
        .ledger-header-card {
          background: #fff;
          padding: 20px 25px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #eef2f6;
        }

        .ledger-icon-box {
          width: 48px;
          height: 48px;
          background: #f0f3ff;
          color: #667eea;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .export-pill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 6px 15px;
          border-radius: 50px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: 0.2s;
        }
        .export-pill:hover { background: #fff; border-color: #667eea; transform: translateY(-1px); }
        .export-pill img { width: 18px; height: 18px; }

        .ledger-table-card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #eef2f6; }
        
        .modern-ledger-table thead th {
          background: #f8fafc;
          color: #64748b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          padding: 18px;
          border-top: none;
        }

        .modern-ledger-table tbody td { padding: 16px; vertical-align: middle; border-bottom: 1px solid #f8fafc; font-size: 0.9rem; }
        
        /* Row Styles */
        .row-debit { background-color: rgba(239, 68, 68, 0.02); }
        .row-credit { background-color: rgba(34, 197, 94, 0.02); }

        .type-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          background: #e2e8f0;
          color: #475569;
        }

        .particular-cell { color: #1e293b; font-weight: 500; max-width: 250px; }

        .balance-chip {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .bal-red { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
        .bal-green { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }

        @media (max-width: 768px) {
          .ledger-header-card { flex-direction: column; text-align: center; gap: 15px; }
          .ledger-action-group { width: 100%; display: flex; justify-content: center; }
        }
      `}</style>
    </div>
  );
}