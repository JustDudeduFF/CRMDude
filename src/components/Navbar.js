import React, {useEffect, useState} from "react";
import Menu from './subscriberpage/drawables/hamburger.png'
import Profile from './subscriberpage/drawables/man.png'
import Profile_Card from "./Profile_Card";
import Building_Img from './subscriberpage/drawables/office-building.png'
import Reports_Others from "./Reports_Others";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../FirebaseConfig";
import { ref, onValue, get } from "firebase/database";
import UserProfile from './subscriberpage/drawables/user.png'


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

  const subsref = ref(db, 'Subscriber');

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
    const fetchUsers = async () => {

      const currentDate = new Date().toISOString().split('T')[0];
      const userSnap = await get(subsref);
      if(userSnap.exists()){
        const UserArray = [];
        const companyCount = {};
        const expiredCount = {};

        userSnap.forEach(Childsubs => {
          const username = Childsubs.key;
          const fullname = Childsubs.val().fullName;
          const mobile = Childsubs.val().mobileNo;
          const company = Childsubs.val().company;
          const expiryDate = Childsubs.child("connectionDetails").val().expiryDate;

          const expdate = convertExcelDateSerial(expiryDate);



          UserArray.push({username, fullname, mobile, company});

          if (companyCount[company]) {
            if(expdate > currentDate){
              companyCount[company]++;
            }
            if(expdate < currentDate){
              expiredCount[company]++
            }
          } else {
            companyCount[company] = 1;
          }
        });

        setArrayUser(UserArray);
        setCompanyUserCount(companyCount);
        setExpiredUserCount(expiredCount);
        console.log(UserArray);
      }
    }

    fetchUsers();
  }, [])
    

  const handleSubsView = (username) => {
    setIsSearchFocused(false);
    localStorage.setItem('susbsUserid',username);
    navigate('subscriber', { state: { username } });
  }

  const togglevisiblty = () =>{
    setIsVisible(!isVisible)
  }

  const fileredSubs = arrayuser.filter(({username, mobile}) => 
    username.toLowerCase().includes(subssearch.toLowerCase()) ||
    mobile.toLowerCase().includes(subssearch.toLowerCase())
  );

  const uniqueCompanies = [...new Set(arrayuser.map(user => user.company))]; // Get unique company names

  return (
    <div>
      <nav className="navbar bg-primary-subtle fixed-top">
        <div className="container-fluid">
          <Link id="link" to='/dashboard'>
          <h1 className="text-primary">CRM Dude</h1></Link>
          <form className="d-flex" role="search">
            
            <input style={{height: '40px', float:'left'}}
              onClick={() => setIsSearchFocused(true)}
              className="form-control"
              onChange={(e) => setSubsSearch(e.target.value)}
              type="search"
              placeholder="Search"
              aria-label="Search"
            ></input>
            <div style={{ display:'flex', flexDirection:'row', marginLeft:'10px'}}>
              <div data-bs-toggle="modal" data-bs-target="#staticBackdrop" style={{width: '50px', height: '50px', cursor: 'pointer'}}>
                <img style={{width: '50px', height: '50px', cursor: 'pointer', borderRadius:'100%', boxShadow:"0 0 8px gray"}} src={Building_Img}>
                </img>
              </div>
              <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{marginLeft:"20px"}}>
                <img onClick={togglevisiblty}  className="shadow bg-secondary-subtle" style={{width: '50px', height: '50px', borderRadius: '100%', cursor: 'pointer'}} src={UserProfile}></img>
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                <label style={{marginLeft: '10px', width:'150px'}}>{name}</label>
                <label style={{marginLeft: '10px', width:'150px', color:'blue'}}>{designation}</label>
                
                </div>
                <div style={{cursor:'pointer'}}>
                  <img className="shadow bg-secondary-subtle rounded" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom" style={{width:'50px', height: '50px'}} src={Menu}></img>
                </div>

              </div>

              <div className="offcanvas offcanvas-bottom" tabIndex="-1" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasBottomLabel">Reports ans Others</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body small">
                <Reports_Others/>
            </div>

            </div>
            </div>

            
            
          </form>
        </div>
      </nav>


      <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
            <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">Change Company</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
            <ol className="list-group list-group-numbered">
                {uniqueCompanies.map((company, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                      <div className="fw-bold">{company}</div>
                      Active Users: {companyUserCount[company] || 0}
                    </div>
                    <span className="badge text-bg-primary rounded-pill">{expiredUserCount[company] || 0}</span>
                  </li>
                ))}
                
                </ol>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-success" data-bs-dismiss="modal">Add New</button>
                <button type="button" className="btn btn-primary">Change</button>
            </div>
            </div>
        </div>
        </div>

      {
        isVisible && (
            <Profile_Card/>
        )
      }

      {
        issearcfocused && (
          <div style={{position:'fixed',right:'0',top:'10%', width:'500px', marginRight:'15%', backgroundColor:'white', padding:'5px', height:'300px', zIndex:'1000', overflow:'hidden', overflowY:'auto'}} className="border shadow rounded"
          onMouseDown={(e) => e.preventDefault()} // Prevent hiding on click
          >
            <button className="btn-close" onClick={() => setIsSearchFocused(false)}></button>
            <table className="table">
              <thead className="table-primary">
                <tr>
                  <th scope="col">S. No.</th>
                  <th scope="col">Full Name</th>
                  <th scope="col">UserName</th>
                  <th scope="col">Mobile no.</th>
                </tr>
              </thead>
              <tbody className="table-group-divider">
                {fileredSubs.map(({username, fullname, mobile}, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{fullname}</td>
                    <td 
                      style={{color:'blue', cursor:'pointer'}} 
                      onClick={() => handleSubsView(username)}
                    >
                      {username}
                    </td>
                    <td>{mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      
            

      
    </div>
  );
}
