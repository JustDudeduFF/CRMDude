import React, { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import ReportDash from './ReportDash';
import axios from 'axios';
import { api } from '../FirebaseConfig';
import TicketdataDash from './TicketData/TicketdataDash';
import RevenueDash from './ExpiredData/RevenueDash';
import ExpiredDash from './ExpiredData/ExpiredDash';

export default function Reports() {

    const navigate = useNavigate();

    const [text, setText] = useState(1.1);
    const [ticket, setTicket] = useState(0);
    const [due, setDue] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [expired, setExpired] = useState(0);

    const fetchInitialData = async() => {
        const [responseTicket, responseDue, responseRevenue, responseExpired] = await Promise.all([
            axios.get(api+"/tickets?data=count"),
            axios.get(api+`/dueAmount?data=dashboard`),
            axios.get(api+`/subscriber/revenue?count=dashboard`),
            axios.get(api+"/expired?expire=count")
        ]);

        if(responseTicket.status !== 200 || responseDue.status !== 200 || responseRevenue.status !== 200 || responseExpired.status !== 200){
            return;
        }

        const expireData = responseExpired.data;
        if(expireData){
            setExpired(expireData.count);
        }

        const revenueData = responseRevenue.data;
        if(revenueData){
            setRevenue(revenueData.monthWise);
        }

        const dueData = responseDue.data;
        if(dueData){
            setDue(dueData.totalAll);
        }

        const ticketData = responseTicket.data;
        if(ticketData){
            setTicket(ticketData.open);
        }

    }

    useEffect(() => {
        fetchInitialData();
    }, [])

  return (
    <div style={{marginTop:'4.5%', display:'flex', flexDirection:'column'}}>
        <div style={{flex:'1', display:'flex', flexDirection:'row', margin:'10px'}}>
            <div style={{flex:'1'}}>
                <h3 onClick={() => {
                    setText(1.1);
                    navigate("/dashboard/reports");
                }} style={{cursor:'pointer'}} >Subscriber Reports</h3>
            </div>
        </div>        

        <div className='d-flex flex-row mt-2 ms-1'>

            <div style={{flex:`${text}`, overflowY:'auto', height:'79vh', scrollbarWidth:'none', transition:'linear 0.3s'}}>
                <ol className='list-group'>
                    <li onClick={() => {
                        setText(0);
                        navigate("/dashboard/reports/tickets");
                    }} className='list-group-item justify-content-between align-items-start mt-2'>
                        <div>Tickets</div>
                        <div className='fw-light'>{`Open Tickets : ${ticket}`}</div>
                    </li>

                    <li onClick={() => {
                        setText(0);
                        navigate("/dashboard/reports/tickets");
                    }} className='list-group-item justify-content-between align-items-start mt-2'>
                        <div>Due Amount</div>
                        <div className='fw-light'>{`Total Due : ${due}`}</div>
                    </li>

                    <li onClick={() => {
                        setText(0);
                        navigate("/dashboard/reports/revenue");
                    }} className='list-group-item justify-content-between align-items-start mt-2'>
                        <div>Payment Revenue</div>
                        <div className='fw-light'>{`Month Revenue : ${revenue}`}</div>
                    </li>

                    <li onClick={() => {
                        setText(0);
                        navigate("/dashboard/reports/expired");
                    }} className='list-group-item justify-content-between align-items-start mt-2'>
                        <div>Expire User Report</div>
                        <div className='fw-light'>{`Month Expired : ${expired}`}</div>
                    </li>
                </ol>
            </div>
            
            <div style={{flex:'7', marginLeft:'10px', height:'79vh'}}>

                <Routes>
                    <Route path='/' element={<ReportDash/>}/>
                    <Route path='/tickets/*' element={<TicketdataDash/>}/>
                    <Route path='/revenue/*' element={<RevenueDash/>}/>
                    <Route path='/expired/*' element={<ExpiredDash/>}/>
                </Routes>
            </div>

        </div>
    </div>
  )
}
