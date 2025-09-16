import React, { useEffect, useState } from "react";
import "./Dashboard.css"; // Import the custom CSS file
import { Modal } from "react-bootstrap";
import axios from "axios";
import { api2 } from "../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tableData, setTableData] = useState([]);

  const [partnerData, setPartnerData] = useState({
    name: "",
    companyname: "",
    phone: "",
    address: "",
    email: "",
    gstin: "",
    isWhatsapp: false,
    isEmail: false,
    isPayment: false,
    whatsappApi: "",
    emailhost: "",
    emailport: "",
    keyid: "",
    keysecret: "",
    status: "Active",
    state: "",
    pincode: "",
  });

  const handleSaveplan = async () => {
    if (selectedPartner) {
      try {
        const response = await axios.put(api2 + "/partner/" + selectedPartner, {
          partnerData,
        });
        if (response.status === 200)
          toast.success(`${partnerData.companyname} added succesfully`, {
            autoClose: 2000,
          });
        setSelectedPartner(null);
        setPartnerData({
          name: "",
          companyname: "",
          phone: "",
          address: "",
          email: "",
          gstin: "",
          isWhatsapp: false,
          isEmail: false,
          isPayment: false,
          whatsappApi: "",
          emailhost: "",
          emailport: "",
          keyid: "",
          keysecret: "",
          status: "Active",
        });
      } catch (e) {
        console.log(e);
      }
      return;
    }
    try {
      const resposne = await axios.post(api2 + "/partner", { partnerData });

      if (resposne.status === 200)
        toast.success(`${partnerData.companyname} added succesfully`, {
          autoClose: 2000,
        });

      setPartnerData({
        name: "",
        companyname: "",
        phone: "",
        address: "",
        email: "",
        gstin: "",
        isWhatsapp: false,
        isEmail: false,
        isPayment: false,
        whatsappApi: "",
        emailhost: "",
        emailport: "",
        keyid: "",
        keysecret: "",
        status: "Active",
        state: "",
        pincode: "",
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  // Sample data for cards with enhanced information
  const cardData = [
    {
      title: "Total Partners",
      count: tableData.length,
      icon: "👥",
      change: "+12%",
      changeType: "positive",
      iconClass: "blue",
    },
    {
      title: "Active Partners",
      count: "142",
      icon: "✅",
      change: "+8%",
      changeType: "positive",
      iconClass: "green",
    },
    {
      title: "Total Revenue",
      count: "$25,236",
      icon: "💰",
      change: "+15%",
      changeType: "positive",
      iconClass: "purple",
    },
  ];

  // Enhanced sample data for table

  // Filter data based on search term and status
  const filteredData = tableData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleView = (id) => {
    console.log("View item:", id);
  };

  const handleEdit = (id) => {
    setSelectedPartner(id);
    const partner = tableData.find((item) => item._id === id);
    setPartnerData(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this partner?"
    );
    if (!confirmDelete) return; // Stop if user cancels

    try {
      const response = await axios.delete(api2 + "/partner/" + id);

      if (response.status !== 200) {
        return toast.error("Failed to Delete Partner", { autoClose: 2000 });
      }

      toast.success("Partner Deleted Successfully", { autoClose: 2000 });
      fetchData();
    } catch (e) {
      console.log(e);
      toast.error("An error occurred while deleting", { autoClose: 2000 });
    }
  };

  // Generate avatar initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const fetchData = async () => {
    try {
      const resposne = await axios.get(api2 + "/partner");
      console.log(resposne.data);

      setTableData(resposne.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <ToastContainer />
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Partner Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage and monitor your business partnerships
            </p>
          </div>
          <button
            onClick={() => {
              console.log("Clicked");
              setIsModalOpen(true);
            }}
            className="add-partner-btn"
          >
            <span>+</span>
            Add Partner
          </button>
        </div>

        {/* Stats Cards */}
        <div className="cards-container">
          {cardData.map((card, index) => (
            <div key={index} className="card fade-in">
              <div className="card-header">
                <div className={`card-icon-container ${card.iconClass}`}>
                  <span className="card-icon">{card.icon}</span>
                </div>
                <span className={`card-change ${card.changeType}`}>
                  {card.change}
                </span>
              </div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-count">{card.count}</p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="table-container slide-up">
          <div className="table-header">
            <h2 className="table-title">Partners List</h2>

            {/* Search and Filter Controls */}
            <div className="table-controls">
              <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-container">
                <span className="filter-icon">⚬</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Partner Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index + 1}>
                  <td>
                    <span className="partner-id">#{index + 1}</span>
                  </td>
                  <td>
                    <div className="partner-info">
                      <div className="partner-avatar">
                        {getInitials(row.name)}
                      </div>
                      <div className="partner-name">{row.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="partner-company">{row.companyname}</span>
                  </td>
                  <td>
                    <span className="partner-email">{row.email}</span>
                  </td>
                  <td>
                    <span className="partner-revenue">{row.revenue}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${row.status.toLowerCase()}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        onClick={() => handleView(row.id)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(row._id)}
                        title="Edit Partner"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(row._id)}
                        title="Delete Partner"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className="table-footer">
            <span>
              Showing {filteredData.length} of {tableData.length} partners
            </span>
            <div className="pagination">
              <button className="pagination-btn">Previous</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">Next</button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={isModalOpen}
        onHide={() => {
          setIsModalOpen(false);
          setSelectedPartner(null);
          setPartnerData({
            name: "",
            companyname: "",
            phone: "",
            address: "",
            email: "",
            gstin: "",
            isWhatsapp: false,
            isEmail: false,
            isPayment: false,
            whatsappApi: "",
            emailhost: "",
            emailport: "",
            keyid: "",
            keysecret: "",
            status: "Active",
            state: "",
            pincode: "",
          });
        }}
        className="payment-modal modal-lg"
      >
        <Modal.Header>
          <Modal.Title>Add New Partner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            <div className="row justify-content-center">
              <div className="col-md-4 mb-2">
                <label className="payment-form-label">Partner Name: </label>
                <input
                  value={partnerData.name}
                  onChange={(e) =>
                    setPartnerData({
                      ...partnerData,
                      name: e.target.value,
                    })
                  }
                  className="form-control"
                ></input>
              </div>

              <div className="col-md-4 mb-2">
                <label className="payment-form-label">Company: </label>
                <input
                  value={partnerData.companyname}
                  onChange={(e) =>
                    setPartnerData({
                      ...partnerData,
                      companyname: e.target.value,
                    })
                  }
                  className="form-control"
                ></input>
              </div>
              <div className="col-md-4 mb-2">
                <label className="payment-form-label">Mobile: </label>
                <input
                  value={partnerData.phone}
                  onChange={(e) =>
                    setPartnerData({ ...partnerData, phone: e.target.value })
                  }
                  className="form-control "
                ></input>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-6 mb-2">
                <label className="payment-form-label">Address:</label>
                <input
                  value={partnerData.address}
                  onChange={(e) =>
                    setPartnerData({ ...partnerData, address: e.target.value })
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="payment-form-label">Email:</label>
                <input
                  value={partnerData.email}
                  onChange={(e) =>
                    setPartnerData({ ...partnerData, email: e.target.value })
                  }
                  type="email"
                  className="form-control"
                />
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-6 mb-2">
                <label className="payment-form-label">State:</label>
                <input
                  value={partnerData.state}
                  onChange={(e) =>
                    setPartnerData({ ...partnerData, state: e.target.value })
                  }
                  type="text"
                  className="form-control"
                />
              </div>

              <div className="col-md-6 mb-2">
                <label className="payment-form-label">Pincode:</label>
                <input
                  value={partnerData.pincode}
                  onChange={(e) =>
                    setPartnerData({ ...partnerData, pincode: e.target.value })
                  }
                  type="email"
                  className="form-control"
                />
              </div>
            </div>

            <div className="d-flex flex-column col-md">
              <label className="payment-form-label">GSTIN: </label>
              <input
                value={partnerData.gstin}
                onChange={(e) =>
                  setPartnerData({ ...partnerData, gstin: e.target.value })
                }
                className="form-control"
              ></input>
            </div>

            <label
              style={{ textDecoration: "underline", fontSize: "20px" }}
              className="payment-form-label"
            >
              Services Allowed
            </label>

            <div className="">
              <input
                checked={partnerData.isWhatsapp}
                id="whatsapp"
                className="form-check-input mt-2 me-3"
                type="checkbox"
                onChange={(e) =>
                  setPartnerData({
                    ...partnerData,
                    isWhatsapp: e.target.checked,
                  })
                }
              ></input>
              <label htmlFor="whatsapp" className="payment-form-label">
                Is Whatspp Enabled
              </label>
            </div>

            {partnerData.isWhatsapp && (
              <div className="d-flex flex-column col-md">
                <label className="payment-form-label">Whatsapp API</label>
                <input
                  value={partnerData.whatsappApi}
                  onChange={(e) =>
                    setPartnerData({
                      ...partnerData,
                      whatsappApi: e.target.value,
                    })
                  }
                  className="form-control"
                ></input>
              </div>
            )}

            <div className="mt-2">
              <input
                checked={partnerData.isEmail}
                id="email"
                className="form-check-input mt-2 me-3"
                type="checkbox"
                onChange={(e) =>
                  setPartnerData({ ...partnerData, isEmail: e.target.checked })
                }
              ></input>
              <label htmlFor="email" className="payment-form-label">
                Is Email Enabled
              </label>
            </div>

            {partnerData.isEmail && (
              <div className="row justify-content-center">
                <div className="col-md-6 mb-2">
                  <label className="payment-form-label">Host Key</label>
                  <input
                    value={partnerData.emailhost}
                    onChange={(e) =>
                      setPartnerData({
                        ...partnerData,
                        emailhost: e.target.value,
                      })
                    }
                    className="form-control"
                  ></input>
                </div>

                <div className="col-md-6 mb-2">
                  <label className="payment-form-label">Host Port</label>
                  <input
                    value={partnerData.emailport}
                    onChange={(e) =>
                      setPartnerData({
                        ...partnerData,
                        emailport: e.target.value,
                      })
                    }
                    className="form-control"
                  ></input>
                </div>
              </div>
            )}

            <div className="mt-2">
              <input
                checked={partnerData.isPayment}
                id="online"
                className="form-check-input mt-2 me-3"
                type="checkbox"
                onChange={(e) =>
                  setPartnerData({
                    ...partnerData,
                    isPayment: e.target.checked,
                  })
                }
              ></input>
              <label htmlFor="online" className="payment-form-label">
                Is Online Payment Enabled
              </label>
            </div>

            {partnerData.isPayment && (
              <div className="row justify-content-center">
                <div className="col-md-6">
                  <label className="payment-form-label">Key ID</label>
                  <input
                    value={partnerData.keyid}
                    onChange={(e) =>
                      setPartnerData({ ...partnerData, keyid: e.target.value })
                    }
                    className="form-control"
                  ></input>
                </div>

                <div className="col-md-6">
                  <label className="payment-form-label">Key Secret</label>
                  <input
                    value={partnerData.keysecret}
                    onChange={(e) =>
                      setPartnerData({
                        ...partnerData,
                        keysecret: e.target.value,
                      })
                    }
                    className="form-control"
                  ></input>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex justify-content-end gap-2 w-100">
            <button onClick={handleSaveplan} className="btn btn-success">
              {selectedPartner ? "Update Partner" : "Add Partner"}
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedPartner(null);
                setPartnerData({
                  name: "",
                  companyname: "",
                  phone: "",
                  address: "",
                  email: "",
                  gstin: "",
                  isWhatsapp: false,
                  isEmail: false,
                  isPayment: false,
                  whatsappApi: "",
                  emailhost: "",
                  emailport: "",
                  keyid: "",
                  keysecret: "",
                  status: "Active",
                  state: "",
                  pincode: "",
                });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
