import { onValue, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { db } from '../../FirebaseConfig';
import { Modal, Button } from 'react-bootstrap';


export default function PayrollandAttendence() {
    const [payoutArray, setPayoutArray] = useState([]);

    
    const [visiblePayout, setVisiblePayout] = useState(true);
    const [visibleAttendence, setVisibleAttendence] = useState(false);
    

    const [showAllowanceModal, setShowAllowanceModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [allowanceInput, setAllowanceInput] = useState({
      amount: '',
      description: ''
    });

    const [deductionInput, setDeductionInput] = useState({
      amount: '',
      description: ''
    });
    

    const newUsersMap = new Map();
    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    
    

    const [showDeductionDetailsModal, setShowDeductionDetailsModal] = useState(false);
    

    const [showPayoutDetailsModal, setShowPayoutDetailsModal] = useState(false);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);

    const [showAdvanceDetails, setShowAdvanceDetails] = useState(false);
    const [advanceDetails, setAdvanceDetails] = useState([]);


    const daysInMonth = (year, month) => {
      return new Date(year, month, 0).getDate();
    };

    const generateDays = () => {
      const days = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for(let i = 1; i <= daysInMonth(selectedYear, selectedMonth); i++){
        const date = new Date(selectedYear, selectedMonth - 1, i);
        const dayName = dayNames[date.getDay()];
        days.push(
          <th key={i}>
            <div className='ms-1'>{i}</div>
            <div style={{fontSize: '0.8em', color: dayName === 'Sun' ? 'red' : 'inherit'}}>
              {dayName}
            </div>
          </th>
        );
      }
      return days;
    };

    const handleContextMenu = (e, userId) => {
      e.preventDefault(); // Prevent default right-click menu
      setSelectedUserId(userId);
      setAllowanceInput({ amount: '', description: '' }); // Reset input
      setShowAllowanceModal(true);
    };

    const handleAllowanceSubmit = () => {
      if (selectedUserId) {
        const time = new Date().getTime();
        const allowanceRef = ref(db, `Payroll/Attendence/${selectedUserId}/${selectedYear}/${selectedMonth}/allowance/${time}`);
        
        if(allowanceInput.amount !== '' && allowanceInput.description !== ''){
          set(allowanceRef, {
            amount: Number(allowanceInput.amount) || 0,
            description: allowanceInput.description,
            type: allowanceInput.type,
            date: new Date().toLocaleDateString()
          });
        }
        setShowAllowanceModal(false);
        setSelectedUserId(null);
        setAllowanceInput({ amount: '', description: '' });

      }
    };

    const handleDeductionSubmit = () => {
      
      if(selectedUserId){
        const time = new Date().getTime();
        const deductionRef = ref(db, `Payroll/Attendence/${selectedUserId}/${selectedYear}/${selectedMonth}/deduction/${time}`);
        if(deductionInput.amount !== '' && deductionInput.description !== ''){
          set(deductionRef, {
            amount: Number(deductionInput.amount) || 0,
            description: deductionInput.description,
            type: deductionInput.type,
            date: new Date().toLocaleDateString()
          });
          
        }
      }

      setShowDeductionDetailsModal(false);
      setDeductionInput({ amount: '', description: '', type: '' });
      setSelectedUserId(null);
    };

    const handleDeductionBodyClick = (e, userId) => {
        e.preventDefault();
        setShowDeductionDetailsModal(true);
        setSelectedUserId(userId);
    };

    useEffect(() => {
      const PayoutRef = ref(db, 'Payroll/Attendence');
      const userRef = ref(db, 'users');
      const fetchData = async () => {
        onValue(userRef, (usersSnap) => {
          
          
          usersSnap.forEach(userSnap => {
            const userData = userSnap.val();
            
            
            // Calculate daily salary
            const monthlySalary = Number(userData.salary) || 0;
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            const dailySalary = monthlySalary / daysInMonth;

            

            newUsersMap.set(userSnap.key, {
              fullname: userData.FULLNAME,
              contact: userData.MOBILE,
              basicSalary: monthlySalary,
              dailySalary: dailySalary,
              userId: userSnap.key,
              presentDays: 0,
              amount: 0
            });
          });
          
          onValue(PayoutRef, attendenceSnap => {
            const attendenceArray = [];
            
            // Initialize array with user data
            newUsersMap.forEach((userData, userId) => {
              attendenceArray.push({
                ...userData
              });
            });

            // Count present days for each user
            attendenceSnap.forEach(childSnap => {
              const yearData = childSnap.child(String(selectedYear));
              const monthData = yearData.child(String(selectedMonth).padStart(2, '0'));
              
              let allowanceData = [];
              let attendenceAllData = [];
              
              let presentDays = 0;
              let allowanceAmount = 0;
              let totalPetrol = 0;
              let totalRapido = 0;
              let totalConveyance = 0;
              let totalOtherAllowances = 0;
              let deductionAmount = 0;
              
              
              monthData.forEach(dateSnap => {
                const attendanceData = dateSnap.val();
                attendenceAllData.push(monthData.val());
                if (attendanceData.status === 'Half Day') {
                  presentDays++;
                }else if(attendanceData.status === 'Present'){
                  presentDays++;
                }
              });

              const allowanceRef = ref(db, `Payroll/Attendence/${childSnap.key}/${selectedYear}/${selectedMonth}/allowance`);
              onValue(allowanceRef, allowanceSnap => {
                allowanceSnap.forEach(allowanceSnap => {
                  const allowance = allowanceSnap.val();
                  allowanceAmount += allowance.amount;
                  allowanceData.push(allowance);
                  
                  // Calculate totals based on type
                  switch (allowance.type) {
                    case 'Petrol':
                      totalPetrol += Number(allowance.amount);
                      break;
                    case 'Rapido':
                      totalRapido += Number(allowance.amount);
                      break;
                    case 'Conveyance':
                      totalConveyance += Number(allowance.amount);
                      break;
                    case 'Other':
                      totalOtherAllowances += Number(allowance.amount);
                      break;
                  }
                });
              });

              const deductionRef = ref(db, `Payroll/Attendence/${childSnap.key}/${selectedYear}/${selectedMonth}/deduction`);
              let deductionData = [];
              // Initialize counters for each deduction type
              let totalAdvance = 0;
              let totalWifi = 0;
              let totalMobileRecharge = 0;
              let totalOtherDeductions = 0;

              onValue(deductionRef, deductionSnap => {
                deductionSnap.forEach(deductionSnap => {
                  const deduction = deductionSnap.val();
                  deductionAmount += deduction.amount;
                  deductionData.push(deduction);
                  
                  // Calculate totals based on type
                  switch (deduction.type) {
                    case 'Advance':
                      totalAdvance += Number(deduction.amount);
                      break;
                    case 'Wifi':
                      totalWifi += Number(deduction.amount);
                      break;
                    case 'Mobile Recharge':
                      totalMobileRecharge += Number(deduction.amount);
                      break;
                    case 'Other':
                      totalOtherDeductions += Number(deduction.amount);
                      break;
                  }
                });
              });


              const userKey = childSnap.key;
              const userIndex = attendenceArray.findIndex(item => item.userId === userKey);
              
              if (userIndex !== -1) {
                const userData = attendenceArray[userIndex];
                const calculatedAmount = presentDays * userData.dailySalary;

                
                

                attendenceArray[userIndex] = {
                  ...userData,
                  presentDays: presentDays,
                  amount: calculatedAmount,
                  allowanceAmount: allowanceAmount || 0,
                  allowanceTotals: {
                    petrol: totalPetrol,
                    rapido: totalRapido,
                    conveyance: totalConveyance,
                    other: totalOtherAllowances
                  },
                  deductionAmount: deductionAmount || 0,
                  deductionTotals: {
                    advance: totalAdvance,
                    wifi: totalWifi,
                    mobileRecharge: totalMobileRecharge,
                    other: totalOtherDeductions
                  },

                  deductionAllData: deductionData,
                  allowanceAllData: allowanceData,
                  attendenceAllData: attendenceAllData
                };
              }
            });

            setPayoutArray(attendenceArray);
          });
        });
      };

      fetchData();
    }, [selectedYear, selectedMonth]);

  return (
    <div style={{marginTop:'4.5%'}}>
      <h2>Payroll and Attendence</h2>
      <div style={{paddingRight:'20px', paddingLeft:'20px'}}>
        <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
            <div onClick={() => {setVisiblePayout(true); setVisibleAttendence(false);}} style={{borderRadius: '5px', border: '1px solid gray', flex:'1', marginRight:'10px', cursor:'pointer', backgroundColor: visiblePayout ? 'skyblue' : 'white', transition: 'background-color 0.2s ease', boxShadow: visiblePayout ? '0 0 10px 0 skyblue' : 'none'}}>
                <h3 style={{marginLeft: '10px', justifyContent:'center', display:'flex', alignItems:'center', height:'100%'}}>Payout</h3>
            </div>
            <div onClick={() => {setVisibleAttendence(true); setVisiblePayout(false);}} style={{borderRadius: '5px', border: '1px solid gray', flex:'1', marginLeft:'10px', cursor:'pointer', backgroundColor: visibleAttendence ? 'skyblue' : 'white', transition: 'background-color 0.2s ease', boxShadow: visibleAttendence ? '0 0 10px 0 blue' : 'none'}}>
                <h3 style={{marginLeft: '10px', justifyContent:'center', display:'flex', alignItems:'center', height:'100%'}}>Attendence</h3>
            </div>
        </div>
        

        {visiblePayout && 
        <div>
          <div className='d-flex flex-row'>
          <div className='col-md-3'>
            <label className='form-label'>Yearly</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className='form-select'>
              <option value='2024'>2024</option>
              <option value='2023'>2023</option>
              <option value='2022'>2022</option>
              <option value='2021'>2021</option>
            </select>
          </div>
          <div className='col-md-3 ms-3'>
            <label className='form-label'>Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className='form-select'>
              <option value='1'>January</option>
              <option value='2'>February</option>
              <option value='3'>March</option>
              <option value='4'>April</option>
              <option value='5'>May</option>
              <option value='6'>June</option>
              <option value='7'>July</option>
              <option value='8'>August</option>
              <option value='9'>September</option>
              <option value='10'>October</option>
              <option value='11'>November</option>
              <option value='12'>December</option>
            </select>
          </div>

          <div style={{flex:1}} className='col-md-3 mt-4 d-flex justify-content-end'>
            <button className='btn btn-outline-primary'>Generate Payroll</button>
          </div>
        </div>
        <table className='table mt-3'>
            <thead className='table-primary'>
                <tr>
                    <th>S. No.</th>
                    <th>Full Name</th>
                    <th>Basic Salary</th>
                    <th>Allowance</th>
                    <th>Deduction</th>
                    <th>Amount</th>
                    <th>Actual Payout</th>
                    <th>Status</th>
                    <th>Action</th>
                    
                </tr>   
            </thead>
            <tbody>
              {payoutArray.map((item, index) => (
                <tr key={item.userId}>
                  <td>{index + 1}</td>
                  <td>{item.fullname}</td>
                  <td>{item.basicSalary}</td>
                  <td 
                    onContextMenu={(e) => handleContextMenu(e, item.userId)}
                    style={{ cursor: 'context-menu' }}
                  >
                    {item.allowanceAmount}
                  </td>
                  <td 
                    onContextMenu={(e) => handleDeductionBodyClick(e, item.userId)}
                    style={{ cursor: 'context-menu' }}
                  >
                    {item.deductionAmount}
                  </td>
                  <td>{item.amount.toFixed(2)}</td>
                  <td>
                    {(item.amount + item.allowanceAmount - item.deductionAmount).toFixed(2)}
                  </td>
                  <td>
                    {item.status}
                  </td>
                  <td>
                    <button className='btn btn-outline-primary'>Release</button>
                    <button
                        type="button"
                        className="btn btn-info ms-4"
                        onClick={() => {
                          
                            setSelectedUserDetails(item);
                            setShowPayoutDetailsModal(true);
                        }}
                    >
                        Info
                    </button>
                    <button className='btn btn-warning ms-4'>Pay</button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
        </table>
        </div>
        }
        {visibleAttendence && <div>
          <div className='row'>
            <div className='col-md-3'>
              <label className='form-label'>Yearly</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className='form-select'>
                <option value='2024'>2024</option>
                <option value='2023'>2023</option>
                <option value='2022'>2022</option>
                <option value='2021'>2021</option>
              </select>
            </div>

            <div className='col-md-3'>
              <label className='form-label'>Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className='form-select'>
                <option value='1'>January</option>
                <option value='2'>February</option>
                <option value='3'>March</option>
                <option value='4'>April</option>
                <option value='5'>May</option>
                <option value='6'>June</option>
                <option value='7'>July</option>
                <option value='8'>August</option>
                <option value='9'>September</option>
                <option value='10'>October</option>
                <option value='11'>November</option>
                <option value='12'>December</option>
              </select>
            </div>  
            <div className='col-md-3 mt-4 d-flex justify-content-end'>
              <button className='btn btn-outline-primary'>Generate Attendence</button>
            </div>
          </div>
          <table className='table mt-3'>
            <thead className='table-primary'>
              <tr>
                <th>S. No.</th>
                <th>Full Name</th>
                
                
                {generateDays()}
                
              </tr>
            </thead>
            <tbody>
              {payoutArray.map((item, index) => (
                <tr key={item.userId}>
                  <td>{index + 1}</td>
                  <td>{item.fullname}</td>
                  {Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, '0');
                    
                    // Find the attendance data for this day
                    const dayData = item.attendenceAllData?.[0]?.[day];
                    
                    let displayText = '';
                    let bgColor = '';
                    
                    if (dayData?.status === 'Present') {
                      displayText = 'P';
                      bgColor = '#d4edda';  // light green
                    } else if (dayData?.status === 'Half Day') {
                      displayText = 'H';
                      bgColor = '#fff3cd';  // light yellow
                    } else {
                      displayText = 'A';
                      bgColor = '#f8d7da';  // light red
                    }

                    return (
                      <td key={day} style={{ backgroundColor: bgColor, textAlign: 'center' }}>
                        {displayText}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>}
      </div>
      {/* Allowance Modal */}
      <Modal show={showAllowanceModal} onHide={() => setShowAllowanceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Allowance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='mb-3'>
            <label className='form-label'>Type</label>
            <select value={allowanceInput.type} onChange={(e) => setAllowanceInput(prev => ({
              ...prev,
              type: e.target.value
            }))} className='form-select'>
              <option value=''>Select Type</option>
              <option value='Petrol'>Petrol</option>
              <option value='Rapido'>Rapido</option>
              <option value='Conveyance'>Conveyance</option>
              <option value='Other'>Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              value={allowanceInput.amount}
              onChange={(e) => setAllowanceInput(prev => ({
                ...prev,
                amount: e.target.value
              }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              value={allowanceInput.description}
              onChange={(e) => setAllowanceInput(prev => ({
                ...prev,
                description: e.target.value
              }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAllowanceModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAllowanceSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <div
        className="modal fade show"
        id="deductionDetailsModal"
        style={{ display: showDeductionDetailsModal ? 'block' : 'none' }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Deduction Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeductionDetailsModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className='mb-3'>
                <label className='form-label'>Amount</label>
                <input value={deductionInput.amount} onChange={(e) => setDeductionInput(prev => ({
                  ...prev,
                  amount: e.target.value
                }))} type='number' className='form-control'/>
              </div>
              <div className='mb-3'>
                <label className='form-label'>Type</label>
                <select value={deductionInput.type} onChange={(e) => setDeductionInput(prev => ({
                  ...prev,
                  type: e.target.value
                }))} className='form-select'>
                  <option value=''>Select Type</option>
                  <option value='Advance'>Advance</option>
                  <option value='Wifi'>Wifi</option>
                  <option value='Mobile Recharge'>Mobile Recharge</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
              <div className='mb-3'>
                <label className='form-label'>Description</label>
                <input value={deductionInput.description} onChange={(e) => setDeductionInput(prev => ({
                  ...prev,
                  description: e.target.value
                }))} type='text' className='form-control'/>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeductionDetailsModal(false)}
              >
                Close
              </button>
              <button onClick={handleDeductionSubmit} className='btn btn-primary'>Save Changes</button>
            </div>
          </div>
        </div>
        
      </div>
      <div
        className="modal fade show"
        style={{ display: showPayoutDetailsModal ? 'block' : 'none' }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
                <div className="modal-header bg-info text-white">
                    <h5 className="modal-title">
                        Payout Details - {selectedUserDetails?.fullname}
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowPayoutDetailsModal(false)}
                    ></button>
                </div>
                <div className="modal-body">
                    {selectedUserDetails && (
                        <div className="container">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card mb-3">
                                        <div className="card-header bg-primary text-white">
                                            <h6 className="mb-0">Basic Details</h6>
                                        </div>
                                        <div className="card-body">
                                            <p><strong>Name:</strong> {selectedUserDetails.fullname}</p>
                                            <p><strong>Basic Salary:</strong> ₹{selectedUserDetails.basicSalary}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="card mb-3">
                                        <div className="card-header bg-success text-white">
                                            <h6 className="mb-0">Allowances</h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td>Petrol <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const PetrolList = selectedUserDetails?.allowanceAllData?.filter(
                                                                        item => item.type === 'Petrol'
                                                                    ) || [];

                                                                    
                                                                    setAdvanceDetails(PetrolList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.allowanceTotals?.petrol || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Rapido <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const RapidoList = selectedUserDetails?.allowanceAllData?.filter(
                                                                        item => item.type === 'Rapido'
                                                                    ) || [];
                                                                    setAdvanceDetails(RapidoList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.allowanceTotals?.rapido || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Conveyance <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const ConveyanceList = selectedUserDetails?.allowanceAllData?.filter(
                                                                        item => item.type === 'Conveyance'
                                                                    ) || [];
                                                                    setAdvanceDetails(ConveyanceList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.allowanceTotals?.conveyance || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Other <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const OtherList = selectedUserDetails?.allowanceAllData?.filter(
                                                                        item => item.type === 'Other'
                                                                    ) || [];
                                                                    setAdvanceDetails(OtherList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.allowanceTotals?.other || 0}</td>
                                                    </tr>
                                                    <tr className="table-success">
                                                        <td><strong>Total Allowances</strong></td>
                                                        <td><strong>₹{selectedUserDetails?.allowanceAmount || 0}</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card mb-3">
                                        <div className="card-header bg-danger text-white">
                                            <h6 className="mb-0">Deductions</h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td>
                                                            Advance 
                                                            <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    // Filter only advance type deductions
                                                                    const advanceList = selectedUserDetails?.deductionAllData?.filter(
                                                                        item => item.type === 'Advance'
                                                                    ) || [];
                                                                    setAdvanceDetails(advanceList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i>
                                                        </td>
                                                        <td>₹{selectedUserDetails?.deductionTotals?.advance || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Wifi <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    // Filter only advance type deductions
                                                                    const WifiList = selectedUserDetails?.deductionAllData?.filter(
                                                                        item => item.type === 'Wifi'
                                                                    ) || [];
                                                                    setAdvanceDetails(WifiList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.deductionTotals?.wifi || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Mobile Recharge <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const MobileRechargeList = selectedUserDetails?.deductionAllData?.filter(
                                                                        item => item.type === 'Mobile Recharge'
                                                                    ) || [];
                                                                    setAdvanceDetails(MobileRechargeList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.deductionTotals?.mobileRecharge || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Other <i 
                                                                className="ms-2 text-primary" 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    const OtherList = selectedUserDetails?.deductionAllData?.filter(
                                                                        item => item.type === 'Other'
                                                                    ) || [];
                                                                    setAdvanceDetails(OtherList);
                                                                    setShowAdvanceDetails(true);
                                                                }}
                                                            >{"?"}</i></td>
                                                        <td>₹{selectedUserDetails?.deductionTotals?.other || 0}</td>
                                                    </tr>
                                                    <tr className="table-danger">
                                                        <td><strong>Total Deductions</strong></td>
                                                        <td><strong>₹{selectedUserDetails?.deductionAmount || 0}</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card mb-3">
                                        <div className="card-header bg-dark text-white">
                                            <h6 className="mb-0">Net Payout Summary</h6>
                                        </div>
                                        <div className="card-body">
                                            <table className="table table-sm">
                                                <tbody>
                                                    <tr>
                                                        <td><strong>Basic Salary Calculation</strong></td>
                                                        <td></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Basic Salary</td>
                                                        <td>₹{selectedUserDetails?.basicSalary || 0}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Present Days Amount</td>
                                                        <td>₹{selectedUserDetails?.amount?.toFixed(2) || 0}</td>
                                                    </tr>

                                                    
                                                    <tr className="table-success">
                                                        <td><strong>Total Allowances</strong></td>
                                                        <td><strong>+₹{selectedUserDetails?.allowanceAmount || 0}</strong></td>
                                                    </tr>

                                                    
                                                    <tr className="table-danger">
                                                        <td><strong>Total Deductions</strong></td>
                                                        <td><strong>-₹{selectedUserDetails?.deductionAmount || 0}</strong></td>
                                                    </tr>

                                                    <tr className="table-dark">
                                                        <td><strong>Net Salary</strong></td>
                                                        <td><strong>₹{(
                                                            (selectedUserDetails?.amount || 0) + 
                                                            (selectedUserDetails?.allowanceAmount || 0) - 
                                                            (selectedUserDetails?.deductionAmount || 0)
                                                        ).toFixed(2)}</strong></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPayoutDetailsModal(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
        
    </div>
    {showAdvanceDetails && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Advance Details</h5>
                        <button 
                            type="button" 
                            className="btn-close"
                            onClick={() => setShowAdvanceDetails(false)}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {advanceDetails.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {advanceDetails.map((advance, index) => (
                                            <tr key={index}>
                                                <td>{advance.date}</td>
                                                <td>₹{advance.amount}</td>
                                                <td>{advance.description || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="table-info">
                                            <td><strong>Total</strong></td>
                                            <td colSpan="2">
                                                <strong>
                                                    ₹{advanceDetails.reduce((sum, item) => 
                                                        sum + Number(item.amount), 0
                                                    )}
                                                </strong>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center">No advance records found for this month.</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setShowAdvanceDetails(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )}
    </div>
  )
}
