import { get, ref } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';

export default function EmpDetails() {
    const location = useLocation();
    const {mobile} = location.state || {};

    const [selectedDate, setSelectedDate] = useState(new Date(1999, 0, 1));
    const [dateJoining, setDateJoining] = useState(new Date());
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
            const empPermissionref = ref(db, `users/${mobile}/permissions`)
            const snapshot = await get(empRef);
            const permissionsnapshot = await get(empPermissionref);
            
    
            if (snapshot.exists()) {
              setSelectedDate(snapshot.val().dob);
              setDateJoining(snapshot.val().dateJoining);
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
              

          
              setAllowBackdateEntries(permissionsnapshot.val().backdateentries);
              setAllowChangePlan(permissionsnapshot.val().changeplan);
              setAllowDashboardModification(permissionsnapshot.val().dashboardmodification);
              setAllowGenerateTickets(permissionsnapshot.val().generatetickets);
              setAllowPaymentCollection(permissionsnapshot.val().paymentcollection);
              setAllowRenewal(permissionsnapshot.val().planrenewal);
              setAllowTransferTickets(permissionsnapshot.val().transfertickets);
              setAllowinventry(permissionsnapshot.val().inventry);



              
              


              
              
            } else {
              toast.error('Data is not Found', {
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

    



    

  return (
    <>
    <div className='d-flex flex-column'>
    <h5>Personal Information</h5>
      <div style={{border:'1px solid skyblue', padding:'5px', borderRadius:'5px', boxShadow:'0 0 10px blueviolet'}}>
        <form className='row g-3'>
        <div className='col-md-1'>
          <label className='form-label'>Emp Code</label>
          <input className='form-control' readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Employee FullName</label>
          <input className='form-control' value={fullname} readOnly></input>
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
                readOnly
              ></input>
              </div>
            </div>

        <div className='col-md-4'>
          <label className='form-label'>Employee Address</label>
          <input className='form-control' value={address} readOnly></input>
        </div>

        <div className='col-md-3'>
          <label className='form-label'>Gmail Address</label>
            <div className='input-group'>
              <span className='input-group-text'>@</span>
              <input value={gmail} type='mail' className='form-control' aria-describedby='inputGroupPrepend'></input>
            </div>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Employee Designation</label>
          <input className='form-control' value={designation} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Employee Joining Date</label>
          <input className='form-control' value={dateJoining} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Employee Date Of Birth</label>
          <input className='form-control' value={selectedDate} readOnly></input>
        </div>
        </form>
      </div>

      <h5 className='mt-4'>Accounts & Salary Information</h5>
      <div style={{border:'1px solid skyblue', padding:'5px', borderRadius:'5px', boxShadow:'0 0 10px blueviolet'}}>
        <form className='row g-3'>
          <div className='col-md-2'>
            <label className='form-label'>Bank Name</label>
            <input className='form-control' value={bankname} readOnly></input>
          </div>

          <div className='col-md-2'>
          <label className='form-label'>Account No.</label>
          <input className='form-control' value={accountno} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Bank IFSC Code</label>
          <input className='form-control' value={ifsc} readOnly></input>
        </div>


        <div className='col-md-2'>
          <label className='form-label'>Account Holder FullName</label>
          <input className='form-control' value={accountname} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Employee UPI Id</label>
          <input className='form-control' value={upi} readOnly></input>
        </div>

        <div className='col-md-2'>
            <label className='form-label'>Employee Office InTime *</label>
            <div className='input-group'>
              <input value={intimeh} className='form-control' readOnly></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input value={intimem} className='form-control'  readOnly></input>
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'>Employee Office OutTime *</label>
            <div className='input-group'>
              <input value={outtimeh} className='form-control' placeholder='Hours' maxLength={2}></input>
              <span className='input-group-text' aria-describedby='inputGroupPrepend'>:</span>
              <input value={outtimem} className='form-control' placeholder='Minutes' maxLength={2}></input>
            </div>
          </div>

          
          <div className='col-md-2'>
          <label className='form-label'>Attendence Marking Location</label>
          <input className='form-control' value={markingoffice} readOnly></input>
        </div>
        </form>

      </div>

      <h5 className='mt-4'>Permissions And Authorization</h5>
      <div style={{border:'1px solid skyblue', padding:'5px', borderRadius:'5px', boxShadow:'0 0 10px blueviolet'}}>
        <form className='row g-3'>


        <div className='col-md-1'>
          <label className='form-label'>User Type</label>
          <input className='form-control' value={usertype} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Companies Permissions</label>
          <input className='form-control' value={companypermissions} readOnly></input>
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Current Permissions</label>
          <div>
            <input type="checkbox" className="btn-check" id="btncheck7" autoComplete="off" checked={allowdashboardmodijication} ></input>
            <label className="btn btn-outline-info" htmlFor="btncheck7">DashBoard Modification</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck8" autoComplete="off" checked={allowinventry} ></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck8">Allow Inventry</label>
            </div>
        </div>

        <div className='col-md-2'>
          <label className='form-label'></label>
          <div>
            <input type="checkbox" className="btn-check" id="btncheck1" checked={allowpaymentcollection} autoComplete="off"></input>
            <label className="btn btn-outline-info" htmlFor="btncheck1">Allow Payment Collection</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck2" autoComplete="off" checked={allowrenewal} ></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck2">Allow Renewal</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck3" autoComplete="off" checked={allowgeneratetickets} ></input>
            <label className="btn btn-outline-info" htmlFor="btncheck3">Allow Generate Ticket</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck4" checked={allowtransfertickets}  autoComplete="off"></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck4">Allow Transfer Ticket</label>
            
            </div>
          </div>

          <div className='col-md-2'>
            <label className='form-label'></label>
            <div>
            <input type="checkbox" className="btn-check" id="btncheck5" autoComplete="off" checked={allowchangeplan} ></input>
            <label className="btn btn-outline-info" htmlFor="btncheck5">Allow Change Plan</label>

            <input type="checkbox" className="btn-check mt-3" id="btncheck6" autoComplete="off" checked={allowbackdateentries} ></input>
            <label className="btn btn-outline-info mt-3" htmlFor="btncheck6">Allow BackDate Entries</label>
            
            </div>
          </div>

          
        </form>

        
        


      </div>

      <h5 className='mt-4'>Documents</h5>
      <div style={{border:'1px solid skyblue', padding:'5px', borderRadius:'5px', boxShadow:'0 0 10px blueviolet'}}>
        <form className='row g-3'>
            <div className='col-md-2'> 
              <label className='form-label'>Aadhaar Card Number</label>
              <input value={aadhar} className='form-control' readOnly></input>
              <label className='form-label text-primary text-decoration-underline'>get document?</label>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>PAN Card Number</label>
              <input value={pan} className='form-control' readOnly></input>
              <label className='form-label text-primary text-decoration-underline'>get document?</label>
            </div>

            <div className='col-md-2'>
              <label className='form-label'>Driving License Number</label>
              <input value={driving} className='form-control' readOnly></input>
              <label className='form-label text-primary text-decoration-underline'>get document?</label>
            </div>
        </form>
      
      </div>
    </div>
    <ToastContainer/>
    </>
  )
}
