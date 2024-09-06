import React, { useEffect, useState } from 'react'
import '../Modal.css'





const RenewalModal = ({show, planName, planAmount, isp, modalShow, handleActivation, handleAmount, handleRemarks, handleexpiry, handleMin, savePlan}) => {
    
    
    if(!show) return null;
    return(
       <div className='modal-overlay'>
        <div className='modal-content d-flex flex-column'>
        <h5>Renew Customer Plan</h5>
            <div className='d-flex flex-row bg-success rounded'>
                <div className='m-2 d-flex flex-column col-md-5'>
                    <span className='ms-2 text-white'>
                        Current Plan
                    </span>
                    <input defaultValue={planName} className='form-control' readOnly></input>
                </div>

                <div className='m-2 d-flex flex-column col-md-4'>
                    <span className='ms-2 text-white'>Plan Amount</span>
                    <input defaultValue={planAmount} className='form-control' readOnly></input>
                </div>

                <div className='m-2 d-flex flex-column col-md-2'>
                    <span className='ms-2 text-white'>Current ISP</span>
                    <input defaultValue={isp} className='form-control' readOnly></input>
                </div>

                
            </div>

            <div className='d-flex flex-column'>
                <form className='row g-3 mb-4 mt-2'>
                    <div className='col-md-3'>
                        <label className='form-label'>Custom Charges</label>
                        <input onChange={handleAmount} defaultValue={planAmount} className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label'>Activation Date</label>
                        <input min={handleMin} onChange={handleActivation} type='date' className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label'>Expiry Date</label>
                        <input defaultValue={handleexpiry} type='date' className='form-control'></input>
                    </div>

                    <div className='col-md-9'>
                        <label className='form-label'>Remarks</label>
                        <input onChange={handleRemarks} className='form-control'></input>
                    </div>

                </form>
            </div>

            <div className='d-flex flex-row'>
            <button style={{flex:'1'}} onClick={savePlan} className='btn btn-outline-info'>Save</button>
            <button onClick={modalShow} style={{flex:'1'}} className='btn btn-outline-secondary ms-2'>Cancel</button>
            </div>
            
            

        </div>
        
       </div> 
    );
};


export default  RenewalModal;