import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import RackDataModal from './RackDataModal';
import { useLocation } from 'react-router-dom';
import './Rack.css'
import PONPort from './drawables/port.png'
import EthernetPort from './drawables/ethernet.png'

export default function RackView() {
    const location = useLocation();
    const {roomarray} = location.state || {};
    const [isRack, setIsRack] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [rackData, setRackData] = useState(null);



    const addRack = () => {
        setShowModal(true);
    }
  return (
    <div>
      {
        isRack ? (
            <div className='d-flex flex-column wd-100 p-2'>
              <div className='d-flex flex-w'>
                <h5 style={{flex:'1'}}>OfficeName</h5>
                <button onClick={addRack} className='btn btn-primary'> + Add Rack</button>
              </div>
              <div className='d-flex flex-row'>
                {/* Rack Layout Below */}

                <div style={{display:'flex', flexDirection:'column', width:'25%', border:'1px solid gray', height:'100%', padding:'10px', borderRadius:'5px'}}>

                  <div style={{display:'flex', flexDirection:'row', height:'35px', border:'1px solid gray'}}>

                    {/* PONs Layout */}
                    <div style={{display:'flex', flexDirection:'row', marginLeft:'5px', marginTop:'2px'}}>
                      <div style={{width:'30px', height:'30px', display:'flex', flexDirection:'column'}}>
                        <img src={PONPort} style={{width:'22px', height:'22px'}}></img>
                        <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>1</span>
                      </div>

                      <div style={{width:'30px', height:'30px', display:'flex', flexDirection:'column'}}>
                        <img src={PONPort} style={{width:'22px', height:'22px'}}></img>
                        <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>1</span>
                      </div>

                      <div style={{width:'30px', height:'30px', display:'flex', flexDirection:'column'}}>
                        <img src={PONPort} style={{width:'22px', height:'22px'}}></img>
                        <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>1</span>
                      </div>

                      <div style={{width:'30px', height:'30px', display:'flex', flexDirection:'column'}}>
                        <img src={PONPort} style={{width:'22px', height:'22px'}}></img>
                        <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>1</span>
                      </div>
                    </div>

                    {/* Uplink Layout */}
                    <div style={{display:'flex', flexDirection:'row'}}>
                      {/* For SFP SLOT */}
                    </div>
                  </div>

                </div>

              </div>
            </div>
        ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop:'350px' }}>
                <button onClick={addRack} className='btn btn-primary'> + Add Rack</button>
                <RackDataModal show={showModal} RackRef={roomarray}/>
            </div>
        )
    }
    </div>
  )
}
