import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../PermissionProvider";
import { Modal, Spinner, Badge } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaEllipsisV, FaRedo, FaEdit, FaTimesCircle, FaTicketAlt, FaClock, FaChevronRight } from 'react-icons/fa';

export default function TicketTable() {
  const { hasPermission } = usePermissions();
  const username = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [arrayticket, setArrayTicket] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [codemodal, setCodeModal] = useState(false);
  const [actionModal, setActionModal] = useState(false); // New state for Action Modal
  const [activeTicket, setActiveTicket] = useState(null); // To track which ticket was clicked
  const [selecticket, setSelectTicket] = useState({
    ticketno: "",
    mobile: "",
    happycode: "",
    name: "",
  });
  const [showpermission, setshowpermission] = useState(false);

  const fetchTicket = async () => {
    setIsLoading(true);
    try {
      const response = await API.get(`/subscriber/tickets/${username}`);
      if (response.status === 200) {
        setArrayTicket(response.data);
      } else {
        toast.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Something went wrong while fetching tickets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    let maping = {};
    try {
      const response = await API.get(`/subscriber/users?partnerId=${partnerId}`);
      if (response.status === 200) {
        const data = response.data;
        Object.keys(data).forEach((key) => {
          const user = data[key];
          maping[user.empmobile] = user.empname;
        });
        setUserMap(maping);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchUserData();
  }, [username]);

  const resendcode = async () => {
    setCodeModal(false);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed') return <Badge className="status-pill-completed">Completed</Badge>;
    if (s === 'canceled') return <Badge className="status-pill-canceled">Canceled</Badge>;
    return <Badge className="status-pill-pending">Pending</Badge>;
  };

  // Helper to open action modal
  const handleActionClick = (ticket) => {
    setActiveTicket(ticket);
    setActionModal(true);
  };

  return (
    <div className="ticket-master-container">
      <ToastContainer className="mt-3" />

      <div className="table-card shadow-sm border-0">
        <div className="table-responsive">
          <table className="modern-ticket-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Ticket Info</th>
                <th>Status</th>
                <th>Assignments</th>
                <th>Source & Creator</th>
                <th>Closing Details</th>
                <th>Description</th>
                <th>RAC</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted fw-bold">Fetching records...</p>
                  </td>
                </tr>
              ) : arrayticket.length > 0 ? (
                arrayticket.map((ticket, index) => (
                  <tr key={index} className={ticket.status === "Canceled" ? "row-muted" : ""}>
                    <td className="text-center">
                       <button 
                        className="action-btn-circle" 
                        onClick={() => handleActionClick(ticket)}
                       >
                        <FaEllipsisV />
                       </button>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-indigo">{ticket.ticketno}</span>
                        <small className="text-muted"><FaClock className="me-1"/>{ticket.generatedDate}</small>
                      </div>
                    </td>
                    <td>{getStatusBadge(ticket.status)}</td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="fw-bold">{userMap[ticket.assignto] || "Unassigned"}</span>
                        <span className="text-muted">{ticket.assigndate}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column small">
                        <span className="fw-bold">{ticket.generateby}</span>
                        <span className="text-muted text-uppercase" style={{fontSize: '0.6rem'}}>{ticket.source}</span>
                      </div>
                    </td>
                    <td>
                      {ticket.closeby ? (
                        <div className="d-flex flex-column small">
                          <span className="fw-bold">{userMap[ticket.closeby]}</span>
                          <span className="text-muted">{ticket.closedate}</span>
                        </div>
                      ) : <span className="text-muted small">---</span>}
                    </td>
                    <td>
                      <div className="narration-truncate" title={ticket.description}>
                        {ticket.description || "No description provided"}
                      </div>
                    </td>
                    <td><span className="rac-badge">{ticket.rac || "---"}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="8" className="text-center py-5 text-muted">No Support Tickets Found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MAIN ACTION MODAL --- */}
      <Modal show={actionModal} onHide={() => setActionModal(false)} centered className="action-selection-modal">
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <h6 className="fw-bold text-muted text-uppercase mb-1" style={{letterSpacing: '1px'}}>Ticket Actions</h6>
            <h5 className="fw-bold text-dark">{activeTicket?.ticketno}</h5>
          </div>

          <div className="action-list">
            <button className="action-item" onClick={() => {
              setActionModal(false);
              if (activeTicket.status === "Completed") return alert("Ticket is Closed");
              navigate("modifyticket", { state: { ticket: { ...activeTicket, assigndate: `${activeTicket.assigndate} ${activeTicket.assigntime}` } } });
            }}>
              <div className="icon-box bg-primary-light text-primary"><FaEdit /></div>
              <div className="ms-3 flex-grow-1">
                <div className="fw-bold">Update Ticket</div>
                <div className="text-muted extra-small">Modify assignment or status</div>
              </div>
              <FaChevronRight className="text-light-gray" />
            </button>

            <button className="action-item" onClick={() => {
              setActionModal(false);
              if (!hasPermission("CLOSE_TICKET")) return alert("Permission Denied");
              if (activeTicket.status === "Completed") return alert("Ticket is Already Closed");
              if (window.confirm("Are you sure you want to cancel this ticket?")) {
                
                fetchTicket();
              }
            }}>
              <div className="icon-box bg-danger-light text-danger"><FaTimesCircle /></div>
              <div className="ms-3 flex-grow-1">
                <div className="fw-bold">Cancel Ticket</div>
                <div className="text-muted extra-small">Stop processing this ticket</div>
              </div>
              <FaChevronRight className="text-light-gray" />
            </button>

            <button className="action-item" onClick={() => {
              setActionModal(false);
              if (hasPermission("RESEND_CODE") && activeTicket.status === "Pending") {
                setSelectTicket({ ticketno: activeTicket.ticketno, mobile: activeTicket.mobile, happycode: activeTicket.happycode, name: activeTicket.name });
                setCodeModal(true);
              } else {
                setshowpermission(true);
              }
            }}>
              <div className="icon-box bg-success-light text-success"><FaRedo /></div>
              <div className="ms-3 flex-grow-1">
                <div className="fw-bold">Resend Happy Code</div>
                <div className="text-muted extra-small">Send verification SMS to client</div>
              </div>
              <FaChevronRight className="text-light-gray" />
            </button>
          </div>
          
          <button className="btn btn-light w-100 rounded-pill mt-4 fw-bold" onClick={() => setActionModal(false)}>Close</button>
        </Modal.Body>
      </Modal>

      {/* --- HAPPY CODE MODAL --- */}
      <Modal show={codemodal} onHide={() => setCodeModal(false)} centered className="modern-system-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">
            <FaRedo className="text-success me-2"/> Resend Happy Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">Ticket Reference: <span className="fw-bold text-dark">{selecticket.ticketno}</span></p>
          <div className="mb-3">
            <label className="field-label">Confirm Customer Mobile</label>
            <input 
              type="text" 
              className="modern-input-field" 
              defaultValue={selecticket.mobile}
              onChange={(e) => setSelectTicket({...selecticket, mobile: e.target.value})}
              maxLength={10}
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setCodeModal(false)}>Cancel</button>
          <button className="btn-indigo-gradient rounded-pill px-4 border-0 fw-bold" onClick={resendcode}>Send Code</button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .ticket-master-container { padding: 5px; }
        .text-indigo { color: #4f46e5; }
        .extra-small { font-size: 0.75rem; }
        .text-light-gray { color: #cbd5e1; }
        .table-card { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
        
        .modern-ticket-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .modern-ticket-table thead th { 
          background: #f8fafc; color: #64748b; font-size: 0.7rem; 
          text-transform: uppercase; letter-spacing: 1px; padding: 18px 15px; font-weight: 800;
          border-bottom: 1px solid #f1f5f9;
        }

        .table-responsive { width: 100%; overflow-x: auto; min-height: 390px; }
        .modern-ticket-table tbody td { padding: 16px 15px; vertical-align: middle; border-bottom: 1px solid #f8fafc; font-size: 0.85rem; color: #334155; }
        
        .action-btn-circle { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; transition: 0.2s; margin: 0 auto; }
        .action-btn-circle:hover { background: #4f46e5; color: white; }

        /* Status Pills */
        .status-pill-completed { background: #dcfce7 !important; color: #166534 !important; font-size: 0.65rem; padding: 5px 12px; border-radius: 50px; font-weight: 800; border: none; }
        .status-pill-canceled { background: #fee2e2 !important; color: #991b1b !important; font-size: 0.65rem; padding: 5px 12px; border-radius: 50px; font-weight: 800; border: none; }
        .status-pill-pending { background: #fef9c3 !important; color: #854d0e !important; font-size: 0.65rem; padding: 5px 12px; border-radius: 50px; font-weight: 800; border: none; }

        /* Action Modal Styles */
        .action-item {
          display: flex; align-items: center; width: 100%; padding: 12px; border: 1px solid #f1f5f9;
          border-radius: 12px; background: white; margin-bottom: 10px; transition: 0.2s; text-align: left;
        }
        .action-item:hover { background: #f8fafc; border-color: #e2e8f0; transform: translateY(-2px); }
        .icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        
        .bg-primary-light { background: #eef2ff; }
        .bg-danger-light { background: #fef2f2; }
        .bg-success-light { background: #f0fdf4; }

        .rac-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: 700; color: #475569; font-size: 0.75rem; border: 1px solid #e2e8f0; }
        .row-muted { background: #fdfdfd; opacity: 0.7; }
        .narration-truncate { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #64748b; }
        
        .btn-indigo-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 8px 20px; }
        .field-label { font-size: 0.7rem; font-weight: 800; color: #475569; margin-bottom: 6px; text-transform: uppercase; display: block; }
        .modern-input-field { width: 100%; padding: 10px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; outline: none; transition: 0.2s; }
        .modern-input-field:focus { border-color: #4f46e5; }
      `}</style>
    </div>
  );
}