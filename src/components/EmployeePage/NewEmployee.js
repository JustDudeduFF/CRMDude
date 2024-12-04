import React, {useEffect, useState} from 'react'
import './EmpCSS.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../../FirebaseConfig'
import { set, ref, get, update, onValue } from 'firebase/database';




export default function NewEmployee() {
  const [selectedDate, setSelectedDate] = useState(new Date(1999, 0, 1));
  const [dateJoining, setDateJoining] = useState(new Date());
  const [fullname, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gmail, setGmail] = useState('');
  const [address, setAddress] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [driving, setDriving] = useState('');
  const [pan, setPAN] = useState('');
  const [bankname, setBankName] = useState('');
  const [accountno, setAccountNo] = useState('');
  const [ifsc, setIFSC] = useState('');
  const [accountname, setAccountName] = useState('');
  const [upi, setUPI] = useState('');
  const [intimeh, setInTimeH] = useState('');
  const [intimem, setInTimeM] = useState('');
  const [outtimeh, setOutTimeH] = useState('');
  const [outtimem, setOutTimeM] = useState('');
  const [markingoffice, setMarkingOffice] = useState('');
  const [designation, setDesignation] = useState('');
  const [usertype, setUserType] = useState('');
  const [companypermissions, setCompanyPermissions] = useState('');

  const [arrayoffice, setArrayOffice] = useState([]);
  const [arraydesignation, setArraydesignation] = useState([]);

  const [allowpaymentcollection, setAllowPaymentCollection] = useState(false);
  const [allowgeneratetickets, setAllowGenerateTickets] = useState(false);
  const [allowchangeplan, setAllowChangePlan] = useState(false);
  const [allowdashboardmodijication, setAllowDashboardModification] = useState(false);
  const [allowrenewal, setAllowRenewal] = useState(false);
  const [allowtransfertickets, setAllowTransferTickets] = useState(false);
  const [allowbackdateentries, setAllowBackdateEntries] = useState(false);
  const [allowinventry, setAllowinventry] = useState(false);


  

  useEffect(() => {
    const officeRef = ref(db, `Master/Offices`);
    const designationRef = ref(db, `Master/Designations`);

    const unsubscribeOffice = onValue(officeRef, (officeSnap) => {
      if (officeSnap.exists()) {
        const OfficeArray = [];
        officeSnap.forEach((ChildOffice) => {
          const officename = ChildOffice.key;
          OfficeArray.push(officename);
        });
        setArrayOffice(OfficeArray);
        console.log(OfficeArray);
      } else {
        toast.error('Please Add an Office Location', {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    });

    const unsubscribeDesignation = onValue(designationRef, (designationSnap) => {
      if (designationSnap.exists()) {
        const designationArray = [];
        designationSnap.forEach((Childdesignation) => {
          const designationname = Childdesignation.key;
          designationArray.push(designationname);
        });
        setArraydesignation(designationArray);
        console.log(designationArray);
      } else {
        toast.error('Please Add an designation Location', {
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
      unsubscribeOffice();       // Cleanup for office listener
      unsubscribeDesignation();  // Cleanup for designation listener
    };
  }, []); 

  const handleCheckboxChange = (label, value) => {
    if (label && typeof value !== 'undefined') {
      set(ref(db, `users/${mobile}/permissions/${label}`), value);
    } else {
      console.error("Error: Undefined label or value");
    }
  };


  const empdata = {
        fullname:fullname,
        mobile:mobile,
        gmail:gmail,
        designation: designation,
        address:address,
        dob: selectedDate,
        datejoining: dateJoining,
        aadhar:aadhar,
        driving:driving,
        pan:pan,
        bankname:bankname,
        accountno:accountno,
        ifsc:ifsc,
        accountname:accountname,
        upi:upi,
        intimeh:intimeh,
        intimem:intimem,
        outtimeh:outtimeh,
        outtimem:outtimem,
        markingoffice:markingoffice,
        usertype: usertype,
        companypermissions: companypermissions
  }
  
  const AddNewUser = async () => {

    const empRef = ref(db, `users/${mobile}`);
    const snapshot = await get(empRef);

    if(mobile === ''){
      toast.error('Mobile Field Never be Empty', {
        autoClose: 3000,
        hideProgressBar:false,
        closeOnClick:true,
        pauseOnHover:true,
        draggable:true,
        progress:undefined
      });
    }else{
      if(snapshot.hasChild('mobile')){
        const existempname = snapshot.val().fullname;
        toast.error(`${mobile} is Already Added as ${existempname}`, {
          
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined
        });
      }else{
        try{
          await update(ref(db, `users/${mobile}`), empdata);
          
          
          toast.success(`${fullname} is Added Succesfully!`, {
          
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          });
    
        }catch (error){
          toast.error({error}, {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
          })
        }
      }
    }

    

    

    

    
  }

  const changeAccountNo = (event) => {
    setAccountNo(event.target.value);
  }
  const changeIFSC = (event) => {
    setIFSC(event.target.value);
  }

  const changeUPI = (event) => {
    setUPI(event.target.value);
  }

  const changeInTimeH = (event) => {
    setInTimeH(event.target.value);
  }

  const changeIntimeM = (event) => {
    setInTimeM(event.target.value);
  }

  const changeAccountName = (event) => {
    setAccountName(event.target.value);
  }

  const changeOutTimeH = (event) => {
    setOutTimeH(event.target.value);
  }

  const changeOutTimeM = (event) => {
    setOutTimeM(event.target.value);
  }

  const changeMarkingOffice = (event) => {
    setMarkingOffice(event.target.value);
  }
  
  
  const changeGmail = (event) => {
    setGmail(event.target.value);
  }

  const changeAddress = (event) => {
    setAddress(event.target.value);
  }

  const changeAadhar = (event) => {
    setAadhar(event.target.value);
  }

  const changeDriving = (event) => {
    setDriving(event.target.value);
  }

  const changePAN = (event) => {
    setPAN(event.target.value);
  }

  const changeBankName = (event) => {
    setBankName(event.target.value);
  }

  const changeMobile = (event) => {
    setMobile(event.target.value);
  }

  const changeFullname = (event) => {
    setFullName(event.target.value);
  }

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <h4 style={{borderBottom:'2px solid blue'}}>
        Employee Personel Details
      </h4>
      <div >
        <form className='row g-3'>
            <div className='col-md-1'>
              <label className='form-label'>Employee Code</label>
              <input type='text' className='form-control' placeholder='Auto' readOnly></input>
            </div> 


            <div className='col-md-2'>
              <label className='form-label'>Employee FullName</label>
              <input className='form-control' type='text' onChange={changeFullname}></input>
            </div>

            <div className="col-md-2">
            <label className="form-label">
              Employee Mobile No.
            </label>
            <div className="input-group ">
              <span className="input-group-text">
                +91
              </span>
              <input
              onChange={changeMobile}
                maxLength={10}
                type="numbers"
                className="form-control"
                aria-describedby="inputGroupPrepend"
                required
              ></input>
              </div>
            </div>

            <ToastContainer/>

            <div className='col-md-2'>
              <label className='form-label'>Gmail Address</label>
              <div className='input-group'>
                <span className='input-group-text'>@</span>
                <input onChange={changeGmail} type='mail' className='form-control' aria-describedby='inputGroupPrepend'></input>
              </div>
            </div>


            <div className='col-md-3'>
              <label className='form-label'>Employee Address</label>
              <input onChange={changeAddress} className='form-control' type='text'></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Date Of Birth</label>
              <input type='date' value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className='form-control' ></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Date Of Joining</label>
              <input className='form-control' type='date' value={dateJoining} onChange={(event) => setDateJoining(event.target.value)}></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Employee Designation</label>
              <select onChange={(event) => setDesignation(event.target.value)} value={designation} className='form-select'>
              {arraydesignation.length > 0 ? (
              arraydesignation.map((designation, index) => (
                <option key={index} value={designation}>
                  {designation}
                </option>
              ))
            ) : (
              <option value="">No Designation Available</option>
            )}

              </select>

            </div>


        </form>
      </div>

      <h4 style={{borderBottom:'2px solid blue', marginTop:'30px'}}>Employee Documents</h4>
      <div>
        <form className='row g-3'>
          <div className='col-md-2'>
            <label className='form-label'>Aadhaar Card No.</label>
            <input type='numbers' className='form-control' maxLength={16} required></input>
              <input onChange={changeAadhar} type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>


          <div className='col-md-2'>
            <label className='form-label'>Driving License No.</label>
            <input type='text' className='form-control' required></input>
              <input onChange={changeDriving} type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>PAN Card</label>
            <input type='text' className='form-control' required></input>
              <input onChange={changePAN} type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>
        </form>
      </div>

      <h4 style={{borderBottom:'2px solid blue', marginTop:'30px'}}>Accounts & Salary Details</h4>
      <div>
        <form className='row g-3'>
          <div className='col-md-3'>
            <label className='form-label'>Employee Bank Name</label>
            <input onChange={changeBankName} className='form-control' type='text'></input>
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Employee Account No.</label>
            <input onChange={changeAccountNo} className='form-control' type='number'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>IFSC Code Of Bank</label>
            <input onChange={changeIFSC} className='form-control'></input>
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Account Holder Name</label>
            <input onChange={changeAccountName} className='form-control'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>UPI ID</label>
            <input onChange={changeUPI} className='form-control'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Employee In Time in Office *</label>
            <div className='input-group'>
              <input onChange={changeInTimeH} className='form-control' placeholder='Hours' maxLength={2}></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input onChange={changeIntimeM} className='form-control' placeholder='Minutes' maxLength={2}></input>
            </div>
          </div>


          <div className='col-md-2'>
            <label className='form-label'>Employee Out Time From Office</label>
            <div className='input-group'>
              <input onChange={changeOutTimeH} className='form-control' placeholder='Hours' maxLength={2}></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input onChange={changeOutTimeM} className='form-control' placeholder='Minutes' maxLength={2}></input>
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Select Attendence Marking Location</label>
            <select onChange={changeMarkingOffice} value={markingoffice} className='form-select'>
              
            {arrayoffice.length > 0 ? (
              arrayoffice.map((office, index) => (
                <option key={index} value={office}>
                  {office}
                </option>
              ))
            ) : (
              <option value="">No Offices Available</option>
            )}
              
            </select>
          </div>
        </form>
      </div>

      <h4 style={{borderBottom:'2px solid blue', marginTop:'30px'}}>Employee Permissions And Authorization</h4>
      <div>
        <form className='row g-3'>
          <div className='col-md-2'>
            <label className='form-label'>Select User Type</label>
            <select value={usertype} onChange={(event) => setUserType(event.target.value)} className='form-select'>
              <option>Choose...</option>
              <option>Mobile User</option>
              <option>Web User</option>
              <option>Both Web and Mobile User</option>
            </select>
          </div>



          <div className='col-md-2'>
            <label className='form-label'>Select Permissions</label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck1" checked={allowpaymentcollection} onChange={(event) => { const isChecked = event.target.checked; setAllowPaymentCollection(isChecked); handleCheckboxChange('paymentcollection', isChecked)}} autoComplete="off"></input>
            <label className="btn btn-outline-info" htmlFor="btncheck1">Allow Payment Collection</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck2" autoComplete="off" checked={allowrenewal} onChange={(event) => { const isChecked = event.target.checked; setAllowRenewal(isChecked); handleCheckboxChange('planrenewal', isChecked)}}></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck2">Allow Renewal</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck3" autoComplete="off" checked={allowgeneratetickets} onChange={(event) => { const isChecked = event.target.checked; setAllowGenerateTickets(isChecked); handleCheckboxChange('generatetickets', isChecked)}}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck3">Allow Generate Ticket</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck4" checked={allowtransfertickets} onChange={(event) => { const isChecked = event.target.checked; setAllowTransferTickets(isChecked); handleCheckboxChange('transfertickets', isChecked)}} autoComplete="off"></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck4">Allow Transfer Ticket</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck5" autoComplete="off" checked={allowchangeplan} onChange={(event) => { const isChecked = event.target.checked; setAllowChangePlan(isChecked); handleCheckboxChange('changeplan', isChecked)}}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck5">Allow Change Plan</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck6" autoComplete="off" checked={allowbackdateentries} onChange={(event) => { const isChecked = event.target.checked; setAllowBackdateEntries(isChecked); handleCheckboxChange('backdateentries', isChecked)}}></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck6">Allow BackDate Entries</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck7" autoComplete="off" checked={allowdashboardmodijication} onChange={(event) => { const isChecked = event.target.checked; setAllowDashboardModification(isChecked); handleCheckboxChange('dashboardmodification', isChecked)}}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck7">Allow DashBoard Modification</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck8" autoComplete="off" checked={allowinventry} onChange={(event) => { const isChecked = event.target.checked; setAllowinventry(isChecked); handleCheckboxChange('inventry', isChecked)}}></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck8">Allow Inventry</label>
            
            </div>
          </div>

        </form>
      </div>

      <button onClick={AddNewUser} className='btn btn-outline-success mt-5 mb-5'>Add New Employee</button>
    </div>
  )
}
