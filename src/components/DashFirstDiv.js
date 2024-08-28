import React from 'react'
import Action_Icon from './subscriberpage/drawables/info.png'
import More_Info from './subscriberpage/drawables/info-new.png'
import Router_Img from './subscriberpage/drawables/wireless-router.png'
import Rupee_Icon from './subscriberpage/drawables/rupee.png'
import DueRupee_Icon from './subscriberpage/drawables/rupeenew.png'
import Tickets_Icon from './subscriberpage/drawables/complain.png'

export default function DashFirstDiv() {
    
  return (
    <div style={{width: '100%', display:'flex', flexDirection: 'row', marginTop: '4%', padding: '20px'}}>
        
            <div style={{ borderRadius: '5px', border: '1px solid gray', flex:'1'}}>
            <img alt='' className='img_hover' src={More_Info}></img>
                <h3 style={{marginLeft: '10px'}}>Daily Attendence Logs</h3>
                <table className="table">
                    <thead className='table-primary'>
                        <tr>
                        <th scope="col">S. No.</th>
                        <th scope="col">FullName</th>
                        <th scope="col">InTime</th>
                        <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody className="table-group-divider">
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                        <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                        <td><span className='badge text-bg-success rounded-pill'>Present</span></td>
                        </tr>
                        <tr>
                        <th scope="row">2</th>
                        <td>Jacob</td>
                        <td>Thornton</td>
                        <td><span className='badge text-bg-danger rounded-pill'>Absent</span></td>
                        </tr>
                        <tr>
                        <th scope="row">3</th>
                        <td colSpan="2">Larry the Bird</td>
                        <td><span className='badge text-bg-warning rounded-pill'>Half Day</span></td>
                        </tr>
                    </tbody>
                    </table>
            </div>
            <div style={{width: '500px',  marginLeft: '20px', flex:'1', display:'flex', flexDirection: 'column'}}>
            <div style={{borderRadius: '5px', border: '1px solid gray',flex: '1'}}>
            <img alt='' className='img_hover' src={More_Info}></img>
                <h3 style={{marginLeft: '10px'}}>Expired Users</h3>
                <table className="table">
                <thead className='table-primary'>
                    <tr>
                    <th scope="col">Customer ID</th>
                    <th scope="col">FullName</th>
                    <th scope="col">Remain Days</th>
                    <th scope="col">Handle</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    <tr>
                    <th scope="row">shivam@office</th>
                    <td>Chetan Chauhan</td>
                    <td>1</td>
                    <td><img alt='' style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                    </tr>
                    <tr>
                    <th scope="row">shivam@office</th>
                    <td>Chetan Chauhan</td>
                    <td>1</td>
                    <td><img alt='' style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                    </tr>
                    <tr>
                    <th scope="row">shivam@office</th>
                    <td>Chetan Chauhan</td>
                    <td>1</td>
                    <td><img alt='' style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                    </tr>
                    <tr>
                    <th scope="row">shivam@office</th>
                    <td>Chetan Chauhan</td>
                    <td>1</td>
                    <td><img alt='' style={{width:'30px', height: '30px', cursor:'pointer'}} src={Action_Icon}></img></td>
                    </tr>
                    
                   
                </tbody>
                </table>
            </div>

            <div style={{borderRadius: '5px',flex: '1', marginTop: '15px', boxShadow: '0 0 7px violet'}}>
                <img alt='' className='img_boldicon' src={Router_Img}></img>
                <label style={{marginLeft: '20px', fontSize: '25px'}}>New Installations</label> 
                <span style={{marginRight: '100px', fontSize: '30px', float: 'right', marginTop: '20px', color: 'green', borderBottom: '2px solid gray'}}>20</span>
                <div style={{display: 'flex', flexDirection: 'row', margin: '20px', height: '80px'}}>
                    <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                        <h3>02</h3>
                        <h5 style={{color: 'gray'}}>Today's Installations</h5>
                    </div>
                    <div style={{border: '0.5px solid gray', flex: '1', padding:'10px'}}>
                    <h3>10</h3>
                    <h5 style={{color: 'gray'}}>Weekly Installations</h5>
                    </div>
                </div>


            </div>

            </div>
            

            <div style={{width: '500px', marginLeft: '20px', flex:'1', display: 'flex', flexDirection: 'column'}}>
                <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div style={{flex: '1', width: '60px'}}>
                            <img alt='' className='img_boldicon' src={Rupee_Icon}></img>
                        </div>
                        <div style={{flex:'3', marginTop: '10px'}}>
                            <h3>$122455.00</h3>
                            <label style={{color: 'gray'}}>This Month Revenue</label>
                        </div> 

                    </div>
                    <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                            <h5>$21213.0</h5>
                            <label style={{color: 'gray'}} >Today's Revenue</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'red'}} >Cash Collection</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'green'}} >Online Collection</label>
                        </div>

                    </div>
                    
                </div>
                <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div style={{flex: '1'}}>
                        <img alt='' className='img_boldicon' src={DueRupee_Icon}></img>
                        </div>
                        <div style={{flex: '3', marginTop: '10px'}}>
                            <h3>$21654.00</h3>
                            <label style={{color: 'red'}}>Month Due Amount</label>
                        </div>
                        
                        
                    </div>
                    <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                            <h5>$21213.0</h5>
                            <label style={{color: 'gray'}} >Total Due Amount</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'red'}} >Weekly Due</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>$21213.0</h5>
                        <label style={{color: 'blue'}} >Today's Due Amount</label>
                        </div>

                    </div>
                    
                    
                </div>
                <div style={{flex: '1', border: '1px solid gray', marginBottom: '10px', borderRadius: '5px', padding: '10px', display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div style={{flex: '1'}}>
                        <img alt='' className='img_boldicon' src={Tickets_Icon}></img>
                        </div>
                        <div style={{flex: '3', marginTop: '10px'}}>
                            <h3 style={{borderBottom: '2px solid brown'}}>21</h3>
                            <label style={{color: 'brown'}}>Current Open Tickets</label>
                        </div>
                        
                        
                    </div>
                    <div style={{flex: '1', display: 'flex', flexDirection: 'row', marginTop: '30px'}}>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                            <h5>3</h5>
                            <label style={{color: 'gray'}} >Unassigned Tickets</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>5</h5>
                        <label style={{color: 'red'}} >Cancelled Tickets</label>
                        </div>
                        <div style={{border: '1px solid gray', flex: '1', padding: '5px'}}>
                        <h5>202</h5>
                        <label style={{color: 'blue'}} >Closed Tickets</label>
                        </div>

                    </div>
                    
                    
                </div>
                
            </div>
        </div>


  )
}
