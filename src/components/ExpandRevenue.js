import React, { useEffect, useState } from "react";
import "./ExpandView.css";
import * as XLSX from "xlsx";
import ExcelIcon from "./subscriberpage/drawables/xls.png";
import { ref, update } from "firebase/database";
import { api, db } from "../FirebaseConfig";
import LockIcon from "./subscriberpage/drawables/lock.png";
import { usePermissions } from "./PermissionProvider";
import axios from "axios";

export default function ExpandRevenue({ show, modalShow }) {
  const { hasPermission } = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterUser, setFilterUser] = useState("");

  const fetchRevenue = async () => {
    try {
      const response = await axios.get(
        api + `/subscriber/revenue?count=50&search=${filterUser}`
      );
      if (response.status === 200 && response.data) {
        setArrayData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  const downloadExcel = (selectedOnly = false) => {
    const dataToDownload = selectedOnly ? selectedRows : arrayData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue Data");
    XLSX.writeFile(workbook, `Revenue Data.xlsx`);
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!hasPermission("PAYMENT_AUTHORIZATION")) {
      alert("Permission Denied");
      return;
    }
    try {
      for (let receipt of selectedRows) {
        const userId = receipt.UserKey;
        const receiptno = receipt.ReceiptNo;
        const userRef = ref(db, `Subscriber/${userId}/payments/${receiptno}`);
        await update(userRef, { authorized: true });
      }
      setSelectedRows([]);
    } catch (error) {
      console.error("Error authorizing users:", error);
      alert("There was an error authorizing the selected rows.");
    }
  };

  const handleCheckboxChange = (receipt) => {
    setSelectedRows((prev) =>
      prev.includes(receipt)
        ? prev.filter((item) => item !== receipt)
        : [...prev, receipt]
    );
  };

  if (!show) return null;

  return (
    <div className="expand-modal">
      <div className="expand-modal-content">
        <div className="expand-modal-header">
          <h4 className="modal-title">Payment Authorization</h4>
          <div className="modal-actions">
            <img
              onClick={() => downloadExcel(true)}
              src={ExcelIcon}
              alt="excel"
              className="excel-download-icon ms-auto"
            />
            <button
              className="btn-close"
              onClick={() => {
                modalShow();
                setSelectedRows([]);
              }}
            />
          </div>
        </div>

        <form className="filter-form">
          <div className="form-group">
            <label>Start Date</label>
            <input className="form-control" type="date" />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input className="form-control" type="date" />
          </div>
          <div className="form-group">
            <label>Search user ID</label>
            <input
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="form-control"
              type="text"
              placeholder="e.g. UserID"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  fetchRevenue();
                }
              }}
            />
          </div>
          <div className="form-group">
            <label>Authorization</label>
            <button
              onClick={handleAuthorize}
              disabled={selectedRows.length === 0}
              className={
                selectedRows.length === 0
                  ? "btn btn-disabled"
                  : "btn btn-success"
              }
            >
              Authorize
            </button>
          </div>
        </form>

        <div className="table-container">
          <table className="dashboard-table">
            <thead>
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
                arrayData.map((receipt, index) => (
                  <tr key={index}>
                    <td>
                      {receipt.authorized ? (
                        <img
                          src={LockIcon}
                          alt="Lock"
                          className="lock-icon"
                        />
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
                    <td>
                      {new Date(receipt.Receipt_Date)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(",", "")}
                    </td>
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
                  <td colSpan="10" className="no-data">
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
