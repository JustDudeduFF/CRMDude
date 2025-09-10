import React, { useCallback, useEffect, useState } from 'react';
import RouterImg from './inventrydrawables/technology.png';
import AddInventryData from './AddInventryData';
import { ToastContainer, toast } from 'react-toastify';
import { db } from '../../FirebaseConfig';
import { get, ref, set } from 'firebase/database';
import axios from 'axios';

export default function InventryDash() {
  const [showModal, setShowModal] = useState(false);
  const [devicetype, setDeviceType] = useState('New Stock');
  const [makername, setMakerName] = useState('');
  const [mac, setMac] = useState('');
  const [serial, setSerial] = useState('');
  const [companyname, setCompanyName] = useState('');

  const [backgroundF, setBackgroundF] = useState('green');
  const [backgroundD, setBackgroundD] = useState('');
  const [backgroundR, setBackgroundR] = useState('');

  const [deviceArray, setDeviceArray] = useState([]);
  const [category, setCategory] = useState([]);
  const [maker, setMaker] = useState([]);
  const [company, setCompany] = useState([]);

  const [filter, setFilter] = useState({
    search:'All',
    category:'All', 
    maker:'All', 
    company:'All'
  });

  const [filterArray, seyFilterArray] = useState([]);
  const [devicecategry, setDeviceCategry] = useState('');





  useEffect(() => {
    

  }, []);

  const getDevices = (type) => {
    setDeviceType(type);


    if (type === 'free') {
      setBackgroundF('green');
      setBackgroundD('');
      setBackgroundR('');
    } else if (type === 'damaged') {  
      setBackgroundF('');
      setBackgroundD('red');
      setBackgroundR('');
    } else if(type === 'repair') {
      setBackgroundF('');
      setBackgroundD('');
      setBackgroundR('yellow');
    }
  };


  

  const AddInventry = async () => {

    if(serial === '' || mac === '' || makername === '' || devicecategry === '' || companyname === '' || devicetype === ''){
      toast.error('Select Criteria', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
      return;
    }

    const inventryData = {
      serialno: serial,
      macno: mac,
      makername: makername,
      devicecategry: devicecategry,
      company: companyname,
      date:new Date().toISOString().split('T')[0],
      status: devicetype
    };
    const inventryRef = ref(db, `Inventory/${mac}`);
    try {
      await set(inventryRef, inventryData);
      toast.success('Device Added!', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      toast.error('Error adding device: ' + error.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  useEffect(() => {
    let array = deviceArray;

    if(filter.category !== 'All'){
      array = array.filter((data) => data.devicecategry === filter.category);
    }

    if(filter.maker !== 'All'){
      array = array.filter((data) => data.makername === filter.maker);
    }

    if(filter.company !== 'All'){
      array = array.filter((data) => data.company === filter.company);
    }

    if(filter.search !== 'All'){
      array = array.filter((data) => (data.serialno).includes(filter.search));
    }


    seyFilterArray(array);
    

  }, [filter, deviceArray]);


  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4.5%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', margin: '10px' }}>
        <div style={{ flex: '1', display:'flex' }}>
          <h4>Inventory Details</h4>
          <span className='ms-auto me-auto fw-bold'>{`Selected Query Device Quantity: ${filterArray.length}`}</span>
          <button onClick={() => setShowModal(true)} className='btn btn-outline-primary ms-auto me-2'>Add Devices</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: '1.1', marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={() => getDevices('free')}
            style={{ display: 'flex', flexDirection: 'row', border: `1px solid ${backgroundF}`, borderRadius: '5px', boxShadow: `0 0 8px ${backgroundF}`, cursor: 'pointer' }}
          >
            <div>
              <img alt='' style={{ width: '50px', height: '50px', margin: '5px' }} src={RouterImg}></img>
            </div>
            <div className='ms-2 mt-1' style={{ display: 'flex', flexDirection: 'column' }}>
              <label className='fw-bold'>Free Device</label>
              <label>Quantity of Device</label>
            </div>
          </div>

          <div
            onClick={() => getDevices('damaged')}
            style={{ display: 'flex', flexDirection: 'row', border: `1px solid ${backgroundD}`, borderRadius: '5px', boxShadow: `0 0 8px ${backgroundD}`, marginTop: '20px', cursor: 'pointer' }}
          >
            <div>
              <img alt='' style={{ width: '50px', height: '50px', margin: '5px' }} src={RouterImg}></img>
            </div>
            <div className='ms-2 mt-1' style={{ display: 'flex', flexDirection: 'column' }}>
              <label className='fw-bold'>Damaged Device</label>
              <label>Quantity of Device</label>
            </div>
          </div>

          <div
            onClick={() => getDevices('repair')}
            style={{ display: 'flex', flexDirection: 'row', border: `1px solid ${backgroundR}`, borderRadius: '5px', boxShadow: `0 0 8px ${backgroundR}`, marginTop: '20px', cursor: 'pointer' }}
          >
            <div>
              <img alt='' style={{ width: '50px', height: '50px', margin: '5px' }} src={RouterImg}></img>
            </div>
            <div className='ms-2 mt-1' style={{ display: 'flex', flexDirection: 'column' }}>
              <label className='fw-bold'>Repairing Device</label>
              <label>Quantity of Device</label>
            </div>
          </div>
        </div>

        <div style={{flex:'8'}}>
          <div className='container d-flex'>
            <div className='col-md-2 me-2'>
              <label className='form-label'>Search Serial No.</label>
              <input onChange={(e) => {
                setFilter({
                  ...filter, 
                  search:e.target.value
                })
              }} className='form-control' type='text' placeholder='e.g. GPONxxxx'></input>
            </div>

            <div className='col-md-2 me-2'>
              <label className='form-label'>Device Category</label>
              <select onChange={((e) => {
                setFilter({
                  ...filter,
                  category:e.target.value
                })
              })} className='form-select'>
                <option value='All'>All</option>
                {
                  category.map((data, index) => (
                    <option key={index} value={data}>{data}</option>
                  ))
                }
              </select>
            </div>

            <div className='col-md-2 me-2'>
              <label className='form-label'>Device Maker</label>
              <select onChange={(e) => {
                setFilter({
                  ...filter,
                  maker:e.target.value
                })
              }} className='form-select'>
                <option value='All'>All</option>
                {
                  maker.map((data, index) => (
                    <option key={index} value={data}>{data}</option>
                  ))
                }
              </select>
            </div>

            <div className='col-md-2 me-2'>
              <label className='form-label'>Company</label>
              <select onChange={(e) => {
                setFilter({
                  ...filter, 
                  company:e.target.value
                })
              }} className='form-select'>
                <option value='All'>All</option>
                {
                  company.map((data, index) => (
                    <option key={index} value={data}>{data}</option>
                  ))
                }
              </select>
            </div>

          </div>

          <table className='table table-striped table-hover align-middle ms-2 mt-2'>
            <thead className='table-secondary'>
              <tr>
                <th>S No.</th>
                <th>Add Date</th>
                <th>Device Maker</th>
                <th>Device Type</th>
                <th>Serial No.</th>
                <th>MAC Address</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {
                filterArray.map((data, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{new Date(data.date).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:"2-digit"})}</td>
                    <td>{data.makername}</td>
                    <td>{data.devicecategry}</td>
                    <td>{data.serialno}</td>
                    <td>{data.macno}</td>
                    <td>{data.company}</td>
                    <td>{data.status}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>

        </div>
      </div>
      <ToastContainer />
      <AddInventryData
        devicetype={(e) => setDeviceCategry(e.target.value)}
        show={showModal}
        makerName={(event) => setMakerName(event.target.value)}
        DeviceSerial={(event) => setSerial(event.target.value)}
        DeviceMac={(event) => setMac(event.target.value)}
        TypeDevice={(event) => setDeviceType(event.target.value)}
        AddDevice={AddInventry}
        modalshow={() => setShowModal(false)}
        company={(e) => setCompanyName(e.target.value)}
      />
    </div>
  );
}
