import { db } from '../../FirebaseConfig';
import { get, ref, remove, update, query, orderByKey, limitToLast } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { usePermissions } from '../PermissionProvider';

export default function RechargeTable() {
    const username = localStorage.getItem('susbsUserid');
    const {hasPermission} = usePermissions();
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
        if(hasPermission("PLAN_ROLLBACK")){
            try {
                // Notify the user that a background process is happening
                alert("Rolling back the plan. Please wait...");
        
                // Step 1: Fetch data in parallel
                const [planSnap, ledgerSnap, dueSnap] = await Promise.all([
                    get(ref(db, `Subscriber/${username}/planinfo`), limitToLast(1)), // Fetch all plans
                    get(ref(db, `Subscriber/${username}/ledger/${plankey}`)), // Fetch ledger data
                    get(ref(db, `Subscriber/${username}/connectionDetails`)), // Fetch connection details
                ]);
        
                // Step 2: Validate if plans exist
                if (!planSnap.exists()) {
                    alert("No plans found.");
                    return;
                }
        
                // Parse plans and keys
                const plans = planSnap.val();
                const planKeys = Object.keys(plans);
                const lastKey = planKeys[planKeys.length - 1];
        
                // Step 3: Check if rollback is allowed
                if (plankey !== lastKey) {
                    alert("Rollback can only be performed on the last plan.");
                    return;
                }
        
                // Step 4: Extract required data
                const debitAmount = ledgerSnap.child("debitamount").val() || 0; // Debit from ledger
                const currentDueAmount = dueSnap.child("dueAmount").val() || 0; // Current due
        
                // Calculate the new due amount
                const newDueAmount = parseInt(currentDueAmount) - parseInt(debitAmount);
        
                // Step 5: Get the last plan details (excluding the one being rolled back)
                let lastPlan = { activationDate: "", expiryDate: "", planAmount: 0, planName: "--" };
                if (planKeys.length > 1) {
                    const secondLastKey = planKeys[planKeys.length - 2];
                    lastPlan = plans[secondLastKey];
                }
        
                // Prepare the batch updates
                const updates = {
                    [`Subscriber/${username}/planinfo/${plankey}`]: null, // Remove the current plan
                    [`Subscriber/${username}/ledger/${plankey}`]: null, // Remove ledger entry
                    [`Subscriber/${username}/connectionDetails`]: {
                        dueAmount: newDueAmount,
                        activationDate: lastPlan.activationDate || "",
                        expiryDate: lastPlan.expiryDate || "",
                        planAmount: lastPlan.planAmount || 0,
                        planName: lastPlan.planName || "--",
                    },
                    [`Subscriber/${username}/logs/${plankey}`]: {
                        date: new Date().toISOString().split('T')[0],
                        description: `Plan Rollback`,
                        modifiedby: localStorage.getItem('contact')
                    }
                };
    
        
                // Step 6: Apply updates asynchronously
                await update(ref(db), updates);
        
                // Notify the user of success
                alert("Plan has been rolled back successfully!");
            } catch (error) {
                console.error("Error during rollback:", error);
                alert("An error occurred while rolling back the plan. Please try again.");
            }
        }else{
            alert("Permission Denied!")
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
