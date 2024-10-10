import React, { useState } from 'react'
import ModalRoom from './ModalRoom';

export default function RackDashBoard() {
    const [showroom, setShowRoom] = useState(false);
  return (
    <div style={{marginTop:'4.5%', display:'flex', flexDirection:'column', padding:'10px'}}>
        <div className='d-flex flex-row'>
            <h4 style={{flex:'1'}}>Network Rack Info</h4>
            <button onClick={() => setShowRoom(true)} className='btn btn-outline-primary mt-2 me-4'>Add Server Room</button>
        </div>
        <ModalRoom show={showroom} closeModal={() => setShowRoom(false)}/>

        <div className='d-flex flex-row'>
            <div style={{flex:'1', height:'80vh'}}>
                <h5>Server Room Names</h5>
            </div>

            <div style={{flex:'9', border:'1px solid gray'}}>

            </div>
        </div>
    </div>
  )
}
