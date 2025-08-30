import React, { useEffect, useState } from "react";
import "./EmpCSS.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api2 } from "../../FirebaseConfig";

export default function NewEmployee() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();
  const [aadhar, setAadhar] = useState(null);
  const [pan, setPan] = useState(null);
  const [drivinglicense, setDrivingLiciense] = useState(null);

  const [empData, setEmpData] = useState({
    FULLNAME: "",
    MOBILE: "",
    GMAIL: "",
    ADDRESS: "",
    AADHAR: "",
    DRIVING: "",
    PAN: "",
    BANKNAME: "",
    ACCOUNTNO: "",
    IFSC: "",
    ACCOUNTNAME: "",
    UPI: "",
    INTIME_H: "",
    INTIME_M: "",
    OUTTIME_H: "",
    OUTTIME_M: "",
    MARKING_OFFICE: "",
    DESIGNATION: "",
    USERTYPE: "",
    DOJ: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const [arrayoffice, setArrayOffice] = useState([]);
  const [arraydesignation, setArraydesignation] = useState([]);

  //User Permission Data
  const [customerpermission, setCustomerPermission] = useState({
    VIEW_CUSTOMER: false,
    ADD_CUSTOMER: false,
    RENEW_PLAN: false,
    CHANGE_PLAN: false,
    EDIT_C_PLAN: false,
    EDIT_C_INFO: false,
    CREATE_TICKET: false,
    CLOSE_TICKET: false,
    REASSING_TICKET: false,
    ROLLBACK_PLAN: false,
    RESEND_CODE: false,
  });

  const [masterpermission, setMasterPermission] = useState({
    ADD_PLAN: false,
    ADD_TICKET_CONCERNS: false,
    ADD_DEVICE_MAKER: false,
    ADD_ISP: false,
    ADD_DESIGNATION: false,
    ADD_COMPANY: false,
    ADD_COLONY: false,
    ADD_DEBIT_CREDIT_CONCERN: false,
  });

  const [leadpermission, setLeadPermission] = useState({
    ADD_LEAD: false,
    CANCEL_LEAD: false,
    EDIT_LEAD: false,
    CONVERT_TO_LEAD: false,
  });

  const [paymentpermission, setPaymentPermission] = useState({
    COLLECT_PAYMENT: false,
    PAYMENT_AUTHORIZATION: false,
    EDIT_PAYMENT: false,
    CREATE_DEBIT: false,
    CREATE_CREDIT: false,
    DOWNLOAD_INVOICE: false,
    CANCEL_RECEIPT: false,
  });

  const [networkpermission, setNetworkPermission] = useState({
    VIEW_RACK: false,
    UPDATE_RACK: false,
    ADD_JC: false,
    ADD_RACK_DEVICE: false,
  });

  const [attendencepermission, setAttendencePermission] = useState({
    MARK_ATTENDENCE: false,
    MARK_ANYWHERE: false,
    VIEW_ATTENDENCE: false,
  });

  const [payoutpermission, setPayoutPermission] = useState({
    VIEW_PAYOUT: false,
  });

  const [messagepermission, setMessagePermission] = useState({
    MSG_DUE: false,
    MSG_EXPIRING: false,
    MSG_EXPIRED: false,
    MSG_BULK: false,
    MSG_PROMOTIONAL: false,
  });

  const [inventorypermission, setInventoryPermission] = useState({
    VIEW_INVENTORY: false,
    CHANGE_DEVICE_STATUS: false,
    ASSIGN_DEVICE: false,
    ADD_DEVICE: false,
  });

  const [employeepermission, setEmployeePermission] = useState({
    VIEW_EMP: false,
    EDIT_EMP: false,
    EDIT_EMP_PERMISSION: false,
    ADD_EMP: false,
  });

  const handleCustomerPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(customerpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setCustomerPermission(updatedPermissions);
  };

  const handleMasterPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(masterpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setMasterPermission(updatedPermissions);
  };

  const handleLeadPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(leadpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setLeadPermission(updatedPermissions);
  };

  const handlePaymentPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(paymentpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setPaymentPermission(updatedPermissions);
  };

  const handleNetworkPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(networkpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setNetworkPermission(updatedPermissions);
  };

  const handleAttendencePermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(attendencepermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setAttendencePermission(updatedPermissions);
  };

  const handlePayoutPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(payoutpermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setPayoutPermission(updatedPermissions);
  };

  const handleMessagingPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(messagepermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setMessagePermission(updatedPermissions);
  };

  const handleInventotyPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(inventorypermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setInventoryPermission(updatedPermissions);
  };

  const handleEmpPermission = (e) => {
    const isChecked = e.target.checked;
    const updatedPermissions = Object.keys(employeepermission).reduce(
      (acc, key) => {
        acc[key] = isChecked; // Set all permissions to the checkbox's checked state
        return acc;
      },
      {}
    );
    setEmployeePermission(updatedPermissions);
  };

  const handleCustomerIndividualChange = (e) => {
    const { name, checked } = e.target;
    setCustomerPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleMasterIndividualChange = (e) => {
    const { name, checked } = e.target;
    setMasterPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleLeadIndividualChange = (e) => {
    const { name, checked } = e.target;
    setLeadPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handlePaymentIndividualChange = (e) => {
    const { name, checked } = e.target;
    setPaymentPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleNetworkIndividualChange = (e) => {
    const { name, checked } = e.target;
    setNetworkPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleAttendenceIndividualChange = (e) => {
    const { name, checked } = e.target;
    setAttendencePermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handlePayoutIndividualChange = (e) => {
    const { name, checked } = e.target;
    setPayoutPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleMessageIndividualChange = (e) => {
    const { name, checked } = e.target;
    setMessagePermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleInventoryIndividualChange = (e) => {
    const { name, checked } = e.target;
    setInventoryPermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const handleeEmployeeIndividualChange = (e) => {
    const { name, checked } = e.target;
    setEmployeePermission((prev) => ({
      ...prev,
      [name]: checked, // Update only the specific checkbox state
    }));
  };

  const allData = {
    ...empData,
    customerpermission: { ...customerpermission },
    masterpermission: { ...masterpermission },
    leadpermission: { ...leadpermission },
    paymentpermission: { ...paymentpermission },
    networkpermission: { ...networkpermission },
    attendencepermission: { ...attendencepermission },
    payoutpermission: { ...payoutpermission },
    messagepermission: { ...messagepermission },
    inventorypermission: { ...inventorypermission },
    employeepermission: { ...employeepermission },
    partnerId: partnerId,
  };

  const AddNewUser = async () => {
    try {
      const formData = new FormData();

      // Map frontend fields to schema fields
      formData.append("FULLNAME", empData.FULLNAME);
      formData.append("MOBILE", empData.MOBILE);
      formData.append("GMAIL", empData.GMAIL);
      formData.append("ADDRESS", empData.ADDRESS);
      formData.append("DESIGNATION", empData.DESIGNATION || ""); // Add designation if available
      formData.append("DOJ", empData.DOJ); // Using activationDate as Date of Joining
      formData.append("partnerId", partnerId); // From URL parameter

      // Time settings (you can make these dynamic or use defaults)
      formData.append("INTIME_H", empData.INTIME_H);
      formData.append("INTIME_M", empData.INTIME_M);
      formData.append("OUTTIME_H", empData.OUTTIME_H);
      formData.append("OUTTIME_M", empData.OUTTIME_M);

      // Bank details (add these fields to your frontend form if needed)
      formData.append("BANKNAME", empData.BANKNAME || "");
      formData.append("ACCOUNTNAME", empData.ACCOUNTNAME || "");
      formData.append("ACCOUNTNO", empData.ACCOUNTNO || "");
      formData.append("IFSC", empData.IFSC || "");
      formData.append("UPI", empData.UPI || "");

      // Password (optional, defaults to '123456' in schema)
      formData.append("pass", "123456");

      // Other fields that might be needed
      formData.append("USERTYPE", empData.USERTYPE);
      formData.append("MARKING_OFFICE", empData.MARKING_OFFICE || "");
      formData.append("status", "active");

      // Helper function to append permission objects dynamically
      const appendPermissionObject = (permissionName, permissionObject) => {
        if (permissionObject && typeof permissionObject === "object") {
          Object.keys(permissionObject).forEach((key) => {
            formData.append(
              `${permissionName}[${key}]`,
              String(permissionObject[key])
            );
          });
        }
      };

      // Append dynamic permission objects
      // Replace these with your actual permission state variables
      appendPermissionObject("attendencepermission", attendencepermission);
      appendPermissionObject("customerpermission", customerpermission);
      appendPermissionObject("employeepermission", employeepermission);
      appendPermissionObject("inventorypermission", inventorypermission);
      appendPermissionObject("leadpermission", leadpermission);
      appendPermissionObject("masterpermission", masterpermission);
      appendPermissionObject("messagepermission", messagepermission);
      appendPermissionObject("networkpermission", networkpermission);
      appendPermissionObject("paymentpermission", paymentpermission);
      appendPermissionObject("payoutpermission", payoutpermission);

      // OR if you have a single permissions object:
      // if (allPermissions) {
      //   Object.keys(allPermissions).forEach(permissionType => {
      //     appendPermissionObject(permissionType, allPermissions[permissionType]);
      //   });
      // }

      // Append files - these will update the document fields in schema
      if (aadhar) {
        formData.append("aadhar", aadhar);
      } // Updates AADHAR field
      if (drivinglicense) formData.append("drivinglicense", drivinglicense); // Updates DRIVING field
      if (pan) formData.append("pan", pan); // Updates PAN field

      const response = await axios.post(`${api2}/employees`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Employee added successfully!", {
          position: "top-center",
        });
        navigate(-1);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error adding employee.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Offices
        const officeRes = await axios.get(
          api2 + "/master/offices?partnerId=" + partnerId
        ); // your REST API endpoint
        if (officeRes.data && officeRes.data.length > 0) {
          setArrayOffice(officeRes.data);
        } else {
          toast.error("Please Add an Office Location", { autoClose: 3000 });
        }

        // Fetch Designations
        const designationRes = await axios.get(
          api2 + "/master/designations?partnerId=" + partnerId
        ); // your REST API endpoint
        if (designationRes.data && designationRes.data.length > 0) {
          setArraydesignation(designationRes.data);
        } else {
          toast.error("Please Add a Designation", { autoClose: 3000 });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data", { autoClose: 3000 });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="employee-details-container">
      <div className="employee-details-header">
        <h4 className="employee-details-title">Employee Personal Details</h4>
      </div>
      <div className="employee-form">
        <form className="row g-3">
          <div className="col-md-2">
            <label className="employee-form-label">Employee Code</label>
            <input
              type="text"
              className="employee-form-control"
              placeholder="Auto"
              readOnly
            ></input>
          </div>

          <div className="col-md-3">
            <label className="employee-form-label">Employee FullName *</label>
            <input
              className="employee-form-control"
              type="text"
              name="FULLNAME"
              onChange={handleChange}
            ></input>
          </div>

          <div className="col-md-3">
            <label className="employee-form-label">Employee Mobile No. *</label>
            <div className="employee-input-group">
              <span className="employee-input-group-text">+91</span>
              <input
                name="MOBILE"
                onChange={handleChange}
                maxLength={10}
                type="numbers"
                className="employee-form-control"
                aria-describedby="inputGroupPrepend"
                required
              ></input>
            </div>
          </div>

          <ToastContainer />

          <div className="col-md-2">
            <label className="employee-form-label">Gmail Address</label>
            <div className="employee-input-group">
              <span className="employee-input-group-text">@</span>
              <input
                onChange={handleChange}
                name="GMAIL"
                type="mail"
                className="employee-form-control"
                aria-describedby="inputGroupPrepend"
              ></input>
            </div>
          </div>

          <div className="col-md-3">
            <label className="employee-form-label">Employee Address *</label>
            <input
              onChange={handleChange}
              name="ADDRESS"
              className="employee-form-control"
              type="text"
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">Date Of Birth</label>
            <input
              name="DOB"
              type="date"
              onChange={handleChange}
              className="employee-form-control"
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">Date Of Joining</label>
            <input
              className="employee-form-control"
              type="date"
              name="DOJ"
              onChange={handleChange}
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">
              Employee Designation *
            </label>
            <select
              name="DESIGNATION"
              onChange={handleChange}
              className="employee-form-control"
            >
              {arraydesignation.length > 0 ? (
                arraydesignation.map((designation, index) => (
                  <option key={index} value={designation.name}>
                    {designation.name}
                  </option>
                ))
              ) : (
                <option value="">No Designation Available</option>
              )}
            </select>
          </div>
        </form>
      </div>

      <h5 className="employee-section-header">Employee Documents</h5>
      <div className="employee-form">
        <form className="row g-3">
          <div className="col-md-2">
            <label className="employee-form-label">Aadhaar Card No.</label>
            <input
              onChange={handleChange}
              name="AADHAR"
              type="numbers"
              className="employee-form-control"
              maxLength={16}
              required
            ></input>
            <input
              type="file"
              className="employee-form-control mt-3"
              id="inputGroupFile03"
              onChange={(e) => setAadhar(e.target.files)}
              aria-label="Upload"
              disabled
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">Driving License No.</label>
            <input
              onChange={handleChange}
              name="DRIVING"
              type="text"
              className="employee-form-control"
              required
            ></input>
            <input
              type="file"
              className="employee-form-control mt-3"
              id="inputGroupFile03"
              onChange={(e) => setDrivingLiciense(e.target.files)}
              aria-label="Upload"
              disabled
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">PAN Card</label>
            <input
              onChange={handleChange}
              name="PAN"
              type="text"
              className="employee-form-control"
              required
            ></input>
            <input
              type="file"
              className="employee-form-control mt-3"
              id="inputGroupFile03"
              onChange={(e) => setPan(e.target.files)}
              aria-label="Upload"
              disabled
            ></input>
          </div>
        </form>
      </div>

      <h5 className="employee-section-header">Accounts & Salary Details</h5>
      <div className="employee-form">
        <form className="row g-3">
          <div className="col-md-3">
            <label className="employee-form-label">Employee Bank Name</label>
            <input
              onChange={handleChange}
              name="BANKNAME"
              className="employee-form-control"
              type="text"
            ></input>
          </div>

          <div className="col-md-3">
            <label className="employee-form-label">Employee Account No.</label>
            <input
              onChange={handleChange}
              name="ACCOUNTNO"
              className="employee-form-control"
              type="number"
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">IFSC Code Of Bank</label>
            <input
              onChange={handleChange}
              name="IFSC"
              className="employee-form-control"
            ></input>
          </div>

          <div className="col-md-3">
            <label className="employee-form-label">Account Holder Name</label>
            <input
              onChange={handleChange}
              name="ACCOUNTNAME"
              className="employee-form-control"
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">UPI ID</label>
            <input
              onChange={handleChange}
              name="UPI"
              className="employee-form-control"
            ></input>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">
              Employee In Time in Office *
            </label>
            <div className="employee-input-group">
              <input
                onChange={handleChange}
                name="INTIME_H"
                className="employee-form-control"
                placeholder="Hours"
                maxLength={2}
              ></input>
              <span
                className="employee-input-group-text"
                aria-describedby="inputGroupPrepend"
              >
                :
              </span>
              <input
                onChange={handleChange}
                name="INTIME_M"
                className="employee-form-control"
                placeholder="Minutes"
                maxLength={2}
              ></input>
            </div>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">
              Employee Out Time From Office
            </label>
            <div className="employee-input-group">
              <input
                onChange={handleChange}
                name="OUTTIME_H"
                className="employee-form-control"
                placeholder="Hours"
                maxLength={2}
              ></input>
              <span
                className="employee-input-group-text"
                aria-describedby="inputGroupPrepend"
              >
                :
              </span>
              <input
                onChange={handleChange}
                name="OUTTIME_M"
                className="employee-form-control"
                placeholder="Minutes"
                maxLength={2}
              ></input>
            </div>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">
              Attendence Marking Location
            </label>
            <select
              onChange={handleChange}
              name="MARKING_OFFICE"
              className="employee-form-control"
            >
              {arrayoffice.length > 0 ? (
                arrayoffice.map((office, index) => (
                  <option key={index} value={office.name}>
                    {office.name}
                  </option>
                ))
              ) : (
                <option value="">No Offices Available</option>
              )}
            </select>
          </div>

          <div className="col-md-2">
            <label className="employee-form-label">User Type *</label>
            <div className="employee-input-group">
              <select
                onChange={handleChange}
                name="USERTYPE"
                className="employee-form-control"
              >
                <option value="">Choose...</option>
                <option value="mobile">Mobile</option>
                <option value="web">Web</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <h5 className="employee-section-header">
        Employee Permissions And Authorization
      </h5>
      <div className="employee-permissions-container">
        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Customer Permissions</h6>
          <input
            checked={Object.values(customerpermission).every((val) => val)}
            onChange={handleCustomerPermission}
            className="employee-permission-checkbox"
            type="checkbox"
            id="customerpermission"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="VIEW_CUSTOMER"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.VIEW_CUSTOMER}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="customerview"
          ></input>
          <label className="employee-permission-label" for="customerview">
            View Customer
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_CUSTOMER"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.ADD_CUSTOMER}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addcustomer"
          ></input>
          <label className="employee-permission-label" for="addcustomer">
            Add Customer
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="RENEW_PLAN"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.RENEW_PLAN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="renewplan"
          ></input>
          <label className="employee-permission-label" for="renewplan">
            Renew Plan
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CHANGE_PLAN"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.CHANGE_PLAN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="changeplan"
          ></input>
          <label className="employee-permission-label" for="changeplan">
            Change Plan
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_C_PLAN"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.EDIT_C_PLAN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editcustomerplan"
          ></input>
          <label className="employee-permission-label" for="editcustomerplan">
            Edit Customer Plan
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_C_INFO"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.EDIT_C_INFO}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editbasicinfo"
          ></input>
          <label className="employee-permission-label" for="editbasicinfo">
            Edit Customer Basic Info
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CREATE_TICKET"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.CREATE_TICKET}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addticket"
          ></input>
          <label className="employee-permission-label" for="addticket">
            Create New Ticket
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CLOSE_TICKET"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.CLOSE_TICKET}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="closeticket"
          ></input>
          <label className="employee-permission-label" for="closeticket">
            Close Ticket
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="REASSING_TICKET"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.REASSING_TICKET}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="reassignticket"
          ></input>
          <label className="employee-permission-label" for="reassignticket">
            Re-Assign Ticket
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ROLLBACK_PLAN"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.ROLLBACK_PLAN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="rollbackplan"
          ></input>
          <label className="employee-permission-label" for="rollbackplan">
            Plan Rollback
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="RESEND_CODE"
            onChange={handleCustomerIndividualChange}
            checked={customerpermission.RESEND_CODE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="resendcode"
          ></input>
          <label className="employee-permission-label" for="resendcode">
            Resend Code
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Master Permissions</h6>
          <input
            checked={Object.values(masterpermission).every((val) => val)}
            onChange={handleMasterPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="ADD_PLAN"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_PLAN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addnewplan"
          ></input>
          <label className="employee-permission-label" for="addnewplan">
            Add New Plan
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_TICKET_CONCERNS"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_TICKET_CONCERNS}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addconcerns"
          ></input>
          <label className="employee-permission-label" for="addconcerns">
            Add Ticket Concerns
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_DEVICE_MAKER"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_DEVICE_MAKER}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="adddevicemaker"
          ></input>
          <label className="employee-permission-label" for="adddevicemaker">
            Add Device Maker
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_ISP"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_ISP}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addisp"
          ></input>
          <label className="employee-permission-label" for="addisp">
            Add ISP
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_DESIGNATION"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_DESIGNATION}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="adddesignation"
          ></input>
          <label className="employee-permission-label" for="adddesignation">
            Add Designation
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_COMPANY"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_COMPANY}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addcompany"
          ></input>
          <label className="employee-permission-label" for="addcompany">
            Add Company
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_COLONY"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_COLONY}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addcolony"
          ></input>
          <label className="employee-permission-label" for="addcolony">
            Add Colony
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_DEBIT_CREDIT_CONCERN"
            onChange={handleMasterIndividualChange}
            checked={masterpermission.ADD_DEBIT_CREDIT_CONCERN}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="adddebitandcredit"
          ></input>
          <label className="employee-permission-label" for="adddebitandcredit">
            Add Debit/Credit Concern
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Leads Permissions</h6>
          <input
            checked={Object.values(leadpermission).every((val) => val)}
            onChange={handleLeadPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="ADD_LEAD"
            onChange={handleLeadIndividualChange}
            checked={leadpermission.ADD_LEAD}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addlead"
          ></input>
          <label className="employee-permission-label" for="addlead">
            Add New Leads
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CANCEL_LEAD"
            onChange={handleLeadIndividualChange}
            checked={leadpermission.CANCEL_LEAD}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="cancellead"
          ></input>
          <label className="employee-permission-label" for="cancellead">
            Cancel Leads
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_LEAD"
            onChange={handleLeadIndividualChange}
            checked={leadpermission.EDIT_LEAD}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editlead"
          ></input>
          <label className="employee-permission-label" for="editlead">
            Edit Leads
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CONVERT_TO_LEAD"
            onChange={handleLeadIndividualChange}
            checked={leadpermission.CONVERT_TO_LEAD}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="convertlead"
          ></input>
          <label className="employee-permission-label" for="convertlead">
            Convert Enquiry to Lead
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">
            Payment and Authorization Permissions
          </h6>
          <input
            checked={Object.values(paymentpermission).every((val) => val)}
            onChange={handlePaymentPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="COLLECT_PAYMENT"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.COLLECT_PAYMENT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="collectpayment"
          ></input>
          <label className="employee-permission-label" for="collectpayment">
            Collect Payment
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="PAYMENT_AUTHORIZATION"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.PAYMENT_AUTHORIZATION}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="authorize"
          ></input>
          <label className="employee-permission-label" for="authorize">
            Payment Authorization
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_PAYMENT"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.EDIT_PAYMENT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editpayment"
          ></input>
          <label className="employee-permission-label" for="editpayment">
            Edit Payment
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CREATE_DEBIT"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.CREATE_DEBIT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="createdebit"
          ></input>
          <label className="employee-permission-label" for="createdebit">
            Create Debit Note
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CREATE_CREDIR"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.CREATE_CREDIT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="createcredit"
          ></input>
          <label className="employee-permission-label" for="createcredit">
            Create Credit Note
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="DOWNLOAD_INVOICE"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.DOWNLOAD_INVOICE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="downloadinvoice"
          ></input>
          <label className="employee-permission-label" for="downloadinvoice">
            Download Invoice
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CANCEL_RECEIPT"
            onChange={handlePaymentIndividualChange}
            checked={paymentpermission.CANCEL_RECEIPT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="cancelreceipt"
          ></input>
          <label className="employee-permission-label" for="cancelreceipt">
            Cancel Receipt
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">
            Network and Rack Permissions
          </h6>
          <input
            checked={Object.values(networkpermission).every((val) => val)}
            onChange={handleNetworkPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="VIEW_RACK"
            onChange={handleNetworkIndividualChange}
            checked={networkpermission.VIEW_RACK}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="viewrack"
          ></input>
          <label className="employee-permission-label" for="viewrack">
            View Network Rack
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="UPDATE_RACK"
            onChange={handleNetworkIndividualChange}
            checked={networkpermission.UPDATE_RACK}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="updaterack"
          ></input>
          <label className="employee-permission-label" for="updaterack">
            Update Rack Data
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="AADD_JC"
            onChange={handleNetworkIndividualChange}
            checked={networkpermission.ADD_JC}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addjcbox"
          ></input>
          <label className="employee-permission-label" for="addjcbox">
            Add Field JC
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Attendence Permissions</h6>
          <input
            checked={Object.values(attendencepermission).every((val) => val)}
            onChange={handleAttendencePermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="MARK_ATTENDENCE"
            onChange={handleAttendenceIndividualChange}
            checked={attendencepermission.MARK_ATTENDENCE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="markattendence"
          ></input>
          <label className="employee-permission-label" for="markattendence">
            Mark Attendence
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="MARK_ATTENDENCE"
            onChange={handleAttendenceIndividualChange}
            checked={attendencepermission.MARK_ANYWHERE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="markanywhere"
          ></input>
          <label className="employee-permission-label" for="markanywhere">
            Mark From Anywhere
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="VIEW_ATTENDENCE"
            onChange={handleAttendenceIndividualChange}
            checked={attendencepermission.VIEW_ATTENDENCE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="viewattendence"
          ></input>
          <label className="employee-permission-label" for="viewattendence">
            View Attendence
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Payout Permissions</h6>
          <input
            checked={Object.values(payoutpermission).every((val) => val)}
            onChange={handlePayoutPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="VIEW_PAYOUT"
            onChange={handlePayoutIndividualChange}
            checked={payoutpermission.VIEW_PAYOUT}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="viewpayout"
          ></input>
          <label className="employee-permission-label" for="viewpayout">
            View Payout Info
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Messaging Permissions</h6>
          <input
            checked={Object.values(messagepermission).every((val) => val)}
            onChange={handleMessagingPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="MSG_DUE"
            onChange={handleMessageIndividualChange}
            checked={messagepermission.MSG_DUE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="duemessage"
          ></input>
          <label className="employee-permission-label" for="duemessage">
            Message for Due Payment
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="MSG_EXPIRING"
            onChange={handleMessageIndividualChange}
            checked={messagepermission.MSG_EXPIRING}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="expiringmessage"
          ></input>
          <label className="employee-permission-label" for="expiringmessage">
            Expiring Message
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="MSG_PROMOTIONAL"
            onChange={handleMessageIndividualChange}
            checked={messagepermission.MSG_PROMOTIONAL}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="promotionalmessage"
          ></input>
          <label className="employee-permission-label" for="promotionalmessage">
            Send Promotional Message
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="MSG_BULK"
            onChange={handleMessageIndividualChange}
            checked={messagepermission.MSG_BULK}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="bulkmessage"
          ></input>
          <label className="employee-permission-label" for="bulkmessage">
            Send Bulk Message
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">Inventory Permissions</h6>
          <input
            checked={Object.values(inventorypermission).every((val) => val)}
            onChange={handleInventotyPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="VIEW_INVENTORY"
            onChange={handleInventoryIndividualChange}
            checked={inventorypermission.VIEW_INVENTORY}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="viewinventory"
          ></input>
          <label className="employee-permission-label" for="viewinventory">
            View Inventory
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="CHANGE_DEVICE_STATUS"
            onChange={handleInventoryIndividualChange}
            checked={inventorypermission.CHANGE_DEVICE_STATUS}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="changestatus"
          ></input>
          <label className="employee-permission-label" for="changestatus">
            Change Device Status
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ASSIGN_DEVICE"
            onChange={handleInventoryIndividualChange}
            checked={inventorypermission.ASSIGN_DEVICE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="assigndevice"
          ></input>
          <label className="employee-permission-label" for="assigndevice">
            Assign Device
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_DEVICE"
            onChange={handleInventoryIndividualChange}
            checked={inventorypermission.ADD_DEVICE}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="adddevice"
          ></input>
          <label className="employee-permission-label" for="adddevice">
            Add New Device
          </label>
        </div>

        <div className="employee-permission-header">
          <h6 className="employee-permission-title">
            Employee Managment Permissions
          </h6>
          <input
            checked={Object.values(employeepermission).every((val) => val)}
            onChange={handleEmpPermission}
            className="employee-permission-checkbox"
            type="checkbox"
          ></input>
        </div>
        <div className="employee-permission-item">
          <input
            name="VIEW_EMP"
            onChange={handleeEmployeeIndividualChange}
            checked={employeepermission.VIEW_EMP}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="viewemployee"
          ></input>
          <label className="employee-permission-label" for="viewemployee">
            View Employee
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_EMP"
            onChange={handleeEmployeeIndividualChange}
            checked={employeepermission.EDIT_EMP}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editemployee"
          ></input>
          <label className="employee-permission-label" for="editemployee">
            Edit Employee
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="EDIT_EMP_PERMISSION"
            onChange={handleeEmployeeIndividualChange}
            checked={employeepermission.EDIT_EMP_PERMISSION}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="editpermission"
          ></input>
          <label className="employee-permission-label" for="editpermission">
            Edit Employee Permissions
          </label>
        </div>

        <div className="employee-permission-item">
          <input
            name="ADD_EMP"
            onChange={handleeEmployeeIndividualChange}
            checked={employeepermission.ADD_EMP}
            className="employee-permission-checkbox-item"
            type="checkbox"
            id="addemployee"
          ></input>
          <label className="employee-permission-label" for="addemployee">
            Add New Employee
          </label>
        </div>
      </div>

      <button
        onClick={AddNewUser}
        className="employee-edit-btn employee-edit-btn-success mt-5 mb-5"
      >
        Add New Employee
      </button>
    </div>
  );
}
