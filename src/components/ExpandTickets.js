import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { isThisMonth, isThisWeek, isToday, subDays, parseISO } from "date-fns";
import SmallModal from "./SmallModal";
import CloseTicketModal from "./CloseTicketModal";
import { usePermissions } from "./PermissionProvider";
import { API } from "../FirebaseConfig";
import {
  FiRefreshCw,
  FiXCircle,
  FiDownload,
  FiX,
  FiSearch,
  FiFilter,
  FiUser,
  FiClock,
} from "react-icons/fi";

const ExpandTickets = ({ viewShow, ticketType, closeView }) => {
  const partnerId = localStorage.getItem("partnerId");
  const { hasPermission } = usePermissions();
  const [arrayData, setArrayData] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("All Time");
  const [filterStatus, setFilterStatus] = useState("Pending");
  const [ticketSource, setTicketSource] = useState("All");
  const [filterUserId, setFilterUserId] = useState("All");
  const [filterData, setFilteredData] = useState([]);

  const [showsmallModal, setShowSmallModal] = useState(false);
  const [ticketclosemodal, setTicketCloseModal] = useState(false);
  const [ticketno, setTicketno] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchExpandData = async () => {
    try {
      const ticketResponse = await API.get(
        `/dashboard-data/tickets/${partnerId}?data=Pending`,
      );
      if (ticketResponse.status !== 200) return;
      const ticketData = ticketResponse.data;
      if (ticketData) setArrayData(ticketData);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (viewShow) fetchExpandData();
  }, [viewShow, showsmallModal, ticketclosemodal]);

  useEffect(() => {
    let filteredArray = arrayData;
    const currentDate = new Date();

    switch (filterPeriod) {
      case "Today":
        filteredArray = arrayData.filter((data) =>
          isToday(parseISO(data.creationdate)),
        );
        break;
      case "This Week":
        filteredArray = arrayData.filter((data) =>
          isThisWeek(parseISO(data.creationdate)),
        );
        break;
      case "This Month":
        filteredArray = arrayData.filter((data) =>
          isThisMonth(parseISO(data.creationdate)),
        );
        break;
      case "Last 7 Days":
        filteredArray = arrayData.filter(
          (data) => parseISO(data.creationdate) >= subDays(currentDate, 7),
        );
        break;
      case "Last 30 Days":
        filteredArray = arrayData.filter(
          (data) => parseISO(data.creationdate) >= subDays(currentDate, 30),
        );
        break;
      default:
        break;
    }

    if (filterStatus !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.Status === filterStatus,
      );
    if (ticketSource !== "All")
      filteredArray = filteredArray.filter(
        (data) => data.source === ticketSource,
      );
    if (filterUserId !== "All" && filterUserId !== "") {
      filteredArray = filteredArray.filter((data) =>
        data.subsID.toLowerCase().includes(filterUserId.toLowerCase()),
      );
    }

    setFilteredData(filteredArray);
    setCurrentPage(1);
  }, [filterPeriod, filterStatus, arrayData, ticketSource, filterUserId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filterData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filterData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filterData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ticket Summary");
    XLSX.writeFile(workbook, `Tickets_Report.xlsx`);
  };

  if (!viewShow) return null;

  return (
    <div className="tk-overlay">
      <div className="tk-container">
        {/* Header */}
        <header className="tk-header">
          <div className="tk-header-info">
            <div className="tk-title-icon">
              <FiFilter size={20} />
            </div>
            <div>
              <h3>Ticket Summary</h3>
              <p>Manage and track support requests</p>
            </div>
          </div>
          <div className="tk-header-actions">
            <button
              className="tk-btn-icon excel"
              onClick={downloadExcel}
              title="Download Report"
            >
              <FiDownload size={18} />
            </button>
            <button className="tk-btn-close" onClick={closeView}>
              <FiX size={24} />
            </button>
          </div>
        </header>

        {/* Filters Grid */}
        <div className="tk-filters">
          <div className="tk-filter-grid">
            <div className="tk-input-group">
              <label>
                <FiSearch size={12} /> Search UserID
              </label>
              <input
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="Search ID..."
                type="text"
              />
            </div>
            <div className="tk-input-group">
              <label>
                <FiClock size={12} /> Period
              </label>
              <select onChange={(e) => setFilterPeriod(e.target.value)}>
                <option>All Time</option>
                <option>Today</option>
                <option>Last 7 Days</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="tk-input-group">
              <label>Status</label>
              <select onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="Pending">Open Tickets</option>
                <option value="All">All Tickets</option>
                <option value="Completed">Closed Tickets</option>
                <option value="Unassigned">Unassigned Tickets</option>
              </select>
            </div>
            <div className="tk-input-group">
              <label>Source</label>
              <select onChange={(e) => setTicketSource(e.target.value)}>
                <option value="All">All Sources</option>
                <option value="Manual">Manual</option>
                <option value="WhatsApp">Whatsapp Bot</option>
                <option value="Mobile App">Customer App</option>
              </select>
            </div>
          </div>
        </div>

        <SmallModal
          show={showsmallModal}
          ticketno={ticketno}
          closeModal={() => setShowSmallModal(false)}
        />
        <CloseTicketModal
          show={ticketclosemodal}
          ticketno={ticketno}
          closeModal={() => setTicketCloseModal(false)}
        />

        {/* Main Content Area */}
        <main className="tk-main">
          {/* Desktop Table */}
          <div className="tk-table-wrapper desktop-only">
            <table className="tk-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Details</th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Timeline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTickets.length > 0 ? (
                  currentTickets.map((ticket, index) => (
                    <tr key={index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        <div className="tk-user-cell">
                          <span className="tk-uid">{ticket.subsID}</span>
                          <span className="tk-co">{ticket.company}</span>
                        </div>
                      </td>
                      <td>
                        <div className="tk-concern-cell">
                          <strong>{ticket.Concern}</strong>
                          <p title={ticket.Description}>{ticket.Description}</p>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`tk-status-pill ${ticket.Status?.toLowerCase()}`}
                        >
                          {ticket.Status}
                        </span>
                      </td>
                      <td>{ticket.Assign_to || "---"}</td>
                      <td>{ticket.createby}</td>
                      <td>
                        <div className="tk-time-cell">
                          <span>
                            {new Date(ticket.generatedDate).toLocaleDateString(
                              "en-GB",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                          <small>{ticket.Time}</small>
                        </div>
                      </td>
                      <td>
                        <div className="tk-actions">
                          <button
                            className="tk-act-btn reassing"
                            onClick={() => {
                              if (hasPermission("REASSING_TICKET")) {
                                setShowSmallModal(true);
                                setTicketno({ ...ticket });
                              } else alert("Permission Denied");
                            }}
                          >
                            <FiRefreshCw />
                          </button>
                          <button
                            className="tk-act-btn close-tk"
                            onClick={() => {
                              if (hasPermission("CLOSE_TICKET")) {
                                setTicketCloseModal(true);
                                setTicketno({ ...ticket });
                              } else alert("Permission Denied");
                            }}
                          >
                            <FiXCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="tk-no-data">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="tk-mobile-list mobile-only">
            {currentTickets.map((ticket, index) => (
              <div className="tk-card" key={index}>
                <div className="tk-card-header">
                  <span className="tk-card-id">{ticket.subsID}</span>
                  <span
                    className={`tk-status-pill ${ticket.Status?.toLowerCase()}`}
                  >
                    {ticket.Status}
                  </span>
                </div>
                <div className="tk-card-body">
                  <div className="tk-card-row">
                    <strong>Concern:</strong> {ticket.Concern}
                  </div>
                  <div className="tk-card-row">
                    <strong>Description:</strong> {ticket.Description}
                  </div>
                  <div className="tk-card-row">
                    <strong>Assigned:</strong> {ticket.Assign_to}
                  </div>
                </div>
                <div className="tk-card-footer">
                  <span>
                    {ticket.Time} | {ticket.creationdate}
                  </span>
                  <div className="tk-actions">
                    <button
                      className="tk-act-btn reassing"
                      onClick={() => {
                        if (hasPermission("REASSING_TICKET")) {
                          setShowSmallModal(true);
                          setTicketno({ ...ticket });
                        } else alert("Permission Denied");
                      }}
                    >
                      <FiRefreshCw />
                    </button>
                    <button
                      className="tk-act-btn close-tk"
                      onClick={() => {
                        if (hasPermission("CLOSE_TICKET")) {
                          setTicketCloseModal(true);
                          setTicketno({ ...ticket });
                        } else alert("Permission Denied");
                      }}
                    >
                      <FiXCircle />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <footer className="tk-footer">
            <div className="tk-pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="tk-pag-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </div>

      <style>{`
                .tk-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem;
                }
                .tk-container {
                    background: #f8fafc; width: 100%; max-width: 1200px; height: 90vh;
                    border-radius: 16px; display: flex; flex-direction: column; overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
                }
                .tk-header {
                    padding: 1.25rem 1.5rem; background: #fff; border-bottom: 1px solid #e2e8f0;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .tk-header-info { display: flex; align-items: center; gap: 1rem; }
                .tk-title-icon { background: #eff6ff; color: #3b82f6; padding: 10px; border-radius: 10px; }
                .tk-header-info h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
                .tk-header-info p { margin: 0; font-size: 0.85rem; color: #64748b; }
                .tk-header-actions { display: flex; align-items: center; gap: 10px; }
                .tk-btn-icon { border: 1px solid #e2e8f0; background: #fff; padding: 8px; border-radius: 8px; cursor: pointer; color: #64748b; transition: 0.2s; }
                .tk-btn-icon:hover { background: #f1f5f9; color: #3b82f6; }
                .tk-btn-close { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.2s; }
                .tk-btn-close:hover { color: #ef4444; }

                .tk-filters { padding: 1.25rem 1.5rem; background: #fff; border-bottom: 1px solid #e2e8f0; }
                .tk-filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
                .tk-input-group { display: flex; flex-direction: column; gap: 6px; }
                .tk-input-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; display: flex; align-items: center; gap: 4px; }
                .tk-input-group input, .tk-input-group select {
                    padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; outline: none; transition: 0.2s;
                }
                .tk-input-group input:focus, .tk-input-group select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

                .tk-main { flex: 1; overflow-y: auto; padding: 1.5rem; }
                .tk-table-wrapper { width: 100%; overflow-x: auto; }    
                .tk-table { width: 100%; border-collapse: separate; border-spacing: 0; }
                .tk-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
                .tk-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
                
                .tk-user-cell { display: flex; flex-direction: column; }
                .tk-uid { font-weight: 700; color: #1e293b; }
                .tk-co { font-size: 0.75rem; color: #94a3b8; }
                
                .tk-concern-cell p { margin: 4px 0 0; font-size: 0.8rem; color: #64748b; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .tk-status-pill { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
                .tk-status-pill.pending { background: #fff7ed; color: #c2410c; }
                .tk-status-pill.completed { background: #f0fdf4; color: #15803d; }
                .tk-status-pill.unassigned { background: #f1f5f9; color: #475569; }

                .tk-actions { display: flex; gap: 8px; }
                .tk-act-btn { border: none; background: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: 0.2s; }
                .tk-act-btn.reassing { color: #3b82f6; background: #eff6ff; }
                .tk-act-btn.close-tk { color: #ef4444; background: #fef2f2; }
                .tk-act-btn:hover { transform: translateY(-1px); filter: brightness(0.95); }

                .tk-footer { padding: 1rem 1.5rem; background: #fff; border-top: 1px solid #e2e8f0; }
                .tk-pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; }
                .tk-pagination button { padding: 6px 16px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px; cursor: pointer; }
                .tk-pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
                .tk-pag-info { font-size: 0.9rem; color: #64748b; font-weight: 500; }

                .desktop-only { display: table; }
                .mobile-only { display: none; }

                @media (max-width: 900px) {
                    .desktop-only { display: none; }
                    .mobile-only { display: block; }
                    .tk-filter-grid { grid-template-columns: 1fr 1fr; }
                    .tk-container { height: 95vh; }
                    .tk-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
                    .tk-card-header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
                    .tk-card-id { font-weight: 700; color: #1e293b; }
                    .tk-card-body { font-size: 0.85rem; color: #64748b; }
                    .tk-card-row { margin-bottom: 4px; }
                    .tk-card-footer { margin-top: 12px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; }
                }

                @media (max-width: 500px) {
                    .tk-filter-grid { grid-template-columns: 1fr; }
                }
            `}</style>
    </div>
  );
};

export default ExpandTickets;
