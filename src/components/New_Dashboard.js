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
import LoginWhatsapp from './Templates/LoginWhatsapp';
import TemplateDash from './Templates/TemplateDash';
import TicketdataDash from './TicketData/TicketdataDash';
import ProtectedRoute from './ProtectedRoute';
import { PermissionProvider } from './PermissionProvider';
import ExpiredDash from './ExpiredData/ExpiredDash';
import RevenueDash from './ExpiredData/RevenueDash';
import Reports from './Reports';
import MessageTemplateCreator from './Templates/MessageTemplateCreator';
import EmployeeProfile from './EmployeePage/EmployeeProfileDash';
import MongoDBDashboard from './MongoDBDashboard';
import Dashboard from './Dashboard';
import CompanyManagement from './setting';

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
      <PermissionProvider>
      <Routes>
          <Route path='/*' element={<DashFirstDiv/>} />
          <Route path='/myprofile' element={<EmployeeProfile/>} />
          <Route path='/adduser/*' element={<ProtectedRoute permission="ADD_CUSTOMER"><NewUserAdd/></ProtectedRoute>} />
          <Route path='/subscriber/*' element={<ProtectedRoute permission="VIEW_CUSTOMER"><Subscriber/></ProtectedRoute>} />
          <Route path='/employees/*' element={<ProtectedRoute permission="VIEW_EMP">
            <EmployeeDashboard />
          </ProtectedRoute>} />
          <Route path='/inventry/*' element={<ProtectedRoute permission="VIEW_INVENTORY"><InventryDash/></ProtectedRoute>}/>
          <Route path='/master/*' element={<MasterDash/>}/>
          <Route path='/bulkuser/*' element={<BulkUserEntry/>}/>
          <Route path='/leadmanagment/*' element={<LeadDash/>}/>
          <Route path='/networkrack/*' element={<ProtectedRoute permission="VIEW_RACK"><RackDashBoard/></ProtectedRoute>}/>
          <Route path='/payrollandattendence/*' element={<ProtectedRoute permission="VIEW_PAYOUT">
            <PayrollandAttendence/>
          </ProtectedRoute>}/>
          <Route path='/templates/*' element={<MessageTemplateCreator/>}/>
          <Route path='/reports/*' element={<Reports/>}/>
          <Route path='/tickets/*' element={<TicketdataDash/>}/>
          <Route path='/revenue/*' element={<RevenueDash/>}/>
          <Route path='/expired/*' element={<ExpiredDash/>}/>
          <Route path='/mongodb/*' element={<MongoDBDashboard/>}/>
          <Route path='/partnerview/*' element={<Dashboard/>}/>
          <Route path='/setting/*' element={<CompanyManagement/>}/>
        </Routes>
      </PermissionProvider>

    </div>
  );
}

export default Transition(New_Dashboard);  // Renamed export





