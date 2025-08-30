import { ref, update, remove } from "firebase/database";
import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { Modal, Button } from "react-bootstrap"; // Import Bootstrap components
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { usePermissions } from "../PermissionProvider";
import axios from "axios";
import { api2 } from "../../FirebaseConfig";
import "./PaymetTable.css";

export default function PaymetTable() {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const userid = localStorage.getItem("susbsUserid");
  const [arraypayment, setArrayPayment] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null); // State to hold selected payment
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [userData, setUserData] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [userMap, setUserMap] = useState({}); // State to hold user keys and full names
  const [showOptionsModal, setShowOptionsModal] = useState(false); // State to control options modal
  const [currentPayment, setCurrentPayment] = useState(null); // State to hold the current payment for options
  const [isLoading, setIsLoading] = useState(false);
  const tempupdate = localStorage.getItem("tempupdate");

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let paymentsArray = [];
      const response = await axios.get(
        `${api2}/subscriber/payments?id=${userid}`
      );
      if (response.status !== 200)
        return console.log("Error fetching payments");
      const data = response.data;
      Object.keys(data).forEach((key) => {
        const payment = data[key];
        paymentsArray.push({
          ...payment,
          amount: parseFloat(payment.amount) || 0,
          discount: parseFloat(payment.discount) || 0,
        });
      });
      setArrayPayment(paymentsArray);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchUserData = async () => {
    let maping = {};
    try {
      const response = await axios.get(
        `${api2}/subscriber/users?partnerId=${partnerId}`
      );
      if (response.status !== 200)
        return console.log("Error fetching user data");
      const data = response.data;
      Object.keys(data).forEach((key) => {
        const user = data[key];
        maping[user.empmobile] = user.empname;
      });
      setUserMap(maping);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    const response = await axios.get(`${api2}/subscriber?id=${userid}`);

    if (response.status !== 200) return alert("Failed To Fetch");

    const data = response.data;
    setCustomerData(data);
  };

  useEffect(() => {
    fetchPayments();
    fetchUserData();
    fetchCustomerData();
  }, [userid, tempupdate]);

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedPayment(null); // Clear selected payment
  };

  const updatePayment = async (updatedPayment) => {
    try {
      const response = await axios.put(
        `${api2}/subscriber/payment/${updatedPayment.receiptNo}`,
        {
          updatedPayment,
          userId: customerData.userKey,
          currentDueAmount: parseInt(customerData.dueAmount, 10),
          modifiedBy: localStorage.getItem("contact"),
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update payment");
      }
      alert("Payment updated successfully!");
      localStorage.setItem("tempupdate", Date.now());
    } catch (error) {
      console.error("Error updating payment:", error);
      alert(
        error.response?.data?.error ||
          "An error occurred while updating the payment."
      );
    }
  };

  const handleEdit = () => {
    if (currentPayment.authorized) {
      alert(`That Receipt is authorized it could not be modified`);
      return;
    }
    if (hasPermission("EDIT_PAYMENT")) {
      setSelectedPayment(currentPayment); // Set the selected payment for editing
      setIsModalOpen(true); // Open the edit modal
      setShowOptionsModal(false); // Close the options modal
    } else {
      alert("Permission Denied");
      setShowOptionsModal(false);
    }
  };

  const handleCancel = async () => {
    if (!hasPermission("CANCEL_RECEIPT")) {
      alert("Permission Denied!");
      return;
    }

    if (currentPayment.authorized) {
      alert(`That Receipt is authorized it could not be canceled`);
      return;
    }

    if (currentPayment.status === "cancel") {
      alert(`That Receipt is already canceled`);
      return;
    }

    const receiptNo = currentPayment.receiptNo.split("-")[1];
    const discountKey = currentPayment?.discountkey;
    const logKey = Date.now();
    const receiptAmount =
      parseInt(currentPayment.amount, 10) +
      parseInt(currentPayment?.discount || 0, 10);
    const dueAmount = parseInt(customerData.dueAmount || 0, 10);

    try {
      await axios.put(`${api2}/subscriber/payment/cancel/${receiptNo}`, {
        userId: customerData.userKey,
        discountKey,
        logKey,
        receiptAmount,
        currentDueAmount: dueAmount,
        modifiedBy: localStorage.getItem("contact"),
        originalAmount: currentPayment.amount,
        originalDiscount: currentPayment.discount,
      });

      setShowOptionsModal(false);
      alert("Receipt Canceled");
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel receipt.");
    }
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      body: [
        [
          {
            content: companyData.companyname,
            styles: {
              halign: "left",
              fontSize: 20,
              textColor: "#ffffff",
            },
          },
          {
            content: "Invoice",
            styles: {
              halign: "right",
              fontSize: 20,
              fontWeight: "bold",
              textColor: "#ffffff",
            },
          },
        ],
      ],
      theme: "plain",
      styles: {
        fillColor: "#3366ff",
      },
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              `Reference : #INV${currentPayment.receiptNo.slice(10, 13)}` +
              "\nDate: " +
              currentPayment.receiptDate,
            styles: {
              halign: "right",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              "Billed to:" +
              "\nCustomer Name: " +
              customerData.fullName +
              "\nAddress: " +
              customerData.installationAddress +
              "\nMobile No: " +
              customerData.mobileNo +
              "\nEmail: " +
              customerData.email,
            styles: {
              halign: "left",
            },
          },
          {
            content:
              "From:" +
              "\n" +
              companyData.companyname +
              "\n" +
              companyData.companyaddress +
              "\nMobile No: " +
              companyData.companymobile,
            styles: {
              halign: "right",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Amount Paid: ",
            styles: {
              fontSize: 18,
              halign: "right",
            },
          },
        ],

        [
          {
            content: currentPayment.amount + ".00 Rs",
            styles: {
              halign: "right",
              fontSize: 15,
              textColor: "#3366ff",
            },
          },
        ],

        [
          {
            content: "Payment Mode: " + currentPayment.paymentMode,
            styles: {
              halign: "right",
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Products and Services",
            styles: {
              halign: "left",
              fontSize: 14,
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      head: [
        [
          "S. No.",
          "Particular",
          "Quantity/Period",
          "Rate",
          "Discount",
          "Amount",
        ],
      ],
      body: [
        [
          "1",
          `${customerData.connectionDetails.planName}`,
          `${currentPayment.billingPeriod}`,
          `${
            parseInt(currentPayment.amount) + parseInt(currentPayment.discount)
          }`,
          `${currentPayment.discount}`,
          `${currentPayment.amount}`,
        ],
      ],
      theme: "striped",
      headStyles: {
        fillColor: "#343a40",
      },
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Total Amount: " + currentPayment.amount + ".00 Rs",
            styles: {
              halign: "right",
              fontSize: 14,
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              "Thank you for your business!" +
              "\n" +
              "For any queries, please contact us at " +
              companyData.companymobile +
              "\n" +
              "This is an auto generated invoice and does not require any signature.",
            styles: {
              halign: "center",
              fontSize: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });

    autoTable(doc, {
      body: [
        [
          {
            content: "Powered by: CRMDude",
            styles: {
              halign: "left",
              fontSize: 12,
            },
          },
        ],
      ],
      theme: "plain",
    });

    doc.save(`${currentPayment.receiptNo}.pdf`);
  };

  const handleShareInvoice = () => {
    // Logic to share the invoice

    setShowOptionsModal(false); // Close the options modal
  };

  return (
    <>
      {/* Options Modal for Receipt No actions */}
      <Modal
        show={showOptionsModal}
        onHide={() => setShowOptionsModal(false)}
        className="payment-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Options for Receipt No: {currentPayment?.receiptNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button
            className="payment-btn payment-btn-danger mb-2 ms-2"
            onClick={handleCancel}
          >
            Cancel Receipt
          </Button>
          <Button
            className="payment-btn payment-btn-outline-secondary mb-2 ms-2"
            onClick={handleShareInvoice}
          >
            Share
          </Button>
          <Button
            className="payment-btn payment-btn-outline-secondary mb-2 ms-2"
            onClick={handleEdit}
          >
            Edit Payment
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="payment-btn payment-btn-primary mb-2 ms-2"
            onClick={() => {
              if (hasPermission("DOWNLOAD_INVOICE")) {
                handleDownloadInvoice();
              } else {
                alert("Permission Denied");
              }
            }}
          >
            Download Invoice
          </Button>
          <Button
            className="payment-btn payment-btn-outline-secondary"
            onClick={() => setShowOptionsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for editing payment */}
      <Modal show={isModalOpen} onHide={closeModal} className="payment-modal">
        <Modal.Header closeButton>
          <Modal.Title>Edit Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <div className="mb-3">
                <label className="payment-form-label">Amount:</label>
                <input
                  type="number"
                  className="payment-form-control"
                  value={selectedPayment.amount}
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      amount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="payment-form-label">Discount:</label>
                <input
                  type="number"
                  className="payment-form-control"
                  value={selectedPayment.discount}
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      discount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="payment-form-label">Collected By:</label>
                <select
                  className="payment-form-control"
                  defaultValue={
                    userData.find(
                      (user) => user.userKey === selectedPayment.collectedBy
                    )?.fullname || ""
                  }
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      collectedBy: e.target.value,
                    })
                  }
                >
                  {userData.map((user) => (
                    <option key={user.userKey} value={user.userKey}>
                      {user.fullname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="payment-form-label">Payment Mode</label>
                <select
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      paymentMode: e.target.value,
                    })
                  }
                  className="payment-form-control"
                >
                  <option defaultValue>Choose...</option>
                  <option value="Paytm">Paytm</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="Cheque">Cheque</option>
                  <option value="NEFT">NEFT</option>
                  <option value="Cash">Cash</option>
                  <option value="Online to ISP">Online to ISP</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="payment-form-label">Transaction No:</label>
                <input
                  type="text"
                  className="payment-form-control"
                  value={selectedPayment.transactionNo}
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      transactionNo: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="payment-form-label">Receipt Date:</label>
                <input
                  type="date"
                  className="payment-form-control"
                  defaultValue={selectedPayment.receiptDate}
                  onChange={(e) =>
                    setSelectedPayment({
                      ...selectedPayment,
                      receiptDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="payment-btn payment-btn-outline-secondary"
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            className="payment-btn payment-btn-primary"
            onClick={() => {
              updatePayment(selectedPayment);
              closeModal();
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Table */}
      <div className="payment-table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Source</th>
              <th>Receipt No.</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Discount</th>
              <th>Payment Mode</th>
              <th>Bank Name</th>
              <th>Collected By</th>
              <th>Modified By</th>
              <th>Narration</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="11">
                  <div className="payment-loading">
                    <div className="payment-loading-spinner">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div className="payment-loading-text">Loading...</div>
                  </div>
                </td>
              </tr>
            ) : arraypayment.length > 0 ? (
              arraypayment.map((payment, index) => (
                <tr
                  className={
                    payment.status === "cancel"
                      ? "table-danger"
                      : "table-success"
                  }
                  key={index}
                >
                  <td>{index + 1}</td>
                  <td>{payment.source}</td>
                  <td
                    className="payment-receipt-number"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setCurrentPayment(payment);
                      setShowOptionsModal(true);
                    }}
                  >
                    {payment.receiptNo}
                  </td>
                  <td>{payment.receiptDate}</td>
                  <td className="payment-amount">
                    {payment.amount.toFixed(2)}
                  </td>
                  <td className="payment-discount">
                    {payment.discount.toFixed(2)}
                  </td>
                  <td>{payment.paymentMode}</td>
                  <td>{payment.bankname}</td>
                  <td>{userMap[payment.collectedBy] || "N/A"}</td>
                  <td>{payment.modifiedBy}</td>
                  <td>{payment.narration || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="payment-no-data">
                  No payment data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
