import React from 'react'
import { Link } from 'react-router-dom'

export default function PaymetTable() {
  return (
    <div>
      <div style={{overflowY:'auto'}}>
      <table style={{width:'max-content', borderCollapse:'collapse'}} className="table">
        <thead>
          <tr>
            <th style={{width:'60px'}} scope="col">S. No.</th>
            <th style={{width:'120px'}} scope="col">Source</th>
            <th style={{width:'120px'}} scope="col">Receipt No.</th>
            <th style={{width:'150px'}}  scope="col">Receipt Date</th>
            <th style={{width:'60px'}} scope="col">Amount</th>
            <th style={{width:'60px'}} scope="col">Discount</th>
            <th style={{width:'150px'}} scope="col">Payment Mode</th>
            <th style={{width:'150px'}} scope="col">Cheque or Transaction No.</th>
            <th style={{width:'200px'}}>Bank Name</th>
            <th style={{width:'200px'}}>Collected By</th>
            <th style={{width:'200px'}}>Modified By</th>
            <th style={{width:'250px'}}>Narration</th>
          </tr>
        </thead>
        <tbody className="table-group-divider">

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer', cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
                <ul className="dropdown-menu">
                  <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
                  <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
                  <li><a className="dropdown-item" to="#">Download Receipt</a></li>
                </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>

          <tr>
            <th scope="row">1</th>
            <td>Manual</td>
            <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">7890</td>
            <ul className="dropdown-menu">
              <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>Modify Receipt</Link></li>
              <li><a className="dropdown-item" to="#">Cancel Receipt</a></li>
              <li><a className="dropdown-item" to="#">Download Receipt</a></li>
            </ul>
            <td>01-Jan-2024</td>
            <td>3500.00</td>
            <td>0.00</td>
            <td>Google Pay</td>
            <td>001</td>
            <td>Bank Of India</td>
            <td>Shivam Chauhan</td>
            <td>Shivam Chauhan</td>
            <td>Payments adjusted in Salary</td>
            
          </tr>
          
        </tbody>
      </table>
      </div>
    

    </div>
  )
}
