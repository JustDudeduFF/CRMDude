import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import BroadBandPlans from './BroadBandPlans'
import ISP from './ISP'
import Offices from './Offices'
import DeviceMakers from './DeviceMakers'

export default function MasterDash() {
  return (
    <div className='d-flex flex-column' style={{marginTop:'4.5%', padding:'10px'}}>
        <h4>Master and Modification</h4>
        <div className='d-flex flex-row'>
            <div style={{flex:'1', height:'23vh', overflow:'hidden', overflowY:'auto', scrollbarWidth:'none'}} className='d-flex flex-column rounded   shadow'>
            <ul className="list-group list-group-flush rounded mb-2">
                <Link id='link' to='broadbandplan' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">BroadBand Plans</li></Link>

            <Link id='link' to='isps' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">ISPs</li></Link>

            <Link id='link' to='offices' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Offices</li></Link>

            <Link id='link' to='dmaker' className='rounded mt-2 ms-1 me-1'>
            <li className="list-group-item shadow">Device Maker</li></Link>
            </ul>
            </div>

            <div style={{flex:'7'}}>
                <Routes>
                    <Route path='broadbandplan' element={<BroadBandPlans/>}/>
                    <Route path='isps' element={<ISP/>}/>
                    <Route path='offices' element={<Offices/>}/>
                    <Route path='dmaker' element={<DeviceMakers/>}/>
                </Routes>
            </div>

        </div>
    </div>


  )
}
