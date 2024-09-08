import { db } from '../../FirebaseConfig';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function RechargeTable() {
    const username = localStorage.getItem('susbsUserid');
    const [arrayplan, setArrayPlan] = useState([]);

    const planinfoRef = ref(db, `Subscriber/${username}/planinfo`);

    useEffect(() => {
        const fetchPlans = onValue(planinfoRef, (planSnap => {
            if(planSnap.exists()){
                const planArray = [];
                planSnap.forEach(Childplan => {
                    const planName = Childplan.val().planName;
                    const activationDate = Childplan.val().activationDate;
                    const expiryDate = Childplan.val().expiryDate;
                    const isp = Childplan.val().isp;
                    const planAmount = parseFloat(Childplan.val().planAmount);
                    const completedby = Childplan.val().completedby;
                    const action = Childplan.val().action;
                    const date = Childplan.val().date;
                    const remarks = Childplan.val().remarks;
                    planArray.push({planAmount, action, activationDate, expiryDate, isp, completedby, planName, date, remarks});
                });
                setArrayPlan(planArray);
            }
        }));

        return () => fetchPlans();
    }, [username])
  return (
    <div>
        <div style={{overflowY:'auto'}}>
                <table style={{ borderCollapse:'collapse'}} className="table">
                <thead>
                    <tr>
                        <th scope='col'>S. No.</th>
                        <th scope="col">Plan Name</th>
                        <th scope="col">Amount</th>
                        <th scope="col">ISP</th>
                        <th scope="col">Start Date</th>
                        <th scope="col">End Date</th>
                        <th scope="col">Days</th>
                        <th scope="col">Action</th>
                        <th scope='col'>Completed By</th>
                        <th scope='col'>Completed On</th>
                        <th scope='col'>Remarks</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                    {  arrayplan.length > 0 ? (
                        arrayplan.map(({planName, planAmount, isp, action, completedby, activationDate, expiryDate, date, remarks}, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{color:'green ',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer',  cursor:'pointer', cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">{planName}</td>
                                <ul className="dropdown-menu">
                                <li><Link className='dropdown-item' style={{color:'black'}} id='link' to='modify'>RollBack Plan</Link></li>
                                
                                </ul>
                                <td>{planAmount.toFixed(2)}</td>
                                <td>{isp}</td>
                                <td>{activationDate}</td>
                                <td>{expiryDate}</td>
                                <td>1</td>
                                <td>{action}</td>
                                <td>{completedby}</td>
                                <td>{date}</td>
                                <td>{remarks}</td>
                                
                                
                            </tr>
                        ))
                    ) : (
                        <td>No Information Found</td>
                    )
                    }
                
                </tbody>

                </table>

            </div>
            </div>

  )
}
