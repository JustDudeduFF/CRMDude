import React, { useEffect, useState } from 'react'
import '../Modal.css'
import { get, ref, set, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import axios from 'axios';



const PlanChangeModal = ({show, modalShow, handleMin, dueamount}) => {

    const username = localStorage.getItem('susbsUserid');

    const [arrayplan, setArrayPlan] = useState([]);
    const [arrayisp, setArrayIsp] = useState([]);
    const [planamount, setPlanAmount] = useState('');
    const [customecharge, setCustomCharge] = useState('');
    const [renewbtn, setRenewBtn] = useState(true);
    const [remarks, setRemarks] = useState('');
    const [planName, setPlanName] = useState('');
    const [isp, setIsp] = useState('');


    //Customer Personal Information
    const [fullName, setfullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [mailId, setMailId] = useState('');
    

    const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
    const [expirydate, setExpiryDate] = useState('');


    const [periodplan, setPeriodPlan] = useState('');
    const [timeperiod, setTimePeriod] = useState('');
    const planRef = ref(db, `Master/Broadband Plan`);
    const ispRef = ref(db, `Master/ISPs`);

    useEffect(() => {
        const fetchPlan = async () => {
            const planSnap = await get(planRef);
            if(planSnap.exists()){
                const planArray = [];
                planSnap.forEach(childs => {
                    const planName = childs.val().planname;
                    const planAmount = childs.val().planamount;
                    const planPeriod = childs.val().planperiod;
                    const periodTime = childs.val().periodtime;
                    planArray.push({planName, planAmount, planPeriod, periodTime});
                });
                setArrayPlan(planArray);
            }
        }

        const fetchisp = async () => {
            const ispSnap = await get(ispRef);
            if(ispSnap.exists()){
                const ispArray = [];
                ispSnap.forEach(childs => {
                    const ispname = childs.val().ispname;
                    ispArray.push(ispname);
                });
                setArrayIsp(ispArray);
            }
        }

        const fetchUserDetails = async() => {
            const userRef = ref(db, `Subscriber/${username}`);
            const userSnap = await get(userRef);
            if(userSnap.exists()){
                setfullName(userSnap.child("fullName").val());
                setMobile(userSnap.child("mobileNo").val());
                setMailId(userSnap.child("email").val());
            }else{
                console.log("User Snap is Not Found!");
            }
        }
        
        fetchUserDetails();
       fetchPlan(); 
       fetchisp();
    }, []);

    const ledgerKey = Date.now();



    const savePlan = async () => {
        const planinfoKey = Date.now();
        setRenewBtn(true);
        const newDue = (parseInt(dueamount, 10) || 0) + (parseInt(customecharge, 10) || parseInt(planamount, 10));
        // Add disabled Amount


        const ledgerData = {
            type:'Plan Change',
            date: new Date().toISOString().split('T')[0],
            particular: `${planName} From ${activationDate} to ${expirydate}`,
            debitamount: parseInt(customecharge, 10) || parseInt(planamount, 10),
            creditamount: 0
        }

        const planinfo ={
            compeletedate: new Date().toISOString().split('T')[0],
            planName: planName,
            planAmount: parseInt(customecharge, 10) || parseInt(planamount, 10),
            isp: isp,
            activationDate: activationDate,
            expiryDate: expirydate,
            action: 'Plan Change',
            completedby: localStorage.getItem('Name'),
            remarks: remarks
          }

          const newconnectioninfo = {
            activationDate: activationDate,
            expiryDate: expirydate,
            planAmount: parseInt(customecharge, 10) || parseInt(planamount, 10),
            dueAmount: newDue,
            planName: planName
          }

          const emailData = {
            to: "justdudehere@gmail.com",
            subject: 'Broadband Subscription Renwal',
            text: `Dear ${fullName}, \nYour plan has been renewed successfully.\n\nYour new plan will be active from ${activationDate} to ${expirydate}.\n\nYour Current Due Amount is ₹${newDue}.\n\nThank you for your business.\nRegards,\nSigma Business Solutions`,
        }

          const sendMessage = async() => {
            const responsewhatsapp = await axios.post(`https://finer-chimp-heavily.ngrok-free.app/send-message?number=91${9266125445}&message=Dear ${fullName},\n  Your Plan ${planName} for ₹${planamount}  Recharge Successfully for period of  ${activationDate} to ${expirydate} thanks for being with us. For any query call (9999118971) SIGMA BUSINESS SOLUTIONS or Download app (customer.sigmaetworks.in). `);
            const responsemail = await axios.post('https://finer-chimp-heavily.ngrok-free.app/sendmail', emailData);
            alert(`Plan Is Changed Succesfully!`)
          }

        if(planName === '' || planamount === ''){
            alert('something went wrong');
        }else{
            await set(ref(db, `Subscriber/${username}/ledger/${ledgerKey}`), ledgerData);

            await set(ref(db, `Subscriber/${username}/planinfo/${planinfoKey}`), planinfo);

            await update(ref(db, `Subscriber/${username}/connectionDetails`), newconnectioninfo).then(() => {
                sendMessage();
            })
            
        }


        setPlanAmount('');
        setCustomCharge('');
        setPlanName('');
        setIsp('');

          


          
    }


    const updateExpirationDate = (newActivationDate, duration, unit) => {
        const date = new Date(newActivationDate);
    
        // Extend the date based on the unit from Firebase
        if (unit === 'Months') {
          date.setMonth(date.getMonth() + parseInt(duration));
        } else if (unit === 'Years') {
          date.setFullYear(date.getFullYear() + parseInt(duration));
        } else if (unit === 'Days') {
          date.setDate(date.getDate() + parseInt(duration));
        }
    
        // Format the new expiration date to YYYY-MM-DD
        const formattedExpirationDate = date.toISOString().split('T')[0];
        setExpiryDate(formattedExpirationDate);
      };

    
    
    
    if(!show) return null;
    return(
       <div className='modal-overlay1'>
        <div className='modal-content1 d-flex flex-column'>
        <h5>Renew Customer Plan</h5>
            <div className='d-flex flex-row bg-success rounded'>
                <div className='m-2 d-flex flex-column col-md-5'>
                    <span className='ms-2 text-white'>
                        Select Plan
                    </span>
                    <select 
                        onChange={(e) => {
                            const selectedPlanName = e.target.value;
                            setPlanName(selectedPlanName);
                            const selectedObj = arrayplan.find(plan => plan.planName === selectedPlanName);
                            if (selectedObj) {
                                setPlanAmount(selectedObj.planAmount);
                                const periodtime = selectedObj.periodTime;
                                const periodtyp = selectedObj.planPeriod;

                                setPeriodPlan(periodtyp);
                                setTimePeriod(periodtime);

                                updateExpirationDate(activationDate, periodtime, periodtyp);
                            } else {
                                setPlanAmount('');
                            }
                        }} 
                        
                        className='form-control' 
                    >
                        <option value=''>Choose...</option>
                        {
                            arrayplan.length > 0 ? (
                                arrayplan.map((plan, index) => (
                                    <option value={plan.planName} key={index}>{plan.planName}</option>
                                ))
                            ) : (
                                <option value=''>No Data Available</option>
                            )
                        }
                    </select>
                </div>

                <div className='m-2 d-flex flex-column col-md-4'>
                    <span className='ms-2 text-white'>Plan Amount</span>
                    <input className='form-control' value={planamount} disabled></input>
                </div>

                <div className='m-2 d-flex flex-column col-md-2'>
                    <span className='ms-2 text-white'>Current ISP</span>
                    <select onChange={(e) => setIsp(e.target.value)} className='form-control' >
                        <option value=''>Choose...</option>
                        {
                            arrayisp.length > 0 ? (
                                arrayisp.map((name, index) => (
                                    <option value={name} key={index}>{name}</option>
                                ))
                            ) : (
                                <option value=''>No Data Availabel</option>
                            )
                        }
                    </select>
                </div>

                
            </div>

            <div className='d-flex flex-column'>
                <form className='row g-3 mb-4 mt-2'>
                    <div className='col-md-3'>
                        <label className='form-label'>Custom Charges</label>
                        <input 
                            onChange={(e) => setCustomCharge(e.target.value)} 
                            value={customecharge}
                            className='form-control'
                        />
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label'>Activation Date</label>
                        <input min={handleMin} onChange={(e) => {setActivationDate(e.target.value);
                            setRenewBtn(false);
                            updateExpirationDate(e.target.value, timeperiod, periodplan)}
                            } type='date' className='form-control'></input>
                    </div>

                    <div className='col-md-3'>
                        <label className='form-label'>Expiry Date</label>
                        <input value={expirydate} type='date' className='form-control' disabled></input>
                    </div>

                    <div className='col-md-9'>
                        <label className='form-label'>Remarks</label>
                        <input onChange={(e) => setRemarks(e.target.value)} className='form-control'></input>
                    </div>

                </form>
            </div>

            <div className='d-flex flex-row'>
            <button style={{flex:'1'}} onClick={savePlan} className='btn btn-outline-info' disabled={renewbtn}>Save</button>
            <button onClick={() => {modalShow(); setPlanAmount(''); setCustomCharge(''); setPlanName(''); setIsp('');}  } style={{flex:'1'}} className='btn btn-outline-secondary ms-2'>Cancel</button>
            </div>
            
            

        </div>
        
       </div> 
    );
};


export default  PlanChangeModal;