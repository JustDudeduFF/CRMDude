import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { get, onValue, ref, update } from 'firebase/database';
import { db } from '../FirebaseConfig';
import axios from 'axios';

const SmallModal = ({ show, ticketno, closeModal}) => {
    const [arrayemp, setEmpArray] = useState([]);
    const [assignemp, setAssignEmp] = useState('');
    const [subsData, setSubsData] = useState({});
    const [userLookup, setUserLookup] = useState({});
    const empRef = ref(db, `users`);

    useEffect(() => {
        const fetchUsers = onValue(empRef, (empSnap) => {
            const nameArray = [];
            const lookup = {};
            empSnap.forEach((child) => {
                const empname = child.val().fullname;
                const empmobile = child.val().mobile;

                lookup[empmobile] = empname;
                nameArray.push({empname, empmobile});

            });
            setUserLookup(lookup);
            setEmpArray(nameArray);
        });

        const fetchSubs = onValue(ref(db, `Subscriber/${ticketno.subsID}`), (subsSnap) => {
            const subsData = subsSnap.val();
            console.log(ticketno)
            console.log(subsData);
            setSubsData(subsData);
        });

        

        return () => {fetchUsers(); fetchSubs();}
    }, [ticketno]);

    const sendMessage = async (mobileNo, ticketno, customername, userid) => {
        const message = `Dear ${customername}, Your Ticket for ${ticketno.Concern} Ticket No. ${ticketno.Ticketno} is assigned our technical executive ${userLookup[assignemp]} : (${assignemp}) will attend you soon. For any query Whatsapp: 9999118971.\nSIGMA BUSINESS SOLUTIONS.`;
        const encodedMessage = new encodeURIComponent(message);
        const response = await axios.post(`https://finer-chimp-heavily.ngrok-free.app/send-message?number=91${mobileNo}&message=${encodedMessage}`);
        //Message For Executive
        const response2 = await axios.post(`https://finer-chimp-heavily.ngrok-free.app/send-message?number=91${assignemp}&message=Dear Executive,\nYou have been assigned a new ticket ${ticketno} for ${customername} and his mobile number is ${mobileNo} and his userid is ${userid}. \n For More Details Please go for Application`);
        console.log(response.status);
    }

    const assignTicket = async(event) => {
        event.preventDefault();
        const ticketRef = ref(db, `Subscriber/${ticketno.subsID}/Tickets/${ticketno.Ticketno}`);
        const globalTicketsRef = ref(db, `Global Tickets/${ticketno.Ticketno}`);    
        const ticketSnap = await get(ticketRef);
        const subsMobile = subsData.mobileNo;
        const subsfullname = subsData.fullName;
        if(ticketSnap.hasChild('assigndate')){
            const assigndata = {
                assigndate: new Date().toISOString().split('T')[0],
                assigntime: new Date().toLocaleTimeString(),
                assignto: assignemp,
                status:'Pending'
            }
            update(globalTicketsRef, assigndata);
            update(ticketRef, assigndata);
            closeModal();
            sendMessage(subsMobile, ticketno.Ticketno, subsData.fullName, ticketno.subsID);
            alert(`${ticketno.Ticketno} is now assigned to ${assignemp}`)
        }else{
            const assigndata = {
                assignto: assignemp
            }
            update(globalTicketsRef, assigndata);
            update(ticketRef, assigndata).then(() => {
                sendMessage(subsMobile, ticketno.Ticketno, subsfullname, ticketno.subsID);
                closeModal();
                alert(`${ticketno.Ticketno} is now assigned to ${assignemp}`);
            })
        }
    }
  if (!show) return null;

  return (
    <div className="modal-background">
      <div className="modal-data">
      <div className='d-flex flex-row'>
      <h4 style={{flex:'1'}}>Assign Ticket to Technician</h4>
      <button onClick={closeModal} className='btn-close'></button>
      </div>
      <p style={{color:'blue'}}>{`Ticket Id : ${ticketno.Ticketno}`}</p>
      <div>
          <label className='form-label'>Employee Names</label>
          <select onChange={(e) => setAssignEmp(e.target.value)} className='form-select mb-3'>
            <option value=''>Choose...</option>
              {
                  arrayemp.length > 0 ? (
                      arrayemp.map(({empname, empmobile}, index) => (
                          <option key={index} value={empmobile}>{empname}</option>
                      ))
                  ) : (
                      <option value=''>No Data Available!</option>
                  )
              }

          </select>
          </div>
      
      <button className='btn btn-success' onClick={assignTicket}>Assign Ticket</button>
    </div>
    </div>
  );
};

export default SmallModal;