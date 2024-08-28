import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ReceiptModify() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', border:'1px solid green', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px green'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Receipt No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">Billing Period</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Receipt Date
          </label><br></br>
              <DatePicker className="form-control"
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"c
                isClearable
                placeholderText="Select a date"
                />
        </div>
          <div className="col-3">
            <label for="inputAddress2" className="form-label">Payment Mode</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>Paytm</option>
              <option>PhonePe</option>
              <option>Google Pay</option>
              <option>Cheque</option>
              <option>NEFT</option>
              <option>Cash</option>
              <option>Online to ISP</option>
              <option>Amazon Pay</option>
            </select>
          </div>
          <div className="col-md-3">
            <label for="inputCity" className="form-label">Amount</label>
            <input type="number" className="form-control" id="inputCity"></input>
          </div>
          <div className="col-md-2">
            <label for="inputState" className="form-label">Discount</label>
            <input type="number" className="form-control" id="inputDis"></input>
          </div>
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Collected By</label>
            <select id="inputState" className="form-select">
              <option selected>Choose...</option>
              <option>...</option>
            </select>
          </div>
          <div className="col-md-3">
            <label for="inputCity" className="form-label">Transation No.</label>
            <input type="number" className="form-control" id="inputCity"></input>
          </div>
          <div className="col-md-8">
            <label for="inputCity" className="form-label">Narration</label>
            <input type="text" className="form-control" id="inputCity"></input>
          </div>
          <div className="col-8">
            <button type="button" className="btn btn-outline-success">Collect Amount</button>
          </div>
        </form>

      </div>

    </div>
  )
}

