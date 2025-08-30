import React from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import BroadBandPlans from './BroadBandPlans'
import ISP from './ISP'
import Offices from './Offices'
import DeviceMakers from './DeviceMakers'
import Designation from './Designation'
import Company from './Company'
import Colony from './Colony'
import TicketConcerns from './TicketConcerns'
import DebitCreditNotesConcern from './DebitCreditNotesConcern'
import RemarksFollow from './RemarksFollow'
import PlanProvider from './PlanProvider'
import '../Reports.css';


export default function MasterDash() {
    const navigate = useNavigate();
  return (
    <div className='reports-container'>
        <div className='reports-content'>
            <h4 className='reports-title'>Master and Modification</h4>
            <div className='reports-layout'>
                <div style={{flex:'1'}} className='reports-sidebar'>
                <div >
                    
                <ul className="reports-list">

                <li onClick={() => navigate('/dashboard/master/broadbandplan')} className='reports-list-item'>BroadBand Plans</li>
                <li onClick={() => navigate('/dashboard/master/isps')} className='reports-list-item'>ISPs</li>
                <li onClick={() => navigate('/dashboard/master/offices')} className='reports-list-item'>Offices</li>
                <li onClick={() => navigate('/dashboard/master/dmaker')} className='reports-list-item'>Device Maker</li>
                <li onClick={() => navigate('/dashboard/master/planprovider')} className='reports-list-item'>Plan Provider</li>
                <li onClick={() => navigate('/dashboard/master/designation')} className='reports-list-item'>Designations</li>
                <li onClick={() => navigate('/dashboard/master/ticketconcern')} className='reports-list-item'>Tickets Concerns</li>
                <li onClick={() => navigate('/dashboard/master/isps')} className='reports-list-item'>ISPs</li>
                <li onClick={() => navigate('/dashboard/master/company')} className='reports-list-item'>Companies</li>
                <li onClick={() => navigate('/dashboard/master/colony')} className='reports-list-item'>Colony</li>
                <li onClick={() => navigate('/dashboard/master/dbparticular')} className='reports-list-item'>Debit or Credit</li>
                <li onClick={() => navigate('/dashboard/master/remarkfollow')} className='reports-list-item'>Remark or Follow UP</li>
                
                
                
                
                
                
                
                
                
                

                </ul>
                </div>
                </div>

                <div className='reports-main-content' style={{flex:'7'}}>
                    <Routes>
                        <Route path='broadbandplan' element={<BroadBandPlans/>}/>
                        <Route path='isps' element={<ISP/>}/>
                        <Route path='offices' element={<Offices/>}/>
                        <Route path='dmaker' element={<DeviceMakers/>}/>
                        <Route path='designation' element={<Designation/>}/>
                        <Route path='company' element={<Company/>}/>
                        <Route path='colony' element={<Colony/>}/>
                        <Route path='ticketconcern' element={<TicketConcerns/>}/>
                        <Route path='dbparticular' element={<DebitCreditNotesConcern/>}/>
                        <Route path='remarkfollow' element={<RemarksFollow/>}/>
                        <Route path='planprovider' element={<PlanProvider/>}/>
                        
                    </Routes>
                </div>

            </div>
        </div>
    </div>


  )
}
