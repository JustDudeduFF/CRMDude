import React from 'react'
import OpticalPort from './drawables/optical.png'

const FMS = ({fmsport, show}) => {
    const PORT_RANGE = fmsport;
    const isTwoRows = PORT_RANGE > 24; // Determines if two rows are needed
    

    if (!show) return null;

  return (
    <div style={{display:'flex', flexDirection:'column', width:'max-content', border:'1px solid black', height:'max-content', padding:'10px', borderRadius:'15px', marginTop:'35px', backgroundColor:'blue', boxShadow:'0 0 10px gray'}}>
        <div style={{display:'flex', flexDirection:'row', width:'850px', height:'92px', border:'1px solid black', paddingBottom:'5px', alignItems:'center', backgroundColor:'whitesmoke', borderRadius:'5px'}}>

            {/* FMS Optical Ports */}
            
            <div style={{ display: 'flex', flexDirection: 'row', flex: '1', justifyContent:'center' }}>
            {Array.from({ length: Math.min(PORT_RANGE, 24) }).map((_, upperIndex) => (
                <div key={upperIndex} className='d-flex flex-column'>
                {/* Upper Row */}
                <div className='d-flex flex-row mb-1'>
                    <div style={{ width: '35px', height: '35px', display: 'flex', flexDirection: 'column' }}>
                    <img alt="" src={OpticalPort} style={{ width: '27px', height: '27px' }} />
                    <span style={{ fontSize: '9px', width: '27px', textAlign: 'center', fontFamily: 'initial', color:'black', textSty:'bold' }}>
                        {upperIndex + 1}
                    </span>
                    </div>
                </div>

                {/* Lower Row, only if two rows are required */}
                {isTwoRows && upperIndex < Math.floor(PORT_RANGE / 2) && (
                    <div className='d-flex flex-row mt-1'>
                    <div style={{ width: '35px', height: '35px', display: 'flex', flexDirection: 'column' }}>
                        <img alt="" src={OpticalPort} style={{ width: '27px', height: '27px' }} />
                        <span style={{ fontSize: '9px', width: '27px', textAlign: 'center', fontFamily: 'initial', color:'black', fontStyle:'bold' }}>
                        {upperIndex + 25} {/* Index for lower row starts from 5 */}
                        </span>
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>

        </div>
    </div>
  )
}

export default FMS
