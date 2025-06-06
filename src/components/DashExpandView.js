import React, { useEffect, useState, useCallback } from 'react';
import './ExpandView.css';
import { onValue, ref, set, update, get } from 'firebase/database';
import * as XLSX from 'xlsx';
import { api, db } from '../FirebaseConfig';
import ExcelIcon from './subscriberpage/drawables/xls.png'
import WhatsappIcon from './subscriberpage/drawables/whatsapp.png'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from 'react-loader-spinner';
import axios from 'axios';
import { usePermissions } from './PermissionProvider';

const DashExpandView = ({ show, datatype, modalShow }) => {
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();
    const [heading, setHeading] = useState('');
    const [arrayData, setArrayData] = useState([]);
    const [arrayplan, setArrayPlan] = useState([]);
    const [loader, setLoader] = useState(false);
    const [companyArray, setCompanyArray] = useState([]);
    const [selectCompany, setSelectCompany] = useState('All');
    const [filteredArray, setFilteredArray] = useState([]);

    //Download All Data to Excel File

    const downloadExcel =()=> {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(arrayData);

        XLSX.utils.book_append_sheet(workbook, worksheet, heading);
        XLSX.writeFile(workbook, `${heading} Data.xlsx`);
    }

    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // Matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
            const excelDateSerial = parseInt(input, 10);
            const baseDate = new Date("1900-01-01"); // Correct Excel base date
            const adjustedSerial = excelDateSerial - 1; // Adjust for Excel's leap year bug
            const date = new Date(baseDate.getTime() + adjustedSerial * 86400000);
            return date;
        } else {
            return new Date(input); // Return original input as Date object if it's not a valid Excel date serial number
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
        const fetchData = async() => {
            setHeading(datatype); // Set the heading from datatype prop
            const words = datatype.split(' ');
            const word = words[1]; // Get the second word
            const datafor = words[0];

            try {
                const response = await axios.get(api+'/subscriber');
                if(response.status !== 200) return;

                const responseData = response.data;
                if(responseData){
                    const currentDate = new Date();
                    const newCurrentdata = new Date(word);
                    const dataArray = [];
                    Object.keys(responseData).forEach((key) => {
                        const childSnap = responseData[key];

                        if(!childSnap || !childSnap.connectionDetails) return;

                        const {
                            username: username,
                            fullName: fullName,
                            mobileNo: mobile,
                            company: company,
                            installationAddress: installationAddress,
                            connectionDetails: {
                                planAmount: planAmount,
                                planName: planName,
                                dueAmount: dueAmount,
                                expiryDate: expiryDateSerial,
                                activationDate: activationDateSerial,
                                isp: isp
                            },
                            isTerminate: isterminated
                        } = childSnap;



                        if(datafor === 'Expiring'){
                            const expDate = convertExcelDateSerial(expiryDateSerial);
                            if (isSameDay(expDate, newCurrentdata)) {
                                dataArray.push({ username, expiredDate: expDate, fullName, mobile, installationAddress, planAmount, planName, company, isp });
                            }
                        }else if(datafor === 'Due'){
                            const expDate = convertExcelDateSerial(expiryDateSerial);
                            const actDate = convertExcelDateSerial(activationDateSerial);
                            const isSameMonth = actDate.getFullYear() === currentDate.getFullYear() && actDate.getMonth() === currentDate.getMonth();
                            if (word === 'Today' && isSameDay(actDate, currentDate) && dueAmount > 0) {
                                dataArray.push({ username, ActivationDate: actDate, fullName, mobile, installationAddress, planAmount: dueAmount, planName, company, isp, "status":isterminated === true ? "Terminated" : new Date(expDate) < new Date() ? "InActive" : "Active" });
                            } else if (word === 'Tomorrow' && isTomorrowDay(actDate, currentDate) && dueAmount > 0) {
                                dataArray.push({ username, ActivationDate: actDate, fullName, mobile, installationAddress, planAmount: dueAmount, planName, company, isp, "status":isterminated === true ? "Terminated" : new Date(expDate) < new Date() ? "InActive" : "Active" });
                            } else if (word === 'Week' && isSameISOWeek(actDate, currentDate) && dueAmount > 0) {
                                dataArray.push({ username, ActivationDate: actDate, fullName, mobile, installationAddress, planAmount: dueAmount, planName, company, isp, "status":isterminated === true ? "Terminated" : new Date(expDate) < new Date() ? "InActive" : "Active" });
                            } else if (word === 'Month' && isSameMonth && dueAmount > 0) {
                                dataArray.push({ username, ActivationDate: actDate, fullName, mobile, installationAddress, planAmount: dueAmount, planName, company, isp, "status":isterminated === true ? "Terminated" : new Date(expDate) < new Date() ? "InActive" : "Active" });
                            }else if(word === 'All' && dueAmount > 0){
                                dataArray.push({ username, ActivationDate: actDate, fullName, mobile, installationAddress, planAmount: dueAmount, planName, company, isp, "status":isterminated === true ? "Terminated" : new Date(expDate) < new Date() ? "InActive" : "Active" });
                            }
                        }
                    });

                    const company = [...new Set(dataArray.map((data) => data.company))];
                    setCompanyArray(company);
                    setArrayData(dataArray);
                }
                
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
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

    useEffect(() => {
        let filterArray = arrayData;

        if(selectCompany !== 'All'){
            filterArray = filterArray.filter((data) => data.company === selectCompany);
        }

        setFilteredArray(filterArray);
    }, [selectCompany, arrayData])

    const handleSavePlan = async (username, expireDate, planAmount, planName, mobile, fullName, company) => {
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
                const message = `Dear ${fullName},\nYour Plan ${planName}  ₹${planAmount}  Recharge Successfully for period of  ${date} to ${expireDate} thanks for being with us. For any query call ${company === 'Sigma - Greator Noida' ? '92661 55122' : '99991 18971'} SIGMA BUSINESS SOLUTIONS .`;
                const encodedMessage = encodeURIComponent(message);
                const response = await axios.post(api+`/send-message?number=91${mobile}&message=${encodedMessage}&company=${company}`);
                const responsemail = await axios.post(api+'/sendmail', {
                    to: "justdudehere@gmail.com",
                    subject: 'Broadband Subscription Renewal',
                    text: `Dear ${fullName},\nYour plan has been renewed successfully.\nYour new plan will be active from ${date} to ${expireDate}.\nYour Current Plan Amount is ₹${planAmount}.\n\nThank you for your business.\nRegards,\nSigma Business Solutions `,
                });
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

    const sendNotification =  async() => {
        if(heading.split(" ")[0] === "Expiring"){
            if(hasPermission("MSG_EXPIRING")){
                let date = new Date();
                date.setDate(date.getDate() + 1); // Add 1 day to the current date
                filteredArray.forEach(async(data) => {
                    const mobile = data.mobile;
                    const fullName = data.fullName;
                    const expire = data.expiredDate;
                    const planName = data.planName;
                    const newmessage = `Dear ${fullName.split(" ")[1]}\n\nWe hope you are enjoying your broadband experience with us! Your current plan is set to expire on ${new Date(expire).toLocaleDateString("en-GB", {day:'2-digit', month:'long', year:"numeric"})}. To continue enjoying uninterrupted internet service, we recommend renewing your plan today.\n\n*Plan Details:*\n- *Current Plan*: ${planName}\n- *Data Limit*: Unlimited\n- *Expiration Date*: ${new Date(expire).toLocaleDateString("en-GM", {day:'2-digit', month:'long', year:'numeric'})}\n\n*How to Renew:*\n\n- *Online*: Log in to your account at sigmanetworks.in/CustomerLogin and follow the renewal instructions.\n- *Mobile App*: Open our app, Click on "Renew Plan" and complete your payment.\n- *Whatsapp Bot Support*: Contact us 24x7 ${company === 'Sigma - Greator Noida' ? '9266155122' : '9266155122'}.\n\nStay connected with blazing-fast internet and uninterrupted service. Renew your plan today!\n\nBest regards,\n*Sigma Business Solutions*`;
                    const encoedeMessage = encodeURIComponent(newmessage);
                    const company = data.company;
                    
                    
                    await axios.post(api+`/send-message?number=91${mobile}&message=${encoedeMessage}&company=${company}`);
                });
            }else{
                alert("Permission Denied");
            }
        }
        

        if(heading.split(" ")[0] === "Due"){
            
            
            if(!hasPermission("MSG_EXPIRING")){
                let date = new Date();
                date.setDate(date.getDate() + 1); // Add 1 day to the1 current date
                filteredArray.forEach(async(data) => {
                    const mobile = data.mobile;
                    const fullName = data.fullName;
                    const amount = data.planAmount;
                    const username = data.username;
                    const company = data.company;
                    const message = `Hi ${fullName.split(" ")[1]},\n\nThis is a gentle reminder from *Sigma Business Solutions* regarding your broadband service account.\n\nBill Details:\n- *Account Number*: ${username}\n- *Due Amount*: ₹${amount}\n\nTo ensure uninterrupted service, kindly make the payment as early as possible. You can make the payment via login to sigmanetworks.in/CustomerLogin.\nYour Login Credentials is:\n- *UserName*: ${username}\n- *Password*: 123456}\n\nFor any assistance, feel free to contact us at ${company === 'Sigma - Greator Noida' ? '92661 55122' : '99991 18971'}.\n\nThank you for choosing\n*Sigma Business Soltions*!\nWe value your association with us.`;
                    const encodedMessage = encodeURIComponent(message);
                    await axios.post(api+`/send-message?number=91${mobile}&message=${encodedMessage}&company=${company}`); 
                });
            }else{
                alert("Permission Denied");
            }
        }
    }
        

    if (!show) return null;

    return (
        <div className="modal-body1">
            <div className="modal-data1">
                <div className="modal-inner1">
                    <h4 style={{flex:'1'}}>{heading}</h4>
                    <div style={{flex:'1', marginTop:'-10px', marginBottom:'5px'}} className='col-md-3'>
                        <label className='form-label'>Select Company</label>
                    <select onChange={(e) => setSelectCompany(e.target.value)} className='form-select'>
                        <option value='All'>All</option>
                        {
                            companyArray.map((data, index) => (
                                <option key={index} value={data}>{data}</option>
                            ))
                        }
                    </select>
                    </div>
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
                            {filteredArray.length > 0 ? (
                                filteredArray.map(({ username, expiredDate, fullName, mobile, installationAddress, planAmount, planName, company }, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td style={{maxWidth:'900px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{fullName}</td>
                                        <td>{username}</td>
                                        <td>{mobile}</td>
                                        <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{installationAddress}</td>

                                        <td style={{maxWidth:'180px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{planName}</td>
                                        <td>{planAmount}</td>
                                        <td>{new Date(expiredDate).toLocaleDateString('en-GB', {
                                            day:'2-digit',
                                            month:'short',
                                            year:'numeric'
                                        }).replace(',','')}</td>
                                        <td>
                                            <button onClick={() =>{ handleSavePlan(username, expiredDate, planAmount, planName, mobile, fullName, company);}} className='btn btn-outline-success'>{heading.split(' ')[0] === 'Expiring' ? 'Renew' : 'Collect'}</button>
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
