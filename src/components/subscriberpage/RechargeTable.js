import React from 'react'
import { Link } from 'react-router-dom'

export default function RechargeTable() {
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th style={{width:'100px'}} scope="col">Plan Name</th>
                        <th style={{width:'120px'}} scope="col">Amount</th>
                        <th style={{width:'120px'}}  scope="col">ISP</th>
                        <th style={{width:'120px'}}  scope="col">Start Date</th>
                        <th style={{width:'120px'}} scope="col">End Date</th>
                        <th style={{width:'50px'}} scope="col">Days</th>
                        <th style={{width:'70px'}} scope="col">Action</th>
                        <th style={{width:'120px'}}>Completed By</th>
                        <th style={{width:'130px'}}>Completed On</th>
                        <th style={{width:'90px'}}>Remarks</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                <tr>
                    <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer', cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">300mbps_Unlimited_3Months_1800</td>
                    <ul className="dropdown-menu">
                    <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>RollBack Plan</Link></li>
                    
                    </ul>
                    <td>1800.00</td>
                    <td>Zapbytes</td>
                    <td>01-Jan-2024</td>
                    <td>01-Mar-2024</td>
                    <td>1</td>
                    <td>Renew</td>
                    <td>Shivam Chauhan</td>
                    <td>01-Jan-2024</td>
                    <td>Done</td>
                    
                    
                </tr>
                </tbody>

                </table>

            </div>
            </div>

  )
}
