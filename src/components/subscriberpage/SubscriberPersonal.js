import Lottie from 'lottie-react'
import React, { useState, useEffect } from 'react'
import LocationAnimation from './drawables/locationanimation.json'
import { API } from '../../FirebaseConfig';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaServer, FaMicrochip, FaNetworkWired } from 'react-icons/fa';

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
      try {
        const response = await API.get(`/subscriber/?id=${username}`);
        if (response.status !== 200) return console.log("Error fetching subscriber data");
        const data = response.data;
        if (data) {
          setColonyName(data.colonyName);
          setEmail(data.email);
          setInstallationAddress(data.installationAddress);
          setMobileNo(data.mobile);
          setAlternateNo(data.alternate);
        }
      } catch (e) {
        console.log(e);
      }
    }

    const fetchConnectivityInfo = async () => {
      try {
        const response = await API.get(`/subscriber/connectivityinfo/${username}`);
        if (response.status !== 200) return console.log("Error fetching connectivity info");
        const data = response.data;
        if (data) {
          setConnectedFMS(data.connectedFMS);
          setConnectedPortNo(data.connectedPortNo);
          setUniqueJCNo(data.uniqueJCNo);
          setConnectedOlt(data.connectedOlt);
          setConnectionPowerInfo(data.connectionPowerInfo);
        }
      } catch (e) {
        console.log(e);
      }
    }

    // const fetchDeviceInfo = async () => {
    //   try {
    //     const response = await API.get(`/subscriber/deviceinfo/${username}`);
    //     if (response.status !== 200) return console.log("Error fetching device info");
    //     const data = response.data;
    //     if (data) {
    //       setDeviceMaker(data.deviceMaker);
    //       setDeviceSerialNumber(data.deviceSerialNumber);
    //     }
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }

    // fetchDeviceInfo();

    fetchConnectivityInfo();
    fetchsubsdata();
  }, [username]);

  return (
    <div className="personal-info-grid">
      {/* SECTION 1: ADDRESS & CONTACT */}
      <div className="info-card shadow-sm">
        <div className="card-header-accent">
          <FaMapMarkerAlt className="me-2" /> Address & Contact
        </div>
        <div className="card-content">
          <label className="info-label">INSTALLATION ADDRESS</label>
          <p className="address-text">{installationAddress || 'No address provided'}</p>
          
          <div className="divider"></div>
          
          <label className="info-label">COLONY / AREA</label>
          <p className="value-text">{colonyName || 'N/A'}</p>

          <label className="info-label mt-3">CONTACT NUMBERS</label>
          <div className="d-flex align-items-center mb-1">
            <FaPhoneAlt size={12} className="text-primary me-2" />
            <p className="value-text mb-0">+91 {mobileNo || 'N/A'}</p>
          </div>
          {alternateNo && (
            <div className="d-flex align-items-center">
              <FaPhoneAlt size={12} className="text-muted me-2" />
              <p className="value-text mb-0">+91 {alternateNo}</p>
            </div>
          )}

          <label className="info-label mt-3">EMAIL ADDRESS</label>
          <div className="d-flex align-items-center">
            <FaEnvelope size={12} className="text-primary me-2" />
            <p className="value-text mb-0">{email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CONNECTIVITY INFRASTRUCTURE */}
      <div className="info-card shadow-sm">
        <div className="card-header-accent">
          <FaNetworkWired className="me-2" /> Network Connectivity
        </div>
        <div className="card-content">
          <div className="connectivity-stack">
            <div className="stack-item">
              <span className="dot"></span>
              <div className="stack-body">
                <small>OLT DEVICE</small>
                <h6>{connectedOlt || 'Not Assigned'}</h6>
              </div>
            </div>
            <div className="stack-item">
              <span className="dot"></span>
              <div className="stack-body">
                <small>FMS NAME / PORT</small>
                <h6>{connectedFMS ? `${connectedFMS} (Port: ${connectedPortNo})` : 'N/A'}</h6>
              </div>
            </div>
            <div className="stack-item">
              <span className="dot"></span>
              <div className="stack-body">
                <small>JC BOX NUMBER</small>
                <h6>{uniqueJCNo || 'N/A'}</h6>
              </div>
            </div>
            <div className="stack-item">
              <span className="dot last"></span>
              <div className="stack-body">
                <small>OPTICAL POWER (RX/TX)</small>
                <h6 className="text-info">{connectionPowerInfo || 'Unknown'}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DEVICE INFO */}
      <div className="info-card shadow-sm">
        <div className="card-header-accent">
          <FaMicrochip className="me-2" /> Hardware Details
        </div>
        <div className="card-content">
          <div className="device-row">
            <label className="info-label">MANUFACTURER</label>
            <p className="value-text fw-bold text-dark">{deviceMaker || 'N/A'}</p>
          </div>
          <div className="device-row mt-3">
            <label className="info-label">SERIAL NUMBER (S/N)</label>
            <code className="sn-badge">{deviceSerialNumber || 'N/A'}</code>
          </div>
          <div className="device-row mt-3">
            <label className="info-label">MAC ADDRESS</label>
            <code className="sn-badge">{deviceSerialNumber || 'N/A'}</code>
          </div>
        </div>
      </div>

      {/* SECTION 4: LOCATION VISUAL */}
      <div className="info-card shadow-sm text-center">
        <div className="card-header-accent text-start">
          <FaServer className="me-2" /> Live Location
        </div>
        <div className="card-content d-flex flex-column align-items-center">
          <div className="lottie-wrapper">
            <Lottie animationData={LocationAnimation} />
          </div>
          <button className="btn-modern-outline mt-2">
            View on Google Maps
          </button>
        </div>
      </div>

      

      <style>{`
        .personal-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          padding: 10px;
        }

        .info-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #eef2f6;
          transition: transform 0.2s;
        }

        .info-card:hover {
          transform: translateY(-5px);
        }

        .card-header-accent {
          background: #f8fafc;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #475569;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-content {
          padding: 20px;
        }

        .info-label {
          display: block;
          font-size: 0.65rem;
          font-weight: 800;
          color: #94a3b8;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .address-text {
          font-size: 0.9rem;
          color: #334155;
          line-height: 1.5;
          font-weight: 500;
        }

        .value-text {
          font-size: 0.9rem;
          color: #1e293b;
          font-weight: 600;
        }

        .divider {
          height: 1px;
          background: #f1f5f9;
          margin: 15px 0;
        }

        /* Connectivity Stack Styles */
        .connectivity-stack {
          position: relative;
          padding-left: 10px;
        }

        .stack-item {
          display: flex;
          position: relative;
          padding-bottom: 20px;
          border-left: 2px solid #e2e8f0;
          padding-left: 20px;
        }

        .stack-item:last-child {
          padding-bottom: 0;
          border-left-color: transparent;
        }

        .dot {
          position: absolute;
          left: -7px;
          top: 0;
          width: 12px;
          height: 12px;
          background: #667eea;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px #e2e8f0;
        }

        .dot.last {
          background: #0ea5e9;
        }

        .stack-body small {
          display: block;
          font-size: 0.6rem;
          color: #94a3b8;
          font-weight: 700;
        }

        .stack-body h6 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .sn-badge {
          display: inline-block;
          background: #f1f5f9;
          color: #475569;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-family: 'Monaco', monospace;
        }

        .lottie-wrapper {
          width: 180px;
          height: 180px;
        }

        .btn-modern-outline {
          border: 2px solid #667eea;
          background: transparent;
          color: #667eea;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 10px;
          font-size: 0.8rem;
          transition: 0.2s;
        }

        .btn-modern-outline:hover {
          background: #667eea;
          color: white;
        }

        @media (max-width: 768px) {
          .personal-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}