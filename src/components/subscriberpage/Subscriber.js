import React,{useEffect, useState} from 'react'
import Demo_Icon from './drawables/photo.png'
import Due_Icon from './drawables/rupeenew.png'
import Cust_Ledger from './Cust_Ledger'
import { BrowserRouter as Router, Routes,Route,Link, useNavigate } from 'react-router-dom';
import Cust_PayRecpt from './Cust_PayRecpt'
import TicketsTable from './TicketsTable';
import InventoryTable from './InventoryTable';
import DebitCreditTable from './DebitCreditTable';
import RemakFollowTable from './RemakFollowTable';
import DocumentUpload from './DocumentUpload';
import SubscriberDetails from './SubscriberDetails';
import SubscriberLogs from './SubscriberLogs';
import { ProgressBar } from 'react-loader-spinner';
import axios from 'axios';
import { db } from '../../FirebaseConfig'
import { ref, get, set, update, onValue } from 'firebase/database'
import RenewalModal from './RenewalModal';
import PlanChangeModal from './PlanChangeModal';
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';
import { Modal, Spinner } from 'react-bootstrap';






export default function Subscriber() {
    const { hasPermission } = usePermissions();

    const username = localStorage.getItem('susbsUserid');

    const navigate = useNavigate();
   

      //Use States For Fill All Details

  const [company, setCompany] = useState("");
  const [userid, setUserID] = useState('');
  const [fullName, setFullName] = useState("");
  const [expiryModal, setExpiryModal] = useState(false);
  const [newExp, setNewExp] = useState("");
  const [loading, setLoading] = useState(false);





  // Connection Details
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [registerationdate, setRegistrationDate] = useState('');
  const [remaindays, setRemainDays] = useState(0);
  const [status, setStatus] = useState('Active');
  const [dueamount, setDueAmount] = useState(10);

  const [showmodal, setShowModal] = useState(false);
  const [showplanchange, setPlanChange] = useState(false);


  const [customesharge, setCustomCharge] = useState(0);
  const [renewactdate, setRenewActDate] = useState(new Date().toISOString().split('T')[0]);
  const [arrayplan, setArrayPlan] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [expdate, setExpDate] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contact, setContact] = useState('');

  const [renew, setRenew] = useState(false);
  const [bandwidth, setBandwidth] = useState('');






  const [renewbtn, setRenewBtn] = useState(true);




    const [loader, setLoader] = useState(false);

    function convertExcelDateSerial(input) {
        const excelDateSerialPattern = /^\d+$/; // matches only digits (Excel date serial number)
        if (excelDateSerialPattern.test(input)) {
          const excelDateSerial = parseInt(input, 10);
          const baseDate = new Date("1900-01-01");
          const date = new Date(baseDate.getTime() + excelDateSerial * 86400000);
      
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          return `${year}-${month}-${day}`;
        } else {
          return input; // return original input if it's not a valid Excel date serial number
        }
      }


    const userRef = ref(db, `Subscriber/${username}`);
    const planRef = ref(db, `Subscriber/${username}/connectionDetails`);
    const plansRef = ref(db, `Master/Broadband Plan`);

    

    const ledgerKey = Date.now();
    

    const handleSavePlan = async () => {
        setLoader(true);
        setRenewBtn(true);

        let newDue = parseInt(dueamount);


        
        // Parse values once
        const parsedCustomesharge = parseInt(customesharge, 10) || 0;
        const parsedPlanAmount = parseInt(planAmount, 10) || 0;

        if(parsedCustomesharge !== 0){
            newDue = parseInt(dueamount) + parsedCustomesharge
        }else{
            newDue = parseInt(dueamount) + parsedPlanAmount
        }


        const currentDate = new Date().toISOString().split('T')[0];

        const ledgerData = {
            type: 'Renewal',
            date: currentDate,
            particular: `${planName} From ${renewactdate} to ${expdate}`,
            debitamount: parseInt(customesharge, 10) || parseInt(planAmount, 10),
            creditamount: 0
        }

        const planinfo ={
            compeletedate: new Date().toISOString().split('T')[0],
            planName: planName,
            planAmount: parseInt(customesharge, 10) || parseInt(planAmount, 10),
            isp: isp,
            activationDate: renewactdate,
            expiryDate: expdate,
            action: 'Renewal',
            completedby: localStorage.getItem('Name'),
            remarks: remarks
          }

          const newconnectioninfo = {
            activationDate: renewactdate,
            expiryDate: expdate,
            planAmount: parseInt(customesharge, 10) || parseInt(planAmount, 10),
            dueAmount: newDue,
            bandwidth: bandwidth
          }
          console.log(newDue);

        await set(ref(db, `Subscriber/${username}/ledger/${ledgerKey}`), ledgerData);

        await set(ref(db, `Subscriber/${username}/planinfo/${ledgerKey}`), planinfo);

        await update(planRef, newconnectioninfo).then(() => {
            const emailData = {
                to: userEmail,
                subject: 'Broadband Subscription Renwal',
                text: `🌐 Broadband Recharge Successful! 🎉\n\nDear ${fullName},\n\n✅ Your broadband recharge for ${planName} has been successfully completed.\n\n💳 *Amount Paid:* ₹${planAmount}\n📅 *Validity:* ${new Date(renewactdate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})} to ${new Date(expdate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})}\n🚀 *Speed:* Up to ${bandwidth} Mbps\n\nThank you for choosing *Sigma Business Solutions*! 😊\n\n✨ Enjoy uninterrupted browsing and streaming! 🎬📱\n\nFor support or queries, feel free to reach out to us:\n📞 *Customer Care:* 9999118971\n💬 *WhatsApp Support:* 9999118971    *24x7*\n\nStay connected, stay happy! 🌟`
            }

           
            const sendMail = async () => {
                const response = await axios.post('http://api.sigmanetworks.in:5000/sendmail', emailData);
                console.log(response.data.message);
            }

            const sendWhatsapp = async () => {
                const message = `🌐 Broadband Recharge Successful! 🎉\n\nDear ${fullName},\n\n✅ Your broadband recharge for ${planName} has been successfully completed.\n\n💳 *Amount Paid:* ₹${planAmount}\n📅 *Validity:* ${new Date(renewactdate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})} to ${new Date(expdate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})}\n🚀 *Speed:* Up to ${bandwidth} Mbps\n\nThank you for choosing *Sigma Business Solutions*! 😊\n\n✨ Enjoy uninterrupted browsing and streaming! 🎬📱\n\nFor support or queries, feel free to reach out to us:\n📞 *Customer Care:* 9999118971\n💬 *WhatsApp Support:* 9999118971    *24x7*\n\nStay connected, stay happy! 🌟`
                const encodedMessage = encodeURIComponent(message);
                await axios.post(`http://api.sigmanetworks.in:5000/send-message?number=91${contact}&message=${encodedMessage}`);

            }
            sendMail();
            sendWhatsapp();
            setShowModal(false);
            setLoader(false);
        });

          


          
    }

    const updateExpiry = async() => {
        setLoader(true);
        const logKey = Date.now().toString();
        const logRef = ref(db, `Subscriber/${userid}/logs/${logKey}`);
        const expRef = ref(db, `Subscriber/${userid}/connectionDetails`);


        const expDate = {
            expiryDate: new Date(newExp).toISOString().split('T')[0]
        }
        const logData = {
            date:new Date().toISOString().split('T')[0],
            description: `plan expiry date is changed from "${expiryDate} to "${newExp}"`,
            modifiedby: localStorage.getItem('contact')
        }

        try{
            await update(expRef, expDate);
            await update(logRef, logData);
        }catch(e){
            console.log(e)
        }finally{
            setLoader(false);
            setExpiryModal(false);
        }

        
    }




    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoader(true);
    
                onValue(userRef, (subsSnap) => {
                    if (subsSnap.exists()) {
                        setFullName(subsSnap.val().fullName);
                        setCompany(subsSnap.val().company);
                        setUserID(subsSnap.val().username);
                        setRegistrationDate(subsSnap.val().createdAt);
                        setUserEmail(subsSnap.val().email);
                        setContact(subsSnap.val().mobileNo);
    
    
                        localStorage.setItem('subsname', subsSnap.val().fullName);
                        localStorage.setItem('subsemail', subsSnap.val().email);
                        localStorage.setItem('subscontact', subsSnap.val().mobileNo);
                        localStorage.setItem('subsaddress', subsSnap.val().installationAddress);
                        localStorage.setItem('subsplan', subsSnap.child("connectionDetails").val().planName)
                    }
                })


                
    
                // Fetch Available Plans
                const planSnap = await get(plansRef);
                if (planSnap.exists()) {
                    const planArray = [];
                    planSnap.forEach((childPlan) => {
                        const planname = childPlan.val().planname;
                        const planperiod = childPlan.val().planperiod;
                        const periodtime = childPlan.val().periodtime;
                        const bandwidth = childPlan.val().bandwidth;
                        planArray.push({ planname, periodtime, planperiod, bandwidth });

                        if (planname === planName){
                            setRenew(true);
                        }else{
                            setRenew(false);
                        }
                    });
                    setArrayPlan(planArray);
                }
    
                // Setup real-time connection info listener
                const unsubscribe = onValue(planRef, (planSnap) => {
                    if (planSnap.exists()) {
                        setPlanName(planSnap.val().planName);
                        setPlanAmount(planSnap.val().planAmount);
                        setActivationDate(convertExcelDateSerial(planSnap.val().activationDate));
                        setExpiryDate(convertExcelDateSerial(planSnap.val().expiryDate));
                        setIsp(planSnap.val().isp);
                        setDueAmount(planSnap.val().dueAmount);
                    } else {
                        console.log('Connection Data Not Found');
                    }
                });
    
                return unsubscribe;
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoader(false);
            }
        };

        
    
        fetchData();
    
        return () => {
            fetchData?.();
        };
    }, [username]);
    
    // Separate useEffect to calculate remaining days when expiryDate is updated
    useEffect(() => {
        if (expiryDate) {
            const calculateDaysBetween = () => {
                const start = new Date();
                const end = new Date(expiryDate);
    
                // Calculate the difference in time
                const timeDiff = end.getTime() - start.getTime();
    
                // Convert time difference from milliseconds to days
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
                if (daysDiff < 0) {
                    setStatus('Inactive');
                } else {
                    setStatus('Active');
                }
    
                setRemainDays(daysDiff);
            };
    
            calculateDaysBetween();
        }
    }, [expiryDate]);
    





      const getperiod = (dateValue) => {
        const currentplan = planName;


        const selectePlanObj = arrayplan.find(plan => plan.planname === currentplan);

        if(selectePlanObj){
            const planperiod = selectePlanObj.planperiod;
            const periodtime = selectePlanObj.periodtime;
            const bandwidth = selectePlanObj.bandwidth;

            const date = new Date(dateValue);

// Extend the date based on the unit from Firebase
            if (planperiod === 'Months') {
            date.setMonth(date.getMonth() + parseInt(periodtime));
            } else if (planperiod === 'Years') {
            date.setFullYear(date.getFullYear() + parseInt(periodtime));
            } else if (planperiod === 'Days') {
            date.setDate(date.getDate() + parseInt(periodtime));
            }

            // Format the new expiration date to YYYY-MM-DD
            const expDate = new Date(date.setDate(date.getDate() - 1)).toISOString().split('T')[0];
            setExpDate(expDate);
            setBandwidth(bandwidth);

        }

        else{
            setShowModal(false);
            toast.error('No Plan Found Please Change Plan!', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
            console.log('No Plan Found');
            
        }
        

    }




    


  return (
    <div style={{marginTop: '4.5%', display: 'flex', flexDirection: 'column'}}>
        {loader &&
          <div className="spinner-wrapper" style={{position: 'fixed', width: '100%',top:'0' ,  height: '100%', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity:'0.5', zIndex:'900'}}>
          <div style={{width: '200px', height: '100px', position:'fixed'}}>
          <ProgressBar
            height="80"
            width="80"
            radius="9"
            color="blue"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          /><br></br>
          <label style={{color:'white', fontSize:'17px'}}>Fetching Data...</label>
          </div>
        </div>
        
      }
        <div style={{display: 'flex', flexDirection: 'row', margin: '10px'}}>
            <div style={{flex: '1'}}>
            <img style={{width: '200px', height: '200px', margin: '10px'}} src={Demo_Icon} className="rounded float-start" alt="subscriber Image"></img>
            </div>
            <ToastContainer style={{position:'fixed', top:'5%', right:'3.5%'}}/>
            <div style={{flex:'5', display: 'flex', flexDirection: 'row'}}>
                <div style={{flex: '2', display: 'flex', flexDirection:'column'}}>
                    <div style={{flex:'1'}}>
                        <Link id='link' to='/dashboard/subscriber' state={{ username: userid }}><h2 style={{color: 'blueviolet', fontWeight:'bold'}}>{fullName}</h2></Link>
                        <span style={{color: 'green', marginLeft: '15px'}}>Prepaid</span><span> | </span><span style={{color: 'violet'}}>Paid</span><span> | </span><span style={{color: 'red'}}>{status}</span>
                    </div>
                    <div style={{flex: '2'}}>
                        <div style={{padding: '10px', border: '1px solid gray', display: 'flex', flexDirection :'row', margin: '8px', borderRadius: '5px', background: '#cbc4ba', color: 'white', boxShadow: '0 0 8px gray'}}>
                            <div style={{flex: '1s'}}>
                            <label style={{marginLeft:'10px', fontWeight: '550', color: 'blueviolet'}}>User ID</label><br></br>
                            <h5 style={{color: 'black'}}>{userid}</h5>

                            <label style={{marginTop:'8px'}}>Registeration Date</label><br></br>
                            <label style={{marginEnd:'8px', color: 'black'}}>{registerationdate}</label>
                            </div>
                            
                            <div style={{flex: '1', marginLeft: '15px'}}>
                                <label>Company Name</label><br></br>
                                <h5 style={{color: 'black'}}>{company}</h5>


                                <label style={{marginTop:'8px'}}>Connection Type</label><br></br>
                                <label style={{marginEnd:'8px', color: 'black'}}>FTTH</label>
                                
                            </div>
                        </div>
                        
                    </div>
                
                </div>
                <div style={{flex: '4', display: 'flex', flexDirection: 'column', color: 'black'}}>
                    <div style={{display: 'flex', flexDirection: 'row', margin: '8px'}}>
                        <div style={{flex: '1'}}> 
                            <label>Active Plan</label>
                            <h6 style={{color:'blue'}}>{planName}</h6>

                            <label>Start Date</label>
                            <h6 style={{color:'blue'}}>{new Date(activationDate).toLocaleDateString('en-GB', {
                                day:'2-digit',
                                month:'long',
                                year:'numeric'
                            }).replace(',', '')}</h6>

                            <label>End Date</label><span onClick={() => setExpiryModal(true)} style={{cursor:'pointer'}} className='ms-2 badge text-bg-secondary'>Edit</span>
                            <h6 style={{color:'blue'}}>{new Date(expiryDate).toLocaleDateString('en-GB', {
                                day:'2-digit',
                                month:'long',
                                year:'numeric'
                            }).replace(',', '')}</h6>

                            <label>Amount</label>
                            <h6 style={{color:'blue'}}>{`${parseInt(planAmount)}.00`}</h6>
                        </div>
                        <div style={{flex: '1'}}>
                            <label>ISP</label>
                            <h6 style={{color:'blue'}}>{isp}</h6>

                            <label>Data</label>
                            <h6 style={{color:'blue'}}>Unlimited</h6>

                            <label>Status</label>
                            <h6 style={{color:'green'}}>{status}</h6>

                            <label>Days Remains</label>
                            <h6 style={{color:'blue'}}>{remaindays}</h6>
                        </div>

                        <div style={{flex: '1', display:'flex', flexDirection:'column'}}>
                            <div style={{flex:"1", padding: '10px', borderRadius: '20px', boxShadow:dueamount < 0 ? '0 0 10px green' : dueamount > 0 ? '0 0 10px red' : '0 0 10px gray', display: 'flex', flexDirection:'row'}}>
                                <div style={{flex:'1'}}>
                                    <img alt='Due Amount' className='img_boldicon' src={Due_Icon}></img>
                                </div>
                                <div style={{display: 'flex', flex:'2', flexDirection:'column'}}>
                                <label style={{fontSize:'30px', marginLeft:'20px'}}>{dueamount}</label>
                                <label style={{marginLeft: '10px', color:'red'}}>Due Amount</label>
                                </div>

                                
                               
                               
                            </div>
                            <div style={{flex:'2', display:'flex', flexDirection:"column"}}>
                                <div style={{flex:'2', marginTop:'50px', display:"flex", flexDirection:'row'}}>
                                <button onClick={() => hasPermission("RENEW_PLAN") ? setShowModal(true) : toast.error("Permission Denied", {
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                })} style={{marginRight:'10px'}} type="button" className="btn btn-info" disabled = {renew}>Renew Subscription</button>
                                <button onClick={() => {
                                    hasPermission("CHANGE_PLAN") ? setPlanChange(true) : toast.error("Permission Denied", {
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                    })
                                }}  type="button" className="btn btn-outline-danger">Change Plan</button>
                                </div>

                                <div style={{flex:'1'}}>
                                    <span>Sigma Coins Balance :- </span>
                                </div>
                            



                            </div>

                        </div>
                    </div>

                    

                </div>
                </div>

                <RenewalModal modalShow={() => setShowModal(false)} show={showmodal} planName = {planName} planAmount={parseInt(planAmount)} isp={isp} 
                        handleMin={expiryDate}
                        handleAmount={(e) => setCustomCharge(e.target.value)}
                        handleActivation={(e) => {
                            setRenewBtn(false);
                            const newActivationDate = e.target.value;
                            setRenewActDate(newActivationDate);
                            getperiod(newActivationDate);
                        }}
                        handleexpiry={expdate}
                        handleRemarks={(e) => setRemarks(e.target.value)}
                        renewbtn={renewbtn}
                        savePlan={handleSavePlan}
                    />

                <PlanChangeModal modalShow={() => setPlanChange(false)} show={showplanchange} dueamount={dueamount}
                                        handleMin={activationDate}
                                        
                                        
                                        
                                        
                                    />
        </div>
        <div style={{flex:'5', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'1', display:'flex', flexDirection:'column'}}>
                
                
                <div onClick={() => {navigate('ledger', {state: {userid}})}} className='div-subs-option'>
                    <label>Ledger</label>
                </div>
                


                
                <div onClick={() => {navigate('paymentreceipt', {state: {userid}})}} className='div-subs-option'>
                    <label>Payments Receipts</label>
                </div>
                
                

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



            <div style={{flex:'5', display:'flex', flexDirection:'column', width:'70%', height:'50vh'}}>
                
                <Routes>
                    <Route path='/*' element={<SubscriberDetails/>}/>
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

        <Modal show={expiryModal} onHide={() => setExpiryModal(false)}>
            <Modal.Header>
                <Modal.Title>
                    Change Expiry Date
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3">Processing, please wait...</p>
                </div>
                ) : (
                    <div className='container'>
                        <div className='col-md'>
                            <label className='form-label'>Select New Expiry</label>
                            <input defaultValue={expiryDate ? new Date(expiryDate).toISOString().split('T')[0] : ''} onChange={(e) => setNewExp(e.target.value)} type='date' className='form-control'></input>
                        </div>
                    </div>
                )} 
            </Modal.Body>
            <Modal.Footer>
                <button onClick={updateExpiry} className='btn btn-primary'>Update</button>
                <button onClick={() => setExpiryModal(false)} className='btn btn-secodary'>Cancel</button>
            </Modal.Footer>
        </Modal>
  </div>
  )
}
