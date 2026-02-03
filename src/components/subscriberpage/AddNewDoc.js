import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaCloudUploadAlt, FaFileSignature, FaInfoCircle, FaFileImage, FaFilePdf } from "react-icons/fa";

export default function AddNewDoc() {
  const partnerId = localStorage.getItem("partnerId");
  const userid = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [btnMode, setBtnMode] = useState(true);
  const maxSizeInMB = 5; 
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(null);
    setBtnMode(true);

    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024);

      if (fileSizeInMB > maxSizeInMB) {
        toast.error(`File size exceeds the limit of ${maxSizeInMB} MB.`);
        event.target.value = null;
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Allowed types: JPG, PNG, PDF only.`);
        event.target.value = null;
        return;
      }

      setSelectedFile(file);
      setBtnMode(false);
    }
  };

  const uploadDoc = async () => {
    if (!selectedFile || !documentType) {
      toast.warning("Please select both document type and a file!");
      return;
    }

    setBtnMode(true);
    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentname", documentType);
    formData.append("modifiedby", localStorage.getItem("contact"));
    formData.append("partnerId", partnerId);
    formData.append("source", "Web CRM");

    try {
      const response = await API.post(
        `/subscriber/documents/${userid}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status !== 200)
        return toast.error("Failed to Upload Document");

      toast.success("Document uploaded successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
      setBtnMode(false);
    }
  };

  return (
    <div className="add-doc-container">
      <ToastContainer position="top-right" theme="colored" />
      <div className="add-doc-card shadow-sm">
        
        <div className="add-doc-header">
          <div className="add-doc-icon">
            <FaCloudUploadAlt />
          </div>
          <div>
            <h5 className="fw-bold mb-0">Upload Manager</h5>
            <p className="text-muted small mb-0">Select type and choose a valid file</p>
          </div>
        </div>

        <div className="add-doc-body p-4">
          <div className="row g-4">
            {/* Document Type Selection */}
            <div className="col-12">
              <label className="add-doc-label"><FaFileSignature className="me-2"/>Document Label</label>
              <select
                onChange={(e) => setDocumentType(e.target.value)}
                className="add-doc-select"
                value={documentType}
              >
                <option value="">Choose Document Category...</option>
                <option value="addressProof">Address Proof</option>
                <option value="identityProof">Identity Proof</option>
                <option value="cafDocuments">CAF Documents</option>
                <option value="profilePhoto">Profile Photo</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Custom File Upload Area */}
            <div className="col-12">
              <label className="add-doc-label"><FaInfoCircle className="me-2"/>File Attachment</label>
              <div className={`file-drop-zone ${selectedFile ? 'has-file' : ''}`}>
                <input
                  onChange={handleFileChange}
                  type="file"
                  id="file-input"
                  className="hidden-file-input"
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <label htmlFor="file-input" className="file-drop-label">
                  <div className="drop-icon">
                    {selectedFile ? (
                      selectedFile.type === "application/pdf" ? <FaFilePdf /> : <FaFileImage />
                    ) : (
                      <FaCloudUploadAlt />
                    )}
                  </div>
                  <div className="drop-text">
                    {selectedFile ? (
                      <span className="file-name text-primary fw-bold">{selectedFile.name}</span>
                    ) : (
                      <>
                        <strong>Click to browse</strong> or drag and drop
                        <span className="d-block text-muted small mt-1">PNG, JPG or PDF (Max 5MB)</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="col-12 mt-4">
              <button
                onClick={uploadDoc}
                className="add-doc-submit-btn w-100"
                disabled={btnMode}
              >
                {btnMode && selectedFile ? "Uploading File..." : "Confirm & Upload Document"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .add-doc-container {
          padding: 20px;
          display: flex;
          justify-content: center;
          background: #f8fafc;
        }

        .add-doc-card {
          width: 100%;
          max-width: 550px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #eef2f6;
          overflow: hidden;
        }

        .add-doc-header {
          display: flex;
          align-items: center;
          padding: 20px 25px;
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          gap: 15px;
        }

        .add-doc-icon {
          width: 45px;
          height: 45px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .add-doc-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 10px;
        }

        .add-doc-select {
          width: 100%;
          padding: 12px 15px;
          border-radius: 12px;
          border: 2px solid #f1f5f9;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: 0.2s;
          appearance: none;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C2.185 5.355 2.401 5 2.827 5h9.435c.426 0 .642.355.376.658l-4.796 5.482a.502.502 0 0 1-.764 0z'/%3E%3C/svg%3E") no-repeat right 15px center;
        }

        .add-doc-select:focus { border-color: #3b82f6; }

        .file-drop-zone {
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          padding: 30px 20px;
          text-align: center;
          transition: 0.2s;
          background: #fbfcfe;
          position: relative;
        }

        .file-drop-zone:hover { border-color: #3b82f6; background: #f0f7ff; }
        .file-drop-zone.has-file { border-style: solid; border-color: #10b981; background: #f0fdf4; }

        .hidden-file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0; left: 0;
          opacity: 0;
          cursor: pointer;
        }

        .file-drop-label { cursor: pointer; display: block; }
        .drop-icon { font-size: 2.5rem; color: #94a3b8; margin-bottom: 10px; }
        .has-file .drop-icon { color: #10b981; }
        .drop-text { font-size: 14px; color: #475569; }

        .add-doc-submit-btn {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.95rem;
          transition: 0.3s;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
        }

        .add-doc-submit-btn:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }

        .add-doc-submit-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3);
        }
      `}</style>
    </div>
  );
}