import Lottie from 'lottie-react'
import React from 'react'
import LocationAnimation from './drawables/locationanimation.json'

export default function SubscriberPersonal() {
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
        <div style={{ flex:'1', display:'flex', flexDirection:'row', padding:'8px'}}>
            <div style={{display:'flex', flexDirection:'column'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Address and Contact Info</h6>
            <h5 style={{fontWeight:'bold'}}>Installation Address</h5>
            <p style={{width:'250px', color:'blue'}}>1/4649/151-A, Street No.6, Budh Bazar, New Modern Shahdara, Delhi-110032</p>


            <h5 style={{fontWeight:'bold'}}>Mobile No.</h5>
            <p style={{color:'blue'}}>+91 9718201907</p>
            <p style={{color:'blue'}}>+91 7982905751</p>


            <h5 style={{fontWeight:'bold'}}>Email Address</h5>
            <p style={{color:'blue'}}>authebaba.yt@gmail.com</p>

            
            
            </div>

            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Connection Installation Location</h6>
            <div style={{width:'200px'}}>
                <Lottie animationData={LocationAnimation}/>
                <button style={{marginLeft:'40px'}} className='btn btn-outline-info'>Open Location</button>
            

            </div>
            
            </div>

            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Connection Connectivity Info</h6>
            <text>Connected OLT :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Secureye</text><br></br>
            <text>Connected FMS :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Secureye</text><br></br>
            <text>Connected FMS Port :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Secureye</text><br></br>
            <text>Connected JC Box :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>JC Box No.</text><br></br>
            <text>Optical Info :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Secureye</text><br></br>


            </div>


            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Device Info</h6>
            <text>Device Maker :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Huawei</text><br></br>
            <text>Device MAC Addresss :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Huawei</text><br></br>
            <text>Device Serial No. :- </text>             <text style={{color:'blue', marginLeft:'10px'}}>Huawei</text><br></br>
            


            </div>
            
            

            
        </div>

        <div style={{flex:'1'}} >

        </div>

    </div>
  )
}
