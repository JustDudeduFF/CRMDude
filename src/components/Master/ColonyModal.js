import { get, ref, set, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const ColonyModal = ({show, notshow}) => {

    const [colonyname, setColonyName] = useState('');
    const [undercompany, setUnderCompany] = useState('');
    const [arraycompany, setArrayCompany] = useState([]);
    

        
        const capitalizeFirstLetter = (str) => {
          return str.replace(/\b\w/g, (char) => char.toUpperCase())
        }

        useEffect(() => {
            const officeRef = ref(db, `Master/companys`);
                

            const unsubscribeOffice = onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                    const CompanyeArray = [];
                    officeSnap.forEach((ChildOffice) => {
                    const officename = ChildOffice.key;
                    CompanyeArray.push(officename);
                    });
                    setArrayCompany(CompanyeArray);
                    
            } else {
                toast.error('Please Add an Office Location', {
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    });
            }
            });

                return () => unsubscribeOffice();
        }, [])
        

    const Colonydata = {
        colonyname: colonyname,
        undercompany: undercompany,
       
    }

    const handleClick = async () => {
        const colonyRef = ref(db, `Master/Colonys/${colonyname}`);
        const colonySnap = await get(colonyRef);

        if(colonySnap.exists()){
            toast.error('Colony Already Exists!', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }else{
            await set(colonyRef, Colonydata);
            toast.success('Colony Added Succesfully!', {
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
                    <h5 style={{flex:'1'}}>Add Colony</h5>
                    

                </div>

                <form className="row g-3"> 
                    <div className="col-md-3">
                        <label className="form-label">Colony Name</label>
                        <input onChange={(e) => {
                            setColonyName(capitalizeFirstLetter(e.target.value));
                        }} type="text" className="form-control" ></input>
                    </div>

                    <div className="col-md-9">
                        <label className="form-label">Under Company</label>
                        <select onChange={(e) => setUnderCompany(e.target.value)} className='form-select'>
                        {arraycompany.length > 0 ? (
                        arraycompany.map((company, index) => (
                            <option key={index} value={company}>
                            {company}
                            </option>
                        ))
                        ) : (
                        <option value="">No Colony Available</option>
                        )}
                        </select>
                    </div>

                    
                    

                    
                </form>

                <div className="d-flex flex-row">
                <button onClick={handleClick} style={{flex:'1'}} className="btn btn-outline-success mt-4">Add Colony</button>
                <button onClick={notshow} style={{flex:'1'}} className="btn btn-outline-secondary ms-3 mt-4">Cancel</button>
                </div>
                
            </div>
            <ToastContainer className='mt-5'/>
        </div>
    );
};

export default ColonyModal;