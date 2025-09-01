import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const OfficeModal = ({show, notshow}) => {
const partnerId = localStorage.getItem('partnerId');
    const [officename, setOfficeName] = useState('');
    const [officeaddress, setOfficeAddress] = useState('');
    const [officelat, setOfficeLat] = useState('');
    const [officelong, setOfficeLong] = useState('');

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const handleClick = async () => {
    const data = {
        name: officename,
        address: officeaddress,
        lat: officelat,
        long: officelong
    }

    try{
        const response = await axios.post(api2 + "/master/offices?partnerId="+partnerId, data);

        if(response !== 200) return toast.error('Failed to add Offices', {autoClose:2000});

        notshow(true);

    }catch(e){
        console.log(e)
    }


    };

    if(!show) return null;

    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="d-flex flex-row">
                    <h5 style={{flex:'1'}}>Add Office Location</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">Office Name</label>
                        <input onChange={(e) => {
                            setOfficeName(capitalizeFirstLetter(e.target.value));
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-9">
                        <label className="form-label">Office Address</label>
                        <input onChange={(e) => setOfficeAddress(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Location Latitude</label>
                        <input onChange={(e) => setOfficeLat(e.target.value)} type="number" className="form-control" ></input>
                    </div>

                    <div className="col-md-3">
                        <label className="form-label">Location Longitude</label>
                        <input onChange={(e) => setOfficeLong(e.target.value)} type="number" className="form-control" ></input>
                    </div>

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add Offcie</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default OfficeModal;