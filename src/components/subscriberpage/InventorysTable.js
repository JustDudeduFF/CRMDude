import React from 'react'
import { Link } from 'react-router-dom'

export default function InventorysTable() {
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th style={{width:'120px'}} scope="col">Product Code</th>
                        <th style={{width:'120px'}} scope="col">Date</th>
                        <th style={{width:'120px'}} scope="col">Store</th>
                        <th style={{width:'160px'}}  scope="col">Product Name</th>
                        <th style={{width:'160px'}}  scope="col">Product Serial No.</th>
                        <th style={{width:'120px'}} scope="col">Quantity</th>
                        <th style={{width:'90px'}} scope="col">Amount</th>
                        <th style={{width:'70px'}} scope="col">Tax</th>
                        <th style={{width:'120px'}}>Remarks</th>
                        <th style={{width:'130px'}}>Modify By</th>
                        <th style={{width:'90px'}}>Status</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>
                <tr>
                    <td><Link style={{color:'red', cursor:'pointer', fontWeight:'bold'}} id='link' to='modinvent'>SGMHW</Link></td>
                    <td>01-Jan-2024</td>
                    <td>Sigma Shop</td>
                    <td>Huawei ONT Dual Band</td>
                    <td>48575333AD768EA</td>
                    <td>1</td>
                    <td>1500.00</td>
                    <td>0.00</td>
                    <td>Device On Security</td>
                    <td>Shivam Chauhan</td>
                    <td>Activated</td>
                    
                    
                </tr>
                </tbody>

                </table>

            </div>
            </div>
    
  )
}
