import { get, ref, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';


export default function ReceiptModify() {
  const location = useLocation();
  const { userid } = location.state || {};

  const navigate = useNavigate();

  const [arrayblling, setBillingArray] = useState([]);
  const [arrayemp, setEmpArray] = useState([]);
  const [currentdate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingPeriod, setBillingPeriod] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [bankname, setBankName] = useState('');
  const [amount, setAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [collectedBy, setCollectedBy] = useState('');
  const [transactionNo, settransactionNo] = useState('');
  const [narration, setnarration] = useState('');

  const [isdisabled, setIsDisabled] = useState(false);

  const paymentkey = Date.now();
  



  const billingRef = ref(db, `Subscriber/${userid}/planinfo`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);

    const newLedgerKey2 = Date.now();

    const receiptData = {
      source: 'Manual',
      receiptNo: `REC-${paymentkey}`,
      billingPeriod: billingPeriod,
      receiptDate: currentdate,
      paymentMode: paymentMode,
      bankname: bankname,
      amount: amount,
      discount: discount,
      collectedBy: collectedBy,
      transactionNo: transactionNo,
      modifiedBy: localStorage.getItem('Name'),
      narration: narration,
      discountkey:newLedgerKey2
    };

    const dueRef = ref(db, `Subscriber/${userid}/connectionDetails`);
    const dueSnap = await get(dueRef);
    const dueAmount = parseInt(dueSnap.val().dueAmount);

    const newDue = {
      dueAmount: dueAmount - (parseInt(amount) + parseInt(discount)),
    };
    await set(ref(db, `Subscriber/${userid}/payments/${paymentkey}`), receiptData);
    await update(dueRef, newDue);

    const ledgerData = {
      type: 'Payment Collection',
      date: currentdate,
      particular: `From ${billingPeriod}`,
      debitamount: 0,
      creditamount: parseFloat(amount),
    };

    const ledgerData2 = {
      type: 'Discount',
      date: currentdate,
      particular: 'Payment Discount',
      debitamount: 0,
      creditamount: parseFloat(discount)
    };
    
    if (discount === null || discount === '0') {
      // If discount is null or 0, push only one ledger entry
      await set(ref(db, `Subscriber/${userid}/ledger/${paymentkey}`), ledgerData);
    } else {
      // If discount has a value other than null or 0, push both ledger entries
      await set(ref(db, `Subscriber/${userid}/ledger/${paymentkey}`), ledgerData);
      await set(ref(db, `Subscriber/${userid}/ledger/${newLedgerKey2}`), ledgerData2);
    }
    
    

    toast.success('Payment Collected!', {
      autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
    });

    navigate(-1);
    
  };

  useEffect(() => {
    const fetchbillingperiod = async () => {
      const billingSnap = await get(billingRef);

      if (billingSnap.exists()) {
        const billingPeriodArray = [];
        billingSnap.forEach((Childbilling) => {
          const activationDate = Childbilling.val().activationDate;
          const expiryDate = Childbilling.val().expiryDate;
          billingPeriodArray.push({ activationDate, expiryDate });
        });
        setBillingArray(billingPeriodArray);
      } else {
        console.log('Data Not Found');
      }
    };

    const fetchemp = async () => {
      const empSnap = await get(ref(db, `users`));
      if (empSnap.exists()) {
        const employeeArray = [];
        empSnap.forEach((Childemp) => {
          const empName = Childemp.val().fullname;
          employeeArray.push(empName);
        });
        setEmpArray(employeeArray);
      } else {
        console.log('Emp Data Not Found!');
      }
    };

    fetchbillingperiod();
    fetchemp();
  }, [userid]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '1',
          margin: '20px',
          border: '1px solid green',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px green',
        }}
      >
        <ToastContainer/>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-1">
            <label htmlFor="inputEmail4" className="form-label">
              Receipt No.
            </label>
            <input type="email" className="form-control" id="inputEmail4" value="Auto" readOnly />
          </div>
          <div className="col-md-2">
            <label htmlFor="inputPassword4" className="form-label">
              Billing Period
            </label>
            <select onChange={(e) => setBillingPeriod(e.target.value)} className="form-select">
              <option value="">Choose...</option>
              {arrayblling.length > 0 ? (
                arrayblling.map(({ activationDate, expiryDate }, index) => (
                  <option key={index} value={`${activationDate} to ${expiryDate}`}>
                    {`${activationDate} to ${expiryDate}`}
                  </option>
                ))
              ) : (
                <option value="">No Bill Found!</option>
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
            <select onChange={(e) => setPaymentMode(e.target.value)} className="form-select">
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

          {(paymentMode === 'Cheque' || paymentMode === 'NEFT') && (
            <div className="col-md-3">
              <label className="form-label">Bank Name</label>
              <input onChange={(e) => setBankName(e.target.value)} type="text" className="form-control" />
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
            <select onChange={(e) => setCollectedBy(e.target.value)} className="form-select">
              <option value="">Choose...</option>
              {arrayemp.length > 0 ? (
                arrayemp.map((empName, index) => (
                  <option key={index} value={empName}>
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
              type="number"
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
            <button type="submit" className="btn btn-outline-success" disabled={isdisabled}>
              Collect Amount
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
