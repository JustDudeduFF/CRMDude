import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api2 } from "../../FirebaseConfig";
import { toast } from "react-toastify";
import "./AddNewDoc.css";

export default function AddNewDoc() {
  const partnerId = localStorage.getItem("partnerId");
  const userid = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [btnMode, setBtnMode] = useState(true);
  const maxSizeInMB = 5; // Maximum file size in MB
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the selected file

    setSelectedFile(null);

    if (file) {
      const fileSizeInMB = file.size / (1024 * 1024); // Convert file size to MB

      if (fileSizeInMB > maxSizeInMB) {
        alert(`File size exceeds the maximum limit of ${maxSizeInMB} MB.`);
        setSelectedFile(null);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(
          `Invalid file type. Allowed types are: ${allowedTypes.join(", ")}.`
        );
        setSelectedFile(null);
        return;
      }

      // If valid, set the file
      setSelectedFile(file);
      setBtnMode(false);
    }
  };

  const uploadDoc = async () => {
    if (!selectedFile || !documentType) {
      alert("Please add all details and try again!");
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
      const response = await axios.post(
        `${api2}/subscriber/documents/${userid}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status !== 200)
        return toast.error("Failed to Upload Document", { autoClose: 2000 });

      navigate(-1);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    } finally {
      setBtnMode(false);
    }
  };

  return (
    <div className="add-new-doc-container">
      <div className="add-new-doc-form">
        <div className="add-new-doc-form-group">
          <label className="add-new-doc-form-label">Select Document Name</label>
          <select
            onChange={(e) => setDocumentType(e.target.value)}
            className="add-new-doc-form-select"
          >
            <option value="">Choose...</option>
            <option value="addressProof">Address Proof</option>
            <option value="identityProof">Identity Proof</option>
            <option value="cafDocuments">CAF Documents</option>
            <option value="profilePhoto">Profile Photo</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="add-new-doc-form-group">
          <input
            onChange={handleFileChange}
            type="file"
            className="add-new-doc-form-control"
          />
          <span className="add-new-doc-file-info">
            *File is not more than 5mb*
          </span>
          <button
            onClick={uploadDoc}
            className="add-new-doc-btn add-new-doc-btn-outline-secondary"
            disabled={btnMode}
          >
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
}
