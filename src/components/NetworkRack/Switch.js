import React from 'react'
import EthernetPort from './drawables/ethernet.png'

const Switch = ({ethernet, show, sfps}) =>  {
    const ETHERNET_RANGE = ethernet;
    const SFP_RANGE = sfps;

    const lowerRowPorts = Array.from({ length: Math.ceil(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 1); // 1, 3, 5...
    const upperRowPorts = Array.from({ length: Math.floor(ETHERNET_RANGE / 2) }).map((_, index) => 2 * index + 2); // 2, 4, 6...

  return (
    <div style={{display:'flex', flexDirection:'column', width:'max-content', border:'1px solid black', height:'max-content', padding:'10px', borderRadius:'15px', marginTop:'35px', backgroundColor:'gray', boxShadow:'0 0 10px gray'}}>
        <div style={{display:'flex', flexDirection:'row', width:'850px', height:'92px', border:'1px solid black', paddingBottom:'5px', alignItems:'center', backgroundColor:'whitesmoke', borderRadius:'5px'}}>
 

            {/* Ethernet Ports */}
            <div style={{display:'flex', flexDirection:'column', marginLeft:'8px', flex:'1'}}>
                

                <div className='d-flex flex-row mb-1'>
                    {upperRowPorts.map((portNumber, index) => (
                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                         GE {portNumber}
                        </span>
                        <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px', transform:'rotate(180deg)' }} />
                                      
                    </div>
                    ))}
                </div>

                <div className='d-flex flex-row mt-1'>
                    {lowerRowPorts.map((portNumber, index) => (
                    <div key={index} style={{ width: '30px', height: '30px', display: 'flex', flexDirection: 'column' }}>
                        <img alt="" src={EthernetPort} style={{ width: '22px', height: '22px' }} />
                        <span style={{ fontSize: '8px', width: '22px', textAlign: 'center', fontFamily: 'initial' }}>
                        GE {portNumber}
                        </span>
                    </div>
                    ))}
                </div>  
            </div>


                {/* For SFP Ports */}
                <div style={{display:'flex', flexDirection:'row', marginRight:'15px'}}>
                <div style={{display:'flex', flexDirection:'row', marginLeft:'5px', marginTop:'2px'}}>
                {Array.from({ length: SFP_RANGE }).map((_, index) => (
                    <div key={index} style={{ width: '40px', height: '40px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{width:'32px', height:'32px', backgroundColor:'black', borderRadius:'3px'}}></div>
                        <span style={{ fontSize: '9px', width: '32px', textAlign: 'center', fontFamily: 'initial', color:'black' }}>
                        GE {index + 1}
                        </span>
                    </div>
                    ))}
                </div>    
                </div>


                <div className='d-flex flex-column me-2'>
                <span style={{fontSize:'12px'}}>Company Name</span>
                <span style={{fontSize:'12px'}}>Serial No.</span>
                <span style={{fontSize:'12px'}}>Model</span>
            </div>
            </div>


            



      
    </div>
  )
}

export default Switch
