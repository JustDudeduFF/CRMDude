import React from 'react'
import { Link } from 'react-router-dom'

export default function () {
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th  scope="col">Action ID</th>
                        <th  scope='col'>Action Type</th>
                        <th  scope="col">Action Date</th>
                        <th  scope="col">Description</th>
                        <th  scope="col">Assign Date</th>
                        <th  scope="col">Modified By</th>
                        <th  scope="col">Modified On</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                <tr>
                    <td><Link style={{color:'red', cursor:'pointer', fontWeight:'bold'}} id='link' to='modremfollow'>04567</Link></td>
                    <td>Remark</td>
                    <td>01-Jan-2024</td>
                    <td>Customer Says Nothing</td>
                    <td>01-Jan-2024</td>
                    <td>Shivam Chauhan</td>
                    <td>01-Jan-2024</td>
                    
                    
                </tr>
                </tbody>

                </table>

            </div>

    </div>
  )
}
