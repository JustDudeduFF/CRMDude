import React, {useEffect, useState } from 'react'
import { onValue, ref, set } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RackDash from './RackDash';
import RackView from './RackView';
import { Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';

export default function RackDashBoard() {
    const [roomarray, setRoomArray] = useState([]);
    const [showroom, setShowRoom] = useState(false);
    const [arrayoffice, setArrayOffice] = useState([]);
    const [officename, setOfiiceName] = useState('');
    const officeRef = ref(db, `Master/Offices`);

    const  navigate = useNavigate();

    const rackRef = ref(db, `Rack Info`);
    

    useEffect(() => {
        const fetchRooms = onValue(rackRef, (rackSnap) => {
            const roomArray = [];
            if (rackSnap.exists()){
                rackSnap.forEach((chidSnap) => {
                    const officename = chidSnap.key;
                    roomArray.push(officename);
                    
                });

                setRoomArray(roomArray);
                console.log(roomArray)
                
            }
        });
        onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                const officeArray = [];
                officeSnap.forEach((officeChild) => {
                    const officename = officeChild.key
                    officeArray.push(officename);
                });
                setArrayOffice(officeArray);
                console.log(arrayoffice);
            }
        })

        return () => fetchRooms();
    }, []);

    const handleClick = () => {
        const rackRef = ref(db, `Rack Info/${officename}`);
        const RoomData = {
            officename:officename,
            creationdate:new Date().toISOString().split('')[0],
            createby:localStorage.getItem('contact')
        }

        set(rackRef, RoomData).then(() => {
            toast.success('Server Room Added!', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        })
        
    }

    const showRackView = (officename) => {
        navigate('rackview', { state: { officename } });
      };
  return (
    <div style={{marginTop:'4.5%', display:'flex', flexDirection:'column', padding:'10px'}}>
        <div className='d-flex flex-row'>
            <h4 style={{flex:'1'}}>Network Rack Info</h4>
            <button onClick={() => setShowRoom(true)} className='btn btn-outline-primary mt-2 me-4'>Add Server Room</button>
        </div>
        <ToastContainer style={{marginTop:'4.5%'}}></ToastContainer>

        <div className='d-flex flex-row'>
            <div style={{flex:'1.1', height:'80vh'}}>
                <h5>Server Room Names</h5>
                <ol className="list-group list-group">
                    {
                        roomarray.map((officename, index) => (
                            <li onClick={() => showRackView(officename)} className='list-group-item justify-content-between align-item-start' key={index}>
                                <div className='fw-light'>{officename}</div>
                            </li>
                        ))
                    }
          
            </ol>
            </div>

            <div className='border border-primary rounded m-2 shadow' style={{flex:'9'}}>
                <Routes>
                    <Route path='/' element={<RackDash/>}/>
                    <Route path='rackview' element={<RackView/>}/>
                </Routes>
            </div>
        </div>
        <Modal show={showroom} onHide={() => setShowRoom(false)}>
            <Modal.Header>
                <h4>Select Office</h4>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <label className='form-label'>Office Name</label>
                    <select onChange={(e) => setOfiiceName(e.target.value)} className='form-select'>
                        <option>Choose...</option>
                        {
                            arrayoffice.map((officename, index) => (
                                <option key={index} value={officename}>{officename}</option>
                            ))
                        }
                    </select>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={handleClick} className='btn btn-primary'>Add</button>
                <button onClick={() => setShowRoom(false)} className='btn btn-outline-secondary'>Cancel</button>
            </Modal.Footer>
        </Modal>
    </div>
  )
}
