import React, { useEffect, useState } from "react";
import "./ExpandView.css";
import * as XLSX from "xlsx";
import ExcelIcon from "./subscriberpage/drawables/xls.png";
import LockIcon from "./subscriberpage/drawables/lock.png";
import { api2 } from "../FirebaseConfig";
import { usePermissions } from "./PermissionProvider";
import axios from "axios";
import { toast } from "react-toastify";

export default function ExpandRevenue({ show, modalShow }) {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [totals, setTotals] = useState({ amount: 0, discount: 0 });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  function formatRevenue(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    userId: ""
  });

  const [debouncedUserId, setDebouncedUserId] = useState(formData.userId);

  // Fetch revenue data from server
  const fetchRevenueData = async () => {
    try {
      const response = await axios.get(
        `${api2}/dashboard-data/payments/${partnerId}?startDate=${formData.startDate}&endDate=${formData.endDate}&username=${formData.userId}`
      );

      setArrayData(response.data.formattedData || []);
      setTotals({
        amount: response.data.totals.totalAmount || 0,
        discount: response.data.totals.totalDiscount || 0,
      });
      setCurrentPage(1); // Reset to first page
    } catch (e) {
      console.error("Error fetching revenue data:", e);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [debouncedUserId, formData.startDate, formData.endDate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserId(formData.userId);
    }, 300);
    return () => clearTimeout(handler);
  }, [formData.userId]);

  const handleCheckboxChange = (receipt) => {
    setSelectedRows((prev) => {
      const exists = prev.includes(receipt._id);
      return exists
        ? prev.filter((id) => id !== receipt._id) // remove if already selected
        : [...prev, receipt._id]; // add only the _id
    });
  };


  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!hasPermission("PAYMENT_AUTHORIZATION")) {
      alert("Permission Denied");
      return;
    }

    try{
      const response = await axios.patch(`${api2}/dashboard-data/payment/authorized`, {ids:selectedRows});

      if(response.status === 200) toast.success(`${response.data.modified} Payment Authorized`, {autoClose:2000});

      fetchRevenueData();

    }catch(e){
      console.log(e);
    }
  };

  const downloadExcel = (selectedOnly = false) => {
    const dataToDownload = selectedOnly ? selectedRows : arrayData;
    if (dataToDownload.length === 0) {
      alert("No data to download");
      return;
    }

    const formattedData = dataToDownload.map((item, index) => ({
      "S. No": index + 1,
      "User ID": item.userid,
      "Receipt Date": new Date(item.receiptdate).toLocaleDateString(),
      "Amount": item.amount,
      "Discount": item.discount,
      "Transaction ID": item.transactionid,
      "Receipt No": item.receiptno,
      "Collected By": item.collectedby,
      "Payment Mode": item.paymentmode,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Revenue Data");
    XLSX.writeFile(workbook, "Revenue_Data.xlsx");
  };

  if (!show) return null;

  // Pagination logic
  const paginatedData = arrayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(arrayData.length / itemsPerPage);

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
            <button className="btn-close" onClick={modalShow} />
          </div>
        </div>

        <form className="filter-form">
          <div className="form-group">
            <label>Start Date</label>
            <input
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="form-control"
              type="date"
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="form-control"
              type="date"
            />
          </div>
          <div className="form-group">
            <label>Search user ID</label>
            <input
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              className="form-control"
              type="text"
              placeholder="e.g. UserID"
              onKeyDown={(e) => {
                if (e.key === "Enter") e.preventDefault();
              }}
            />
          </div>

          <div className="form-group">
            <div className="d-flex flex-row">
              <div className="d-flex flex-column">
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

              <div className="ms-5 d-flex flex-column">
                <label className="form-label">Total Amount: ₹{formatRevenue(totals.amount)}</label>
                <label className="form-label">Total Discount: ₹{formatRevenue(totals.discount)}</label>
              </div>
            </div>
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
              {paginatedData.length > 0 ? (
                paginatedData.map((receipt, index) => (
                  <tr key={receipt.receiptno || index}>
                    <td>
                      {receipt.isauthorized ? (
                        <img src={LockIcon} alt="Lock" className="lock-icon" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(receipt._id)}
                          onChange={() => handleCheckboxChange(receipt)}
                        />

                      )}
                    </td>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td>{receipt.userid}</td>
                    <td>
                      {new Date(receipt.receiptdate)
                        .toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        .replace(",", "")}
                    </td>
                    <td>₹{receipt.amount}</td>
                    <td>₹{receipt.discount}</td>
                    <td>{receipt.transactionid}</td>
                    <td>{receipt.receiptno}</td>
                    <td>{receipt.collectedby}</td>
                    <td>{receipt.paymentmode}</td>
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

          {arrayData.length > itemsPerPage && (
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    prev < totalPages ? prev + 1 : prev
                  )
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
