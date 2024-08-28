import React from 'react'
import Excel_Icon from './drawables/xls.png'
import PDF_Icon from './drawables/pdf.png'

export default function Cust_Ledger() {
  return (
    <>
    <div style={{flex:'1', display:'flex', flexDirection:'row'}}>
        <div style={{flex:'1'}}>
        <h2>Customer Ledger</h2>
        </div>
        <div style={{flex:'4'}}>
            <div style={{width:'max-content', float:'right'}}>
                <img src={Excel_Icon} className='img_download_icon'></img>
                <img src={PDF_Icon} className='img_download_icon'></img>

            </div>
        </div>
        
    </div>
    <div style={{flex:'10'}}>
    <table className="table">
  <thead>
    <tr>
      <th style={{width:'60px'}} scope="col">S. No.</th>
      <th style={{width:'120px'}} scope="col">Type</th>
      <th style={{width:'120px'}} scope="col">Date</th>
      <th style={{width:'300px'}}  scope="col">Particulars</th>
      <th scope="col">Dr. Amount</th>
      <th scope="col">Cr. Amount</th>
      <th scope="col">Balance</th>
      <th scope="col">Remarks</th>

    </tr>
  </thead>
  <tbody className="table-group-divider">
    <tr>
      <th scope="row">1</th>
      <td>Collection</td>
      <td>01-Jan-2024</td>
      <td>Payments Colleted By Shivam</td>
      <td>0.00</td>
      <td>3500.00</td>
      <td>-3500.00</td>
      <td>Done</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>Recharge</td>
      <td>01-Jan-2024</td>
      <td>300mbps_Unlimited_3Months_1800</td>
      <td>2000.00</td>
      <td>0.00</td>
      <td>-1500.00</td>
      <td>Done</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td >Credit</td>
      <td>05-Jan-2024</td>
      <td>Security Deposite</td>
      <td>1500.00</td>
      <td>0.00</td>
      <td>0.00</td>
      <td>Done</td>
    </tr>
    <tr>
      <th scope="row">4</th>
      <td >Debit</td>
      <td>10-Jan-2024</td>
      <td>Security Refunded</td>
      <td>0.00</td>
      <td>1500.00</td>
      <td>-1500.00</td>
      <td>Done</td>
    </tr>
  </tbody>
</table>

    </div>

    </>
  )
}
