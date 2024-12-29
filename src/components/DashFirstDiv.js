import React, { useEffect, useState } from 'react'
import Action_Icon from './subscriberpage/drawables/info.png'
import Router_Img from './subscriberpage/drawables/wireless-router.png'
import Rupee_Icon from './subscriberpage/drawables/rupee.png'
import DueRupee_Icon from './subscriberpage/drawables/rupeenew.png'
import Tickets_Icon from './subscriberpage/drawables/complain.png'
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

export default function DashFirstDiv() {
    const navigate = useNavigate();
    const user = localStorage.getItem('Designation');
    const {hasPermission} = usePermissions();

    const [openticktes, setOpenTickets] = useState(0);
    const [unassignedtickets, setUnassignedTickets] = useState(0);
    const [closedtickets, setCloseTickets] = useState(0);
    const [cancelticket, setCancelTickets] = useState(0);

    const [dueArrayWeek, setDueArrayWeek] = useState(0);
    const [dueArrayMonth, setDueArrayMonth] = useState(0);
    const [dueArrayToday, setDueArrayToday] = useState(0);

    const [revenueMonth, setRevenueMonth] = useState(0);
    const [revenueToday, setRevenueToday] = useState(0);
    const [revenueCash, setRevenueCash] = useState(0);
    const [revenueOnline, setRevenueOnline] = useState(0);

    const [expireArrayWeek, setExpireArrayWeek] = useState('...');
    const [expireArrayToday, setExpireArrayToday] = useState('...');
    const [expireArrayTommorow, setExpireArrayTommorow] = useState('...');
    const [expireArrayMonth, setExpireArrayMonth] = useState('...');

    const [expiredYesterday, setExpiredYesterday] = useState('...');
    const [expiredLast7Days, setExpiredLast7Days] = useState('...');
    const [expiredLast30Days, setExpiredLast30Days] = useState('...');

    const [leadArray, setLeadArray] = useState([]);
    

    const [showExpanView, setShowExpandView] = useState(false);
    const [expandDataType, setExpandDataType] = useState('');

    const [showTicketExpand, setShowTicketExpand] = useState(false);
    const [ticketsType, setTicketType] = useState('');

    const [showrevenueexpand, setRevenueExpand] = useState(false);

    const [arryadue, setDueArray] = useState(0);

    const [attendenceArray, setAttendenceArray] = useState([]);
    const [newInstallations, setNewInstallations] = useState(0);
    const [newInstallationsToday, setNewInstallationsToday] = useState(0);
    const [newInstallationsWeek, setNewInstallationsWeek] = useState(0);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);



    const pendingticktes = ref(db, `Global Tickets`);
    const dueRef = ref(db, `Subscriber`);
    const attendenceRef = ref(db, `Payroll/Attendence`);
    const usersRef = ref(db, `users`);

    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
          const excelDateSerial = parseInt(input, 10);
          const baseDate = new Date("1900-01-01");
          const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);
      
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
        } else {
          return input; // return original input if it's not a valid Excel date serial number
        }
      }

    function isSameISOWeek(dueDate, currentDate) {
        const dueWeek = getISOWeek(dueDate);
        const currentWeek = getISOWeek(currentDate);
        return dueWeek === currentWeek && dueDate.getFullYear() === currentDate.getFullYear();
    }
    
    // Helper function to get the ISO week number (1-52)
    function getISOWeek(date) {
        const tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);
        tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7)); // ISO week starts on Monday
        const yearStart = new Date(tempDate.getFullYear(), 0, 1);
        return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    }

    function isSameDay(dueDate, currentDate) {
        return (
            dueDate.getFullYear() === currentDate.getFullYear() &&
            dueDate.getMonth() === currentDate.getMonth() &&
            dueDate.getDate() === currentDate.getDate()
        );
    }

    // Helper function to check if a date is tomorrow
    function isTomorrowDay(dueDate, currentDate) {
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1); // Set to tomorrow

        return (
            dueDate.getFullYear() === tomorrow.getFullYear() &&
            dueDate.getMonth() === tomorrow.getMonth() &&
            dueDate.getDate() === tomorrow.getDate()
        );
    }

    const isDateInRange = (date, range) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - range);
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);

        if (range === 7){
            return date >= last7Days && date < yesterday;
        }else if(range === 30){
            return date >= last30Days && date < yesterday;
        }else if(range === 1){
            return date >= yesterday && date < today;
        }else{
            return false;
        }

    }

    useEffect(() => {
        setIsLoading(true);
        

        const leadRef = ref(db, 'Leadmanagment');
        onValue(leadRef, (leadSnap) => {
            try {
                const dataArray = [];

                leadSnap.forEach((childSnap) => {
                    const FirstName = childSnap.val().firstName;
                    const LastName = childSnap.val().lastName;
                    const Type = childSnap.val().type;
                    const Mobile = childSnap.val().phone;
                    const Status = childSnap.val().status;
                    const leadID = childSnap.key;

                    if(Type === 'lead'){
                        dataArray.push({leadID, FirstName, LastName, Mobile, Status});
                    }
                });
                setLeadArray(dataArray);
            } catch (error) {
                console.log('Failed to Fetch Data: ', error);
            }
        });
        
        const promises = [
            new Promise(resolve => {
                const unsubscribe = onValue(pendingticktes, (ticketsSnap) => {
                    if(ticketsSnap.exists()){
                        let open = 0;
                        let unassigned = 0;
                        let closed = 0;
                        let cancel = 0;
                        
                        ticketsSnap.forEach(child => {
                            const ticketno = child.val().status;
                            if(ticketno === 'Pending'){
                                open++;
                            }else if(ticketno === 'Completed'){
                                closed++
                            }else if(ticketno === 'Open'){
                                cancel++;
                            }else if(ticketno === 'Unassigned'){
                                unassigned++
                            }

                        });
                        setOpenTickets(open);
                        setCloseTickets(closed);
                        setCancelTickets(cancel);
                        setUnassignedTickets(unassigned);
                    }
                    resolve();
                });
                return () => unsubscribe();
            }),
            
            new Promise(resolve => {
                const unsubscribe = onValue(dueRef, (dueSnap) => {
                    const currentDate = new Date();
                    const dueArray = [];
                    const dueArrayMonth = [];
                    const dueArrayWeek = [];
                    const dueArrayToday = [];
                    dueSnap.forEach(childSnap => {
                        const dueAmount = childSnap.child('connectionDetails').val().dueAmount;
                        dueArray.push(dueAmount);
                        const dueDateTimestamp = convertExcelDateSerial(childSnap.child('connectionDetails').val().activationDate);

                            const totalDue = dueArray.reduce((acc, current) => acc + current, 0);
                            setDueArray(totalDue); 



                        if (dueDateTimestamp) {
                            const dueDate = new Date(dueDateTimestamp);
                            
                            // For month comparison
                            const isSameMonth = dueDate.getFullYear() === currentDate.getFullYear() && dueDate.getMonth() === currentDate.getMonth();
                            if (isSameMonth) {
                                dueArrayMonth.push(dueAmount);
                            }
                            
                            // For week comparison (ISO week calculation)
                            const isSameWeek = isSameISOWeek(dueDate, currentDate);
                            if (isSameWeek) {
                                dueArrayWeek.push(dueAmount);
                            }

                            // For today's comparison
                            const isToday = isSameDay(dueDate, currentDate);
                            if (isToday) {
                                dueArrayToday.push(dueAmount);
                            }
                        }
                    });
                    
                    // Total dues for the current month
                    const totalDueMonth = dueArrayMonth.reduce((acc, current) => acc + current, 0);
                    
                    // Total dues for the current week
                    const totalDueWeek = dueArrayWeek.reduce((acc, current) => acc + current, 0);

                    const totalDueToday = dueArrayToday.reduce((acc, current) => acc + current, 0);
                    
                    // Set the total dues (you can store them separately)
                    setDueArrayMonth(totalDueMonth);
                    setDueArrayWeek(totalDueWeek);
                    setDueArrayToday(totalDueToday);
                    resolve();
                });
                return () => unsubscribe();
            }),
            
            new Promise(resolve => {
                const unsubscribe = onValue(dueRef, (revenueSnap) => {
                    const currentDate = new Date();
                    const MonthArray = [];
                    const CashArray = [];
                    const TodayArray = [];
                    const OnlineArray = [];
                    revenueSnap.forEach((childSnap) => {
                        const monthData = childSnap.child('payments');
                        monthData.forEach((newChild) => {
                            const {receiptDate, paymentMode, amount} = newChild.val();

                            if(receiptDate) {
                                const date = new Date(receiptDate);
                                const isSameMonth = date.getFullYear() === currentDate.getFullYear() && date.getMonth() === currentDate.getMonth();
                                if(isSameMonth) {
                                    MonthArray.push(parseInt(amount));
                                }

                                const isToday = isSameDay(date, currentDate);
                                if(isToday) {
                                    TodayArray.push(parseInt(amount));
                                }

                                const isCash = paymentMode === 'Cash';
                                if(isSameMonth && isCash) {
                                    CashArray.push(parseInt(amount));
                                }

                                const isOnline = paymentMode !== 'Cash';
                                if(isSameMonth && isOnline) {
                                    OnlineArray.push(parseInt(amount));
                                }
                            }

                        });
                    });

                    
                    const totalMonthRevenue = MonthArray.reduce((acc, current) => acc + current, 0);
                    const totaltodayRevenue = TodayArray.reduce((acc, current) => acc + current, 0);
                    const totalcashRevenue = CashArray.reduce((acc, current) => acc + current, 0);
                    const totalonlineRevenue = OnlineArray.reduce((acc, current) => acc + current, 0);
                    setRevenueOnline(totalonlineRevenue);
                    setRevenueCash(totalcashRevenue);
                    setRevenueToday(totaltodayRevenue);
                    setRevenueMonth(totalMonthRevenue);
                    resolve();
                });
                return () => unsubscribe();
            }),
            
            new Promise(resolve => {
                const unsubscribe = onValue(dueRef, (expiredSnap) => {
                    const currentDate = new Date();
                    const expireTodayArray = [];
                    const expireTommorowArray = [];
                    const expireWeekArray = [];
                    const expireArrayMonth = [];
                    const expireYesterdayArray = [];
                    const expireLast7DaysArray = [];
                    const expireLast30DaysArray = [];
                    expiredSnap.forEach(childSnap => {
                        const expireDate = convertExcelDateSerial(childSnap.child('connectionDetails').val().expiryDate);
                        const username = childSnap.val().username;


                        if (expireDate){
                            const expDate = new Date(expireDate);

                            const isSameMonth = expDate.getFullYear() === currentDate.getFullYear() && expDate.getMonth() === currentDate.getMonth();
                            if (isSameMonth) {
                                expireArrayMonth.push(username);
                            }

                            const isSameWeek = isSameISOWeek(expDate, currentDate);
                            if (isSameWeek) {
                                expireWeekArray.push(username);
                            }  

                            // For today's comparison
                            const isToday = isSameDay(expDate, currentDate);
                            if (isToday) {
                                expireTodayArray.push(username);
                            }

                            // For tomorrow's comparison
                            const isTomorrow = isTomorrowDay(expDate, currentDate);
                            if (isTomorrow) {
                                expireTommorowArray.push(username);
                            }

                            const isLast7Days = isDateInRange(expDate, 7);
                            if (isLast7Days) {
                                expireLast7DaysArray.push(username);
                            }

                            const isLast30Days = isDateInRange(expDate, 30);
                            if (isLast30Days) {
                                expireLast30DaysArray.push(username);
                            }

                            const isLast1Days = isDateInRange(expDate, 1);
                            if (isLast1Days) {
                                expireYesterdayArray.push(username);
                            }

                        }


                    });
                    

                    setExpireArrayToday(expireTodayArray.length);
                    setExpireArrayTommorow(expireTommorowArray.length);
                    setExpireArrayWeek(expireWeekArray.length);
                    setExpireArrayMonth(expireArrayMonth.length);
                    setExpiredLast7Days(expireLast7DaysArray.length);
                    setExpiredLast30Days(expireLast30DaysArray.length);
                    setExpiredYesterday(expireYesterdayArray.length);
                    resolve();
                });
                return () => unsubscribe();
            }),
            
            fetchData() // Assuming this returns a promise
        ];

        Promise.all(promises)
            .then(() => setIsLoading(false))
            .catch(error => {
                console.error('Error loading data:', error);
                setIsLoading(false);
            });

    }, []);

    function openPayroll(){
        navigate('payrollandattendence');
    }

    function fetchData() {

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

            onValue(ref(db, `Subscriber`), (snapshot) => {
                let newInstallations = 0;
                let newInstallationsToday = 0;
                let newInstallationsWeek = 0;
            
                snapshot.forEach((doc) => {
                    const subscriberData = doc.val();
            
                    if (subscriberData.createdAt) {
                        const date = new Date(convertExcelDateSerial(subscriberData.createdAt));
            
                        // Check if the month and year match
                        if (date.getFullYear() === currentYear && (date.getMonth() + 1) === currentMonth) {
                            newInstallations++;
                        }
            
                        // Check if the exact date matches today
                        if (date.getFullYear() === currentYear && (date.getMonth() + 1) === currentMonth && date.getDate() === currentDate) {
                            newInstallationsToday++;
                        }
            
                        // Check if the date falls within the current week
                        const currentDateObj = new Date();
                        const startOfWeek = new Date(currentDateObj.setDate(currentDateObj.getDate() - currentDateObj.getDay())); // Start of the week
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week
            
                        if (date >= startOfWeek && date <= endOfWeek) {
                            newInstallationsWeek++;
                        }
                    }
                });
            
                // Update the state with the final counts
                setNewInstallations(newInstallations);
                setNewInstallationsToday(newInstallationsToday);
                setNewInstallationsWeek(newInstallationsWeek);
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
    };

    function formatRevenue(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

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
                        ) : (
                            <div style={{flex:'1', display: 'flex', flexDirection: 'column'}}>
                                <div style={{flex:'1', border: '1px solid gray', borderRadius: '5px'}}>
                                    <h3 style={{color: 'black', marginLeft: '10px'}}>Expired Users</h3>
                                    <table className="table">
                                        <thead className='table-danger'>
                                            <tr>
                                                <th scope="col">Days</th>
                                                <th scope="col">Quantity</th>
                                                <th scope="col">View</th>
                                            </tr>
                                        </thead>
                                        <tbody className="table-group-divider">
                                            <tr>
                                                <td>Yesterday</td>
                                                <td>{expiredYesterday}</td>
                                                <td><img alt='expand view' onClick={() => {
                                                    
                                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                            </tr>
                                            <tr>
                                                <td>Last 7 Days</td>
                                                <td>{expiredLast7Days}</td>
                                                <td><img alt='expand view' onClick={() => {
                                                    
                                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                            </tr>
                                            
                                            <tr>
                                                <td>Last 30 Days</td>
                                                <td>{expiredLast30Days}</td>
                                                <td><img alt='expand view' onClick={() => {
                                                    
                                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{flex:'1', border: '1px solid gray', borderRadius: '5px', marginTop: '10px'}}>
                                    <h3 style={{color: 'black', marginLeft: '10px'}}>Leads Information</h3>
                                    <div style={{maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                                        <table className="table">
                                            <thead className='table-primary' style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                                                <tr>
                                                    <th scope="col">S. No.</th>
                                                    <th scope="col">FullName</th>
                                                    <th scope="col">Contact</th>
                                                    <th scope="col">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="table-group-divider">
                                                {leadArray.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.FirstName} {item.LastName}</td>
                                                        <td>{item.Mobile}</td>
                                                        <td>{item.Status}</td>
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
                        
                            <h3 style={{marginLeft: '10px'}}>Expiring Users</h3>
                            <table className="table">
                            <thead className='table-primary'>
                                <tr>
                                
                                <th scope="col">Days</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Handle</th>
                                </tr>
                            </thead>
                            <tbody className="table-group-divider">
                                <tr>
                                
                                <td>Today</td>
                                <td>{expireArrayToday}</td>
                                <td><img alt='expand view' onClick={() => {
                                    setExpandDataType('Expiring Today');
                                    setShowExpandView(true);
                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                </tr>
                                <tr>
                                
                                <td>Tomorrow</td>
                                <td>{expireArrayTommorow}</td>
                                <td><img alt='expand view' onClick={() => {
                                    setExpandDataType('Expiring Tomorrow');
                                    setShowExpandView(true);
                                }}  style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                </tr>

                                <tr>
                                <td>This Week</td>
                                <td>{expireArrayWeek}</td>
                                <td><img alt='expand view' onClick={() => {
                                    setExpandDataType('Expiring Week');
                                    setShowExpandView(true);
                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                </tr>

                                
                                <tr>
                                <td>This Month</td>
                                <td>{expireArrayMonth}</td>
                                <td><img alt='expand view' onClick={() => {
                                    setExpandDataType('Expiring Month');
                                    setShowExpandView(true);
                                }} style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                                </tr>
                                
                                
                                
                                
                               
                            </tbody>
                            </table>
                        </div>
                        <DashExpandView show={showExpanView} datatype={expandDataType} modalShow={() => setShowExpandView(false)}/>
                        <ExpandTickets viewShow={showTicketExpand} ticketType={ticketsType} closeView={() => setShowTicketExpand(false)}/>
                        <ExpandRevenue show={showrevenueexpand} modalShow={() => setRevenueExpand(false)}/>
                        <div style={{borderRadius: '5px',flex: '1', marginTop: '15px', boxShadow: '0 0 7px violet'}}>
                            <img alt='' className='img_boldicon' src={Router_Img}></img>
                            <label style={{marginLeft: '20px', fontSize: '25px'}}>New Installations</label> 
                            <span style={{marginRight: '100px', fontSize: '30px', float: 'right', marginTop: '20px', color: 'green', borderBottom: '2px solid gray'}}>{newInstallations}</span>
                            <div style={{display: 'flex', flexDirection: 'row', margin: '20px', height: '80px'}}>
                                <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                                    <h3>{newInstallationsToday}</h3>
                                    <h5 style={{color: 'gray'}}>Today's Installations</h5>
                                </div>
                                <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                                <h3>{newInstallationsWeek}</h3>
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
                                <h5>{cancelticket}</h5>
                                <label style={{color: 'red'}} >Pending Tickets</label>
                                </div>
                                <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                                <h5>{closedtickets}</h5>
                                <label style={{color: 'blue'}} >Closed Tickets</label>
                                </div>

                            </div>
                            
                            
                        </div>
                        
                    </div>
                </div>
                
            

        <DashSecDiv/>
        </div>
            )}
        </>
        
        
        



  )
}
