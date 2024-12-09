import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import DashFirstDiv from './DashFirstDiv';
import NewUserAdd from './NewUserAdd';
import Subscriber from './subscriberpage/Subscriber';  
import { AnimatePresence } from 'framer-motion';
import Transition from './Transition';
import EmployeeDashboard from './EmployeePage/EmloyeeDashboard';
import InventryDash from './InventryPage/InventryDash';
import MasterDash from './Master/MasterDash';
import BulkUserEntry from './subscriberpage/BulkUserEntry';
import LeadDash from './LeadManagment/LeadDash';
import RackDashBoard from './NetworkRack/RackDashBoard';
import PayrollandAttendence from './PayoutandAttendence/PayrollandAttendence';
import TemplateDash from './Templates/TemplateDash';
import LoginWhatsapp from './Templates/LoginWhatsapp';
import TicketdataDash from './TicketData/TicketdataDash';

function New_Dashboard() {  // Renamed to PascalCase
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('contact')) {
      navigate('/');
    }
  }, [navigate]);  // Added dependencies to useEffect

  return (
    <div>
      <Navbar />
      <AnimatePresence mode='wait'>
        <Routes>
          <Route path='/*' element={<DashFirstDiv/>} />
          <Route path='/adduser/*' element={<NewUserAdd />} />
          <Route path='/subscriber/*' element={<Subscriber />} />
          <Route path='/employees/*' element={<EmployeeDashboard />} />
          <Route path='/inventry/*' element={<InventryDash/>}/>
          <Route path='/master/*' element={<MasterDash/>}/>
          <Route path='/bulkuser/*' element={<BulkUserEntry/>}/>
          <Route path='/leadmanagment/*' element={<LeadDash/>}/>
          <Route path='/networkrack/*' element={<RackDashBoard/>}/>
          <Route path='/payrollandattendence/*' element={<PayrollandAttendence/>}/>
          <Route path='/templates/*' element={<LoginWhatsapp/>}/>
          <Route path='/tickets/*' element={<TicketdataDash/>}/>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default Transition(New_Dashboard);  // Renamed export





