import React, { useState } from 'react'
import '../Modal.css'
import { db } from '../../FirebaseConfig';
import { get, ref, set } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';



const PlanModal = ({show, onClose}) => {
    const [planperiod, setPlanPeriod] = useState('Months');
    const [plancode, setPlanCode] = useState('');
    const [planname, setPlanName] = useState('');
    const [periodtime, setPeriodTime] = useState('');
    const [planamount, setPlanAmount] = useState('');
    const [planSpeed, setPlanSpeed] = useState('');
    

    const planRef = ref(db, `Master/Broadband Plan/${plancode}`);

    const plandata = {
        planname: planname,
        planperiod: planperiod,
        periodtime: periodtime,
        planamount: planamount,
        bandwidth: planSpeed
    }

    

    const addPlan = async () => {
        try{
            const planSnap = await get(planRef);

        if(planSnap.exists()){
            toast.error('Plan Code Already Exists', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
            
        }else{
            set(planRef, plandata);
            toast.success('Plan Added SuccesFully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            })
        }
        }catch(error){
            console.log(error);
        }


        
    }

    



    
    if(!show) return null;

    
    

    return(
       <div className='modal-overlay'>
        <div className='modal-content'>
            <div className='d-flex flex-row'>
            <h5 style={{flex:'1'}}>Create New Plan</h5>
            <button onClick={onClose} className='btn-close'></button>
            </div>
            
            <form className='row g-3'>
                <div className='col-md-3'>
                    <label className='form-label'>Plan Code</label>
                    <input className='form-control' onChange={(event) => setPlanCode(event.target.value)}></input>

                </div>

                <div className='col-md-6'>
                    <label className='form-label'>Plan Name</label>
                    <input className='form-control' onChange={(event) => setPlanName(event.target.value)}></input>
                </div>

                <div className='col-md-3'>
                    <label className='form-label'>Plan Speed/Bandwidth</label>
                    <input type='number' className='form-control' onChange={(event) => setPlanSpeed(event.target.value)}></input>
                </div>

                <div className='col-md-3'>
                    <label className='form-label'>Plan Period</label>
                    <select onChange={(event) => setPlanPeriod(event.target.value)} className='form-select'>
                        <option>Months</option>
                        <option>Days</option>
                        <option>Years</option>
                    </select>

                </div>

                <div className='col-md-3'>
                    <label className='form-label'>Time Period</label>
                    <input className='form-control' onChange={(event) => setPeriodTime(event.target.value)} placeholder={planperiod}></input>

                </div>

                <div className='col-md-3'>
                    <label className='form-label'>Plan Amount</label>
                    <input className='form-control' onChange={(event) => setPlanAmount(event.target.value)}></input>

                </div>

                

                

            </form>

            <button onClick={addPlan} className='btn btn-success mt-3'>Create</button>
    
        </div>
        <ToastContainer className='mt-5'/>
       </div>
    );
};

export default PlanModal;
