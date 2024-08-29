import React from 'react'
import Emp_Report from './subscriberpage/drawables/presentation.png'
import Expired from './subscriberpage/drawables/expired.png'
import Upcoming_Renewals from './subscriberpage/drawables/next-week.png'
import Tickts from './subscriberpage/drawables/travel-agent.png'
import Network_Rack from './subscriberpage/drawables/database.png'
import Leads from './subscriberpage/drawables/manager.png'
import Inventry from './subscriberpage/drawables/inventory.png'
import Customer_Add from './subscriberpage/drawables/add-user.png'
import './Reports_Others.css'
import { Link } from 'react-router-dom'

export default function Reports_Others() {
  
  return (
    <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Manage Employees</label><br></br>
        <Link id='link' to='/dashboard/employees'>
        
        <img alt='' src={Emp_Report} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </Link>
        </div>


        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Expired Reports</label><br></br>
        <img alt='' src={Expired} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </div>

        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Upcoming Renewals</label><br></br>
        <img alt='' src={Upcoming_Renewals} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </div>

        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Tickets Reports</label><br></br>
        <img alt='' src={Tickts} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </div>

        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Network Rack Info</label><br></br>
        <img alt='' src={Network_Rack} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </div>
        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Leads Reports</label><br></br>
        <img alt='' src={Leads} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img>
        </div>

        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Inventory Reports</label><br></br>
        <Link id='link' to='/dashboard/inventry'>
        <img alt='' src={Inventry} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img></Link>
        </div>
        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Add Customer</label><br></br>
        <Link id='link' to='/dashboard/adduser'><img alt='' src={Customer_Add} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img></Link>
        
        </div>
        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        <label className="reports_label">Master</label><br></br>
        <Link id='link' to='/dashboard/master'>
        <img alt='' src={Emp_Report} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img></Link>
        </div>
        
        <div className='offcanvas_div' style={{width: 'auto', flex: '1', border: '2px solid gray', padding: '5px', borderRadius: '10px',  marginRight: '15px'}}>
        
        <label className="reports_label">Employee Reports</label><br></br>
        <Link id='link' to='/dashboard/subscriber'>
        <img alt='' src={Emp_Report} style={{width:'50px', height: '50px', cursor:"pointer", marginLeft: '30px', marginTop: '10px'}}></img></Link>
        </div>
      
    </div>
  )
}
