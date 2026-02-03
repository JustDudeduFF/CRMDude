import { onValue, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig';
import { Modal, Button, Badge, Card, Table } from 'react-bootstrap';
import { 
  FileText, Calendar, DollarSign, Info, PlusCircle, 
  MinusCircle, CheckCircle, ChevronRight, Download 
} from 'lucide-react';

export default function PayrollandAttendence() {
  const [payoutArray, setPayoutArray] = useState([]);
  const [visiblePayout, setVisiblePayout] = useState(true);
  const [visibleAttendence, setVisibleAttendence] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [allowanceInput, setAllowanceInput] = useState({ amount: '', description: '', type: '' });
  const [deductionInput, setDeductionInput] = useState({ amount: '', description: '', type: '' });

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [showDeductionDetailsModal, setShowDeductionDetailsModal] = useState(false);
  const [showPayoutDetailsModal, setShowPayoutDetailsModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showAdvanceDetails, setShowAdvanceDetails] = useState(false);
  const [advanceDetails, setAdvanceDetails] = useState([]);

  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

  const generateDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for(let i = 1; i <= daysInMonth(selectedYear, selectedMonth); i++){
      const date = new Date(selectedYear, selectedMonth - 1, i);
      const dayName = dayNames[date.getDay()];
      days.push(
        <th key={i} className="text-center p-1 sticky-header-cell" style={{ minWidth: '45px' }}>
          <div className='fw-bold small'>{i}</div>
          <div style={{ fontSize: '0.7em', color: dayName === 'Sun' ? '#ef4444' : '#64748b' }}>
            {dayName}
          </div>
        </th>
      );
    }
    return days;
  };

  const handleContextMenu = (e, userId) => {
    e.preventDefault();
    setSelectedUserId(userId);
    setAllowanceInput({ amount: '', description: '', type: '' });
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
      setAllowanceInput({ amount: '', description: '', type: '' });
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
        const newUsersMap = new Map();
        usersSnap.forEach(userSnap => {
          const userData = userSnap.val();
          const monthlySalary = Number(userData.salary) || 0;
          const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const dailySalary = monthlySalary / daysInCurrentMonth;

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
          newUsersMap.forEach((userData) => { attendenceArray.push({ ...userData }); });

          attendenceSnap.forEach(childSnap => {
            const yearData = childSnap.child(String(selectedYear));
            const monthData = yearData.child(String(selectedMonth).padStart(2, '0'));
            
            let allowanceData = [];
            let attendenceAllData = [];
            let presentDays = 0;
            let allowanceAmount = 0;
            let totals = { petrol: 0, rapido: 0, conveyance: 0, other: 0 };
            let deductionAmount = 0;
            let dTotals = { advance: 0, wifi: 0, mobileRecharge: 0, other: 0 };
            let deductionData = [];

            monthData.forEach(dateSnap => {
              const attendanceData = dateSnap.val();
              attendenceAllData.push(monthData.val());
              if (attendanceData.status === 'Half Day' || attendanceData.status === 'Present') presentDays++;
            });

            const allowanceRef = ref(db, `Payroll/Attendence/${childSnap.key}/${selectedYear}/${selectedMonth}/allowance`);
            onValue(allowanceRef, snap => {
              snap.forEach(s => {
                const val = s.val();
                allowanceAmount += val.amount;
                allowanceData.push(val);
                if (val.type === 'Petrol') totals.petrol += Number(val.amount);
                else if (val.type === 'Rapido') totals.rapido += Number(val.amount);
                else if (val.type === 'Conveyance') totals.conveyance += Number(val.amount);
                else totals.other += Number(val.amount);
              });
            });

            const deductionRef = ref(db, `Payroll/Attendence/${childSnap.key}/${selectedYear}/${selectedMonth}/deduction`);
            onValue(deductionRef, snap => {
              snap.forEach(s => {
                const val = s.val();
                deductionAmount += val.amount;
                deductionData.push(val);
                if (val.type === 'Advance') dTotals.advance += Number(val.amount);
                else if (val.type === 'Wifi') dTotals.wifi += Number(val.amount);
                else if (val.type === 'Mobile Recharge') dTotals.mobileRecharge += Number(val.amount);
                else dTotals.other += Number(val.amount);
              });
            });

            const userIndex = attendenceArray.findIndex(item => item.userId === childSnap.key);
            if (userIndex !== -1) {
              const userData = attendenceArray[userIndex];
              attendenceArray[userIndex] = {
                ...userData,
                presentDays,
                amount: presentDays * userData.dailySalary,
                allowanceAmount,
                allowanceTotals: totals,
                deductionAmount,
                deductionTotals: dTotals,
                deductionAllData: deductionData,
                allowanceAllData: allowanceData,
                attendenceAllData
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
    <div className="payroll-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="container-fluid px-4 py-4">
        <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="fw-bold text-slate-800 mb-1">Human Resources</h2>
            <p className="text-muted small mb-0">Manage employee attendance, allowances, and monthly payroll</p>
          </div>
          <div className="tab-switcher">
            <button 
              onClick={() => {setVisiblePayout(true); setVisibleAttendence(false);}} 
              className={`tab-btn ${visiblePayout ? 'active' : ''}`}
            >
              <DollarSign size={18} /> Payout
            </button>
            <button 
              onClick={() => {setVisibleAttendence(true); setVisiblePayout(false);}} 
              className={`tab-btn ${visibleAttendence ? 'active' : ''}`}
            >
              <Calendar size={18} /> Attendance
            </button>
          </div>
        </header>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4 rounded-4">
          <Card.Body className="p-3">
            <div className="row g-3 align-items-end">
              <div className="col-6 col-md-2">
                <label className="form-label small fw-bold text-muted uppercase">Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select border-0 bg-light rounded-3">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label small fw-bold text-muted uppercase">Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="form-select border-0 bg-light rounded-3">
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-8 text-md-end">
                <button className="btn btn-primary px-4 rounded-3 fw-bold">
                  <FileText size={18} className="me-2"/>
                  Generate {visiblePayout ? 'Payroll' : 'Attendance'}
                </button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {visiblePayout && (
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive" style={{ maxHeight: '70vh' }}>
              <Table hover className="align-middle mb-0">
                <thead className="bg-light sticky-top" style={{ zIndex: 11 }}>
                  <tr className="text-muted small uppercase">
                    <th className="ps-4 bg-light">S.No</th>
                    <th className="bg-light">Full Name</th>
                    <th className="bg-light">Basic</th>
                    <th className="bg-light">Allowance</th>
                    <th className="bg-light">Deduction</th>
                    <th className="bg-light">Payout</th>
                    <th className="bg-light">Status</th>
                    <th className="text-end pe-4 bg-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payoutArray.map((item, index) => (
                    <tr key={item.userId}>
                      <td className="ps-4 text-muted">{index + 1}</td>
                      <td>
                        <div className="fw-bold text-dark">{item.fullname}</div>
                        <div className="small text-muted">ID: {item.userId.slice(0, 8)}</div>
                      </td>
                      <td className="fw-semibold">₹{item.basicSalary.toLocaleString()}</td>
                      <td onContextMenu={(e) => handleContextMenu(e, item.userId)} className="cursor-pointer text-success fw-bold">
                        <PlusCircle size={14} className="me-1"/>₹{item.allowanceAmount}
                      </td>
                      <td onContextMenu={(e) => handleDeductionBodyClick(e, item.userId)} className="cursor-pointer text-danger fw-bold">
                        <MinusCircle size={14} className="me-1"/>₹{item.deductionAmount}
                      </td>
                      <td className="fw-bold text-primary fs-5">
                        ₹{(item.amount + item.allowanceAmount - item.deductionAmount).toFixed(2)}
                      </td>
                      <td><Badge bg="soft-warning" className="text-warning">Pending</Badge></td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-icon" onClick={() => { setSelectedUserDetails(item); setShowPayoutDetailsModal(true); }}>
                            <Info size={18} className="text-info" />
                          </button>
                          <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Release</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}

        {visibleAttendence && (
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
             <div className="table-responsive" style={{ maxHeight: '70vh' }}>
              <Table bordered hover size="sm" className="mb-0 text-nowrap">
                <thead className="bg-light sticky-top" style={{ zIndex: 11 }}>
                  <tr>
                    <th className="sticky-left bg-light z-3" style={{ borderRight: '2px solid #e2e8f0' }}>Employee</th>
                    {generateDays()}
                  </tr>
                </thead>
                <tbody>
                  {payoutArray.map((item) => (
                    <tr key={item.userId}>
                      <td className="sticky-left bg-white fw-bold small z-2" style={{ borderRight: '2px solid #e2e8f0' }}>{item.fullname}</td>
                      {Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, i) => {
                        const day = (i + 1).toString().padStart(2, '0');
                        const dayData = item.attendenceAllData?.[0]?.[day];
                        let statusClass = 'bg-danger-soft text-danger';
                        let label = 'A';
                        if (dayData?.status === 'Present') { statusClass = 'bg-success-soft text-success'; label = 'P'; }
                        else if (dayData?.status === 'Half Day') { statusClass = 'bg-warning-soft text-warning'; label = 'H'; }
                        return (
                          <td key={day} className={`text-center fw-bold p-2 ${statusClass}`} style={{ fontSize: '0.8rem' }}>
                            {label}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* MODALS REMAIN UNCHANGED TO PRESERVE FUNCTIONALITY */}
      <Modal show={showAllowanceModal} onHide={() => setShowAllowanceModal(false)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Adjust Allowance</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="mb-3">
            <label className="form-label small fw-bold">Expense Type</label>
            <select value={allowanceInput.type} onChange={(e) => setAllowanceInput(prev => ({ ...prev, type: e.target.value }))} className="form-select bg-light border-0 py-2">
              <option value=''>Select Type</option>
              <option value='Petrol'>Petrol</option>
              <option value='Rapido'>Rapido</option>
              <option value='Conveyance'>Conveyance</option>
              <option value='Other'>Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Amount (₹)</label>
            <input type="number" className="form-control bg-light border-0 py-2" value={allowanceInput.amount} onChange={(e) => setAllowanceInput(prev => ({ ...prev, amount: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Remarks</label>
            <input type="text" className="form-control bg-light border-0 py-2" value={allowanceInput.description} onChange={(e) => setAllowanceInput(prev => ({ ...prev, description: e.target.value }))} />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-3" onClick={() => setShowAllowanceModal(false)}>Discard</Button>
          <Button variant="primary" className="rounded-3 px-4" onClick={handleAllowanceSubmit}>Credit Allowance</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeductionDetailsModal} onHide={() => setShowDeductionDetailsModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Process Deduction</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <div className="mb-3">
            <label className="form-label small fw-bold">Deduction Reason</label>
            <select value={deductionInput.type} onChange={(e) => setDeductionInput(prev => ({ ...prev, type: e.target.value }))} className="form-select bg-light border-0 py-2">
              <option value=''>Select Reason</option>
              <option value='Advance'>Salary Advance</option>
              <option value='Wifi'>Wifi/Internet</option>
              <option value='Mobile Recharge'>Mobile Recharge</option>
              <option value='Other'>Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Amount (₹)</label>
            <input type="number" className="form-control bg-light border-0 py-2 text-danger fw-bold" value={deductionInput.amount} onChange={(e) => setDeductionInput(prev => ({ ...prev, amount: e.target.value }))} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Notes</label>
            <input type="text" className="form-control bg-light border-0 py-2" value={deductionInput.description} onChange={(e) => setDeductionInput(prev => ({ ...prev, description: e.target.value }))} />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeductionDetailsModal(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-3 px-4" onClick={handleDeductionSubmit}>Debit Amount</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPayoutDetailsModal} onHide={() => setShowPayoutDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title className="fw-bold">Payment Summary - {selectedUserDetails?.fullname}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3 border-bottom pb-2">Salary Ledger</h6>
                  <div className="d-flex justify-content-between mb-2"><span>Monthly Fixed:</span><span className="fw-bold">₹{selectedUserDetails?.basicSalary}</span></div>
                  <div className="d-flex justify-content-between mb-2"><span>Days Present:</span><span className="badge bg-primary">{selectedUserDetails?.presentDays} Days</span></div>
                  <div className="d-flex justify-content-between text-muted small"><span>Base Calculation:</span><span>₹{selectedUserDetails?.amount?.toFixed(2)}</span></div>
                </Card.Body>
              </Card>
            </div>
            <div className="col-md-6">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h6 className="fw-bold mb-3 border-bottom pb-2 text-success">Additions & Perks</h6>
                  {['petrol', 'rapido', 'conveyance', 'other'].map(type => (
                    <div className="d-flex justify-content-between mb-2" key={type}>
                      <span className="capitalize">{type} <Info size={12} className="text-primary cursor-pointer" onClick={() => {
                         const list = selectedUserDetails?.allowanceAllData?.filter(item => item.type.toLowerCase() === type) || [];
                         setAdvanceDetails(list); setShowAdvanceDetails(true);
                      }}/></span>
                      <span className="text-success fw-bold">+₹{selectedUserDetails?.allowanceTotals?.[type] || 0}</span>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </div>
            <div className="col-12">
              <div className="bg-dark text-white p-3 rounded-4 d-flex justify-content-between align-items-center">
                <div>
                  <div className="small text-white-50 uppercase">Total Net Payable</div>
                  <h3 className="mb-0 fw-bold">₹{((selectedUserDetails?.amount || 0) + (selectedUserDetails?.allowanceAmount || 0) - (selectedUserDetails?.deductionAmount || 0)).toFixed(2)}</h3>
                </div>
                <button className="btn btn-outline-light rounded-pill px-4"><Download size={16} className="me-2"/>Slip</button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {showAdvanceDetails && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Transaction History</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdvanceDetails(false)}></button>
              </div>
              <div className="modal-body">
                {advanceDetails.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {advanceDetails.map((adv, i) => (
                      <div className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent border-light" key={i}>
                        <div>
                          <div className="fw-bold">{adv.description || 'Adjustment'}</div>
                          <div className="text-muted small">{adv.date}</div>
                        </div>
                        <div className="fw-bold fs-5">₹{adv.amount}</div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-4 text-muted">No records found.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .tab-switcher { background: #e2e8f0; padding: 4px; border-radius: 12px; display: flex; gap: 4px; }
        .tab-btn { border: 0; padding: 8px 20px; border-radius: 8px; font-weight: 600; color: #64748b; background: transparent; transition: 0.2s; display: flex; align-items: center; gap: 8px; }
        .tab-btn.active { background: white; color: #0f172a; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .bg-success-soft { background-color: #dcfce7 !important; color: #15803d !important; }
        .bg-danger-soft { background-color: #fee2e2 !important; color: #b91c1c !important; }
        .bg-warning-soft { background-color: #fef9c3 !important; color: #854d0e !important; }
        .cursor-pointer { cursor: pointer; }
        .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
        
        /* Sticky Headers Implementation */
        .sticky-top { position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .sticky-left { position: sticky; left: 0; z-index: 9; }
        
        /* Ensure table header cells maintain background on scroll */
        th.bg-light { background-color: #f8f9fa !important; }
        
        .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: 0.2s; background: #f1f5f9; border: 0; }
        .btn-icon:hover { background: #e2e8f0; }
        .capitalize { text-transform: capitalize; }
      `}</style>
    </div>
  );
}