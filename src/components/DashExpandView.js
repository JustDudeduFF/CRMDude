import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref, set, update, get } from 'firebase/database';
import * as XLSX from 'xlsx';
import { db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'
import WhatsappIcon from './subscriberpage/drawables/whatsapp.png'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from 'react-loader-spinner';
import axios from 'axios';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const navigate = useNavigate();
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [arrayplan, setArrayPlan] = useState([]);
    const [loader, setLoader] = useState(false);

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

    const fetchPlans = useCallback(() => {
        const planRef = ref(db, `Master/Broadband Plan`);
        onValue(planRef, (planSnap) => {
            const planArray = [];
            planSnap.forEach((childSnap) => {
                const {planname, planamount, planperiod, periodtime} = childSnap.val();
                planArray.push({
                    planname, planamount, planperiod, periodtime
                });
            });
            setArrayPlan(planArray);
        });
    }, []);

    useEffect(() => {
        if (show) {
            fetchExpandData();
            fetchPlans();
        }
    }, [show, fetchExpandData, fetchPlans]); // Dependency on `show` and `fetchExpandData`

    const handleSavePlan = async (username, expireDate, planAmount, planName, mobile, fullName) => {
        setLoader(true);
        if (heading.split(' ')[0] === 'Expiring') {
            const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);
        const dueSnap = await get(dueRef);
        const dueamount = dueSnap.child('dueAmount').val();
        const isp = dueSnap.child('isp').val();
        const selectedPlanObj = arrayplan.find(plan => plan.planname === planName);

        if (selectedPlanObj) {
            const planperiod = selectedPlanObj.planperiod;
            const periodtime = selectedPlanObj.periodtime;

            const date = new Date(expireDate);
            if (planperiod === 'Months') {
                date.setMonth(date.getMonth() + parseInt(periodtime));
            } else if (planperiod === 'Years') {
                date.setFullYear(date.getFullYear() + parseInt(periodtime));
            } else if (planperiod === 'Days') {
                date.setDate(date.getDate() + parseInt(periodtime));
            }

            const formattedExpirationDate = date.toISOString().split('T')[0];
            const expdate = formattedExpirationDate;
            const newDue = parseInt(dueamount) + parseInt(planAmount);
            const renewactdate = new Date(expireDate);
            renewactdate.setDate(renewactdate.getDate() + 1);
            const formattedRenewActDate = renewactdate.toISOString().split('T')[0];

            const ledgerData = {
                type: 'Renewal',
                date: new Date().toISOString().split('T')[0],
                particular: `${planName} From ${formattedRenewActDate} to ${expdate}`,
                debitamount: parseInt(planAmount),
                creditamount: 0,
            };

            const planinfo = {
                compeletedate: new Date().toISOString().split('T')[0],
                planName: planName,
                planAmount: parseInt(planAmount),
                isp: isp,
                activationDate: formattedRenewActDate,
                expiryDate: expdate,
                action: 'Renewal',
                completedby: localStorage.getItem('Name'),
                remarks: 'Quick Renew',
            };

            const newconnectioninfo = {
                activationDate: formattedRenewActDate,
                expiryDate: expdate,
                dueAmount: newDue,
            };

            const sendMessage = async (mobile, planName, fullName, expireDate, planAmount, date) => {
                const message = `Dear ${fullName},\nYour Plan ${planName}  ₹${planAmount}  Recharge Successfully for period of  ${date} to ${expireDate} thanks for being with us. For any query call (9999118971) SIGMA BUSINESS SOLUTIONS .`;
                const encodedMessage = encodeURIComponent(message);
                const response = await axios.post(`https://finer-chimp-heavily.ngrok-free.app/send-message?number=91${mobile}&message=${encodedMessage}`);
                const responsemail = await axios.post('https://finer-chimp-heavily.ngrok-free.app/sendmail', {
                    to: "justdudehere@gmail.com",
                    subject: 'Broadband Subscription Renewal',
                    text: `Dear ${fullName},\nYour plan has been renewed successfully.\nYour new plan will be active from ${date} to ${expireDate}.\nYour Current Plan Amount is ₹${planAmount}.\n\nThank you for your business.\nRegards,\nSigma Business Solutions `,
                });
                
                console.log(response, responsemail);
            }

            await set(ref(db, `Subscriber/${username}/ledger/${Date.now()}`), ledgerData);
            await set(ref(db, `Subscriber/${username}/planinfo/${Date.now()}`), planinfo);
            await update(dueRef, newconnectioninfo).then(() => {
                sendMessage(mobile, planName, fullName, expireDate, planAmount, ledgerData.date);
                setLoader(false);
                toast.success('Plan Renewed!', {
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                    progress: undefined,
                })
            });
        }else{
            setLoader(false);
            toast.error('Plan Not Found!', {
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        }else if (heading.split(' ')[0] === 'Due') {
            localStorage.setItem('susbsUserid', username)
            navigate('subscriber/paymentreceipt/collect', { state: { username } });
        }
    };

    const sendNotification =  () => {   
        let date = new Date();
        date.setDate(date.getDate() + 1); // Add 1 day to the current date
        arrayData.forEach(async(data) => {
            const mobile = data.mobile;
            const fullName = data.fullName;
            const expire = data.expiredDate;
            const message = `Reminder!!\n\nDear ${fullName},\nYour Internet Plan will expire ${expire}.\n\nkindly Renew it now.\n\nPlease call our customer care number 9999118971 for more information.\n\nSigma Business Solutions\n`;
            const encoedeMessage = encodeURIComponent(message);
            
            
            const response = await axios.post(`https://finer-chimp-heavily.ngrok-free.app/send-message?number=91${mobile}&message=${encoedeMessage}`);
        });
    }

    if (!show) return null;

    return (
        <div className="modal-body1">
            <div className="modal-data1">
                <div className="modal-inner1">
                    <h4 style={{flex:'1'}}>{heading}</h4>
                    <img onClick={sendNotification} src={WhatsappIcon} alt='whatsapp' className='img_download_icon'></img>
                    <img onClick={downloadExcel} src={ExcelIcon} alt='excel' className='img_download_icon'></img>
                    <button style={{right:'5%'}} className="btn-close" onClick={modalShow}></button>
                    <ToastContainer style={{marginTop:'4%'}}/>
                    {loader &&
                        <div className="spinner-wrapper" style={{position: 'fixed', width: '100%',top:'0' ,  height: '100%', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity:'0.5', zIndex:'900'}}>
                        <div style={{width: '200px', height: '100px', position:'fixed'}}>
                        <ProgressBar
                            height="80"
                            width="80"
                            radius="9"
                            color="blue"
                            ariaLabel="three-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        /><br></br>
                        <label style={{color:'white', fontSize:'17px'}}>Loading Data...</label>
                        </div>
                        </div>
                        
                    }
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
                                        <td style={{maxWidth:'900px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{fullName}</td>
                                        <td>{username}</td>
                                        <td>{mobile}</td>
                                        <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{installationAddress}</td>

                                        <td style={{maxWidth:'180px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{planName}</td>
                                        <td>{planAmount}</td>
                                        <td>{expiredDate}</td>
                                        <td>
                                            <button onClick={() =>{ handleSavePlan(username, expiredDate, planAmount, planName, mobile, fullName);}} className='btn btn-outline-success'>{heading.split(' ')[0] === 'Expiring' ? 'Renew' : 'Collect'}</button>
                                        </td>
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
