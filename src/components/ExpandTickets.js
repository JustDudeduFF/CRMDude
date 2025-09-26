import { useEffect, useState } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import { api2 } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import SmallModal from './SmallModal';
import CloseTicketModal from './CloseTicketModal';
import { usePermissions } from './PermissionProvider';
import axios from 'axios';
import { FiRefreshCw, FiXCircle } from "react-icons/fi";

const ExpandTickets = ({ viewShow, ticketType, closeView }) => {
    const partnerId = localStorage.getItem('partnerId');
    const { hasPermission } = usePermissions();
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [ticketSource, setTicketSource] = useState('All');
    const [filterUserId, setFilterUserId] = useState("All");
    const [filterData, setFilteredData] = useState([]);

    const [showsmallModal, setShowSmallModal] = useState(false);
    const [ticketclosemodal, setTicketCloseModal] = useState(false);
    const [ticketno, setTicketno] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch tickets
    const fetchExpandData = async () => {
        try {
            const ticketResponse = await axios.get(`${api2}/dashboard-data/tickets/${partnerId}?data=Pending`);
            if (ticketResponse.status !== 200) return;
            const ticketData = ticketResponse.data;
            if (ticketData) setArrayData(ticketData);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        if (viewShow) fetchExpandData();
    }, [viewShow, showsmallModal, ticketclosemodal]);

    // Filter tickets based on selected filters
    useEffect(() => {
        let filteredArray = arrayData;
        const currentDate = new Date();

        switch (filterPeriod) {
            case 'Today':
                filteredArray = arrayData.filter((data) => isToday(parseISO(data.creationdate)));
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) => isThisWeek(parseISO(data.creationdate)));
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) => isThisMonth(parseISO(data.creationdate)));
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter((data) => parseISO(data.creationdate) >= subDays(currentDate, 7));
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter((data) => parseISO(data.creationdate) >= subDays(currentDate, 30));
                break;
            default:
                break;
        }

        if (filterStatus !== 'All') filteredArray = filteredArray.filter((data) => data.Status === filterStatus);
        if (ticketSource !== 'All') filteredArray = filteredArray.filter((data) => data.source === ticketSource);
        if (filterUserId !== "All") filteredArray = filteredArray.filter((data) => data.subsID.includes(filterUserId));

        setFilteredData(filteredArray);
        setCurrentPage(1); // Reset page when filters change
    }, [filterPeriod, filterStatus, arrayData, ticketSource, filterUserId]);

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTickets = filterData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filterData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Download Excel
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Summary");
        XLSX.writeFile(workbook, `Tickets Data.xlsx`);
    };

    if (!viewShow) return null;

    return (
        <div className="expand-modal">
            <div className="expand-modal-content">
                <div className="expand-modal-header">
                    <h4 className='modal-title me-5'>Ticket Summary</h4>
                    <form className="modal-actions">
                        <div className='col-md-3'>
                            <label className='form-label'>Enter UserID</label>
                            <input onChange={(e) => setFilterUserId(e.target.value)} placeholder='e.g. example' className='form-control' type='text'></input>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Select Time Period</label>
                            <select onChange={(e) => setFilterPeriod(e.target.value)} className="form-select">
                                <option>All Time</option>
                                <option>Today</option>
                                <option>Last 7 Days</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <SmallModal show={showsmallModal} ticketno={ticketno} closeModal={() => setShowSmallModal(false)} />
                        <CloseTicketModal show={ticketclosemodal} ticketno={ticketno} closeModal={() => setTicketCloseModal(false)} />
                        <div className='col-md-3'>
                            <label className='form-label'>Select Ticket Status</label>
                            <select onChange={(e) => setFilterStatus(e.target.value)} className='form-select'>
                                <option value="Pending">Open Tickets</option>
                                <option value="All">All Tickets</option>
                                <option value="Completed">Closed Tickets</option>
                                <option value="Unassigned">Unassigned Tickets</option>
                            </select>
                        </div>
                        <div className='col-md-3'>
                            <label className='form-label'>Select Ticket Source</label>
                            <select onChange={(e) => setTicketSource(e.target.value)} className='form-select'>
                                <option value="All">All Source</option>
                                <option value="Manual">Manual</option>
                                <option value="WhatsApp">Whatsapp Bot</option>
                                <option value="Mobile App">Customer App</option>
                            </select>
                        </div>
                    </form>
                    <img onClick={downloadExcel} src={ExcelIcon} alt="excel" title='Download Excel' className="excel-download-icon ms-auto" />
                    <button style={{ right: '5%', marginLeft: '1%' }} className="btn-close" onClick={closeView}></button>
                </div>

                <div className='table-container'>
                    <table className="dashboard-table">
                        <thead className='table-primary'>
                            <tr>
                                <th>S. No.</th>
                                <th>User ID</th>
                                <th>Date</th>
                                <th>Company</th>
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
                            {currentTickets.map((ticket, index) => (
                                <tr key={index}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td style={{ maxWidth: '120px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ticket.subsID}</td>
                                    <td>{new Date(ticket.generatedDate).toLocaleDateString('en-GM', { day: '2-digit', month: 'short', year: '2-digit' }).replace(' ', '-')}</td>
                                    <td>{ticket.company}</td>
                                    <td>{ticket.Concern}</td>
                                    <td>{ticket.Status}</td>
                                    <td style={{ maxWidth: '150px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ticket.Description}</td>
                                    <td>{ticket.Assign_to}</td>
                                    <td>{ticket.createby}</td>
                                    <td>{`"${ticket.creationdate}" at "${ticket.Time}"`}</td>
                                    <td>
                                        <div className='modal-actions'>
                                            <FiRefreshCw
                                                className='action-icon'
                                                title='Re-Assign Ticket'
                                                onClick={() => {
                                                    if (hasPermission("REASSING_TICKET")) {
                                                        setShowSmallModal(true);
                                                        setTicketno({ ...ticket });
                                                    } else {
                                                        alert("Permission Denied");
                                                    }
                                                }}
                                            />
                                            <FiXCircle
                                                className='action-icon'
                                                title='Close Ticket'
                                                onClick={() => {
                                                    if (hasPermission("CLOSE_TICKET")) {
                                                        setTicketCloseModal(true);
                                                        setTicketno({ ...ticket });
                                                    } else {
                                                        alert("Permission Denied");
                                                    }
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => paginate(i + 1)}
                                    className={currentPage === i + 1 ? 'active-page' : ''}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpandTickets;
