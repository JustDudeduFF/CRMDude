import React, { useEffect, useState } from 'react';
import './ExpandView.css';
import * as XLSX from 'xlsx';
import { api } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';
import SmallModal from './SmallModal'
import CloseTicketModal from './CloseTicketModal';
import { usePermissions } from './PermissionProvider';
import axios from 'axios';


const ExpandTickets = ({ viewShow, ticketType, closeView }) => {
    const {hasPermission} = usePermissions();
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [ticketSource, setTicketSource] = useState('All'); // New state for status filter
    const [filterData, setFilteredData] = useState([]);
    const [filterUserId, setFilterUserId] = useState("All");

    const [showsmallModal, setShowSmallModal] = useState(false);
    const [ticketclosemodal, setTicketCloseModal] = useState(false);
    const [ticketno, setTicketno] = useState([]);


    // Download All Data to Excel File
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Summary");
        XLSX.writeFile(workbook, `Tickets Data.xlsx`);
    };


    const fetchExpandData = async() => {
        try{
            const ticketResponse = await axios.get(api+'/tickets?data=open');

            if(ticketResponse.status !== 200) return;
            const ticketData = ticketResponse.data;
            if(ticketData){
                
                setArrayData(ticketData);
            }
            
        }catch(e){
            console.log(e);
        }
    }

    useEffect(() => {
        if (viewShow) {
            fetchExpandData();
        }
    }, [viewShow, showsmallModal, ticketclosemodal]);

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

        if(ticketSource !== 'All'){
            filteredArray = filteredArray.filter((data) => data.source === ticketSource);
        }

        if(filterUserId !== "All"){
            filteredArray = filteredArray.filter((data) => (data.subsID).includes(filterUserId));
        }

        setFilteredData(filteredArray);
    }, [filterPeriod, filterStatus, arrayData, ticketSource, filterUserId]);

    if (!viewShow) return null;

    return (
        <div className="modal-body1">
            <div className="modal-data1">
                <div className="modal-inner1">
                    <h4 className='me-4'>Ticket Summary</h4>
                    <form style={{ flex: '4' }} className="row g-3 ms-4">
                        <div className='col-md-3'>
                            <label className='form-label'>Enter UserID</label>
                            <input onChange={(e) => setFilterUserId(e.target.value)} placeholder='e.g. example' className='form-control' type='text'></input>

                        </div>
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
                                onChange={(e) => {setFilterStatus(e.target.value);}}
                                className='form-select'
                            >
                                <option value="Pending">Open Tickets</option>
                                <option value="All">All Tickets</option>
                                <option value="Completed">Closed Tickets</option>
                                <option value="Unassigned">Unassigned Tickets</option>
                            </select>                                                                                                           
                        </div>

                        <div className='col-md-3'>
                            <label className='form-label'>Select Ticket Source</label>
                            <select
                                onChange={(e) => {setTicketSource(e.target.value);}}
                                className='form-select'
                            >  
                                <option value="All">All Source</option>
                                <option value="Manual">Manual</option>
                                <option value="WhatsApp">Whatsapp Bot</option>
                                <option value="Mobile App">Customer App</option>
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
                        <thead className='table-primary'>
                            <tr>
                                <th scope='col'>S. No.</th>
                                <th scope='col'>User ID</th>
                                <th scope='col'>Date</th>
                                <th scope='col'>Company</th>
                                <th scope='col'>Concern</th>
                                <th scope='col'>Status</th>
                                <th scope='col'>Description</th>
                                <th scope='col'>Assign to</th>
                                <th scope='col'>Ticket Created By</th>
                                <th scope='col'>Assign DateTime</th>
                                <th scope='col'></th>
                            </tr>
                        </thead>
                        <tbody>
                        {filterData.map(({ subsID, company, createby, Concern, creationdate, Time, Description, Status, Assign_to, Ticketno, generatedDate, UserKey }, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td style={{maxWidth:'120px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{subsID}</td>
                                    <td>{new Date(generatedDate).toLocaleDateString('en-GM', {day:'2-digit', month:'short', year:'2-digit'}).replace(' ', '-')}</td>
                                    <td>{company}</td>
                                    <td>{Concern}</td>
                                    <td>{Status}</td>
                                    <td style={{maxWidth:'150px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{Description}</td>
                                    <td>{Assign_to}</td>
                                    <td>{createby}</td>
                                    <td>{`"${creationdate}" at "${Time}"`}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                if(hasPermission("REASSING_TICKET")){
                                                    setShowSmallModal(true);
                                                    setTicketno({ Ticketno, subsID, Concern, UserKey, company });
                                                }else{
                                                    alert("Permission Denied");
                                                }
                                            }}
                                            className='btn btn-outline-success me-3'
                                            disabled={Status === 'Completed'}
                                        >
                                            {Status === 'Unassigned' ? 'Assign' : 'Re Assign'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if(hasPermission("CLOSE_TICKET")){
                                                    setTicketCloseModal(true);
                                                    setTicketno({ Ticketno, subsID, Concern, UserKey, company });
                                                }else{
                                                    alert("Permission Denied");
                                                }
                                            }}
                                            className='btn btn-danger'
                                            disabled={Status === 'Completed'}
                                        >
                                            {Status === 'Open' ? 'Re-Open' : 'Close it'}
                                        </button>
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
