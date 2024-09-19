import React, { useEffect, useState } from 'react'
import Action_Icon from './subscriberpage/drawables/info.png'
import More_Info from './subscriberpage/drawables/info-new.png'
import Router_Img from './subscriberpage/drawables/wireless-router.png'
import Rupee_Icon from './subscriberpage/drawables/rupee.png'
import DueRupee_Icon from './subscriberpage/drawables/rupeenew.png'
import Tickets_Icon from './subscriberpage/drawables/complain.png'
import {db} from '../FirebaseConfig'
import { ref } from 'firebase/database';
import { onValue } from 'firebase/database'
import DashExpandView from './DashExpandView'

export default function DashFirstDiv() {

    const [openticktes, setOpenTickets] = useState(0);
    const [unassignedtickets, setUnassignedTickets] = useState(0);
    const [closedtickets, setCloseTickets] = useState(0);
    const [cancelticket, setCancelTickets] = useState(0);

    const [dueArrayWeek, setDueArrayWeek] = useState(0);
    const [dueArrayMonth, setDueArrayMonth] = useState(0);
    const [dueArrayToday, setDueArrayToday] = useState(0);

    const [expireArrayWeek, setExpireArrayWeek] = useState('...');
    const [expireArrayToday, setExpireArrayToday] = useState('...');
    const [expireArrayTommorow, setExpireArrayTommorow] = useState('...');
    const [expireArrayMonth, setExpireArrayMonth] = useState('...');

    const [showExpanView, setShowExpandView] = useState(false);
    const [expandDataType, setExpandDataType] = useState('');

    const [arryadue, setDueArray] = useState(0);


    const pendingticktes = ref(db, `Global Tickets`);
    const dueRef = ref(db, `Subscriber`);

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

    useEffect(() => {
        const fetchPendingtickets = onValue(pendingticktes, (ticketsSnap => {
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
                    }else if(ticketno === 'Canceled'){
                        cancel++;
                    }else{
                        unassigned++
                    }

                });
                setOpenTickets(open);
                setCloseTickets(closed);
                setCancelTickets(cancel);
                setUnassignedTickets(unassigned);
            }
        }));

    const fetchAllDue = onValue(dueRef, (dueSnap) => {
    const currentDate = new Date();
    const dueArray = [];
    const dueArrayMonth = [];
    const dueArrayWeek = [];
    const dueArrayToday = [];
    dueSnap.forEach(childSnap => {
        const dueAmount = childSnap.child('connectionDetails').val().dueAmount;
        dueArray.push(dueAmount);
        const dueDateTimestamp = convertExcelDateSerial(childSnap.child('connectionDetails').val().activationDate); // Assuming you store the due date timestamp here

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
});

    const fetchExpiredUser = onValue(dueRef, expiredSnap => {
        const currentDate = new Date();
        const expireTodayArray = [];
        const expireTommorowArray = [];
        const expireWeekArray = [];
        const expireArrayMonth = [];
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
            }
        });
        

        setExpireArrayToday(expireTodayArray.length);
        setExpireArrayTommorow(expireTommorowArray.length);
        setExpireArrayWeek(expireWeekArray.length);
        setExpireArrayMonth(expireArrayMonth.length);
    })

return () => {fetchPendingtickets();
    fetchAllDue();
}
});


    
  return (
    <div style={{width: '100%', display:'flex', flexDirection: 'row', marginTop: '4%', padding: '20px'}}>
        
            <div style={{ borderRadius: '5px', border: '1px solid gray', flex:'1'}}>
            <img alt='' className='img_hover' src={More_Info}></img>
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
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                    </tbody>
                    </table>
            </div>
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
            <div style={{borderRadius: '5px',flex: '1', marginTop: '15px', boxShadow: '0 0 7px violet'}}>
                <img alt='' className='img_boldicon' src={Router_Img}></img>
                <label style={{marginLeft: '20px', fontSize: '25px'}}>New Installations</label> 
                <span style={{marginRight: '100px', fontSize: '30px', float: 'right', marginTop: '20px', color: 'green', borderBottom: '2px solid gray'}}>20</span>
                <div style={{display: 'flex', flexDirection: 'row', margin: '20px', height: '80px'}}>
                    <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                        <h3>02</h3>
                        <h5 style={{color: 'gray'}}>Today's Installations</h5>
                    </div>
                    <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                    <h3>10</h3>
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
                            <h3>$122455.00</h3>
                            <label style={{color: 'gray'}}>This Month Revenue</label>
                        </div> 

                    </div>
                    <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                            <h5>$21213.0</h5>
                            <label style={{color: 'gray'}} >Today's Revenue</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'red'}} >Cash Collection</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'green'}} >Online Collection</label>
                        </div>

                    </div>
                    
                </div>
                <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div style={{flex: '1'}}>
                        <img alt='' className='img_boldicon' src={DueRupee_Icon}></img>
                        </div>
                        <div style={{flex: '3', marginTop: '10px'}}>
                            <h3>{`$${dueArrayMonth}.00`}</h3>
                            <label style={{color: 'red'}}>Month Due Amount</label>
                        </div>
                        
                        
                    </div>
                    <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                            <h5>{`$${arryadue}.0`}</h5>
                            <label style={{color: 'gray'}} >Total Due Amount</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>{`$${dueArrayWeek}.00`}</h5>
                        <label style={{color: 'red'}} >Weekly Due</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>{`$${dueArrayToday}.00`}</h5>
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
                        <label style={{color: 'red'}} >Cancelled Tickets</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>{closedtickets}</h5>
                        <label style={{color: 'blue'}} >Closed Tickets</label>
                        </div>

                    </div>
                    
                    
                </div>
                
            </div>
        </div>


  )
}
