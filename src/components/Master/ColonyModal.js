import { get, ref, set, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import { api2, db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const ColonyModal = ({ show, notshow }) => {
  const partnerId = localStorage.getItem("partnerId");
  const [colonyname, setColonyName] = useState("");
  const [undercompany, setUnderCompany] = useState("");
  const [arraycompany, setArrayCompany] = useState([]);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const fetchCompany = async () => {
    try {
      const response = await axios.get(
        api2 + "/master/company?partnerId=" + partnerId
      );

      setArrayCompany(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleClick = async () => {
    const Colonydata = {
      name: colonyname,
      undercompany,
      partnerId: partnerId,
      code: colonyname,
    };

    try {
      const response = await axios.post(
        api2 + "/master/colony?partnerId=" + partnerId,
        Colonydata
      );

      if (response .status !== 200)
        return toast.error("Failed to add colony", { autoClose: 2000 });
      notshow(true);
    } catch (e) {
      console.log(e);
      toast.error("Failed to add colony", { autoClose: 2000 });
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-primary">Add Colony</h4>
          <button
            className="btn-close"
            aria-label="Close"
            onClick={notshow}
          ></button>
        </div>

        <form className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Colony Name</label>
            <input
              onChange={(e) =>
                setColonyName(capitalizeFirstLetter(e.target.value))
              }
              type="text"
              className="form-control"
              placeholder="Enter Colony Name"
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Under Company</label>
            <select
              onChange={(e) => setUnderCompany(e.target.value)}
              className="form-select"
            >
              <option value=''>Choose...</option>
              {arraycompany.length > 0 ? (
                arraycompany.map((company, index) => (
                  <option key={index} value={company.name}>
                    {company.name}
                  </option>
                ))
              ) : (
                <option value="">No Company Available</option>
              )}
            </select>
          </div>
        </form>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            onClick={handleClick}
            className="btn btn-success px-4 rounded-3"
          >
            Add Colony
          </button>
          <button
            onClick={notshow}
            className="btn btn-secondary px-4 rounded-3"
          >
            Cancel
          </button>
        </div>
      </div>
      <ToastContainer className="mt-5" />
    </div>
  );
};

export default ColonyModal;
