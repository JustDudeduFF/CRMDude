import React, { useCallback, useEffect, useState } from 'react';
import ExcelIcon from '../subscriberpage/drawables/xls.png';
import * as XLSX from 'xlsx';
import { child, onValue, ref, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import AssignedLead from './AssignedLead';
import { Modal } from 'react-bootstrap';

export default function ExpandLeads({ showExpand, closeExpand }) {
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
    const [companyArray,setCompanyArrya] = useState([]);
    const [companyname, setCompanyName] = useState('');
    const [status, setStatus] = useState('All');
    const [userMap, setUserMap] = useState({});

    const heading = 'Lead and Enquiry Data';

    // Function to download Excel
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

    // Fetch data from Firebase
    const fetchdata = useCallback(() => {
        const dataRef = ref(db, 'Leadmanagment');
        const planRef = ref(db, 'Master/Broadband Plan');
        const companyRef = ref(db, `Master/companys`);
        const userRef = ref(db, `users`);
        onValue(planRef, (planSnap) => {
            const planArray = [];
            planSnap.forEach((childSnap) => {
                const planName = childSnap.val().planname;
                const planKey = childSnap.key;
                const planAmount = childSnap.val().planamount;
                planArray.push({planName, planKey, planAmount});
            });
            setPlanArray(planArray);
        });
        onValue(dataRef, (dataSnap) => {
            try {
                const dataArray = [];

                dataSnap.forEach((childSnap) => {
                    const FirstName = childSnap.val().firstName;
                    const LastName = childSnap.val().lastName;
                    const Enquiry_LeadDate = childSnap.val().date; // This might be a string
                    const LeadSource = childSnap.val().leadsource;
                    const Type = childSnap.val().type;
                    const Enquiry_Concern = childSnap.val().en_concern;
                    const Mobile = childSnap.val().phone;
                    const Address = childSnap.val().address;
                    const Status = childSnap.val().status;
                    const leadID = childSnap.key;
                    const generatename = childSnap.val().generatename;
                    const assignto = childSnap.val().assignedto;

                    dataArray.push({
                        generatedDate: childSnap.val().generatedDate,
                        FirstName,
                        LastName,
                        Enquiry_Concern,
                        LeadSource,
                        Type,
                        Enquiry_LeadDate,
                        Mobile,
                        Address,
                        Status,
                        leadID,
                        generatename,
                        assignto
                    });
                });
                setArrayData(dataArray);
            } catch (error) {
                console.log('Failed to Fetch Data: ', error);
            }
        });

        onValue(userRef, (userSnap) => {
            if(userSnap.exists()){
                const userMap = {};
                userSnap.forEach((child) => {
                    const userKey = child.key;
                    const fullname = child.val().FULLNAME;
                    userMap[userKey] = fullname;
                    
                });

                setUserMap(userMap);
            }
        })

        onValue(companyRef, (companySnap) => {
            const companyarray = [];

            companySnap.forEach((child) => {
                if(child.key !== "global"){
                    const name = child.key;

                    companyarray.push(name);
                }
            });

            setCompanyArrya(companyarray);
        });
    }, []);

    useEffect(() => {
        if (showExpand) {
            fetchdata();
        }
    }, [showExpand, fetchdata]);

    useEffect(() => {
        let filteredArray = arrayData;

        const currentDate = new Date(); // Use the current Date object

        switch (filterPeriod) {
            case 'Today':
                filteredArray = arrayData.filter((data) =>
                    isToday(parseISO(data.generatedDate))
                );
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) =>
                    isThisWeek(parseISO(data.generatedDate))
                );
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) =>
                    isThisMonth(parseISO(data.generatedDate))
                );
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.generatedDate) >= subDays(currentDate, 7)
                );
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.generatedDate) >= subDays(currentDate, 30)
                );
                break;
            default:
                break;
        }

        if (datatype !== 'All') {
            filteredArray = filteredArray.filter((data) => data.Type === datatype);
        }
        setFilteredData(filteredArray);
    }, [filterPeriod, datatype, arrayData]);

    if (!showExpand) return null;

    return (
        <div className="modal-body1">
            <div className="modal-data1">
                <div className="modal-inner1">
                    <h4 style={{ flex: '1' }}>{heading}</h4>
                    <form style={{ flex: '2' }} className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Select Time Period</label>
                            <select
                                onChange={(e) => setFilterPeriod(e.target.value)}
                                className="form-select"
                            >
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 Days</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        <AssignedLead show={showAssignedLead} closeModal={(e) => {
                            e.preventDefault();
                            setShowAssignedLead(false);
                        }} leadID={leadID}/>

                        <div className="col-md-3">
                            <label className="form-label">Select Data Type</label>
                            <select
                                onChange={(e) => setDataType(e.target.value)}
                                className="form-select"
                            >
                                <option>All</option>
                                <option value="enquiry">Enquiry</option>
                                <option value="lead">Leads</option>
                            </select>
                        </div>
                    </form>
                    <img
                        onClick={downloadExcel}
                        src={ExcelIcon}
                        alt="excel"
                        className="img_download_icon"
                    />
                    <button style={{ right: '5%' }} className="btn-close" onClick={closeExpand}></button>
                </div>

                <div style={{ overflow: 'hidden', height: '80vh', overflowY: 'auto', marginTop: '10px' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Assign To</th>
                                <th>Source</th>
                                <th>Reference By</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterData.map(({ FirstName, LastName, Mobile, Address, generatedDate, LeadSource, Status, Type, leadID, generatename, assignto }, index) => (
                                <tr key={index}>
                                    <td>{new Date(generatedDate).toISOString().split('T')[0]}</td>
                                    <td>{`${FirstName} ${LastName}`}</td>
                                    <td>{`"${Mobile}" : "${Address}"`}</td>
                                    <td>{userMap[assignto]}</td>
                                    <td>{LeadSource}</td>
                                    <td>{userMap[generatename] || 'N/A'}</td>
                                    <td>{Status}</td>
                                    <td>
                                        <button onClick={() => {if(Type === 'enquiry'){
                                            setShowLeadConversation(true); setConvertLeadId(leadID);
                                            } else {
                                                setShowAssignedLead(true); setLeadID(leadID)
                                            }}} className='btn btn-outline-success me-3'>{Type === 'enquiry' ? 'Convert to Lead' : 'Re-Assign'}</button>
                                        <button className='btn btn-danger'>Cancel</button>
                                        <button onClick={() => {setShowLeadConversation(true); setConvertLeadId(leadID)}} className='btn btn-info ms-4'>Edit</button>
                                    </td>   
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showLeadConversation} onHide={() => setShowLeadConversation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Lead Conversation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>leadID: {convertLeadId}</p>
                    <div>
                        <label className="form-label">Select Plan</label>
                        <select onChange={(e) => {setSelectedPlan(e.target.value); setPlanAmount(planArray.find(plan => plan.planKey === e.target.value).planAmount)}} className="form-select">
                            <option value=''>Choose...</option>
                            {
                                planArray.length > 0 ? (
                                    planArray.map(({planName, planKey}) => (
                                        <option key={planKey} value={planKey}>{planName}</option>
                                    ))
                                ) : (
                                    <option value=''>No Data Available!</option>
                                )
                            }
                        </select>
                    </div>

                    <div>
                        <label className="form-label">Plan Amount</label>
                        <input value={planAmount} onChange={(e) => setPlanAmount(e.target.value)} type="number" className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Security Amount</label>
                        <input value={securityAmount} onChange={(e) => setSecurityAmount(e.target.value)} type="number" className="form-control" />
                    </div>

                    <div>
                        <label className="form-label">Select Company</label>
                        <select onChange={(e) => setCompanyName(e.target.value)} className='form-select'>
                            <option value="">Choose...</option>
                            {
                                companyArray.map((name, index) => (
                                    <option key={index} value={name}>{name}</option>
                                ))
                            }
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-secondary' onClick={() => setShowLeadConversation(false)}>Cancel</button>
                    <button onClick={convertLead} className='btn btn-primary'>Convert</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
