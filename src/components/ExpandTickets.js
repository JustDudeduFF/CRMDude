import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref, get } from 'firebase/database';
import * as XLSX from 'xlsx';
import { db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import SmallModal from './SmallModal'
import CloseTicketModal from './CloseTicketModal';


const ExpandTickets = ({ viewShow, ticketType, closeView }) => {
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [filterStatus, setFilterStatus] = useState('All'); // New state for status filter
    const [filterData, setFilteredData] = useState([]);

    const [showsmallModal, setShowSmallModal] = useState(false);
    const [ticketclosemodal, setTicketCloseModal] = useState(false);
    const [ticketno, setTicketno] = useState([]);


    // Download All Data to Excel File
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);
        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    };

    const fetchExpandData = useCallback(() => {
        const pendingTicketsRef = ref(db, `Global Tickets`);
        const usersRef = ref(db, `users`);
    
        // Step 1: Fetch all users and store them in a lookup object
        get(usersRef).then((userSnap) => {
            const usersLookup = {};
            userSnap.forEach((childSnap) => {
                const userId = childSnap.key;
                const { fullname } = childSnap.val();
                usersLookup[userId] = fullname; // Create a dictionary with userid -> fullname
            });
    
            // Step 2: Fetch tickets
            onValue(pendingTicketsRef, (dataSnap) => {
                setHeading(ticketType); // Set the heading from ticketType prop
    
                try {
                    const dataArray = [];
    
                    dataSnap.forEach((childSnap) => {
                        const {
                            userid,
                            source,
                            generatedBy,
                            assigndate,
                            assigntime,
                            assignto, // This is actually the userid of the assigned person
                            description,
                            ticketconcern,
                            status
                        } = childSnap.val();
    
                        // Only include tickets that are not 'Completed'
                        if (status !== 'Completed') {
                            const assignedPersonName = usersLookup[assignto] || assignto; // Lookup user name or fallback to userid
    
                            // Push the ticket with the user's name instead of userid
                            dataArray.push({
                                Ticketno: childSnap.key,
                                subsID: userid,
                                source,
                                createby: generatedBy,
                                creationdate: assigndate,
                                Time: assigntime,
                                Assign_to: assignedPersonName, // Use user's name from lookup
                                Description: description,
                                Concern: ticketconcern,
                                Status: status,
                            });
                        }
                    });
    
                    setArrayData(dataArray);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            });
        }).catch((error) => {
            console.error('Error fetching users:', error);
        });
    }, [ticketType]);

    useEffect(() => {
        if (viewShow) {
            fetchExpandData();
        }
    }, [viewShow, fetchExpandData]);

    useEffect(() => {
        let filteredArray = arrayData;

        const currentDate = new Date();

        switch (filterPeriod) {
            case 'Today':
                filteredArray = arrayData.filter((data) =>
                    isToday(parseISO(data.creationdate))
                );
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) =>
                    isThisWeek(parseISO(data.creationdate))
                );
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) =>
                    isThisMonth(parseISO(data.creationdate))
                );
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.creationdate) >= subDays(currentDate, 7)
                );
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.creationdate) >= subDays(currentDate, 30)
                );
                break;
            default:
                break;
        }

        if (filterStatus !== 'All') {
            filteredArray = filteredArray.filter((data) => data.Status === filterStatus);
        }

        setFilteredData(filteredArray);
    }, [filterPeriod, filterStatus, arrayData]);

    if (!viewShow) return null;

    return (
        <div className="modal-body">
            <div className="modal-data">
                <div className="modal-inner">
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
                        <SmallModal show={showsmallModal} ticketno={ticketno} closeModal={() => setShowSmallModal(false)}/>
                        <CloseTicketModal show={ticketclosemodal} ticketno={ticketno} closeModal={() => setTicketCloseModal(false)}/>
                        <div className='col-md-3'>
                            <label className='form-label'>Select Ticket Status</label>
                            <select
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className='form-select'
                            >
                                <option value="All">All Tickets</option>
                                <option value="Pending">Open Tickets</option>
                                <option value="Completed">Closed Tickets</option>
                                <option value="Open">Pending Tickets</option>
                                <option value="Unassigned">Unassigned Tickets</option>
                            </select>
                        </div>
                    </form>
                    <img
                        onClick={downloadExcel}
                        src={ExcelIcon}
                        alt="excel"
                        className="img_download_icon"
                    />
                    <button style={{ right: '5%' }} className="btn-close" onClick={closeView}></button>
                </div>

                <div style={{ overflow: 'hidden', height: '80vh', overflowY: 'auto', marginTop: '10px' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>S. No.</th>
                                <th>User ID</th>
                                <th>Source</th>
                                <th>Concern</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th>Assign to</th>
                                <th>Ticket Created By</th>
                                <th>Assign DateTime</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterData.map(({ subsID, source, createby, Concern, creationdate, Time, Description, Status, Assign_to, Ticketno }, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{subsID}</td>
                                    <td>{source}</td>
                                    <td>{Concern}</td>
                                    <td>{Status}</td>
                                    <td>{Description}</td>
                                    <td>{Assign_to}</td>
                                    <td>{createby}</td>
                                    <td>{`"${creationdate}" at "${Time}"`}</td>
                                    <td>
                                        <button onClick={() => {setShowSmallModal(true); setTicketno({Ticketno, subsID})}} className='btn btn-outline-success me-3' >{Status === 'unassigned' ? 'Assign' : 'Re Assign'}</button>
                                        <button onClick={() => {setTicketCloseModal(true); setTicketno({Ticketno, subsID});}} className='btn btn-danger'>{Status === 'Open' ? 'Re-Open' : 'Close it'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpandTickets;