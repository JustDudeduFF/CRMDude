import { get, ref, set, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import { db } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";

const ColonyModal = ({ show, notshow }) => {
  const [colonyname, setColonyName] = useState("");
  const [undercompany, setUnderCompany] = useState("");
  const [arraycompany, setArrayCompany] = useState([]);

  const capitalizeFirstLetter = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    const officeRef = ref(db, `Master/companys`);
    const unsubscribeOffice = onValue(officeRef, (officeSnap) => {
      if (officeSnap.exists()) {
        const CompanyeArray = [];
        officeSnap.forEach((ChildOffice) => {
          const officename = ChildOffice.key;
          CompanyeArray.push(officename);
        });
        setArrayCompany(CompanyeArray);
      } else {
        toast.error("Please Add an Office Location", {
          autoClose: 3000,
        });
      }
    });

    return () => unsubscribeOffice();
  }, []);

  const Colonydata = {
    colonyname,
    undercompany,
  };

  const handleClick = async () => {
    const colonyRef = ref(db, `Master/Colonys/${colonyname}`);
    const colonySnap = await get(colonyRef);

    if (colonySnap.exists()) {
      toast.error("Colony Already Exists!", { autoClose: 2000 });
    } else {
      await set(colonyRef, Colonydata);
      toast.success("Colony Added Successfully!", { autoClose: 2000 });
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
              {arraycompany.length > 0 ? (
                arraycompany.map((company, index) => (
                  <option key={index} value={company}>
                    {company}
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
