import React, { useEffect, useState } from 'react';
import PlanModal from './PlanModal';
import { api, db } from '../../FirebaseConfig';
import { onValue, ref, update } from 'firebase/database';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';
import { Modal } from 'react-bootstrap';
import axios from 'axios';

export default function BroadBandPlans() {
    const [showplanmodal, setShowPlanModal] = useState(false);
    const [arrayplan, setArrayPlan] = useState([]);
    const planRef = ref(db, 'Master/Broadband Plan');
    const [showmodal, setShowModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const [planDetails, setPlanDetails] = useState({
        planname:'',
        planamount:'',
        provider:'',
        planperiod:'',
        periodtime:'',
        isp:'All',
        bandwidth:'',
        company:'',
        isWeb:false,
        isActive:true,
    });

    const [editPlan, SetEditPlan] = useState({
        plankey:'',
        planname:'',
        planamount:'',
        periodtype:'',
        periodtime:'',
        isActive:'',
        isWebShow:''
    });

    const [provider, setProvider] = useState([]);
    const [isps, setIsps] = useState([]);
    const [companys, setCompanys] = useState([]);
    const {hasPermission} = usePermissions();

    const saveplan = async() => {
        const planCode = planDetails.planamount+planDetails.planperiod+planDetails.periodtime+planDetails.bandwidth+Date.now();

        if(planDetails.planamount === '' || planDetails.periodtime === '' || planDetails.planname === '' || planDetails.bandwidth === ''){
            toast.error('Fill All Details', {
                autoClose:2000,
                hideProgressBar:false,
                closeOnClick:true,
                pauseOnHover:false,
                draggable:false,
                progress:undefined
            })
            return;
        }

        try{
            await update(ref(db, `Master/Broadband Plan/${planCode}`), planDetails);
            toast.success('Plan Added', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,});

        }catch(e){
            toast.error('Something went wrong!', {
                autoClose:2000,
                hideProgressBar:false,
                closeOnClick:true,
                pauseOnHover:false,
                draggable:false,
                progress:undefined
            })
            console.log(e);
        }
    }

    useEffect(() => {
        // const fetchPlans = onValue(planRef, (planSnap) => {
        //     if (planSnap.exists()) {
        //         const PlanArray = [];
        //         planSnap.forEach(childPlan => {
        //             const planname = childPlan.val().planname;
        //             const planamount = childPlan.val().planamount;
        //             const periodtime = childPlan.val().periodtime;
        //             const planperiod = childPlan.val().planperiod;
        //             const plancode = childPlan.key;
    
        //             PlanArray.push({ planname, planamount, periodtime, planperiod ,plancode });
                    
        //         });
        //         setArrayPlan(PlanArray);
                
        //     }else{
        //         toast.error('No Data Found!', {
        //             autoClose: 2000,
        //             hideProgressBar: false,
        //             closeOnClick: true,
        //             pauseOnHover: false,
        //             draggable: true,
        //             progress: undefined,
        //         });
        //     }
    
            
    
        // });

        const fetchData = async() => {
            try{
                const provResponse = await axios.get(api+'/master/Provider');
            const ispResponse = await axios.get(api+'/master/ISPs');
            const compResponse = await axios.get(api+'/master/companys');
            const planResponse = await axios.get(api+'/master/Broadband Plan');

            if(planResponse.status !== 200){
                toast.error('Failed To get Plans', {
                    autoClose:3000,
                    hideProgressBar:false,
                    closeOnClick:false,
                    pauseOnHover:false,
                    draggable:false,
                    progress:undefined
                });
            }

            const planData = planResponse.data;
            if(planData){
                const array = [];
                Object.keys(planData).forEach((key) => {
                    const plans = planData[key];
                    array.push({
                        key,
                        ...plans
                    });
                });
                console.log(array);
                setArrayPlan(array)
            }


            if(provResponse.status !== 200 || ispResponse.status !== 200 || compResponse.status !== 200){
                console.log('API Fetch Issue');
                return;
            }

            const provData = provResponse.data;
            if(provData){
                const array = [];
                Object.keys(provData).forEach((key) => {
                    const prov = provData[key];
                    array.push(prov);
                });
                setProvider(array);
            }

            const ispData = ispResponse.data;
            if(ispData){
                const array = [];
                Object.keys(ispData).forEach((key) => {
                    const isp = ispData[key];

                    array.push(isp);
                });
                setIsps(array);
            }

            const compData = compResponse.data;
            if(compData){
                const array = [];
                Object.keys(compData).forEach((key) => {
                    const comp = compData[key];
                    array.push(comp);

                });
                setCompanys(array);

            }

            }catch(e){
                console.log(e)
            }
        }


        fetchData();

    }, []);

    const handleDoubleClick = (data) => {
        setEditModal()
    }


    

    

    return (
        <div className='d-flex ms-3 flex-column'>
            <ToastContainer/>
            <div className='d-flex flex-row'>
                <h5 style={{ flex: '1' }}>Broadband Plan List</h5>
                <button onClick={() => hasPermission("ADD_PLAN") ? setShowModal(true) : alert("Permission Denied")} className='btn btn-outline-success justify-content-end mb-2'>
                    Create New Plan
                </button>
            </div>
            <PlanModal show={showplanmodal} onClose={() => setShowPlanModal(false)} />
            <table className="table">
                <thead className='table table-primary'>
                    <tr>
                        <th scope="col">S. No.</th>
                        <th scope="col">Plan Name</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Duration</th>
                        <th scope='col'>Provider Name</th>
                        <th scope='col'>ISP</th>
                        <th scope='col'>Company</th>
                        <th scope='col'>On WebShow</th>
                        <th scope='col'>Status</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    {arrayplan.map((data, index) => (
                        <tr onDoubleClick={handleDoubleClick} className={data.isActive !== true ? 'table-danger' : ''} key={index}>
                            <td>{index + 1}</td>
                            <td>{data.planname}</td>
                            <td>{data.planamount}</td>
                            <td>{`${data.periodtime} ${data.planperiod}`}</td>
                            <td>{data.provider}</td>
                            <td>{data.isp}</td>
                            <td>{data.company}</td>
                            <td>{data.isWeb === true ? 'Enabled' : 'Disabled'}</td>
                            <td>{data.isActive === true? 'Active' : 'InActive'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showmodal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>
                        Create New Plan
                    </Modal.Title>
                </Modal.Header>
                    <Modal.Body>
                        <div className='container'>
                            <div className='col-md mt-2'>
                                <label className='form-label'>Plan Name *</label>
                                <input onChange={(e) => setPlanDetails({
                                    ...planDetails,
                                    planname:e.target.value
                                })} className='form-control'></input>
                                
                            </div>

                            <div className='d-flex flex-row'>
                                <div className='col-md mt-2 me-2'>
                                    <label className='form-label'>Provider Name *</label>
                                    <select onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            provider:e.target.value
                                        })
                                    }} className='form-select'>
                                        <option value=''>Choose...</option>
                                        {
                                            provider.map((data, index) => (
                                                <option key={index}>{data.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className='col-md mt-2 ms-2'>
                                    <label className='form-label'>Plan Amount *</label>
                                    <input onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            planamount:e.target.value
                                        })
                                    }} className='form-control'></input>
                                </div>
                            </div>

                            <div className='d-flex flex-row'>
                                <div className='col-md mt-2 me-2'>
                                    <label className='form-label'>Period Type *</label>
                                    <select onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            planperiod:e.target.value
                                        })
                                    }} className='form-select'>
                                        <option value=''>Choose...</option>
                                        <option>Months</option>
                                        <option>Days</option>
                                        <option>Years</option>
                                    </select>
                                </div>

                                <div className='col-md mt-2 ms-2'>
                                    <label className='form-label'>Period Time *</label>
                                    <input onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            periodtime:e.target.value
                                        })
                                    }} className='form-control' type='number'></input>
                                </div>

                            </div>

                            <div className='d-flex flex-row'>
                                <div className='col-md mt-2 me-2'>
                                    <label className='form-label'>ISP *</label>
                                    <select onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            isp:e.target.value
                                        })
                                    }} className='form-select' disabled>
                                        <option value=''>Choose...</option>
                                        {
                                            isps.map((data, index) => (
                                                <option key={index}>{data.ispname}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className='col-md mt-2 ms-2'>
                                    <label className='form-label'>Bandwidth *</label>
                                    <input onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            bandwidth:e.target.value
                                        })
                                    }} className='form-control' type='number'></input>
                                </div>

                            </div>  

                            <div className='col-md mt-2'>
                                <label className='form-label'>Company Name *</label>
                                <select onChange={(e) => {
                                        setPlanDetails({
                                            ...planDetails,
                                            company:e.target.value
                                        })
                                    }} className='form-select'>
                                    <option value=''>Choose...</option>
                                    {
                                        companys.map((data, index) => (
                                            <option key={index}>{data.companyname}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            <div className='form-check from-check-inline col-md mt-2'>
                                <input onChange={(e) => setPlanDetails({
                                    ...planDetails,
                                    isWeb:e.target.checked
                                })}  checked={planDetails.isWeb} className='form-check-input' id='isOnline' type='checkbox'></input>
                                <label className='form-check-label' htmlFor='isOnline'>Is Website Show?</label>
                            </div>

                            <div className='form-check from-check-inline col-md mt-2'>
                                <input checked={planDetails.isActive} onChange={(e) => setPlanDetails({
                                    ...planDetails,
                                    isActive:e.target.checked
                                })} className='form-check-input' id='isActive' type='checkbox'></input>
                                <label className='form-check-label' htmlFor='isActive'>Is Active?</label>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={saveplan} className='btn btn-success'>Add Plan</button>
                        <button onClick={() => setShowModal(false)} className='btn btn-outline-secondary'>Close</button>
                    </Modal.Footer>
                
            </Modal>
            

            <Modal show={editModal} onHide={() => setEditModal(false)}>
                <Modal.Header>
                    <Modal.Title>Edit Plan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='container'>
                        <div className='col-md mt-2'>
                            <label className='form-label'>Plan Name</label>
                            <input className='form-control' type='text' disabled></input>
                        </div>

                        <div className='col-md mt-2'>
                            <label className='form-label'>Plan Amount *</label>
                            <input className='form-control' type='number'></input>
                        </div>

                        <div className='d-flex flex-row mt-2'>
                            <div className='col-md me-2'>
                                <label className='form-label'>Period Type *</label>
                                <select className='form-select'>
                                    <option value=''>Choose...</option>

                                </select>
                            </div>


                            <div className='col-md ms-2'>
                                <label className='form-label'>Period Time *</label>
                                <input className='form-control' type='number'></input>
                            </div>

                            
                        </div>

                        <div className='form-check from-check-inline col-md mt-2'>
                                <input onChange={(e) => setPlanDetails({
                                    ...planDetails,
                                    isWeb:e.target.checked
                                })}  checked={planDetails.isWeb} className='form-check-input' id='isOnline' type='checkbox'></input>
                                <label className='form-check-label' htmlFor='isOnline'>Is Website Show?</label>
                        </div>

                        <div className='form-check from-check-inline col-md mt-2'>
                                <input checked={planDetails.isActive} onChange={(e) => setPlanDetails({
                                    ...planDetails,
                                    isActive:e.target.checked
                                })} className='form-check-input' id='isActive' type='checkbox'></input>
                                <label className='form-check-label' htmlFor='isActive'>Is Active?</label>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className='btn btn-primary'>Update</button>
                    <button className='btn btn-outline-secondary'>Cancel</button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
