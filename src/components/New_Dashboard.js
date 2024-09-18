import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LayoutDash from './LayoutDash';
import NewUserAdd from './NewUserAdd';
import Subscriber from './subscriberpage/Subscriber';  
import { AnimatePresence } from 'framer-motion';
import Transition from './Transition';
import EmployeeDashboard from './EmployeePage/EmloyeeDashboard';
import InventryDash from './InventryPage/InventryDash';
import MasterDash from './Master/MasterDash';
import BulkUserEntry from './subscriberpage/BulkUserEntry';

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
          <Route path='/*' element={<LayoutDash />} />
          <Route path='/adduser/*' element={<NewUserAdd />} />
          <Route path='/subscriber/*' element={<Subscriber />} />
          <Route path='/employees/*' element={<EmployeeDashboard />} />
          <Route path='/inventry/*' element={<InventryDash/>}/>
          <Route path='/master/*' element={<MasterDash/>}/>
          <Route path='/bulkuser/*' element={<BulkUserEntry/>}/>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default Transition(New_Dashboard);  // Renamed export





