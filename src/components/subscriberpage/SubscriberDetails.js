import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SubscriberPersonal from "./SubscriberPersonal";
import RechargeTable from "./RechargeTable";
import { Modal } from "react-bootstrap";
import { get, ref, update } from "firebase/database";
import { api2, db } from "../../FirebaseConfig";
import axios from "axios";
import { toast } from "react-toastify";
import "./SubscriberDetails.css";

export default function SubscriberDetails() {
  const userid = localStorage.getItem("susbsUserid");
  const partnerId = localStorage.getItem("partnerId");
  const [showmodal, setShowModal] = useState(false);
  const [arrayColony, setArrayColony] = useState([]);

  const [subsDetail, setSubsDetail] = useState({
    name: "",
    address: "",
    colonyname: "",
    mobile: "",
    alternate: "",
    email: "",
    conectiontyp: "",
    companyname: "",
    username: "",
  });

  const [prevSubsDetail, setPrevSubsDetail] = useState({});

  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        const userRes = await axios.get(`${api2}/subscriber/?id=${userid}`);

        if (userRes.status !== 200 || !userRes.data) {
          throw new Error("Failed to fetch subscriber details");
        }

        const userData = userRes.data;

        setSubsDetail({
          name: userData.fullname || userData.fullName || "",
          address: userData.installationAddress || "",
          colonyname: userData.colonyName || "",
          mobile: userData.mobile || userData.mobileNo || "",
          alternate: userData.alternateNo || "",
          email: userData.email || "",
          connectiontype:
            userData.connectionType || userData.conectiontyp || "",
          companyname: userData.company || "",
          username: userData.username || "",
        });
      } catch (err) {
        console.error("Error fetching subscriber details:", err);
        alert("Failed to fetch subscriber details. Please try again later.");
      }
    };

    const fetchColony = async () => {
      const colonyRes = await axios.get(
        api2 + "/subscriber/colonys?partnerId=" + partnerId
      );
      if (colonyRes.data && colonyRes.data.length > 0) {
        setArrayColony(colonyRes.data);
      } else {
        setArrayColony([]);
      }
    };

    fetchColony();
    fetchBasicInfo();
  }, [userid]);

  const handleUpdate = async () => {
    const changes = [];

    if (JSON.stringify(subsDetail) === JSON.stringify(prevSubsDetail)) {
      toast.error("No changes detected", { autoClose: 2000 });
      return;
    }

    if (
      !subsDetail.name ||
      !subsDetail.mobile ||
      !subsDetail.address ||
      !subsDetail.colonyname ||
      !subsDetail.conectiontyp ||
      !subsDetail.username
    ) {
      toast.error("Please fill all required fields", { autoClose: 2000 });
      return;
    }

    Object.keys(prevSubsDetail).forEach((key) => {
      if (subsDetail[key] !== prevSubsDetail[key]) {
        changes.push(
          `${key} is changed from "${prevSubsDetail[key] || "N/A"}" to "${
            subsDetail[key]
          }"`
        );
      }
    });

    const userData = {
      subscriberId: userid,
      updatedBy: localStorage.getItem("contact"),
      changes: changes,
      fullName: subsDetail.name,
      installationAddress: subsDetail.address,
      colonyName: subsDetail.colonyname,
      mobileNo: subsDetail.mobile,
      alternatNo: subsDetail.alternate,
      email: subsDetail.email,
      company: subsDetail.companyname,
      username: subsDetail.username,
      conectiontyp: subsDetail.conectiontyp,
    };

    try {
      const res = await axios.put(`${api2}/subscriber/${userid}`, { userData });
      if (res.status === 200) {
        setShowModal(false);
        toast.success("Subscriber details updated successfully", {
          autoClose: 2000,
        });
        setPrevSubsDetail(subsDetail); // Update previous details to current
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err.response?.data?.error || "Failed to update subscriber details",
        {
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
        }
      );
    }
  };

  return (
    <>
      <div className="subscriber-details-container">
        <div className="subscriber-details-header">
          <h2 className="subscriber-details-title">Connection Info</h2>
          <div className="subscriber-details-note">
            <span>Recent Note :- </span>
            <span className="subscriber-details-note-text">
              Remarks Particular Only
            </span>
          </div>
          <div className="subscriber-details-actions">
            <Link to="/dashboard/subscriber/rechargeinfo">
              <button
                type="button"
                className="subscriber-details-btn subscriber-details-btn-outline-success"
              >
                Recharge Info
              </button>
            </Link>
            <button
              onClick={() => {
                setPrevSubsDetail(subsDetail);
                setShowModal(true);
              }}
              type="button"
              className="subscriber-details-btn subscriber-details-btn-outline-secondary"
            >
              Edit Info
            </button>
          </div>
        </div>

        <div className="subscriber-details-content">
          <Routes>
            <Route path="/" element={<SubscriberPersonal />} />
            <Route path="rechargeinfo" element={<RechargeTable />} />
          </Routes>
        </div>

        <Modal
          show={showmodal}
          onHide={() => setShowModal(false)}
          size="xl"
          className="subscriber-details-modal"
        >
          <Modal.Header>
            <Modal.Title>Edit Subscriber Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="subscriber-details-form">
              <div className="subscriber-details-form-row">
                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Name
                  </label>
                  <input
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        name: e.target.value,
                      }))
                    }
                    value={subsDetail.name}
                    type="text"
                    placeholder="Fullname"
                    className="subscriber-details-form-control"
                  />
                </div>

                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Mobile
                  </label>
                  <input
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        mobile: e.target.value,
                      }))
                    }
                    value={subsDetail.mobile}
                    type="number"
                    placeholder="e.g. xxxxxxxx02"
                    className="subscriber-details-form-control"
                  />
                </div>

                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Alternate Mobile
                  </label>
                  <input
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        alternate: e.target.value,
                      }))
                    }
                    value={subsDetail.alternate}
                    placeholder="e.g. xxxxxxxx02"
                    type="number"
                    className="subscriber-details-form-control"
                  />
                </div>

                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Mail Address
                  </label>
                  <input
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        email: e.target.value,
                      }))
                    }
                    value={subsDetail.email}
                    placeholder="e.g. abc@gmail.com"
                    type="email"
                    className="subscriber-details-form-control"
                  />
                </div>
              </div>

              <div className="subscriber-details-form-field-full">
                <label className="subscriber-details-form-label">
                  Subscriber Installation Address
                </label>
                <textarea
                  onChange={(e) =>
                    setSubsDetail((prevState) => ({
                      ...prevState,
                      address: e.target.value,
                    }))
                  }
                  value={subsDetail.address}
                  className="subscriber-details-form-textarea"
                  rows="3"
                  placeholder="e.g. H.no.002, Street no.0 XX Area"
                />
              </div>

              <div className="subscriber-details-form-row">
                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Colony Name
                  </label>
                  <select
                    onChange={(e) => {
                      const selectColony = e.target.value;
                      const selectedColonyObj = arrayColony.find(
                        (colony) => colony.name === selectColony
                      );
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        colonyname: selectColony,
                        companyname: selectedColonyObj.undercompany,
                      }));
                    }}
                    defaultValue={subsDetail.colonyname}
                    className="subscriber-details-form-select"
                  >
                    <option value="">Choose...</option>
                    {arrayColony.length > 0 ? (
                      arrayColony.map((colony, index) => (
                        <option key={index} value={colony.name}>
                          {colony.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No Data Found!</option>
                    )}
                  </select>
                </div>

                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    Subscriber Connection Type
                  </label>
                  <select
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        conectiontyp: e.target.value,
                      }))
                    }
                    defaultValue={subsDetail.conectiontyp}
                    className="subscriber-details-form-select"
                  >
                    <option value="">Choose...</option>
                    <option value="FTTH">FTTH</option>
                    <option value="EtherNet">EtherNet</option>
                  </select>
                </div>

                <div className="subscriber-details-form-field">
                  <label className="subscriber-details-form-label">
                    User ID
                  </label>
                  <input
                    onChange={(e) =>
                      setSubsDetail((prevState) => ({
                        ...prevState,
                        username: e.target.value,
                      }))
                    }
                    defaultValue={subsDetail.username}
                    className="subscriber-details-form-control"
                    type="text"
                  />
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={handleUpdate}
              className="subscriber-details-btn subscriber-details-btn-primary"
            >
              Update
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="subscriber-details-btn subscriber-details-btn-outline-secondary"
            >
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
