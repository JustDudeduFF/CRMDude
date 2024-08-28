import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export default function CreateNote(props) {
    const {notety} = props;
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:notety === 'danger' ? '1px solid red' : '1px solid green', padding:'10px', borderRadius:'5px', boxShadow:notety === 'danger' ? '0 0 10px red' : '0 0 10px green'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Note No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
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
            <button type="button" className={`btn ${notety === 'danger' ? 'btn-outline-danger' : 'btn-outline-success'}`}>{`${notety === "danger" ? 'Create Debit Note' : ' Create Credit Note'}`}</button>
          </div>
        </form>

      </div>

    </div>
  )
}
