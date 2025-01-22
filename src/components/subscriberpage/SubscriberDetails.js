import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes,Route,Link } from 'react-router-dom';
import SubscriberPersonal from './SubscriberPersonal';
import RechargeTable from './RechargeTable';
import { Modal } from 'react-bootstrap';
import { get, ref, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';



export default function SubscriberDetails() {
    const userid = localStorage.getItem("susbsUserid");
    const [showmodal, setShowModal] = useState(false);
    const [arrayColony, setArrayColony] = useState([]);
    const [showTerminate, setShowTerminate] = useState(false);
    const [terminateRemark, setTerminateRemark] = useState('');

    const [subsDetail, setSubsDetail] = useState({
        name: '',
        address: '',
        colonyname: '',
        mobile: '',
        alternate: '',
        email: '',
        conectiontyp: '',
        companyname: '',
        username: '',
        isTerminated: ''
        });

    const [prevSubsDetail, setPrevSubsDetail] = useState({});

    useEffect(() => {
        const fetchBasicInfo = async() => {
            const Subsref = ref(db, `Subscriber/${userid}`);
            const userSnap = await get(Subsref);

            setSubsDetail({
                name: userSnap.val().fullName,
                address: userSnap.val().installationAddress,
                colonyname: userSnap.val().colonyName,
                mobile: userSnap.val().mobileNo,
                alternate: userSnap.val().alternatNo,
                email: userSnap.val().email,
                conectiontyp: userSnap.child("connectionDetails").val().conectiontyp,
                companyname: userSnap.val().company,
                username: userSnap.val().username,
                isTerminated: userSnap.val().isTerminate
            });
            
            
        }
        
        const fetchColony = async() => {
            const colonyRef = ref(db, `Master/Colonys`);
            const colonySnap = await get(colonyRef);

            if(colonySnap.exists()){
                const array = [];
                colonySnap.forEach((element) => {
                    const coloname = element.key;
                    const companyName = element.val().undercompany;

                    array.push({coloname, companyName});
                });

                setArrayColony(array);
            }


        }
        

        fetchColony();
        fetchBasicInfo();
    }, [userid]);


    const handleUpdate = async() => {
        console.log(prevSubsDetail);
        const logKey = Date.now();
        const userRef = ref(db, `Subscriber/${userid}`);
        const connectionRef = ref(db, `Subscriber/${userid}/connectionDetails`);
        const subsLogRef = ref(db, `Subscriber/${userid}/logs/${logKey}`);

        const changes = [];

        // Compare the previous and current state
        Object.keys(prevSubsDetail).forEach((key) => {
            if (subsDetail[key] !== prevSubsDetail[key]) {
                changes.push(
                    `${key} is changed from "${prevSubsDetail[key] || 'N/A'}" to "${subsDetail[key]}"`
                );
            }
        });


        

        const userNewData = {
            fullName: subsDetail.name,
            installationAddress: subsDetail.address,
            colonyName: subsDetail.colonyname,
            mobileNo: subsDetail.mobile,
            alternatNo: subsDetail.alternate,
            email: subsDetail.email,
            company: subsDetail.companyname,
            username: subsDetail.username
        }


        const logData = {
            date: new Date().toISOString().split('T')[0],
            modifiedby: localStorage.getItem('contact'),
            description:changes.join(', ')
        }

        const connec = {
            conectiontyp: subsDetail.conectiontyp
        }


        await update(userRef, userNewData).then(async() => {
            await update(connectionRef, connec);
            await update(subsLogRef, logData);
            setShowModal(false);
            alert("Detail Updated Succesfully");
        });

    }

    const teminateUser = async() => {
        const key = Date.now();
        const terminate = {
            isTerminate:true
        }
        const terminatelog = {
            date: new Date().toISOString().split('T')[0],
            description: `User Terminated: ${terminateRemark}`,
            modifiedby: localStorage.getItem('contact')
        }
        await update(ref(db, `Subscriber/${userid}`), terminate);
        await update(ref(db, `Subscriber/${userid}/logs/${key}`), terminatelog);
        alert("User id Terminated");
    }


  return (
    
    <>
    
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'2'}}>
                <h2>Connection Info</h2>
            
            </div>
            <div style={{color:'green'}}>
                <span>Recent Note :- </span><span style={{maxWidth:"max-content", height:'10px'}}>Remarks Particular Only</span>
            </div>
            <div style={{flex:'4'}}>
                <div style={{width:'max-content', float:'right'}}>
                <Link id='link' to='rechargeinfo'>
                    <button type="button" className="btn btn-outline-success">Recharge Info</button></Link>
                    <button onClick={() => {
                        setPrevSubsDetail(subsDetail);
                        setShowModal(true);
                    }} type="button" className="btn btn-outline-secondary ms-2">Edit Info</button>
                    <button onClick={() => setShowTerminate(true)} className={subsDetail.isTerminated ? 'btn btn-success ms-2 me-2' : 'btn btn-danger ms-2 me-2'}>{subsDetail.isTerminated ? 'Active User' : 'Terminated User'}</button>
                </div>
            </div>
        </div>
        

        <div style={{flex:"10"}}>
            <Routes>
                <Route path='/' element={<SubscriberPersonal />} />
                <Route path='rechargeinfo' element={<RechargeTable/>}/>
            </Routes>
        </div>

        <Modal show={showmodal} onHide={() => setShowModal(false)} size='xl'>
           <Modal.Header>
            <Modal.Title>Edit Subscriber Information</Modal.Title>
           </Modal.Header>
           <Modal.Body>
                <form className='row g-3'>
                    <div className='col-md-3'>
                        <label className='form-label ms-2'>Subscriber Name</label>
                        <input onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            name: e.target.value
                        }))} value={subsDetail.name} type='text' placeholder='Fullname' className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'>Subscriber Mobile</label>
                        <input onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            mobile: e.target.value
                        }))} value={subsDetail.mobile} type='number' placeholder='e.g. xxxxxxxx02' className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'>Subscriber Alternate Mobile</label>
                        <input onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            alternate: e.target.value
                        }))} value={subsDetail.alternate} placeholder='e.g. xxxxxxxx02' type='number' className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'Subscriber >Mail Address</label>
                        <input onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            email: e.target.value
                        }))} value={subsDetail.email} placeholder='e.g. abc@gmail.com' type='email' className='form-control'></input>
                    </div>

                    <div className='col-md-12'>
                        <label className='form-label ms-2'>Subscriber Installation Address</label>
                        <textarea
                        onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            address: e.target.value
                        }))}
                        value={subsDetail.address}
                        className="form-control"
                        rows="3"
                        placeholder='e.g. H.no.002, Street no.0 XX Area'
                        ></textarea>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'>Subscriber Colony Name</label>
                        <select onChange={(e) => {
                            const selectColony = e.target.value;
                            const selectedColonyObj = arrayColony.find(colony => colony.coloname === selectColony);
                            setSubsDetail((prevState) => ({
                                ...prevState,
                                colonyname: selectColony,
                                companyname: selectedColonyObj.companyName
                            }));  
                        }} defaultValue={subsDetail.colonyname} className='form-select'>
                            <option value=''>Choose...</option>
                            {
                                arrayColony.length > 0 ? (
                                    arrayColony.map((colony, index) => (
                                        <option key={index} value={colony.coloname}>{colony.coloname}</option>
                                    ))
                                ) : (
                                    <option value=''>No Data Found!</option>
                                )
                            }
                        </select>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'>Subscriber Connection Type</label>
                        <select onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            conectiontyp: e.target.value
                        }))} defaultValue={subsDetail.conectiontyp} className='form-select'>
                        <option value=''>Choose...</option>
                        <option value='FTTH'>FTTH</option>
                        <option value='EtherNet'>EtherNet</option>
                        </select>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label ms-2'>User ID</label>
                        <input onChange={(e) => setSubsDetail((prevState) => ({
                            ...prevState,
                            username: e.target.value
                        }))} defaultValue={subsDetail.username} className='form-control' type='text'></input>
                    </div>
                </form>
           </Modal.Body>
           <Modal.Footer>
                <button onClick={handleUpdate} className='btn btn-primary'>Update</button>
                <button onClick={() => setShowModal(false)} className='btn btn-outline-secondary'>Close</button>
           </Modal.Footer>
        </Modal>

        <Modal show={showTerminate} onHide={() => setShowTerminate(false)}>
            <Modal.Header>
                <Modal.Title>
                    Remark for Termination
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <div className='col-md'>
                        <label className='form-label'>Enter Remarks</label>
                        <input onChange={(e) => setTerminateRemark(e.target.value)} className='form-control' type='text' placeholder='e.g reason for termination'></input>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={teminateUser} className='btn btn-outline-danger'>Terminate User</button>
                <button onClick={() => setShowTerminate(false)} className='btn btn-secondary'>Close</button>
            </Modal.Footer>
        </Modal>
    </>
    
    )
}
