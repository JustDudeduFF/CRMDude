import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
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

export default function MasterDash() {
  return (
    <div className='d-flex flex-column' style={{marginTop:'4.5%', padding:'10px'}}>
        <h4>Master and Modification</h4>
        <div className='d-flex flex-row'>
            <div style={{flex:'1'}} className='d-flex flex-column'>
            <h5 className='text-decoration-underline ms-3'>Inventory</h5>
            <div style={{ overflow:'hidden', overflowY:'auto', scrollbarWidth:'none', height:'30vh'}} className='d-flex flex-column rounded   shadow'>
                
            <ul className="list-group list-group-flush rounded mb-2">
                <Link id='link' to='broadbandplan' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">BroadBand Plans</li></Link>

            <Link id='link' to='isps' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">ISPs</li></Link>

            <Link id='link' to='offices' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Offices</li></Link>

            <Link id='link' to='dmaker' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Device Maker</li></Link>

            <Link id='link' to='designation' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Designations</li></Link>

            <Link id='link' to='ticketconcern' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Ticket Concerns</li></Link>
            
            </ul>
            </div>

            <h6 className='text-decoration-underline ms-3 mt-4'>Company and Colony</h6>
            <div style={{ overflow:'hidden', overflowY:'auto', scrollbarWidth:'none', height:'30vh'}} className='d-flex flex-column rounded   shadow'>
                
            <ul className="list-group list-group-flush rounded mb-2">
                <Link id='link' to='company' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Companies</li></Link>

            <Link id='link' to='colony' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Colony</li></Link>


            <Link id='link' to='dbparticular' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Debit or Credit</li></Link>

            <Link id='link' to='remarkfollow' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Remark or Follow Up</li></Link>

            
            
            </ul>
            </div>
            </div>

            <div style={{flex:'7'}}>
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
                </Routes>
            </div>

        </div>
    </div>


  )
}
