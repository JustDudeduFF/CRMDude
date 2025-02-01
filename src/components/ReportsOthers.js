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
import './Reports_Others.css'

export default function Reports_Others() {
  const navigate = useNavigate();
  return (
    <div className='d-flex flex-row justify-content-center'>

        <div style={{width:'140px'}} onClick={() => navigate('/dashboard/employees')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Manage Employees</label>
          <img style={{width:'50px', height:'50px'}} alt='Emp_Report' src={Emp_Report}></img>
        </div>


        <div style={{width:'140px'}} onClick={() => navigate('reports')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>All Reports</label>
          <img style={{width:'50px', height:'50px'}} alt='reports' src={reports}></img>
        </div>

        <div style={{width:'140px'}} onClick={() => navigate('networkrack')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Network Rack Info</label>
          <img style={{width:'50px', height:'50px'}} alt='Network_Rack' src={Network_Rack}></img>
        </div>

        <div style={{width:'140px'}} onClick={() => navigate('/dashboard/leadmanagment')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Lead Managment</label>
          <img style={{width:'50px', height:'50px'}} alt='Leads' src={Leads}></img>
        </div>


        <div style={{width:'140px'}} onClick={() => navigate('/dashboard/inventry')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Inventory</label>
          <img style={{width:'50px', height:'50px'}} alt='Inventry' src={Inventry}></img>
        </div>

        <div style={{width:'140px'}} onClick={() => navigate('/dashboard/adduser')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Add Customer</label>
          <img style={{width:'50px', height:'50px'}} alt='Customer_Add' src={Customer_Add}></img>
        </div>


        <div style={{width:'140px'}} onClick={() => navigate('/dashboard/master')} className='d-flex flex-column align-items-center justify-content-center border border-2 border-success p-4 ms-3 me-3 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>Master</label>
          <img style={{width:'50px', height:'50px'}} alt='master' src={master}></img>
        </div>
        
        
        <div onClick={() => navigate('/dashboard/templates')} style={{width:'140px'}} className='d-flex flex-column align-items-center justify-content-center ms-3 me-3 border border-2 border-success p-4 rounded hover-shadow'>
          <label className='fw-bold mb-3 text-center label'>WhatsApp</label>
          <img style={{width:'50px', height:'50px'}} alt='whatsapp' src={whatsapp}></img>
        </div>

      
    </div>
  )
}
