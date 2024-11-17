import { get, ref, onValue, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { db } from '../../FirebaseConfig';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap components
import { jsPDF } from "jspdf"; // Import jsPDF
import autoTable from 'jspdf-autotable';

export default function PaymetTable() {
  const location = useLocation();
  const {userid} = location.state || {};
  const [arraypayment, setArrayPayment] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null); // State to hold selected payment
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [userData, setUserData] = useState([]);
  const [customerData, setCustomerData] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [userMap, setUserMap] = useState({}); // State to hold user keys and full names
  const [showOptionsModal, setShowOptionsModal] = useState(false); // State to control options modal
  const [currentPayment, setCurrentPayment] = useState(null); // State to hold the current payment for options

  const paymentsRef = ref(db, `Subscriber/${userid}/payments`);

  useEffect(() => {
    const fetchpayments = async () => {
      const userRef = ref(db, `users`);
      const customerRef = ref(db, `Subscriber/${userid}`);
      const companyRef = ref(db, `Master/companys`);
      const userMap = {}; // Create a hashmap for user keys and full names

      onValue(userRef, (snapshot) => {
        const userData = [];
        snapshot.forEach(user => {
          const userKey = user.key;
          const fullname = user.val().fullname;
          userData.push({ userKey, fullname });
          userMap[userKey] = fullname;
          setUserMap(userMap); // Populate the hashmap
        });
        setUserData(userData);
      });

      const customerSnap = await get(customerRef);
      if(customerSnap.exists()){
        const customerData = customerSnap.val();
        setCustomerData(customerData);


        
      }

      const companySnap = await get(companyRef);
      if(companySnap.exists()){
        companySnap.forEach(company => {
          const companyData = company.val();
          
          if(companyData.companycode === 'global'){
            setCompanyData(companyData);
          }
        });

        
        
        

       
      }

      const paymentSnap = await get(paymentsRef);
      if(paymentSnap.exists()){
        const paymentsArray = [];
        paymentSnap.forEach(Childpayment => {
          const source = Childpayment.val().source;
          const receiptNo = Childpayment.val().receiptNo;
          const receiptDate = Childpayment.val().receiptDate;
          const paymentMode = Childpayment.val().paymentMode;
          const bankname = Childpayment.val().bankname;
          const amount = Childpayment.val().amount;
          const discount = Childpayment.val().discount;
          const collectedBy = Childpayment.val().collectedBy;
          const modifiedBy = Childpayment.val().modifiedBy;
          const transactionNo = Childpayment.val().transactionNo;
          const narration = Childpayment.val().narration;
          const discountkey = Childpayment.val().discountkey;
          const billing = Childpayment.val().billingPeriod;
          
          paymentsArray.push({source, receiptNo, receiptDate, paymentMode, bankname ,amount, discount, collectedBy, modifiedBy, transactionNo, narration, discountkey, billing})
          
        });
        setArrayPayment(paymentsArray);
      }
    }

    return () => fetchpayments();
  }, [userid]);

  

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedPayment(null); // Clear selected payment
  };

  const updatePayment = async (updatedPayment) => {
    let dueAmount = parseInt(customerData.connectionDetails.dueAmount);
    const payment = arraypayment.find(payment => payment.receiptNo === updatedPayment.receiptNo).amount;
    const discount = arraypayment.find(payment => payment.receiptNo === updatedPayment.receiptNo).discount;

    console.log(discount);


    if(parseInt(updatedPayment.amount) !== parseInt(payment)){
      dueAmount = parseInt(payment) - (parseInt(updatedPayment.amount) + parseInt(updatedPayment.discount));
    }else{
      
      return;
    }

    if(parseInt(updatedPayment.discount) !== parseInt(discount)){
      dueAmount = parseInt(payment) - parseInt(updatedPayment.discount);
    }else{
      return;
    }

    
    const paymentkey = updatedPayment.receiptNo.slice(4, 17);

    
    const paymentData = {
      source: updatedPayment.source,
      receiptDate: updatedPayment.receiptDate,
      paymentMode: updatedPayment.paymentMode,
      bankname: updatedPayment.bankname,
      amount: updatedPayment.amount,
      discount: updatedPayment.discount,
      modifiedBy: localStorage.getItem('Name'),
    }

    const ledgerData = {
      date: updatedPayment.receiptDate,
      debitamount: 0,
      creditamount: updatedPayment.amount,
    }

    await update(ref(db, `Subscriber/${userid}/payments/${paymentkey}`), paymentData);
    await update(ref(db, `Subscriber/${userid}/ledger/${paymentkey}`), ledgerData);
    await update(ref(db, `Subscriber/${userid}/connectionDetails`), {dueAmount});

    alert('Payment Updated Successfully!');
  };

  const handleRightClickReceiptNo = (payment) => {
    setCurrentPayment(payment); // Set the current payment
    setShowOptionsModal(true); // Open the options modal
  };

  const handleEdit = () => {
    setSelectedPayment(currentPayment); // Set the selected payment for editing
    setIsModalOpen(true); // Open the edit modal
    setShowOptionsModal(false); // Close the options modal
  };

  const handleDownloadInvoice = () => {
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
            content: `Reference : #INV${currentPayment.receiptNo.slice(10, 13)}` + '\nDate: ' + currentPayment.receiptDate,
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
            content: 'Billed to:' + '\nCustomer Name: ' + customerData.fullName + '\nAddress: ' + customerData.installationAddress + '\nMobile No: ' + customerData.mobileNo,
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
            content:  currentPayment.amount + '.00 Rs',
            styles: {
              halign: 'right',
              fontSize: 15,
              textColor: '#3366ff',
            }
          }
        ],

        [
          {
            content: 'Payment Mode: ' + currentPayment.paymentMode,
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
        ['1', `${customerData.connectionDetails.planName}`, `${currentPayment.billing}`, `${parseInt(currentPayment.amount) + parseInt(currentPayment.discount)}`, `${currentPayment.discount}`, `${currentPayment.amount}`]
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
            content: 'Total Amount: ' + currentPayment.amount + '.00 Rs',
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

    doc.save(`${currentPayment.receiptNo}.pdf`);


  };

  const handleShareInvoice = () => {
    // Logic to share the invoice
    
    setShowOptionsModal(false); // Close the options modal
  };

  return (
    <div>
      {/* Options Modal for Receipt No actions */}
      <Modal show={showOptionsModal} onHide={() => setShowOptionsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Options for Receipt No: {currentPayment?.receiptNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button className='mb-2 ms-2' variant="primary" onClick={handleDownloadInvoice}>
            Download Invoice
          </Button>
          <Button className='mb-2 ms-2' variant="secondary" onClick={handleShareInvoice}>
            Share Invoice
          </Button>
          <Button className='mb-2 ms-2' variant="warning" onClick={handleEdit}>
            Edit Payment
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOptionsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for editing payment */}
      <Modal show={isModalOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <div>
              <div className="mb-3">
                <label className="form-label">Amount:</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={selectedPayment.amount} 
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, amount: e.target.value })} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Discount:</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={selectedPayment.discount} 
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, discount: e.target.value })} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Collected By:</label>
                <select 
                  className="form-control" 
                  defaultValue={userData.find(user => user.userKey === selectedPayment.collectedBy)?.fullname || ''}
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, collectedBy: e.target.value })} 
                >
                  {userData.map((user) => (
                    <option key={user.userKey} value={user.userKey}>
                      {user.fullname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Mode</label>
                <select onChange={(e) => setSelectedPayment({ ...selectedPayment, paymentMode: e.target.value })} className="form-select">
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
                <label className="form-label">Transaction No:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={selectedPayment.transactionNo} 
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, transactionNo: e.target.value })} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Receipt Date:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={selectedPayment.receiptDate} 
                  onChange={(e) => setSelectedPayment({ ...selectedPayment, receiptDate: e.target.value })} 
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => { updatePayment(selectedPayment); closeModal(); }}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: 'max-content' }} className="table">
          <thead>
            <tr>
              <th style={{width:'60px'}} scope="col">S. No.</th>
              <th style={{width:'120px'}} scope="col">Source</th>
              <th style={{width:'180px'}} scope="col">Receipt No.</th>
              <th style={{width:'120px'}} scope="col">Receipt Date</th>
              <th style={{width:'100px'}} scope="col">Amount</th>
              <th style={{width:'100px'}} scope="col">Discount</th>
              <th style={{width:'180px'}} scope="col">Payment Mode</th>
              <th style={{width:'150px'}} scope="col">Cheque or Transaction No.</th>
              <th style={{width:'150px'}} scope="col">Bank Name</th>
              <th style={{width:'150px'}} scope="col">Collected By</th>
              <th style={{width:'150px'}} scope="col">Modified By</th>
              <th style={{width:'150px'}} scope="col">Narration</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arraypayment.length > 0 ? (
              arraypayment.slice().reverse().map((payment, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{payment.source}</td>
                  <td className='text-success' onContextMenu={(e) => { e.preventDefault(); handleRightClickReceiptNo(payment); }}>
                    {payment.receiptNo}
                  </td>
                  <td>{payment.receiptDate}</td>
                  <td style={{ color: 'blue' }}>{payment.amount}</td>
                  <td style={{ color: 'green' }}>{payment.discount}</td>
                  <td>{payment.paymentMode}</td>
                  <td>{payment.transactionNo}</td>
                  <td>{payment.bankname}</td>
                  <td>{userMap[payment.collectedBy] || payment.collectedBy}</td>
                  <td>{payment.modifiedBy}</td>
                  <td>{payment.narration}</td>
                </tr>
              ))
            ) : (
              <td colSpan="8" style={{ textAlign: 'center' }}>No Payment data found</td>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
