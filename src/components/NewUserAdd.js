import React, {useState, useEffect} from "react";
import {api, db, storage} from '../FirebaseConfig'
import {  uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";
import { ref, set, update } from "firebase/database";
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

  const [category, setCategory] = useState('All');
  const [deviceMaker, setDeviceMaker] = useState('All');
  const [filterDevice, setFilterDevice] = useState([]);
  const [deviceSerialNumber, setDeviceSerialNumber] = useState({
    serial:'',
    mac:''
  });



  // Documents
  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [cafDocuments, setCafDocuments] = useState(null);

  //Broadband Plan Array for Fetching Data
  const [arraycolony, setArraycolony] = useState([]);
  const [arrayplan, setArrayplan] = useState([]);
  const [arrayisp, setArrayisp] = useState([]);
  const [arrayprovider, setArrayProvider] = useState([]);
  const [arraydevice, setArraydevice] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [arraymaker, setArrayMaker] = useState([]);

  const [planDuration, setPlanDuration] = useState(0); // Duration value from Firebase
  const [durationUnit, setDurationUnit] = useState(''); 


  const [planData, setPlanData] = useState({
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
    plancode:'',
    installby:'',
    leadby:''
  });
  const [arrayuser, setArrayUser] = useState([]);

  const [filterPlans, setFilterPlans] = useState([]);

  const [loader, setLoader] = useState(false);

  const ledgerkey = Date.now();



  useEffect(() => {
    initialData();
  }, []); 

  const initialData = async() => {
    try{
      const [responsePlan, responseColony, responseUsers] = await Promise.all([
        axios.get(api+"/master/Broadband Plan"),
        axios.get(api+"/master/Colonys?data=colony"),
        axios.get(api+'/users')
      ]);
  
      if(responsePlan.status !== 200 || responseColony.status !== 200 || responseUsers.status !== 200){
        return;
      }
  
      const colonyData = responseColony.data;
      if(colonyData){
        setArraycolony(colonyData);
      }
  
      const planData = responsePlan.data;
      if(planData){
        const array = [];
        Object.keys(planData).forEach((key) => {
          const plan = planData[key];
          const planKey = key;

          array.push({...plan, planKey});
        });
        const isp = [...new Set(array.map((data) => data.isp))];
        const provider = [...new Set(array.map((data) => data.provider))];
        setArrayisp(isp);
        setArrayProvider(provider);
        setArrayplan(array);
      }

      const userData = responseUsers.data;
      if(userData){
        const array = [];
        Object.keys(userData).forEach((key) => {
          const user = userData[key];

          const name = user.FULLNAME;
          const mobile = user.MOBILE;
          array.push({name, mobile});
        });
        setArrayUser(array);
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

    if(fullName === '' || username === '' || mobileNo === '' || company === '' || installationAddress === '' || conectiontyp === '' || isp === '' || deviceSerialNumber.serial === ''){
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
            planName:planData.planname,
            planAmount,
            securityDeposit,
            refundableAmount,
            activationDate: activationDate,
            expiryDate: expiryDate,
            conectiontyp: conectiontyp,
            dueAmount: Number(planAmount) + Number(securityDeposit),
            bandwidth:planData.bandwidth,
            provider:planData.provider
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
          installedby:planData.installby,
          leadby:planData.leadby
        };
        
        const ledgerdata = {
            type:'Inventory',
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
          deviceSerialNumber : deviceSerialNumber.serial,
          macaddress: deviceSerialNumber.mac,
          remarks: securityDeposit === '0' || null ? 'Free to Use' : 'Device On Security',
          amount: securityDeposit,
          status: 'Activated',
          modifiedby: localStorage.getItem('Name'),
          ledgerkey: onekey
        }

        const updateDevice = {
          status:userKey
        }


  
        // Add to Firestore
        await update(ref(db, `Subscriber/${userKey}`), userData);
        await update(ref(db, `Inventory/${deviceSerialNumber.mac}`), updateDevice);
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
  const getDevices = async(company) => {
    try{

      const deviceResponse = await axios.get(api+`/inventory/free?company=${company}`);

      if(deviceResponse.status !== 200){
        console.log(deviceResponse.status)
        return;
      }

      const data = deviceResponse.data;
      if(data){
        setArraydevice(data);

        const arraycategory = [...new Set(data.map((data) => data.devicecategry))];
        const arraymaker = [...new Set(data.map((data) => data.makername))];

        setArrayCategory(arraycategory);
        setArrayMaker(arraymaker);

      }

    }catch(e){
      console.log(e);
    }
  }


  useEffect(() => {
    let deviceFilter = arraydevice;

    if(category !== 'All'){
      deviceFilter = deviceFilter.filter((device) => device.devicecategry === category);
    }

    if(deviceMaker !== 'All'){
      deviceFilter = deviceFilter.filter((device) => device.makername === deviceMaker);
    }

    setFilterDevice(deviceFilter);
  }, [category, deviceMaker]);

  useEffect(() => {
    let filterArray = arrayplan;

    if(planData.provider !== 'All'){
      filterArray = filterArray.filter((data) => data.provider === planData.provider);
    }

    if(planData.isp !== 'All'){
      filterArray = filterArray.filter((data) => data.isp === planData.isp);
    }

    setFilterPlans(filterArray);

  }, [planData.provider, planData.isp])
  



  return (
    
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


            getDevices(selectedColonyObj.companyname);

            
          }} className="form-select" id="validationCustom04" required>
            <option>Choose...</option>
          {arraycolony.length > 0 ? (
              arraycolony.map((colony, index) => (
                <option key={index} value={colony.colonyname}>
                  {colony.colonyname}
                </option>
              ))
            ) : (
              <option value="">No Colony Availabale</option>
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
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Select ISP *
          </label>
          <select onChange={(e) => setPlanData({
            ...planData,
            isp:e.target.value
          })} className="form-select" id="validationCustom04" required>s
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
          
        </div>

        <div className="col-md-2">
          <label className='form-label'>Provider Name</label>
          <select onChange={(e) => setPlanData({
            ...planData,
            provider:e.target.value
          })} className='form-select'>
            <option value=''>Choose...</option>
            {
              arrayprovider.map((data, index) => (
                <option key={index} value={data}>{data}</option>
              ))
            }
          </select>

        </div>
      
        <div className="col-md-3">
          <label htmlFor="validationCustom01" className="form-label">
            Plan Name
          </label>
          <select onChange={(e) => {
            const selectedPlanName = e.target.value;
          
            // Find the selected plan's amount
            const selectedPlanObj = arrayplan.find(plan => plan.planKey === selectedPlanName);
            if (selectedPlanObj) {
              setPlanAmount(selectedPlanObj.planamount);
              const periodtyp = selectedPlanObj.planperiod;
              const periodtime = selectedPlanObj.periodtime;

              setPlanData({
                ...planData,
                plancode:selectedPlanName,
                bandwidth:selectedPlanObj.bandwidth,
                provider:selectedPlanObj.provider,
                isp:selectedPlanObj.isp,
                planname:selectedPlanObj.planname
              })

              setPlanDuration(periodtime);
              setDurationUnit(periodtyp);

              updateExpirationDate(activationDate, periodtime, periodtyp);
             } else {
              setPlanAmount("");
            }

            
          }}
          
          className="form-select" id="validationCustom04" required>
            <option>Choose...</option>
          {filterPlans.length > 0 ? (
              filterPlans.map((plan, index) => (
                <option key={index} value={plan.planKey}>
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
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Select Device Maker  
          </label>
          <select onChange={(e) => setDeviceMaker(e.target.value)} className="form-select" id="validationCustom04" required>s
            <option value="All">  
              Choose...
            </option>
            {
              arraymaker.length > 0 ? (
                arraymaker.map((devicename, index) => (
                  <option key={index} value={devicename}>{devicename}</option>
                ))
              ) : (
                <option value=''>No Maker Available</option>
              )
            }
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div>


        <div className="col-md-2">
          <label className="form-label">Select Category</label>
          <select onChange={(e) => setCategory(e.target.value)} className="form-select">
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


        <div className="col-md-2">
          <label className="form-label">Search Serial No or MAC Address *</label>
          <input className="form-control" list="data" type="text"></input>
          <datalist id="data">
            {
              filterDevice.map((data, index) => (
                <option key={index} value={data.macno}>{data.serialno + " : " + data.macno}</option>
              ))
            }
          </datalist>

        </div>

        <div className='col-md-2'>
          <label className="form-label">Installation By *</label>
          <select onChange={(e) => setPlanData({
            ...planData,
            installby:e.target.value
          })} className="form-select">
            <option value=''>Choose...</option>
            {
              arrayuser.map((data, index) => (
                <option key={index} value={data.name}>{data.name}</option>
              ))
            }
          </select>
        </div>

        <div className='col-md-2'>
          <label className="form-label">Lead By *</label>
          <select onChange={(e) => setPlanData({
            ...planData,
            leadby:e.target.value
          })} className="form-select">
            <option value=''>Choose...</option>
            {
              arrayuser.map((data, index) => (
                <option key={index} value={data.name}>{data.name}</option>
              ))
            }
          </select>
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
