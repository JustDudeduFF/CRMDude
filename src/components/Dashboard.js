import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Badge, Table } from "react-bootstrap";
import { API } from "../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import "./Dashboard.css"; 

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tableData, setTableData] = useState([]);
  const [uploadFile, setUploadFile] = useState(false);
  const [datatoUpload, setDataToUpload] = useState(null);
  const [partnerId, setPartnerId] = useState("");

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

  const resetForm = () => {
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
  };

  const handleSaveplan = async () => {
    if (selectedPartner) {
      try {
        const response = await API.put(`/partner/${selectedPartner}`, { partnerData });
        if (response.status === 200) {
          toast.success(`${partnerData.companyname} updated successfully`);
          setIsModalOpen(false);
          fetchData();
          resetForm();
        }
      } catch (e) { console.log(e); }
      return;
    }
    try {
      const response = await API.post(`/partner`, { partnerData });
      if (response.status === 200) {
        toast.success(`${partnerData.companyname} added successfully`);
        setIsModalOpen(false);
        fetchData();
        resetForm();
      }
    } catch (e) { console.log(e); }
  };

  const uploadData = async () => {
    if (!datatoUpload) {
      alert("Please select an Excel file");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", datatoUpload);
      formData.append("partnerId", partnerId);
      const response = await API.post(`/subscriber/bulkuserupload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(`Upload completed: ${response.data.inserted} users added`);
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Upload failed.");
    } finally {
      setUploadFile(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await API.get(`/partner`);
      setTableData(response.data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getInitials = (name) => name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "??";

  const handleEdit = (id) => {
    setSelectedPartner(id);
    const partner = tableData.find((item) => item._id === id);
    setPartnerData(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await API.delete(`/partner/${id}`);
      if (response.status === 200) {
        toast.success("Partner Deleted");
        fetchData();
      }
    } catch (e) { console.log(e); }
  };

  return (
    <div className="dashboard-wrapper bg-light min-vh-100 pb-5">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="bg-white border-bottom py-4 mb-4">
        <div className="container-fluid px-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1">Partner Management</h4>
              <p className="text-muted small mb-0">Monitor and update your business ecosystem</p>
            </div>
            <Button variant="primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={() => setIsModalOpen(true)}>
              <span className="fs-5">+</span> Add New Partner
            </Button>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4">
        {/* Stats Section */}
        <Row className="g-3 mb-4">
          {[
            { title: "Total Partners", count: tableData.length, icon: "👥", color: "blue" },
            { title: "Active Partners", count: "142", icon: "✅", color: "green" },
            { title: "Total Revenue", count: "$25,236", icon: "💰", color: "purple" }
          ].map((card, i) => (
            <Col key={i} xs={12} md={4}>
              <div className="stats-card p-3 shadow-sm border-0 h-100 bg-white rounded-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className={`icon-box ${card.color}`}>{card.icon}</div>
                  <Badge bg="soft-success" className="text-success">+12%</Badge>
                </div>
                <div className="mt-3">
                  <p className="text-muted small fw-medium mb-1">{card.title}</p>
                  <h3 className="fw-bold mb-0">{card.count}</h3>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Filters & Table */}
        <div className="bg-white shadow-sm rounded-3 overflow-hidden border">
          <div className="p-3 border-bottom bg-white">
            <Row className="g-3 align-items-center">
              <Col xs={12} md={6} lg={4}>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">🔍</span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="Search name, company, email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </Col>
              <Col xs={12} md={4} lg={2} className="ms-auto text-end">
                <Form.Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle mb-0 custom-table">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Partner</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar-circle">{getInitials(row.name)}</div>
                        <div className="fw-semibold text-dark">{row.name}</div>
                      </div>
                    </td>
                    <td>{row.companyname}</td>
                    <td className="text-muted small">{row.email}</td>
                    <td>
                      <Badge className={`status-pill ${row.status.toLowerCase()}`}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn-icon view" onClick={() => console.log(row._id)}>👁️</button>
                        <button className="btn-icon edit" onClick={() => handleEdit(row._id)}>✏️</button>
                        <button className="btn-icon delete" onClick={() => handleDelete(row._id)}>🗑️</button>
                        <button className="btn-icon more" onClick={() => setUploadFile(true)}>📊</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={isModalOpen} onHide={() => { setIsModalOpen(false); resetForm(); }} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{selectedPartner ? "Edit Partner" : "Add New Partner"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-bold">Partner Name</Form.Label>
                <Form.Control type="text" value={partnerData.name} onChange={(e) => setPartnerData({...partnerData, name: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Company Name</Form.Label>
                <Form.Control type="text" value={partnerData.companyname} onChange={(e) => setPartnerData({...partnerData, companyname: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Mobile</Form.Label>
                <Form.Control type="text" value={partnerData.phone} onChange={(e) => setPartnerData({...partnerData, phone: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Email</Form.Label>
                <Form.Control type="email" value={partnerData.email} onChange={(e) => setPartnerData({...partnerData, email: e.target.value})} />
              </Col>
              <Col md={12}>
                <Form.Label className="small fw-bold">Address</Form.Label>
                <Form.Control type="text" value={partnerData.address} onChange={(e) => setPartnerData({...partnerData, address: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">State</Form.Label>
                <Form.Control type="text" value={partnerData.state} onChange={(e) => setPartnerData({...partnerData, state: e.target.value})} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold">Pincode</Form.Label>
                <Form.Control type="text" value={partnerData.pincode} onChange={(e) => setPartnerData({...partnerData, pincode: e.target.value})} />
              </Col>
            </Row>

            <hr className="my-4" />
            <h6 className="fw-bold mb-3">Service Settings</h6>
            
            <div className="service-grid">
              <Form.Check type="switch" label="WhatsApp Service" checked={partnerData.isWhatsapp} onChange={(e) => setPartnerData({...partnerData, isWhatsapp: e.target.checked})} />
              {partnerData.isWhatsapp && (
                <Form.Control className="mt-2" placeholder="API Key" value={partnerData.whatsappApi} onChange={(e) => setPartnerData({...partnerData, whatsappApi: e.target.value})} />
              )}
              
              <Form.Check type="switch" className="mt-3" label="Email Service" checked={partnerData.isEmail} onChange={(e) => setPartnerData({...partnerData, isEmail: e.target.checked})} />
              {partnerData.isEmail && (
                <Row className="g-2 mt-1">
                  <Col><Form.Control placeholder="Host" value={partnerData.emailhost} onChange={(e) => setPartnerData({...partnerData, emailhost: e.target.value})} /></Col>
                  <Col><Form.Control placeholder="Port" value={partnerData.emailport} onChange={(e) => setPartnerData({...partnerData, emailport: e.target.value})} /></Col>
                </Row>
              )}

              <Form.Check type="switch" className="mt-3" label="Online Payments" checked={partnerData.isPayment} onChange={(e) => setPartnerData({...partnerData, isPayment: e.target.checked})} />
              {partnerData.isPayment && (
                <Row className="g-2 mt-1">
                  <Col><Form.Control placeholder="Key ID" value={partnerData.keyid} onChange={(e) => setPartnerData({...partnerData, keyid: e.target.value})} /></Col>
                  <Col><Form.Control placeholder="Key Secret" value={partnerData.keysecret} onChange={(e) => setPartnerData({...partnerData, keysecret: e.target.value})} /></Col>
                </Row>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveplan}>{selectedPartner ? "Update Partner" : "Save Partner"}</Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Modal */}
      <Modal show={uploadFile} onHide={() => setUploadFile(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Bulk Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Target Partner</Form.Label>
            <Form.Select onChange={(e) => setPartnerId(e.target.value)}>
              <option value="">Select Partner</option>
              {tableData.map((p) => <option key={p._id} value={p._id}>{p.companyname}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="small fw-bold">Excel File</Form.Label>
            <Form.Control type="file" onChange={(e) => setDataToUpload(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100" onClick={uploadData}>Start Upload</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;