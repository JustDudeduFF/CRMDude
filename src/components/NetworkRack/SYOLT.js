import React, {useEffect, useState} from 'react'
import PONPort from './drawables/port.png'
import { Modal, Button } from 'react-bootstrap'
import EthernetPort from './drawables/ethernet.png'
import { get, onValue, ref, set } from 'firebase/database'
import { db } from '../../FirebaseConfig'

const SYOLT =({pons, sfps, ethernet, show, deviceIndex, officename, roomname}) => {

  


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
    const [ponDetails, setPONDetails] = useState({ connectedTo: '', connectedPort: '' });
    const [sfpDetails, setSFPDetails] = useState({connectedTo:'', connectedPort:''})
    const [arrayfms, setArrayFMS] = useState([]);
    const [arrayolt, setArrayOlt] = useState([]);
    const [arrayswitch, setArraySwitch] = useState([]);


    const [fmsmaxrange, setFmsMaxRange] = useState(0);
    const [fmskey, setFmsKey] = useState(undefined);
    

    //Fetch Availabel FMS in Rack
    const RackRef = ref(db, `Rack Info/${officename}/${roomname}`);

    // Handle right-click on PON
    const handlePONRightClick = (e, index) => {
      e.preventDefault(); // Prevent the default right-click menu
      setSelectedPON(index + 1); // Set the selected PON (index starts from 1)
      setShowModal(true); // Show the modal
    };

    //Handle Right Click on SFP
    const handleSFPRightClick = (e, index) => {
      e.preventDefault(); // Prevent the default right-click menu
      setSelectedSFP(index + 1); // Set the selected PON (index starts from 1)
      setShowModal2(true); // Show the modal
    };

    // Handle form submission to save PON details
    const savePONDetails = async() => {
     const FmsRef = ref(db, `Rack Info/${officename}/${roomname}/${fmskey}/Ports/${ponDetails.connectedPort}`);

     const oltPort = {
      connectedTo : fmskey,
      connectedPort: ponDetails.connectedPort,
     }

     const FmsPort = {
      connectedTo : deviceIndex,
      connectedPort: selectedPON,
      portType: 'PON',

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
          
          await set(ref(db,  `Rack Info/${officename}/${roomname}/${deviceIndex}/PONs/${selectedPON}`), oltPort);
          await set(ref(db,  `Rack Info/${officename}/${roomname}/${fmskey}/Ports/${ponDetails.connectedPort}`), FmsPort);
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
      if (show) {
        // Setup the real-time listener
        const unsubscribe = onValue(RackRef, (snapshots) => {
          if (snapshots.exists()) {
            const FMSArray = [];
            const SwitchArray = [];
            const OltArray = [];
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
                SwitchArray.push({swisp, swethernetrange, swsfpsrange});
              }else if(device === 'OLT' && parseInt(devicekey) === deviceIndex){
                
                OltArray.push({ethernetRange, sfpRange, manufacturer, oltType, serialNo});
              }
            });

            
            setArrayFMS(FMSArray);
            setArrayOlt(OltArray);
            setArraySwitch(SwitchArray);
          }
        });
  
        // Cleanup the listener when component unmounts or `show` changes
        return () => unsubscribe();
      }
    }, [show]);

    if (!show) return null



  return (
    <>
            <div style={{display:'flex', flexDirection:'column', width:'max-content', border:'1px solid black', height:'max-content', padding:'10px', borderRadius:'15px', marginTop:'35px', backgroundColor:'orange', boxShadow:'0 0 10px gray'}}>
                  <div style={{display:'flex', flexDirection:'row', width:'850px', height:'92px', border:'1px solid black', paddingBottom:'5px', alignItems:'center', backgroundColor:'whitesmoke', borderRadius:'5px'}}>

                  {
                    arrayolt.map(({manufacturer, serialNo, oltType}, index) => (
                      <div key={index} className='d-flex flex-column ms-1'>
                        <span style={{fontSize:'12px'}}>{manufacturer}</span>
                        <span style={{fontSize:'12px'}}>{oltType}</span>
                        <span style={{fontSize:'12px'}}>{serialNo}</span>
                      </div>
                    ))
                  }

                    {/* PONs Layout */}
                    <div style={{display:'flex', flexDirection:'row', marginLeft:'-3px', flex:'1'}}>
                    <div style={{display:'flex', flexDirection:'row', marginLeft:'5px', marginTop:'2px'}}>
                    {Array.from({ length: PON_RANGE }).map((_, index) => (
                        <div key={index} style={{width:'30px', height:'30px', display:'flex', flexDirection:'column', marginLeft:'5px', marginTop:'2px'}}  onContextMenu={(e) => handlePONRightClick(e, index)}>
                          <img alt="" src={PONPort} style={{width:'22px', height:'22px'}} />
                          <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>{index + 1}</span>
                        </div>
                      ))}
                    </div>


                    
                    </div>
                    

                      {/* For SFP SLOT */}
                      <div style={{display:'flex', flexDirection:'row', marginLeft:'10px', flex:'1'}}>
                      {Array.from({ length: SFP_RANGE }).map((_, index) => (
                       <div key={index} style={{ width: '40px', height: '40px', display: 'flex', flexDirection: 'column' }} onContextMenu={(e) => handleSFPRightClick(e, index)}>
                       <div style={{width:'32px', height:'32px', backgroundColor:'black', borderRadius:'3px'}}></div>
                       <span style={{ fontSize: '9px', width: '32px', textAlign: 'center', fontFamily: 'initial' }}>
                       GE {index + 1}
                       </span>
                   </div>
                      ))}


                        
                        </div>

                        

                      {/* For Etherner Ports */}
                      <div style={{ display: 'flex', flexDirection: 'row', flex: '1', marginLeft:'10px' }}>
                        <div className='d-flex flex-column'>
                          {/* Lower Row (starts with 1, 3, 5...) */}
                          <div className='d-flex flex-row mb-1'>
                          {
                              ETHERNET_RANGE < 8  ? (
                                <div className='d-flex flex-row'>
                                  {Array.from({ length: ETHERNET_RANGE }).map((_, index) => (
                                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                                      <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px', transform:isTwoRows ? '' : 'rotate(180deg)' }} />
                                      <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                                        GE {index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className='d-flex flex-row'>
                                  {upperRowPorts.map((portNumber, index) => (
                                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                                        GE {portNumber}
                                      </span>
                                      <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px', transform:'rotate(180deg)' }} />
                                      
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                          </div>

                          {/* Upper Row (starts with 2, 4, 6...) */}
                          {isTwoRows && (




                            <div className='d-flex flex-row mt-1'>

                            {
                              ETHERNET_RANGE < 8  ? (
                                <div className='d-flex flex-row'>
                                  {Array.from({ length: ETHERNET_RANGE }).map((_, index) => (
                                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                                      <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px' }} />
                                      <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                                        GE {index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className='d-flex flex-row'>
                                  {lowerRowPorts.map((portNumber, index) => (
                                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                                      <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px' }} />
                                      <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                                        GE {portNumber}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                             
                            </div>
                          )}
                        </div>
                      </div>

                      {/* For MGMT and Console */}

                      <div className='d-flex flex-column ms-2'>
                         <div className='mb-1' style={{display:'flex', flexDirection:'column', width:'30px', height:'30px'}}>
                            <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>Console</span>
                            <img alt="" src={EthernetPort} style={{width:'22px', height:'22px', transform: 'rotate(180deg)'}} />
                          </div>

                          <div className='mt-1' style={{display:'flex', flexDirection:'column', width:'30px', height:'30px'}}>
                            <img alt="" src={EthernetPort} style={{width:'22px', height:'22px'}} />
                            <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>AUX</span>
                          </div>
                      </div>
                    </div>
              </div>        



        {/* Modal for Editing PON Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit PON {selectedPON} Details</Modal.Title>
              
        </Modal.Header>
        
        
          <form>
            <div className="mb-3">
              <label className="form-label">Connected To</label>
              <select onChange={(e) => {
                const selectedfms = e.target.value;
                setPONDetails({ ...ponDetails, connectedTo: selectedfms });

                const setSelectedFMS = arrayfms.find(fms => fms.fmsname === selectedfms);
                if (setSelectedFMS) {
                  setFmsMaxRange(parseInt(setSelectedFMS.fmsrange));
                  alert(setSelectedFMS.fmsrange);
                  setFmsKey(setSelectedFMS.devicekey);
                }else{
                  setFmsMaxRange(0);
                  setFmsKey(undefined);
                }
              }} className='form-select'>
                <option value=''>Choose...</option>
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
            <div className="mb-3">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                value={ponDetails.connectedPort}
                onChange={(e) => setPONDetails({ ...ponDetails, connectedPort: e.target.value })}
              />
            </div>
            <Button variant="primary" onClick={savePONDetails}>
              Save Details
            </Button>
          </form>
       
      </Modal>

      {/* Modal for Editing SFP Details */}
      <Modal show={showModal2} onHide={() => setShowModal2(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit SFP {selectedSFP} Details</Modal.Title>
              
        </Modal.Header>
        
        
          <form>
            <div className="mb-3">
              <label className="form-label">Connected To</label>
              <select onChange={(e) => {
                const selectedDevice = e.target.value;
                setSFPDetails({ ...sfpDetails, connectedTo: selectedDevice });

                const setSelectedFMS = arrayfms.find(fms => fms.fmsname === selectedDevice);
                if (setSelectedFMS) {
                  setFmsMaxRange(parseInt(setSelectedFMS.fmsrange));
                  setFmsKey(setSelectedFMS.devicekey);
                }else{
                  setFmsMaxRange(0);
                  setFmsKey(undefined);
                }
              }} className='form-select'>
                <option value=''>Choose...</option>
                {
                  
                  arrayfms+arrayolt+arrayswitch.length > 0 ? (
                    arrayfms+arrayolt+arrayswitch.map(({ fmsname, serialNo, swisp, manufacturer, oltType }, index) => (
                      <option key={index} value={fmsname}>{`${fmsname} : ${serialNo} : ${swisp} : ${manufacturer} : ${oltType}` }</option>
                    ))
                  ) : (
                    <option>Please Add FMS</option>
                  )
                }
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Connected Port</label>
              <input
                type="number"
                className="form-control"
                value={ponDetails.connectedPort}
                onChange={(e) => setSFPDetails({ ...sfpDetails, connectedPort: e.target.value })}
              />
            </div>
            <Button variant="primary" onClick={savePONDetails}>
              Save Details
            </Button>
          </form>
       
      </Modal>
    </>
  )
}

export default SYOLT
