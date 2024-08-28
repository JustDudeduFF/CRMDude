
import React, {useState} from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
export default function AddRemarkFollow(props) {
    
    const {mode} = props
    const isVisible = mode === 'follow';
    const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <div style={{flex:'1', margin:'20px', padding:'10px', border:mode === 'remark'? '1px solid skyblue' :'1px solid blue' , borderRadius:'5px', boxShadow:mode === 'remark' ? '0 0 10px skyblue' : '0 0 10px blue'}}>
      <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Action ID</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className='col-md-2'>
            <label className='form-label'>Action Type</label>
            <input type="text" className="form-control" id="inputEmail4" value={`${mode === 'remark' ? 'Remark' : 'Follow Up'} `} readOnly></input>
          </div>
          
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Action Date
          </label><br></br>
              <DatePicker className="form-control"
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"c
                isClearable
                placeholderText="Select a date"
                />
        </div>
          {
            isVisible && 
               (
                <div className="col-md-2">
                <label htmlFor="validationCustom04" className="form-label">
                    Assign Date
                </label><br></br>
                    <DatePicker className="form-control"
                        selected={selectedDate}
                        onChange={date => setSelectedDate(date)}
                        dateFormat="dd/MM/yyyy"c
                        isClearable
                        placeholderText="Select a date"
                        />
                </div>
               )
               }

          <div className='col-md-2'>
            <label className='form-label'>Follow Up Particular</label>
            <select id="inputState" className="form-select">
              <option selected>Reacharge</option>
              <option>Complaint</option>
              <option>Other</option>
              
            </select>
          </div>
          
        

        <div className="col-md-8">
            <label for="inputPassword4" className="form-label">Description</label>
            <input type="text" className="form-control" id="inputCity"></input>
          </div>
          
         
          <div className="col-8">
            <button type="button" className={`btn ${mode === 'remark' ? 'btn-outline-info' : 'btn-outline-primary'}`}>{`${mode === 'remark'? 'Add Remark' : 'Add Follow Up'}`}</button>
          </div>
        </form>

      </div>

    </div>  


  )
}
