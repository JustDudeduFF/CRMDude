import { get, ref, set, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from 'jspdf-autotable';


export default function ReceiptModify() {
  const userid = localStorage.getItem('susbsUserid');
  const subsemail = localStorage.getItem('subsemail');
  const contact = localStorage.getItem('subscontact');
  const name = localStorage.getItem('subsname');
  const address = localStorage.getItem('subsaddress');
  const planname = localStorage.getItem('subsplan');

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
  const [companyData, setCompanyData] = useState({});

  const [isdisabled, setIsDisabled] = useState(false);

  const paymentkey = Date.now();
  



  const billingRef = ref(db, `Subscriber/${userid}/planinfo`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
  
    try {
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
        discountkey: newLedgerKey2,
        authorized: false
      };

      const handleDownloadInvoice = async() => {
        const doc = new jsPDF();
    
        autoTable(doc, {
          body: [
            [
              {
                content: companyData.companyname,
                styles: {
                  halign: 'left',
                  fontSize: 20,
                  textColor: '#ffffff',
                }
              },
              {
                content: 'Invoice',
                styles: {
                  halign: 'right',
                  fontSize: 20,
                  fontWeight: 'bold',
                  textColor: '#ffffff',
                }
              }
            ],
          ],
          theme: 'plain',
          styles: {
            fillColor: '#3366ff',
          }
        });
    
    
        autoTable(doc, {
          body: [
            [
              {
                content: `Reference : #INV${receiptData.receiptNo.slice(10, 13)}` + '\nDate: ' + receiptData.receiptDate,
                styles: {
                  halign: 'right',
                  
                }
              }
            ],
          ],
          theme: 'plain',
          
        });
    
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Billed to:' + '\nCustomer Name: ' + name + '\nAddress: ' + address + '\nMobile No: ' + contact,
                styles: {
                  halign: 'left',
                }
              },
              {
                content: 'From:' + '\n' + companyData.companyname + '\n' + companyData.companyaddress + '\nMobile No: ' + companyData.companymobile,
                styles: {
                  halign: 'right',
                }
              }
            ],
          ],
          theme: 'plain',
          
        });
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Amount Paid: ',
                styles: {
                  fontSize: 18,
                  halign: 'right',
                }
              }
            ],
    
            [
              {
                content:  receiptData.amount + '.00 Rs',
                styles: {
                  halign: 'right',
                  fontSize: 15,
                  textColor: '#3366ff',
                }
              }
            ],
    
            [
              {
                content: 'Payment Mode: ' + receiptData.paymentMode,
                styles: {
                  halign: 'right',
                }
              }
            ]
          ],
          theme: 'plain',
          
        });
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Products and Services',
                styles: {
                  halign: 'left',
                  fontSize: 14,
                }
              }
            ]
          ],
          theme: 'plain',
          
        });
    
    
        autoTable(doc, {
          head: [
            ['S. No.', '', 'Quantity', 'Rate', 'Discount', 'Amount']
          ],
          body: [
            ['1', `${planname}`, `${receiptData.billing}`, `${parseInt(receiptData.amount) + parseInt(receiptData.discount)}`, `${receiptData.discount}`, `${receiptData.amount}`]
          ],
          theme: 'striped',
          headStyles: {
            fillColor: '#343a40',
          }
        });
    
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Total Amount: ' + receiptData.amount + '.00 Rs',
              styles: {
                  halign: 'right',
                  fontSize: 14,
                }
              }
            ]
          ],
          theme: 'plain',
        });
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Thank you for your business!' + '\n' + 'For any queries, please contact us at ' + companyData.companymobile + '\n' + 'This is an auto generated invoice and does not require any signature.',
                styles: {
                  halign: 'center',
                  fontSize: 12,
                }
              }
            ]
          ],
          theme: 'plain',
        });
    
        autoTable(doc, {
          body: [
            [
              {
                content: 'Powered by: CRMDude',
                styles: {
                  halign: 'left',
                  fontSize: 12,
                }
              }
            ]
          ],
          theme: 'plain',
        });
    
        const pdfBlob = doc.output('blob');

        const mailData = new FormData();
        mailData.append('pdf', pdfBlob, `${receiptData.receiptDate}.pdf`);
        mailData.append('to', 'justdudehere@gmail.com');
        mailData.append('subject', 'Payment Status And Invoice');
        mailData.append('text', `Dear ${name}, \nYour Payment has been done for receipt period ${receiptData.billingPeriod}.\n\nPayment Mode: ${receiptData.paymentMode}\n\nReceipt Date: ${receiptData.receiptDate}\n\nReceipt No.: ${receiptData.receiptNo}\n\nThank you for your business.\nRegards,\nSigma Business Solutions`)
    
        try{
          const response = await axios.post(api+'/send-invoice', mailData);
          if(response.ok){
            console.log('Invoice Sent Succesfully');
          }else{
            console.log('Failed to Send Invoice');
          }
        }catch(error){
          console.log('Error to Send Mail: '+ error);
        }
    
      };

  
      const dueRef = ref(db, `Subscriber/${userid}/connectionDetails`);
      const dueSnap = await get(dueRef);
  
      if (!dueSnap.exists() || dueSnap.val().dueAmount === undefined) {
        console.error('dueAmount does not exist');
        toast.error('dueAmount does not exist');
        setIsDisabled(false); // Re-enable button if an error occurs
        return;
      }
  
      const dueAmount = parseInt(dueSnap.val().dueAmount);
      const newDue = {
        dueAmount: dueAmount - (parseInt(amount) + parseInt(discount)),
      };

      const newDueAmount = dueAmount - (parseInt(amount) + parseInt(discount));


    const sendWhatsapp = async () => {
      const newMessage = `Dear ${name},\n\n💸 **Payment Confirmation** 💸\n\nWe have successfully received your payment. Here are the details:\n\n🔹 **Amount Paid**: ₹${amount}\n🔹 **Payment Mode**: ${receiptData.paymentMode}\n🔹 **Payment Date**: ${new Date(receiptData.receiptDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'})}\n🔹 **Current Due**: ₹${newDueAmount}\n\nIf you have any questions or need further assistance, please contact our support team.\n\n📞 **Support**: +91 99991 18971\n\nThank you for choosing **Sigma Business Solutions**!\n\nBest regards,\n**Sigma Business Solutions** Team`
      const encodedMessage = encodeURIComponent(newMessage);

      const response = await axios.post(api+`/send-message?number=91${contact}&message=${encodedMessage}`);
      console.log(response.data.status);
  }
  
      await set(ref(db, `Subscriber/${userid}/payments/${paymentkey}`), receiptData);
      await update(dueRef, newDue).then(() => {
        handleDownloadInvoice();
        sendWhatsapp();
      });
  
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
        creditamount: parseFloat(discount),
      };
  
      if (parseFloat(discount) === 0 || discount === null) {
        await set(ref(db, `Subscriber/${userid}/ledger/${paymentkey}`), ledgerData);
      } else {
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
    } catch (error) {
      console.error('Error during form submission:', error);
      toast.error('An error occurred during submission.');
    } finally {
      setIsDisabled(false);
    }
  };
  

  useEffect(() => {
    const companyRef = ref(db, `Master/companys`);
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
          const empName = Childemp.val().FULLNAME;
          const empId = Childemp.key;
          employeeArray.push({empName, empId});
        });
        setEmpArray(employeeArray);
      } else {
        console.log('Emp Data Not Found!');
      }
    };

    const fetchCompany = async () => {
      const companySnap = await get(companyRef);
      if(companySnap.exists()){
        companySnap.forEach(company => {
          const companyData = company.val();
          
          if(companyData.companycode === 'global'){
            setCompanyData(companyData);

          }
        });
      }
    }

    fetchbillingperiod();
    fetchCompany();
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
                arrayemp.map(({empName, empId}, index) => (
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
