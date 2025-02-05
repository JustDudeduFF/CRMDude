import { get, ref, update, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


export default function EmpDetails() {
    const location = useLocation();
    const { mobile } = location.state || {};

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

    const [isEditing, setIsEditing] = useState(false);

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
      ROLLBACK_PLAN: false,
      RESEND_CODE: false
      
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
      DOWNLOAD_INVOICE: false,
      CANCEL_RECEIPT: false
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




    




    useEffect(() => {
        const getDetails = async () => {
            try {
                const empRef = ref(db, `users/${mobile}`);
                const snapshot = await get(empRef);

                if (snapshot.exists()) {
                  const userData = snapshot.val();
          
                  // Separate `empData` and `customerpermission` from the retrieved data
                  setEmpData({
                    FULLNAME: userData.FULLNAME || "",
                    MOBILE: userData.MOBILE || "",
                    GMAIL: userData.GMAIL || "",
                    ADDRESS: userData.ADDRESS || "",
                    AADHAR: userData.AADHAR || "",
                    DRIVING: userData.DRIVING || "",
                    PAN: userData.PAN || "",
                    BANKNAME: userData.BANKNAME || "",
                    ACCOUNTNO: userData.ACCOUNTNO || "",
                    IFSC: userData.IFSC || "",
                    ACCOUNTNAME: userData.ACCOUNTNAME || "",
                    UPI: userData.UPI || "",
                    INTIME_H: userData.INTIME_H || "",
                    INTIME_M: userData.INTIME_M || "",
                    OUTTIME_H: userData.OUTTIME_H || "",
                    OUTTIME_M: userData.OUTTIME_M || "",
                    MARKING_OFFICE: userData.MARKING_OFFICE || "",
                    DESIGNATION: userData.DESIGNATION || "",
                    USERTYPE: userData.USERTYPE || "",
                  });
          
                  setCustomerPermission({
                    VIEW_CUSTOMER: userData.customerpermission?.VIEW_CUSTOMER || false,
                    ADD_CUSTOMER: userData.customerpermission?.ADD_CUSTOMER || false,
                    RENEW_PLAN: userData.customerpermission?.RENEW_PLAN || false,
                    CHANGE_PLAN: userData.customerpermission?.CHANGE_PLAN || false,
                    EDIT_C_PLAN: userData.customerpermission?.EDIT_C_PLAN || false,
                    EDIT_C_INFO: userData.customerpermission?.EDIT_C_INFO || false,
                    CREATE_TICKET: userData.customerpermission?.CREATE_TICKET || false,
                    CLOSE_TICKET: userData.customerpermission?.CLOSE_TICKET || false,
                    REASSING_TICKET: userData.customerpermission?.REASSING_TICKET || false,
                    ROLLBACK_PLAN: userData.customerpermission?.ROLLBACK_PLAN || false,
                    RESEND_CODE: userData.customerpermission?.RESEND_CODE || false
                  });

                  setMasterPermission({
                    ADD_PLAN: userData.masterpermission?.ADD_PLAN || false,
                    ADD_TICKET_CONCERNS: userData.masterpermission?.ADD_TICKET_CONCERNS || false,
                    ADD_DEVICE_MAKER: userData.masterpermission?.ADD_DEVICE_MAKER || false,
                    ADD_ISP: userData.masterpermission?.ADD_ISP || false,
                    ADD_DESIGNATION: userData.masterpermission?.ADD_DESIGNATION || false,
                    ADD_COMPANY: userData.masterpermission?.ADD_COMPANY || false,
                    ADD_COLONY: userData.masterpermission?.ADD_COLONY || false,
                    ADD_DEBIT_CREDIT_CONCERN: userData.masterpermission?.ADD_DEBIT_CREDIT_CONCERN || false,
                  });

                  setLeadPermission({
                    ADD_LEAD: userData.leadpermission?.ADD_LEAD || false,
                    CANCEL_LEAD: userData.leadpermission?.CANCEL_LEAD || false,
                    EDIT_LEAD: userData.leadpermission?.EDIT_LEAD || false,
                    CONVERT_TO_LEAD: userData.leadpermission?.CONVERT_TO_LEAD || false
                  });

                  setPaymentPermission({
                    COLLECT_PAYMENT: userData.paymentpermission?.COLLECT_PAYMENT || false,
                    PAYMENT_AUTHORIZATION: userData.paymentpermission?.PAYMENT_AUTHORIZATION || false,
                    EDIT_PAYMENT: userData.paymentpermission?.EDIT_PAYMENT || false,
                    CREATE_DEBIT: userData.paymentpermission?.CREATE_DEBIT || false,
                    CREATE_CREDIT: userData.paymentpermission?.CREATE_CREDIT || false,
                    DOWNLOAD_INVOICE: userData.paymentpermission?.DOWNLOAD_INVOICE || false,
                    CANCEL_RECEIPT: userData.paymentpermission?.CANCEL_RECEIPT || false
                  });

                  setNetworkPermission({
                    VIEW_RACK: userData.networkpermission?.VIEW_RACK || false,
                    UPDATE_RACK: userData.networkpermission?.UPDATE_RACK || false,
                    ADD_JC: userData.networkpermission?.ADD_JC || false,
                    ADD_RACK_DEVICE: userData.networkpermission?.ADD_RACK_DEVICE || false
                  });

                  setAttendencePermission({
                    MARK_ATTENDENCE: userData.attendencepermission?.MARK_ATTENDENCE || false,
                    MARK_ANYWHERE: userData.attendencepermission?.MARK_ANYWHERE || false,
                    VIEW_ATTENDENCE: userData.attendencepermission?.VIEW_ATTENDENCE || false
                  });

                  setPayoutPermission({
                    VIEW_PAYOUT: userData.payoutpermission?.VIEW_PAYOUT || false
                  });

                  setMessagePermission({
                    MSG_DUE: userData.messagepermission?.MSG_DUE || false,
                    MSG_EXPIRING: userData.messagepermission?.MSG_EXPIRING || false,
                    MSG_EXPIRED: userData.messagepermission?.MSG_EXPIRED || false,
                    MSG_BULK: userData.messagepermission?.MSG_BULK || false,
                    MSG_PROMOTIONAL: userData.messagepermission?.MSG_PROMOTIONAL || false
                  });

                  setInventoryPermission({
                    VIEW_INVENTORY: userData.inventorypermission?.VIEW_INVENTORY || false,
                    CHANGE_DEVICE_STATUS: userData.inventorypermission?.CHANGE_DEVICE_STATUS || false,
                    ASSIGN_DEVICE: userData.inventorypermission?.ASSIGN_DEVICE || false,
                    ADD_DEVICE: userData.inventorypermission?.ADD_DEVICE || false
                  });

                  setEmployeePermission({
                    VIEW_EMP: userData.employeepermission?.VIEW_EMP || false,
                    EDIT_EMP: userData.employeepermission?.EDIT_EMP || false,
                    EDIT_EMP_PERMISSION: userData.employeepermission?.EDIT_EMP_PERMISSION || false,
                    ADD_EMP: userData.employeepermission?.ADD_EMP || false
                  });
                } else {
                  console.log("No data found for the specified user.");
                }


            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data', {
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
            }
        };

        getDetails();
    }, [mobile]);

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

    const handleSave = async () => {
      const userRef = ref(db, `users/${empData.MOBILE}`);
        await update(userRef, allData).then(() => {
          setIsEditing(false);
          toast.success('User Data Updated Succesfully', {
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined,
          });
    
        });
    };

    

    return (
        <>
            <div style={{height:'80vh', overflow:'hidden', overflowY:'auto', scrollbarWidth:'none'}} className='d-flex flex-column'>
              <div className='d-flex'>
              <h5 style={{flex:'1'}}>Personal Information</h5>
              <div className="d-flex justify-content-end mb-2">
                    {!isEditing ? (
                        <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
                    ) : (
                        <>
                            <button className="btn btn-success me-2" onClick={handleSave}>Save</button>
                            <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                        </>
                    )}
                </div>
              </div>
                
                
                <div className='shadow rounded border p-2 m-2'>
                    <form className='row g-3'>
                    <div className='col-md-1'>
                            <label className='form-label'>Emp Code</label>
                            <input className='form-control' readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Employee FullName</label>
                            <input name='FULLNAME' className='form-control' value={empData.FULLNAME} onChange={handleChange} readOnly={!isEditing}></input>
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
                                    value={empData.MOBILE}
                                    name='MOBILE'
                                    maxLength={10}
                                    type="numbers"
                                    className="form-control"
                                    aria-describedby="inputGroupPrepend"
                                    readOnly={!isEditing}
                                ></input>
                            </div>
                        </div>

                        <div className='col-md-4'>
                            <label className='form-label'>Employee Address</label>
                            <input className='form-control' value={empData.ADDRESS} name='ADDRESS' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-3'>
                            <label className='form-label'>Gmail Address</label>
                            <div className='input-group'>
                                <span className='input-group-text'>@</span>
                                <input value={empData.GMAIL} name='GMAIL' type='mail' onChange={handleChange} className='form-control' aria-describedby='inputGroupPrepend' readOnly={!isEditing}></input>
                            </div>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Employee Designation</label>
                            <select className='form-select'
                                  value={empData.DESIGNATION} 
                                  name='DESIGNATION'
                                  onChange={handleChange} 
                                  disabled={!isEditing}
                              >
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

                        <div className='col-md-2'>
                            <label className='form-label'>Joining Date</label>
                            <input className='form-control' type='date' value={empData.DOJ} name='DOJ' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>UserType</label>
                            <select className='form-select'
                                  value={empData.USERTYPE} 
                                  name='USERTYPE'
                                  onChange={handleChange} 
                                  disabled={!isEditing}
                              >
                                  <option value="">{empData.USERTYPE}</option>
                                  <option value="mobile">Admin</option>
                                  <option value="web">Web</option>
                              </select>
                            </div>

                            <div className='col-md-2'>
                              <label className='form-label'>Employee Intime</label>
                              <div className='input-group'>
                                <input className='form-control' onChange={handleChange} name='INTIME_H' value={empData.INTIME_H} readOnly={!isEditing}></input>
                                <span className='input-group-text'>:</span>
                                <input className='form-control' onChange={handleChange} name='INTIME_M' value={empData.INTIME_M} readOnly={!isEditing}></input>

                              </div>
                            </div>

                            <div className='col-md-2'>
                              <label className='form-label'>Employee OutTime</label>
                              <div className='input-group'>
                                <input className='form-control' onChange={handleChange} name='OUTTIME_H' value={empData.OUTTIME_H} readOnly={!isEditing}></input>
                                <span className='input-group-text'>:</span>
                                <input className='form-control' onChange={handleChange} name='OUTTIME_M' value={empData.OUTTIME_M} readOnly={!isEditing}></input>

                              </div>
                            </div>


                            

                            <div className='col-md-2'>
                              <label className='form-label'>Attendence Marking Location</label>
                              <select onChange={handleChange} value={empData.MARKING_OFFICE} name='MARKING_OFFICE' className='form-select' disabled={!isEditing}>
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

                    <h5 className='mt-4'>Documents Details</h5>
                    <div className='row g-3'>
                        <div className='col-md-2'>
                            <label className='form-label'>Aadhar Number</label>
                            <input className='form-control' value={empData.AADHAR} name='AADHAR' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Driving License</label>
                            <input className='form-control' value={empData.DRIVING} name='DRIVING' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Pan Card</label>
                            <input className='form-control' value={empData.PAN} name='PAN' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>
                    </div>

                    <h5 className='mt-4'>Bank Account Details</h5>
                    <div className='row g-3'>
                        <div className='col-md-2'>
                            <label className='form-label'>Bank Name</label>
                            <input className='form-control' value={empData.BANKNAME} name='BANKNAME' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Account No.</label>
                            <input className='form-control' value={empData.ACCOUNTNO} name='ACCOUNTNO' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>IFSC Code</label>
                            <input className='form-control' value={empData.IFSC} name='IFSC' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Account Holder</label>
                            <input className='form-control' value={empData.ACCOUNTNAME} name='ACCOUNTNAME' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>UPI ID</label>
                            <input className='form-control' value={empData.UPI} name='UPI' onChange={handleChange} readOnly={!isEditing}></input>
                        </div>
                    </div>
                    

                    
                </div>

                <h5 className='mt-4'>User Permissions</h5>
                <div className='container shadow p-3 rounded border mb-5'>
                  <div className='d-flex'>
                  <h6 for='customerpermission'>Customer Permissions</h6>
                  <input checked={Object.values(customerpermission).every((val) => val)} onChange={handleCustomerPermission} className='form-check-input ms-2' type='checkbox' id='customerpermission' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_CUSTOMER' onChange={handleCustomerIndividualChange} checked={customerpermission.VIEW_CUSTOMER} className='form-check-input' type='checkbox' id='customerview' disabled={!isEditing}></input>
                    <label className='form-check-label' for='customerview'>View Customer</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_CUSTOMER' onChange={handleCustomerIndividualChange} checked={customerpermission.ADD_CUSTOMER} className='form-check-input' type='checkbox' id='addcustomer' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addcustomer'>Add Customer</label>
                  </div>


                  <div className='form-check form-check-inline col-md-2'>
                    <input name='RENEW_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.RENEW_PLAN} className='form-check-input' type='checkbox' id='renewplan' disabled={!isEditing}></input>
                    <label className='form-check-label' for='renewplan'>Renew Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CHANGE_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.CHANGE_PLAN} className='form-check-input' type='checkbox' id='changeplan' disabled={!isEditing}></input>
                    <label className='form-check-label' for='changeplan'>Change Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_C_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.EDIT_C_PLAN} className='form-check-input' type='checkbox' id='editcustomerplan' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editcustomerplan'>Edit Customer Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_C_INFO' onChange={handleCustomerIndividualChange} checked={customerpermission.EDIT_C_INFO} className='form-check-input' type='checkbox' id='editbasicinfo' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editbasicinfo'>Edit Customer Basic Info</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.CREATE_TICKET} className='form-check-input' type='checkbox' id='addticket' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addticket'>Create New Ticket</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CLOSE_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.CLOSE_TICKET} className='form-check-input' type='checkbox' id='closeticket' disabled={!isEditing}></input>
                    <label className='form-check-label' for='closeticket'>Close Ticket</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='REASSING_TICKET' onChange={handleCustomerIndividualChange} checked={customerpermission.REASSING_TICKET} className='form-check-input' type='checkbox' id='reassignticket' disabled={!isEditing}></input>
                    <label className='form-check-label' for='reassignticket'>Re-Assign Ticket</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ROLLBACK_PLAN' onChange={handleCustomerIndividualChange} checked={customerpermission.ROLLBACK_PLAN} className='form-check-input' type='checkbox' id='rollbackplan'disabled={!isEditing} ></input>
                    <label className='form-check-label' for='rollbackplan'>Plan Rollback</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='RESEND_CODE' onChange={handleCustomerIndividualChange} checked={customerpermission.RESEND_CODE} className='form-check-input' type='checkbox' id='resendcode' disabled={!isEditing}></input>
                    <label className='form-check-label' for='resendcode'>Resend Code</label>
                  </div>

                  
                  <div className='d-flex mt-3'>
                  <h6>Master Permissions</h6>
                  <input checked={Object.values(masterpermission).every((val) => val)} onChange={handleMasterPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_PLAN' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_PLAN} className='form-check-input' type='checkbox' id='addnewplan' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addnewplan'>Add New Plan</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_TICKET_CONCERNS' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_TICKET_CONCERNS} className='form-check-input' type='checkbox' id='addconcerns' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addconcerns'>Add Ticket Concerns</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEVICE_MAKER' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DEVICE_MAKER} className='form-check-input' type='checkbox' id='adddevicemaker' disabled={!isEditing}></input>
                    <label className='form-check-label' for='adddevicemaker'>Add Device Maker</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_ISP' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_ISP} className='form-check-input' type='checkbox' id='addisp' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addisp'>Add ISP</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DESIGNATION' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DESIGNATION} className='form-check-input' type='checkbox' id='adddesignation' disabled={!isEditing}></input>
                    <label className='form-check-label' for='adddesignation'>Add Designation</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_COMPANY' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_COMPANY} className='form-check-input' type='checkbox' id='addcompany' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addcompany'>Add Company</label>
                  </div>


                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_COLONY' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_COLONY} className='form-check-input' type='checkbox' id='addcolony' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addcolony'>Add Colony</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEBIT_CREDIT_CONCERN' onChange={handleMasterIndividualChange} checked={masterpermission.ADD_DEBIT_CREDIT_CONCERN} className='form-check-input' type='checkbox' id='adddebitandcredit' disabled={!isEditing}></input>
                    <label className='form-check-label' for='adddebitandcredit'>Add Debit/Credit Concern</label>
                  </div>

    

                  <div className='d-flex mt-3'>
                  <h6>Leads Permissions</h6>
                  <input checked={Object.values(leadpermission).every((val) => val)} onChange={handleLeadPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.ADD_LEAD} className='form-check-input' type='checkbox' id='addlead' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addlead'>Add New Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CANCEL_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.CANCEL_LEAD} className='form-check-input' type='checkbox' id='cancellead' disabled={!isEditing}></input>
                    <label className='form-check-label' for='cancellead'>Cancel Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.EDIT_LEAD} className='form-check-input' type='checkbox' id='editlead' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editlead'>Edit Leads</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CONVERT_TO_LEAD' onChange={handleLeadIndividualChange} checked={leadpermission.CONVERT_TO_LEAD} className='form-check-input' type='checkbox' id='convertlead' disabled={!isEditing}></input>
                    <label className='form-check-label' for='convertlead'>Convert Enquiry to Lead</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Payment and Authorization Permissions</h6>
                  <input checked={Object.values(paymentpermission).every((val) => val)} onChange={handlePaymentPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='COLLECT_PAYMENT' onChange={handlePaymentIndividualChange} checked={paymentpermission.COLLECT_PAYMENT} className='form-check-input' type='checkbox' id='collectpayment' disabled={!isEditing}></input>
                    <label className='form-check-label' for='collectpayment'>Collect Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='PAYMENT_AUTHORIZATION' onChange={handlePaymentIndividualChange} checked={paymentpermission.PAYMENT_AUTHORIZATION} className='form-check-input' type='checkbox' id='authorize' disabled={!isEditing}></input>
                    <label className='form-check-label' for='authorize'>Payment Authorization</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_PAYMENT' onChange={handlePaymentIndividualChange} checked={paymentpermission.EDIT_PAYMENT} className='form-check-input' type='checkbox' id='editpayment' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editpayment'>Edit Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_DEBIT' onChange={handlePaymentIndividualChange} checked={paymentpermission.CREATE_DEBIT} className='form-check-input' type='checkbox' id='createdebit' disabled={!isEditing}></input>
                    <label className='form-check-label' for='createdebit'>Create Debit Note</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CREATE_CREDIR' onChange={handlePaymentIndividualChange} checked={paymentpermission.CREATE_CREDIT} className='form-check-input' type='checkbox' id='createcredit' disabled={!isEditing}></input>
                    <label className='form-check-label' for='createcredit'>Create Credit Note</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='DOWNLOAD_INVOICE' onChange={handlePaymentIndividualChange} checked={paymentpermission.DOWNLOAD_INVOICE} className='form-check-input' type='checkbox' id='downloadinvoice' disabled={!isEditing}></input>
                    <label className='form-check-label' for='downloadinvoice'>Download Invoice</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CANCEL_RECEIPT' onChange={handlePaymentIndividualChange} checked={paymentpermission.CANCEL_RECEIPT} className='form-check-input' type='checkbox' id='cancelreceipt' disabled={!isEditing}></input>
                    <label className='form-check-label' for='cancelreceipt'>Cancel Receipt</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Network and Rack Permissions</h6>
                  <input checked={Object.values(networkpermission).every((val) => val)} onChange={handleNetworkPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_RACK' onChange={handleNetworkIndividualChange} checked={networkpermission.VIEW_RACK} className='form-check-input' type='checkbox' id='viewrack' disabled={!isEditing}></input>
                    <label className='form-check-label' for='viewrack'>View Network Rack</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='UPDATE_RACK' onChange={handleNetworkIndividualChange} checked={networkpermission.UPDATE_RACK} className='form-check-input' type='checkbox' id='updaterack' disabled={!isEditing}></input>
                    <label className='form-check-label' for='updaterack'>Update Rack Data</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='AADD_JC' onChange={handleNetworkIndividualChange} checked={networkpermission.ADD_JC} className='form-check-input' type='checkbox' id='addjcbox' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addjcbox'>Add Field JC</label>
                  </div>


                  <div className='d-flex mt-3'>
                  <h6>Attendence Permissions</h6>
                  <input checked={Object.values(attendencepermission).every((val) => val)} onChange={handleAttendencePermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MARK_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.MARK_ATTENDENCE} className='form-check-input' type='checkbox' id='markattendence' disabled={!isEditing}></input>
                    <label className='form-check-label' for='markattendence'>Mark Attendence</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MARK_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.MARK_ANYWHERE} className='form-check-input' type='checkbox' id='markanywhere' disabled={!isEditing}></input>
                    <label className='form-check-label' for='markanywhere'>Mark From Anywhere</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_ATTENDENCE' onChange={handleAttendenceIndividualChange} checked={attendencepermission.VIEW_ATTENDENCE} className='form-check-input' type='checkbox' id='viewattendence' disabled={!isEditing}></input>
                    <label className='form-check-label' for='viewattendence'>View Attendence</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Payout Permissions</h6>
                  <input checked={Object.values(payoutpermission).every((val) => val)} onChange={handlePayoutPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>

                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_PAYOUT' onChange={handlePayoutIndividualChange} checked={payoutpermission.VIEW_PAYOUT} className='form-check-input' type='checkbox' id='viewpayout' disabled={!isEditing}></input>
                    <label className='form-check-label' for='viewpayout'>View Payout Info</label>
                  </div>

                  <div className='d-flex mt-3'>
                  <h6>Messaging Permissions</h6>
                  <input checked={Object.values(messagepermission).every((val) => val)} onChange={handleMessagingPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_DUE' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_DUE} className='form-check-input' type='checkbox' id='duemessage' disabled={!isEditing}></input>
                    <label className='form-check-label' for='duemessage'>Message for Due Payment</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_EXPIRING' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_EXPIRING} className='form-check-input' type='checkbox' id='expiringmessage' disabled={!isEditing}></input>
                    <label className='form-check-label' for='expiringmessage'>Expiring Message</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_PROMOTIONAL' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_PROMOTIONAL} className='form-check-input' type='checkbox' id='promotionalmessage' disabled={!isEditing}></input>
                    <label className='form-check-label' for='promotionalmessage'>Send Promotional Message</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='MSG_BULK' onChange={handleMessageIndividualChange} checked={messagepermission.MSG_BULK} className='form-check-input' type='checkbox' id='bulkmessage' disabled={!isEditing}></input>
                    <label className='form-check-label' for='bulkmessage'>Send Bulk Message</label>
                  </div>



                  <div className='d-flex mt-3'>
                  <h6>Inventory Permissions</h6>
                  <input checked={Object.values(inventorypermission).every((val) => val)} onChange={handleInventotyPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>

                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_INVENTORY' onChange={handleInventoryIndividualChange} checked={inventorypermission.VIEW_INVENTORY} className='form-check-input' type='checkbox' id='viewinventory' disabled={!isEditing}></input>
                    <label className='form-check-label' for='viewinventory'>View Inventory</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='CHANGE_DEVICE_STATUS' onChange={handleInventoryIndividualChange} checked={inventorypermission.CHANGE_DEVICE_STATUS} className='form-check-input' type='checkbox' id='changestatus' disabled={!isEditing}></input>
                    <label className='form-check-label' for='changestatus'>Change Device Status</label>
                  </div>
                  
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ASSIGN_DEVICE' onChange={handleInventoryIndividualChange} checked={inventorypermission.ASSIGN_DEVICE} className='form-check-input' type='checkbox' id='assigndevice' disabled={!isEditing}></input>
                    <label className='form-check-label' for='assigndevice'>Assign Device</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_DEVICE' onChange={handleInventoryIndividualChange} checked={inventorypermission.ADD_DEVICE} className='form-check-input' type='checkbox' id='adddevice' disabled={!isEditing}></input>
                    <label className='form-check-label' for='adddevice'>Add New Device</label>
                  </div>


                  <div className='d-flex mt-3'>
                  <h6>Employee Managment Permissions</h6>
                  <input checked={Object.values(employeepermission).every((val) => val)} onChange={handleEmpPermission} className='form-check-input ms-2' type='checkbox' disabled={!isEditing}></input>
                  </div>
                  <div className='form-check form-check-inline col-md-2'>
                    <input name='VIEW_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.VIEW_EMP} className='form-check-input' type='checkbox' id='viewemployee' disabled={!isEditing}></input>
                    <label className='form-check-label' for='viewemployee'>View Employee</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.EDIT_EMP} className='form-check-input' type='checkbox' id='editemployee' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editemployee'>Edit Employee</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='EDIT_EMP_PERMISSION' onChange={handleeEmployeeIndividualChange} checked={employeepermission.EDIT_EMP_PERMISSION} className='form-check-input' type='checkbox' id='editpermission' disabled={!isEditing}></input>
                    <label className='form-check-label' for='editpermission'>Edit Employee Permissions</label>
                  </div>

                  <div className='form-check form-check-inline col-md-2'>
                    <input name='ADD_EMP' onChange={handleeEmployeeIndividualChange} checked={employeepermission.ADD_EMP} className='form-check-input' type='checkbox' id='addemployee' disabled={!isEditing}></input>
                    <label className='form-check-label' for='addemployee'>Add New Employee</label>
                  </div>
                </div>

        
            </div>
            <ToastContainer/>
        </>
    );
}
