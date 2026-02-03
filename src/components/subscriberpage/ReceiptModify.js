import { get, ref, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaReceipt, FaMoneyCheckAlt, FaUserTie, FaRegStickyNote, FaCalendarAlt } from 'react-icons/fa';

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
      const dueAmount = await API.get(`/subscriber?id=${userid}`);
      if (dueAmount.status !== 200) {
        toast.error("Failed to fetch due amount", {
          autoClose: 2000,
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

      const response = await API.post(`/subscriber/payment`, {
        receiptData,
      });

      if (response.status !== 201) {
        toast.error("Failed to collect payment", {
          autoClose: 3000,
        });
        setIsDisabled(false);
        return;
      }

      toast.success(response.data.message, {
        autoClose: 3000,
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
      const response = await API.get(
        `/subscriber/planinfo/${userid}?partnerId=${partnerId}`
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
      const response = await API.get(
        `/subscriber/users?partnerId=${partnerId}`
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
    <div className="receipt-form-container">
      <ToastContainer />
      
      <div className="receipt-card shadow-sm border-0">

        <div className="receipt-body">
          <form onSubmit={handleSubmit} className="row g-4">
            
            {/* Row 1: Basic Info */}
            <div className="col-md-2">
              <label className="field-label">Receipt No.</label>
              <input type="text" className="modern-input-field readonly" value="Auto-Generated" readOnly />
            </div>

            <div className="col-md-4">
              <label className="field-label"><FaCalendarAlt className="me-1"/> Billing Period *</label>
              <select onChange={(e) => setBillingPeriod(e.target.value)} className="modern-select-field">
                <option value="">Choose Cycle...</option>
                {arrayblling.length > 0 ? (
                  arrayblling.map(({ activationDate, expiryDate }, index) => (
                    <option key={index} value={`${activationDate} to ${expiryDate}`}>
                      {`${activationDate} to ${expiryDate}`}
                    </option>
                  ))
                ) : (
                  <option value="dueamount">No Bill Found!</option>
                )}
              </select>
            </div>

            <div className="col-md-3">
              <label className="field-label">Receipt Date</label>
              <input type="date" className="modern-input-field" value={currentdate} onChange={(e) => setCurrentDate(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="field-label"><FaMoneyCheckAlt className="me-1"/> Payment Mode *</label>
              <select onChange={(e) => setPaymentMode(e.target.value)} className="modern-select-field">
                <option defaultValue>Choose Mode...</option>
                {["Paytm", "PhonePe", "Google Pay", "Cheque", "NEFT", "Cash", "Online to ISP", "Amazon Pay"].map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>

            {/* Conditional Bank Name */}
            {(paymentMode === "Cheque" || paymentMode === "NEFT") && (
              <div className="col-md-4">
                <label className="field-label">Bank Name</label>
                <input onChange={(e) => setBankName(e.target.value)} type="text" className="modern-input-field" placeholder="Enter bank name" />
              </div>
            )}

            {/* Row 2: Financials */}
            <div className="col-md-3">
              <label className="field-label">Amount Collected (₹) *</label>
              <div className="input-group-modern">
                 <span className="input-icon-text">₹</span>
                 <input onChange={(e) => setAmount(e.target.value)} type="number" className="modern-input-field icon-pad" placeholder="0.00" />
              </div>
            </div>

            <div className="col-md-3">
              <label className="field-label">Discount Applied (₹) *</label>
              <div className="input-group-modern">
                 <span className="input-icon-text">₹</span>
                 <input onChange={(e) => setDiscount(e.target.value)} type="number" className="modern-input-field icon-pad" placeholder="0.00" />
              </div>
            </div>

            <div className="col-md-3">
              <label className="field-label"><FaUserTie className="me-1"/> Collected By *</label>
              <select onChange={(e) => setCollectedBy(e.target.value)} className="modern-select-field">
                <option value="">Select Staff...</option>
                {arrayemp.length > 0 ? (
                  arrayemp.map(({ empName, empId }, index) => (
                    <option key={index} value={empId}>{empName}</option>
                  ))
                ) : (
                  <option value="">No Employee Found!</option>
                )}
              </select>
            </div>

            <div className="col-md-3">
              <label className="field-label">Transaction Reference</label>
              <input onChange={(e) => settransactionNo(e.target.value)} type="text" className="modern-input-field" placeholder="UTR / Txn ID" />
            </div>

            {/* Row 3: Narration */}
            <div className="col-md-12">
              <label className="field-label"><FaRegStickyNote className="me-1"/> Narration / Remarks</label>
              <textarea 
                onChange={(e) => setnarration(e.target.value)} 
                className="modern-input-field" 
                rows="2" 
                placeholder="Optional payment remarks..."
              ></textarea>
            </div>

            <div className="col-12 mt-4">
              <div className="d-flex gap-2">
                <button type="submit" className="btn-indigo-gradient rounded-pill px-5 border-0 py-2 fw-bold" disabled={isdisabled}>
                  {isdisabled ? "Processing..." : "Confirm & Collect Amount"}
                </button>
                <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4 fw-bold">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .receipt-form-container { padding: 10px; font-family: 'Inter', sans-serif; }
        .receipt-card { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
        .receipt-header { padding: 25px; border-bottom: 1px solid #f1f5f9; background: #fff; }
        .header-icon-circle { width: 45px; height: 45px; background: #eef2ff; color: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .receipt-body { padding: 30px; }

        .field-label { font-size: 0.75rem; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; display: block; letter-spacing: 0.5px; }
        
        .modern-input-field { width: 100%; padding: 10px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; color: #334155; }
        .modern-input-field:focus { border-color: #4f46e5; background: #fff; }
        .modern-input-field.readonly { background: #f8fafc; color: #94a3b8; border-style: dashed; }
        
        .modern-select-field { width: 100%; padding: 10px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; background: #fff; outline: none; cursor: pointer; }
        .modern-select-field:focus { border-color: #4f46e5; }

        .input-group-modern { position: relative; display: flex; align-items: center; }
        .input-icon-text { position: absolute; left: 15px; font-weight: 800; color: #94a3b8; font-size: 0.9rem; }
        .icon-pad { padding-left: 35px; }

        .btn-indigo-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; transition: 0.3s; }
        .btn-indigo-gradient:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); opacity: 0.9; }
        .btn-indigo-gradient:disabled { opacity: 0.6; transform: none; }
      `}</style>
    </div>
  );
}