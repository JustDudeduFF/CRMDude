import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function NewTicket() {
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
        <div style={{flex:'1', margin:'20px', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px blue'}}>
        <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Ticket No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">Ticket Concern</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Ticket Date
          </label><br></br>
              <DatePicker className="form-control"
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"c
                isClearable
                placeholderText="Select a date"
                />
        </div>
          
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Assigned To</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-8">
            <label for="inputCity" className="form-label">Description or Brief</label>
            <input type="text" className="form-control" id="inputCity"></input>
          </div>
            <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gridCheck"></input>
            <label class="form-check-label" for="gridCheck">
                Send SMS To Employee
            </label>
            </div>
            <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gridCheck"></input>
            <label class="form-check-label" for="gridCheck">
                Send SMS To Subscriber
            </label>
            </div>
            <div class="form-check">
            <input class="form-check-input" type="checkbox" id="gridCheck" autoComplete='off'></input>
            <label class="form-check-label" for="gridCheck">
                Notify Employee
            </label>
            </div>
          <div className="col-8">
            <button type="button" className="btn btn-outline-primary">Generate Ticket</button>
          </div>
        </form>

        </div>

    </div>
  )
}
