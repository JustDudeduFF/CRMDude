import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const RemarkFollowModal = ({show, notshow}) => {

    const [ticketname, setticketName] = useState('');
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const ticketdata = {
        ticketname: ticketname,
        date: new Date().toISOString().split('T')[0]
    }

    const handleClick = async () => {
        const ticketRef = ref(db, `Master/RMConcern/${ticketname}`);
        const ticketSnap = await get(ticketRef);

        if(ticketSnap.exists()){
            toast.error('Concern Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(ticketRef, ticketdata);
            toast.success('Concern Added Succesfully!', {
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
                    <h5 style={{flex:'1'}}>Add Remark or Follow Up Concern</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-5">
                        <label className="form-label">Concern Name</label>
                        <input onChange={(e) => {
                            setticketName(capitalizeFirstLetter(e.target.value));
                        }} type="text" className="form-control" ></input>
                    </div>

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add Concern</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default RemarkFollowModal;