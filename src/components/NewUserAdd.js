import React, {useState, useEffect} from "react";
import {db, storage} from '../FirebaseConfig'
import {  uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";
import { ref, set, onValue } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import { MutatingDots } from "react-loader-spinner";



export default function NewUserAdd() {

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

  // Inventory & Device Details
  const [deviceMaker, setDeviceMaker] = useState("");
  const [deviceSerialNumber, setDeviceSerialNumber] = useState("");
  const [connectionPowerInfo, setConnectionPowerInfo] = useState("");

  // Field & Fiber Details
  const [connectedFMS, setConnectedFMS] = useState("");
  const [connectedPortNo, setConnectedPortNo] = useState("");
  const [uniqueJCNo, setUniqueJCNo] = useState("");
  const [fiberCoreNo, setFiberCoreNo] = useState("");


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
  const [arrayfms, setArrayfms] = useState([]);

  const [planDuration, setPlanDuration] = useState(0); // Duration value from Firebase
  const [durationUnit, setDurationUnit] = useState(''); 

  const [loader, setLoader] = useState(false);
  


  const [isListVisible, setIsListVisible] = useState(false);
  const [maxport, setMaxPort] = useState(0);
  const handleListItemClick = (value) => {
    setDeviceSerialNumber(value)
    setIsListVisible(false); // Optionally hide the list after selection
  };

  const serialRef = ref(db, `Inventory/New Stock/${deviceMaker}`);



  useEffect(() => {
    if (deviceMaker) {
      // Fetch data only when deviceMaker is updated
      getchSerials();
    }
  }, [deviceMaker]); // Make sure to include dependencies

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


  useEffect(() => {
    const colonyRef = ref(db, `Master/Colonys`);
    const planRef = ref(db, `Master/Broadband Plan`);
    const ispRef = ref(db, `Master/ISPs`);
    const deviceRef = ref(db, `Inventory/New Stock`);
    const fmsRef = ref(db, `Master/FMS`);


    const unsubscribecolony = onValue(colonyRef, (colonySnap) => {
      if (colonySnap.exists()) {
        const colonyArray = [];
        colonySnap.forEach((Childcolony) => {
          const colonyname = Childcolony.key;
          const companyname = Childcolony.val().undercompany;
          colonyArray.push({colonyname, companyname});

        });
        setArraycolony(colonyArray);
       
      } else {
        toast.error('Please Add an colony Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });

    const unsubscribeplan = onValue(planRef, (planSnap) => {
      if (planSnap.exists()) {
        const planArray = [];
        planSnap.forEach((Childplan) => {
          const planname = Childplan.val().planname;
          const planamount = Childplan.val().planamount;
          const planperiod = Childplan.val().planperiod;
          const periodtime = Childplan.val().periodtime;
          planArray.push({planname, planamount, planperiod, periodtime});
        });
        
        setArrayplan(planArray);
        
      } else {
        toast.error('Please Add an plan Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });

    const unsubscribeisp = onValue(ispRef, (ispSnap) => {
      if (ispSnap.exists()) {
        const ispArray = [];
        ispSnap.forEach((Childisp) => {
          const ispname = Childisp.val().ispname;
          
          ispArray.push(ispname);
        });
        setArrayisp(ispArray);
        
      } else {
        toast.error('Please Add an isp Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });

    
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


    const unsubscribefms = onValue(fmsRef, (fmsSnap) => {
      if (fmsSnap.exists()) {
        const fmsArray = [];
        fmsSnap.forEach((Childfms) => {
          const fmsname = Childfms.key;
          const fmsmaxport = Childfms.val().fmsport
          fmsArray.push({fmsname, fmsmaxport});
        });
        setArrayfms(fmsArray);
        
      } else {
        toast.error('Please Add an fms Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });

    return () => {
      unsubscribecolony();       // Cleanup for colony listener
      unsubscribeplan();  // Cleanup for plan listener
      unsubscribeisp();
      unsubscribedevice();
      unsubscribefms();
    };
  }, []); 

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
        },
        inventoryDeviceDetails: {
          deviceMaker,
          deviceSerialNumber,
          connectionPowerInfo,
        },
        fieldFiberDetails: {
          connectedFMS,
          connectedPortNo,
          uniqueJCNo,
          fiberCoreNo,
        },
        documents: {
          identityProofURL,
          addressProofURL,
          cafDocumentsURL,
        },
        createdAt: activationDate,
      };

      // Add to Firestore
      await set(ref(db, `Subscriber/${username}`), userData);

      // Reset form or show success message
      setLoader(false);
      // Optionally, reset all states here
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("There was an error uploading the details.");
      setLoader(false);
    }
  };

  const filteredSerial = arrayserial.filter(serial =>
    serial.toLowerCase().includes(deviceSerialNumber.toLowerCase())
  );



  return (

    //Personal Details Section
    <div style={{width: '100%', display:'flex', flexDirection: 'column', marginTop: '5.5%'}}>
      {loader &&
          <div className="spinner-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <MutatingDots
            height="80"
            width="80"
            radius="9"
            color="green"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      }
        <h2 style={{marginLeft: '20px'}}>Create User ID</h2>
        <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select Company  
          </label>
          <input value={company} className='form-control' disabled></input>
          
          
        </div><br></br>

        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            FullName
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
            Username
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
            Mobile No.
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
            Installation Address
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
            Select ISP  
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
          
        </div><br></br>
      
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

{/* Field Details Section */}
      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Field & Fiber Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Connected FMS  
          </label>
          <select onChange={(e) => {
            const selectfms = e.target.value;

            setConnectedFMS(selectfms);


            const selectedFMSObj = arrayfms.find(fms => fms.fmsname === selectfms);
            if(selectedFMSObj){
              setMaxPort(selectedFMSObj.fmsmaxport);
            }else{
              setMaxPort(0)
            }

          }} className="form-select" id="validationCustom04" required>s
            <option value="">  
              Choose...
            </option>
            {
              arrayfms.length > 0 ? (
                arrayfms.map((fms, index) => (
                  <option key={index} value={fms.fmsname}>{fms.fmsname}</option>
                ))
              ) : (
                <option value=''>No FMS Available</option>
              )
            }
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Connected Port No.
          </label>
          <div className="input-group has-validation">
            <input
            onChange={(e) =>{
              const selectport = e.target.value;

              if(selectport > +maxport){
                toast.error('Port No. Not Found!', {
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: false,
                  draggable: true,
                  progress: undefined,
                });
                setConnectedPortNo(0);
                
              }else{
                setConnectedPortNo(selectport);
              }
            }}
            
              type="number"
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label  className="form-label">
            Connection Power Info
          </label>
          <select onChange={(e) => setConnectionPowerInfo(e.target.value)} className="form-select" id="validationCustom04" required>s
            <option value="">  
              Choose...
            </option>
            <option>Huawei OLT</option>
            <option>Syrotech OLT</option>
            <option>Secureye OLT</option>
            <option>Richardlink OLT</option>
          </select>
          </div>

          <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Unique JC No.
          </label>
          <div className="input-group has-validation">
            <input
            onChange={(e) => setUniqueJCNo(e.target.value)}
              type="text"
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Fiber Core No.
          </label>
          <div className="input-group has-validation">
            <input
            onChange={(e) => setFiberCoreNo(e.target.value)}
              maxLength={1}
              type="numbers"
              className="form-control"
              
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            {/*Create Documents Upload Section  */}
            </div>
          <div className="valid-feedback">Looks good!</div>
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
