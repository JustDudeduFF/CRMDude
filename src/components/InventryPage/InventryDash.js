import React, { useCallback, useEffect, useState } from 'react';
import RouterImg from './inventrydrawables/technology.png';
import AddInventryData from './AddInventryData';
import { ToastContainer, toast } from 'react-toastify';
import { db } from '../../FirebaseConfig';
import { get, ref, set } from 'firebase/database';

export default function InventryDash() {
  const [showModal, setShowModal] = useState(false);
  const [devicetype, setDeviceType] = useState('New Stock');
  const [makername, setMakerName] = useState('');
  const [mac, setMac] = useState('');
  const [serial, setSerial] = useState('');

  const [backgroundF, setBackgroundF] = useState('green');
  const [backgroundD, setBackgroundD] = useState('');
  const [backgroundR, setBackgroundR] = useState('');

  const [getmakers, setGetMakers] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDevice, setSearchDevice] = useState('');
  const [searchcategory, setSearcCategory] = useState('');
  const [currentmaker, setCurrentMaker] = useState('');

  const [getdevice, setGetDevice] = useState([]);
  const [devicecategry, setDeviceCategry] = useState('');

  const [selectedindex, setSelectedIndex] = useState(null);
  const [indexcategory, setIndexCategory] = useState(null);


  const fetchData = useCallback(async () => {
    setGetMakers([]);
    setArrayCategory([]);
    setGetDevice([]);
    
    const deviceRef = ref(db, `Inventory/${devicetype}`);
    const deviceSnap = await get(deviceRef);

    if (deviceSnap.exists()) {
      const Makers = {};

      deviceSnap.forEach((childSnap) => {
        const makername = childSnap.key;
        const deviceCount = Object.keys(childSnap.val()).length;

        Makers[makername] = deviceCount;
      });

      const makerArray = Object.entries(Makers);
      setGetMakers(makerArray);
    } else {
      console.log('snap not found');
    }
  }, [devicetype]);

  useEffect(() => {
    
    fetchData();
  }, [fetchData]);

  const getDevices = (type) => {
    setDeviceType(type);
    setGetDevice([]);

    if (type === 'New Stock') {
      setBackgroundF('green');
      setBackgroundD('');
      setBackgroundR('');
    } else if (type === 'Damaged Devices') {
      setBackgroundF('');
      setBackgroundD('red');
      setBackgroundR('');
    } else {
      setBackgroundF('');
      setBackgroundD('');
      setBackgroundR('yellow');
    }
  };

  const fetchcategory = useCallback(async (maker) => {
    setArrayCategory([]);
    setGetDevice([]);
    const categoryRef = ref(db, `Inventory/${devicetype}/${maker}`);
    const categorySnap = await get(categoryRef);

    if(categorySnap.exists()){
      const Category = {};

      categorySnap.forEach((childSnap) => {
        const categoryname = childSnap.key;
        const deviceCount = Object.keys(childSnap.val()).length;

        Category[categoryname] = deviceCount;
      });

      const categoryArray = Object.entries(Category);
      setArrayCategory(categoryArray);
    }else{
      alert('No any Category');
    }
  })
  const fetchDevices = async (category) => {
    const DeviceRef = ref(db, `Inventory/${devicetype}/${currentmaker}/${category}`);
    const DeviceSnap = await get(DeviceRef);

    if (DeviceSnap.exists()) {
      const deviceList = [];

      DeviceSnap.forEach((childSnap) => {
        const mac = childSnap.key;
        const serial = childSnap.val().serialno;

        deviceList.push({ serial, mac });
      });

      
      setGetDevice(deviceList);
    } else {
      setGetDevice([]); // Clear device list if no devices found
      toast.error('No devices found for this maker.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const showDevices = (maker) => {
    fetchcategory(maker);
    
  };

  const inventryData = {
    serialno: serial,
    macno: mac,
    makername: makername,
    devicecategry: devicecategry
  };

  const AddInventry = async () => {
    const inventryRef = ref(db, `Inventory/${devicetype}/${makername}/${devicecategry}/${mac}`);
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
      // setShowModal(false);
    } catch (error) {
      toast.error('Error adding device: ' + error.message, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
      // setShowModal(false);
    }
  };

  const filteredMakers = getmakers.filter(([maker]) =>
    maker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDevice = getdevice.filter(({ serial }) =>
    serial.toLowerCase().includes(searchDevice.toLowerCase())
  
  );

  const filteredCategory = arraycategory.filter(( [category] ) =>
    category.toLowerCase().includes(searchcategory.toLowerCase())
  
  );
  return (
    
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4.5%' }}>
      <div style={{ display: 'flex', flexDirection: 'row', margin: '10px' }}>
        <div style={{ flex: '1' }}>
          <h4>Inventory Details</h4>
        </div>
        <button onClick={() => setShowModal(true)} className='btn btn-outline-primary me-2'>Add Device</button>
        <label className='form-label me-2 mt-2'>Select Company :-</label>
        <div className='col-md-2' style={{ float: 'right' }}>
          <select className='form-select'>
            <option>Choose...</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: '1.1', marginLeft: '10px', display: 'flex', flexDirection: 'column' }}>
          <div
            onClick={() => getDevices('New Stock')}
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
            onClick={() => getDevices('Damaged Devices')}
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
            onClick={() => getDevices('Device on Repair')}
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

        <div className='d-flex flex-column' style={{ flex: '2'}}>
          <div className='ms-3'>
            <input
              className='form-control'
              type='search'
              aria-label='search'
              placeholder='Enter Device Maker name'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ol className="list-group list-group ms-5 mt-3">
            {filteredMakers.map(([maker, count], index) => (
              <li onClick={() => {showDevices(maker); setCurrentMaker(maker); setSelectedIndex(index)}} key={index}>
                <div style={{boxShadow:selectedindex === index ? '0 0 10px blue' : '0 0 10px gray'}} className='col mt-2 border border-secondary rounded p-2 me-3'>
                  <label className='form-label'>{`Device Maker :- ${maker}`}</label><br></br>
                  <label className='form-label'>Category :- </label><span className="badge text-bg-secondary ms-2 mt-1">{count}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>


        <div className='d-flex flex-column' style={{ flex: '2'}}>
          <div className='ms-3'>
            <input
              className='form-control'
              type='search'
              aria-label='search'
              placeholder='Enter Device Category Name'
              value={searchcategory}
              onChange={(e) => setSearcCategory(e.target.value)}
            />
          </div>
          <ol className="list-group list-group ms-5 mt-3">
            {filteredCategory.map(([category, count], index) => (
              <li onClick={() => {fetchDevices(category); setIndexCategory(index)}} key={index}>
                <div style={{boxShadow: indexcategory === index ? '0 0 10px blue' : '0 0 10px gray'}} className='col mt-2 border border-secondary rounded p-2 me-3'>
                  <label className='form-label'>{`Device Category :- ${category}`}</label><br></br>
                  <label className='form-label'>Quantity :- </label><span className="badge text-bg-secondary ms-2 mt-1">{count}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        



        
        <div className='d-flex flex-column' style={{ flex: '3' }}>
          <div className='col ms-3 me-3'>
            <input
              className='form-control'
              type='search'
              aria-label='search'
              placeholder='Enter Device Serial'
              value={searchDevice}
              onChange={(e) => setSearchDevice(e.target.value)}
            />
          </div>
          <ol className="list-group list-group ms-5 mt-3">
            {filteredDevice.length > 0 ? (
              filteredDevice.map(({ serial, mac }, index) => (
                <li key={index}>
                  <div className='col mt-2 border border-secondary rounded p-2 me-3'>
                    <form className='row g-4'>
                      <div className='col'>
                      <label className='form-label'>Device Serial No.</label>
                      <input className='form-control' value={serial} readOnly></input>
                      </div>

                      <div className='col'>
                      <label className='form-label'>Device MAC No.</label>
                      <input className='form-control' value={mac} readOnly></input>
                      </div>

                    </form>
                    
                  </div>
                </li>
              ))
            ) : (
              <li className='col mt-2 border rounded p-2 me-3'>
                <label className='form-label'>No Devices Found</label>
              </li>
            )}
          </ol>
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
      />
    </div>
  );
}
