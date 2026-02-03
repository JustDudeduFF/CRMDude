import React, { useCallback, useEffect, useState } from 'react';
import ExcelIcon from '../subscriberpage/drawables/xls.png';
import * as XLSX from 'xlsx';
import { onValue, ref, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import AssignedLead from './AssignedLead';
import { Modal } from 'react-bootstrap';
import { usePermissions } from '../PermissionProvider';
import { Calendar, Filter, Download, User, MapPin, Phone, MoreVertical, Edit3, UserPlus, XCircle } from 'lucide-react';

export default function ExpandLeads({ showExpand, closeExpand }) {
    const { hasPermission } = usePermissions();
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [datatype, setDataType] = useState('All');
    const [filterData, setFilteredData] = useState([]);
    const [showAssignedLead, setShowAssignedLead] = useState(false);
    const [leadID, setLeadID] = useState('');
    const [showLeadConversation, setShowLeadConversation] = useState(false);
    const [convertLeadId, setConvertLeadId] = useState('');
    const [planArray, setPlanArray] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [planAmount, setPlanAmount] = useState('');
    const [securityAmount, setSecurityAmount] = useState("0");
    const [companyArray, setCompanyArrya] = useState([]);
    const [companyname, setCompanyName] = useState('');
    const [userMap, setUserMap] = useState({});

    const heading = 'Lead and Enquiry Data';

    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(filterData);
        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    };

    const convertLead = () => {
        const leadRef = ref(db, `Leadmanagment/${convertLeadId}`);
        update(leadRef, {
            status: 'assigned',
            type: 'lead',
            plan: selectedPlan,
            securityamount: securityAmount,
            company: companyname
        });
        setShowLeadConversation(false);
    }

    const fetchdata = useCallback(() => {
        const dataRef = ref(db, 'Leadmanagment');
        const planRef = ref(db, 'Master/Broadband Plan');
        const companyRef = ref(db, `Master/companys`);
        const userRef = ref(db, `users`);
        
        onValue(planRef, (planSnap) => {
            const plans = [];
            planSnap.forEach((childSnap) => {
                plans.push({
                    planName: childSnap.val().planname,
                    planKey: childSnap.key,
                    planAmount: childSnap.val().planamount
                });
            });
            setPlanArray(plans);
        });

        onValue(dataRef, (dataSnap) => {
            try {
                const dataArray = [];
                dataSnap.forEach((childSnap) => {
                    dataArray.push({
                        ...childSnap.val(),
                        leadID: childSnap.key,
                        FirstName: childSnap.val().fullName,
                        Mobile: childSnap.val().phone,
                        Enquiry_LeadDate: childSnap.val().date,
                        Type: childSnap.val().type,
                        assignto: childSnap.val().assignedto,
                        generatename: childSnap.val().referenceName
                    });
                });
                setArrayData(dataArray);
            } catch (error) {
                console.log('Failed to Fetch Data: ', error);
            }
        });

        onValue(userRef, (userSnap) => {
            if (userSnap.exists()) {
                const map = {};
                userSnap.forEach((child) => {
                    map[child.key] = child.val().FULLNAME;
                });
                setUserMap(map);
            }
        });

        onValue(companyRef, (companySnap) => {
            const cos = [];
            companySnap.forEach((child) => {
                if (child.key !== "global") cos.push(child.key);
            });
            setCompanyArrya(cos);
        });
    }, []);

    useEffect(() => {
        if (showExpand) fetchdata();
    }, [showExpand, fetchdata]);

    useEffect(() => {
        let filteredArray = arrayData;
        const currentDate = new Date();

        switch (filterPeriod) {
            case 'Today':
                filteredArray = arrayData.filter((data) => isToday(parseISO(data.generatedDate)));
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) => isThisWeek(parseISO(data.generatedDate)));
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) => isThisMonth(parseISO(data.generatedDate)));
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter((data) => parseISO(data.generatedDate) >= subDays(currentDate, 7));
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter((data) => parseISO(data.generatedDate) >= subDays(currentDate, 30));
                break;
            default: break;
        }

        if (datatype !== 'All') {
            filteredArray = filteredArray.filter((data) => data.Type === datatype);
        }
        setFilteredData(filteredArray);
    }, [filterPeriod, datatype, arrayData]);

    if (!showExpand) return null;

    return (
        <div className="lead-panel-overlay">
            <div className="lead-panel-container">
                {/* Header Section */}
                <div className="lead-panel-header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="header-badge">
                            {filterData.length}
                        </div>
                        <div>
                            <h4 className="m-0 fw-bold">{heading}</h4>
                            <p className="small text-muted m-0">Manage and convert your enquiries</p>
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <button className="icon-action-btn" onClick={downloadExcel} title="Export to Excel">
                            <Download size={20} />
                        </button>
                        <button className="btn-close-custom" onClick={closeExpand}>
                            <XCircle size={24} />
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-item">
                        <Calendar size={16} className="filter-icon" />
                        <select onChange={(e) => setFilterPeriod(e.target.value)} value={filterPeriod}>
                            <option>All Time</option>
                            <option>Today</option>
                            <option>Last 7 Days</option>
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <Filter size={16} className="filter-icon" />
                        <select onChange={(e) => setDataType(e.target.value)} value={datatype}>
                            <option value="All">All Types</option>
                            <option value="enquiry">Enquiry Only</option>
                            <option value="lead">Leads Only</option>
                        </select>
                    </div>
                </div>

                <AssignedLead show={showAssignedLead} closeModal={(e) => {
                    e.preventDefault();
                    setShowAssignedLead(false);
                }} leadID={leadID} />

                {/* Data Table / Cards */}
                <div className="data-content-area">
                    {/* Desktop View Table */}
                    <div className="desktop-table-view">
                        <table className="custom-dashboard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Assigned To</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filterData.map((lead, index) => (
                                    <tr key={index}>
                                        <td>
                                            <span className="date-pill">
                                                {new Date(lead.generatedDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="customer-info">
                                                <span className="fw-bold d-block">{lead.FirstName}</span>
                                                <span className="small text-muted">{lead.Mobile}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-chip">
                                                <User size={12} />
                                                {userMap[lead.assignto] || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td><span className="source-text">{lead.LeadSource}</span></td>
                                        <td>
                                            <span className={`status-badge ${lead.Status}`}>
                                                {lead.Status}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button 
                                                    className="action-btn convert"
                                                    onClick={() => {
                                                        if (lead.Type === 'enquiry') {
                                                            if (hasPermission("CONVERT_TO_LEAD")) {
                                                                setShowLeadConversation(true); setConvertLeadId(lead.leadID);
                                                            } else alert("Permission Denied");
                                                        } else {
                                                            setShowAssignedLead(true); setLeadID(lead.leadID);
                                                        }
                                                    }}
                                                >
                                                    {lead.Type === 'enquiry' ? <UserPlus size={16} /> : <Edit3 size={16} />}
                                                </button>
                                                <button className="action-btn edit" onClick={() => { setShowLeadConversation(true); setConvertLeadId(lead.leadID) }}>
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-cards-view">
                        {filterData.map((lead, index) => (
                            <div className="lead-card" key={index}>
                                <div className="card-top">
                                    <span className="status-badge small">{lead.Status}</span>
                                    <span className="card-date">{lead.generatedDate}</span>
                                </div>
                                <h5 className="fw-bold mb-1">{lead.FirstName}</h5>
                                <div className="card-detail">
                                    <Phone size={14} /> {lead.Mobile}
                                </div>
                                <div className="card-detail">
                                    <MapPin size={14} /> {lead.Address}
                                </div>
                                <div className="card-footer-actions">
                                    <button className="mobile-action-btn primary" onClick={() => {
                                        if (lead.Type === 'enquiry') {
                                            setShowLeadConversation(true); setConvertLeadId(lead.leadID);
                                        } else {
                                            setShowAssignedLead(true); setLeadID(lead.leadID);
                                        }
                                    }}>
                                        {lead.Type === 'enquiry' ? 'Convert' : 'Re-Assign'}
                                    </button>
                                    <button className="mobile-action-btn" onClick={() => { setShowLeadConversation(true); setConvertLeadId(lead.leadID) }}>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversation Modal Redesign */}
            <Modal show={showLeadConversation} onHide={() => setShowLeadConversation(false)} centered className="custom-modal">
                <div className="modal-header-custom">
                    <h5>Lead Conversation & Setup</h5>
                    <button className="btn-close" onClick={() => setShowLeadConversation(false)}></button>
                </div>
                <Modal.Body className="p-4">
                    <div className="mb-3">
                        <label className="custom-label">Select Plan</label>
                        <select 
                            onChange={(e) => {
                                setSelectedPlan(e.target.value); 
                                const p = planArray.find(pl => pl.planKey === e.target.value);
                                if(p) setPlanAmount(p.planAmount)
                            }} 
                            className="form-select custom-field"
                        >
                            <option value=''>Choose a plan...</option>
                            {planArray.map(({ planName, planKey }) => (
                                <option key={planKey} value={planKey}>{planName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="custom-label">Plan Amount</label>
                            <input value={planAmount} onChange={(e) => setPlanAmount(e.target.value)} type="number" className="form-control custom-field" />
                        </div>
                        <div className="col-6">
                            <label className="custom-label">Security Amount</label>
                            <input value={securityAmount} onChange={(e) => setSecurityAmount(e.target.value)} type="number" className="form-control custom-field" />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="custom-label">Select Company</label>
                        <select onChange={(e) => setCompanyName(e.target.value)} className='form-select custom-field'>
                            <option value="">Choose company...</option>
                            {companyArray.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <div className="modal-footer-custom">
                    <button className='btn btn-light' onClick={() => setShowLeadConversation(false)}>Cancel</button>
                    <button onClick={convertLead} className='btn btn-primary-custom'>Convert to Lead</button>
                </div>
            </Modal>

            <style jsx>{`
                .lead-panel-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    display: flex;
                    align-items: center; justify-content: center;
                    padding: 20px;
                }

                .lead-panel-container {
                    background: #f8fafc;
                    width: 100%;
                    max-width: 1200px;
                    height: 90vh;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.2);
                }

                .lead-panel-header {
                    padding: 20px 30px;
                    background: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                }

                .header-badge {
                    background: #3b82f6;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 12px;
                    font-weight: bold;
                }

                .filter-bar {
                    padding: 15px 30px;
                    display: flex;
                    gap: 15px;
                    background: #fff;
                    border-bottom: 1px solid #e2e8f0;
                }

                .filter-item {
                    display: flex;
                    align-items: center;
                    background: #f1f5f9;
                    padding: 5px 12px;
                    border-radius: 10px;
                    gap: 8px;
                }

                .filter-item select {
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    font-weight: 500;
                    color: #475569;
                    outline: none;
                }

                .data-content-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 30px;
                }

                .custom-dashboard-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 10px;
                }

                .custom-dashboard-table th {
                    padding: 12px 15px;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 13px;
                    text-transform: uppercase;
                }

                .custom-dashboard-table tbody tr {
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    transition: transform 0.2s;
                }

                .custom-dashboard-table td {
                    padding: 15px;
                    vertical-align: middle;
                }

                .custom-dashboard-table tbody tr td:first-child { border-radius: 12px 0 0 12px; }
                .custom-dashboard-table tbody tr td:last-child { border-radius: 0 12px 12px 0; }

                .status-badge {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: capitalize;
                }

                .status-badge.enquiry { background: #dcfce7; color: #166534; }
                .status-badge.lead { background: #dbeafe; color: #1e40af; }
                .status-badge.pending { background: #fef9c3; color: #854d0e; }

                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: 0.2s;
                }

                .action-btn.convert { background: #eff6ff; color: #2563eb; }
                .action-btn.edit { background: #f8fafc; color: #64748b; }

                .mobile-cards-view { display: none; }

                @media (max-width: 768px) {
                    .desktop-table-view { display: none; }
                    .mobile-cards-view { display: block; }
                    .filter-bar { flex-direction: column; padding: 15px; }
                    .lead-panel-container { height: 100vh; border-radius: 0; }
                    
                    .lead-card {
                        background: white;
                        border-radius: 16px;
                        padding: 15px;
                        margin-bottom: 15px;
                        border: 1px solid #e2e8f0;
                    }
                    .card-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .card-detail { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #64748b; margin-top: 5px; }
                    .card-footer-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px; }
                    .mobile-action-btn { padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; font-weight: 600; background: #fff; }
                    .mobile-action-btn.primary { background: #2563eb; color: #fff; border: none; }
                }

                .custom-modal .modal-content { border-radius: 24px; border: none; }
                .modal-header-custom { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
                .custom-field { border-radius: 12px; padding: 12px; border: 1.5px solid #e2e8f0; }
                .modal-footer-custom { padding: 15px 24px; display: flex; justify-content: flex-end; gap: 10px; }
                .btn-primary-custom { background: #2563eb; color: white; border-radius: 12px; padding: 10px 20px; border: none; }
            `}</style>
        </div>
    );
}