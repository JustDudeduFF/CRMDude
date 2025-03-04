import { ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { api, db } from '../../FirebaseConfig';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

export default function AddInventory() {
  const username = localStorage.getItem('susbsUserid');

  const navigate =  useNavigate();
  const [arraymaker, setArrayMaker] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [arrayserial, setArraySerial] = useState([]);
  const [filterArray, setFilterArray] = useState([]);
  const [dueAmount, setDueAmount] = useState(0);
  const [currentDevice, setCurrentDevice] = useState(true);


  const [deviceInfo, setDeviceInfo] = useState({
    serial:'',
    mac:'',
    category:'',
    maker:'',
    amount:0,
    remarks:'',
    date:''
  })


  // Fetch makers on component mount
  useEffect(() => {
    const fetchMaker = async() => {
      const response = await axios.get(api+`/inventory/free`);
      const subsResponse = await axios.get(api+`/subscriber/${username}?data=wholeuser`);


      if(response.status !== 200 && subsResponse.status !== 200){
        console.log('can not get api data');
        return;
      }
      
      const data = response.data;
      if(data){
        setArraySerial(data);

        const category = [...new Set(data.map((sn) => sn.devicecategry))];
        const maker = [...new Set(data.map((sn) => sn.makername))];

        setArrayMaker(maker);
        setArrayCategory(category);
      }

      const subsData = subsResponse.data;
      if(subsData){
        setDueAmount(subsData.due);
        if(subsData.serialNumber !== 'N/A'){
          toast.error('Remove Activated Device', {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
      }

      setCurrentDevice(false);

    }

    fetchMaker();
  }, []);

  const saveDevices = async() => {

    console.log(deviceInfo);

    if(deviceInfo.serial === '' || deviceInfo.mac === '' || deviceInfo.category === '' || deviceInfo.maker === ''){
      toast.error('Fill All Details!', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });

      return;
    }

    const oneKey = Date.now();

    const inventrydata = {
      devicename: `${deviceInfo.maker} ${deviceInfo.category}`,
      date: new Date().toISOString().split('T')[0],
      deviceSerialNumber : deviceInfo.serial,
      macaddress: deviceInfo.mac,
      remarks: deviceInfo.remarks,
      amount: parseInt(deviceInfo.amount),
      status: 'Activated',
      modifiedby: localStorage.getItem('contact'),
      ledgerkey: oneKey
    }

    const ledgerData = {
      creditamount:'',
      date:'',
      debitamount:'',
      particular:'',
      type:''
    }

    const newDue = {
      dueAmount:inventrydata.amount + parseInt(dueAmount)
    }

    const status = {
      status:username
    }

    

    try{
      await update(ref(db, `Subscriber/${username}/Inventory/${oneKey}`), inventrydata);
      await update(ref(db, `Inventory/${inventrydata.macaddress}`), status);
      toast.success('Device Added', {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

      if(inventrydata.amount === 0) return;

      
      await update(ref(db, `Subscriber/${username}/ledger/${oneKey}`), ledgerData);
      await update(ref(db, `Subscriber/${username}/connectionDetails/dueAmount`), newDue);

      toast.success('Device Added', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
      
      
    }catch(e){
      console.log(e);
    }
  }


  useEffect(() => {
    let array = arrayserial;


    if(deviceInfo.category !== 'All'){
      array = array.filter((data) => data.devicecategry === deviceInfo.category)
    }

    if(deviceInfo.maker !== 'All'){
      array = array.filter((data) => data.makername === deviceInfo.maker);
    }

    setFilterArray(array)


    
  }, [deviceInfo.maker, deviceInfo.category]);




  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
    <ToastContainer/>
      <div
        style={{
          flex: '1',
          margin: '20px',
          border: '1px solid yellow',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px yellow',
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label htmlFor="productCode" className="form-label">
              Product Code
            </label>
            <input
              type="text"
              className="form-control"
              id="productCode"
              value="Auto"
              readOnly
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="addDate" className="form-label">
              Product Add Date
            </label>
            <input
              className="form-control"
              type="date"
              id="addDate"
              onChange={(e) => setDeviceInfo({
                ...deviceInfo,
                date:e.target.value
              })}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <input
              type="number"
              className="form-control"
              id="amount"
              onChange={(e) => setDeviceInfo({
                ...deviceInfo, 
                amount:e.target.value
              })}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">
              Product Maker
            </label>
            <select
              className="form-select"
              onChange={(e) => setDeviceInfo({
                ...deviceInfo,
                maker:e.target.value
              })}
            >
              <option value="All">
                Choose...
              </option>
              {arraymaker.length > 0 ? (
                arraymaker.map((maker, index) => (
                  <option key={index} value={maker}>
                    {maker}
                  </option>
                ))
              ) : (
                <option value="">No Maker Available</option>
              )}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Product Category
            </label>
            <select onChange={(e) => setDeviceInfo({
              ...deviceInfo, 
              category:e.target.value
            })} className="form-select">
              <option value="All" >
                Choose...
              </option>
              {arraycategory.length > 0 ? (
                arraycategory.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="">No Category Available</option>
              )}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Search Serial No or MAC Address</label>
            <input
              onChange={(e) => {
                const selectedDevice = filterArray.find(
                  (data) => data.macno === e.target.value || data.serialno === e.target.value
                );
                setDeviceInfo({
                  ...deviceInfo,
                  serial: selectedDevice ? selectedDevice.serialno : e.target.value,
                  mac: selectedDevice ? selectedDevice.macno : "",
                });
              }}
              className="form-control"
              list="data"
              type="text"
              placeholder="Enter Serial No or MAC Address"
            />
            <datalist id="data">
              {filterArray.map((data, index) => (
                <option key={index} value={data.serialno}>
                  {data.serialno} : {data.macno}
                </option>
              ))}
              {filterArray.map((data, index) => (
                <option key={`mac-${index}`} value={data.macno}>
                  {data.macno} : {data.serialno}
                </option>
              ))}
            </datalist>
          </div>



          <div className="col-md-6">
            <label htmlFor="remarks" className="form-label">
              Remarks
            </label>
            <input
              type="text"
              className="form-control"
              id="remarks"
              onChange={(e) => setDeviceInfo({
                ...deviceInfo, 
                remarks:e.target.value
              })}
            />
          </div>

          <div className="col-8">
            <button onClick={saveDevices} type="button" className="btn btn-outline-success" disabled={currentDevice}>
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
