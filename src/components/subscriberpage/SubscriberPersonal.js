import Lottie from 'lottie-react'
import React, {useState, useEffect} from 'react'
import LocationAnimation from './drawables/locationanimation.json'
import { db } from '../../FirebaseConfig';
import { ref, get } from 'firebase/database';

export default function SubscriberPersonal() {
  const username = localStorage.getItem('susbsUserid')
  const jcNumber = "0_25_2_1735305031195";
  const [mobileNo, setMobileNo] = useState("");
  const [alternateNo, setAlternateNo] = useState('');
  const [email, setEmail] = useState("");
  const [installationAddress, setInstallationAddress] = useState("");
  const [colonyName, setColonyName] = useState("");

    // Inventory & Device Details
  const [deviceMaker, setDeviceMaker] = useState("");
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("");
  const [connectionPowerInfo, setConnectionPowerInfo] = useState("");

    // Field & Fiber Details
  const [connectedFMS, setConnectedFMS] = useState("");
  const [connectedPortNo, setConnectedPortNo] = useState("");
  const [uniqueJCNo, setUniqueJCNo] = useState("");
  const [connectedOlt, setConnectedOlt] = useState("");
  
  const userRef = ref(db, `Subscriber/${username}`);
  const fieldRef = ref(db, `Subscriber/${username}/fieldFiberDetails`);
  const inventRef = ref(db, `Subscriber/${username}/inventoryDeviceDetails`)
  useEffect(() => {
      const fetchsubsdata = async () => {
          const userSnap = await get(userRef);
          if(userSnap.exists()){
              setColonyName(userSnap.val().colonyName);
              setEmail(userSnap.val().email);
              setInstallationAddress(userSnap.val().installationAddress);
              setMobileNo(userSnap.val().mobileNo);
              setAlternateNo(userSnap.val().alternatNo);

          }


      }

      const fetchConnectivityInfo = async () => {
        const jcNumberBreak = jcNumber.split("_");
        const FMSnameRef = ref(db, `Rack Info/Sigma Shahdara/${jcNumberBreak[0]}`);
        const fmsSnap = await get(FMSnameRef);
        if(fmsSnap.exists()){
          const oltSno = fmsSnap.child("Ports").child(jcNumberBreak[1]).val()?.connectedTo;
          const oltNameRef = ref(db, `Rack Info/Sigma Shahdara/${oltSno}`);
          const oltSnap = await get(oltNameRef);
          if(oltSnap.exists()){
            setConnectedOlt(`${oltSnap.val().manufacturer}/${oltSnap.val().oltType}`);
            setConnectedFMS(fmsSnap.val().fmsname);
            setConnectedPortNo(jcNumberBreak[1]);
            setUniqueJCNo(jcNumber);
          }
        }
        
    }

      fetchConnectivityInfo();

      fetchsubsdata();

  }, [username]);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
        <div style={{ flex:'1', display:'flex', flexDirection:'row', padding:'8px'}}>
            <div style={{display:'flex', flexDirection:'column'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Address and Contact Info</h6>
            <h5 style={{fontWeight:'bold'}}>Installation Address</h5>
            <p style={{width:'250px', color:'blue'}}>{installationAddress}</p>

            <h6 style={{fontWeight:'bold'}}>Colony Name</h6>
            <p style={{color:'blue'}}>{colonyName}</p>
            

            <h5 style={{fontWeight:'bold'}}>Mobile No.</h5>
            <p style={{color:'blue'}}>{`+91 ${mobileNo}`}</p>
            <p style={{color:'blue'}}>{`+91 ${alternateNo || 'N/A'}`}</p>


            <h5 style={{fontWeight:'bold'}}>Email Address</h5>
            <p style={{color:'blue'}}>{email}</p>

            
            
            </div>

            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Connection Installation Location</h6>
            <div style={{width:'200px', zIndex:'-1'}}>
                <Lottie animationData={LocationAnimation}/>
                <button style={{marginLeft:'40px'}} className='btn btn-outline-info'>Open Location</button>
            

            </div>
            
            </div>

            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Connection Connectivity Info</h6>
            <span>Connected OLT :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{connectedOlt}</span><br></br>
            <span>Connected FMS :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{connectedFMS}</span><br></br>
            <span>Connected FMS Port :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{connectedPortNo}</span><br></br>
            <span>Connected JC Box :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{uniqueJCNo}</span><br></br>
            <span>Optical Info :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{connectionPowerInfo}</span><br></br>


            </div>


            <div style={{marginLeft:'20px', flex:'1'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Device Info</h6>
            <span>Device Maker :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{deviceMaker}</span><br></br>
            <span>Device MAC Addresss :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{deviceSerialNumber}</span><br></br>
            <span>Device Serial No. :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{deviceSerialNumber}</span><br></br>
            


            </div>
            
            

            
        </div>

        <div style={{flex:'1'}} >

        </div>

    </div>
  )
}
