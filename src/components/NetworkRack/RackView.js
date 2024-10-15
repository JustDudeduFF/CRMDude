import React, { useState, useEffect } from 'react';
import { ref, get, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import RackDataModal from './RackDataModal';
import { useLocation } from 'react-router-dom';
import './Rack.css';
import SYOLT from './SYOLT';
import Switch from './Switch';
import FMS from './FMS'

export default function RackView() {
    const location = useLocation();
    const { officename } = location.state || {};
    const { roomname } = location.state || {};
    const [isRack, setIsRack] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [counts, setCounts] = useState(0);

    

    const [oltDevices, setOltDevices] = useState([]); // Array to store OLT devices
    const [switchDevices, setSwitchDevices] = useState([]); // Array to store Switch devices
    const [fmsDevices, setFmsDevices] = useState([]);


    const fetchRackNewRef = async () => {
      try {
        const rackRef = ref(db, `Rack Info/${officename}/${roomname}`); // Ensure you define officename and roomname
        const snapshot = await get(rackRef);

        if (snapshot.exists()) {
          // The number of child nodes is the count of devices
          const deviceCount = snapshot.size; // Get the size of the snapshot (number of children)
          setCounts(deviceCount - 4);
        } else {
          setCounts(0); // No devices found
        }
      } catch (error) {
        console.error('Error fetching devices count:', error);
      }
    };


    useEffect(() => {
        const rackRef = ref(db, `Rack Info/${officename}/${roomname}`);
        const fetchRackDevices = onValue(rackRef, (snapshot) => {
            if (snapshot.exists()) {
                const devicesData = snapshot.val();

                // Initialize arrays to hold devices
                const olts = [];
                const switches = [];
                const fms = [];

                // Loop through the devices (e.g., 0, 1, 2, ...) and classify them
                Object.keys(devicesData).forEach((deviceKey) => {
                    const deviceData = devicesData[deviceKey];
                    if (!deviceData) {
                        setIsRack(false);
                    }else{
                        if (deviceData.device === 'OLT') {
                            olts.push({
                                officename: officename,
                                roomname: roomname,
                                deviceKey: deviceData.deviceKey,
                                ponRange: parseInt(deviceData.ponRange, 10),
                                sfpRange: parseInt(deviceData.sfpRange, 10),
                                ethernetRange: parseInt(deviceData.ethernetRange, 10),
                            });
                        } else if (deviceData.device === 'Switch') {
                            switches.push({
                                officename: officename,
                                roomname: roomname,
                                deviceKey: deviceData.deviceKey,
                                swethernetrange: parseInt(deviceData.swethernetrange, 10),
                                swsfpsrange: parseInt(deviceData.swsfpsrange, 10),
                            });
                        } else if (deviceData.device === 'FMS') {
                            fms.push({
                                officename: officename,
                                roomname: roomname,
                                deviceKey: deviceData.deviceKey,
                                fmsname:deviceData.fmsname,
                                fmsrange: parseInt(deviceData.fmsrange, 10)
                            })
                        }

                        setIsRack(true);
                    }

                    
                });

                // Update state with the classified devices
                setOltDevices(olts);
                setSwitchDevices(switches);
                setFmsDevices(fms)
                
            }
            

        });

        return () => fetchRackDevices();
    }, [officename, roomname]); // Only run on mount

    const addRack = () => {
        fetchRackNewRef();
        setShowModal(true);
    }

    return (
        <div>
            {isRack ? (
                <div className='d-flex flex-column wd-100 p-2'>
                    <div className='d-flex flex-row'>
                        <h5 style={{ flex: '1' }}>{officename}</h5>
                        <button onClick={addRack} className='btn btn-primary'> + Add Rack</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        {/* Render OLT components */}
                        <div className='d-flex flex-column'>
                          {oltDevices.map((olt, index) => (
                              <SYOLT key={`olt-${index}`} show={true} pons={olt.ponRange} sfps={olt.sfpRange} ethernet={olt.ethernetRange} deviceIndex={olt.deviceKey} officename={olt.officename} roomname={olt.roomname} />
                          ))}
                          {/* Render Switch components */}
                          {switchDevices.map((sw, index) => (
                              <Switch key={`switch-${index}`} show={true} ethernet={sw.swethernetrange} sfps={sw.swsfpsrange} />
                          ))}
                          {/* Render FMS components */}
                          {fmsDevices.map((fms, index) => (
                              <FMS key={`switch-${index}`} show={true} fmsport={fms.fmsrange} officename={fms.officename} roomname={fms.roomname} deviceIndex={fms.deviceKey}/>
                          ))}
                        </div>
                    </div>
                    <RackDataModal closeModal={() => setShowModal(false)} show={showModal} officename={officename} roomname={roomname} count={counts} />
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '350px' }}>
                    <button onClick={addRack} className='btn btn-primary'> + Add Rack</button>
                    <RackDataModal closeModal={() => setShowModal(false)} show={showModal} officename={officename} roomname={roomname} count={counts}/>
                </div>
            )}
        </div>
    );
}
