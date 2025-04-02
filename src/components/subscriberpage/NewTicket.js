import { onValue, ref, set } from 'firebase/database';
import React, {useEffect, useState} from 'react';
import { api, db } from '../../FirebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


export default function NewTicket() {
  const company = localStorage.getItem('company');
  const username = localStorage.getItem('susbsUserid');
  const fullname = localStorage.getItem('subsname');
  const mobile = localStorage.getItem('subscontact');
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
        setCurrentTime(new Date());


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
            const empname = ChildEmp.val().FULLNAME;
            const empmobile = ChildEmp.key;
            empArray.push({empname, empmobile});
          });
          setArrayEmp(empArray);
        }
      }));

      return () => {fetchconcerns();
        fetchemp();  
      };
    }, []);

    function generateHappyCode() {
      return Math.floor(1000 + Math.random() * 9000);
    }

    const sendmessage = async (assignemp, ticketconcern, ticketno, happycode) => {
      const newMessage = `🎫 Ticket Registered Successfully! ✅\nHello ${fullname},\nWe have received your ticket and it has been successfully registered.\n\n🆔 *Ticket ID:* ${ticketno}\n📅 *Date:* ${new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'2-digit'})}\n📝 *Issue:* ${ticketconcern}\n\nOur support team is working on resolving your issue. 🔧\nPlease Share *${happycode}* Happy Code to executive, When Your Issue is Resolved.\n\n⏳ Estimated Resolution Time: 1-4 Hours\n\nFor updates, you can reply to this chat anytime. 📲\n📞 Customer Support: ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}\n\nThank you for reaching out to *Sigma Business Soltions*! We’ll get this sorted out for you soon. 😊\n\nStay connected! 🌐`
      const encodedMessage = encodeURIComponent(newMessage);
      const exMessage = `Dear Executive,\n\nYou have been assigned a new ticket. Below are the details:\n\n🎫 *Ticket No:* ${ticketno}\n👤 *Customer Name:* ${fullname}\n📱 *Mobile Number:* ${mobile}\n💼 *User ID:* ${username}\n\nFor more details, please visit the application.\n\nThank you!\nRegards,\n*Sigma Business Solutions*`
      const enCodedExMessage = encodeURIComponent(exMessage);
      await axios.post(api+`/send-message?number=91${mobile}&message=${encodedMessage}&company=${company}`);
      await axios.post(api+`/send-message?number=91${assignemp}&message=${enCodedExMessage}&company=${company}`);
    }



    const generateTicket = async () => {
      const ticketno = `TIC-${Date.now()}`
      const assigntime = currenttime.toLocaleTimeString();
      const happycode = String(generateHappyCode());

      const ticketdata = {
        generatedBy: localStorage.getItem('contact'),
        source: 'Manual',
        ticketno: ticketno,
        ticketconcern: ticketconcern,
        assignto: assignemp,
        description: description,
        assigntime: assigntime,
        assigndate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        closedate: '',
        closeby: '',
        closetime: '',
        rac: '',
        happycode: happycode,
        generatedDate: new Date().toISOString().split('T')[0]
      }

      // const globalticketdata = {
      //   happycode: happycode,
      //   generatedBy: localStorage.getItem('contact'),
      //   ticketno: ticketno,
      //   source: 'Manual',
      //   ticketconcern: ticketconcern,
      //   assignto: assignemp,
      //   description: description,
      //   assigntime: assigntime,
      //   assigndate: new Date().toISOString().split('T')[0],
      //   status: 'Pending',
      //   closedate: '',
      //   closeby: '',
      //   closetime: '',
      //   rac: '',
      //   userid: userid,
      //   generatedDate: new Date().toISOString().split('T')[0],
      //   UserKey: username
      // }

      const ticketRef = ref(db, `Subscriber/${username}/Tickets/${ticketno}`);
      // const globalticketRef = ref(db, `Global Tickets/${ticketno}`);


      try{
        await set(ticketRef, ticketdata).then(() => {
          sendmessage(assignemp, ticketconcern, ticketno, happycode, fullname);
        });
        // await set(globalticketRef, globalticketdata);
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
            <label className="form-label">Ticket No.</label>
            <input defaultValue='Auto' className="form-control" readOnly></input>
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
          <label className="form-label">
            Ticket Date
          </label>
          <input value={new Date().toISOString().split('T')[0]} type='date' className='form-control' readOnly></input>
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
                  arrayemp.map(({empname, empmobile}, index) => (
                    <option key={index} value={empmobile}>{empname}</option>
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

        </form>

        </div>

        <button onClick={generateTicket} className="btn btn-outline-primary ms-5 me-5">Generate Ticket</button>

    </div>
  )
}
