import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const CompanynModal = ({show, notshow}) => {
    const [companycode, setcompanycode] = useState('');
    const [companyname, setcompanyName] = useState('');
    const [companyaddress, setcompanyaddress] = useState('');
    const [companygmail, setcompanygmail] = useState('');
    const [companymobile, setcompanymobile] = useState('');
    const [companycity, setcompanycity] = useState('');
    const [companypincode, setcompanypincode] = useState('');
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const companydata = {
        companycode: companycode,
        companyname: companyname,
        companyaddress: companyaddress,
        companygmail: companygmail,
        companymobile: companymobile,
        companycity: companycity,
        companypincode: companypincode

       
    }

    const handleClick = async () => {
        const companyRef = ref(db, `Master/companys/${companyname}`);
        const companySnap = await get(companyRef);

        if(companySnap.exists()){
            toast.error('company Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(companyRef, companydata);
            toast.success('company Added Succesfully!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            })
        }

    };

    if(!show) return null;

    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="d-flex flex-row">
                    <h5 style={{flex:'1'}}>Add company</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">Company Code</label>
                        <input onChange={(e) => {
                            setcompanycode(e.target.value);
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label">Company Name</label>
                        <input onChange={(e) => setcompanyName(capitalizeFirstLetter(e.target.value))} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Company Mobile</label>
                        <div className="input-group">
                            <span className='input-group-text'>
                                +91
                            </span>
                            <input onChange={(e) => setcompanymobile(e.target.value)} className="form-control"></input>

                        </div>
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">Company Address</label>
                        <input onChange={(e) => setcompanyaddress(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Company Gmail</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                @

                            </span>
                            <input onChange={(e) => setcompanygmail(e.target.value)} type="text" className="form-control" ></input>

                        </div>
                        
                    </div>
                    
                    <div className="col-md-4">
                        <label className="form-label">City</label>
                        <input onChange={(e) => setcompanycity(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Pincode</label>
                        <input onChange={(e) => setcompanypincode(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">From</label>
                        <input type='date' className="form-control"></input>

                    </div>

                    
                    

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add company</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default CompanynModal;