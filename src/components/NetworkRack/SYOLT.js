import React from 'react'
import PONPort from './drawables/port.png'
import EthernetPort from './drawables/ethernet.png'

const SYOLT =({pons, sfps, ethernet, show}) => {
    const PON_RANGE = pons; // Set PON range dynamically
    const SFP_RANGE = sfps; // Set SFP range dynamically
    const ETHERNET_RANGE = ethernet;
    const isTwoRows = ETHERNET_RANGE > 7; // Determines if two rows are needed
    const lowerRowPorts = Array.from({ length: Math.ceil(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 1); // 1, 3, 5...
    const upperRowPorts = Array.from({ length: Math.floor(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 2); // 2, 4, 6...

    if (!show) return null



  return (
    <div style={{display:'flex', flexDirection:'column', width:'max-content', border:'1px solid black', height:'max-content', padding:'10px', borderRadius:'15px', marginTop:'35px', backgroundColor:'orange', boxShadow:'0 0 10px gray'}}>
        <div style={{display:'flex', flexDirection:'row', width:'850px', height:'92px', border:'1px solid black', paddingBottom:'5px', alignItems:'center', backgroundColor:'whitesmoke', borderRadius:'5px'}}>

                    <div className='d-flex flex-column ms-1'>
                      <span style={{fontSize:'12px'}}>Company Name</span>
                      <span style={{fontSize:'12px'}}>Serial No.</span>
                      <span style={{fontSize:'12px'}}>Model</span>
                    </div>

                    {/* PONs Layout */}
                    <div style={{display:'flex', flexDirection:'row', marginLeft:'8px', flex:'1'}}>
                    <div style={{display:'flex', flexDirection:'row', marginLeft:'5px', marginTop:'2px'}}>
                    {Array.from({ length: PON_RANGE }).map((_, index) => (
                        <div key={index} style={{width:'30px', height:'30px', display:'flex', flexDirection:'column', marginLeft:'5px', marginTop:'2px'}}>
                          <img alt="" src={PONPort} style={{width:'22px', height:'22px'}} />
                          <span style={{fontSize:'8px', width:'22px', textAlign:'center', fontFamily:'initial'}}>{index + 1}</span>
                        </div>
                      ))}
                    </div>


                    
                    </div>
                    

                      {/* For SFP SLOT */}
                      <div style={{display:'flex', flexDirection:'row', marginLeft:'10px', flex:'1'}}>
                      {Array.from({ length: SFP_RANGE }).map((_, index) => (
                       <div key={index} style={{ width: '40px', height: '40px', display: 'flex', flexDirection: 'column' }}>
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
  )
}

export default SYOLT
