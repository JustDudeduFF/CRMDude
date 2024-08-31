import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const MakerModal = ({show, notshow}) => {

    const [dMakername, setdMakerName] = useState('');
    const [dMakeraddress, setdMakerAddress] = useState('');
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const dMakerdata = {
        dMakername: dMakername,
        dMakeraddress: dMakeraddress,
       
    }

    const handleClick = async () => {
        const dMakerRef = ref(db, `Master/dMakers/${dMakername}`);
        const dMakerSnap = await get(dMakerRef);

        if(dMakerSnap.exists()){
            toast.error('Maker Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(dMakerRef, dMakerdata);
            toast.success('Maker Added Succesfully!', {
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
                    <h5 style={{flex:'1'}}>Add Device Maker Name</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">Company Name</label>
                        <input onChange={(e) => {
                            setdMakerName(capitalizeFirstLetter(e.target.value));
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-9">
                        <label className="form-label">Maker Company Address</label>
                        <input onChange={(e) => setdMakerAddress(e.target.value)} type="text" className="form-control" ></input>
                    </div>

                    
                    

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add Maker Company</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default MakerModal;