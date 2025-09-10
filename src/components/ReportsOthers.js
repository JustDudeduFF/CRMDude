import React from 'react'
import { useNavigate } from 'react-router-dom'
import Emp_Report from './subscriberpage/drawables/presentation.png'
import reports from './subscriberpage/drawables/analysis.png'
import Network_Rack from './subscriberpage/drawables/database.png'
import Leads from './subscriberpage/drawables/manager.png'
import Inventry from './subscriberpage/drawables/inventory.png'
import Customer_Add from './subscriberpage/drawables/add-user.png'
import whatsapp from './subscriberpage/drawables/whatsapp.png'
import master from './subscriberpage/drawables/master.png'
import setting from './subscriberpage/drawables/settings.png'
import './Reports_Others.css'

export default function Reports_Others({ onCloseSidebar }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    if (onCloseSidebar) {
      onCloseSidebar();
    }
  };

  return (
    <div className="reports-others-container">
      <div className="reports-others-grid">
        <div 
          onClick={() => handleNavigation('/dashboard/employees')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='Emp_Report' src={Emp_Report} />
          </div>
          <label className="reports-others-label">Manage Employees</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/reports')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='reports' src={reports} />
          </div>
          <label className="reports-others-label">All Reports</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/networkrack')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='Network_Rack' src={Network_Rack} />
          </div>
          <label className="reports-others-label">Network Rack Info</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/leadmanagment')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='Leads' src={Leads} />
          </div>
          <label className="reports-others-label">Lead Management</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/inventry')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='Inventry' src={Inventry} />
          </div>
          <label className="reports-others-label">Inventory</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/adduser')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='Customer_Add' src={Customer_Add} />
          </div>
          <label className="reports-others-label">Add Customer</label>
        </div>

        <div 
          onClick={() => handleNavigation('/dashboard/master')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='master' src={master} />
          </div>
          <label className="reports-others-label">Master</label>
        </div>
        
        <div 
          onClick={() => handleNavigation('/dashboard/templates')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='whatsapp' src={whatsapp} />
          </div>
          <label className="reports-others-label">Message & Communication</label>
        </div>

                <div 
          onClick={() => handleNavigation('/dashboard/setting')} 
          className="reports-others-card"
        >
          <div className="reports-others-icon">
            <img alt='setting' src={setting} />
          </div>
          <label className="reports-others-label">Setting</label>
        </div>
      </div>
    </div>
  )
}
