import { get, ref, set } from "firebase/database";
import React, { useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const DesignationModal = ({show, notshow}) => {

    const [designationname, setdesignationName] = useState('');
    const [designationapermission, setdesignationaPermission] = useState('');
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }
        

    const designationdata = {
        designationname: designationname,
        designationapermission: designationapermission,
       
    }

    const handleClick = async () => {
        const designationRef = ref(db, `Master/Designations/${designationname}`);
        const designationSnap = await get(designationRef);

        if(designationSnap.exists()){
            toast.error('Designation Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(designationRef, designationdata);
            toast.success('Designation Added Succesfully!', {
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
                    <h5 style={{flex:'1'}}>Add Designation</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">Designation Name</label>
                        <input onChange={(e) => {
                            setdesignationName(capitalizeFirstLetter(e.target.value));
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-9">
                        <label className="form-label">Defalut Permissions 1</label>
                        <select className="form-select" onChange={(e) => setdesignationName(e.target.value)}>
                            <option value=''>Choose...</option>
                            <option value='read'>Read Subscriber Data</option>
                            <option value='write'>Write Subscriber Data</option>
                            <option value='modify'>Modify Subscriber Details</option>
                            <option value='backentries'>Allow BackDate Entries</option>
                            <option value='changeplan'>Allow Change Subscriber Plan</option>
                            <option value='rollback'>Allow Rollback Plan</option>
                            <option value='authorizaton'>Allow Authorize Receipts</option>
                            <option value='master'>Allow Master Data</option>
                            <option value='rack'>Allow Access Server Rack</option>

                        </select>
                    </div>

                    
                    

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add Designation</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default DesignationModal;