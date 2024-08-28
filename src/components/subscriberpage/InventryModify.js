import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function InventryModify() {
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:'1px solid black', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px gray'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Product Code</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Product Add Date
          </label><br></br>
              <input type="email" className="form-control" id="inputEmail4" value='01-Jan-2024' readOnly></input>
        </div>
          
          <div className="col-md-3">
            <label for="inputCity" className="form-label">Amount</label>
            <input type="number" className="form-control" id="inputDis" value='1500.00' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputState" className="form-label">Tax</label>
            <input type="number" className="form-control" id="inputDis" value='0.00' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Product Name</label>
            <input type="text" className="form-control" id="inputDis" value='Huawei Dual Band Ont' readOnly></input>
          </div>
          <div className="col-md-3">
            <label for="inputCity" className="form-label">Product Serial No.</label>
            <input type="text" className="form-control" id="inputDis" value='48575333AD768EA' readOnly></input>
          </div>
          <div className="col-md-6">
            <label for="inputCity" className="form-label">Remarks</label>
            <input type="text" className="form-control" id="inputCity"></input>
          </div>
          <div className="col-md-4">
            <label for="inputCity" className="form-label">Action On Product</label>
            <select id="inputState" className="form-select">
              <option selected>Damaged</option>
              <option>Refunded</option>
            </select>
          </div>

          <div className="col-md-4">
            <label for="inputCity" className="form-label">Product Current Status</label>
            <select id="inputState" className="form-select">
              <option selected>On Repair</option>
              <option>Non Repairable</option>
              <option>Re-Stocked</option>
              
            </select>
          </div>

          <div className="col-8">
            <button type="button" className="btn btn-outline-secondary">Update</button>
          </div>
        </form>

      </div>

    </div>  
  )
}
