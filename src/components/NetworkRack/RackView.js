import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import RackDataModal from './RackDataModal';
import { useLocation } from 'react-router-dom';
import './Rack.css'

export default function RackView() {
    const location = useLocation();
    const {roomarray} = location.state || {};
    const [isRack, setIsRack] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [rackData, setRackData] = useState(null);


  useEffect(() => {
    const rackRef = ref(db, `Rack Info/${roomarray[0].officename}/${roomarray[0].roomname}/Racks`); // Adjust this path based on where you store your racks
    onValue(rackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsRack(true);
        // Assuming there is only one rack for now, you can handle multiple later
        snapshot.forEach((childSnap) => {
          const firstRack = Object.values(childSnap.val())[0];
          setRackData(firstRack);
        })
      }else{
        setIsRack(false);
      }
    });
  }, []);

  if (!rackData) {
    return <div>Loading rack data...</div>;
  }

    const addRack = () => {
        setShowModal(true);
    }
  return (
    <div>
      {
        isRack ? (
          <div className="container">
          <h2>Rack: {rackData.rack_name}</h2>
          <p>Location: {rackData.location}</p>
          <p>Description: {rackData.description}</p>
    
          <div className="rack-layout">
            {rackData.devices && rackData.devices.map((device, deviceIndex) => (
              <div key={deviceIndex} className="device">
                <h3>Device {deviceIndex + 1} ({device.device_type})</h3>
                <p>Serial No: {device.serial_no}</p>
                <p>Model: {device.model}</p>
                <p>IP Address: {device.ip_address}</p>
    
                <div className="ports">
                  {device.ports && device.ports.map((port, portIndex) => (
                    <div key={portIndex} className="port">
                      <h4>Port {port.port_no}</h4>
                      <p>Uplink: {port.uplink ? 'Yes' : 'No'}</p>
                      <p>SFP: {port.sfp ? 'Yes' : 'No'}</p>
                      <p>Speed: {port.speed}</p>
                      <p>Connected To: {port.connected_to}</p>
                      <p>Connected Port: {port.connected_port}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
