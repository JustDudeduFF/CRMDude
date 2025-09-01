import { useState } from "react";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const DesignationModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [designationname, setdesignationName] = useState("");
  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleClick = async () => {
    const data = {
      name: designationname,
      partnerId: partnerId,
    };

    try {
      const response = await axios.post(
        api2 + "/master/designations?partnerId=" + partnerId,
        data
      );

      if (response.status !== 200)
        return toast.error("Failed to add designation", { autoClose: 2000 });

      notshow(true);
    } catch (e) {
      console.log(e);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="d-flex flex-row">
          <h5 style={{ flex: "1" }}>Add Designation</h5>
        </div>

        <form className="row g-3">
          <div className="col-md-3">
            <label className="form-label">Designation Name</label>
            <input
              onChange={(e) => {
                setdesignationName(capitalizeFirstLetter(e.target.value));
              }}
              type="text"
              className="form-control"
            ></input>
          </div>
        </form>

        <div className="d-flex flex-row">
          <button
            onClick={handleClick}
            style={{ flex: "1" }}
            className="btn btn-outline-success mt-4"
          >
            Add Designation
          </button>
          <button
            onClick={notshow}
            style={{ flex: "1" }}
            className="btn btn-outline-secondary ms-3 mt-4"
          >
            Cancel
          </button>
        </div>
      </div>
      <ToastContainer className="mt-5" />
    </div>
  );
};

export default DesignationModal;
