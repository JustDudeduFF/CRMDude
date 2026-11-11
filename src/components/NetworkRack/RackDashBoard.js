import React, { useEffect, useState } from "react";
import { API } from "../../FirebaseConfig";
import { Route, Routes, useNavigate } from "react-router-dom";
import RackDash from "./RackDash";
import RackView from "./RackView";
import { Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {
  Server,
  Plus,
  ChevronRight,
  Layout,
  MapPin,
  X,
  Menu,
  Pencil,
  Trash2,
} from "lucide-react";

export default function RackDashBoard() {
  const partnerId = localStorage.getItem("partnerId");
  const [RackID, setRackId] = useState("");
  const [roomarray, setRoomArray] = useState([]);
  const [showroom, setShowRoom] = useState(false);
  const [rackname, setRackName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Mobile Toggle

  // Edit Office Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState({ officeKey: "", officename: "" });

  const navigate = useNavigate();

  useEffect(() => {
    fetchRacks();
  }, []);

  const handleClick = async () => {
    try {
      const RoomData = {
        officeKey: rackname.trim().toLowerCase().replace(/\s+/g, "_"),
        officename: rackname.trim(),
        creationdate: new Date().toISOString().split("T")[0],
        createby: localStorage.getItem("contact"),
      };

      const response = await API.post(`/rackinfo/${RackID}/offices`, RoomData);

      if (response.data.success) {
        toast.success("Server/Rack Added!", {
          position: "top-right",
          autoClose: 3000,
        });

        setShowRoom(false);
        setRackName("");
        fetchRacks();
      }
    } catch (error) {
      console.error("Error adding office:", error);
      toast.error(error.response?.data?.message || "Failed to add server/rack");
    }
  };

  // Open Edit Modal
  const openEditOffice = (e, office) => {
    e.stopPropagation();
    setEditingOffice({
      officeKey: office.officeKey,
      officename: office.name,
    });
    setShowEditModal(true);
  };

  // Save Office Name (PUT /api/rackinfo/:id/offices/:officeKey)
  const handleUpdateOffice = async () => {
    if (!editingOffice.officename.trim()) {
      toast.error("Office name cannot be empty");
      return;
    }

    try {
      const response = await API.put(
        `/rackinfo/${RackID}/offices/${editingOffice.officeKey}`,
        {
          officename: editingOffice.officename.trim(),
        }
      );

      if (response.data.success) {
        toast.success("Office name updated!");
        setShowEditModal(false);
        fetchRacks();
      }
    } catch (error) {
      console.error("Error updating office:", error);
      toast.error(error.response?.data?.message || "Failed to update office");
    }
  };

  // Delete Office (DELETE /api/rackinfo/:id/offices/:officeKey)
  const handleDeleteOffice = async (e, officeKey, officename) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete rack/office "${officename}"? This will delete all devices inside it.`)) {
      return;
    }

    try {
      const response = await API.delete(`/rackinfo/${RackID}/offices/${officeKey}`);
      if (response.data.success) {
        toast.success("Office deleted successfully!");
        fetchRacks();
        navigate("/dashboard/networkrack");
      }
    } catch (error) {
      console.error("Error deleting office:", error);
      toast.error(error.response?.data?.message || "Failed to delete office");
    }
  };

  const showRackView = (rackId, officeKey, officename) => {
    navigate("/dashboard/networkrack/rackview", {
      state: {
        rackId,
        officeKey,
        officename,
      },
    });

    setIsSidebarOpen(false);
  };

  const fetchRacks = async () => {
    try {
      const response = await API.get(`/rackinfo?partnerId=${partnerId}`);

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }

      // If array returned, get first document, else single document
      const rack = Array.isArray(response.data?.data)
        ? response.data.data[0]
        : response.data?.data;

      if (!rack) return;
      setRackId(rack._id);

      // Convert offices object into an array
      const offices = Object.entries(rack.offices || {}).map(
        ([officeId, office]) => ({
          officeId,
          ...office,
        })
      );

      // Get office names
      const roomArray = offices.map((office) => ({
        officeKey: office.officeId,
        name: office.officename,
      }));

      setRoomArray(roomArray);
    } catch (error) {
      console.error("Error fetching racks:", error);
    }
  };

  return (
    <div className="rack-dashboard-container">
      <ToastContainer />

      {/* Top Navigation Bar */}
      <header className="rack-header">
        <div className="d-flex align-items-center gap-2">
          <button
            className="mobile-menu-btn d-lg-none"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <Server className="text-primary" size={28} />
          <div>
            <h4 className="m-0 fw-bold text-dark">Network Infrastructure</h4>
            <p className="small text-muted m-0 d-none d-sm-block">
              Rack & Server Management
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRoom(true)}
          className="btn btn-primary btn-add-room"
        >
          <Plus size={18} />
          <span>New Rack</span>
        </button>
      </header>

      <div className="dashboard-content">
        {/* Sidebar / Room List */}
        <aside className={`room-sidebar ${isSidebarOpen ? "active" : ""}`}>
          <div className="sidebar-header d-lg-none">
            <h5 className="m-0">Server Racks</h5>
            <button
              className="btn-close-sidebar"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="sidebar-inner">
            <div className="sidebar-label">
              <Layout size={14} />
              <span>AVAILABLE RACKS</span>
            </div>
            <nav className="room-nav">
              {roomarray.length > 0 ? (
                roomarray.map((room) => (
                  <div
                    key={room.officeKey}
                    onClick={() => showRackView(RackID, room.officeKey, room.name)}
                    className="room-nav-item"
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <div className="status-indicator online flex-shrink-0"></div>
                      <span className="room-name text-truncate">{room.name}</span>
                    </div>

                    <div className="d-flex align-items-center gap-1 item-actions">
                      <button
                        className="btn-action edit"
                        title="Edit Name"
                        onClick={(e) => openEditOffice(e, room)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn-action delete"
                        title="Delete Rack"
                        onClick={(e) => handleDeleteOffice(e, room.officeKey, room.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="chevron" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted small">
                  No rooms found.
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Viewport */}
        <main className="rack-viewport">
          <div className="viewport-card shadow-sm">
            <Routes>
              <Route path="/" element={<RackDash />} />
              <Route path="/rackview" element={<RackView />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* New Rack Modal */}
      <Modal
        show={showroom}
        onHide={() => setShowRoom(false)}
        centered
        className="custom-rack-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Configure New Rack</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="p-3 bg-light rounded-3 mb-3">
            <div className="d-flex align-items-center gap-2 text-primary mb-2">
              <MapPin size={18} />
              <span className="fw-semibold">Rack Name Assignment</span>
            </div>
            <p className="small text-muted m-0">Enter Rack Name or Any Identity.</p>
          </div>
          <div className="form-group">
            <label className="form-label fw-bold small">RACK NAME</label>
            <input
              type="text"
              value={rackname}
              onChange={(e) => setRackName(e.target.value)}
              className="form-control form-control-lg"
              placeholder="Enter rack name..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button
            onClick={() => setShowRoom(false)}
            className="btn btn-link text-muted text-decoration-none"
          >
            Cancel
          </button>
          <button
            onClick={handleClick}
            className="btn btn-primary px-4 shadow-sm"
            disabled={!rackname.trim()}
          >
            Initialize Rack
          </button>
        </Modal.Footer>
      </Modal>

      {/* Edit Office Name Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
        className="custom-rack-modal"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Edit Rack / Office Name</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <div className="form-group">
            <label className="form-label fw-bold small">RACK / OFFICE NAME</label>
            <input
              type="text"
              value={editingOffice.officename}
              onChange={(e) =>
                setEditingOffice({ ...editingOffice, officename: e.target.value })
              }
              className="form-control form-control-lg"
              placeholder="Enter new rack name..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <button
            onClick={() => setShowEditModal(false)}
            className="btn btn-link text-muted text-decoration-none"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateOffice}
            className="btn btn-primary px-4 shadow-sm"
          >
            Save Changes
          </button>
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
          width: 300px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .sidebar-inner {
          padding: 20px 14px;
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
          gap: 6px;
        }

        .room-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 10px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .room-nav-item:hover {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .room-nav-item:hover .item-actions {
          opacity: 1;
        }

        .item-actions {
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .btn-action {
          background: transparent;
          border: none;
          padding: 4px 6px;
          border-radius: 4px;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-action.edit:hover {
          background: #e0f2fe;
          color: #0284c7;
        }

        .btn-action.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .room-name {
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          max-width: 140px;
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
          .room-sidebar {
            position: fixed;
            top: 0;
            left: -320px;
            height: 100%;
            z-index: 1000;
            box-shadow: 20px 0 50px rgba(0, 0, 0, 0.1);
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