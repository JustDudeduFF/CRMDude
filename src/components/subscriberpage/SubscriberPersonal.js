import Lottie from 'lottie-react'
import React, {useState, useEffect} from 'react'
import LocationAnimation from './drawables/locationanimation.json'
import { db } from '../../FirebaseConfig';
import { ref, get } from 'firebase/database';

export default function SubscriberPersonal(props) {

  const {userid} = props;
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [installationAddress, setInstallationAddress] = useState("");
  const [colonyName, setColonyName] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

    // Inventory & Device Details
  const [deviceMaker, setDeviceMaker] = useState("");
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("");
  const [connectionPowerInfo, setConnectionPowerInfo] = useState("");

    // Field & Fiber Details
  const [connectedFMS, setConnectedFMS] = useState("");
  const [connectedPortNo, setConnectedPortNo] = useState("");
  const [uniqueJCNo, setUniqueJCNo] = useState("");
  const [fiberCoreNo, setFiberCoreNo] = useState("");
  
  const userRef = ref(db, `Subscriber/${userid}`);
  useEffect(() => {
      const fetchsubsdata = async () => {
          const userSnap = await get(userRef);
          if(userSnap.exists()){
              setColonyName(userSnap.val().colonyName);
              setEmail(userSnap.val().email);
              setState(userSnap.val().state);
              setPinCode(userSnap.val().pinCode);
              setDeviceMaker(userSnap.val().deviceMaker);
              setInstallationAddress(userSnap.val().installationAddress);
              setConnectedFMS(userSnap.val().connectedFMS);
              setConnectedPortNo(userSnap.val().connectedPortNo);
              setFiberCoreNo(userSnap.val().fiberCoreNo);
              setUniqueJCNo(userSnap.val().uniqueJCNo);
              setConnectionPowerInfo(userSnap.val().connectionPowerInfo);
              setDeviceSerialNumber(userSnap.val().deviceSerialNumber);
              setMobileNo(userSnap.val().mobileNo);

          }
      }

      fetchsubsdata();

  }, [userid]);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
        <div style={{ flex:'1', display:'flex', flexDirection:'row', padding:'8px'}}>
            <div style={{display:'flex', flexDirection:'column'}}>
            <h6 style={{borderBottom:'1px solid gray', width:'max-contant'}}>Address and Contact Info</h6>
            <h5 style={{fontWeight:'bold'}}>Installation Address</h5>
            <p style={{width:'250px', color:'blue'}}>{installationAddress}</p>


            <h5 style={{fontWeight:'bold'}}>Mobile No.</h5>
            <p style={{color:'blue'}}>{mobileNo}</p>
            <p style={{color:'blue'}}>+91 7982905751</p>


            <h5 style={{fontWeight:'bold'}}>Email Address</h5>
            <p style={{color:'blue'}}>{email}</p>

            
            
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
            <span>Connected OLT :- </span>             <span style={{color:'blue', marginLeft:'10px'}}>{connectionPowerInfo}</span><br></br>
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
