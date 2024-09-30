import { ref, onValue, update } from 'firebase/database';
import React, {useEffect, useState} from 'react'
import { useLocation } from 'react-router-dom';
import { db } from '../../FirebaseConfig';



export default function ModifyTicket() {
  const [closeby, setCloseBy] = useState('');
  const [status, setStatus] = useState('');
  const [currenttime, setCurrentTime] = useState(new Date())
  const [arrayemp, setArrayEmp] = useState([]);
  const [rac, setRAC] = useState('');
  const location = useLocation();
  const username = localStorage.getItem('susbsUserid');
  const {ticket} = location.state || {};

  const empRef = ref(db, `users`);

  const handleCloseTicket = async () => {
    const ticketRef = ref(db, `Subscriber/${username}/Tickets/${ticket.ticketno}`);
    const globaltickets = ref(db, `Global Tickets/${ticket.ticketno}`);
    const newticketdata = {
      closedate: new Date().toISOString().split('T')[0],
      closeby: closeby,
      closetime: currenttime.toLocaleTimeString(),
      status: status,
      rac: rac
    }

    try{
      await update(ticketRef, newticketdata);
      await update(globaltickets, newticketdata);
    }catch(error){
      console.log(`Error :- ${error}`);
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchemp = onValue(empRef, (empSnap => {
      if(empSnap.exists()){
        const empArray = [];
        empSnap.forEach(ChildEmp => {
          const empname = ChildEmp.val().fullname;
          const empmobile = ChildEmp.key;
          empArray.push({empname, empmobile});
        });
        setArrayEmp(empArray);
      }
    }));

    return () => {
      fetchemp();
      clearInterval(timer);
    }
    
  }, [username])


  


  
  return (
    <div style={{flex:'1',display:'flex', flexDirection:'column'}}>

    
    <div style={{ flex:'1', display:'flex', flexDirection:'column'}}>
        <div style={{flex:'1', margin:'20px', padding:'10px', borderRadius:'5px'}}>
        <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Ticket No.</label>
            <input type="email" className="form-control" id="inputEmail4" defaultValue={ticket.ticketno} readOnly></input>
          </div>
          <div className="col-md-2">
            <label className="form-label">Ticket Concern</label>
            <input type="email" className="form-control" id="inputEmail4" defaultValue={ticket.ticketconcern} readOnly></input>
          </div>
          <div className="col-md-2">
          <label className="form-label">
            Ticket Generation Date
          </label><br></br>
          <input type="email" className="form-control" id="inputEmail4" defaultValue={ticket.assigndate} readOnly></input>
        </div>
          
          <div className="col-md-2">
            <label className="form-label">Assigned To</label><span style={{marginLeft:'20px', cursor:'pointer'}} className="badge text-bg-success">Change</span> 
            <input type="email" className="form-control" id="inputEmail4" defaultValue={ticket.assignto} readOnly></input>
            
          </div>
          <div className="col-md-8">
            <label className="form-label">Description or Brief</label>
            <input type="text" className="form-control" id="inputCity" defaultValue={ticket.description} readOnly></input>
          </div>
            
        </form>
        </div>
    </div>
    <div style={{flex:'5', borderRadius:'5px', boxShadow:'0 0 8px blue', padding:'10px', margin:'20px', display:'flex', flexDirection:'column'}}>
      <h4>Modify Ticket</h4>
      <div style={{flex:'1'}}>
        <form className='row g-3'>
        <div className="col-md-2">
            <label className="form-label">Action On Ticket</label>
            <select onChange={(e) => setStatus(e.target.value)} className="form-select">
              <option value=''>Choose...</option>
              <option value='Completed'>Completed</option>
              <option value='Temporary Closed'>Temporary Closed</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Completed By</label>
            <select onChange={(e) => setCloseBy(e.target.value)}className="form-select">
              <option value=''>Choose...</option>
              {
                arrayemp.length > 0 ? (
                  arrayemp.map(({empname, empmobile}, index) => (
                    <option key={index} value={empmobile}>{empname}</option>
                  ))
                ) : (
                  <option defaultValue=''>No Employee Availabale</option>
                )
              }
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Closing Date</label>
            <input type='date' className='form-control' defaultValue={new Date().toISOString().split('T')[0]}></input>
          </div>
          <div className="col-md-8">
            <label className="form-label">RCA</label>
            <input onChange={(e) => setRAC(e.target.value)} type="text" className="form-control" placeholder='You Take Action On Ticket'></input>
          </div>
        </form>
        <button onClick={handleCloseTicket} style={{marginTop:'20px'}} type="button" className="btn btn-outline-success">Close Ticket</button>

      </div>
    </div>
    </div>
  )
}
