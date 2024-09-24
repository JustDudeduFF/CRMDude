import React, { useCallback, useEffect, useState } from 'react';
import ExcelIcon from '../subscriberpage/drawables/xls.png';
import * as XLSX from 'xlsx';
import { onValue, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from 'date-fns';

export default function ExpandLeads({ showExpand, closeExpand }) {
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [datatype, setDataType] = useState('All');
    const [filterData, setFilteredData] = useState([]);

    const heading = 'Lead and Enquiry Data';

    // Function to download Excel
    const downloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(filterData);
        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    };

    // Fetch data from Firebase
    const fetchdata = useCallback(() => {
        const dataRef = ref(db, 'Leadmanagment/leads');
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

                    dataArray.push({
                        FirstName,
                        LastName,
                        Enquiry_Concern,
                        LeadSource,
                        Type,
                        Enquiry_LeadDate,
                        Mobile,
                        Address,
                        Status,
                    });
                });
                setArrayData(dataArray);
            } catch (error) {
                console.log('Failed to Fetch Data: ', error);
            }
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
                    isToday(parseISO(data.Enquiry_LeadDate))
                );
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) =>
                    isThisWeek(parseISO(data.Enquiry_LeadDate))
                );
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) =>
                    isThisMonth(parseISO(data.Enquiry_LeadDate))
                );
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.Enquiry_LeadDate) >= subDays(currentDate, 7)
                );
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter(
                    (data) => parseISO(data.Enquiry_LeadDate) >= subDays(currentDate, 30)
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

                        <div className="col-md-3">
                            <label className="form-label">Select Data Type</label>
                            <select
                                onChange={(e) => setDataType(e.target.value)}
                                className="form-select"
                            >
                                <option>All</option>
                                <option value="enquiry">Enquiry</option>
                                <option value="leads">Leads</option>
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
                                <th>Name</th>
                                <th>Contact Info</th>
                                <th>Source</th>
                                <th>Enquiry/Lead Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filterData.map(({ FirstName, LastName, Mobile, Address, Enquiry_LeadDate, LeadSource, Status }, index) => (
                                <tr key={index}>
                                    <td>{`${FirstName} ${LastName}`}</td>
                                    <td>{`${Mobile} ${Address}`}</td>
                                    <td>{LeadSource}</td>
                                    <td>{new Date(Enquiry_LeadDate).toLocaleDateString()}</td>
                                    <td>{Status}</td>
                                    <td>
                                        {/* Actions Column (Edit/Delete/View dropdown or icons) */}
                                        <button>Edit</button>
                                        <button>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
