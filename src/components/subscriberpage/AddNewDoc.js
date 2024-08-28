import React from 'react'

export default function AddNewDoc() {
  return (
    
        <div style={{display:'flex', flexDirection:'column'}} class="input-group">
        <div style={{flex:'1'}} class="col-md-4">
            <label for="inputState" class="form-label">Select Document Name</label>
            <select id="inputState" class="form-select">
              <option selected>Choose...</option>
              <option>Aadhaar Card</option>
              <option>Driving License</option>
              <option>Address Proof</option>

            </select>
          </div>

          <div style={{flex:'1', marginTop:'20px'}}>
          <input type="file" class="form-control" id="inputGroupFile04" aria-describedby="inputGroupFileAddon04" aria-label="Upload"></input><br></br>
          <button class="btn btn-outline-secondary" type="button" id="inputGroupFileAddon04">Upload Document</button>
          </div>

        </div>
  
  )
}
