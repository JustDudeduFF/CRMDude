import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref } from 'firebase/database';
import * as XLSX from 'xlsx';
import { db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'
import { isThisMonth, isThisWeek, isToday, subDays } from 'date-fns';

const ExpandTickets = ({ viewShow, ticketType, closeView }) => {
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [filterPeriod, setFilterPeriod] = useState('All Time');
    const [filterData, setFilteredData] = useState([]);
    

    //Download All Data to Excel File

    const downloadExcel =()=> {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);

        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    }



    const fetchExpandData = useCallback(() => {
        const pendingticktes = ref(db, `Global Tickets`);
        onValue(pendingticktes, (dataSnap) => {
            setHeading(ticketType); // Set the heading from datatype prop
            

            try {
                const dataArray = [];

                dataSnap.forEach((childSnap) => {
                    const subsID = childSnap.val().userid;
                    const source = childSnap.val().source;
                    const createby = childSnap.val().generatedBy;
                    const creationdate = childSnap.val().assigndate;
                    const Time = childSnap.val().assigntime;
                    const Assign_to = childSnap.val().assignto;
                    const Description = childSnap.val().description;
                    const Concern = childSnap.val().ticketconcern;
                    const Status = childSnap.val().status;


                    dataArray.push({subsID, source, createby, creationdate, Time, Assign_to, Description, Concern, Status});

                        
                    
                });

                setArrayData(dataArray);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
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
                    isToday(data.assigndate)
                );
                break;
            case 'This Week':
                filteredArray = arrayData.filter((data) =>
                    isThisWeek(data.assigndate)
                );
                break;
            case 'This Month':
                filteredArray = arrayData.filter((data) =>
                    isThisMonth(data.assigndate)
                );
                break;
            case 'Last 7 Days':
                filteredArray = arrayData.filter(
                    (data) => data.assigndate >= subDays(currentDate, 7)
                );
                break;
            case 'Last 30 Days':
                filteredArray = arrayData.filter(
                    (data) => data.assigndate >= subDays(currentDate, 30)
                );
                break;
            default:
                break;
        }

        // if(word === 'Open'){
        //     filteredArray = filteredArray.filter((data) => data.Status === 'Open');
        // }else if(word === 'Unassigned'){
        //     filteredArray = filteredArray.filter((data) => data.Status === 'Unassigned');
        // }else{
        //     filteredArray = filteredArray.filter((data) => data.Status === 'Compeleted');
        // }
        setFilteredData(filteredArray);
    }, [filterPeriod, arrayData])
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
                            <th>Assign DateTime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterData.map(({subsID, source, createby, Concern, creationdate, Time, Description, Status  }, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{subsID}</td>
                                <td>{source}</td>
                                <td>{Concern}</td>
                                <td>{Status}</td>
                                <td>{Description}</td>
                                <td>{`"${creationdate}" at "${Time}"`}</td>
                                
                                
                                <td>
                                    <button className='btn btn-outline-success me-3'>Assign</button>
                                    <button className='btn btn-danger'>Cancel</button>
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
