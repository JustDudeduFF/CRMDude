import React, { useEffect, useState } from 'react'
import Router_Img from './subscriberpage/drawables/wireless-router.png'
import Rupee_Icon from './subscriberpage/drawables/rupee.png'
import DueRupee_Icon from './subscriberpage/drawables/rupeenew.png'
import Tickets_Icon from './subscriberpage/drawables/complain.png'
import ExcelIcon from './subscriberpage/drawables/xls.png'
import {db} from '../FirebaseConfig'
import { ref } from 'firebase/database';
import { onValue } from 'firebase/database'
import DashExpandView from './DashExpandView'
import ExpandIcon from './subscriberpage/drawables/expand-arrows.png'
import ExpandTickets from './ExpandTickets'
import ExpandRevenue from './ExpandRevenue'
import { useNavigate } from 'react-router-dom';
import DashSecDiv from './DashSecDiv';
import { usePermissions } from './PermissionProvider'
import { Modal } from 'react-bootstrap'
import axios from 'axios'
import { isThisISOWeek, isThisMonth, isToday, isYesterday, parseISO } from 'date-fns'
import * as XLSX from 'xlsx';
import ExpiredUsersBarChart from './ExpiredUsersBarChart'

export default function DashFirstDiv() {
    const navigate = useNavigate();
    const {hasPermission} = usePermissions();

    const [openticktes, setOpenTickets] = useState(0);
    const [unassignedtickets, setUnassignedTickets] = useState(0);
    const [closedtickets, setCloseTickets] = useState(0);

    const [dueArrayWeek, setDueArrayWeek] = useState(0);
    const [dueArrayMonth, setDueArrayMonth] = useState(0);
    const [dueArrayToday, setDueArrayToday] = useState(0);

    const [revenueMonth, setRevenueMonth] = useState(0);
    const [revenueToday, setRevenueToday] = useState(0);
    const [revenueCash, setRevenueCash] = useState(0);
    const [revenueOnline, setRevenueOnline] = useState(0);
    const [last5days, setLast5days] = useState({});
    const [upcoming5days, setUpcoming5Dats] = useState({});

    

    const [showExpanView, setShowExpandView] = useState(false);
    const [expandDataType, setExpandDataType] = useState('');

    const [showTicketExpand, setShowTicketExpand] = useState(false);
    const [ticketsType, setTicketType] = useState('');

    const [showrevenueexpand, setRevenueExpand] = useState(false);

    const [arryadue, setDueArray] = useState(0);

    const [attendenceArray, setAttendenceArray] = useState([]);
    const [state, setState] = useState({
            companyArray: [],
            installationArray: [],
            newInstallations: 0,
            newInstallationsToday: 0,
            newInstallationsWeek: 0,
    });
    const [followupArray, setFollowUpArray] = useState([]);
    const [filteIns, setFilterIns] = useState({
        company: 'All',
        day: 'Month'
    });
    const [filterInsArray, setFilterInsArray] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [showInsModal, setShowInsModal] =  useState(false);

    // const setStatusBasedOnExpiry = (expiryDate) => {
    //     const currentDate = new Date(); // Get the current date
    //     const expiry = new Date(expiryDate); // Convert expiry date to a Date object
    
    //     return currentDate <= expiry ? "Active" : "Inactive";
    // };

    const downloadExcel =()=> {
        const extractedData = filterInsArray.map((item, index) => ({
            "S No.": index + 1,
            "Customer Name": item.fullName,
            "Mobile": item.mobileNo,
            "Installation Address": item.installationAddress,
            "Email": item.email,
            "Registration Date": item.createdAt,
            "Plan Name": item.connectionDetails.planName,
            "Plan Amount": item.connectionDetails.planAmount,
            "Colony": item.colonyName,
            "Company": item.company,
            "Activation Date": new Date(item.connectionDetails.activationDate).toISOString().split('T')[0],
            "Expiry Date": new Date(item.connectionDetails.expiryDate).toISOString().split('T')[0],
            "ISP": item.connectionDetails.isp,
            "Status":item.isTerminate === true ? "Terminated" : new Date(item.connectionDetails?.expiryDate) < new Date() ? "InActive" : "Active"
 
        }));


        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(extractedData);

        
        XLSX.utils.book_append_sheet(workbook, worksheet, "Installation");
        XLSX.writeFile(workbook, `Installation Data.xlsx`);
    }    



    const pendingticktes = ref(db, `Global Tickets`);
    // const dueRef = ref(db, `Subscriber`);
    const attendenceRef = ref(db, `Payroll/Attendence`);
    const usersRef = ref(db, `users`);

    // function convertExcelDateSerial(input) {
    //     const excelDateSerialPattern = /^\d+$/; // matches only digits (Excel date serial number)
    //     if (excelDateSerialPattern.test(input)) {
    //       const excelDateSerial = parseInt(input, 10);
    //       const baseDate = new Date("1900-01-01");
    //       const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);
      
    //       const day = date.getDate().toString().padStart(2, "0");
    //       const month = (date.getMonth() + 1).toString().padStart(2, "0");
    //       const year = date.getFullYear();
    //       return `${year}-${month}-${day}`;
    //     } else {
    //       return input; // return original input if it's not a valid Excel date serial number
    //     }
    //   }

      const getLast5DaysExpiredDetails = (data) => {
        const result = {};
      
        // Loop through the 'last5days' object
        Object.keys(data.last5days).forEach((date) => {
          const expiredUsers = data.last5days[date];  // Array of expired users for each date
          result[date] = expiredUsers.length;  // Count users per day
        });
      
        return result;  // Return the count of expired users per day
      };

      const getUpcoming5DaysRenewalDetails = (data) => {
        const result = {};
      
        // Loop through the 'last5days' object
        Object.keys(data.upcoming5days).forEach((date) => {
          const expiredUsers = data.upcoming5days[date];  // Array of expired users for each date
          result[date] = expiredUsers.length;  // Count users per day
        });
      
        return result;
      }

    // function isSameISOWeek(dueDate, currentDate) {
    //     const dueWeek = getISOWeek(dueDate);
    //     const currentWeek = getISOWeek(currentDate);
    //     return dueWeek === currentWeek && dueDate.getFullYear() === currentDate.getFullYear();
    // }
    
    // Helper function to get the ISO week number (1-52)
    // function getISOWeek(date) {
    //     const tempDate = new Date(date);
    //     tempDate.setHours(0, 0, 0, 0);
    //     tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7)); // ISO week starts on Monday
    //     const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    //     return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    // }

    // function isSameDay(dueDate, currentDate) {
    //     return (
    //         dueDate.getFullYear() === currentDate.getFullYear() &&
    //         dueDate.getMonth() === currentDate.getMonth() &&
    //         dueDate.getDate() === currentDate.getDate()
    //     );
    // }


    useEffect(() => {
        setIsLoading(true);
        
        
        // const promises = [
        //     new Promise(resolve => {
        //         const unsubscribe = onValue(pendingticktes, (ticketsSnap) => {
        //             if(ticketsSnap.exists()){
        //                 let open = 0;
        //                 let unassigned = 0;
        //                 let closed = 0;
                        
        //                 ticketsSnap.forEach(child => {
        //                     const ticketno = child.val().status;
        //                     if(ticketno === 'Pending'){
        //                         open++;
        //                     }else if(ticketno === 'Completed'){
        //                         closed++
        //                     }else if(ticketno === 'Unassigned'){
        //                         unassigned++
        //                     }

        //                 });
        //                 setOpenTickets(open);
        //                 setCloseTickets(closed);
        //                 setUnassignedTickets(unassigned);
        //             }
        //             resolve();
        //         });
        //         return () => unsubscribe();
        //     }),
            
        //     // new Promise(resolve => {
        //     //     const unsubscribe = onValue(dueRef, (dueSnap) => {
        //     //         const currentDate = new Date();
        //     //         const dueArray = [];
        //     //         const dueArrayMonth = [];
        //     //         const dueArrayWeek = [];
        //     //         const dueArrayToday = [];
        //     //         dueSnap.forEach(childSnap => {
        //     //             const dueAmount = childSnap.child('connectionDetails').val().dueAmount;
        //     //             dueArray.push(dueAmount);
        //     //             const dueDateTimestamp = convertExcelDateSerial(childSnap.child('connectionDetails').val().activationDate);

        //     //                 const totalDue = dueArray.reduce((acc, current) => acc + current, 0);
        //     //                 setDueArray(totalDue); 



        //     //             if (dueDateTimestamp) {
        //     //                 const dueDate = new Date(dueDateTimestamp);
                            
        //     //                 // For month comparison
        //     //                 const isSameMonth = dueDate.getFullYear() === currentDate.getFullYear() && dueDate.getMonth() === currentDate.getMonth();
        //     //                 if (isSameMonth) {
        //     //                     dueArrayMonth.push(dueAmount);
        //     //                 }
                            
        //     //                 // For week comparison (ISO week calculation)
        //     //                 const isSameWeek = isSameISOWeek(dueDate, currentDate);
        //     //                 if (isSameWeek) {
        //     //                     dueArrayWeek.push(dueAmount);
        //     //                 }

        //     //                 // For today's comparison
        //     //                 const isToday = isSameDay(dueDate, currentDate);
        //     //                 if (isToday) {
        //     //                     dueArrayToday.push(dueAmount);
        //     //                 }
        //     //             }
        //     //         });
                    
        //     //         // Total dues for the current month
        //     //         const totalDueMonth = dueArrayMonth.reduce((acc, current) => acc + current, 0);
                    
        //     //         // Total dues for the current week
        //     //         const totalDueWeek = dueArrayWeek.reduce((acc, current) => acc + current, 0);

        //     //         const totalDueToday = dueArrayToday.reduce((acc, current) => acc + current, 0);
                    
        //     //         // Set the total dues (you can store them separately)
        //     //         setDueArrayMonth(totalDueMonth);
        //     //         setDueArrayWeek(totalDueWeek);
        //     //         setDueArrayToday(totalDueToday);
        //     //         resolve();
        //     //     });
        //     //     return () => unsubscribe();
        //     // }),
            
        //     // new Promise(resolve => {
        //     //     const unsubscribe = onValue(dueRef, (revenueSnap) => {
        //     //         const currentDate = new Date();
        //     //         const MonthArray = [];
        //     //         const CashArray = [];
        //     //         const TodayArray = [];
        //     //         const OnlineArray = [];
        //     //         revenueSnap.forEach((childSnap) => {
        //     //             const monthData = childSnap.child('payments');
        //     //             monthData.forEach((newChild) => {
        //     //                 const {receiptDate, paymentMode, amount} = newChild.val();

        //     //                 if(receiptDate) {
        //     //                     const date = new Date(receiptDate);
        //     //                     const isSameMonth = date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth();
        //     //                     if(isSameMonth) {
        //     //                         MonthArray.push(parseInt(amount));
        //     //                     }

        //     //                     const isToday =     (date, currentDate);
        //     //                     if(isToday) {
        //     //                         TodayArray.push(parseInt(amount));
        //     //                     }

        //     //                     const isCash = paymentMode === 'Cash';
        //     //                     if(isSameMonth && isCash) {
        //     //                         CashArray.push(parseInt(amount));
        //     //                     }

        //     //                     const isOnline = paymentMode !== 'Cash';
        //     //                     if(isSameMonth && isOnline) {
        //     //                         OnlineArray.push(parseInt(amount));
        //     //                     }
        //     //                 }

        //     //             });
        //     //         });

                    
        //     //         const totalMonthRevenue = MonthArray.reduce((acc, current) => acc + current, 0);
        //     //         const totaltodayRevenue = TodayArray.reduce((acc, current) => acc + current, 0);
        //     //         const totalcashRevenue = CashArray.reduce((acc, current) => acc + current, 0);
        //     //         const totalonlineRevenue = OnlineArray.reduce((acc, current) => acc + current, 0);
        //     //         setRevenueOnline(totalonlineRevenue);
        //     //         setRevenueCash(totalcashRevenue);
        //     //         setRevenueToday(totaltodayRevenue);
        //     //         setRevenueMonth(totalMonthRevenue);
        //     //         resolve();
        //     //     });
        //     //     return () => unsubscribe();
        //     // }),
        // ];

        // Promise.all(promises)
        //     .then(() => setIsLoading(false))
        //     .catch(error => {
        //         console.error('Error loading data:', error);
        //         setIsLoading(false);
        //     });
            fetchData(); 

    }, []);

    function openPayroll(){
        navigate('payrollandattendence');
    }

    const fetchData = async() =>  {

        const currentYear = new Date().getFullYear();
        const currentMonth = (new Date().getMonth() + 1);
        const currentDate = new Date().getDate();
        // First get all users
        onValue(usersRef, (usersSnap) => {
            const newUsersMap = new Map();
            usersSnap.forEach(userSnap => {
                const userData = userSnap.val();
                newUsersMap.set(userSnap.key, {
                    fullname: userData.FULLNAME,
                    contact: userData.MOBILE,
                    userId: userSnap.key
                });
            });
            // Then fetch attendance data
            onValue(attendenceRef, attendenceSnap => {
                const attendenceArray = [];
                

                // First, add all users with default "Absent" status
                newUsersMap.forEach((userData, userId) => {
                    attendenceArray.push({
                        fullname: userData.fullname,
                        intime: "--:--",
                        status: "Absent",
                        userId: userId
                    });
                });

                // Then update status for users who have attendance
                attendenceSnap.forEach(childSnap => {
                    const yearData = childSnap.child(String(currentYear));
                    const monthData = yearData.child(String(currentMonth).padStart(2, '0'));
                    const dateData = monthData.child(String(currentDate).padStart(2, '0'));
                    
                    if (dateData.exists()) {
                        const attendanceData = dateData.val();
                        const userKey = childSnap.key;
                        
                        // Find the user in attendenceArray and update their status
                        const userIndex = attendenceArray.findIndex(item => item.userId === userKey);
                        if (userIndex !== -1) {
                            const intime = attendanceData.intime.toString().padStart(2, '0');
                            const inmin = attendanceData.inmin;
                            
                            attendenceArray[userIndex] = {
                                ...attendenceArray[userIndex],
                                intime: `${intime}:${inmin}`,
                                status: attendanceData.status || "Absent"
                            };
                        }
                    }
                    
                });

                setAttendenceArray(attendenceArray);
            });
        });

        try {
            // Run all API calls concurrently using Promise.all
            const [subscriberResponse, last5daysResponse, upcoming5daysResponse, myfollows, dashrevenue, dashdue, dashticket] = await Promise.all([
                axios.get('https://api.justdude.in/subscriber?data=newinstallation'),
                axios.get('https://api.justdude.in/expired?expire=last5days'),
                axios.get('https://api.justdude.in/expired?expire=upcoming5days'),
                axios.get(`https://api.justdude.in/users/${localStorage.getItem('contact')}?data=followup`),
                axios.get(`https://api.justdude.in/subscriber/revenue?count=dashboard`),
                axios.get(`https://api.justdude.in/dueAmount?data=dashboard`),
                axios.get(`https://api.justdude.in/tickets?data=count`),
                


            ]);
        
            // Check for response status once
            if (
                subscriberResponse.status !== 200 ||
                last5daysResponse.status !== 200 ||
                upcoming5daysResponse.status !== 200 ||
                myfollows.status !== 200 ||
                dashrevenue.status !==200 ||
                dashdue.status !== 200 || 
                dashticket.status !== 200
            ) {
                console.error('One or more API calls failed.');
                return;
            }
        
            // Process subscriber data
            const subsData = subscriberResponse.data;
            if (subsData) {
                const newInstallations = subsData.newInstallations;
                const newInstallationsToday = subsData.newInstallationsToday;
                const newInstallationsWeek = subsData.newInstallationsWeek;
        
                // Batch state updates
                setState((prevState) => ({
                    ...prevState,
                    companyArray: subsData.companyArray,
                    installationArray: subsData.installationArray,
                    newInstallations,
                    newInstallationsToday,
                    newInstallationsWeek
                    
                }));
            }
        
            // Process last 5 days expired data
            const expire5days = last5daysResponse.data;
            if (expire5days) {
                setLast5days(getLast5DaysExpiredDetails(expire5days));
            }
        
            // Process upcoming 5 days renewal data
            const renewal5days = upcoming5daysResponse.data;
            if (renewal5days) {
                setUpcoming5Dats(getUpcoming5DaysRenewalDetails(renewal5days));
            }

            const myFollowUp = myfollows.data.MyFollows;
            if(myFollowUp){
                const array = [];
                Object.keys(myFollowUp).forEach((key) => {
                    const follow = myFollowUp[key];
                    const status = follow.status;

                    if(status === 'pending'){
                        array.push(follow);
                    }
                    
                });
                setFollowUpArray(array);
            }
            
            const dashRevenue = dashrevenue.data;
            if(dashRevenue){
                setRevenueOnline(dashRevenue.onlineAmount);
                setRevenueCash(dashRevenue.cashAmount);
                setRevenueToday(dashRevenue.todayAmount);
                setRevenueMonth(dashRevenue.monthWise);            
            }

            const dashDue = dashdue.data;
            if(dashDue){
                setDueArrayMonth(dashDue.totalMonth);
                setDueArrayWeek(dashDue.totalWeek);
                setDueArrayToday(dashDue.totalToday);   
                setDueArray(dashDue.totalAll);      
            }

            const dashTicket = dashticket.data;
            if(dashTicket){
                setOpenTickets(dashTicket.open);
                setCloseTickets(dashTicket.closed);
                setUnassignedTickets(dashTicket.unassigned);
            }                
        } catch (e) {
            console.error('Error fetching data:', e);
        } finally{
            setIsLoading(false);
        }
        
        
    };

    function formatRevenue(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    const isValidDate = (dateString) => {
        return dateString && typeof dateString === 'string' && dateString.trim() !== '';
      };

    useEffect(() => {
        let filterArray = state.installationArray;

        if(filteIns.company !== "All"){
            filterArray = filterArray.filter((data) => data.company === filteIns.company);
        }

        if(filteIns.day !== "Month"){
            switch(filteIns.day){
                case 'Month':
                    filterArray = filterArray.filter((data) => 
                    isValidDate(data.createdAt) && isThisMonth(parseISO(data.createdAt))
                );
                break;
                case 'Today':
                    filterArray = filterArray.filter((data) => 
                    isValidDate(data.createdAt) && isToday(parseISO(data.createdAt))
                );
                break;
                case 'Yesterday':
                    filterArray = filterArray.filter((data) => 
                    isValidDate(data.createdAt) && isYesterday(data.createdAt)
                );
                break;
                case 'This Week':
                    filterArray = filterArray.filter((data) => 
                        isValidDate(data.createdAt) && isThisISOWeek(parseISO(data.createdAt))
                    );
                break;
                
            }
        }

        setFilterInsArray(filterArray);
    }, [filteIns, state.installationArray]);

    return (
        <>
        {isLoading ? (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading dashboard data...</p>
                </div>
            ) : (
                <div style={{width: '100%', display:'flex', flexDirection: 'column', marginTop: '4%', padding: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                    {
                        hasPermission("VIEW_ATTENDENCE") ? (
                            <div style={{ borderRadius: '5px', border: '1px solid gray', flex:'1'}}>
                                <img onClick={() => openPayroll()} alt='' style={{width:'20px', height:'20px',float:'right', marginTop:'5px', marginRight:'8px', cursor:'pointer'}} src={ExpandIcon}></img>
                                <h3 style={{marginLeft: '10px'}}>Daily Attendence Logs</h3>
                                <div style={{maxHeight: '600px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                                <table className="table">
                                    <thead className='table-primary'>
                                        <tr>
                                        <th scope="col">S. No.</th>
                                        <th scope="col">FullName</th>
                                        <th scope="col">InTime</th>
                                        <th scope="col">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table-group-divider">
                                    {attendenceArray.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.fullname}</td>
                                            <td>{item.intime}</td>
                                            <td>
                                                <span className={item.status === "Absent" ? "badge text-bg-danger" : item.status === "Present" ? "badge text-bg-success" : "badge text-bg-warning"}>{item.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    </table>
                                </div>
                                
                            </div>
                        ) : (
                            <div style={{width: '500px',  marginLeft: '20px', flex:'1', display:'flex', flexDirection: 'column'}}>
                                <div style={{borderRadius: '5px', border: '1px solid gray',flex: '1'}}>
                                <h3 style={{color: 'black', marginLeft: '10px'}}>Expired Users</h3>
                                    {Object.keys(last5days).length > 0 ? (
                                        <ExpiredUsersBarChart data={last5days} type={"expire"} />
                                    ) : (
                                        <p>Loading chart...</p>
                                    )}     
                                </div> 

                                <div style={{flex:'1', border: '1px solid gray', borderRadius: '5px', marginTop: '10px'}}>
                                    <h3 style={{color: 'black', marginLeft: '10px'}}>My Follows</h3>
                                    <div style={{Height: '300px', maxHeight:'300px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                                        <table className="table">
                                            <thead className='table-primary' style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                                                <tr>
                                                    <th scope="col">S. No.</th>
                                                    <th scope="col">User ID</th>
                                                    <th scope="col">Description</th>
                                                    <th scope="col">Particular</th>
                                                </tr>
                                            </thead>
                                            <tbody className="table-group-divider">
                                                {followupArray.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td style={{cursor:'pointer', color: 'blue', fontWeight:'bold'}} onClick={() => {
                                                            const userKey = item.userid;
                                                            localStorage.setItem('susbsUserid',userKey);
                                                            navigate('subscriber/remarkfollow', { state: { userKey } })
                                                        }}>{item.userid}</td>
                                                        <td style={{maxWidth:'200px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{item.description}</td>
                                                        <td>{item.particular}</td>  
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        )
                    }
                    <div style={{width: '500px',  marginLeft: '20px', flex:'1', display:'flex', flexDirection: 'column'}}>
                        <div style={{borderRadius: '5px', border: '1px solid gray',flex: '1'}}>
                        
                            <h3 style={{marginLeft: '10px'}}>Upcoming Renewal</h3>
                            {Object.keys(upcoming5days).length > 0 ? (
                                 <ExpiredUsersBarChart data={upcoming5days} type={"renewal"}/>
                                ) : (
                                    <p>Loading chart...</p>
                                )}       
                        </div>
                        <DashExpandView show={showExpanView} datatype={expandDataType} modalShow={() => setShowExpandView(false)}/>
                        <ExpandTickets viewShow={showTicketExpand} ticketType={ticketsType} closeView={() => setShowTicketExpand(false)}/>
                        <ExpandRevenue show={showrevenueexpand} modalShow={() => setRevenueExpand(false)}/>
                        <div style={{borderRadius: '5px',flex: '1', marginTop: '15px', boxShadow: '0 0 7px violet'}}>
                            <img alt='' className='img_boldicon' src={Router_Img}></img>
                            <label style={{marginLeft: '20px', fontSize: '25px'}}>New Installations</label> 
                            <span onClick={() => setShowInsModal(true)} style={{marginRight: '100px', fontSize: '30px', float: 'right', marginTop: '20px', color: 'green', borderBottom: '2px solid gray', cursor:'pointer'}}>{state.newInstallations}</span>
                            <div style={{display: 'flex', flexDirection: 'row', margin: '20px', height: '80px'}}>
                                <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                                    <h3>{state.newInstallationsToday}</h3>
                                    <h5 style={{color: 'gray'}}>Today's Installations</h5>
                                </div>
                                <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                                <h3>{state.newInstallationsWeek}</h3>
                                <h5 style={{color: 'gray'}}>Weekly Installations</h5>
                                </div>
                            </div>


                        </div>

                    </div>

                    <div style={{width: '500px', marginLeft: '20px', flex:'1', display: 'flex', flexDirection: 'column'}}>
                        <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{flex: '1', width: '60px'}}>
                                    <img alt='' className='img_boldicon' src={Rupee_Icon}></img>
                                </div>
                                <div style={{flex:'3', marginTop: '10px'}}>
                                    <img alt='' onClick={() => {setRevenueExpand(true)}} style={{width:'20px', height:'20px',float:'right', marginTop:'5px', marginRight:'8px', cursor:'pointer'}} src={ExpandIcon}></img>
                                    <h3>{`₹${formatRevenue(revenueMonth)}.00`}</h3>
                                    <label style={{color: 'gray'}}>This Month Revenue</label>
                                </div> 

                            </div>
                            <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                    <h5>{`₹${formatRevenue(revenueToday)}.00`}</h5>
                                    <label style={{color: 'gray'}} >Today's Revenue</label>
                                </div>
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                <h5>{`₹${formatRevenue(revenueCash)}.00`}</h5>
                                <label style={{color: 'red'}} >Cash Collection</label>
                                </div>
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                <h5>{`₹${formatRevenue(revenueOnline)}.00`}</h5>
                                <label style={{color: 'green'}} >Online Collection</label>
                                </div>

                            </div>
                            
                        </div>
                        <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                            <div onClick={() => {
                                setExpandDataType('Due Month');
                                setShowExpandView(true);
                                }} 
                                style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{flex: '1'}}>
                                <img alt='' className='img_boldicon' src={DueRupee_Icon}></img>
                                </div>
                                <div style={{flex: '3', marginTop: '10px', cursor:'pointer'}}>
                                    <h3>{`₹${formatRevenue(dueArrayMonth)}.00`}</h3>
                                    <label style={{color: 'red'}}>Month Due Amount</label>
                                </div>
                                
                                
                            </div>
                            <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                                <div onClick={() => {
                                setExpandDataType('Due All');
                                setShowExpandView(true);
                                }}  style={{border: '1px solid gray', flex: '1', padding: '5px', cursor:'pointer'}}>
                                    <h5>{`₹${formatRevenue(arryadue)}.00`}</h5>
                                    <label style={{color: 'gray'}} >Total Due Amount</label>
                                </div>
                                <div onClick={() => {
                                setExpandDataType('Due Week');
                                setShowExpandView(true);
                                }}  style={{border: '1px solid gray', flex: '1', padding: '5px', cursor:'pointer'}}>
                                <h5>{`₹${formatRevenue(dueArrayWeek)}.00`}</h5>
                                <label style={{color: 'red'}} >Weekly Due</label>
                                </div>
                                <div onClick={() => {
                                setExpandDataType('Due Today');
                                setShowExpandView(true);
                                }}  style={{border: '1px solid gray', flex: '1', padding: '5px', cursor:'pointer'}}>
                                <h5>{`₹${formatRevenue(dueArrayToday)}.00`}</h5>
                                <label style={{color: 'blue'}} >Today's Due Amount</label>
                                </div>

                            </div>
                            
                            
                        </div>
                        <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{flex: '1'}}>
                                <img alt='' className='img_boldicon' src={Tickets_Icon}></img>
                                </div>
                                <div style={{flex: '3', marginTop: '10px'}}>
                                    <img alt='Expand View' onClick={() => {setShowTicketExpand(true);
                                    setTicketType('Open Tickets')
                                }} style={{width:'20px', height:'20px',float:'right', marginTop:'5px', marginRight:'8px', cursor:'pointer'}} src={ExpandIcon}></img>
                                    <h3 style={{borderBottom: '2px solid brown', cursor:'pointer'}}>{openticktes}</h3>
                                    <label style={{color: 'brown'}}>Current Open Tickets</label>
                                </div>
                                
                                
                            </div>
                            <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                    <h5>{unassignedtickets}</h5>
                                    <label style={{color: 'gray'}} >Unassigned Tickets</label>
                                </div>
                                
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                <h5>{closedtickets}</h5>
                                <label style={{color: 'blue'}} >Closed Tickets</label>
                                </div>

                            </div>
                            
                            
                        </div>
                        
                    </div>
                </div>

                <Modal show={showInsModal} onHide={() => setShowInsModal(false)} size='xl'>
                <Modal.Header className="d-flex align-items-center">
                    <Modal.Title>
                        This Month New User
                    </Modal.Title>
                    <div className='col-md-3 ms-auto'>
                        <label className='form-label'>Select Company</label>
                        <select onChange={(e) => setFilterIns({...filteIns, company:e.target.value})} className='form-select'>
                            <option value='All'>All</option>
                            {
                                state.companyArray.map((company, index) => (
                                    <option key={index} value={company}>{company}</option>
                                ))
                            }
                        </select>

                    </div>
                    <div className='col-md-3 ms-auto'>
                        <label className='form-label'>Select Day</label>
                        <select onChange={(e) => setFilterIns({...filteIns, day:e.target.value})} className='form-select'>
                            <option value='Month'>This Month</option>
                            <option value='Today'>Today</option>
                            <option value='Yesterday'>Yesterday</option>
                            <option value='This Week'>This Week</option>
                            

                        </select>

                    </div>
                    <img onClick={downloadExcel} className='img_download_icon ms-auto' alt='excel' src={ExcelIcon}></img>
                </Modal.Header>

                    <Modal.Body style={{maxHeight:'79vh', overflow:'hidden', overflowY:'auto'}}>
                        <table className='table table-striped table-hover'>
                            <thead className='table table-primary'>
                                <tr>
                                    <th scope='col'>S No</th>
                                    <th scope='col'>Date</th>
                                    <th scope='col'>UserID</th>
                                    <th scope='col'>Name</th>
                                    <th scope='col'>Mobile</th>
                                    <th scope='col'>Address</th>
                                    <th scope='col'>Company</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filterInsArray.length > 0 ? (
                                        filterInsArray.map((data, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{new Date(data.createdAt).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'2-digit'})}</td>
                                                <td>{data.username}</td>
                                                <td>{data.fullName}</td>
                                                <td>{data.mobileNo}</td>
                                                <td style={{maxWidth:'200px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{data.installationAddress}</td>
                                                <td>{data.company}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>

                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </Modal.Body>
                    <Modal.Footer>
                        
                    </Modal.Footer>
                </Modal>
                
            

        <DashSecDiv/>
        </div>
            )}
        </>
        
        
        



  )
}
