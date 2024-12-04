import { get, ref, update, onValue } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

export default function EmpDetails() {
    const location = useLocation();
    const { mobile } = location.state || {};

    const [selectedDate, setSelectedDate] = useState('');
    const [datejoining, setDateJoining] = useState('');
    const [fullname, setFullName] = useState('');
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

    const [isEditing, setIsEditing] = useState(false);

    const [allowpaymentcollection, setAllowPaymentCollection] = useState(false);
    const [allowgeneratetickets, setAllowGenerateTickets] = useState(false);
    const [allowchangeplan, setAllowChangePlan] = useState(false);
    const [allowdashboardmodijication, setAllowDashboardModification] = useState(false);
    const [allowrenewal, setAllowRenewal] = useState(false);
    const [allowtransfertickets, setAllowTransferTickets] = useState(false);
    const [allowbackdateentries, setAllowBackdateEntries] = useState(false);
    const [allowinventry, setAllowinventry] = useState(false);

    useEffect(() => {
        const getDetails = async () => {
            try {
                const empRef = ref(db, `users/${mobile}`);
                const empPermissionRef = ref(db, `users/${mobile}/permissions`);
                const snapshot = await get(empRef);
                const permissionSnapshot = await get(empPermissionRef);

                if (snapshot.exists()) {
                    setSelectedDate(snapshot.val().dob);
                    setDateJoining(snapshot.val().datejoining);
                    setFullName(snapshot.val().fullname);
                    setGmail(snapshot.val().gmail);
                    setAddress(snapshot.val().address);
                    setAadhar(snapshot.val().aadhar);
                    setDriving(snapshot.val().driving);
                    setPAN(snapshot.val().pan);
                    setBankName(snapshot.val().bankname);
                    setAccountNo(snapshot.val().accountno); 
                    setAccountName(snapshot.val().accountname);
                    setIFSC(snapshot.val().ifsc);
                    setUPI(snapshot.val().upi);
                    setInTimeH(snapshot.val().intimeh);
                    setInTimeM(snapshot.val().intimem);
                    setOutTimeH(snapshot.val().outtimeh);
                    setOutTimeM(snapshot.val().outtimem);
                    setMarkingOffice(snapshot.val().markingoffice);
                    setDesignation(snapshot.val().designation);
                    setUserType(snapshot.val().usertype);
                    setCompanyPermissions(snapshot.val().companypermissions);

                    console.log(snapshot.val().mobile);


                    if(permissionSnapshot.exists()){
                      setAllowBackdateEntries(permissionSnapshot.val().backdateentries);
                      setAllowDashboardModification(permissionSnapshot.val().dashboardmodification);
                      setAllowPaymentCollection(permissionSnapshot.val().paymentcollection);
                      setAllowChangePlan(permissionSnapshot.val().planrenewal);
                      setAllowGenerateTickets(permissionSnapshot.val().generatetickets);
                      setAllowTransferTickets(permissionSnapshot.val().transfertickets);
                      setAllowChangePlan(permissionSnapshot.val().changeplan);
                      setAllowinventry(permissionSnapshot.val().inventry);
                    }
                } else {
                    toast.error('Data not found', {
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: true,
                        progress: undefined,
                    });
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

    const handleSave = async () => {
        try {
            const empRef = ref(db, `users/${mobile}`);
            

            await update(empRef, {
                fullname,
                gmail,
                address,
                aadhar,
                driving,
                pan,
                bankname,
                accountno,
                accountname,
                ifsc,
                upi,
                intimeh,
                intimem,
                outtimeh,
                outtimem,
                markingoffice,
                designation,
                usertype,
                companypermissions,
                dob: selectedDate,
                datejoining
            });

            

            toast.success('Details updated successfully', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });

            setIsEditing(false); // Exit edit mode after saving
        } catch (error) {
            console.error('Error updating data:', error);
            toast.error('Failed to update data', {
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleCheckboxChange = (label, value) => {
      if (label && typeof value !== 'undefined') {
        // Create an object with the label as the key and the value as the data
        const updates = {
          [label]: value
        };
    
        // Update the specific path in the Firebase Realtime Database
        update(ref(db, `users/${mobile}/permissions`), updates)
          .then(() => {
            console.log("Update successful");
          })
          .catch((error) => {
            console.error("Update failed:", error);
          });
      } else {
        console.error("Error: Undefined label or value");
      }
    };
    

    return (
        <>
            <div className='d-flex flex-column'>
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
                
                
                <div style={{ border: '1px solid skyblue', padding: '5px', borderRadius: '5px', boxShadow: '0 0 10px blueviolet' }}>
                    <form className='row g-3'>
                    <div className='col-md-1'>
                            <label className='form-label'>Emp Code</label>
                            <input className='form-control' readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Employee FullName</label>
                            <input className='form-control' value={fullname} onChange={(e) => setFullName(e.target.value)} readOnly={!isEditing}></input>
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
                                    value={mobile}
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
                            <input className='form-control' value={address} onChange={(e) => setAddress(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-3'>
                            <label className='form-label'>Gmail Address</label>
                            <div className='input-group'>
                                <span className='input-group-text'>@</span>
                                <input value={gmail} type='mail' onChange={(e) => setGmail(e.target.value)} className='form-control' aria-describedby='inputGroupPrepend' readOnly={!isEditing}></input>
                            </div>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Employee Designation</label>
                            <select className='form-select'
                                  value={designation} 
                                  onChange={(e) => setDesignation(e.target.value)} 
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
                            <input className='form-control' type='date' value={datejoining} onChange={(e) => setDateJoining(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>UserType</label>
                            <select className='form-select'
                                  value={usertype} 
                                  onChange={(e) => setUserType(e.target.value)} 
                                  disabled={!isEditing}
                              >
                                  <option value="">{usertype}</option>
                                  <option value="Mobile">Admin</option>
                                  <option value="Web">Web</option>
                                  <option value="Web and Mobile Both">Web and Mobile Both</option>
                                  {/* Add more options as needed */}
                              </select>
                            </div>

                            <div className='col-md-2'>
                              <label className='form-label'>Employee Intime</label>
                              <div className='input-group'>
                                <input className='form-control' onChange={(e) => setInTimeH(e.target.value)} value={intimeh} readOnly={!isEditing}></input>
                                <span className='input-group-text'>:</span>
                                <input className='form-control' onChange={(e) => setInTimeM(e.target.value)} value={intimem} readOnly={!isEditing}></input>

                              </div>
                            </div>

                            <div className='col-md-2'>
                              <label className='form-label'>Employee OutTime</label>
                              <div className='input-group'>
                                <input className='form-control' onChange={(e) => setOutTimeH(e.target.value)} value={outtimeh} readOnly={!isEditing}></input>
                                <span className='input-group-text'>:</span>
                                <input className='form-control' onChange={(e) => setOutTimeM(e.target.value)} value={outtimem} readOnly={!isEditing}></input>

                              </div>
                            </div>


                            

                            <div className='col-md-2'>
                              <label className='form-label'>Attendence Marking Location</label>
                              <select onChange={(event) => setMarkingOffice(event.target.value)} value={markingoffice} className='form-select' disabled={!isEditing}>
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
                            <input className='form-control' value={aadhar} onChange={(e) => setAadhar(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Driving License</label>
                            <input className='form-control' value={driving} onChange={(e) => setDriving(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Pan Card</label>
                            <input className='form-control' value={pan} onChange={(e) => setPAN(e.target.value)} readOnly={!isEditing}></input>
                        </div>
                    </div>

                    <h5 className='mt-4'>Bank Account Details</h5>
                    <div className='row g-3'>
                        <div className='col-md-2'>
                            <label className='form-label'>Bank Name</label>
                            <input className='form-control' value={bankname} onChange={(e) => setBankName(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Account No.</label>
                            <input className='form-control' value={accountno} onChange={(e) => setAccountNo(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>IFSC Code</label>
                            <input className='form-control' value={ifsc} onChange={(e) => setIFSC(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>Account Holder</label>
                            <input className='form-control' value={accountname} onChange={(e) => setAccountName(e.target.value)} readOnly={!isEditing}></input>
                        </div>

                        <div className='col-md-2'>
                            <label className='form-label'>UPI ID</label>
                            <input className='form-control' value={upi} onChange={(e) => setUPI(e.target.value)} readOnly={!isEditing}></input>
                        </div>
                    </div>
                    

                    <h5 className='mt-4'>Permissions</h5>
                    <form className='row g-3'>
         


          <div className='col-md-2'>
            <label className='form-label'>Select Permissions</label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck1" checked={allowpaymentcollection} onChange={(event) => { const isChecked = event.target.checked; setAllowPaymentCollection(isChecked); handleCheckboxChange('paymentcollection', isChecked)}} readOnly={!isEditing} autoComplete="off"></input>
            <label className="btn btn-outline-info" htmlFor="btncheck1">Allow Payment Collection</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck2" autoComplete="off" checked={allowrenewal} onChange={(event) => { const isChecked = event.target.checked; setAllowRenewal(isChecked); handleCheckboxChange('planrenewal', isChecked)}} readOnly={!isEditing}></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck2">Allow Renewal</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck3" autoComplete="off" checked={allowgeneratetickets} onChange={(event) => { const isChecked = event.target.checked; setAllowGenerateTickets(isChecked); handleCheckboxChange('generatetickets', isChecked)}} readOnly={!isEditing}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck3">Allow Generate Ticket</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck4" checked={allowtransfertickets} onChange={(event) => { const isChecked = event.target.checked; setAllowTransferTickets(isChecked); handleCheckboxChange('transfertickets', isChecked)}} readOnly={!isEditing} autoComplete="off"></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck4">Allow Transfer Ticket</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck5" autoComplete="off" checked={allowchangeplan} onChange={(event) => { const isChecked = event.target.checked; setAllowChangePlan(isChecked); handleCheckboxChange('changeplan', isChecked)}} readOnly={!isEditing}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck5">Allow Change Plan</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck6" autoComplete="off" checked={allowbackdateentries} onChange={(event) => { const isChecked = event.target.checked; setAllowBackdateEntries(isChecked); handleCheckboxChange('backdateentries', isChecked)}} readOnly={!isEditing}></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck6">Allow BackDate Entries</label>
            
            </div>
          </div>

          <div className='col-md-3'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck7" autoComplete="off" checked={allowdashboardmodijication} onChange={(event) => { const isChecked = event.target.checked; setAllowDashboardModification(isChecked); handleCheckboxChange('dashboardmodification', isChecked)}} readOnly={!isEditing}></input>
            <label className="btn btn-outline-info" htmlFor="btncheck7">Allow DashBoard Modification</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck8" autoComplete="off" checked={allowinventry} onChange={(event) => { const isChecked = event.target.checked; setAllowinventry(isChecked); handleCheckboxChange('inventry', isChecked)}} readOnly={!isEditing} ></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck8">Allow Inventry</label>
            
            </div>
          </div>

        </form>
                </div>
                
            </div>
            <ToastContainer/>
        </>
    );
}
