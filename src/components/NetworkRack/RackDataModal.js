import { ref, set } from 'firebase/database';
import React, { useState } from 'react';
import { db } from '../../FirebaseConfig';


export default function RackDataModal({ show, officename, closeModal, count }) {
  

  const [device, setDevice] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [oltType, setOltType] = useState('');
  const [ponRange, setPonRange] = useState('');
  const [sfpRange, setSfpRange] = useState('');
  const [ethernetRange, setEthernetRange] = useState('');


  const [isethernet, setIsEthernet] = useState(false);
  const [swethernetrange, setSWEthernetRange] = useState(0);
  const [swsfpsrange, setSWSfpsRange] = useState(0);
  const [swmanufacture, setSWManufacture] = useState('');
  const [swisp, setSWIsp] = useState('');


  const [fmsname, setFMSName] = useState('');
  const [fmsrange, setFMSRange] = useState(0);


  



  


  // Save OLT function
  const saveOLT = async (e) => {
    e.preventDefault();

    

    

    // Construct Rack data
    const OLTData = {
      device,
      serialNo,
      manufacturer,
      oltType,
      ponRange,
      sfpRange,
      ethernetRange,
      deviceKey:count
    };


    const SwitchData = {
      device,
      serialNo,
      swmanufacture,
      swisp,
      swethernetrange,
      swsfpsrange,
      deviceKey:count
    }


    const FMSData = {
      serialNo,
      device,
      fmsname,
      fmsrange,
      deviceKey:count

    }



    // Firebase reference
    const newRef = ref(db, `Rack Info/${officename}/${count}`);

    // Save data to Firebase
    try {
      if (device === 'OLT') {
        await set(newRef, OLTData);
        alert('OLT Added');
        closeModal();
      }else if (device === 'Switch') {
        await set(newRef, SwitchData);
        alert('Switch Added');
        closeModal();
      }else if (device === 'FMS') {
        await set(newRef, FMSData);
        alert('FMS Added');
        closeModal();
      }
       // Close modal on success
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };



  if (!show) return null;

  return (
    <div className='modal-background'>
      <div className='modal-data'>
        <div className='d-flex'>
          <h4 style={{ flex: '1' }}>Add Device</h4>
          <button onClick={closeModal} className='btn-close'></button>
        </div>

        <form className='row g-3' onSubmit={saveOLT}>
          <div className='col-md-6'>
            <label className='form-label'>Select Device</label>
            <select
              className='form-select'
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              required
            >
              <option value=''>Choose...</option>
              <option value='OLT'>OLT</option>
              <option value='Switch'>Switch</option>
              <option value='FMS'>FMS</option>
            </select>
          </div>

          <div className='col-md-6'>
            <label className='form-label'>Device Serial No.</label>
            <input
              className='form-control'
              type='text'
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              required
            />
          </div>

          {/* OLT specific fields */}
          {device === 'OLT' && (
            <>
              <div className='col-md-6'>
                <label className='form-label'>Manufacture Name</label>
                <input
                  className='form-control'
                  type='text'
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label'>OLT Type</label>
                <select
                  className='form-select'
                  value={oltType}
                  onChange={(e) => setOltType(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='EPON'>EPON</option>
                  <option value='GPON'>GPON</option>
                </select>
              </div>

              <div className='col-md-6'>
                <label className='form-label'>PON Range</label>
                <select
                  className='form-select'
                  value={ponRange}
                  onChange={(e) => setPonRange(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='4'>1-4</option>
                  <option value='8'>1-8</option>
                  <option value='16'>0-15</option>
                </select>
              </div>

              <div className='col-md-6'>
                <label className='form-label'>Uplink SFP Range</label>
                <select
                  className='form-select'
                  value={sfpRange}
                  onChange={(e) => setSfpRange(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='4'>1-4</option>
                  <option value='8'>1-8</option>
                </select>
              </div>

              <div className='col-md-6'>
                <label className='form-label'>Uplink Ethernet Range</label>
                <select
                  className='form-select'
                  value={ethernetRange}
                  onChange={(e) => setEthernetRange(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='4'>1-4</option>
                  <option value='8'>1-8</option>
                </select>
              </div>

              <div className='col-md-12'>
                <button type='submit' className='btn btn-outline-success'>
                  Add Device
                </button>
              </div>
            </>
          )}



          {device === 'Switch' && (
            <>
              <div className='col-md-6'>
                <label className='form-label'>Manufacture Name</label>
                <input
                  className='form-control'
                  type='text'
                  value={swmanufacture}
                  onChange={(e) => setSWManufacture(e.target.value)}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label'>ISP Name</label>
                <input
                  className='form-control'
                  type='text'
                  value={swisp}
                  onChange={(e) => setSWIsp(e.target.value)}
                  required
                />
              </div>

              <div className='col-md-6'>
                <label className='form-label'>have Ethernet Ports?</label>
                <select
                  className='form-select'
                  value={isethernet}
                  onChange={(e) => setIsEthernet(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value={true}>Yes</option>
                  <option value=''>No</option>
                </select>
              </div>

              {
                isethernet && (
                  <div className='col-md-6'>
                    <label className='form-label'>Ethernet Range</label>
                    <select
                      className='form-select'
                      value={swethernetrange}
                      onChange={(e) => setSWEthernetRange(e.target.value)}
                      required
                    >
                      <option value=''>Choose...</option>
                      <option value='8'>1-8</option>
                      <option value='16'>1-16</option>
                      <option value='32'>1-32</option>
                    </select>
                  </div>
                )
              }

              <div className='col-md-6'>
                <label className='form-label'>SFP Range</label>
                <select
                  className='form-select'
                  value={swsfpsrange}
                  onChange={(e) => setSWSfpsRange(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='4'>1-4</option>
                  <option value='8'>1-8</option>
                </select>
              </div>


              <div className='col-md-8'>
                <button type='submit' className='btn btn-outline-success'>
                  Add OLT
                </button>
              </div>
            </>
          )}


          {device === 'FMS' && (
            <>
              <div className='col-md-6'>
                <label className='form-label'>FMS Name</label>
                <input
                  className='form-control'
                  type='text'
                  value={fmsname}
                  onChange={(e) => setFMSName(e.target.value)}
                  required
                />
              </div>

              

              

              

              <div className='col-md-6'>
                <label className='form-label'>Ports Range</label>
                <select
                  className='form-select'
                  value={fmsrange}
                  onChange={(e) => setFMSRange(e.target.value)}
                  required
                >
                  <option value=''>Choose...</option>
                  <option value='12'>1-12</option>
                  <option value='24'>1-24</option>
                  <option value='48'>1-48</option>
                </select>
              </div>


              <div className='col-md-8'>
                <button type='submit' className='btn btn-outline-success'>
                  Add OLT
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
