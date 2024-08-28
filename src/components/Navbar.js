import React, {useState} from "react";
import Menu from './subscriberpage/drawables/hamburger.png'
import Profile from './subscriberpage/drawables/man.png'
import Profile_Card from "./Profile_Card";
import Building_Img from './subscriberpage/drawables/office-building.png'
import Reports_Others from "./Reports_Others";
import { Link } from "react-router-dom";


export default function Navbar() {
  const name = localStorage.getItem('Name');
  const designation = localStorage.getItem('Designation');
  


    const [isVisible, setIsVisible] = useState(false);

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
            
            <input style={{height: '40px', float:'left'}}
              className="form-control "
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
                <img onClick={togglevisiblty}  className="shadow bg-secondary-subtle" style={{width: '50px', height: '50px', borderRadius: '100%', cursor: 'pointer'}} src={Profile}></img>
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
                <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                    <div className="fw-bold">Company Name</div>
                    Active Users :- 
                    </div>
                    <span className="badge text-bg-primary rounded-pill">14</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                    <div className="fw-bold">Company Name</div>
                    Active Users :- 
                    </div>
                    <span className="badge text-bg-primary rounded-pill">14</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                    <div className="fw-bold">Company Name</div>
                    Active Users :- 
                    </div>
                    <span className="badge text-bg-primary rounded-pill">14</span>
                </li>
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

      
    </div>
  );
}
