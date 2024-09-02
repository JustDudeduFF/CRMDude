import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const FMSModal = ({show, notshow}) => {
    const [fmscode, setfmscode] = useState('');
    const [fmsname, setfmsName] = useState('');
    const [fmsport, setfmsport] = useState('');
    const [fmscolor, setfmscolor] = useState('');
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const fmsdata = {
        fmscode: fmscode,
        fmsname: fmsname,
        fmsport: fmsport,
        fmscolor: fmscolor
        

       
    }

    const handleClick = async () => {
        const fmsRef = ref(db, `Master/FMS/${fmsname}`);
        const fmsSnap = await get(fmsRef);

        if(fmsSnap.exists()){
            toast.error('fms Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(fmsRef, fmsdata);
            toast.success('fms Added Succesfully!', {
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
                    <h5 style={{flex:'1'}}>Add FMS</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">FMS Code</label>
                        <input onChange={(e) => {
                            setfmscode(e.target.value);
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-5">
                        <label className="form-label">FMS Name</label>
                        <input onChange={(e) => setfmsName(capitalizeFirstLetter(e.target.value))} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">FMS No. of Ports</label>
                        
                            
                            <input onChange={(e) => setfmsport(e.target.value)} className="form-control"></input>

                        
                    </div>

                    <div className="col-md-8">
                        <label className="form-label">FMS Color</label>
                        <input onChange={(e) => setfmscolor(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add fms</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default FMSModal;