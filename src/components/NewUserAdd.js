import React, {useState} from "react";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function NewUserAdd() {
  const [selectedDate, setSelectedDate] = useState(null);
  return (
    <div style={{width: '100%', display:'flex', flexDirection: 'column', marginTop: '5.5%'}}>
        <h2 style={{marginLeft: '20px'}}>Create User ID</h2>
        <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select Company  
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>

        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            FullName
          </label>
          <input 
            type="text"
            className="form-control"
            id="validationCustom01"
            required
          ></input>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-3">
          <label htmlFor="validationCustomUsername" className="form-label">
            Username
          </label>
          <div className="input-group has-validation">
            <span className="input-group-text" id="inputGroupPrepend">
              @
            </span>
            <input
              type="text"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <div className="invalid-feedback">Please choose a username.</div>
          </div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustomUsername" className="form-label">
            Mobile No.
          </label>
          <div className="input-group has-validation">
            <span className="input-group-text" id="inputGroupPrepend">
              +91
            </span>
            <input
              maxLength={10}
              type="numbers"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <div className="invalid-feedback">Please choose a username.</div>
          </div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom03" className="form-label">
            Email Address
          </label>
          <input
            type="gmail"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-4">
          <label htmlFor="validationCustom03" className="form-label">
            Installation Address
          </label>
          <input
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Colony Name
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            State
          </label>
          <input
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom05" className="form-label">
            PIN Code
          </label>
          <input
            type="text"
            className="form-control"
            id="validationCustom05"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid PIN Code.</div>
        </div>
      </form>
      </div>

      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Connection Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select ISP  
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            Plan Name
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustomUsername" className="form-label">
            Plan Amount
          </label>
          <div className="input-group has-validation">
            <input
              type="text"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <div className="invalid-feedback">Please choose a username.</div>
          </div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom03" className="form-label">
            Security Deposite
          </label>
          <input
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please provide a valid city.</div>
        </div>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Refundable Amount
          </label>
          <input
            type="text"
            className="form-control"
            id="validationCustom03"
            required
          ></input>
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Activation Date
          </label><br></br>
          <DatePicker className="form-control"
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"c
            isClearable
            placeholderText="Select a date"
            />
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
        <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Expiry Date
          </label><br></br>
          <DatePicker className="form-control"
            value="Expiry Date"
            onChange={date => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            isClearable
            placeholderText="Select a date"
            />
          <div className="invalid-feedback">Please select a valid state.</div>
        </div>
      </form>
      </div>


      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Inventry & Device Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Select Device Maker  
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-4">
          <label htmlFor="validationCustom01" className="form-label">
            Device Serial Number
          </label>
          <div className="input-group has-validation">
            <input
              list="serialDevice"
              type="text"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            <datalist id="serialDevice">
              <option>485754420ada022</option>
              <option>485754420ada022</option>
              <option>485754420ada022</option>
              <option>485754420ada022</option>
              <option>485754420ada022</option>
              <option>485754420ada022sad</option>
              <option>485754420a5456123</option>
            </datalist>
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustomUsername" className="form-label">
            Connection Power Info
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>Huawei OLT</option>
            <option>Syrotech OLT</option>
            <option>Secureye OLT</option>
            <option>Richardlink OLT</option>
          </select>
          </div>
      </form>
      </div>


      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Field & Fiber Details</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Connected FMS  
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>...</option>
          </select>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Connected Port No.
          </label>
          <div className="input-group has-validation">
            <input
              maxLength={2}
              type="numbers"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustomUsername" className="form-label">
            Connection Power Info
          </label>
          <select className="form-select" id="validationCustom04" required>s
            <option selected value="">  
              Choose...
            </option>
            <option>Huawei OLT</option>
            <option>Syrotech OLT</option>
            <option>Secureye OLT</option>
            <option>Richardlink OLT</option>
          </select>
          </div>

          <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Unique JC No.
          </label>
          <div className="input-group has-validation">
            <input
              
              type="text"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustom01" className="form-label">
            Fiber Core No.
          </label>
          <div className="input-group has-validation">
            <input
              maxLength={1}
              type="numbers"
              className="form-control"
              id="validationCustomUsername"
              aria-describedby="inputGroupPrepend"
              required
            ></input>
            {/*Create Documents Upload Section  */}
            </div>
          <div className="valid-feedback">Looks good!</div>
        </div>
      </form>
      </div>

      <h3 style={{marginLeft: '20px', marginTop: '10px'}}>Documents & Terms Conditions</h3>
      <div style={{padding: '10px', borderRadius: '5px', boxShadow:'0 0 10px skyblue', margin: '10px'}} className="UserInfo">
      <form className="row g-3 needs-validation" noValidate>
        <div className="col-md-3">
          <label htmlFor="validationCustom04" className="form-label">
            Identity Proof 
          </label>
          <div className="input-group">
              <input type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
              
          </div>
          <div className="invalid-feedback">Please select a valid state.</div>
          
        </div><br></br>
      
        <div className="col-md-3">
          <label htmlFor="validationCustom01" className="form-label">
            Address Proof
          </label>
          <div className="input-group">
              <input type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
             
          </div>
            
          <div className="valid-feedback">Looks good!</div>
        </div>

        <div className="col-md-2">
          <label htmlFor="validationCustomUsername" className="form-label">
            CAF Documents
          </label>
          <input type="file" className="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input>
          </div>

          

          </form>

          
      </div>

      <button style={{margin: '20px'}} type="button" className="btn btn-success">Upload Details</button>
    </div>
  );
}
