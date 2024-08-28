import React from 'react'
import Collection from './subscriberpage/drawables/money.png'

export default function DashSecDiv() {
  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{flex :'1', margin: '20px', border :'1px solid gray', padding: '10px', boxShadow: '0 0 10px gray'}} className='gradient_orange'>
        <label style={{fontSize: '30px', fontWeight: 'bold'}}>Today's Collection </label>
        <img alt='' style={{width : '60px', height: '60px', marginLeft: '20px'}} src={Collection}></img><br></br>

        <label style={{fontSize: '25px', fontWeight: 'bold', color:'white', marginLeft: '20px'}}>$1025000</label><br></br>

        <button style={{marginRight: '30px', marginTop: '20px', float: 'right'}} type="button" className="btn btn-success">Details</button>
        </div>


        <div style={{flex :'1', margin: '20px', border :'1px solid gray', padding: '10px', boxShadow: '0 0 10px gray'}} className='gradient_orange'>
        <label style={{fontSize: '30px', fontWeight: 'bold'}}>Weekly Collection </label>
        <img alt='' style={{width : '60px', height: '60px', marginLeft: '20px'}} src={Collection}></img><br></br>

        <label style={{fontSize: '25px', fontWeight: 'bold', color:'white', marginLeft: '20px'}}>$1025000</label><br></br>

        <button style={{marginRight: '30px', marginTop: '20px', float: 'right'}} type="button" className="btn btn-success">Details</button>
        </div>

        <div style={{flex :'1', margin: '20px', border :'1px solid gray', padding: '10px', boxShadow: '0 0 10px gray'}} className='gradient_orange'>
        <label style={{fontSize: '30px', fontWeight: 'bold'}}>Month Collection </label>
        <img alt='' style={{width : '60px', height: '60px', marginLeft: '20px'}} src={Collection}></img><br></br>

        <label style={{fontSize: '25px', fontWeight: 'bold', color:'white', marginLeft: '20px'}}>$1025000</label><br></br>

        <button style={{marginRight: '30px', marginTop: '20px', float: 'right'}} type="button" className="btn btn-success">Details</button>
        </div>
      
    </div>
  )
}
