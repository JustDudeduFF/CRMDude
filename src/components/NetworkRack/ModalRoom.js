import { onValue, ref, set } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig';
import { toast } from 'react-toastify';
import { MapPin, PlusCircle, X } from 'lucide-react'; // Icons for better UX

const ModalRoom = ({ show, closeModal }) => {
    const [officename, setOfiiceName] = useState('');
    const [arrayoffice, setArrayOffice] = useState([]);

    const officeRef = ref(db, `Master/Offices`);

    const fetchOffice = useCallback(() => {
        onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                const officeArray = [];
                officeSnap.forEach((officeChild) => {
                    const name = officeChild.key;
                    officeArray.push(name);
                });
                setArrayOffice(officeArray);
            }
        });
    }, [officeRef]);

    const handleClick = () => {
        if (!officename) {
            toast.error("Please select an office");
            return;
        }

        const rackRef = ref(db, `Rack Info/${officename}`);
        const RoomData = {
            officename: officename,
            creationdate: new Date().toISOString().split('T')[0],
            createby: localStorage.getItem('contact')
        };

        set(rackRef, RoomData).then(() => {
            toast.success('Server Room Added Successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
            closeModal();
        });
    };

    useEffect(() => {
        if (show) {
            fetchOffice();
        }
    }, [show, fetchOffice]);

    if (!show) return null;

    return (
        <div className="custom-modal-overlay" onClick={closeModal}>
            <div className="custom-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header-redesign">
                    <div className="d-flex align-items-center gap-2">
                        <div className="icon-box">
                            <MapPin size={20} className="text-primary" />
                        </div>
                        <h5 className="m-0 fw-bold">Select Office</h5>
                    </div>
                    <button className="close-btn" onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body-redesign">
                    <p className="text-muted small mb-4">
                        Initialize a new network infrastructure record by assigning it to an existing office location.
                    </p>
                    
                    <div className="form-group mb-4">
                        <label className="custom-label mb-2">Office Location</label>
                        <select 
                            onChange={(e) => setOfiiceName(e.target.value)} 
                            className="form-select custom-select-field"
                            value={officename}
                        >
                            <option value=''>Choose an office location...</option>
                            {arrayoffice.length > 0 ? (
                                arrayoffice.map((name, index) => (
                                    <option key={index} value={name}>{name}</option>
                                ))
                            ) : (
                                <option value='' disabled>No Locations Found</option>
                            )}
                        </select>
                    </div>

                    {/* Action Button */}
                    <button 
                        onClick={handleClick} 
                        className="btn-submit-redesign"
                        disabled={!officename}
                    >
                        <PlusCircle size={18} />
                        <span>Initialize Server Room</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .custom-modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    padding: 20px;
                }

                .custom-modal-container {
                    background: white;
                    width: 100%;
                    max-width: 450px;
                    border-radius: 20px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    overflow: hidden;
                    animation: modalPop 0.3s ease-out;
                }

                @keyframes modalPop {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }

                .modal-header-redesign {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }

                .icon-box {
                    background: #eff6ff;
                    padding: 8px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .close-btn {
                    background: #f8fafc;
                    border: none;
                    color: #64748b;
                    padding: 6px;
                    border-radius: 8px;
                    transition: 0.2s;
                }

                .close-btn:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }

                .modal-body-redesign {
                    padding: 24px;
                }

                .custom-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #475569;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }

                .custom-select-field {
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1.5px solid #e2e8f0;
                    font-size: 15px;
                    transition: all 0.2s;
                    appearance: none;
                }

                .custom-select-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    outline: none;
                }

                .btn-submit-redesign {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .btn-submit-redesign:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }

                .btn-submit-redesign:disabled {
                    background: #94a3b8;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                @media (max-width: 576px) {
                    .custom-modal-overlay {
                        align-items: flex-end; /* Mobile action sheet feel */
                        padding: 0;
                    }

                    .custom-modal-container {
                        border-radius: 24px 24px 0 0;
                        max-width: 100%;
                        animation: slideUp 0.3s ease-out;
                    }
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ModalRoom;