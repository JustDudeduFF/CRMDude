import { get, ref, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from "jspdf-autotable";

export default function ReceiptModify() {
  const userid = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");

  const navigate = useNavigate();

  const [arrayblling, setBillingArray] = useState([]);
  const [arrayemp, setEmpArray] = useState([]);
  const [currentdate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [billingPeriod, setBillingPeriod] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [bankname, setBankName] = useState("");
  const [amount, setAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [collectedBy, setCollectedBy] = useState("");
  const [transactionNo, settransactionNo] = useState("");
  const [narration, setnarration] = useState("");

  const [isdisabled, setIsDisabled] = useState(false);

  const paymentkey = Date.now();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);

    try {
      const newLedgerKey2 = Date.now();
      const dueAmount = await axios.get(`${api2}/subscriber?id=${userid}`);
      if (dueAmount.status !== 200) {
        toast.error("Failed to fetch due amount", {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
        setIsDisabled(false);
        return;
      }
      const dueAmountValue = dueAmount.data.dueAmount || 0;

      if (
        amount === 0 ||
        collectedBy === "" ||
        paymentMode === "" ||
        billingPeriod === "" ||
        discount === 0
      ) {
        toast.error("Please Fill Details", {
          autoClose: 2000,
        });
        setIsDisabled(false);
        return;
      }

      const receiptData = {
        source: "Manual",
        receiptNo: `REC-${paymentkey}`,
        billingPeriod,
        receiptDate: currentdate,
        paymentMode,
        bankname,
        amount,
        discount,
        collectedBy,
        transactionNo,
        modifiedBy: localStorage.getItem("Name"),
        narration,
        discountkey: newLedgerKey2,
        authorized: false,
        userId: localStorage.getItem("susbsUserid"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        partnerId: partnerId,
        subscriber: userid,
        paymentKey: paymentkey,
        dueAmount: dueAmountValue,
      };

      // STEP 2: Save payment
      const response = await axios.post(`${api2}/subscriber/payment`, {
        receiptData,
      });

      if (response.status !== 201) {
        toast.error("Failed to collect payment", {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        });
        setIsDisabled(false);
        return;
      }

      toast.success(response.data.message, {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });

      navigate(-1);
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred during submission.", {
        autoClose: 3000,
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const fetchbillingperiod = async () => {
    try {
      const response = await axios.get(
        api2 + "/subscriber/planinfo/" + userid + "?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return console.log("Error fetching billing period data");
      const data = response.data;
      if (data && data.length > 0) {
        const billingArray = data.map((item) => ({
          activationDate: item.activationDate,
          expiryDate: item.expiryDate,
        }));
        setBillingArray(billingArray);
      } else {
        setBillingArray([]);
      }
    } catch (error) {
      console.error("Error fetching billing period:", error);
    }
  };

  const fetchemp = async () => {
    try {
      const response = await axios.get(
        `${api2}/subscriber/users?partnerId=${partnerId}`
      );
      if (response.data && response.data.length > 0) {
        const empArray = response.data.map((emp) => ({
          empName: emp.empname,
          empId: emp.empmobile,
        }));
        setEmpArray(empArray);
      } else {
        setEmpArray([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchbillingperiod();
    fetchemp();
  }, [userid]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: "1",
          margin: "20px",
          border: "1px solid green",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 10px green",
        }}
      >
        <ToastContainer />
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-1">
            <label htmlFor="inputEmail4" className="form-label">
              Receipt No.
            </label>
            <input
              type="email"
              className="form-control"
              id="inputEmail4"
              value="Auto"
              readOnly
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="inputPassword4" className="form-label">
              Billing Period
            </label>
            <select
              onChange={(e) => setBillingPeriod(e.target.value)}
              className="form-select"
            >
              <option value="">Choose...</option>
              {arrayblling.length > 0 ? (
                arrayblling.map(({ activationDate, expiryDate }, index) => (
                  <option
                    key={index}
                    value={`${activationDate} to ${expiryDate}`}
                  >
                    {`${activationDate} to ${expiryDate}`}
                  </option>
                ))
              ) : (
                <option value="dueamount">No Bill Found!</option>
              )}
            </select>
          </div>
          <div className="col-md-2">
            <label htmlFor="validationCustom04" className="form-label">
              Receipt Date
            </label>
            <input
              type="date"
              className="form-control"
              value={currentdate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
          </div>
          <div className="col-3">
            <label className="form-label">Payment Mode</label>
            <select
              onChange={(e) => setPaymentMode(e.target.value)}
              className="form-select"
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

          {(paymentMode === "Cheque" || paymentMode === "NEFT") && (
            <div className="col-md-3">
              <label className="form-label">Bank Name</label>
              <input
                onChange={(e) => setBankName(e.target.value)}
                type="text"
                className="form-control"
              />
            </div>
          )}
          <div className="col-md-3">
            <label htmlFor="inputCity" className="form-label">
              Amount
            </label>
            <input
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              className="form-control"
              id="inputCity"
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Discount</label>
            <input
              onChange={(e) => setDiscount(e.target.value)}
              type="number"
              className="form-control"
              id="inputDis"
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="inputZip" className="form-label">
              Collected By
            </label>
            <select
              onChange={(e) => setCollectedBy(e.target.value)}
              className="form-select"
            >
              <option value="">Choose...</option>
              {arrayemp.length > 0 ? (
                arrayemp.map(({ empName, empId }, index) => (
                  <option key={index} value={empId}>
                    {empName}
                  </option>
                ))
              ) : (
                <option value="">No Employee Found!</option>
              )}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="inputCity" className="form-label">
              Transaction No.
            </label>
            <input
              onChange={(e) => settransactionNo(e.target.value)}
              type="text"
              className="form-control"
              id="inputCity"
            />
          </div>
          <div className="col-md-8">
            <label htmlFor="inputCity" className="form-label">
              Narration
            </label>
            <input
              onChange={(e) => setnarration(e.target.value)}
              type="text"
              className="form-control"
              id="inputCity"
            />
          </div>
          <div className="col-8">
            <button
              type="submit"
              className="btn btn-outline-success"
              disabled={isdisabled}
            >
              Collect Amount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
