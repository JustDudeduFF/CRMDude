import React, {useEffect, useState} from 'react'
import PONPort from './drawables/port.png'
import { Modal, Button } from 'react-bootstrap'
import EthernetPort from './drawables/ethernet.png'
import { get, onValue, ref, set } from 'firebase/database'
import { db } from '../../FirebaseConfig'
import { usePermissions } from '../PermissionProvider'
import './SYOLT.css'

const SYOLT =({pons, sfps, ethernet, show, deviceIndex, officename}) => {
  const {hasPermission} = usePermissions();
  
    const PON_RANGE = pons; // Set PON range dynamically
    const SFP_RANGE = sfps; // Set SFP range dynamically
    const ETHERNET_RANGE = ethernet;
    const isTwoRows = ETHERNET_RANGE > 7; // Determines if two rows are needed
    const lowerRowPorts = Array.from({ length: Math.ceil(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 1); // 1, 3, 5...
    const upperRowPorts = Array.from({ length: Math.floor(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 2); // 2, 4, 6...

    const [showModal, setShowModal] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [showModal3, setShowModal3] = useState(false);
    const [selectedPON, setSelectedPON] = useState(null);
    const [selectedSFP, setSelectedSFP] = useState(null);
    const [selectedEth, setSelectedEth] = useState(null);
    const [ponDetails, setPONDetails] = useState({ connectedTo: '', connectedPort: '', assignedArea:'' });
    const [sfpDetails, setSFPDetails] = useState({connectedTo:'', connectedPort:'', assignedArea:''});
    const [ethDetails, setEthDetails] = useState({connectedTo:'', connectedPort:''});
    const [arrayfms, setArrayFMS] = useState([]);
    const [arrayolt, setArrayOlt] = useState([]);
    const [arrayswitch, setArraySwitch] = useState([]);
    const [oltdata, setOldData] = useState([]);
    const [selectDevice, setSelectDevice] = useState([]);
    const [deviceselect, setDeviceSelect] = useState('');

    const [showAux, setShowAux] = useState(false);

    const [ponStatus, setPonStatus] = useState(Array(PON_RANGE).fill(false));
    const [sfpStatus, setSfpStatus] = useState(Array(SFP_RANGE).fill(false));
    const [ethernetStatus, setEthernetStatus] = useState(Array(ETHERNET_RANGE).fill(false));

    const [fmsmaxrange, setFmsMaxRange] = useState(0);
    const [fmskey, setFmsKey] = useState(undefined);
    
    // Handle right-click on PON
    const handlePONRightClick = (e, index) => {
      e.preventDefault(); // Prevent the default right-click menu
      if(hasPermission("UPDATE_RACK")){
        setSelectedPON(index + 1); // Set the selected PON (index starts from 1)
        setShowModal(true);
      } else{
        alert("Permission Denied")
      }
    };

    // Handle right-click on Ethernet
    const handleETHRightClick = (e, index) => {
      e.preventDefault(); // Prevent the default right-click menu
      if(hasPermission("UPDATE_RACK")){
        setSelectedEth(index + 1); // Set the selected PON (index starts from 1)
        setShowModal3(true);
      }else{
        alert("Permission Denied")
      } // Show the modal
    };

    //Handle Right Click on SFP
    const handleSFPRightClick = (e, index) => {
      e.preventDefault(); // Prevent the default right-click menu
      if(hasPermission("UPDATE_RACK")){
        setSelectedSFP(index + 1); // Set the selected PON (index starts from 1)
        setShowModal2(true);
      }else{
        alert("Permisison Denide")
      } // Show the modal
    };

    const saveETHDetails = async () => {
      const FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/Ethernet/${ethDetails.connectedPort}`);
      const oltPort = {
        connectedTo : fmskey,
        connectedPort: ethDetails.connectedPort,
       }

       const FmsPort = {
        connectedTo : deviceIndex,
        connectedPort: selectedEth,
  
       }

       const snapshot = await get(FmsRef);
      if (snapshot.exists()){
        const connectedTo = snapshot.child('connectedTo').val();
        const connectedPort = snapshot.child('connectedPort').val();
        alert(`That Port is Already Connected to ${connectedTo} with Port ${connectedPort}`);
      }else{
        if (parseInt(ethDetails.connectedPort) > fmsmaxrange || (!ethDetails.connectedTo || ethDetails.connectedTo === '')) {
          alert(`Port Number ${ethDetails.connectedPort} does not Exist in Device`);
        }else{
          try{
            
            await set(ref(db,  `Rack Info/${officename}/${deviceIndex}/Ethernet/${selectedEth}`), oltPort);
            await set(ref(db,  `Rack Info/${officename}/${fmskey}/Ethernet/${ethDetails.connectedPort}`), FmsPort);
            setShowModal(false);
            alert(`Ethernet ${selectedEth} Details are Saved to Device ID ${fmskey} on Port ${ethDetails.connectedPort}`);
  
          }catch(error) {
            console.log('Failed to Upload Data ' + error);
          }
        }
        setShowModal2(false);
       }
    }

    const saveSFPDetails = async () => {
      let FmsRef = '';
      if (deviceselect === 'FMS'){
        FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/Ports/${sfpDetails.connectedPort}`);
      }else{
        FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/SFPs/${sfpDetails.connectedPort}`);
      }
      const oltPort = {
        connectedTo : fmskey,
        connectedPort: sfpDetails.connectedPort,
       }

       const FmsPort = {
        connectedTo : deviceIndex,
        connectedPort: selectedSFP,
        portType: 'SFP',
        assignedArea: sfpDetails.assignedArea
  
       }

       const snapshot = await get(FmsRef);
      if (snapshot.exists()){
        const connectedTo = snapshot.child('connectedTo').val();
        const connectedPort = snapshot.child('connectedPort').val();
        alert(`That Port is Already Connected to ${connectedTo} with Port ${connectedPort}`);
      }else{
        if (parseInt(sfpDetails.connectedPort) > fmsmaxrange || (!sfpDetails.connectedTo || sfpDetails.connectedTo === '')) {
          alert(`Port Number ${sfpDetails.connectedPort} does not Exist in Device/FMS`);
        }else{
          try{
            
            await set(ref(db,  `Rack Info/${officename}/${deviceIndex}/SFPs/${selectedSFP}`), oltPort);
            await set(FmsRef, FmsPort);
            setShowModal(false);
            alert(`SFP ${selectedSFP} Details are Saved to Device/FMS ID ${fmskey} on Port ${sfpDetails.connectedPort}`);
  
          }catch(error) {
            console.log('Failed to Upload Data ' + error);
          }
        }
        setShowModal2(false);
       }
    }

    // Handle form submission to save PON details
    const savePONDetails = async() => {
     const FmsRef = ref(db, `Rack Info/${officename}/${fmskey}/Ports/${ponDetails.connectedPort}`);

     const oltPort = {
      connectedTo : fmskey,
      connectedPort: ponDetails.connectedPort,
     }

     const FmsPort = {
      connectedTo : deviceIndex,
      connectedPort: selectedPON,
      portType: 'PON',
      assignedArea: ponDetails.assignedArea

     }
     
     const snapshot = await get(FmsRef);
     if (snapshot.exists()){
      const connectedTo = snapshot.child('connectedTo').val();
      const connectedPort = snapshot.child('connectedPort').val();
      alert(`That Port is Already Connected to ${connectedTo} with Port ${connectedPort}`);
     }else{
      if (parseInt(ponDetails.connectedPort) > fmsmaxrange || (!ponDetails.connectedTo || ponDetails.connectedTo === '')) {
        alert(`Port Number ${ponDetails.connectedPort} does not exist in FMS`);
      }else{
        try{
          
          await set(ref(db,  `Rack Info/${officename}/${deviceIndex}/PONs/${selectedPON}`), oltPort);
          await set(ref(db,  `Rack Info/${officename}/${fmskey}/Ports/${ponDetails.connectedPort}`), FmsPort);
          setShowModal(false);
          alert(`Pon ${selectedPON} Details are Saved to fms ID ${fmskey} on Port ${ponDetails.connectedPort}`);

        }catch(error) {
          console.log('Failed to Upload Data ' + error);
        }
      }
     }
      setShowModal(false); // Close the modal after saving
    };

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
              const swethernetrange = snaps.val().swethernetrange;
              const swsfpsrange = snaps.val().swsfpsrange;
              
              const ethernetRange = snaps.val().ethernetRange;
              const sfpRange = snaps.val().sfpRange;
              const manufacturer = snaps.val().manufacturer;
              const oltType = snaps.val().oltType;
  
              if (device === 'FMS') {
                FMSArray.push({ fmsrange, fmsname, serialNo, devicekey });
              }else if(device === 'Switch'){
                SwitchArray.push({swisp, swethernetrange, swsfpsrange, serialNo, devicekey});
              }else if(device === 'OLT' && parseInt(devicekey) === deviceIndex){
                OltArray.push({ethernetRange, sfpRange, manufacturer, oltType, serialNo});
              }

              if (device === 'OLT' && !deviceIndex){
                alloltdata.push({oltType, devicekey, serialNo, sfpRange});
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
            const ponPorts = data.PONs || {};
            const sfpPorts = data.SFPs || {};
            const ethernetPorts = data.Ethernet || {};
            
            // Mark ports with connectedTo
            const ponStatus = Array.from({ length: PON_RANGE }).map((_, index) => !!ponPorts[index + 1]?.connectedTo);
            const sfpStatus = Array.from({ length: SFP_RANGE }).map((_, index) => !!sfpPorts[index + 1]?.connectedTo);
            const ethernetStatus = Array.from({ length: ETHERNET_RANGE }).map((_, index) => !!ethernetPorts[index + 1]?.connectedTo);
            
            setPonStatus(ponStatus);
            setSfpStatus(sfpStatus);
            setEthernetStatus(ethernetStatus);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
    
      fetchData();
    }, [officename, deviceIndex, PON_RANGE, SFP_RANGE, ETHERNET_RANGE]);
    

    if (!show) return null

  return (
    <>
      <div className="olt-container">
        <div className="olt-device-panel">
          
          {/* Device Info Header */}
          <div className="device-info-header">
            {arrayolt.map(({manufacturer, serialNo, oltType}, index) => (
              <div key={index} className="device-info">
                <div className="device-brand">{manufacturer}</div>
                <div className="device-model">{oltType}</div>
                <div className="device-serial">{serialNo}</div>
              </div>
            ))}
            
            <div className="device-indicator">
              <div className="power-led active"></div>
              <span className="led-label">PWR</span>
            </div>
          </div>

          {/* Ports Section */}
          <div className="ports-container">
            
            {/* PON Ports Section */}
            <div className="port-section pon-section">
              <div className="section-label">PON PORTS</div>
              <div className="ports-grid">
                {Array.from({ length: PON_RANGE }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`port-item pon-port ${ponStatus[index] ? 'connected' : 'disconnected'}`}
                    onContextMenu={(e) => handlePONRightClick(e, index)}
                  >
                    <img 
                      alt="" 
                      src={PONPort} 
                      className="port-image"
                    />
                    <span className="port-number">{index + 1}</span>
                    {ponStatus[index] && <div className="connection-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* SFP Ports Section */}
            <div className="port-section sfp-section">
              <div className="section-label">SFP+ PORTS</div>
              <div className="ports-grid">
                {Array.from({ length: SFP_RANGE }).map((_, index) => (
                  <div 
                    key={index} 
                    className={`port-item sfp-port ${sfpStatus[index] ? 'connected' : 'disconnected'}`}
                    onContextMenu={(e) => handleSFPRightClick(e, index)}
                  >
                    <div className="sfp-slot"></div>
                    <span className="port-number">GE {index + 1}</span>
                    {sfpStatus[index] && <div className="connection-indicator"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Ethernet Ports Section */}
            <div className="port-section ethernet-section">
              <div className="section-label">ETHERNET PORTS</div>
              <div className={`ethernet-container ${isTwoRows ? 'two-rows' : 'single-row'}`}>
                
                {ETHERNET_RANGE < 8 ? (
                  <div className="ethernet-row">
                    {Array.from({ length: ETHERNET_RANGE }).map((_, index) => (
                      <div 
                        key={index} 
                        className={`port-item ethernet-port ${ethernetStatus[index] ? 'connected' : 'disconnected'}`}
                        onContextMenu={(e) => handleETHRightClick(e, index)}
                      >
                        <img
                          alt=""
                          src={EthernetPort}
                          className={`port-image ${!isTwoRows ? 'rotated' : ''}`}
                        />
                        <span className="port-number">GE {index + 1}</span>
                        {ethernetStatus[index] && <div className="connection-indicator"></div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="ethernet-row upper-row">
                      {upperRowPorts.map((portNumber, index) => (
                        <div 
                          key={index} 
                          className={`port-item ethernet-port ${ethernetStatus[portNumber - 1] ? 'connected' : 'disconnected'}`}
                          onContextMenu={(e) => handleETHRightClick(e, portNumber - 1)}
                        >
                          <span className="port-number top">GE {portNumber}</span>
                          <img
                            alt=""
                            src={EthernetPort}
                            className="port-image rotated"
                          />
                          {ethernetStatus[portNumber - 1] && <div className="connection-indicator"></div>}
                        </div>
                      ))}
                    </div>

                    <div className="ethernet-row lower-row">
                      {lowerRowPorts.map((portNumber, index) => (
                        <div 
                          key={index} 
                          className={`port-item ethernet-port ${ethernetStatus[portNumber - 1] ? 'connected' : 'disconnected'}`}
                          onContextMenu={(e) => handleETHRightClick(e, portNumber - 1)}
                        >
                          <img
                            alt=""
                            src={EthernetPort}
                            className="port-image"
                          />
                          <span className="port-number bottom">GE {portNumber}</span>
                          {ethernetStatus[portNumber - 1] && <div className="connection-indicator"></div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Management Ports */}
            <div className="port-section management-section">
              <div className="section-label">MGMT</div>
              <div className="mgmt-ports">
                <div className="port-item mgmt-port">
                  <span className="port-number top">Console</span>
                  <img alt="" src={EthernetPort} className="port-image rotated" />
                </div>

                <div className="port-item mgmt-port">
                  <img alt="" src={EthernetPort} className="port-image" />
                  <span className="port-number bottom">AUX</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal for Editing PON Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Configure PON Port {selectedPON}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className='modal-form'>
            <div className="form-group">
              <label className="form-label">Connected To</label>
              <select 
                onChange={(e) => {
                  const selectedfms = e.target.value;
                  setPONDetails({ ...ponDetails, connectedTo: selectedfms });

                  const setSelectedFMS = arrayfms.find(fms => fms.fmsname === selectedfms);
                  if (setSelectedFMS) {
                    setFmsMaxRange(parseInt(setSelectedFMS.fmsrange));
                    setFmsKey(setSelectedFMS.devicekey);
                  }else{
                    setFmsMaxRange(0);
                    setFmsKey(undefined);
                  }
                }} 
                className='form-select'
              >
                <option value=''>Choose FMS Device...</option>
                {
                  arrayfms.length > 0 ? (
                    arrayfms.map(({ fmsname, serialNo }, index) => (
                      <option key={index} value={fmsname}>{`${fmsname} : ${serialNo}` }</option>
                    ))
                  ) : (
                    <option>Please Add FMS</option>
                  )
                }
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter port number"
                value={ponDetails.connectedPort}
                onChange={(e) => setPONDetails({ ...ponDetails, connectedPort: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Area/Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter area or description"
                value={ponDetails.assignedArea}
                onChange={(e) => setPONDetails({ ...ponDetails, assignedArea: e.target.value })}
              />
            </div>
            
            <Button variant="primary" onClick={savePONDetails} className="save-btn">
              Save Configuration
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal for Editing SFP Details */}
      <Modal show={showModal2} onHide={() => setShowModal2(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Configure SFP+ Port {selectedSFP}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className='modal-form'>
            <div className='form-group'>
              <label className='form-label'>Device Type</label>
              <select 
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  setDeviceSelect(selectedValue);
                  if (selectedValue === 'Switch'){
                    setSelectDevice(arrayswitch);
                  }else if(selectedValue === 'FMS'){
                    setSelectDevice(arrayfms);
                  }else if (selectedValue === 'OLT'){
                    setSelectDevice(oltdata);
                  }
                }} 
                className='form-select'
              >
                <option value=''>Choose Device Type...</option>
                <option value='Switch'>Switch</option>
                <option value='FMS'>FMS</option>
                <option value='OLT'>OLT</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Connected To</label>
              <select 
                onChange={(e) => {
                  const selectedDeviceKey = e.target.value;
                  setSFPDetails({ ...sfpDetails, connectedTo: selectedDeviceKey });

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
                <option value=''>Choose Device...</option>
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

            <div className="form-group">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter port number"
                value={sfpDetails.connectedPort}
                onChange={(e) => setSFPDetails({ ...sfpDetails, connectedPort: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Area/Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter area or description"
                value={sfpDetails.assignedArea}
                onChange={(e) => setSFPDetails({ ...sfpDetails, assignedArea: e.target.value })}
              />
            </div>
            
            <Button variant="primary" onClick={saveSFPDetails} className="save-btn">
              Save Configuration
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal for Editing Ethernet Details */}
      <Modal show={showModal3} onHide={() => setShowModal3(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Configure Ethernet Port {selectedEth}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className='modal-form'>
            <div className='form-group'>
              <label className='form-label'>Device Type</label>
              <select 
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue === 'Switch'){
                    setSelectDevice(arrayswitch);
                  }else if (selectedValue === 'OLT'){
                    setSelectDevice(oltdata);
                  }
                }} 
                className='form-select'
              >
                <option value=''>Choose Device Type...</option>
                <option value='Switch'>Switch</option>
                <option value='OLT'>OLT</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Connected To</label>
              <select 
                onChange={(e) => {
                  const selectedDeviceKey = e.target.value;
                  setEthDetails({ ...ethDetails, connectedTo: selectedDeviceKey });

                  const selectedDevice = selectDevice.find(device => device.devicekey === selectedDeviceKey);
                  
                  if (selectedDevice) {
                    const maxRange = selectedDevice.ethernetRange || selectedDevice.swethernetrange;
                    setFmsMaxRange(parseInt(maxRange) || 0);
                    setFmsKey(selectedDevice.devicekey);
                  } else {
                    setFmsMaxRange(0);
                    setFmsKey(undefined);
                  }
                }} 
                className="form-select"
              >
                <option value=''>Choose Device...</option>
                {
                  selectDevice.length > 0 ? (
                    selectDevice.map(({ swisp, serialNo, oltType, devicekey }, index) => {
                      let displayText = '';

                     if (swisp) {
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

            <div className="form-group">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter port number"
                value={ethDetails.connectedPort}
                onChange={(e) => setEthDetails({ ...ethDetails, connectedPort: e.target.value })}
              />
            </div>
            
            <Button variant="primary" onClick={saveETHDetails} className="save-btn">
              Save Configuration
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default SYOLT