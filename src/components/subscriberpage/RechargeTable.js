import { db } from '../../FirebaseConfig';
import { get, ref, remove, update, query, orderByKey, limitToLast } from 'firebase/database';
import React, { useEffect, useState } from 'react'

export default function RechargeTable() {
    const username = localStorage.getItem('susbsUserid');
    const [arrayplan, setArrayPlan] = useState([]);

    const planinfoRef = ref(db, `Subscriber/${username}/planinfo`);

    useEffect(() => {
        const fetchPlans = async() => {
            const planSnap = await get(planinfoRef);
            if(planSnap.exists()){
                const planArray = [];
                planSnap.forEach(Childplan => {
                    const plankey = Childplan.key;
                    const planName = Childplan.val().planName;
                    const activationDate = Childplan.val().activationDate;
                    const expiryDate = Childplan.val().expiryDate;
                    const isp = Childplan.val().isp;
                    const planAmount = parseFloat(Childplan.val().planAmount);
                    const completedby = Childplan.val().completedby;
                    const action = Childplan.val().action;
                    const date = Childplan.val().date;
                    const remarks = Childplan.val().remarks;
                    planArray.push({plankey, planAmount, action, activationDate, expiryDate, isp, completedby, planName, date, remarks});
                });
                setArrayPlan(planArray)
            
            }
        }

        fetchPlans();
    }, [username]);

    const rollback = async (plankey) => {
        try {
            const planref = ref(db, `Subscriber/${username}/planinfo/${plankey}`);
            const planref2 = ref(db, `Subscriber/${username}/planinfo`);
            const ledgerref = ref(db, `Subscriber/${username}/ledger/${plankey}`);
            const dueRef = ref(db, `Subscriber/${username}/connectionDetails`);
    
            // Step 1: Get all keys from the planinfo to check if plankey is the last node
            const planSnap = await get(planref2);
            if (!planSnap.exists()) {
                alert("No plans found.");
                return;
            }
            
            // Get all keys from the planinfo
            const planKeys = Object.keys(planSnap.val());
            
            // Step 2: Check if plankey is the last key
            const lastKey = planKeys[planKeys.length - 1];
            if (plankey !== lastKey) {
                alert("Rollback can only be performed on the last plan.");
                return;
            }
    
            // Step 3: Get debit amount from ledger
            const ledgerSnap = await get(ledgerref);
            const debitamount = ledgerSnap.child("debitamount").val() || 0;
    
            // Get current due amount
            const dueSnap = await get(dueRef);
            const dueAmount = dueSnap.child("dueAmount").val() || 0;
    
            // Calculate new due amount
            const newDue = parseInt(dueAmount) - parseInt(debitamount);
    
            // Remove current plan and ledger entry
            await remove(planref);
            await remove(ledgerref);
    
            // Step 4: Get the last plan details
            const lastplanQuery = query(planref2, orderByKey(), limitToLast(1));
            const planSnapLast = await get(lastplanQuery);
    
            let start = "0000-00-00";
            let end = "0000-00-00";
            let amount = 0;
            let planName = "--";
    
            if (planSnapLast.exists()) {
                const lastPlan = Object.values(planSnapLast.val())[0]; // Get the last plan object
                start = lastPlan.activationDate || "0000-00-00";
                end = lastPlan.expiryDate || "0000-00-00";
                amount = lastPlan.planAmount || 0;
                planName = lastPlan.planName || "--";
            }
    
            // Ensure no undefined values are passed to update()
            const due = {
                dueAmount: newDue,
                activationDate: start || "0000-00-00",
                expiryDate: end || "0000-00-00",
                planAmount: amount || 0,
                planName: planName || "--",
            };
    
            await update(dueRef, due); // Update connection details
            alert("Plan has been rolled back successfully!");
        } catch (error) {
            console.error("Error during rollback:", error);
            alert("An error occurred while rolling back the plan. Please try again.");
        }
    };
    
    
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
                        <th scope="col">Action</th>
                        <th scope='col'>Completed By</th>
                        <th scope='col'>Completed On</th>
                        <th scope='col'>Remarks</th>
                        
                    </tr>
                </thead>
                <tbody className='table-group-divider'>

                    {  arrayplan.length > 0 ? (
                        arrayplan.map(({plankey, planName, planAmount, isp, action, completedby, activationDate, expiryDate, date, remarks}, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{color:'green ', cursor:'pointer'}} className="btn" data-bs-toggle="dropdown" aria-expanded="false">{planName}</td>
                                <ul className="dropdown-menu">
                                <li onClick={() => rollback(plankey)}>RollBack Plan</li>
                                
                                </ul>
                                <td>{planAmount.toFixed(2)}</td>
                                <td>{isp}</td>
                                <td>{activationDate}</td>
                                <td>{expiryDate}</td>
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
