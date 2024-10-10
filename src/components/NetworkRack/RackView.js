import React, {useState} from 'react'
import RackDataModal from './RackDataModal';
import { useLocation } from 'react-router-dom';

export default function RackView() {
    const location = useLocation();
    const {roomarray} = location.state || {};
    const [isRack, setIsRack] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const addRack = () => {
        setShowModal(true);
    }
  return (
    <div>
      {
        isRack ? (
           <div>
            <h5>Nothing</h5>
            
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
