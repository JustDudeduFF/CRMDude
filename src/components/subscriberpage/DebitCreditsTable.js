import React from 'react'
import { Link } from 'react-router-dom'

export default function DebitCreditsTable() {
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th  scope="col">Note No.</th>
                        <th  scope='col'>Note Type</th>
                        <th  scope="col">Note Date</th>
                        <th  scope="col">Note For</th>
                        <th  scope="col">Amount</th>
                        <th  scope="col">Tax Amount</th>
                        <th  scope="col">Total Amount</th>
                        <th  scope="col">Modified By</th>
                        <th  scope="col">Modified On</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                <tr>
                    <td><Link style={{color:'red', cursor:'pointer', fontWeight:'bold'}} id='link' to='modnote'>04567</Link></td>
                    <td>Debit Note</td>
                    <td>01-Jan-2024</td>
                    <td>Shifting Charge</td>
                    <td>300.00</td>
                    <td>0.00</td>
                    <td>300.00</td>
                    <td>Shivam Chauhan</td>
                    <td>01-Jan-2024</td>
                    
                    
                </tr>
                </tbody>

                </table>

            </div>

    </div>
  )
}
