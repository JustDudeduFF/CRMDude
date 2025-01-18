import React, {useEffect, useState} from "react";
import Menu from './subscriberpage/drawables/hamburger.png'
import ProfileCard from "./ProfileCard";
import Building_Img from './subscriberpage/drawables/office-building.png'
import ReportsOthers from "./ReportsOthers";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../FirebaseConfig";
import { ref, onValue } from "firebase/database";
import UserProfile from './subscriberpage/drawables/user.png'
import NotificationIcon from './subscriberpage/drawables/bell.png'
import { Modal, ModalBody, ModalTitle } from "react-bootstrap";
import axios from "axios";
import * as XLSX from 'xlsx';
import ExcelIcon from './subscriberpage/drawables/xls.png'


export default function Navbar() {
  const name = localStorage.getItem('Name');
  const designation = localStorage.getItem('Designation');

  const navigate = useNavigate();

  const [issearcfocused, setIsSearchFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [arrayuser, setArrayUser] = useState([]);
  const [subssearch, setSubsSearch] = useState('');
  const [companyUserCount, setCompanyUserCount] = useState({});
  const [expiredUserCount, setExpiredUserCount] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [renewalArray, setRenewArray] = useState([]);
  const [currentRenewal, setCurrenRenewal] = useState(0);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);
  const [showModal2, setShowModal2] = useState(false);
  const [excelData, setExcelData] = useState([]);



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

  useEffect(() => {
    const onlineRenewalsref = ref(db, `onlinerenewals`);
    const fetchUsers = async () => {

      const currentDate = new Date();
      const time1 = currentDate.getTime();
      

        const UserArray = [];
        const companyCount = {};
        const expiredCount = {};

        try{
          const response = await axios.get('https://api.justdude.in/subscriber');
          if(response.status !== 200) return;

          const userData = response.data;
          const arrayExcel = [];
          Object.keys(userData).forEach(userKey => {
            const user = userData[userKey]; // Access the user data with the key
            const company = user.company;
            arrayExcel.push(user);
          
            const expiryDate = user.connectionDetails?.expiryDate;
            const expdate = convertExcelDateSerial(expiryDate); 
            const expDateObject = new Date(expdate);
            const currentDateObject = new Date(time1); // Assuming time1 is the reference date
          
            // Extract day, month, and year
            const expDay = expDateObject.getDate();
            const expMonth = expDateObject.getMonth(); // Month is 0-indexed (January = 0)
            const expYear = expDateObject.getFullYear();
          
            const currDay = currentDateObject.getDate();
            const currMonth = currentDateObject.getMonth();
            const currYear = currentDateObject.getFullYear();
          
            UserArray.push({ company });
          
            // Compare dates based on year, month, and day
            if (companyCount[company]) {
              if (
                expYear > currYear || 
                (expYear === currYear && expMonth > currMonth) || 
                (expYear === currYear && expMonth === currMonth && expDay > currDay)
              ) {
                companyCount[company]++;
              } else {
                expiredCount[company] = (expiredCount[company] || 0) + 1;
              }
            } else {
              companyCount[company] = 1;
              if (
                expYear < currYear || 
                (expYear === currYear && expMonth < currMonth) || 
                (expYear === currYear && expMonth === currMonth && expDay < currDay)
              ) {
                expiredCount[company] = 1;
              }
            }
          });
          
          setExcelData(arrayExcel);
          const company = [...new Set(UserArray.map(user => user.company))];

          setUniqueCompanies(company);
          setCompanyUserCount(companyCount);
          setExpiredUserCount(expiredCount);
        }catch(e){
          console.log(e)
        }

        
      
    }

    onValue(onlineRenewalsref, (renewalSnap) => {
      if(renewalSnap.exists()){
        const dataArray = [];
        renewalSnap.forEach((elements) => {
          const userid = elements.val().userid;
          const fullname = elements.val().fullName;
          const mobile = elements.val().mobile;
          const address =elements.val().address;
          const source = elements.val().source;
          const date = elements.val().date;

          dataArray.push({userid, fullname, mobile, address, source, date});
        });
        setCurrenRenewal(renewalSnap.size);
        setRenewArray(dataArray);
      }
    });

    fetchUsers();
  }, []);

  const getSearchUser = async() => {
    setIsSearchFocused(true)
    const response = await axios.get(`https://api.justdude.in/subscriber/${subssearch}`);
    if(response.status !== 200) return;

    const data = response.data;
    if(data){
      const userArray = [];
      Object.keys(data).forEach((dataKey) => {
        const userData = data[dataKey];

        const {key, name, mobile, userid} = userData;
        userArray.push({
          username:userid,
          fullname: name,
          mobile,
          userKey:key
        });
        
      });
      setArrayUser(userArray);
    }
  }
    

  const handleSubsView = (userKey) => {
    setIsSearchFocused(false);
    localStorage.setItem('susbsUserid',userKey);
    navigate('subscriber', { state: { userKey } });
  }


  const downloadUsers = () => {

    const extractedData = excelData.map((item, index) => ({
      "S No.": index + 1,
      "UserID": item.username,
      "Customer Name": item.fullName,
      "Mobile": item.mobileNo,
      "Installation Address": item.installationAddress,
      "Email": item.email,
      "Registration Date": item.createdAt,
      "Plan Name": item.connectionDetails?.planName,
      "Plan Amount": item.connectionDetails?.planAmount,
      "Colony": item.colonyName,
      "Company": item.company,
      "Activation Date": item.connectionDetails?.activationDate,
      "Expiry Date": item.connectionDetails?.expiryDate,
      "ISP": item.connectionDetails?.isp,
    }));

    
    
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(extractedData);

    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Installation");
    XLSX.writeFile(workbook, `All User.xlsx`);
}         

  const togglevisiblty = () =>{
    setIsVisible(!isVisible)
  }


  return (
    <div>
      <nav className="navbar bg-primary-subtle fixed-top">
        <div className="container-fluid">
          <Link id="link" to='/dashboard'>
          <h1 className="text-primary">CRM Dude</h1></Link>
          <form className="d-flex" role="search">
              <div style={{width: '50px', height: '50px', cursor: 'pointer', marginRight:'50px'}}>
                <span className="position-fixed mt-2 ms-2 translate-middle badge rounded-pill bg-danger">
                  {currentRenewal}
                </span>
                <img alt="online renewal" onClick={() => setShowModal(true)} style={{width: '50px', height: '50px', cursor: 'pointer', borderRadius:'100%', boxShadow:"0 0 8px gray"}} src={NotificationIcon}>
                
                </img>
              </div>
            <input style={{height: '40px', float:'left'}}
              className="form-control"
              onChange={(e) => setSubsSearch(e.target.value)}
              type="search"
              placeholder="Search"
              aria-label="Search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevents form submission or other default actions
                  getSearchUser();    // Call the search function
                }
              }}
            ></input>
            <div style={{ display:'flex', flexDirection:'row', marginLeft:'10px'}}>
              <div onClick={() => setShowModal2(true)} style={{width: '50px', height: '50px', cursor: 'pointer'}}>
                <img alt="all company" style={{width: '50px', height: '50px', cursor: 'pointer', borderRadius:'100%', boxShadow:"0 0 8px gray"}} src={Building_Img}>
                </img>
              </div>
              <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{marginLeft:"20px"}}>
                <img alt="my profile" onClick={togglevisiblty}  className="shadow bg-secondary-subtle" style={{width: '50px', height: '50px', borderRadius: '100%', cursor: 'pointer'}} src={UserProfile}></img>
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                <label style={{marginLeft: '10px', width:'150px'}}>{name}</label>
                <label style={{marginLeft: '10px', width:'150px', color:'blue'}}>{designation}</label>
                
                </div>
                <div style={{cursor:'pointer'}}>
                  <img alt="menu" className="shadow bg-secondary-subtle rounded" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom" style={{width:'50px', height: '50px'}} src={Menu}></img>
                </div>

              </div>

              <div className="offcanvas offcanvas-bottom" tabIndex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasBottomLabel">Reports ans Others</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body small">
            <ReportsOthers/>
            </div>

            </div>
            </div>

            
            
          </form>
        </div>
      </nav>

      {
        isVisible && (
        <ProfileCard/>
        )
      }

      {
        issearcfocused && (
          <div style={{flex:'1', border: '1px solid gray', borderRadius: '5px', marginTop: '10px',position:'fixed',right:'0',top:'10%', width:'500px', marginRight:'15%', backgroundColor:'white', padding:'5px', height:'350px'}}>
          <button className="btn-close" onClick={() => setIsSearchFocused(false)}></button>
            <div style={{maxHeight: '300px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                <table className="table">
                    <thead className='table-primary' style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                        <tr>
                            <th scope="col">S.No.</th>
                            <th scope="col">FullName</th>
                            <th scope="col">User ID</th>
                            <th scope="col">Mobile</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                    {arrayuser.map(({username, fullname, mobile, userKey}, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{fullname}</td>
                            <td 
                              style={{color:'blue', cursor:'pointer'}} 
                              onClick={() => handleSubsView(userKey)}
                            >
                              {username}
                            </td>
                            <td>{mobile}</td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>                                             
        )
      }
      
      <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-xl">
        <ModalTitle>
          <h4 className="m-2">Online Renew List</h4>
          
        </ModalTitle>
        <ModalBody>
          <div className="d-flex flex-column">
            <div className="container ">
              <form className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Select Source</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Select Day</label>
                  <select className="form-select">
                    <option>Choose...</option>
                  </select>
                </div>

              </form>
            </div>

            <table className="mt-2 table">
              <thead className='table-primary' style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                <tr>
                  <th scope="col">S.No</th>
                  <th scope="col">UserId</th>
                  <th scope="col">FullName</th>
                  <th scope="col">Mobile</th>
                  <th scope="col">Installation Address</th>
                  <th scope="col">Source</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {
                  renewalArray.length > 0 ? (
                    renewalArray.map(({userid, fullname, mobile, address, source}, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{userid}</td>
                        <td>{fullname}</td>
                        <td>{mobile}</td>
                        <td style={{maxWidth:'250px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis'}}>{address}</td>
                        <td>{source}</td>
                        <td>
                          <button className="btn btn-primary">Done</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{textAlign:'center'}}>No Reccent Renewal Found!</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </ModalBody>

      </Modal>

      <Modal show={showModal2} onHide={() => setShowModal2(false)}>
        <Modal.Header>
          <Modal.Title>
            Company and Customer Stats
          </Modal.Title>
          <img alt="excel" onClick={downloadUsers} className="img_download_icon ms-auto" src={ExcelIcon}></img>
        </Modal.Header>
        <Modal.Body>
        <ol className="list-group list-group-numbered">
              {uniqueCompanies.map((company, index) => (
               <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
               <div className="ms-2 me-auto">
                 <div className="fw-bold">{company}</div>
                 <span className="text-success">Active Users: {companyUserCount[company] || 0}</span>
               </div>
               <span className="badge text-bg-danger rounded-pill">{expiredUserCount[company] || 0}</span>
             </li>
           ))}
           
           </ol>       
        </Modal.Body>

      </Modal>

      
    </div>
  );
}
