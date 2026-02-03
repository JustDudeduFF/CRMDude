import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { PermissionProvider } from './PermissionProvider';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './Navbar';
import './App.css';
import ErrorBoundary from './ErrorBoundary';

// 1. Lazy Loading Components (Optimizes Bundle Size)
const DashFirstDiv = lazy(() => import('./DashFirstDiv'));
const EmployeeProfile = lazy(() => import('./EmployeePage/EmployeeProfileDash'));
const NewUserAdd = lazy(() => import('./NewUserAdd'));
const Subscriber = lazy(() => import('./subscriberpage/Subscriber'));
const EmployeeDashboard = lazy(() => import('./EmployeePage/EmloyeeDashboard'));
const InventryDash = lazy(() => import('./InventryPage/InventryDash'));
const MasterDash = lazy(() => import('./Master/MasterDash'));
const BulkUserEntry = lazy(() => import('./subscriberpage/BulkUserEntry'));
const LeadDash = lazy(() => import('./LeadManagment/LeadDash'));
const RackDashBoard = lazy(() => import('./NetworkRack/RackDashBoard'));
const PayrollandAttendence = lazy(() => import('./PayoutandAttendence/PayrollandAttendence'));
const MessageTemplateCreator = lazy(() => import('./Templates/MessageTemplateCreator'));
const Reports = lazy(() => import('./Reports'));
const TicketdataDash = lazy(() => import('./TicketData/TicketdataDash'));
const RevenueDash = lazy(() => import('./ExpiredData/RevenueDash'));
const ExpiredDash = lazy(() => import('./ExpiredData/ExpiredDash'));
const MongoDBDashboard = lazy(() => import('./MongoDBDashboard'));
const Dashboard = lazy(() => import('./Dashboard'));
const CompanyManagement = lazy(() => import('./setting'));

// 2. Loading Fallback (Matches your Indigo-Purple Schema)
const PageLoader = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
    <div className="spinner-border text-primary" role="status" style={{ color: '#667eea' }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function NewDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const contact = localStorage.getItem('contact');
    if (!contact) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="app-wrapper">
      <Navbar />
      
      <PermissionProvider>
        {/* Suspense handles the loading state of lazy components */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public/General Routes */}
            <Route path="/*" element={<DashFirstDiv />} />
            <Route path="/myprofile" element={<EmployeeProfile />} />
            <Route path="/master/*" element={<MasterDash />} />
            <Route path="/bulkuser/*" element={<BulkUserEntry />} />
            <Route path="/leadmanagment/*" element={<LeadDash />} />
            <Route path="/templates/*" element={<MessageTemplateCreator />} />
            <Route path="/reports/*" element={<Reports />} />
            <Route path="/tickets/*" element={<TicketdataDash />} />
            <Route path="/revenue/*" element={<RevenueDash />} />
            <Route path="/expired/*" element={<ExpiredDash />} />
            <Route path="/mongodb/*" element={<MongoDBDashboard />} />
            <Route path="/partnerview/*" element={<Dashboard />} />
            <Route path="/setting/*" element={<CompanyManagement />} />

            {/* Protected Routes with Permission Mapping */}
            <Route path="/adduser/*" element={
              <ProtectedRoute permission="ADD_CUSTOMER"><NewUserAdd /></ProtectedRoute>
            } />
            <Route path="/subscriber/*" element={
              <ProtectedRoute permission="VIEW_CUSTOMER"><ErrorBoundary><Subscriber /></ErrorBoundary></ProtectedRoute>
            } />
            <Route path="/employees/*" element={
              <ProtectedRoute permission="VIEW_EMP"><EmployeeDashboard /></ProtectedRoute>
            } />
            <Route path="/inventry/*" element={
              <ProtectedRoute permission="VIEW_INVENTORY"><InventryDash /></ProtectedRoute>
            } />
            <Route path="/networkrack/*" element={
              <ProtectedRoute permission="VIEW_RACK"><RackDashBoard /></ProtectedRoute>
            } />
            <Route path="/payrollandattendence/*" element={
              <ProtectedRoute permission="VIEW_PAYOUT"><PayrollandAttendence /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </PermissionProvider>
    </div>
  );
}

export default NewDashboard;