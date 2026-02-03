import React from "react";
import Excel_Icon from "./drawables/xls.png";
import PDF_Icon from "./drawables/pdf.png";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import RemarkFollowsTable from "./RemarkFollowsTable";
import ModRemFollow from "./ModRemFollow";
import AddRemarkFollow from "./AddRemarkFollow";
import { FaPlus, FaCalendarCheck, FaComments, FaArrowLeft, FaRegStickyNote, FaHistory } from "react-icons/fa";

export default function RemakFollowTable() {
  const location = useLocation();
  const navigate = useNavigate();

  const isFormView =
    location.pathname.includes("add_") ||
    location.pathname.includes("modremfollow");

  const isAddPage =
    location.pathname.includes("add_remark") ||
    location.pathname.includes("add_follow");
  const isRemarkMode = location.pathname.includes("add_remark");

  return (
    <div className="rf-master-wrapper">
      <div className="rf-header-card shadow-sm">
        <div className="rf-header-content">
          <div className="rf-title-section">
            {isAddPage && (
              <button className="rf-back-btn" onClick={() => navigate(-1)}>
                <FaArrowLeft />
              </button>
            )}

            <div className="rf-icon-box">
              {isAddPage ? (
                isRemarkMode ? <FaRegStickyNote /> : <FaHistory />
              ) : (
                <FaComments />
              )}
            </div>

            <div className="rf-text-group">
              <h2 className="rf-main-title">
                {isAddPage
                  ? isRemarkMode
                    ? "New Service Remark"
                    : "Schedule Follow Up"
                  : "Remarks & Follow Up"}
              </h2>
              <p className="rf-subtitle">
                {isAddPage
                  ? "Enter detailed interaction notes below"
                  : "Manage customer interactions and scheduled activities"}
              </p>
            </div>
          </div>

          <div className="rf-action-group">
            {!isAddPage ? (
              <div className="rf-btn-pill-group">
                <Link to="add_remark" className="rf-link">
                  <button type="button" className="rf-btn-action rf-btn-remark">
                    <FaPlus className="me-2" /> <span>Add Remarks</span>
                  </button>
                </Link>
                <Link to="add_follow" className="rf-link">
                  <button type="button" className="rf-btn-action rf-btn-follow">
                    <FaCalendarCheck className="me-2" /> <span>Add Follow</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="rf-status-badge">
                {isRemarkMode ? "REMARK MODE" : "FOLLOW-UP MODE"}
              </div>
            )}

            <div className="rf-export-divider"></div>
            <div className="rf-export-icons">
              <img src={Excel_Icon} className="rf-download-img" alt="Excel" title="Export to Excel" />
              <img src={PDF_Icon} className="rf-download-img" alt="PDF" title="Export to PDF" />
            </div>
          </div>
        </div>
      </div>

      <div className="rf-content-body">
        <Routes>
          <Route path="/" element={<RemarkFollowsTable />} />
          <Route path="modremfollow" element={<ModRemFollow />} />
          <Route path="add_remark" element={<AddRemarkFollow mode={"remark"} />} />
          <Route path="add_follow" element={<AddRemarkFollow mode={"follow"} />} />
        </Routes>
      </div>

      <style>{`
        .rf-master-wrapper {
          padding: 15px;
          font-family: 'Inter', system-ui, sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        .rf-header-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid #eef2f6;
        }

        .rf-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .rf-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .rf-back-btn {
          width: 35px;
          height: 35px;
          min-width: 35px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .rf-icon-box {
          width: 42px;
          height: 42px;
          min-width: 42px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .rf-main-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .rf-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .rf-action-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rf-btn-pill-group {
          display: flex;
          gap: 8px;
        }

        .rf-btn-action {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .rf-btn-remark { background-color: #f0fdfa; color: #0d9488; }
        .rf-btn-follow { background-color: #eff6ff; color: #2563eb; }

        .rf-status-badge {
          font-size: 10px;
          font-weight: 800;
          color: #6366f1;
          background: #f5f3ff;
          padding: 6px 12px;
          border-radius: 50px;
        }

        .rf-export-divider { width: 1px; height: 25px; background-color: #e2e8f0; }
        .rf-export-icons { display: flex; gap: 10px; }
        .rf-download-img { width: 24px; height: 24px; cursor: pointer; }

        /* RESPONSIVE BREAKPOINT */
        @media (max-width: 992px) {
          .rf-header-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .rf-action-group {
            width: 100%;
            justify-content: space-between;
            border-top: 1px solid #f1f5f9;
            padding-top: 15px;
          }
          .rf-title-section { width: 100%; }
        }

        @media (max-width: 576px) {
          .rf-btn-action span { display: none; } /* Hide text on very small screens, keep icons */
          .rf-btn-action { padding: 10px; }
          .rf-main-title { font-size: 1rem; }
          .rf-subtitle { display: none; } /* Hide subtitle on mobile for space */
        }
      `}</style>
    </div>
  );
}