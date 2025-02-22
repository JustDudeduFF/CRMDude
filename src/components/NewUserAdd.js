import React, {useState, useEffect} from "react";
import {api, db, storage} from '../FirebaseConfig'
import {  uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";
import { ref, set, onValue, update } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";





export default function NewUserAdd() {

  const navigate = useNavigate();

  //Use States For Fill All Details

  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [installationAddress, setInstallationAddress] = useState("");
  const [colonyName, setColonyName] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Connection Details
  const [isp, setIsp] = useState("");
  const [planName, setPlanName] = useState("");
  const [planAmount, setPlanAmount] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [refundableAmount, setRefundableAmount] = useState("");
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(null);
  const [conectiontyp, setConnectionTyp] = useState('');

  // Inventory & Device Details
  const [deviceMaker, setDeviceMaker] = useState("");
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("");
  const [connectionPowerInfo, setConnectionPowerInfo] = useState("");
  const [category, setCategory] = useState('');



  // Documents
  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [cafDocuments, setCafDocuments] = useState(null);

  //Broadband Plan Array for Fetching Data
  const [arraycolony, setArraycolony] = useState([]);
  const [arrayplan, setArrayplan] = useState([]);
  const [arrayisp, setArrayisp] = useState([]);
  const [arraydevice, setArraydevice] = useState([]);
  const [arrayserial, setArrayserial] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);

  const [planDuration, setPlanDuration] = useState(0); // Duration value from Firebase
  const [durationUnit, setDurationUnit] = useState(''); 

  const [loader, setLoader] = useState(false);
  


  const [isListVisible, setIsListVisible] = useState(false);
  const handleListItemClick = (value) => {
    setDeviceSerialNumber(value)
    setIsListVisible(false); // Optionally hide the list after selection
  };

  const serialRef = ref(db, `Inventory/New Stock/${deviceMaker}/${category}`);
  const categoryRef = ref(db, `Inventory/New Stock/${deviceMaker}`);

  const ledgerkey = Date.now();



  useEffect(() => {
    if (deviceMaker) {
      // Fetch data only when deviceMaker is updated
      getCategory();
    }
  }, [deviceMaker]); // Make sure to include dependencies

  const getCategory =() => {
    setArrayCategory([]);
    setArrayserial([]);

    onValue(categoryRef, (categorySnap => {
      if(categorySnap.exists()){
        const categoryArray = [];
        categorySnap.forEach(Childcategory => {
          const categoryname = Childcategory.key;
          categoryArray.push(categoryname);
        });
        setArrayCategory(categoryArray);
      }else {
        toast.error('No Data Found!', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }));
  }

  const getchSerials = () => {
    setArrayserial([]);
    // Firebase call to get data
    onValue(serialRef, (snapshot) => {
      if (snapshot.exists()) {
        const Serialarray = [];
        snapshot.forEach((childSnapshot) => {
          const serialnumber = childSnapshot.key;
          Serialarray.push(serialnumber);
        });
        setArrayserial(Serialarray);
      } else {
        toast.error('No Data Found!', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });
  };

  const handleDeviceMakerChange = (e) => {
    setDeviceMaker(e.target.value);
  };

  // function generateCustomUniqueKey() {
  //   // Generate a random string and append it to the current timestamp
  //   const randomString = Math.random().toString(36).substr(2, 9); // Random alphanumeric string
  //   const timestamp = Date.now().toString();
  //   return `${timestamp}_${randomString}`;
  // }


  useEffect(() => {
    const deviceRef = ref(db, `Inventory/New Stock`);


    // const unsubscribecolony = onValue(colonyRef, (colonySnap) => {
    //   if (colonySnap.exists()) {
    //     const colonyArray = [];
    //     colonySnap.forEach((Childcolony) => {
    //       const colonyname = Childcolony.key;
    //       const companyname = Childcolony.val().undercompany;
    //       colonyArray.push({colonyname, companyname});

    //     });
    //     setArraycolony(colonyArray);
       
    //   } else {
    //     toast.error('Please Add an colony Location', {
    //       autoClose: 3000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   }
    // });

    // const unsubscribeplan = onValue(planRef, (planSnap) => {
    //   if (planSnap.exists()) {
    //     const planArray = [];
    //     planSnap.forEach((Childplan) => {
    //       const planname = Childplan.val().planname;
    //       const planamount = Childplan.val().planamount;
    //       const planperiod = Childplan.val().planperiod;
    //       const periodtime = Childplan.val().periodtime;
    //       planArray.push({planname, planamount, planperiod, periodtime});
    //     });
        
    //     setArrayplan(planArray);
        
    //   } else {
    //     toast.error('Please Add an plan Location', {
    //       autoClose: 3000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   }
    // });

    // const unsubscribeisp = onValue(ispRef, (ispSnap) => {
    //   if (ispSnap.exists()) {
    //     const ispArray = [];
    //     ispSnap.forEach((Childisp) => {
    //       const ispname = Childisp.val().ispname;
          
    //       ispArray.push(ispname);
    //     });
    //     setArrayisp(ispArray);
        
    //   } else {
    //     toast.error('Please Add an isp Location', {
    //       autoClose: 3000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   }
    // });

    
    const unsubscribedevice = onValue(deviceRef, (deviceSnap) => {
      if (deviceSnap.exists()) {
        const deviceArray = [];
        deviceSnap.forEach((Childdevice) => {
          const devicename = Childdevice.key;
          
          deviceArray.push(devicename);
        });
        setArraydevice(deviceArray);
        
      } else {
        toast.error('Please Add an device Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });


    initialData();


    return () => {
      
      unsubscribedevice();

    };
  }, []); 

  const initialData = async() => {
    try{
      const [responseIsp, responsePlan, responseColony] = await Promise.all([
        axios.get(api+"/master/ISPs?data=isp"),
        axios.get(api+"/master/Broadband Plan?data=plans"),
        axios.get(api+"/master/Colonys?data=colony")
      ]);
  
      if(responseIsp.status !== 200 || responsePlan.status !== 200 || responseColony.status !== 200){
        return;
      }
  
      const colonyData = responseColony.data;
      if(colonyData){
        setArraycolony(colonyData);
      }
  
      const planData = responsePlan.data;
      if(planData){
        setArrayplan(planData);
      }
  
      const ispData = responseIsp.data;
      if(ispData){
        setArrayisp(ispData);
      }
    }catch(e){
      console.log(e);
    }
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




  const handleSubmit = async (e) => {
    e.preventDefault();
    const onekey = Date.now();
    const userKey = username+onekey;

    if(fullName === '' || username === '' || mobileNo === '' || company === '' || installationAddress === '' || conectiontyp === '' || isp === ''){
      toast.error('Manadaratry Field will not be empty', {
        autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      })
    }else{
      setLoader(true);
      try {
        // Upload files to Firebase Storage
        const uploadFile = async (file, folder) => {
          if (!file) return null;
          const storageRef = dbRef(storage, `${folder}/${file.name}_${Date.now()}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return url;
        };
  
        const identityProofURL = await uploadFile(identityProof, "identityProof");
        const addressProofURL = await uploadFile(addressProof, "addressProof");
        const cafDocumentsURL = await uploadFile(cafDocuments, "cafDocuments");
  
        // Prepare data
        const userData = {
          company,
          fullName,
          username,
          mobileNo,
          email,
          installationAddress,
          colonyName,
          state,
          pinCode,
          connectionDetails: {
            isp,
            planName,
            planAmount,
            securityDeposit,
            refundableAmount,
            activationDate: activationDate,
            expiryDate: expiryDate,
            conectiontyp: conectiontyp,
            dueAmount: parseInt(planAmount) + parseInt(securityDeposit)
          },
          inventoryDeviceDetails: {
            deviceMaker,
            deviceSerialNumber,
            connectionPowerInfo,
          },
          documents: {
            addressProof: {
              source: 'Manual',
              date: new Date().toISOString().split('T')[0],
              modifiedby: localStorage.getItem('Name'),
              documentname: 'Address Proof',
              url: addressProofURL,
              key: "addressProof"
            },

            cafDocuments: {
              source: 'Manual',
              date: new Date().toISOString().split('T')[0],
              modifiedby: localStorage.getItem('Name'),
              documentname: 'Caf Proof',
              url: cafDocumentsURL,
              key: "cafDocuments"
            },

            identityProof: {
              source: 'Manual',
              date: new Date().toISOString().split('T')[0],
              modifiedby: localStorage.getItem('Name'),
              documentname: 'Identity Proof',
              url: identityProofURL,
              key: "identityProof"
            }
          },
          createdAt: activationDate,
        };
        
        const ledgerdata = {
            type:'Security',
            date:new Date().toISOString().split('T')[0],
            particular: 'Device Security',
            debitamount: securityDeposit,
            creditamount: 0,
        }

        const ledgerdata2 = {
          type:'Registaration',
          date:new Date().toISOString().split('T')[0],
          particular: 'New Subscriber',
          debitamount: planAmount,
          creditamount: 0,
      }

        const planinfo ={
          planName: planName,
          planAmount: planAmount,
          isp: isp,
          activationDate: activationDate,
          expiryDate: expiryDate,
          action: 'Registeration',
          completedby: localStorage.getItem('Name')
        }

        const inventrydata = {
          devicename: `${deviceMaker} ${category}`,
          date: new Date().toISOString().split('T')[0],
          deviceSerialNumber : deviceSerialNumber,
          remarks: securityDeposit === '0' || null ? 'Free to Use' : 'Device On Security',
          amount: securityDeposit,
          status: 'Activated',
          modifiedby: localStorage.getItem('Name'),
          ledgerkey: onekey

        }


  
        // Add to Firestore
        await update(ref(db, `Subscriber/${userKey}`), userData);
        await set(ref(db, `Subscriber/${userKey}/ledger/${ledgerkey}`), ledgerdata2);
        await set(ref(db, `Subscriber/${userKey}/ledger/${onekey}`), ledgerdata);
        await set(ref(db, `Subscriber/${userKey}/Inventory/${onekey}`), inventrydata);
        await set(ref(db, `Subscriber/${userKey}/planinfo/${ledgerkey}`), planinfo);
  
        // Reset form or show success message 
        setLoader(false);
        navigate(-1);
        // Optionally, reset all states here
      } catch (error) {
        console.error("Error adding document: ", error);
        alert("There was an error uploading the details.");
        setLoader(false);
      }
    }

    
  };

  const filteredSerial = arrayserial.filter(serial =>
    serial.toLowerCase().includes(deviceSerialNumber.toLowerCase())
  );
  



  return (

    //Personal Details Section
    
    <div style={{width: '100%', display:'flex', flexDirection: 'column', marginTop: '5.5%'}}>
      {loader &&
          <div className="spinner-wrapper" style={{position: 'fixed', width: '100%',top:'0' ,  height: '100%', backgroundColor: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity:'0.5', zIndex:'1000'}}>
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
          <label style={{color:'white', fontSize:'17px'}}>Uploading Data...</label>
          </div>
        </div>
        
      }
        <h2 style={{marginLeft: '20px'}}>Create User ID</h2>
        <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select Company *
          </label>
          <input value={company} className='form-control' disabled></input>
          
          
        </div><br></br>

        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            FullName *
          </label>
          <input 
          onChange={(e) => setFullName(e.target.value)}
            type="text"
            className="form-control"
            id="validationCustom01"
            required
          ></input>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-3">
          <label  className="form-label">
            Username * 
          </label>
          <div className="input-group has-validation">
            <span className="input-group-text" id="inputGroupPrepend">
              @
            </span>
            <input
            onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            
          </div>
        </div>
        <div className="col-md-2">
          <label  className="form-label">
            Mobile No. *
          </label>
          <div className="input-group has-validation">
            <span className="input-group-text" id="inputGroupPrepend">
              +91
            </span>
            <input
            onChange={(e) => setMobileNo(e.target.value)}
              maxLength={10}
              type="numbers"
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <div className="invalid-feedback">Please choose a username.</div>
          </div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom03" className="form-label">
            Email Address
          </label>
          <input
          onChange={(e) => setEmail(e.target.value)}
            type="gmail"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationCustom03" className="form-label">
            Installation Address *
          </label>
          <input
          onChange={(e) => setInstallationAddress(e.target.value)}
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Colony Name
          </label>
          <select onChange={(e) => {
            const selectColony = e.target.value;
            setColonyName(selectColony);

            const selectedColonyObj = arraycolony.find(colony => colony.colonyname === selectColony);
            if (selectedColonyObj) {
              setCompany(selectedColonyObj.companyname);
            } else {
              setCompany("");
            }

            
          }} className="form-select" id="validationCustom04" required>
            <option>Choose...</option>
          {arraycolony.length > 0 ? (
              arraycolony.map((colony, index) => (
                <option key={index} value={colony.colonyname}>
                  {colony.colonyname}
                </option>
              ))
            ) : (
              <option value="">No Plan Available</option>
            )}
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            State
          </label>
          <input
          onChange={(e) => setState(e.target.value)}
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom05" className="form-label">
            PIN Code
          </label>
          <input
          onChange={(e) => setPinCode(e.target.value)}
            type="text"
            className="form-control"
            id="validationCustom05"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid PIN Code.</div>
        </div>
      </form>
      </div>



{/* Connection Details Section */}
      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Connection Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select ISP *
          </label>
          <select onChange={(e) => setIsp(e.target.value)} className="form-select" id="validationCustom04" required>s
            <option value="">  
              Choose...
            </option>
            {
              arrayisp.length > 0 ? (
                arrayisp.map((isp, index) => (
                  <option key={index} value={isp}>{isp}</option>
                ))
              ) : (
                <option value=''>No Isp Available</option>
              )
            }
            
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            Plan Name
          </label>
          <select onChange={(e) => {
            const selectedPlanName = e.target.value;
            setPlanName(selectedPlanName);
          
            // Find the selected plan's amount
            const selectedPlanObj = arrayplan.find(plan => plan.planname === selectedPlanName);
            if (selectedPlanObj) {
              setPlanAmount(selectedPlanObj.planamount);
              const periodtyp = selectedPlanObj.planperiod;
              const periodtime = selectedPlanObj.periodtime;

              setPlanDuration(periodtime);
              setDurationUnit(periodtyp);

              updateExpirationDate(activationDate, periodtime, periodtyp);
             } else {
              setPlanAmount("");
            }

            
          }}
          
          className="form-select" id="validationCustom04" required>
            <option>Choose...</option>
          {arrayplan.length > 0 ? (
              arrayplan.map((plan, index) => (
                <option key={index} value={plan.planname}>
                  {plan.planname}
                </option>
              ))
            ) : (
              <option value="">No Plan Available</option>
            )}
          </select>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label  className="form-label">
            Plan Amount
          </label>
          <div className="input-group has-validation">
            <input
            onChange={(e) => setPlanAmount(e.target.value)}
              type="text"
              value={planAmount}
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <div className="invalid-feedback">Please choose a username.</div>
          </div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom03" className="form-label">
            Security Deposite
          </label>
          <input
          onChange={(e) => {setSecurityDeposit(e.target.value); setRefundableAmount(e.target.value)}}
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Refundable Amount
          </label>
          <input
          value={refundableAmount}
          onChange={(e) => setRefundableAmount(e.target.value)}
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Activation Date
          </label><br></br>
          <input value={activationDate} type="date" onChange={(e) => {setActivationDate(e.target.value)
          updateExpirationDate(e.target.value, planDuration, durationUnit)
          
            
          }} className="form-control"></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Expiry Date
          </label><br></br>
          <input disabled value={expiryDate} type="date" onChange={(e) => setExpiryDate(e.target.value)} className="form-control"></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>

        <div className='col-md-3'>
          <label className="form-label">Connection Type *</label>
          <select onChange={(e) => setConnectionTyp(e.target.value)} className="form-select">
            <option value=''>Choose...</option>
            <option value='FTTH'>FTTH</option>
            <option value='EtherNet'>EtherNet</option>
          </select>

        </div>
      </form>
      </div>



{/* Inventory Details Section */}
      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Inventry & Device Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px', height:'15vh'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select Device Maker  
          </label>
          <select onClick={() => setIsListVisible(false)}  onChange={
            handleDeviceMakerChange

            
          } className="form-select" id="validationCustom04" required>s
            <option value="">  
              Choose...
            </option>
            {
              arraydevice.length > 0 ? (
                arraydevice.map((devicename, index) => (
                  <option key={index} value={devicename}>{devicename}</option>
                ))
              ) : (
                <option value=''>No Maker Available</option>
              )
            }
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div>


        <div className="col-md-3">
          <label className="form-label">Select Category</label>
          <select onClick={() => getchSerials()} onChange={(e) => setCategory(e.target.value)} className="form-select">
            <option value=''>Choose...</option>
            {arraycategory.length > 0 ? (
              arraycategory.map((category, index) => (
                <option value={category} key={index}>{category}</option>
              ))
            ) : (
              <option value=''>No Category Available</option>
            )}
            </select> 

        </div>
      
        <div className="col-md-3">
      <label htmlFor="validationCustom01" className="form-label">
        Device Serial Number
      </label>
      <div className="input-group has-validation">
        <input
          onClick={() => setIsListVisible(!isListVisible)}
          value={deviceSerialNumber}
          onChange={(e) => setDeviceSerialNumber(e.target.value)}
          type="text"
          className="form-control"
          
          aria-describedby="inputGroupPrepend"
          required
        />
      </div>

      {isListVisible && (
        <div 
          className="mt-3 p-2 border border-info shadow rounded w-25" 
          style={{
            height: '25vh',
            position: 'absolute',
            overflow: 'hidden',
            overflowY: 'auto',
            zIndex: '1000',
            backgroundColor: 'white'
          }}
        >
          {filteredSerial.map((serial, index) => (
            <div 
              key={index} 
              className="list-item" 
              onClick={() => handleListItemClick(serial)}
            >
              {serial}
            </div>
          ))}
        </div>
      )}
    </div>

        
      </form>
      </div>




{/* Documents Details Section */}

      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Documents & Terms Conditions</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Identity Proof 
          </label>
          <div className="input-group">
              <input onChange={(e) => setIdentityProof(e.target.files[0])} type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
              
          </div>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-3">
          <label htmlFor="validationCustom01" className="form-label">
            Address Proof
          </label>
          <div className="input-group">
              <input onChange={(e) => setAddressProof(e.target.files[0])} type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
             
          </div>
            
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label  className="form-label">
            CAF Documents
          </label>
          <input onChange={(e) => setCafDocuments(e.target.files[0])} type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
          </div>

          

          </form>

          
      </div>

      <button onClick={handleSubmit} style={{margin: '20px'}} type="button" className="btn btn-success">Upload Details</button>

      <ToastContainer/>
    </div>
  );
}
