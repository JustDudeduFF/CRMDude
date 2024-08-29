import React, { useState, useEffect } from 'react';
import PlanModal from './PlanModal';
import { db } from '../../FirebaseConfig';
import { get, ref } from 'firebase/database';

export default function BroadBandPlans() {
    const [showplanmodal, setShowPlanModal] = useState(false);
    const [arrayplan, setArrayPlan] = useState([]);
    const planRef = ref(db, 'Master/Broadband Plan');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const planSnap = await get(planRef);
                if (planSnap.exists()) {
                    const PlanArray = [];
                    planSnap.forEach(childPlan => {
                        const planname = childPlan.val().planname;
                        const planamount = childPlan.val().planamount;
                        const periodtime = childPlan.val().periodtime;
                        const planperiod = childPlan.val().planperiod;
                        const plancode = childPlan.key;

                        PlanArray.push({ planname, planamount, periodtime, planperiod ,plancode });
                    });
                    setArrayPlan(PlanArray);
                }
            } catch (error) {
                console.error("Error fetching plans:", error);
            }
        };

        fetchPlans();
    }, [planRef]);

    return (
        <div className='d-flex ms-3 flex-column'>
            <div className='d-flex flex-row'>
                <h5 style={{ flex: '1' }}>Broadband Plan List</h5>
                <button onClick={() => setShowPlanModal(true)} className='btn btn-outline-success justify-content-end mb-2'>
                    Create New Plan
                </button>
            </div>
            <PlanModal show={showplanmodal} onClose={() => setShowPlanModal(false)} />
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">S. No.</th>
                        <th scope="col">Plan Name</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Duration</th>
                        <th scope="col">Plan Code</th>
                    </tr>
                </thead>
                <tbody className="table-group-divider">
                    {arrayplan.map(({ planname, planamount, periodtime, planperiod ,plancode }, index) => (
                        <tr key={plancode}>
                            <td>{index + 1}</td>
                            <td>{planname}</td>
                            <td>{planamount}</td>
                            <td>{`${periodtime} ${planperiod}`}</td>
                            <td>{plancode}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
