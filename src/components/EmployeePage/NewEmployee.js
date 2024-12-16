import React, {useEffect, useState} from 'react'
import './EmpCSS.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../../FirebaseConfig'
import { set, ref, get, onValue } from 'firebase/database';
import { useNavigate } from 'react-router-dom';




export default function NewEmployee() {

  const navigate = useNavigate();


  const [empData, setEmpData] = useState({
    FULLNAME: '',
    MOBILE: '',
    GMAIL: '',
    ADDRESS: '',
    AADHAR: '',
    DRIVING: '',
    PAN: '',
    BANKNAME: '',
    ACCOUNTNO: '',
    IFSC: '',
    ACCOUNTNAME: '',
    UPI: '',
    INTIME_H: '',
    INTIME_M: '',
    OUTTIME_H: '',
    OUTTIME_M: '',
    MARKING_OFFICE: '',
    DESIGNATION: '',
    USERTYPE: '',
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  

  const [arrayoffice, setArrayOffice] = useState([]);
  const [arraydesignation, setArraydesignation] = useState([]);

      //User Permission Data
      const [customerpermission, setCustomerPermission] = useState({
        VIEW_CUSTOMER: false,
        ADD_CUSTOMER: false,
        RENEW_PLAN: false,
        CHANGE_PLAN: false,
        EDIT_C_PLAN: false,
        EDIT_C_INFO: false,
        CREATE_TICKET: false,
        CLOSE_TICKET: false,
        REASSING_TICKET: false,
        
      });
  
      const [masterpermission, setMasterPermission] = useState({
        ADD_PLAN: false,
        ADD_TICKET_CONCERNS: false,
        ADD_DEVICE_MAKER: false,
        ADD_ISP: false,
        ADD_DESIGNATION: false,
        ADD_COMPANY: false,
        ADD_COLONY: false,
        ADD_DEBIT_CREDIT_CONCERN: false,
  
      });
  
  
      const [leadpermission, setLeadPermission] = useState({
        ADD_LEAD: false,
        CANCEL_LEAD: false,
        EDIT_LEAD: false,
        CONVERT_TO_LEAD: false
      });
  
  
      const [paymentpermission, setPaymentPermission] = useState({
        COLLECT_PAYMENT: false,
        PAYMENT_AUTHORIZATION: false,
        EDIT_PAYMENT: false,
        CREATE_DEBIT: false,
        CREATE_CREDIT: false,
        DOWNLOAD_INVOICE: false
      });
  
      const [networkpermission, setNetworkPermission] = useState({
        VIEW_RACK: false,
        UPDATE_RACK: false,
        ADD_JC: false,
        ADD_RACK_DEVICE: false
      });
  
  
      const [attendencepermission, setAttendencePermission] = useState({
        MARK_ATTENDENCE: false,
        MARK_ANYWHERE: false,
        VIEW_ATTENDENCE: false
      });
  
  
      const [payoutpermission, setPayoutPermission] = useState({
        VIEW_PAYOUT: false
      });
  
  
      const [messagepermission,setMessagePermission] = useState({
        MSG_DUE: false,
        MSG_EXPIRING: false,
        MSG_EXPIRED: false,
        MSG_BULK: false,
        MSG_PROMOTIONAL: false
      });
  
  
      const [inventorypermission, setInventoryPermission] = useState({
        VIEW_INVENTORY: false,
        CHANGE_DEVICE_STATUS: false,
        ASSIGN_DEVICE: false,
        ADD_DEVICE: false
      });
  
  
      const [employeepermission, setEmployeePermission] = useState({
        VIEW_EMP: false,
        EDIT_EMP: false,
        EDIT_EMP_PERMISSION: false,
        ADD_EMP: false
      });
  
  
      const handleCustomerPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(customerpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setCustomerPermission(updatedPermissions);
      }
  
      const handleMasterPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(masterpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setMasterPermission(updatedPermissions);
      }
  
      const handleLeadPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(leadpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setLeadPermission(updatedPermissions);
      }
  
  
      const handlePaymentPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(paymentpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setPaymentPermission(updatedPermissions);
      }
  
      const handleNetworkPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(networkpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setNetworkPermission(updatedPermissions);
      }
  
  
      const handleAttendencePermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(attendencepermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setAttendencePermission(updatedPermissions);
      }
  
      const handlePayoutPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(payoutpermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setPayoutPermission(updatedPermissions);
      }
  
      const handleMessagingPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(messagepermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setMessagePermission(updatedPermissions);
      }
  
  
      const handleInventotyPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(inventorypermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setInventoryPermission(updatedPermissions);
      }
  
  
      const handleEmpPermission = (e) => {
        const isChecked = e.target.checked;
        const updatedPermissions = Object.keys(employeepermission).reduce((acc, key) => {
          acc[key] = isChecked; // Set all permissions to the checkbox's checked state
          return acc;
        }, {});
        setEmployeePermission(updatedPermissions);
      }
  
  
  
      const handleCustomerIndividualChange = (e) => {
        const { name, checked } = e.target;
        setCustomerPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handleMasterIndividualChange = (e) => {
        const { name, checked } = e.target;
        setMasterPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handleLeadIndividualChange = (e) => {
        const { name, checked } = e.target;
        setLeadPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
      const handlePaymentIndividualChange = (e) => {
        const { name, checked } = e.target;
        setPaymentPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handleNetworkIndividualChange = (e) => {
        const { name, checked } = e.target;
        setNetworkPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
      const handleAttendenceIndividualChange = (e) => {
        const { name, checked } = e.target;
        setAttendencePermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handlePayoutIndividualChange = (e) => {
        const { name, checked } = e.target;
        setPayoutPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handleMessageIndividualChange = (e) => {
        const { name, checked } = e.target;
        setMessagePermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
  
      const handleInventoryIndividualChange = (e) => {
        const { name, checked } = e.target;
        setInventoryPermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };
  
      const handleeEmployeeIndividualChange = (e) => {
        const { name, checked } = e.target;
        setEmployeePermission((prev) => ({
          ...prev,
          [name]: checked, // Update only the specific checkbox state
        }));
      };


      const allData = {
        ...empData,
        customerpermission: {...customerpermission},
        masterpermission: {...masterpermission},
        leadpermission: {...leadpermission},
        paymentpermission: {...paymentpermission},
        networkpermission: {...networkpermission},
        attendencepermission: {...attendencepermission},
        payoutpermission: {...payoutpermission},
        messagepermission: {...messagepermission},
        inventorypermission: {...inventorypermission},
        employeepermission: {...employeepermission}
      }


      const AddNewUser = async() => {
        const userRef = ref(db, `users/${empData.MOBILE}`);
        const userKey = await get(userRef);

        if(userKey.exists()){
          const name = userKey.val().FULLNAME;
          alert("That Mobile Number is Already Registere With " + name);
          return;
        }

        await set(userRef, allData).then(() => {
          alert("User Added Succesfully")
          navigate(-1);
        });
      }


  

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
              <input className='form-control' type='text' name='FULLNAME' onChange={handleChange}></input>
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
              name='MOBILE'
              onChange={handleChange}
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
                <input onChange={handleChange} name='GMAIL' type='mail' className='form-control' aria-describedby='inputGroupPrepend'></input>
              </div>
            </div>


            <div className='col-md-3'>
              <label className='form-label'>Employee Address</label>
              <input onChange={handleChange} name='ADDRESS' className='form-control' type='text'></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Date Of Birth</label>
              <input name='DOB' type='date' onChange={handleChange} className='form-control' ></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Date Of Joining</label>
              <input className='form-control' type='date' name='DOJ' onChange={handleChange}></input>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Employee Designation</label>
              <select name='DESIGNATION' onChange={handleChange} className='form-select'>
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
            <input onChange={handleChange} name='AADHAR' type='numbers' className='form-control' maxLength={16} required></input>
              <input type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>


          <div className='col-md-2'>
            <label className='form-label'>Driving License No.</label>
            <input onChange={handleChange} name='DRIVING' type='text' className='form-control' required></input>
              <input type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>PAN Card</label>
            <input onChange={handleChange} name='PAN' type='text' className='form-control' required></input>
              <input type="file" className="form-control mt-3" id="inputGroupFile03"  aria-label="Upload"></input>
          </div>
        </form>
      </div>

      <h4 style={{borderBottom:'2px solid blue', marginTop:'30px'}}>Accounts & Salary Details</h4>
      <div>
        <form className='row g-3'>
          <div className='col-md-3'>
            <label className='form-label'>Employee Bank Name</label>
            <input onChange={handleChange} name='BANKNAME' className='form-control' type='text'></input>
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Employee Account No.</label>
            <input onChange={handleChange} name='ACCOUNTNO' className='form-control' type='number'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>IFSC Code Of Bank</label>
            <input onChange={handleChange} name='IFSC' className='form-control'></input>
          </div>

          <div className='col-md-3'>
            <label className='form-label'>Account Holder Name</label>
            <input onChange={handleChange} name='ACCOUNTNAME' className='form-control'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>UPI ID</label>
            <input onChange={handleChange} name='UPI' className='form-control'></input>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Employee In Time in Office *</label>
            <div className='input-group'>
              <input onChange={handleChange} name='INTIME_H' className='form-control' placeholder='Hours' maxLength={2}></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input onChange={handleChange} name='INTIME_M' className='form-control' placeholder='Minutes' maxLength={2}></input>
            </div>
          </div>


          <div className='col-md-2'>
            <label className='form-label'>Employee Out Time From Office</label>
            <div className='input-group'>
              <input onChange={handleChange} name='OUTTIME_H' className='form-control' placeholder='Hours' maxLength={2}></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input onChange={handleChange} name='OUTTIME_M' className='form-control' placeholder='Minutes' maxLength={2}></input>
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Select Attendence Marking Location</label>
            <select onChange={handleChange} name='MARKING_OFFICE' className='form-select'>
              
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

          <div className='col-md-2'>
            <label className='form-label'>User Type</label>
            <div className='input-group'>
            <select onChange={handleChange} name='USERTYPE' className='form-select'>
              <option value="">Choose...</option>
              <option value="mobile">Mobile</option>
              <option value="web">Web</option>
            </select>
            </div>

          </div>
        </form>
      </div>

      <h4 style={{borderBottom:'2px solid blue', marginTop:'30px'}}>Employee Permissions And Authorization</h4>
                <div className='mt-2 ms-2'>
                  <div className='d-flex'>
                  <h6 for='customerpermission'>Customer Permissions</h6>
                  <input checked={Object.values(customerpermission).every((val) => val)} onChange={handleCustomerPermission} className='form-check-input ms-2' type='checkbox' id='customerpermission' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_CUSTOMER' onChange={handleCustomerIndividualChange} checked={customerpermission.VIEW_CUSTOMER} className='form-check-input' type='checkbox' id='customerview' ></input>
                    <label className='form-check-label' for='customerview'>View Customer</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_CUSTOMER' onChange={handleCustomerIndividualChange} checked={customerpermission.ADD_CUSTOMER} className='form-check-input' type='checkbox' id='addcustomer' ></input>
                    <label className='form-check-label' for='addcustomer'>Add Customer</label>
                  </div>


                  <div className='form-check form-check-inline col-md-2'>
                    <input name='RENEW_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.RENEW_PLAN} className='form-check-input' type='checkbox' id='renewplan' ></input>
                    <label className='form-check-label' for='renewplan'>Renew Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CHANGE_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.CHANGE_PLAN} className='form-check-input' type='checkbox' id='changeplan' ></input>
                    <label className='form-check-label' for='changeplan'>Change Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_C_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.EDIT_C_PLAN} className='form-check-input' type='checkbox' id='editcustomerplan' ></input>
                    <label className='form-check-label' for='editcustomerplan'>Edit Customer Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_C_INFO' onChange={handleCustomerIndividualChange} checked={customerpermission.EDIT_C_INFO} className='form-check-input' type='checkbox' id='editbasicinfo' ></input>
                    <label className='form-check-label' for='editbasicinfo'>Edit Customer Basic Info</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.CREATE_TICKET} className='form-check-input' type='checkbox' id='addticket' ></input>
                    <label className='form-check-label' for='addticket'>Create New Ticket</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CLOSE_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.CLOSE_TICKET} className='form-check-input' type='checkbox' id='closeticket' ></input>
                    <label className='form-check-label' for='closeticket'>Close Ticket</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='REASSING_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.REASSING_TICKET} className='form-check-input' type='checkbox' id='reassignticket' ></input>
                    <label className='form-check-label' for='reassignticket'>Re-Assign Ticket</label>
                  </div>

                  
                  <div className='d-flex mt-3'>
                  <h6>Master Permissions</h6>
                  <input checked={Object.values(masterpermission).every((val) => val)} onChange={handleMasterPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_PLAN' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_PLAN} className='form-check-input' type='checkbox' id='addnewplan' ></input>
                    <label className='form-check-label' for='addnewplan'>Add New Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_TICKET_CONCERNS' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_TICKET_CONCERNS} className='form-check-input' type='checkbox' id='addconcerns' ></input>
                    <label className='form-check-label' for='addconcerns'>Add Ticket Concerns</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEVICE_MAKER' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DEVICE_MAKER} className='form-check-input' type='checkbox' id='adddevicemaker' ></input>
                    <label className='form-check-label' for='adddevicemaker'>Add Device Maker</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_ISP' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_ISP} className='form-check-input' type='checkbox' id='addisp' ></input>
                    <label className='form-check-label' for='addisp'>Add ISP</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DESIGNATION' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DESIGNATION} className='form-check-input' type='checkbox' id='adddesignation' ></input>
                    <label className='form-check-label' for='adddesignation'>Add Designation</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_COMPANY' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_COMPANY} className='form-check-input' type='checkbox' id='addcompany' ></input>
                    <label className='form-check-label' for='addcompany'>Add Company</label>
                  </div>


                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_COLONY' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_COLONY} className='form-check-input' type='checkbox' id='addcolony' ></input>
                    <label className='form-check-label' for='addcolony'>Add Colony</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEBIT_CREDIT_CONCERN' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DEBIT_CREDIT_CONCERN} className='form-check-input' type='checkbox' id='adddebitandcredit' ></input>
                    <label className='form-check-label' for='adddebitandcredit'>Add Debit/Credit Concern</label>
                  </div>

    

                  <div className='d-flex mt-3'>
                  <h6>Leads Permissions</h6>
                  <input checked={Object.values(leadpermission).every((val) => val)} onChange={handleLeadPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.ADD_LEAD} className='form-check-input' type='checkbox' id='addlead' ></input>
                    <label className='form-check-label' for='addlead'>Add New Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CANCEL_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.CANCEL_LEAD} className='form-check-input' type='checkbox' id='cancellead' ></input>
                    <label className='form-check-label' for='cancellead'>Cancel Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.EDIT_LEAD} className='form-check-input' type='checkbox' id='editlead' ></input>
                    <label className='form-check-label' for='editlead'>Edit Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CONVERT_TO_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.CONVERT_TO_LEAD} className='form-check-input' type='checkbox' id='convertlead' ></input>
                    <label className='form-check-label' for='convertlead'>Convert Enquiry to Lead</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Payment and Authorization Permissions</h6>
                  <input checked={Object.values(paymentpermission).every((val) => val)} onChange={handlePaymentPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='COLLECT_PAYMENT' onChange={handlePaymentIndividualChange} checked={paymentpermission.COLLECT_PAYMENT} className='form-check-input' type='checkbox' id='collectpayment' ></input>
                    <label className='form-check-label' for='collectpayment'>Collect Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='PAYMENT_AUTHORIZATION' onChange={handlePaymentIndividualChange} checked={paymentpermission.PAYMENT_AUTHORIZATION} className='form-check-input' type='checkbox' id='authorize' ></input>
                    <label className='form-check-label' for='authorize'>Payment Authorization</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_PAYMENT' onChange={handlePaymentIndividualChange} checked={paymentpermission.EDIT_PAYMENT} className='form-check-input' type='checkbox' id='editpayment' ></input>
                    <label className='form-check-label' for='editpayment'>Edit Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_DEBIT' onChange={handlePaymentIndividualChange} checked={paymentpermission.CREATE_DEBIT} className='form-check-input' type='checkbox' id='createdebit' ></input>
                    <label className='form-check-label' for='createdebit'>Create Debit Note</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_CREDIR' onChange={handlePaymentIndividualChange} checked={paymentpermission.CREATE_CREDIT} className='form-check-input' type='checkbox' id='createcredit' ></input>
                    <label className='form-check-label' for='createcredit'>Create Credit Note</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='DOWNLOAD_INVOICE' onChange={handlePaymentIndividualChange} checked={paymentpermission.DOWNLOAD_INVOICE} className='form-check-input' type='checkbox' id='downloadinvoice' ></input>
                    <label className='form-check-label' for='downloadinvoice'>Download Invoice</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Network and Rack Permissions</h6>
                  <input checked={Object.values(networkpermission).every((val) => val)} onChange={handleNetworkPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_RACK' onChange={handleNetworkIndividualChange} checked={networkpermission.VIEW_RACK} className='form-check-input' type='checkbox' id='viewrack' ></input>
                    <label className='form-check-label' for='viewrack'>View Network Rack</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='UPDATE_RACK' onChange={handleNetworkIndividualChange} checked={networkpermission.UPDATE_RACK} className='form-check-input' type='checkbox' id='updaterack' ></input>
                    <label className='form-check-label' for='updaterack'>Update Rack Data</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='AADD_JC' onChange={handleNetworkIndividualChange} checked={networkpermission.ADD_JC} className='form-check-input' type='checkbox' id='addjcbox' ></input>
                    <label className='form-check-label' for='addjcbox'>Add Field JC</label>
                  </div>


                  <div className='d-flex mt-3'>
                  <h6>Attendence Permissions</h6>
                  <input checked={Object.values(attendencepermission).every((val) => val)} onChange={handleAttendencePermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MARK_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.MARK_ATTENDENCE} className='form-check-input' type='checkbox' id='markattendence' ></input>
                    <label className='form-check-label' for='markattendence'>Mark Attendence</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MARK_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.MARK_ANYWHERE} className='form-check-input' type='checkbox' id='markanywhere' ></input>
                    <label className='form-check-label' for='markanywhere'>Mark From Anywhere</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.VIEW_ATTENDENCE} className='form-check-input' type='checkbox' id='viewattendence' ></input>
                    <label className='form-check-label' for='viewattendence'>View Attendence</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Payout Permissions</h6>
                  <input checked={Object.values(payoutpermission).every((val) => val)} onChange={handlePayoutPermission} className='form-check-input ms-2' type='checkbox' ></input>

                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_PAYOUT' onChange={handlePayoutIndividualChange} checked={payoutpermission.VIEW_PAYOUT} className='form-check-input' type='checkbox' id='viewpayout' ></input>
                    <label className='form-check-label' for='viewpayout'>View Payout Info</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Messaging Permissions</h6>
                  <input checked={Object.values(messagepermission).every((val) => val)} onChange={handleMessagingPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_DUE' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_DUE} className='form-check-input' type='checkbox' id='duemessage' ></input>
                    <label className='form-check-label' for='duemessage'>Message for Due Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_EXPIRING' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_EXPIRING} className='form-check-input' type='checkbox' id='expiringmessage' ></input>
                    <label className='form-check-label' for='expiringmessage'>Expiring Message</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_PROMOTIONAL' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_PROMOTIONAL} className='form-check-input' type='checkbox' id='promotionalmessage' ></input>
                    <label className='form-check-label' for='promotionalmessage'>Send Promotional Message</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_BULK' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_BULK} className='form-check-input' type='checkbox' id='bulkmessage' ></input>
                    <label className='form-check-label' for='bulkmessage'>Send Bulk Message</label>
                  </div>



                  <div className='d-flex mt-3'>
                  <h6>Inventory Permissions</h6>
                  <input checked={Object.values(inventorypermission).every((val) => val)} onChange={handleInventotyPermission} className='form-check-input ms-2' type='checkbox' ></input>

                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_INVENTORY' onChange={handleInventoryIndividualChange} checked={inventorypermission.VIEW_INVENTORY} className='form-check-input' type='checkbox' id='viewinventory' ></input>
                    <label className='form-check-label' for='viewinventory'>View Inventory</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CHANGE_DEVICE_STATUS' onChange={handleInventoryIndividualChange} checked={inventorypermission.CHANGE_DEVICE_STATUS} className='form-check-input' type='checkbox' id='changestatus' ></input>
                    <label className='form-check-label' for='changestatus'>Change Device Status</label>
                  </div>
                  
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ASSIGN_DEVICE' onChange={handleInventoryIndividualChange} checked={inventorypermission.ASSIGN_DEVICE} className='form-check-input' type='checkbox' id='assigndevice' ></input>
                    <label className='form-check-label' for='assigndevice'>Assign Device</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEVICE' onChange={handleInventoryIndividualChange} checked={inventorypermission.ADD_DEVICE} className='form-check-input' type='checkbox' id='adddevice' ></input>
                    <label className='form-check-label' for='adddevice'>Add New Device</label>
                  </div>


                  <div className='d-flex mt-3'>
                  <h6>Employee Managment Permissions</h6>
                  <input checked={Object.values(employeepermission).every((val) => val)} onChange={handleEmpPermission} className='form-check-input ms-2' type='checkbox' ></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.VIEW_EMP} className='form-check-input' type='checkbox' id='viewemployee' ></input>
                    <label className='form-check-label' for='viewemployee'>View Employee</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.EDIT_EMP} className='form-check-input' type='checkbox' id='editemployee' ></input>
                    <label className='form-check-label' for='editemployee'>Edit Employee</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_EMP_PERMISSION' onChange={handleeEmployeeIndividualChange} checked={employeepermission.EDIT_EMP_PERMISSION} className='form-check-input' type='checkbox' id='editpermission' ></input>
                    <label className='form-check-label' for='editpermission'>Edit Employee Permissions</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.ADD_EMP} className='form-check-input' type='checkbox' id='addemployee' ></input>
                    <label className='form-check-label' for='addemployee'>Add New Employee</label>
                  </div>
                </div>

      <button onClick={AddNewUser} className='btn btn-outline-success mt-5 mb-5'>Add New Employee</button>
    </div>
  )
}
