import React,{useEffect, useState} from 'react'
import Demo_Icon from './drawables/photo.png'
import Due_Icon from './drawables/rupeenew.png'
import Cust_Ledger from './Cust_Ledger'
import { BrowserRouter as Router, Routes,Route,Link, useLocation } from 'react-router-dom';
import Cust_PayRecpt from './Cust_PayRecpt'
import TicketsTable from './TicketsTable';
import InventoryTable from './InventoryTable';
import DebitCreditTable from './DebitCreditTable';
import RemakFollowTable from './RemakFollowTable';
import DocumentUpload from './DocumentUpload';
import SubscriberDetails from './SubscriberDetails';
import SubscriberLogs from './SubscriberLogs';


import { db } from '../../FirebaseConfig'
import { ref, get } from 'firebase/database'




    














export default function Subscriber() {




    const location = useLocation();
    const { username } = location.state || {};

      //Use States For Fill All Details

  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");


  // Connection Details
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [registerationdate, setRegistrationDate] = useState('');





    const userRef = ref(db, `Subscriber/${username}`);
    const planRef = ref(db, `Subscriber/${username}/connectionDetails`);

    useEffect(() => {

      const  fetchSusbsData = async () => {
            const subsSnap = await get(userRef);
            const planSnap = await get(planRef);

            if(subsSnap.exists()){
                setFullName(subsSnap.val().fullName);
                setRegistrationDate(subsSnap.val().createdAt);

            }

            if(planSnap.exists()){
                setPlanName(planSnap.val().planName);
                setPlanAmount(planSnap.val().planAmount);
                setActivationDate(planSnap.val().activationDate);
                setExpiryDate(planSnap.val().expiryDate);
                setIsp(planSnap.val().isp);
            }
        }

        fetchSusbsData();
    }, [username]);


  return (
    <div style={{marginTop: '4.5%', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', margin: '10px'}}>
            <div style={{flex: '1'}}>
            <img style={{width: '200px', height: '200px', margin: '10px'}} src={Demo_Icon} className="rounded float-start" alt="subscriber Image"></img>
            </div>
            <div style={{flex:'5', display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: '2', display: 'flex', flexDirection:'column'}}>
                    <div style={{flex:'1'}}>
                        <Link id='link' to='/dashboard/subscriber'><h2 style={{color: 'blueviolet', fontWeight:'bold'}}>{fullName}</h2></Link>
                        <span style={{color: 'green', marginLeft: '15px'}}>Prepaid</span><span> | </span><span style={{color: 'violet'}}>Paid</span><span> | </span><span style={{color: 'red'}}>InActive</span>
                    </div>
                    <div style={{flex: '2'}}>
                        <div style={{padding: '10px', border: '1px solid gray', display: 'flex', flexDirection :'row', margin: '8px', borderRadius: '5px', background: '#cbc4ba', color: 'white', boxShadow: '0 0 8px gray'}}>
                            <div style={{flex: '1s'}}>
                            <label style={{marginLeft:'10px', fontWeight: '550', color: 'blueviolet'}}>User ID</label><br></br>
                            <h5 style={{color: 'black'}}>{username}</h5>

                            <label style={{marginTop:'8px'}}>Registeration Date</label><br></br>
                            <label style={{marginEnd:'8px', color: 'black'}}>{registerationdate}</label>
                            </div>
                            
                            <div style={{flex: '1', marginLeft: '15px'}}>
                                <label>Subscriber ID</label><br></br>
                                <h5 style={{color: 'black'}}>1250</h5>


                                <label style={{marginTop:'8px'}}>Connection Type</label><span className="badge text-bg-info mx-3">Edit</span><br></br>
                                <label style={{marginEnd:'8px', color: 'black'}}>FTTH</label>
                                
                            </div>
                        </div>
                        
                    </div>
                
                </div>
                <div style={{flex: '4', display: 'flex', flexDirection: 'column', color: 'black'}}>
                    <div style={{display: 'flex', flexDirection: 'row', margin: '8px'}}>
                        <div style={{flex: '1'}}> 
                            <label>Active Plan</label><span className="badge text-bg-success mx-3">Edit</span>
                            <h6 style={{color:'blue'}}>{planName}</h6>

                            <label>Start Date</label>
                            <h6 style={{color:'blue'}}>{activationDate}</h6>

                            <label>End Date</label><span className="badge text-bg-success mx-3">Edit</span>
                            <h6 style={{color:'blue'}}>{expiryDate}</h6>

                            <label>Amount</label>
                            <h6 style={{color:'blue'}}>{`${planAmount}.00`}</h6>
                        </div>
                        <div style={{flex: '1'}}>
                            <label>ISP</label><span className="badge text-bg-success mx-3">Edit</span>
                            <h6 style={{color:'blue'}}>{isp}</h6>

                            <label>Data</label>
                            <h6 style={{color:'blue'}}>Unlimited</h6>

                            <label>Status</label>
                            <h6 style={{color:'green'}}>Active</h6>

                            <label>Days Remains</label>
                            <h6 style={{color:'blue'}}>365</h6>

                        </div>

                        <div style={{flex: '1', display:'flex', flexDirection:'column'}}>
                            <div style={{flex:"1", padding: '10px', borderRadius: '20px', boxShadow :' 0 0 10px red', display: 'flex', flexDirection:'row'}}>
                                <div style={{flex:'1'}}>
                                    <img className='img_boldicon' src={Due_Icon}></img>
                                </div>
                                <div style={{display: 'flex', flex:'2', flexDirection:'column'}}>
                                <label style={{fontSize:'30px', marginLeft:'20px'}}>2000</label>
                                <label style={{marginLeft: '10px', color:'red'}}>Due Amount</label>
                                </div>

                                
                               
                               
                            </div>
                            <div style={{flex:'2', display:'flex', flexDirection:"column"}}>
                                <div style={{flex:'2', marginTop:'50px', display:"flex", flexDirection:'row'}}>
                                <button style={{marginRight:'10px'}} type="button" className="btn btn-info">Renew Subscription</button>
                                <button  type="button" className="btn btn-outline-danger">Change Plan</button>
                                </div>

                                <div style={{flex:'1'}}>
                                    <span>Sigma Coins Balance :- </span>
                                </div>
                            



                            </div>

                        </div>
                    </div>

                    

                </div>
                </div>
        </div>
        <div style={{flex:'5', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'1', display:'flex', flexDirection:'column'}}>
                
                <Link id='link' to='ledger'>
                <div className='div-subs-option'>
                    <label>Ledger</label>
                </div>
                </Link>


                <Link id='link' to='paymentreceipt'>
                <div className='div-subs-option'>
                    <label>Payments Receipts</label>
                </div>
                </Link>
                

                <Link id='link' to='tickets'>
                <div className='div-subs-option'>
                    <label>Tickets</label>
                </div>
                </Link>

                <Link id='link' to='inventory'>
                <div className='div-subs-option'>
                    <label>Inventory</label>
                </div>
                </Link>

                <Link id='link' to='dcnote'>
                <div className='div-subs-option'>
                    <label>Debit/Credit Notes</label>
                </div>
                </Link>

                <Link id='link' to='remarkfollow'>
                <div className='div-subs-option'>
                    <label>Remarks & Follow Ups</label>
                </div>
                </Link>

                <Link id='link' to='documents'>
                <div className='div-subs-option'>
                    <label>Documents</label>
                </div>
                </Link>

                <Link id='link' to='logsubs'>
                <div className='div-subs-option'>
                    <label>Subscriber Logs</label>
                </div>
                </Link>
            </div>



            <div style={{flex:'5', display:'flex', flexDirection:'column', width:'70%'}}>
                
                <Routes>
                    <Route path='/*' element={<SubscriberDetails username={username}/>}/>
                    <Route path='ledger/*' element={<Cust_Ledger/>}/>
                    <Route path='paymentreceipt/*' element={<Cust_PayRecpt/>}/>
                    <Route path='tickets/*' element={<TicketsTable/>}/>
                    <Route path='inventory/*' element={<InventoryTable/>}/>
                    <Route path='dcnote/*' element={<DebitCreditTable/>}/> 
                    <Route path='remarkfollow/*' element={<RemakFollowTable/>}/>
                    <Route path='documents/*' element={<DocumentUpload/>} />
                    <Route path='logsubs' element={<SubscriberLogs/>}/>
                    
                    
                </Routes>
               
                
            </div>

        </div>
  </div>
  )
}
