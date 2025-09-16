import React, { useState } from "react";
import Excel_Icon from "./drawables/xls.png";
import PDF_Icon from "./drawables/pdf.png";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ReceiptModify from "./ReceiptModify";
import PaymetTable from "./PaymetTable";
import ProtectedRoute from "../ProtectedRoute";
import "./Cust_PayRecpt.css";
import { Modal } from "react-bootstrap";
import { api2 } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

export default function Cust_PayRecpt() {
  const location = useLocation();
  const partnerId = localStorage.getItem("partnerId");
  const subsId = localStorage.getItem("susbsUserid");
  const { userid } = location.state || {};
  const [linkModal, setLinkModal] = useState(false);
  const [arrayblling, setBillingArray] = useState([]);
  const [LinkForm, setLinkForm] = useState({
    amount: "",
    discount: "",
    period: "",
  });

  const navigate = useNavigate();

  const createPaymentLink = async () => {
    try {
      const linkResponse = await axios.post(
        `${api2}/link/create-payment-link`,
        {
          partnerId,
          subscriberId: subsId,
          period: LinkForm.period,
          amount: Number(LinkForm.amount),
          discount: Number(LinkForm.discount),
          createBy: localStorage.getItem("contact"),
        }
      );

      if (linkResponse.status === 404)
        return toast.error("Service Not Subscribed", { autoClose: 2000 });
      if (linkResponse.status === 401)
        return toast.error("Missing Require Field", { autoClose: 2000 });
      if (linkResponse.status === 201)
        return toast.warning("Link Already Generated", { autoClose: 2000 });

      alert(`Payment Link is: ${linkResponse.data.short_url}`);
      setLinkForm({
        amount: "",
        discount: "",
        period: "",
      });

      setLinkModal(false);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchbillingperiod = async () => {
    try {
      const response = await axios.get(
        api2 + "/subscriber/planinfo/" + subsId + "?partnerId=" + partnerId
      );
      if (response.status !== 200)
        return console.log("Error fetching billing period data");
      const data = response.data;
      if (data && data.length > 0) {
        const billingArray = data.map((item) => ({
          activationDate: item.activationDate,
          expiryDate: item.expiryDate,
        }));
        setBillingArray(billingArray);
      } else {
        setBillingArray([]);
      }
    } catch (error) {
      console.error("Error fetching billing period:", error);
    }
  };
  return (
    <div className="cust-pay-receipt-container">
      <ToastContainer />
      <div className="cust-pay-receipt-header">
        <div className="cust-pay-receipt-title">
          <h2>Payments & Receipts</h2>
        </div>
        <div className="cust-pay-receipt-actions">
          <button
            onClick={() => {
              setLinkModal(true);
              fetchbillingperiod();
            }}
            type="button"
            className="cust-pay-receipt-btn link-pay-receipt-btn-outline-success"
          >
            Create Payment Link
          </button>
          <button
            onClick={() => {
              navigate("collect", { state: { userid } });
            }}
            type="button"
            className="cust-pay-receipt-btn cust-pay-receipt-btn-outline-success"
          >
            Create Receipt
          </button>
          <img
            src={Excel_Icon}
            className="cust-pay-receipt-download-icon"
            alt="Download Excel"
          />
          <img
            src={PDF_Icon}
            className="cust-pay-receipt-download-icon"
            alt="Download PDF"
          />
        </div>
      </div>
      <div className="cust-pay-receipt-content">
        <Routes>
          <Route path="/" element={<PaymetTable />} />
          <Route
            path="collect"
            element={
              <ProtectedRoute permission="COLLECT_PAYMENT">
                <ReceiptModify />
              </ProtectedRoute>
            }
          />
          <Route path="modify" element={<ReceiptModify />} />
        </Routes>
      </div>

      <Modal show={linkModal} onHide={() => setLinkModal(false)}>
        <Modal.Header>
          <Modal.Title>Generaye Payment Link</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="col-md">
            <label className="form-label ms-3">Amount *</label>
            <input
              onChange={(e) =>
                setLinkForm({
                  ...LinkForm,
                  amount: e.target.value,
                })
              }
              className="form-control"
            ></input>
          </div>

          <div className="col-md">
            <label className="form-label ms-3">Discount</label>
            <input
              onChange={(e) =>
                setLinkForm({
                  ...LinkForm,
                  discount: e.target.value,
                })
              }
              defaultValue="0"
              className="form-control"
            ></input>
          </div>

          <div className="col-md mt-3">
            <label className="form-label ms-3">For Period *</label>
            <select
              onChange={(e) =>
                setLinkForm({
                  ...LinkForm,
                  period: e.target.value,
                })
              }
              className="form-control"
            >
              <option value="">Choose...</option>
              {arrayblling.length > 0 ? (
                arrayblling.map(({ activationDate, expiryDate }, index) => (
                  <option
                    key={index}
                    value={`${activationDate} to ${expiryDate}`}
                  >
                    {`${new Date(activationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })} to ${new Date(expiryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}`}
                  </option>
                ))
              ) : (
                <option value="dueamount">No Bill Found!</option>
              )}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={createPaymentLink} className="btn btn-success">
            Create Link
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
