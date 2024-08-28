import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ModDCNote() {
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:'1px solid gray', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px gray'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Note No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Note Type</label>
            <select id="inputState" className="form-select">
              <option selected>Debirt Note</option>
              <option>Credit Note</option>
              
            </select>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">Particular</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>Security Deposite</option>
              <option>Connection Shifting</option>
              <option>Secondary Device Charge</option>
            </select>
          </div>
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Note Date
          </label><br></br>
              <DatePicker className="form-control"
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"c
                isClearable
                placeholderText="Select a date"
                />
        </div>
          
          <div className="col-md-3">
            <label for="inputCity" className="form-label">Amount</label>
            <input type="number" className="form-control" id="inputCity"></input>
          </div>

          <div className="col-md-3">
            <label for="inputCity" className="form-label">Tax</label>
            <input type="number" className="form-control" id="inputCity"></input>
          </div>
          
          
          <div className="col-md-8">
            <label for="inputCity" className="form-label">Narration</label>
            <input type="text" className="form-control" id="inputCity"></input>
          </div>
          <div className="col-8">
            <button type="button" className='btn btn-outline-secondary'>Update Note</button>
          </div>
        </form>

      </div>

    </div>  
  )
}
