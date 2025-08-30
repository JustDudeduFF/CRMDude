import React, { useState, useEffect } from "react";
import CompanynModal from "./CompanyModal";
import { ref, onValue, set } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import { Modal, Button, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";

export default function Company() {
  const partnerId = localStorage.getItem("partnerId");
  const [showModal, setShowModal] = useState(false);
  const [showGlobalCompany, setShowGlobalCompany] = useState(false);
  const { hasPermission } = usePermissions();

  const [companyDetails, setCompanyDetails] = useState({
    companyname: "",
    companyaddress: "",
    companymobile: "",
    companygmail: "",
    companycity: "",
    companypincode: "",
    companycode: "global",
    companyGSTIN: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyDetails({ ...companyDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    set(
      ref(db, "Master/companys/" + companyDetails.companycode),
      companyDetails
    );
    setShowGlobalCompany(false);
  };

  const [arraycompany, setArraycompany] = useState([]);

  const fetchCompany = async () => {
    try {
      const response = await fetch(
        api2 + "/master/company?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return toast.error("Failed to load Companies", { autoClose: 2000 });

      const data = await response.json();
      setArraycompany(data);
    } catch (e) {
      console.log(e);
      toast.error("Error fetching company data", { autoClose: 2000 });
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <div className="report-component-container">
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Company company Location and Address
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_COMPANY")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success"
        >
          Add New company
        </button>
      </div>
      <ToastContainer />
      <CompanynModal show={showModal} notshow={() => setShowModal(false)} />
      <div className="report-table-container">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Company Code</th>
              <th scope="col">Company Name</th>
              <th scope="col">Company Address</th>
              <th scope="col">Gmail</th>
              <th scope="col">Mobile</th>
              <th scope="col">Pincode</th>
              <th scope="col">City</th>
            </tr>
          </thead>

          <tbody className="table-group-divider">
            {arraycompany.map(
              (
                { name, address, mobile, city, email, pincode, code },
                index
              ) => (
                <tr key={name}>
                  <td>{index + 1}</td>
                  <td>{code}</td>
                  <td className="text-primary text-decoration-underline">
                    {name}
                  </td>
                  <td>{address}</td>
                  <td>{email}</td>
                  <td>{mobile}</td>
                  <td>{pincode}</td>
                  <td>{city}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={showGlobalCompany}
        onHide={() => setShowGlobalCompany(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Global Company</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formCompanyName">
              <Form.Label>Company Name</Form.Label>
              <Form.Control
                type="text"
                name="companyname"
                value={companyDetails.companyname}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyAddress">
              <Form.Label>Company Address</Form.Label>
              <Form.Control
                type="text"
                name="companyaddress"
                value={companyDetails.companyaddress}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyMobile">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                type="text"
                name="companymobile"
                value={companyDetails.companymobile}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyGmail">
              <Form.Label>Gmail</Form.Label>
              <Form.Control
                type="email"
                name="companygmail"
                value={companyDetails.companygmail}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyCity">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                name="companycity"
                value={companyDetails.companycity}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyPincode">
              <Form.Label>Pincode</Form.Label>
              <Form.Control
                type="text"
                name="companypincode"
                value={companyDetails.companypincode}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCompanyCode">
              <Form.Label>Company GSTIN</Form.Label>
              <Form.Control
                type="text"
                name="companyGSTIN"
                value={companyDetails.companyGSTIN}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button className="mt-3" variant="primary" type="submit">
              Add Company
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
