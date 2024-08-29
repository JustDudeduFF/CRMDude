import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import BroadBandPlans from './BroadBandPlans'

export default function MasterDash() {
  return (
    <div className='d-flex flex-column' style={{marginTop:'4.5%', padding:'10px'}}>
        <h4>Master and Modification</h4>
        <div className='d-flex flex-row'>
            <div style={{flex:'1'}} className='d-flex flex-column border rounded border-secondary  shadow'>
            <ul class="list-group list-group-flush rounded">
                <Link id='link' to='broadbandplan' className='rounded mt-2 ms-1 me-1'>
            <li class="list-group-item">BroadBand Plans</li></Link>

            <Link id='link' to='isps' className='rounded mt-2 ms-1 me-1'>
            <li class="list-group-item">ISPs</li></Link>
            </ul>
            </div>

            <div style={{flex:'7'}}>
                <Routes>
                    <Route path='broadbandplan' element={<BroadBandPlans/>}/>
                </Routes>
            </div>

        </div>
    </div>


  )
}
