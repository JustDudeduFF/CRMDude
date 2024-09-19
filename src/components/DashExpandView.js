import React, { useEffect, useState } from 'react';
import './ExpandView.css';
import { get, ref } from 'firebase/database';
import { db } from '../FirebaseConfig';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const heading = datatype;
    const word = heading.split(' ');
    const [arrayData, setArrayData] = useState([]);

    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
            const excelDateSerial = parseInt(input, 10);
            const baseDate = new Date('1900-01-01');
            const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);

            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        } else {
            return input; // return original input if it's not a valid Excel date serial number
        }
    }

    function isTomorrowDay(dueDate, currentDate) {
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // Set to tomorrow

        return (
            dueDate.getFullYear() === tomorrow.getFullYear() &&
            dueDate.getMonth() === tomorrow.getMonth() &&
            dueDate.getDate() === tomorrow.getDate()
        );
    }

    function isSameDay(dueDate, currentDate) {
        return (
            dueDate.getFullYear() === currentDate.getFullYear() &&
            dueDate.getMonth() === currentDate.getMonth() &&
            dueDate.getDate() === currentDate.getDate()
        );
    }

    const dataRef = ref(db, 'Subscriber');

    useEffect(() => {
        const fetchExpandData = async () => {
            try {
                const currentDate = new Date();
                const dataSnap = await get(dataRef);
                const dataArray = [];


                dataSnap.forEach((childSnap) => {
                    const expiryDateSerial = childSnap.child('connectionDetails').val().expiryDate;
                    const username = childSnap.val().username;

                    if (expiryDateSerial) {
                        const expiredDate = convertExcelDateSerial(expiryDateSerial);
                        const expDate = new Date(expiredDate);

                        // Conditional logic based on word[1]
                        if (word[1] === 'Today') {
                            // Check if the expiry date is today
                            if (isSameDay(expDate, currentDate)) {
                                dataArray.push({ username, expiredDate });
                            }
                        } else if (word[1] === 'Tomorrow') {
                            // Check if the expiry date is tomorrow
                            if (isTomorrowDay(expDate, currentDate)) {
                                dataArray.push({ username, expiredDate });
                            }
                        } else {
                            // Default case if word[1] doesn't match any known filter
                            // You can apply other logic here if necessary
                        }
                    
                    }
                });

                setArrayData(dataArray); // Update state with the filtered data
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchExpandData();
    }, []); // No need to include dataRef as it's static

    if (!show) return null;

    return (
        <div className="modal-body">
            <div className="modal-data">
                <div className="modal-inner">
                    <h4>{heading}</h4>
                    {/* Pass function from modalShow to close the modal */}
                    <button className="btn-close" onClick={modalShow}></button>
                </div>
                <div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>UserName</th>
                                <th>Mobile No.</th>
                                <th>Installations Address</th>
                                <th>Plan Name</th>
                                <th>Plan Amount</th>
                                <th>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {arrayData.length > 0 ? (
                                arrayData.map(({ username, expiredDate }, index) => (
                                    <tr key={index}>
                                        <td></td>
                                        <td>{username}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td>{expiredDate}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center' }}>
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
