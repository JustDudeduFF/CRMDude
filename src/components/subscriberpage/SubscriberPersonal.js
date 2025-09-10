import Lottie from 'lottie-react'
import React, {useState, useEffect} from 'react'
import LocationAnimation from './drawables/locationanimation.json'
import {  api2, db } from '../../FirebaseConfig';
import { ref, get } from 'firebase/database';
import axios from 'axios';
import './SubscriberPersonal.css';

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
  


  useEffect(() => {
      const fetchsubsdata = async () => {
        try{
          const response = await axios.get(`${api2}/subscriber/?id=${username}`);

          if(response.status !== 200) return console.log("Error fetching subscriber data");

          const data = response.data;
          if(data){
            setColonyName(data.colonyName);
            setEmail(data.email);
            setInstallationAddress(data.installationAddress);
            setMobileNo(data.mobile);
            setAlternateNo(data.alternate);
          }

        }catch(e){
          console.log(e);
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
        <div className="subscriber-personal-section">
            <div className="subscriber-personal-info">
            <h6 className="subscriber-personal-title">Address and Contact Info</h6>
            <h5 className="subscriber-personal-label">Installation Address</h5>
            <p className="subscriber-personal-value address">{installationAddress}</p>

            <h6 className="subscriber-personal-label">Colony Name</h6>
            <p className="subscriber-personal-value">{colonyName || 'N/A'}</p>
            

            <h5 className="subscriber-personal-label">Mobile No.</h5>
            <p className="subscriber-personal-value">{`+91 ${mobileNo || 'N/A'}`}</p>
            <p className="subscriber-personal-value">{`+91 ${alternateNo || 'N/A'}`}</p>


            <h5 className="subscriber-personal-label">Email Address</h5>
            <p className="subscriber-personal-value">{email || 'N/A'}</p>

            
            
            </div>

            <div className="subscriber-personal-info">
            <div className="subscriber-personal-info">
            <h6 className="subscriber-personal-title">Connection Installation Location</h6>
            <div className="subscriber-personal-animation-container">
                <Lottie style={{width:'250px', height:'250px'}} animationData={LocationAnimation}/>
                <button className='btn btn-outline-info' style={{marginLeft:'40px'}}>Open Location</button>
            </div>
            
            </div>
            </div>

            <div className="subscriber-personal-info">
            <h6 className="subscriber-personal-title">Connection Connectivity Info</h6>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Connected OLT</div>
                <div className={`subscriber-personal-field-value ${!connectedOlt ? 'empty' : ''}`}>{connectedOlt || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Connected FMS</div>
                <div className={`subscriber-personal-field-value ${!connectedFMS ? 'empty' : ''}`}>{connectedFMS || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Connected FMS Port</div>
                <div className={`subscriber-personal-field-value ${!connectedPortNo ? 'empty' : ''}`}>{connectedPortNo || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Connected JC Box</div>
                <div className={`subscriber-personal-field-value ${!uniqueJCNo ? 'empty' : ''}`}>{uniqueJCNo || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Optical Info</div>
                <div className={`subscriber-personal-field-value ${!connectionPowerInfo ? 'empty' : ''}`}>{connectionPowerInfo || 'N/A'}</div>
            </div>
            </div>

            <div className="subscriber-personal-info">
            <h6 className="subscriber-personal-title">Device Info</h6>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Device Maker</div>
                <div className={`subscriber-personal-field-value ${!deviceMaker ? 'empty' : ''}`}>{deviceMaker || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Device MAC Address</div>
                <div className={`subscriber-personal-field-value ${!deviceSerialNumber ? 'empty' : ''}`}>{deviceSerialNumber || 'N/A'}</div>
            </div>
            <div className="subscriber-personal-field">
                <div className="subscriber-personal-field-label">Device Serial No.</div>
                <div className={`subscriber-personal-field-value ${!deviceSerialNumber ? 'empty' : ''}`}>{deviceSerialNumber || 'N/A'}</div>
            </div>
            </div>
            
        </div>
  )
}
