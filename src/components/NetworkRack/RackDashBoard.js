import React, { useCallback, useEffect, useState } from 'react'
import ModalRoom from './ModalRoom';
import { onValue, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RackDash from './RackDash';
import RackView from './RackView';

export default function RackDashBoard() {
    const [roomarray, setRoomArray] = useState([]);
    const [showroom, setShowRoom] = useState(false);

    const  navigate = useNavigate();

    const rackRef = ref(db, `Rack Info`);
    

    useEffect(() => {
        const fetchRooms = onValue(rackRef, (rackSnap) => {
            const roomArray = [];
            if (rackSnap.exists()){
                rackSnap.forEach((chidSnap) => {
                    const officename = chidSnap.key;
                    chidSnap.forEach((chidSnap2) => {
                        const roomname = chidSnap2.key;
                        roomArray.push({officename, roomname});
                    });
                    
                });

                setRoomArray(roomArray);
                
            }
        });

        return () => fetchRooms();
    });

    const showRackView = (officename, roomname) => {
        navigate('rackview', { state: { officename, roomname } });
      };
  return (
    <div style={{marginTop:'4.5%', display:'flex', flexDirection:'column', padding:'10px'}}>
        <div className='d-flex flex-row'>
            <h4 style={{flex:'1'}}>Network Rack Info</h4>
            <button onClick={() => setShowRoom(true)} className='btn btn-outline-primary mt-2 me-4'>Add Server Room</button>
        </div>
        <ModalRoom show={showroom} closeModal={() => setShowRoom(false)}/>

        <div className='d-flex flex-row'>
            <div style={{flex:'1.1', height:'80vh'}}>
                <h5>Server Room Names</h5>
                <ol className="list-group list-group">
                {roomarray.map(({officename, roomname}, index) => (
                    <li onClick={() => showRackView(officename, roomname)} className="list-group-item justify-content-between align-items-start" key={index}>
                    <div className='fw-light'>{officename}</div>
                    <div>{roomname}</div> 

                    </li>
                ))}
          
            </ol>
            </div>

            <div style={{flex:'9', border:'1px solid gray', marginRight:'10px'}}>
                <Routes>
                    <Route path='/' element={<RackDash/>}/>
                    <Route path='rackview' element={<RackView/>}/>
                </Routes>
            </div>
        </div>
    </div>
  )
}
