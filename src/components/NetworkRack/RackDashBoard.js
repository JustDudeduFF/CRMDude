import React, { useEffect, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { db } from '../../FirebaseConfig';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RackDash from './RackDash';
import RackView from './RackView';
import { Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { Server, Plus, ChevronRight, Layout, MapPin, X, Menu } from 'lucide-react';

export default function RackDashBoard() {
    const [roomarray, setRoomArray] = useState([]);
    const [showroom, setShowRoom] = useState(false);
    const [arrayoffice, setArrayOffice] = useState([]);
    const [officename, setOfiiceName] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Mobile Toggle
    
    const officeRef = ref(db, `Master/Offices`);
    const navigate = useNavigate();
    const rackRef = ref(db, `Rack Info`);

    useEffect(() => {
        const fetchRooms = onValue(rackRef, (rackSnap) => {
            const roomArray = [];
            if (rackSnap.exists()) {
                rackSnap.forEach((chidSnap) => {
                    const name = chidSnap.key;
                    roomArray.push(name);
                });
                setRoomArray(roomArray);
            }
        });

        onValue(officeRef, (officeSnap) => {
            if (officeSnap.exists()) {
                const officeArray = [];
                officeSnap.forEach((officeChild) => {
                    officeArray.push(officeChild.key);
                });
                setArrayOffice(officeArray);
            }
        });

        return () => fetchRooms();
    }, []);

    const handleClick = () => {
        const targetRackRef = ref(db, `Rack Info/${officename}`);
        const RoomData = {
            officename: officename,
            creationdate: new Date().toISOString().split('T')[0],
            createby: localStorage.getItem('contact')
        };

        set(targetRackRef, RoomData).then(() => {
            toast.success('Server Room Added!', {
                position: "top-right",
                autoClose: 3000,
            });
            setShowRoom(false);
        });
    };

    const showRackView = (name) => {
        navigate('rackview', { state: { officename: name } });
        setIsSidebarOpen(false); // Close drawer on mobile after selection
    };

    return (
        <div className="rack-dashboard-container">
            <ToastContainer />

            {/* Top Navigation Bar */}
            <header className="rack-header">
                <div className="d-flex align-items-center gap-2">
                    <button className="mobile-menu-btn d-lg-none" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <Server className="text-primary" size={28} />
                    <div>
                        <h4 className="m-0 fw-bold text-dark">Network Infrastructure</h4>
                        <p className="small text-muted m-0 d-none d-sm-block">Rack & Server Room Management</p>
                    </div>
                </div>
                <button onClick={() => setShowRoom(true)} className="btn btn-primary btn-add-room">
                    <Plus size={18} />
                    <span>Add Server Room</span>
                </button>
            </header>

            <div className="dashboard-content">
                {/* Sidebar / Room List */}
                <aside className={`room-sidebar ${isSidebarOpen ? 'active' : ''}`}>
                    <div className="sidebar-header d-lg-none">
                        <h5 className="m-0">Server Rooms</h5>
                        <button className="btn-close-sidebar" onClick={() => setIsSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="sidebar-inner">
                        <div className="sidebar-label">
                            <Layout size={14} />
                            <span>AVAILABLE ROOMS</span>
                        </div>
                        <nav className="room-nav">
                            {roomarray.length > 0 ? (
                                roomarray.map((name, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => showRackView(name)}
                                        className="room-nav-item"
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="status-indicator online"></div>
                                            <span className="room-name">{name}</span>
                                        </div>
                                        <ChevronRight size={16} className="chevron" />
                                    </button>
                                ))
                            ) : (
                                <div className="text-center p-4 text-muted small">No rooms found.</div>
                            )}
                        </nav>
                    </div>
                </aside>

                {/* Main Viewport */}
                <main className="rack-viewport">
                    <div className="viewport-card shadow-sm">
                        <Routes>
                            <Route path='/' element={<RackDash />} />
                            <Route path='rackview' element={<RackView />} />
                        </Routes>
                    </div>
                </main>
            </div>

            {/* Modal Redesign */}
            <Modal show={showroom} onHide={() => setShowRoom(false)} centered className="custom-rack-modal">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Configure New Room</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                    <div className="p-3 bg-light rounded-3 mb-3">
                        <div className="d-flex align-items-center gap-2 text-primary mb-2">
                            <MapPin size={18} />
                            <span className="fw-semibold">Location Assignment</span>
                        </div>
                        <p className="small text-muted">Select an office location to initialize a new server room instance.</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label fw-bold small">OFFICE NAME</label>
                        <select 
                            onChange={(e) => setOfiiceName(e.target.value)} 
                            className="form-select form-select-lg"
                        >
                            <option>Choose Office...</option>
                            {arrayoffice.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <button onClick={() => setShowRoom(false)} className="btn btn-link text-muted text-decoration-none">Cancel</button>
                    <button onClick={handleClick} className="btn btn-primary px-4 shadow-sm">Initialize Room</button>
                </Modal.Footer>
            </Modal>

            <style jsx>{`
                .rack-dashboard-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background-color: #f4f7fa;
                    overflow: hidden;
                }

                .rack-header {
                    background: white;
                    padding: 12px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #e2e8f0;
                    z-index: 100;
                }

                .btn-add-room {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: 8px;
                    font-weight: 600;
                    padding: 8px 16px;
                }

                .dashboard-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                    position: relative;
                }

                .room-sidebar {
                    width: 280px;
                    background: white;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                }

                .sidebar-inner {
                    padding: 20px;
                    overflow-y: auto;
                }

                .sidebar-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: #94a3b8;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .room-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .room-nav-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .room-nav-item:hover {
                    background: #f8fafc;
                    border-color: #e2e8f0;
                }

                .room-nav-item:active {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                }

                .room-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #334155;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #cbd5e1;
                }

                .status-indicator.online {
                    background: #10b981;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .rack-viewport {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }

                .viewport-card {
                    background: white;
                    border-radius: 16px;
                    min-height: 100%;
                    padding: 20px;
                }

                .mobile-menu-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    padding: 8px;
                }

                @media (max-width: 991px) {
                    .rack-header { margin-top: 0; }
                    .room-sidebar {
                        position: fixed;
                        top: 0;
                        left: -300px;
                        height: 100%;
                        z-index: 1000;
                        box-shadow: 20px 0 50px rgba(0,0,0,0.1);
                    }

                    .room-sidebar.active {
                        left: 0;
                    }

                    .sidebar-header {
                        padding: 20px;
                        border-bottom: 1px solid #f1f5f9;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .rack-viewport {
                        padding: 10px;
                    }

                    .btn-add-room span {
                        display: none;
                    }
                }

                .custom-rack-modal :global(.modal-content) {
                    border-radius: 20px;
                    border: none;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }
            `}</style>
        </div>
    );
}