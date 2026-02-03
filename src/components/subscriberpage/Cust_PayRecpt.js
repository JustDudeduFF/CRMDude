import React, { useState } from "react";
import Excel_Icon from "./drawables/xls.png";
import PDF_Icon from "./drawables/pdf.png";
import { API } from "../../FirebaseConfig";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import ReceiptModify from "./ReceiptModify";
import PaymetTable from "./PaymetTable";
import ProtectedRoute from "../ProtectedRoute";
import { Modal, Button } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import {
  FaLink,
  FaPlusCircle,
  FaFileInvoice,
  FaArrowLeft,
  FaReceipt
} from "react-icons/fa";
import "./Cust_PayRecpt.css";

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
  const isCollectPage =
    location.pathname.includes("collect") ||
    location.pathname.includes("modify");

  const createPaymentLink = async () => {
    try {
      const linkResponse = await API.post(
        `/link/create-payment-link`,
        {
          partnerId,
          subscriberId: subsId,
          period: LinkForm.period,
          amount: Number(LinkForm.amount),
          discount: Number(LinkForm.discount),
          createBy: localStorage.getItem("contact"),
        },
      );

      if (linkResponse.status === 404)
        return toast.error("Service Not Subscribed");
      if (linkResponse.status === 401)
        return toast.error("Missing Required Fields");
      if (linkResponse.status === 201)
        return toast.warning("Link Already Generated");

      alert(`Payment Link is: ${linkResponse.data.short_url}`);
      setLinkForm({ amount: "", discount: "", period: "" });
      setLinkModal(false);
    } catch (e) {
      console.log(e);
      toast.error("Failed to generate link");
    }
  };

  const fetchbillingperiod = async () => {
    try {
      const response = await API.get(
        `/subscriber/planinfo/${subsId}?partnerId=${partnerId}`,
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
    <div className="pay-receipt-wrapper">
      <ToastContainer />

      {/* HEADER BAR */}
      <div className="pay-receipt-nav shadow-sm">
        <div className="nav-info">
          {isCollectPage ? (
            <>
              <button className="back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft />
              </button>
              <div className="receipt-header">
                <div className="d-flex align-items-center ms-3">
                  <div className="header-icon-circle">
                    <FaReceipt />
                  </div>
                  <div className="ms-3">
                    <h5 className="mb-0 fw-bold">Manual Receipt Collection</h5>
                    <p className="text-muted small mb-0">
                      Record customer payments and issue digital receipts
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="nav-icon-box">
                <FaFileInvoice />
              </div>
              <div className="ms-3">
                <h4 className="fw-bold mb-0">Payments & Receipts</h4>
                <p className="text-muted small mb-0">
                  Manage customer billing and collections
                </p>
              </div>
            </>
          )}
        </div>

        <div className="nav-actions">
          {!isCollectPage && (
            <>
              <button
                className="action-pill pill-link"
                onClick={() => {
                  setLinkModal(true);
                  fetchbillingperiod();
                }}
              >
                <FaLink /> <span>Payment Link</span>
              </button>
              <button
                className="action-pill pill-receipt"
                onClick={() => navigate("collect", { state: { userid } })}
              >
                <FaPlusCircle /> <span>Create Receipt</span>
              </button>
            </>
          )}
          <div className="export-icons ms-2">
            <img src={Excel_Icon} alt="Excel" title="Export Excel" />
            <img src={PDF_Icon} alt="PDF" title="Export PDF" />
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="pay-receipt-content mt-4">
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

      {/* LINK GENERATION MODAL */}
      <Modal
        show={linkModal}
        onHide={() => setLinkModal(false)}
        centered
        className="modern-system-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Generate Payment Link</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="field-label">Payable Amount *</label>
              <div className="input-group-modern">
                <span className="input-icon-text">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="modern-input-field"
                  onChange={(e) =>
                    setLinkForm({ ...LinkForm, amount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-md-6">
              <label className="field-label">Applied Discount</label>
              <div className="input-group-modern">
                <span className="input-icon-text">₹</span>
                <input
                  type="number"
                  defaultValue="0"
                  className="modern-input-field"
                  onChange={(e) =>
                    setLinkForm({ ...LinkForm, discount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-12 mt-3">
              <label className="field-label">For Billing Period *</label>
              <select
                className="modern-select-field"
                onChange={(e) =>
                  setLinkForm({ ...LinkForm, period: e.target.value })
                }
              >
                <option value="">Select a billing cycle...</option>
                {arrayblling.length > 0 ? (
                  arrayblling.map(({ activationDate, expiryDate }, index) => (
                    <option
                      key={index}
                      value={`${activationDate} to ${expiryDate}`}
                    >
                      {`${new Date(activationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })} to ${new Date(expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}`}
                    </option>
                  ))
                ) : (
                  <option value="dueamount">No Bill Records Found!</option>
                )}
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="light"
            className="px-4 rounded-pill fw-bold"
            onClick={() => setLinkModal(false)}
          >
            Cancel
          </Button>
          <Button
            className="btn-indigo-gradient px-4 rounded-pill border-0 fw-bold"
            onClick={createPaymentLink}
          >
            Generate Link
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .pay-receipt-wrapper { padding: 10px; font-family: 'Inter', sans-serif; }
        
        .pay-receipt-nav {
          background: #fff;
          padding: 15px 25px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #eef2f6;
        }
        
        .receipt-header { padding: 0px; border-bottom: 0px solid #f1f5f9; background: #fff; }

        .nav-info { display: flex; align-items: center; }
        .nav-icon-box {
          width: 45px; height: 45px; background: #f5f3ff; color: #6366f1;
          border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }

        .back-btn {
          width: 40px; height: 40px; border-radius: 50%; border: none; background: #f8fafc;
          color: #64748b; transition: 0.2s;
        }
        .back-btn:hover { background: #6366f1; color: #fff; }

        .nav-actions { display: flex; align-items: center; gap: 12px; }

        .action-pill {
          border: none; padding: 8px 18px; border-radius: 50px; font-weight: 700; font-size: 0.85rem;
          display: flex; align-items: center; gap: 8px; transition: 0.2s;
        }
        .pill-link { background: #f5f3ff; color: #6366f1; }
        .pill-link:hover { background: #6366f1; color: #fff; }
        
        .pill-receipt { background: #f0fdf4; color: #16a34a; }
        .pill-receipt:hover { background: #16a34a; color: #fff; }

        .export-icons { display: flex; gap: 10px; border-left: 2px solid #f1f5f9; padding-left: 15px; }
        .export-icons img { width: 24px; height: 24px; cursor: pointer; transition: 0.2s; }
        .export-icons img:hover { transform: scale(1.1); }

        /* Reuse the same Modern Input styles from PaymentTable */
        .field-label { font-size: 0.7rem; font-weight: 800; color: #475569; margin-bottom: 6px; text-transform: uppercase; display: block; }
        .input-group-modern { position: relative; display: flex; align-items: center; }
        .input-icon-text { position: absolute; left: 15px; font-weight: 700; color: #94a3b8; }
        .modern-input-field { width: 100%; padding: 10px 15px 10px 35px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; outline: none; }
        .modern-select-field { width: 100%; padding: 10px 15px; border-radius: 12px; border: 2px solid #f1f5f9; font-size: 0.9rem; font-weight: 600; background: #fff; outline: none; }
        .btn-indigo-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; }

        @media (max-width: 992px) {
          .pay-receipt-nav { flex-direction: column; gap: 15px; text-align: center; }
          .nav-info { flex-direction: column; }
          .export-icons { border-left: none; padding-left: 0; }
        }
      `}</style>
    </div>
  );
}
