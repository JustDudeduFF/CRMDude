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
import { toast, ToastContainer } from 'react-toastify';
import { usePermissions } from '../PermissionProvider';
import { Modal, Spinner } from 'react-bootstrap';
import { api } from '../../FirebaseConfig';






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
      const [isTerminated, setIsTeminated] = useState(false);
      const [terminateRemark, setTerminateRemark] = useState('');
      const [temptermstatus, setTempTermStatus] = useState();
      const [cuPlanCode, setCuPlanCode] = useState({
        isPlanCode:false,
        plancode:''
      });





  // Connection Details
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [registerationdate, setRegistrationDate] = useState('');
  const [remaindays, setRemainDays] = useState(0);
  const [status, setStatus] = useState('Active');
  const [dueamount, setDueAmount] = useState(0);

  const [showplanchange, setPlanChange] = useState(false);
  const [ispChangeModal, setIspChangeModal] = useState(false);
  const [ispArray, setIspArray] = useState([]);
  const [selectedIsp, setSelectedIsp] = useState("");
  const [showTerimate, setShowTerminate] = useState(false);



  const [customesharge, setCustomCharge] = useState(0);
  const [renewactdate, setRenewActDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [expdate, setExpDate] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [contact, setContact] = useState('');

  const [renew, setRenew] = useState(false);
  const [bandwidth, setBandwidth] = useState('');

  const [modalChangeplan, setModalChangePlan] = useState(false);
  const [renewmodal, setRenewModal] = useState(false);
  const [changePlanData, setChangePlanData] = useState({
    provider:'All',
    isp:'All',
    planname:'',
    activationDate:new Date().toISOString().split('T')[0],
    expiryDate:'',
    planAmount:'',
    bandwidth:'',
    planperiod:'',
    periodtime:'',
    baseamount:'',
    remarks:'',
    plancode:''
  });

  const [provide, setProvide] = useState([]);
  const [isps, setIsps] = useState([]);
  const [plans, setPlans] = useState([]);

  const [filterPlan, setFilterPlans] = useState([]);
  

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


    const planRef = ref(db, `Subscriber/${username}/connectionDetails`);

    

    const ledgerKey = Date.now();
    


    const updateExpiry = async() => {
        setExpiryModal(false);
        setLoader(true);
        const logKey = Date.now().toString();
        const logRef = ref(db, `Subscriber/${username}/logs/${logKey}`);
        const expRef = ref(db, `Subscriber/${username}/connectionDetails`);


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
            toast.success(`Expiry Date Changed`, {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
        }catch(e){
            console.log(e)
        }finally{
            setLoader(false);
            setExpiryModal(false);
        }

        
    }


    const fetchUserData = () => {
        const userRef = ref(db, `Subscriber/${username}`);
        onValue(userRef, (snap) => {
            const userData = snap.val();

            localStorage.setItem('subsname', userData.fullName);
            localStorage.setItem('subsemail', userData.email);
            localStorage.setItem('subscontact', userData.mobileNo);
            localStorage.setItem('subsaddress', userData.installationAddress);
            localStorage.setItem('subsplan', userData.connectionDetails.planName);  
            localStorage.setItem('company', userData.company);         

            setFullName(userData.fullName);
            setCompany(userData.company);
            setUserID(userData.username);
            setRegistrationDate(userData.createdAt);
            setContact(userData.mobileNo);
            setIsTeminated(userData.isTerminate);
            setPlanName(userData.connectionDetails.planName);
            setPlanAmount(userData.connectionDetails.planAmount);
            setActivationDate(userData.connectionDetails.activationDate);
            setExpiryDate(userData.connectionDetails.expiryDate);
            setIsp(userData.connectionDetails.isp);
            setDueAmount(userData.connectionDetails.dueAmount);
            setUserEmail(userData.email);
            setCuPlanCode({
                isPlanCode:userData?.connectionDetails?.plancode,
                plancode:userData.connectionDetails.plancode
            });   
            
            
            

        })
    }


    const fetchData = async () => {
        try {
            const userResponse = await axios.get(api+'/wholeuser/'+username);
            const ispResponse = await axios.get(api+'/master/ISPs');
            const planResponse = await axios.get(api+'/master/Broadband Plan');

            if(ispResponse.status !== 200 || planResponse.status !== 200 || userResponse.status !== 200){
                console.log('One or More API Issue for fetch')
                return;
            };


            
            const userData = userResponse.data;
            if(userData){

                // localStorage.setItem('subsname', userData.name);
                // localStorage.setItem('subsemail', userData.email);
                // localStorage.setItem('subscontact', userData.mobile);
                // localStorage.setItem('subsaddress', userData.address);
                // localStorage.setItem('subsplan', userData.plan);  
                // localStorage.setItem('company', userData.company);         
    
                // setFullName(userData.name);
                // setCompany(userData.company);
                // setUserID(userData.userid);
                // setRegistrationDate(userData.creation);
                // setContact(userData.mobile);
                // setIsTeminated(userData.isTerminated);
                // setPlanName(userData.plan);
                // setPlanAmount(userData.amount); 
                // setActivationDate(userData.start);
                // setExpiryDate(userData.end);
                // setIsp(userData.isp);
                // setDueAmount(userData.due); 
                // setUserEmail(userData.email);
                // setCuPlanCode({
                //     isPlanCode:userData.plancode !== "N/A",
                //     plancode:userData.plancode
                // });   
            }
            



            

            const ispData = ispResponse.data;
            if(ispData){
                const Array = [];
                Object.keys(ispData).forEach((key) => {
                    const isp = ispData[key];
                    const ispname = isp.ispname;
                    Array.push(ispname);
                });
                setIspArray(Array);
            }

            const planData = planResponse.data;

            if(planData){
                const array = [];
                Object.keys(planData).forEach((key) => {
                    const plans = planData[key];
                    const planKey = key;
                    array.push({...plans, planKey});
                });

                const provider = [...new Set(array.map((data) => data.provider))];
                const isp = [...new Set(array.map((data) => data.isp))];

                setProvide(provider);
                setIsps(isp);
                setPlans(array);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } 
    };




    useEffect(() => {
        fetchData();
        fetchUserData();
        const interval = setInterval(() => {
            fetchData();
        }, 2000);
    
        return () => clearInterval(interval); 
    }, [username]);

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

                if(isTerminated) setStatus('Terminated')
    
                setRemainDays(daysDiff);
            };
    
            calculateDaysBetween();
        }
    }, [expiryDate]);

    const teminateUser = async() => {
            const key = Date.now();
            const terminate = {
                isTerminate:temptermstatus
            }
            const terminatelog = {
                date: new Date().toISOString().split('T')[0],
                description: `User Terminated: ${terminateRemark}`,
                modifiedby: localStorage.getItem('contact')
            }
            try{
                await update(ref(db, `Subscriber/${username}`), terminate);
                await update(ref(db, `Subscriber/${username}/logs/${key}`), terminatelog);

                toast.success(`User Status Updated`, {
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    progress: undefined,
                })
            }catch(e){
                console.log(e);
            }
            
    }
    


    const updateISP = async() => {
        setIspChangeModal(false);
        setLoader(true);
        const logKey = Date.now();
        const ispRef = ref(db, `Subscriber/${username}/connectionDetails`);
        const logRef = ref(db, `Subscriber/${username}/logs/${logKey}`)
        
        const ispData = {
            isp: selectedIsp
        }

        const logData = {
            date: new Date().toISOString().split('T')[0],
            description: `Customer ISP is Changed From ${isp || "N/A"} to ${selectedIsp}`,
            modifiedby: localStorage.getItem('contact')
        }

        try{
            await update(ispRef, ispData);
            await update(logRef, logData);
            toast.success(`ISP Changed`, {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
        }catch(e){
            console.log(e)
        }finally{
            setLoader(false);
        }
        

        


    }

    useEffect(() => {
        let filterArray = plans;

        if(changePlanData.provider !== 'All'){
            filterArray = filterArray.filter((data) => data.provider === changePlanData.provider);
        }

        setFilterPlans(filterArray);
    }, [changePlanData]);


    const savePlan = async(text) => {

        if(changePlanData.provider === 'All' || changePlanData.isp === 'All' || changePlanData.planAmount === '' || changePlanData.planname === ''){
            toast.error('Something went wrong', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            
            });
            return;
        }



        const newDue = Number(dueamount) + Number(changePlanData.planAmount);

        const ledgerData = {
            type:text,
            date: new Date().toISOString().split('T')[0],
            particular: `${changePlanData.planname} From ${changePlanData.activationDate} to ${changePlanData.expiryDate}`,
            debitamount: Number(changePlanData.planAmount),
            creditamount: 0
        }

        const planinfo ={
            compeletedate: new Date().toISOString().split('T')[0],
            planName: changePlanData.planname,
            planAmount: Number(changePlanData.planAmount),
            isp: changePlanData.isp,
            activationDate: changePlanData.activationDate,
            expiryDate: changePlanData.expiryDate,
            action: text,
            completedby: localStorage.getItem('Name'),
            remarks: changePlanData.remarks,
            bandwidth: `${changePlanData.bandwidth} Mbps`
          }

        const newconnectioninfo = {
            activationDate: changePlanData.activationDate,
            expiryDate: changePlanData.expiryDate,
            planAmount: Number(changePlanData.planAmount),
            dueAmount: newDue,
            planName: changePlanData.planname,
            bandwidth: `${changePlanData.bandwidth} Mbps`,
            isp: changePlanData.isp,
            provider:changePlanData.provider,
            plancode:changePlanData.plancode
        }

        try{
            await set(ref(db, `Subscriber/${username}/ledger/${ledgerKey}`), ledgerData);
            await set(ref(db, `Subscriber/${username}/planinfo/${ledgerKey}`), planinfo);
            await update(ref(db, `Subscriber/${username}/connectionDetails`), newconnectioninfo).then(() => {sendMessage();})

            toast.success(`Successfull ${text}`, {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })

        }catch(e){
            toast.error('Failed to Update Plan', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.log(e);
        }finally{
            fetchData();
            setModalChangePlan(false);
            setChangePlanData({
                provider:'All',
                isp:'',
                planname:'',
                activationDate:new Date().toISOString().split('T')[0],
                expiryDate:'',
                planAmount:'',
                bandwidth:'',
                planperiod:'',
                periodtime:'',
                baseamount:'',
                remarks:'',
                plancode:''
            });
        }

    }

    const updateExpirationDate = (newActivationDate, duration, unit) => {
        const date = new Date(newActivationDate);
    
        // Extend the date based on the unit from Firebase
        if (unit === 'Months') {
          date.setMonth(date.getMonth() + Number(duration));
        } else if (unit === 'Years') {
          date.setFullYear(date.getFullYear() + Number(duration));
        } else if (unit === 'Days') {
          date.setDate(date.getDate() + Number(duration));
        }
        
        const expDate = new Date(date.setDate(date.getDate() - 1)).toISOString().split('T')[0];
        return expDate;
      };

      const sendMessage = async() => {
        const emailData = {
            to: userEmail,
            subject: 'Broadband Subscription Renwal',
            text: `🌐 Broadband Recharge Successful! 🎉\n\nDear ${fullName},\n\n✅ Your broadband recharge for ${changePlanData.planname} has been successfully completed.\n\n💳 *Amount Paid:* ₹${changePlanData.planAmount}\n📅 *Validity:* ${new Date(changePlanData.activationDate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})} to ${new Date(changePlanData.expiryDate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})}\n🚀 *Speed:* Up to ${changePlanData.bandwidth}\n\nThank you for choosing *Sigma Business Solutions*! 😊\n\n✨ Enjoy uninterrupted browsing and streaming! 🎬📱\n\nFor support or queries, feel free to reach out to us:\n📞 *Customer Care:* ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}\n💬 *WhatsApp Support:* ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}    *24x7*\n\nStay connected, stay happy! 🌟`
        }
        const message = `🌐 Broadband Recharge Successful! 🎉\n\nDear ${fullName},\n\n✅ Your broadband recharge for ${changePlanData.planname} has been successfully completed.\n\n💳 *Amount Paid:* ₹${changePlanData.planAmount}\n📅 *Validity:* ${new Date(changePlanData.activationDate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})} to ${new Date(changePlanData.expiryDate).toLocaleDateString('en-GM',{day:'2-digit', month:'2-digit', year:'2-digit'})}\n🚀 *Speed:* Up to ${changePlanData.bandwidth}\n\nThank you for choosing *Sigma Business Solutions*! 😊\n\n✨ Enjoy uninterrupted browsing and streaming! 🎬📱\n\nFor support or queries, feel free to reach out to us:\n📞 *Customer Care:* ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}\n💬 *WhatsApp Support:* ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}    *24x7*\n\nStay connected, stay happy! 🌟`
        const encodedMessage = encodeURIComponent(message);
        await axios.post(api+`/send-message?number=91${contact}&message=${encodedMessage}&company=${company}`);
        alert(`Plan Is Changed Succesfully!`);
        await axios.post(api+'/sendmail', emailData);
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
                        <span style={{color: 'green', marginLeft: '15px'}}>Prepaid</span><span> | </span><span style={{color: 'violet'}}>Paid</span><span> | </span><span className={status === "Active" ? ('text-success') : status === "Inactive" ? ('text-danger') : 'text-secondary'}>{status}</span>
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
                            <label>ISP</label><span onClick={() => setIspChangeModal(true)} style={{cursor:'pointer'}} className='ms-2 badge text-bg-secondary'>Edit</span>
                            <h6 style={{color:'blue'}}>{isp}</h6>

                            <label>Data</label>
                            <h6 style={{color:'blue'}}>Unlimited</h6>

                            <label>Status</label><span onClick={() => setShowTerminate(true)} style={{cursor:'pointer'}} className='ms-2 badge text-bg-secondary'>Edit</span>
                            <h6 className={status === "Active" ? ('text-success') : status === "Inactive" ? ('text-danger') : 'text-secondary'}>{status}</h6>

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
                                <button onClick={() => {
                                    console.log(cuPlanCode);
                                    if(!hasPermission("RENEW_PLAN")){
                                        toast.error('Permission Denied!', {
                                            autoClose: 3000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            draggable: true,
                                            progress: undefined,
                                        });
                                        return;
                                    }

                                    if(cuPlanCode.isPlanCode){
                                        setRenewModal(true);
                                        const cuObj = plans.find((data) => data.planKey === cuPlanCode.plancode);
                                        if(cuObj){
                                            setChangePlanData({
                                                ...changePlanData,
                                                provider:cuObj.provider,
                                                isp:isp,
                                                planname:cuObj.planname,
                                                bandwidth:cuObj.bandwidth,
                                                expiryDate:updateExpirationDate(new Date().toISOString().split('T')[0], cuObj.periodtime, cuObj.planperiod),
                                                planAmount:planAmount,
                                                planperiod:cuObj.planperiod,
                                                periodtime:cuObj.periodtime,
                                                plancode:cuPlanCode.plancode
                                            });
                                        }
                                    }


                                }} style={{marginRight:'10px'}} type="button" className="btn btn-info" disabled = {!cuPlanCode.isPlanCode || isTerminated}>Renew Subscription</button>
                                <button onClick={() => {
                                    hasPermission("CHANGE_PLAN") ? setModalChangePlan(true) : toast.error("Permission Denied", {
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                    })
                                }}  type="button" className="btn btn-outline-danger" disabled={isTerminated}>Change Plan</button>
                                </div>

                                <div style={{flex:'1'}}>
                                    <span>Sigma Coins Balance :- </span>
                                </div>
                            



                            </div>

                        </div>
                    </div>

                    

                </div>
                </div>

                {/* <RenewalModal planName = {planName} planAmount={parseInt(planAmount)} isp={isp} 
                        handleMin={expiryDate}
                        handleAmount={(e) => setCustomCharge(e.target.value)}
                        handleActivation={(e) => {
                            setRenewBtn(false);
                            const newActivationDate = e.target.value;
                            setRenewActDate(newActivationDate);
                        }}
                        handleexpiry={expdate}
                        handleRemarks={(e) => setRemarks(e.target.value)}
                        renewbtn={renewbtn}savePlan={handleSavePlan}/>

                <PlanChangeModal modalShow={() => setPlanChange(false)} show={showplanchange} dueamount={dueamount} handleMin={activationDate}/> */}
                </div>
        <div style={{flex:'5', display:'flex', flexDirection:'row'}}>
            <div style={{flex:'1', display:'flex', flexDirection:'column'}}>
                
                
                <div onClick={() => {navigate('ledger', {state: {username}})}} className='div-subs-option'>
                    <label>Ledger</label>
                </div>
                


                
                <div onClick={() => {navigate('paymentreceipt', {state: {username}})}} className='div-subs-option'>
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
                <button onClick={() => setExpiryModal(false)} className='btn btn-secondary'>Cancel</button>
            </Modal.Footer>
        </Modal>

        <Modal show={ispChangeModal} onHide={() => setIspChangeModal(false)}>
            <Modal.Header>
                <Modal.Title>Change Customer ISP</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <label className='form-label'>Select ISP</label>
                    <select onChange={(e) => setSelectedIsp(e.target.value)} className='form-select'>
                        <option value=''>Choose...</option>
                        {
                            ispArray.length > 0 ? (
                                ispArray.map((isp, index) => (
                                    <option key={index} value={isp}>{isp}</option>
                                ))
                            ) : (
                                <option value=''>No ISP Found</option>
                            )
                        }
                    </select>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={updateISP} className='btn btn-primary'>Update</button>
                <button onClick={() => setIspChangeModal(false)} className='btn btn-secondary'>Close</button>
            </Modal.Footer>
        </Modal>
        <Modal show={showTerimate} onHide={() => setShowTerminate(false)}>
            <Modal.Header>
                <Modal.Title>
                    Terminated User
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <div className='col-md'>
                        <label className='form-label'>Select Account Status</label>
                        <select 
                            onChange={(e) => setTempTermStatus(e.target.value === "true")} 
                            className='form-select'
                        >
                            <option value={isTerminated}>Choose...</option>
                            <option value={isTerminated ? "false" : "true"}>{isTerminated ? "Active" : "Terminated"}</option>
                        </select>
                    </div>

                    <div className='col-md mt-2'>
                        <label className='form-label'>Enter Remarks</label>
                        <input onChange={(e) => setTerminateRemark(e.target.value)} className='form-control' type='text' placeholder='e.g. Reason or Remark'></input>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button onClick={teminateUser} className='btn btn-primary'>Update</button>
                <button onClick={() => setShowTerminate(false)} className='btn btn-outline-secondary'>Cancel</button>
            </Modal.Footer>
        </Modal>    

        <Modal show={modalChangeplan} onHide={() => setModalChangePlan(false)}>
            <Modal.Header>
                <Modal.Title>
                    Change Customer Plan
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <div className='d-flex flex-row mt-2'>
                        <div className='col-md me-2'>
                            <label className='form-label'>Select Provider *</label>
                            <select onChange={(e) => setChangePlanData({
                                ...changePlanData,
                                provider:e.target.value
                            })} className='form-select'>
                                <option>Choose...</option>
                                {
                                    provide.map((data, index) => (
                                        <option key={index}>{data}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div className='col-md ms-2'>
                            <label className='form-label'>Select ISP *</label>
                            <select onChange={(e) => setChangePlanData({
                                ...changePlanData,
                                isp:e.target.value
                            })} className='form-select'>
                                <option>Choose...</option>
                                {
                                    ispArray.map((data, index) => (
                                        <option key={index} value={data}>{data}</option>
                                    ))
                                }
                            </select>

                        </div>
                    </div>

                    <div className='col-md mt-2'>
                        <label className='form-label'>Select Plan *</label>
                        <select onChange={(e) => {
                            const selectKey = e.target.value;
                            const selectedObj = plans.find((data) => data.planKey === selectKey);
                            if(selectedObj){
                                setChangePlanData({
                                    ...changePlanData,
                                    provider:selectedObj.provider,
                                    isp:changePlanData.isp,
                                    planAmount:selectedObj.planamount,
                                    planname:selectedObj.planname, 
                                    bandwidth:selectedObj.bandwidth,
                                    periodtime:selectedObj.periodtime,
                                    planperiod:selectedObj.planperiod,
                                    expiryDate:updateExpirationDate(changePlanData.activationDate, selectedObj.periodtime, selectedObj.planperiod),
                                    baseamount:selectedObj.planamount,
                                    plancode:selectedObj.planKey
                                });


                                
                            }
                        }} className='form-select'>
                            <option>Choose...</option>
                            {
                                filterPlan.map((data, index) => (
                                    <option key={index} value={data.planKey}>{data.planname}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className='d-flex flex-row mt-2'>
                        <div className='col-md me-2'>
                            <label className='form-label'>Activation Date *</label>
                            <input defaultValue={changePlanData.activationDate} onChange={(e) => {
                                setChangePlanData({
                                    ...changePlanData,
                                    activationDate:e.target.value,
                                    expiryDate:updateExpirationDate(e.target.value, changePlanData.periodtime, changePlanData.planperiod),
                                    
                                })
                            }} className='form-control' type='date'></input>
                        </div>

                        <div className='col-md ms-2'>
                            <label className='form-label'>Expiry Date</label>
                            <input value={changePlanData.expiryDate} className='form-control' type='date' disabled></input>
                        </div>
                    </div>

                    <div className='d-flex flex-row mt-2'>
                        <div className='col-md me-2'>
                            <label className='form-label'>Base Amount</label>
                            <input value={changePlanData.baseamount} className='form-control' type='text' disabled></input>

                        </div>

                        <div className='col-md ms-2'>
                            <label className='form-label'>Custom Amount *</label>
                            <input defaultValue={changePlanData.planAmount} onChange={(e) => setChangePlanData({
                                ...changePlanData,
                                planAmount:e.target.value
                            })} className='form-control' type='text'></input>
                        </div>

                    </div>

                    <div className='col-md mt-2'>
                        <label className='form-label'>Remarks</label>
                        <input onChange={(e) => setChangePlanData({
                            ...changePlanData,
                            remarks:e.target.value
                        })} className='form-control' type='text'></input>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className='container d-flex flex-row'>
                    <button onClick={() => savePlan('Plan Change')} className='col-md btn btn-success me-3'>Update Plan</button>
                    <button onClick={() => setModalChangePlan(false)} className='col-md btn btn-outline-secondary ms-3'>Cancel</button>
                </div>
            </Modal.Footer>
        </Modal>

        <Modal show={renewmodal} onHide={() => setRenewModal(false)}>
            <Modal.Header>
                <Modal.Title>Renew Customer Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='container'>
                    <div className='col-md mt-2'>
                        <label className='form-label'>Current Plan</label>
                        <input defaultValue={changePlanData.planname} className='form-control'></input>
                    </div>

                    <div className='d-flex flex-row mt-2'>
                        <div className='col-md me-2'>
                            <label className='form-label'>Activation Date</label>
                            <input className='form-control' type='date' defaultValue={changePlanData.activationDate} onChange={(e) => setChangePlanData({
                                ...changePlanData,
                                activationDate:e.target.value,
                                expiryDate:updateExpirationDate(e.target.value, changePlanData.periodtime, changePlanData.planperiod)
                            })}></input>
                        </div>

                        <div className='col-md ms-2'>
                            <label className='form-label'>Expiry Date</label>
                            <input value={changePlanData.expiryDate} className='form-control' type='date' disabled></input>
                        </div>
                    </div>

                    <div className='col-md'>
                        <label className='form-label'>Remarks</label>
                        <input onChange={(e) => setChangePlanData({
                            ...changePlanData,
                            remarks:e.target.value
                        })} className='form-control' type='text'></input>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <div className='container d-flex flex-row'>
                    <button onClick={(e) => savePlan('Renewal')} className='col-md me-3 btn btn-primary'>Renew Plan</button>
                    <button onClick={() => setRenewModal(false)} className='col-md ms-3 btn btn-outline-secondary'>Cancel</button>
                </div>
            </Modal.Footer>
        </Modal>
  </div>
  )
}
