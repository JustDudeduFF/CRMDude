import React, { useEffect, useState } from 'react'
import RouterImg from './inventrydrawables/technology.png'
import AddInventryData from './AddInventryData'
import {ToastContainer, toast } from 'react-toastify';
import { db } from '../../FirebaseConfig';
import { get, ref, set } from 'firebase/database';

export default function InventryDash() {

    const [showModal, setShowModal] = useState(false);
    const [devicetype, setDeviceType] = useState('');
    const [makername, setMakerName] = useState('');
    const [mac, setMac] = useState('');
    const [serial, setSerial] = useState('');

    const [getmakers, setGetMakers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const refInventry = ref(db, 'Inventory');
            const snaprefInventry = await get(refInventry);

            if (snaprefInventry.exists()) {
                const Makers = [];
                
                snaprefInventry.forEach(childSnapshot => {
                    Makers.push(childSnapshot.key);
                });

                setGetMakers(Makers);

                const listmaker = document.getElementById('makerlist');
                const limaker = document.createElement('li');
                listmaker.append(limaker);
                limaker.append(getmakers);

                
            }else{
                console.log('Data Not Found')
            }
        };

        fetchData();
    }, []);
    
    

    const inventryData = {
        serialno: serial,
        macno: mac,
        makername: makername
    }


    const AddInventry = async () => {
        const inventryRef = ref(db, `Inventory/${devicetype}/${makername}/${mac}`);
        try{
            await set(inventryRef, inventryData);
            toast.success('Device Added!', {
                autoClose:2000, 
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,

            })
            setShowModal(false);
        }catch(error){
            toast.error(error, {
                autoClose:2000, 
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            });
            setShowModal(false);
        }
        

    }

    
  return (
    <div style={{display:'flex', flexDirection:'column', marginTop:'4.5%'}}>
        <div style={{display:'flex', flexDirection:'row', margin:'10px'}}>
            <div style={{flex:'1'}}>
                <h4>Inventory Details</h4>
            </div>
            <button onClick={() => setShowModal(true)} className='btn btn-outline-primary me-2'>Add Device</button>
            <label className='form-label me-2 mt-2'>Select Company :-</label>
            <div className='col-md-2' style={{float:'right'}}>
                <select className='form-select'>
                    <option>Choose...</option>
                </select>
            </div>
        </div>

        <div style={{display:'flex', flexDirection:'row'}}>
            <div style={{flex:'1.1', marginLeft:'10px', display:'flex', flexDirection:'column'}}>
                <div style={{display:'flex', flexDirection:'row', border:'1px solid green', borderRadius:'5px', boxShadow:'0 0 8px green'}}>
                    <div>
                        <img alt='' style={{width:'50px', height:'50px', margin:'5px'}} src={RouterImg}></img>
                    </div>
                    <div className='ms-2 mt-1' style={{display:'flex', flexDirection:'column'}}>
                        <label className='fw-bold'>Free Device</label>
                        <label>Quantity of Device</label>
                    </div>
                </div>

                <div style={{display:'flex', flexDirection:'row', border:'1px solid red', borderRadius:'5px', boxShadow:'0 0 8px red', marginTop:'20px'}}>
                    <div>
                        <img alt='' style={{width:'50px', height:'50px', margin:'5px'}} src={RouterImg}></img>
                    </div>
                    <div className='ms-2 mt-1' style={{display:'flex', flexDirection:'column'}}>
                        <label className='fw-bold'>Damaged Device</label>
                        <label>Quantity of Device</label>
                    </div>
                </div>

                <div style={{display:'flex', flexDirection:'row', border:'1px solid yellow', borderRadius:'5px', boxShadow:'0 0 8px yellow',  marginTop:'20px'}}>
                    <div>
                        <img alt='' style={{width:'50px', height:'50px', margin:'5px'}} src={RouterImg}></img>
                    </div>
                    <div className='ms-2 mt-1' style={{display:'flex', flexDirection:'column'}}>
                        <label className='fw-bold'>Reparing Device</label>
                        <label>Quantity of Device</label>
                    </div>
                </div>
            </div>


            <div className='d-flex flex-column' style={{flex:'3'}}>
                <div className='ms-3'>
                    <input className='form-control' type='search' aria-label='search' placeholder='Enter Device Maker name'></input>
                </div>
                    <ol id='makerlist' className="list-group list-group ms-5 mt-3">
                        
                    </ol>
            </div>

            <div className='d-flex flex-column' style={{flex:'4'}}>
            <div className='col ms-3 me-3'>
                    <input className='form-control' type='search' aria-label='search' placeholder='Enter Device Serial No.'></input>
                </div>

                <ul className="list-group me-3">
                <li className="list-group-item">
                    <input className="form-check-input me-1" type="checkbox" value="" id="firstCheckbox"></input>
                    <label className="form-check-label" htmlFor="firstCheckbox">First checkbox</label>
                </li>
                <li className="list-group-item">
                    <input className="form-check-input me-1" type="checkbox" value="" id="secondCheckbox"></input>
                    <label className="form-check-label" htmlFor="secondCheckbox">Device Serial No.</label>
                </li>
                <li className="list-group-item">
                    <input className="form-check-input me-1" type="checkbox" value="" id="thirdCheckbox"></input>
                    <label className="form-check-label" htmlFor="thirdCheckbox">Third checkbox</label>
                </li>
                </ul>
            </div>
        </div>
        <ToastContainer/>
        <AddInventryData show={showModal} makerName={(event) => setMakerName(event.target.value)} DeviceSerial={(event) => setSerial(event.target.value)} DeviceMac={(event) => setMac(event.target.value)} TypeDevice={(event) => setDeviceType(event.target.value)} AddDevice={AddInventry}/>
    </div>

  )
}

