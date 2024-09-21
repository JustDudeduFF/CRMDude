import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref } from 'firebase/database';
import * as XLSX from 'xlsx';
import { db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'

const DashExpandView = ({ show, datatype, modalShow }) => {
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);

    //Download All Data to Excel File

    const downloadExcel =()=> {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);

        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    }

    // Function to convert Excel date serial number to a Date object
    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
            const excelDateSerial = parseInt(input, 10);
            const baseDate = new Date("1900-01-01"); // Correct Excel base date
            const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);
            return date;
        } else {
            return new Date(input); // return original input as Date object if it's not a valid Excel date serial number
        }
    }

    function isSameISOWeek(dueDate, currentDate) {
        const dueWeek = getISOWeek(dueDate);
        const currentWeek = getISOWeek(currentDate);
        return dueWeek === currentWeek && dueDate.getFullYear() === currentDate.getFullYear();
    }

    function getISOWeek(date) {
        const tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7)); // ISO week starts on Monday
        const yearStart = new Date(tempDate.getFullYear(), 0, 1);
        return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    }

    function isTomorrowDay(dueDate, currentDate) {
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // Set to tomorrow
        return dueDate.toDateString() === tomorrow.toDateString();
    }

    function isSameDay(dueDate, currentDate) {
        return dueDate.toDateString() === currentDate.toDateString();
    }

    const fetchExpandData = useCallback(() => {
        const dataRef = ref(db, 'Subscriber');
        onValue(dataRef, (dataSnap) => {
            setHeading(datatype); // Set the heading from datatype prop
            const words = datatype.split(' ');
            const word = words[1]; // Get the second word
            const datafor = words[0];

            try {
                const currentDate = new Date();
                const dataArray = [];

                dataSnap.forEach((childSnap) => {
                    const expiryDateSerial = convertExcelDateSerial(childSnap.child('connectionDetails').val().expiryDate);
                    const activationDateSerial = convertExcelDateSerial(childSnap.child('connectionDetails').val().activationDate);
                    const username = childSnap.val().username;
                    const fullName = childSnap.val().fullName;
                    const mobile = childSnap.val().mobileNo;
                    const installationAddress = childSnap.val().installationAddress;
                    const planAmount = childSnap.child('connectionDetails').val().planAmount;
                    const planName = childSnap.child('connectionDetails').val().planName;
                    const dueAmount = childSnap.child('connectionDetails').val().dueAmount;

                    if(datafor === 'Expiring'){
                        const expDate = expiryDateSerial;
                        const isSameMonth = expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() === currentDate.getMonth();
                        if (word === 'Today' && isSameDay(expDate, currentDate)) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount, planName });
                        } else if (word === 'Tomorrow' && isTomorrowDay(expDate, currentDate)) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount, planName });
                        } else if (word === 'Week' && isSameISOWeek(expDate, currentDate)) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount, planName });
                        } else if (word === 'Month' && isSameMonth) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount, planName });
                        }
                    }else if(datafor === 'Due'){
                        const expDate = activationDateSerial;
                        const isSameMonth = expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() === currentDate.getMonth();
                        if (word === 'Today' && isSameDay(expDate, currentDate) && dueAmount > 0) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount: dueAmount, planName });
                        } else if (word === 'Tomorrow' && isTomorrowDay(expDate, currentDate) && dueAmount > 0) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount: dueAmount, planName });
                        } else if (word === 'Week' && isSameISOWeek(expDate, currentDate) && dueAmount > 0) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount: dueAmount, planName });
                        } else if (word === 'Month' && isSameMonth && dueAmount > 0) {
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount: dueAmount, planName });
                        }else if(word === 'All' && dueAmount > 0){
                            dataArray.push({ username, expiredDate: expDate.toISOString().split('T')[0], fullName, mobile, installationAddress, planAmount: dueAmount, planName });
                        }
                    }
                        
                    
                });

                setArrayData(dataArray);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        });
    }, [datatype]);

    useEffect(() => {
        if (show) {
            fetchExpandData();
        }
    }, [show, fetchExpandData]); // Dependency on `show` and `fetchExpandData`

    if (!show) return null;

    return (
        <div className="modal-body">
            <div className="modal-data">
                <div className="modal-inner">
                    <h4 style={{flex:'1'}}>{heading}</h4>
                    <img onClick={downloadExcel} src={ExcelIcon} alt='excel' className='img_download_icon'></img>
                    <button style={{right:'5%'}} className="btn-close" onClick={modalShow}></button>
                    
                </div>
                <div style={{ overflow: 'hidden', height: '80vh', overflowY: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>S. No.</th>
                                <th>Customer Name</th>
                                <th>UserName</th>
                                <th>Mobile No.</th>
                                <th>Installation Address</th>
                                <th>Plan Name</th>
                                <th>{heading.split(' ')[0] === 'Expiring' ? 'Plan Amount' : 'Due Amount'}</th>
                                <th>{heading.split(' ')[0] === 'Expiring' ? 'Expiry Date' : 'Activate Date'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arrayData.length > 0 ? (
                                arrayData.map(({ username, expiredDate, fullName, mobile, installationAddress, planAmount, planName }, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{fullName}</td>
                                        <td>{username}</td>
                                        <td>{mobile}</td>
                                        <td>{installationAddress}</td>
                                        <td>{planName}</td>
                                        <td>{planAmount}</td>
                                        <td>{expiredDate}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center' }}>
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashExpandView;
