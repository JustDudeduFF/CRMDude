import { onValue, ref, set } from 'firebase/database';
import React, {useEffect, useState} from 'react';
import { db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


export default function NewTicket() {

  const username = localStorage.getItem('susbsUserid');
  const navigate = useNavigate();
    
    const [arrayconcern, setArrayConcern] = useState([]);
    const [arrayemp, setArrayEmp] = useState([]);
    const [currenttime, setCurrentTime] = useState(new Date());
    const [description, setDescription] = useState('');
    const [ticketconcern, setTicketConcern] = useState('');
    const [assignemp, setAssignEmp] = useState('');


    const concernRef = ref(db, `Master/Tickets`);
    const empRef = ref(db, `users`);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);


      const fetchconcerns = onValue(concernRef, (concernSnap => {
        if(concernSnap.exists()){
          const concernArray = [];
          concernSnap.forEach(Childconcern => {
            const concername = Childconcern.key;

            concernArray.push(concername);
          });
          setArrayConcern(concernArray);
        }
      }));

      const fetchemp = onValue(empRef, (empSnap => {
        if(empSnap.exists()){
          const empArray = [];
          empSnap.forEach(ChildEmp => {
            const empname = ChildEmp.val().fullname;
            empArray.push(empname);
          });
          setArrayEmp(empArray);
        }
      }))

      return () => {fetchconcerns();
        fetchemp();
        clearInterval(timer);
      };
    }, []);



    const generateTicket = async () => {
      const ticketno = `TIC-${Date.now()}`
      const assigntime = currenttime.toLocaleTimeString();

      const ticketdata = {
        source: 'Manual',
        ticketno: ticketno,
        generatedate: new Date().toISOString().split('T')[0],
        ticketconcern: ticketconcern,
        assignto: assignemp,
        description: description,
        assigntime: assigntime,
        assigndate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      }

      const globalticketdata = {
        ticketno: ticketno,
        source: 'Manual',
        generatedate: new Date().toISOString().split('T')[0],
        ticketconcern: ticketconcern,
        assignto: assignemp,
        description: description,
        assigntime: assigntime,
        assigndate: new Date().toISOString().split('T')[0],
        status: 'Pending'
      }

      const ticketRef = ref(db, `Subscriber/${username}/Tickets/${ticketno}`);
      const globalticketRef = ref(db, `Global Tickets/Pending/${ticketno}`);


      try{
        await set(ticketRef, ticketdata);
        await set(globalticketRef, globalticketdata);
        navigate(-1);


      }catch(error){
        console.log(`Error:- ${error}`);
        toast.error('Failed', {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,            
        });
      }
    }
  return (
    <div style={{display:'flex', flexDirection:'column'}}>
      <ToastContainer/>
        <div style={{flex:'1', margin:'20px', padding:'10px', borderRadius:'5px', boxShadow:'0 0 10px blue'}}>
        <form className="row g-3">
          <div className="col-md-1">
            <label for="inputEmail4" className="form-label">Ticket No.</label>
            <input type="email" className="form-control" id="inputEmail4" value='Auto' readOnly></input>
          </div>
          <div className="col-md-2">
            <label for="inputPassword4" className="form-label">Ticket Concern</label>
            <select onChange={(e) => setTicketConcern(e.target.value)} id="inputState" className="form-select">
              <option value=''>Choose...</option>
              {
                arrayconcern.length > 0 ? (
                  arrayconcern.map((concern, index) => (
                    <option key={index}>{concern}</option>
                  ))
                ) : (
                  <option value=''>No Concern Availabale</option>
                )
              }
            </select>
          </div>
          <div className="col-md-2">
          <label htmlFor="validationCustom04" className="form-label">
            Ticket Date
          </label>
          <input value={new Date().toISOString().split('T')[0]} type='date' className='form-control'></input>
              
        </div>

        <div className='col-md-2'>
          <label className='form-label'>Current Time</label>
          <label className='form-control'>{currenttime.toLocaleTimeString()}</label>
        </div>
          
          <div className="col-md-2">
            <label for="inputZip" className="form-label">Assigned To</label>
            <select onChange={(e) => setAssignEmp(e.target.value)} id="inputState" className="form-select">
              <option value=''>Choose...</option>
              {
                arrayemp.length > 0 ? (
                  arrayemp.map((empname, index) => (
                    <option key={index} value={empname}>{empname}</option>
                  ))
                ) : (
                  <option value=''>No Employee Availabale</option>
                )
              }
            </select>
          </div>
          <div className="col-md-8">
            <label for="inputCity" className="form-label">Description or Brief</label>
            <input onChange={(e) => setDescription(e.target.value)} type="text" className="form-control" id="inputCity"></input>
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

        </form>

        

        </div>

        <button onClick={generateTicket} className="btn btn-outline-primary ms-5 me-5">Generate Ticket</button>

    </div>
  )
}
