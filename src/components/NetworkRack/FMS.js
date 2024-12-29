import React, { useEffect, useState } from 'react'
import OpticalPort from './drawables/optical.png'
import { ref, onValue, get, set } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { Modal, Button } from 'react-bootstrap';
import { usePermissions } from '../PermissionProvider';

const FMS = ({fmsport, show, officename, deviceIndex}) => {
    const PORT_RANGE = fmsport;
    const isTwoRows = PORT_RANGE > 24; // Determines if two rows are needed
    const {hasPermission} = usePermissions();


    const [arrayfms, setArrayFMS] = useState([]);
    const [arrayolt, setArrayOlt] = useState([]);
    const [arrayswitch, setArraySwitch] = useState([]);
    const [oltdata, setOldData] = useState([]);

    const [showModal3, setShowModal3] = useState(false);
    const [portDetails, setPortDetails] = useState({connectedTo:'', connectedPort:'', assignedArea:''});

    const [selectDevice, setSelectDevice] = useState([]);
    const [deviceselect, setDeviceSelect] = useState('');
    const [selectedPort, setSelectedPort] = useState(null);


    const [fmsmaxrange, setFmsMaxRange] = useState(0);
    const [fmskey, setFmsKey] = useState(undefined);


    const [portStatus, setPortStatus] = useState(Array(PORT_RANGE).fill(false));

    // Handle right-click on Port
    const handlePortRightClick = (e, index) => {
        e.preventDefault(); // Prevent the default right-click menu
        if(hasPermission("UPDATE_RACK")){
          setSelectedPort(index); // Set the selected PON (index starts from 1)
          setShowModal3(true);
        }else{
          alert("Permission Denied");
        } // Show the modal
      };


      const savePortDetails = async () => {
        let FmsRef = '';
        if (deviceselect === 'FMS'){
          FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/Ports/${portDetails.connectedPort}`);
        }else{
          FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/SFPs/${portDetails.connectedPort}`);
          
          
        }
        const oltPort = {
          connectedTo : deviceIndex,
          connectedPort: selectedPort,
         }
  
         const FmsPort = {
          connectedTo : fmskey,
          connectedPort: portDetails.connectedPort,
          portType: 'SFP',
          assignedArea: portDetails.assignedArea
    
         }
  
  
         const snapshot = await get(FmsRef);
        if (snapshot.exists()){
          const connectedTo = snapshot.child('connectedTo').val();
          const connectedPort = snapshot.child('connectedPort').val();
          alert(`That Port is Already Connected to ${connectedTo} with Port ${connectedPort}`);
        }else{
          if (parseInt(portDetails.connectedPort) > fmsmaxrange || (!portDetails.connectedTo || portDetails.connectedTo === '')) {
            alert(`Port Number ${portDetails.connectedPort} does not Exist in Device/FMS`);
          }else{
            try{
              
              await set(FmsRef, oltPort);
              await set(ref(db,  `Rack Info/${officename}/${deviceIndex}/Ports/${selectedPort}`), FmsPort);
              setShowModal3(false);
              alert(`SFP ${selectedPort} Details are Saved to Device/FMS ID ${fmskey} on Port ${portDetails.connectedPort}`);
    
            }catch(error) {
              console.log('Failed to Upload Data ' + error);
            }
          }
          setShowModal3(false);
         }
      }

    useEffect(() => {
      
        const RackRef = ref(db, `Rack Info/${officename}`);
        // Setup the real-time listener
        const unsubscribe = onValue(RackRef, (snapshots) => {
          if (snapshots.exists()) {
            const FMSArray = [];
            const SwitchArray = [];
            const OltArray = [];

            const alloltdata = [];

            
            snapshots.forEach((snaps) => {
              const device = snaps.val().device;
              const fmsrange = snaps.val().fmsrange;
              const fmsname = snaps.val().fmsname;
              const serialNo = snaps.val().serialNo;
              const devicekey = snaps.key;

              const swisp = snaps.val().swisp;
              
              const swsfpsrange = snaps.val().swsfpsrange;
              
              
              const sfpRange = snaps.val().sfpRange;
              
              const oltType = snaps.val().oltType;
  
              if (device === 'FMS' && parseInt(devicekey) === deviceIndex) {
                FMSArray.push({ fmsrange, fmsname, serialNo, devicekey });
              }else if(device === 'Switch'){
                SwitchArray.push({swisp, swsfpsrange, serialNo, devicekey});
              }else if(device === 'OLT'){
                OltArray.push({sfpRange, oltType, serialNo, devicekey});
              }

              if (device === 'FMS'){
                alloltdata.push({fmsname, devicekey, serialNo, fmsrange});
              }

             

              

            });

            setOldData(alloltdata);
            setArrayFMS(FMSArray);
            setArrayOlt(OltArray);
            setArraySwitch(SwitchArray);
            
          }
        });
  
        // Cleanup the listener when component unmounts or `show` changes
        return () => unsubscribe();
      
    }, [officename]);


    useEffect(() => {
      const fetchData = async () => {
        try {
          const portsRef = ref(db, `Rack Info/${officename}/${deviceIndex}`);
          const snapshot = await get(portsRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Check if the PONs, SFPs, and Ethernet ports have connectedTo
            const Ports = data.Ports || {};
           
            
            // Mark ports with connectedTo
            const portStatus = Array.from({ length: PORT_RANGE }).map((_, index) => !!Ports[index + 1]?.connectedPort);
            
            
            setPortStatus(portStatus);
            
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
    
      fetchData();
    }, [officename, deviceIndex, PORT_RANGE]);
    

    if (!show) return null;

  return (
    <>
    <div style={{display:'flex', flexDirection:'column', width:'max-content', border:'1px solid black', height:'max-content', padding:'10px', borderRadius:'15px', marginTop:'35px', backgroundColor:'blue', boxShadow:'0 0 10px gray'}}>
        <div style={{display:'flex', flexDirection:'column', width:'850px', height:'108px', border:'1px solid black', paddingBottom:'5px', alignItems:'center', backgroundColor:'whitesmoke', borderRadius:'5px'}}>

            {/* FMS Optical Ports */}
            
            <div style={{ display: 'flex', flexDirection: 'row', flex: '1', justifyContent:'center' }}>
                  {Array.from({ length: Math.min(PORT_RANGE, 24) }).map((_, upperIndex) => (
                    <div key={upperIndex} className='d-flex flex-column'>
                      
                      {/* Upper Row */}
                      <div className='d-flex flex-row mb-1'>
                        <div
                          style={{ width: '35px', height: '35px', display: 'flex', flexDirection: 'column' }}
                          onContextMenu={(e) => handlePortRightClick(e, upperIndex + 1)}
                        >
                          <img
                            alt=""
                            src={OpticalPort}
                            style={{
                              borderRadius:'3px',
                              margin:'2px',
                              width: '27px',
                              height: '27px',
                              backgroundColor: portStatus[upperIndex] ? 'green' : 'transparent' // Correct portStatus for upper row
                            }}
                          />
                          <span
                            style={{
                              fontSize: '9px',
                              width: '27px',
                              textAlign: 'center',
                              fontFamily: 'initial',
                              color: 'black',
                              fontWeight: 'bold'
                            }}
                          >
                            {upperIndex + 1}
                          </span>
                        </div>
                      </div>

                      {/* Lower Row, only if two rows are required */}
                      {isTwoRows && upperIndex < Math.floor(PORT_RANGE / 2) && (
                        <div className='d-flex flex-row mt-1'>
                          <div
                            style={{ width: '35px', height: '35px', display: 'flex', flexDirection: 'column' }}
                            onContextMenu={(e) => handlePortRightClick(e, upperIndex + 25)}
                          >
                            <img
                              alt=""
                              src={OpticalPort}
                              style={{
                                borderRadius:'3px',
                                margin:'2px',
                                width: '27px',
                                height: '27px',
                                backgroundColor: portStatus[upperIndex + 24] ? 'green' : 'transparent' // Correct portStatus for lower row
                              }}
                            />
                            <span
                              style={{
                                fontSize: '9px',
                                width: '27px',
                                textAlign: 'center',
                                fontFamily: 'initial',
                                color: 'black',
                                fontWeight: 'bold'
                              }}
                            >
                              {upperIndex + 25} {/* Index for lower row starts from 25 */}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>


            
                {
                    arrayfms.map(({fmsname, serialNo}, index) => (
                        <div className='mt-1' key={index}>
                            <label className='form-label'>{fmsname}</label>
                            <span>:</span>
                            <label className='form-label'>{serialNo}</label>

                        </div>
                    ))
                }
                
            

        </div>
    </div>


    <Modal show={showModal3} onHide={() => setShowModal3(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Port {selectedPort} Details</Modal.Title>
              
        </Modal.Header>
        
        
          <form className='p-2'>
            <div className='mb-3'>
              <label className='form-label'>Connected Device</label>
              <select onChange={(e) => {
                const selectedValue = e.target.value;
                setDeviceSelect(selectedValue);
                if (selectedValue === 'Switch'){
                  setSelectDevice(arrayswitch);
                }else if(selectedValue === 'FMS'){
                  setSelectDevice(oltdata);
                }else if (selectedValue === 'OLT'){
                  setSelectDevice(arrayolt);

                }

              }} className='form-select'>
                <option val=''>Choose...</option>
                <option val='Switch'>Switch</option>
                <option val='FMS'>FMS</option>
                <option val='OLT'>OLT</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Connected To</label>
              <select 
                onChange={(e) => {
                  const selectedDeviceKey = e.target.value; // Correctly using the devicekey
                  setPortDetails({ ...portDetails, connectedTo: selectedDeviceKey });
                  
                  

                  const selectedDevice = selectDevice.find(device => device.devicekey === selectedDeviceKey);
                  
                  if (selectedDevice) {
                    const maxRange = selectedDevice.fmsrange || selectedDevice.sfpRange || selectedDevice.swsfpsrange;
                    setFmsMaxRange(parseInt(maxRange) || 0);
                    setFmsKey(selectedDevice.devicekey);
                    
                  } else {
                    setFmsMaxRange(0);
                    setFmsKey(undefined);
                    
                  }
                }} 
                className="form-select"
              >
                <option value=''>Choose...</option>
                {
                  selectDevice.length > 0 ? (
                    selectDevice.map(({ fmsname, swisp, serialNo, oltType, devicekey }, index) => {
                      let displayText = '';

                      if (fmsname) {
                        displayText = `${fmsname} : ${serialNo}`;
                      } else if (swisp) {
                        displayText = `${swisp} : ${serialNo}`;
                      } else if (oltType) {
                        displayText = `${oltType} : ${serialNo}`;
                      }

                      return (
                        <option key={index} value={devicekey}>
                          {displayText}
                        </option>
                      );
                    })
                  ) : (
                    <option value=''>No Data</option>
                  )
                }
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                value={portDetails.connectedPort}
                onChange={(e) => setPortDetails({ ...portDetails, connectedPort: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Assigned Area/Name</label>
              <input
                type="text"
                className="form-control"
                value={portDetails.assignedArea}
                onChange={(e) => setPortDetails({ ...portDetails, assignedArea: e.target.value })}
              />
            </div>
            <Button variant="primary" onClick={savePortDetails}>
              Save Details
            </Button>
          </form>
       
      </Modal>
    </>
  )
}

export default FMS
