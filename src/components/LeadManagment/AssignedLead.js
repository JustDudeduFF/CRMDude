import React, { useEffect, useState } from 'react';
import { onValue, ref, get, update } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { UserCheck, X, ChevronDown, IdCard } from 'lucide-react';

const AssignedLead = ({ show, closeModal, leadID }) => {
    const [arrayemp, setEmpArray] = useState([]);
    const [assignemp, setAssignEmp] = useState('');
    const empRef = ref(db, `users`);

    useEffect(() => {
        const fetchUsers = onValue(empRef, (empSnap) => {
            const nameArray = [];
            empSnap.forEach((child) => {
                const empname = child.val().FULLNAME;
                const empmobile = child.key;
                nameArray.push({ empname, empmobile });
            });
            setEmpArray(nameArray);
        });

        return () => fetchUsers();
    }, []);

    const assignLead = async () => {
        if (!assignemp) {
            alert("Please select an employee first");
            return;
        }

        const leadRef = ref(db, `Leadmanagment/${leadID}`);
        const leadSnap = await get(leadRef);
        const leadData = leadSnap.val();
        const assignData = {
            assignedto: assignemp,
            date: new Date().toISOString().split('T')[0],
            status: 'assigned',
            type: 'lead'
        }
        update(leadRef, assignData);
        closeModal();
        alert(`${leadData?.FirstName || 'Lead'} ${leadData?.LastName || ''} is assigned to ${assignemp}`);
    }

    if (!show) return null;

    return (
        <div className='custom-modal-overlay'>
            <div className='custom-modal-container'>
                {/* Header */}
                <div className='custom-modal-header'>
                    <div className='header-title-wrapper'>
                        <div className='icon-circle'>
                            <UserCheck size={20} className="text-primary" />
                        </div>
                        <h4 className='m-0 fw-bold text-dark'>Assign Lead</h4>
                    </div>
                    <button className='close-btn-minimal' onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className='custom-modal-body'>
                    <div className='lead-badge mb-4'>
                        <IdCard size={14} className="me-2 text-muted" />
                        <span className='small text-muted fw-medium'>LEAD ID: </span>
                        <span className='small text-primary fw-bold'>{leadID}</span>
                    </div>

                    <div className='form-group'>
                        <label className='form-label small fw-bold text-uppercase text-muted' style={{ letterSpacing: '0.5px' }}>
                            Select Recipient Employee
                        </label>
                        <div className='select-wrapper'>
                            <select 
                                onChange={(e) => setAssignEmp(e.target.value)} 
                                className='form-select custom-select'
                                value={assignemp}
                            >
                                <option value=''>Choose an employee...</option>
                                {arrayemp.length > 0 ? (
                                    arrayemp.map(({ empname, empmobile }, index) => (
                                        <option key={index} value={empmobile}>{empname}</option>
                                    ))
                                ) : (
                                    <option value=''>No employees found</option>
                                )}
                            </select>
                            <ChevronDown size={16} className="select-arrow" />
                        </div>
                        <p className='mt-2 small text-muted'>
                            The assigned employee will receive this lead in their dashboard immediately.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className='custom-modal-footer'>
                    <button className='btn-cancel' onClick={closeModal}>
                        Discard
                    </button>
                    <button className='btn-assign-action' onClick={assignLead}>
                        Confirm Assignment
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                }

                .custom-modal-container {
                    background: white;
                    width: 100%;
                    max-width: 450px;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                    animation: modalEntry 0.3s ease-out;
                }

                @keyframes modalEntry {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .custom-modal-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }

                .header-title-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .icon-circle {
                    width: 36px;
                    height: 36px;
                    background: #eff6ff;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn-minimal {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 6px;
                    transition: 0.2s;
                }

                .close-btn-minimal:hover {
                    background: #f1f5f9;
                    color: #1e293b;
                }

                .custom-modal-body {
                    padding: 24px;
                }

                .lead-badge {
                    background: #f8fafc;
                    padding: 6px 12px;
                    border-radius: 8px;
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid #e2e8f0;
                }

                .select-wrapper {
                    position: relative;
                }

                .custom-select {
                    appearance: none;
                    padding: 12px 16px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                    font-size: 14px;
                    width: 100%;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .custom-select:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                }

                .select-arrow {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    pointer-events: none;
                }

                .custom-modal-footer {
                    padding: 16px 24px;
                    background: #f8fafc;
                    display: flex;
                    gap: 12px;
                }

                .btn-cancel {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    font-weight: 600;
                    color: #64748b;
                    transition: 0.2s;
                }

                .btn-cancel:hover {
                    background: #f1f5f9;
                }

                .btn-assign-action {
                    flex: 2;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    background: #2563eb;
                    color: white;
                    font-weight: 600;
                    transition: 0.2s;
                }

                .btn-assign-action:hover {
                    background: #1d4ed8;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }

                @media (max-width: 480px) {
                    .custom-modal-container {
                        max-width: 100%;
                        border-radius: 20px 20px 0 0;
                        position: fixed;
                        bottom: 0;
                    }
                    
                    @keyframes modalEntry {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                }
            `}</style>
        </div>
    );
}

export default AssignedLead;