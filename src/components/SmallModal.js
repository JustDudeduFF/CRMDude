import React, { useEffect, useState } from 'react';
import './SmallModal.css'; // Add your styles here
import { get, onValue, ref, update } from 'firebase/database';
import { api, db } from '../FirebaseConfig';
import axios from 'axios';

const SmallModal = ({ show, ticketno, closeModal}) => {
    const [arrayemp, setEmpArray] = useState([]);
    const [assignemp, setAssignEmp] = useState('');
    const [subsData, setSubsData] = useState({});
    const [userLookup, setUserLookup] = useState({});
    const [description, setDescription] = useState('');
    const empRef = ref(db, `users`);

    useEffect(() => {
        const fetchUsers = onValue(empRef, (empSnap) => {
            const nameArray = [];
            const lookup = {};
            empSnap.forEach((child) => {
                const empname = child.val().FULLNAME;
                const empmobile = child.val().MOBILE;

                lookup[empmobile] = empname;
                nameArray.push({empname, empmobile});

            });
            setUserLookup(lookup);
            setEmpArray(nameArray);
        });

        const fetchSubs = onValue(ref(db, `Subscriber/${ticketno.UserKey || ticketno.subsID}`), (subsSnap) => {
            const subsData = subsSnap.val();
            setSubsData(subsData);
        });

        

        if(show){
            return () => {fetchUsers(); fetchSubs();}
            console.log('small modal return')
        }
    }, [ticketno]);

    const sendMessage = async (mobileNo, ticketno, customername, userid, concern, company) => {

        console.log(company);
        const newMessage = `👋 *Hello ${customername}*,\n\nWe are notifying you that your complaint has been assigned for resolution. Below are the details:\n\n🔹 *Complaint ID:* ${ticketno}\n🔹 *Complaint Subject:* ${concern}\n\n🛠️ *Assigned Team Member Details:* \n\n👤 Name: ${userLookup[assignemp]}\n📞 Contact: +91 ${assignemp}\n\n🎯 *Next Steps:* Our representative will contact you shortly to resolve your issue.\n\nFor further assistance, you can always reach out to us:\n📱 *Phone:* ${company === 'Sigma - Greator Noida' ? '+91 92661 55122' : '+91 99991 18971'}\n\nThank you for your patience. 🙏\nRegards\n*Sigma Business Solutions*`
        const encodedMessage = encodeURIComponent(newMessage);
        const exMessage = `Dear Executive,\n\nYou have been assigned a new ticket. Below are the details:\n\n🎫 *Ticket No:* ${ticketno}\n👤 *Customer Name:* ${customername}\n📱 *Mobile Number:* ${mobileNo}\n💼 *User ID:* ${userid}\n\nFor more details, please visit the application.\n\nThank you!\nRegards,\n*Sigma Business Solutions*`
        const enCodedExMessage = encodeURIComponent(exMessage);
        await axios.post(api+`/send-message?number=91${mobileNo}&message=${encodedMessage}&company=${company}`);
        //Message For Executive
        await axios.post(api+`/send-message?number=91${assignemp}&message=${enCodedExMessage}&company=${company}`);

    }

    const assignTicket = async(event) => {
        event.preventDefault();
        const ticketRef = ref(db, `Subscriber/${ticketno.UserKey || ticketno.userid}/Tickets/${ticketno.Ticketno}`);
        // const globalTicketsRef = ref(db, `Global Tickets/${ticketno.Ticketno}`);    
        const ticketSnap = await get(ticketRef);
        const subsMobile = subsData.mobileNo;
        const subsfullname = subsData.fullName;
        if(ticketSnap.hasChild('assigndate')){
            const assigndata = {
                assigndate: new Date().toISOString().split('T')[0],
                assigntime: new Date().toLocaleTimeString(),
                assignto: assignemp,
                status:'Pending',
                description:description
            }
            // update(globalTicketsRef, assigndata);
            update(ticketRef, assigndata);
            closeModal();
            sendMessage(subsMobile, ticketno.Ticketno, subsData.fullName, ticketno.subsID, ticketno.Concern, ticketno.company);
            alert(`${ticketno.Ticketno} is now assigned to ${assignemp}`)
        }else{
            const assigndata = {
                assignto: assignemp
            }
            // update(globalTicketsRef, assigndata);
            update(ticketRef, assigndata).then(() => {
                sendMessage(subsMobile, ticketno.Ticketno, subsfullname, ticketno.subsID, ticketno.Concern, ticketno.company);
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

        <div className='col-md'>
            <label className='form-label'>Description</label>
            <input onChange={(e) => setDescription(e.target.value)} className='form-control' type='text'></input>
        </div>
      
      <button className='btn btn-success mt-3' onClick={assignTicket}>Assign Ticket</button>
    </div>
    </div>
  );
};

export default SmallModal;