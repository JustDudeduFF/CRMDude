import { get, ref, onValue, update } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { db } from '../../FirebaseConfig';
import { Modal, Button } from 'react-bootstrap'; // Import Bootstrap components
import { jsPDF } from "jspdf"; 
import autoTable from 'jspdf-autotable';
import { usePermissions } from '../PermissionProvider';

export default function PaymetTable() {
  const location = useLocation();
  const {hasPermission} = usePermissions();
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

  

  useEffect(() => {
    const paymentsRef = ref(db, `Subscriber/${userid}/payments`);
    const fetchpayments = async () => {
      const userRef = ref(db, `users`);
      const customerRef = ref(db, `Subscriber/${userid}`);
      const companyRef = ref(db, `Master/companys`);
      const userMap = {}; // Create a hashmap for user keys and full names

      onValue(userRef, (snapshot) => {
        const userData = [];
        snapshot.forEach(user => {
          const userKey = user.key;
          const fullname = user.val().FULLNAME;
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
      if (paymentSnap.exists()) {
        const paymentsArray = [];
        paymentSnap.forEach((child) => {
          const payment = child.val();
          paymentsArray.push({
            ...payment,
            amount: parseFloat(payment.amount) || 0,
            discount: parseFloat(payment.discount) || 0,
          });
        });
        setArrayPayment(paymentsArray);
      }
    }

    fetchpayments();
  }, [userid]);

  

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedPayment(null); // Clear selected payment
  };

  const updatePayment = async (updatedPayment) => {
    try {
      // Ensure values are parsed properly and prevent NaN
      const currentdueAmount = parseInt(customerData.connectionDetails.dueAmount, 10);
      let dueAmount = parseInt(customerData.connectionDetails.dueAmount, 10);
      console.log(dueAmount);
      const payment = arraypayment.find(payment => payment.receiptNo === updatedPayment.receiptNo);
      
      if (!payment) {
        alert('Payment not found!');
        return;
      }
  
      const { amount: currentAmount, discount: currentDiscount, discountkey: discountKey } = payment;
      const { amount: updatedAmount, discount: updatedDiscount } = updatedPayment;

      console.log(`currentAmount: ${currentAmount}`);
      console.log(`currentDiscount: ${currentDiscount}`);
  
      // Check if the payment amount or discount has changed
      if (updatedAmount !== currentAmount || updatedDiscount !== currentDiscount) {
        // Recalculate the due amount
        dueAmount = ((parseInt(currentAmount, 10) + parseInt(currentDiscount, 10)) 
                    - (parseInt(updatedAmount, 10) + parseInt(updatedDiscount, 10)) + parseInt(currentdueAmount));
      } else {
        // If no changes to the amount or discount, exit early
        return;
      }
  
      // Extract payment key from receipt number
      const paymentKey = updatedPayment.receiptNo.slice(4, 17);
  
      // Prepare the updated payment data for Firebase
      const paymentData = {
        source: updatedPayment.source,
        receiptDate: updatedPayment.receiptDate,
        paymentMode: updatedPayment.paymentMode,
        bankname: updatedPayment.bankname,
        amount: updatedAmount,
        discount: updatedDiscount,
        modifiedBy: localStorage.getItem('Name'),
      };
  
      // Prepare the updated ledger data for Firebase
      const ledgerData = {
        date: updatedPayment.receiptDate,
        debitamount: 0,
        creditamount: updatedAmount,
      };

      const discountData = {
        date: updatedPayment.receiptDate,
        debitamount: 0,
        creditamount: updatedDiscount,
      };


  
      // Perform the updates in Firebase
      await update(ref(db, `Subscriber/${userid}/payments/${paymentKey}`), paymentData);
      await update(ref(db, `Subscriber/${userid}/ledger/${paymentKey}`), ledgerData);
      await update(ref(db, `Subscriber/${userid}/connectionDetails`), { dueAmount });

      if(discountKey){
        await update(ref(db, `Subscriber/${userid}/ledger/${discountKey}`), discountData);
      }
  
      alert('Payment Updated Successfully!');
    } catch (error) {
      console.error("Error updating payment:", error);
      alert('An error occurred while updating the payment.');
    }
  };
  

  const handleEdit = () => {
    if(currentPayment.authorized){
      alert(`That Receipt is authorized it could not be modified`)
      return;
    }
    if(hasPermission("EDIT_PAYMENT")){
      setSelectedPayment(currentPayment); // Set the selected payment for editing
      setIsModalOpen(true); // Open the edit modal
      setShowOptionsModal(false); // Close the options modal
    }else{
      alert("Permission Denied");
      setShowOptionsModal(false);
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
            content: 'Billed to:' + '\nCustomer Name: ' + customerData.fullName + '\nAddress: ' + customerData.installationAddress + '\nMobile No: ' + customerData.mobileNo + '\nEmail: ' +customerData.email,
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
        ['S. No.', 'Particular', 'Quantity', 'Rate', 'Discount', 'Amount']
      ],
      body: [
        ['1', `${customerData.connectionDetails.planName}`, `${currentPayment.billingPeriod}`, `${parseInt(currentPayment.amount) + parseInt(currentPayment.discount)}`, `${currentPayment.discount}`, `${currentPayment.amount}`]
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
          <Button className='mb-2 ms-2' variant="primary" onClick={() => {
            if(hasPermission("DOWNLOAD_INVOICE")){
              handleDownloadInvoice();
            }else{
              alert("Permission Denied")
            }
          }}>
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

      {/* Payment Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
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
            {arraypayment.length > 0 ? (
              arraypayment.map((payment, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{payment.source}</td>
                  <td
                    className="text-success"
                    onContextMenu={(e) => { e.preventDefault(); setCurrentPayment(payment); setShowOptionsModal(true); }}
                  >
                    {payment.receiptNo}
                  </td>
                  <td>{payment.receiptDate}</td>
                  <td>{payment.amount.toFixed(2)}</td>
                  <td>{payment.discount.toFixed(2)}</td>
                  <td>{payment.paymentMode}</td>
                  <td>{payment.bankname}</td>
                  <td>{userMap[payment.collectedBy] || 'N/A'}</td>
                  <td>{payment.modifiedBy}</td>
                  <td>{payment.narration || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center' }}>No payment data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
