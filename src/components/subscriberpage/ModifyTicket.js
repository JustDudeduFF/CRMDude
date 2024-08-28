import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default function ModifyTicket() {
  const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{flex:'1',display:'flex', flexDirection:'column'}}>

    
    <div style={{ flex:'1', display:'flex', flexDirection:'column'}}>
        <div style={{flex:'1', margin:'20px', padding:'10px', borderRadius:'5px'}}>
        <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Ticket No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">Ticket Concern</label>
            <input type="email" className="form-control" id="inputEmail4" value='Internet Not Working' readOnly></input>
          </div>
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Ticket Generation Date
          </label><br></br>
          <input type="email" className="form-control" id="inputEmail4" value='01-Jan-2024' readOnly></input>
        </div>
          
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Assigned To</label><span style={{marginLeft:'20px', cursor:'pointer'}} class="badge text-bg-success">Change</span> 
            <input type="email" className="form-control" id="inputEmail4" value='Shivam Sharma' readOnly></input>
            
          </div>
          <div className="col-md-8">
            <label for="inputCity" className="form-label">Description or Brief</label><span style={{marginLeft:'20px', cursor:'pointer'}} class="badge text-bg-success">modify</span> 
            <input type="text" className="form-control" id="inputCity" value='Customer Ke Device ma WAN Nahi aarha ha' readOnly></input>
          </div>
            
        </form>
        </div>
    </div>
    <div style={{flex:'5', borderRadius:'5px', boxShadow:'0 0 8px blue', padding:'10px', margin:'20px', display:'flex', flexDirection:'column'}}>
      <h4>Modify Ticket</h4>
      <div style={{flex:'1'}}>
        <form className='row g-3'>
        <div className="col-md-2">
            <label for="inputZip" className="form-label">Action On Ticket</label>
            <select id="inputState" className="form-select">
              <option selected>Completed</option>
              <option>Temporary Closed</option>
            </select>
          </div>

          <div className="col-md-2">
            <label for="inputZip" className="form-label">Completed By</label>
            <select id="inputState" className="form-select">
              <option selected>Employee Names...</option>
              <option>Employee</option>
            </select>
          </div>
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Closing Date</label>
            <DatePicker className="form-control"
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"c
                isClearable
                placeholderText="Select a date"
                />
          </div>
          <div className="col-md-8">
            <label for="inputZip" className="form-label">RCA</label>
            <input type="email" className="form-control" id="inputEmail4" placeholder='You Take Action On Ticket'></input>
          </div>
        </form>
        <button style={{marginTop:'20px'}} type="button" class="btn btn-outline-success">Close Ticket</button>

      </div>
    </div>
    </div>
  )
}
