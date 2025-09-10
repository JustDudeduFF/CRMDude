import React, { useEffect, useState } from "react";
import { db, api2 } from "../../FirebaseConfig";
import { ref, update } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import { usePermissions } from "../PermissionProvider";
import { Modal } from "react-bootstrap";
import axios from "axios";

export default function BroadBandPlans() {
  const partnerId = localStorage.getItem("partnerId");
  const [showplanmodal, setShowPlanModal] = useState(false);
  const [arrayplan, setArrayPlan] = useState([]);
  // const planRef = ref(db, 'Master/Broadband Plan');
  const [showmodal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  const [planDetails, setPlanDetails] = useState({
    planname: "",
    planamount: "",
    provider: "",
    planperiod: "",
    periodtime: "",
    isp: "All",
    bandwidth: "",
    company: "",
    isWeb: false,
    isActive: true,
    onLead: false,
    partnerId: partnerId,
    code: "",
  });

  const [editPlan, SetEditPlan] = useState({
    plankey: "",
    planname: "",
    planamount: "",
    periodtype: "",
    periodtime: "",
    isActive: false,
    isWeb: false,
    onLead: false,
  });

  const [provider, setProvider] = useState([]);
  const [isps, setIsps] = useState([]);
  const [companys, setCompanys] = useState([]);
  const { hasPermission } = usePermissions();

  const fetchData = async () => {
    try {
      const provResponse = await axios.get(
        api2 + "/master/planprovider?partnerId=" + partnerId
      );
      const ispResponse = await axios.get(
        api2 + "/master/isps?partnerId=" + partnerId
      );
      const compResponse = await axios.get(
        api2 + "/master/company?partnerId=" + partnerId
      );
      const planResponse = await axios.get(
        api2 + "/master/broadbandplan?partnerId=" + partnerId
      );

      if (planResponse.status !== 200) {
        toast.error("Failed To get Plans", {
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
        });
      }

      const planData = planResponse.data;
      if (planData) {
        const array = [];
        Object.keys(planData).forEach((key) => {
          const plans = planData[key];
          array.push({
            key,
            ...plans,
          });
        });
        setArrayPlan(array);
      }

      if (
        provResponse.status !== 200 ||
        ispResponse.status !== 200 ||
        compResponse.status !== 200
      ) {
        console.log("API Fetch Issue");
        return;
      }

      const provData = provResponse.data;
      if (provData) {
        const array = [];
        Object.keys(provData).forEach((key) => {
          const prov = provData[key];
          array.push(prov);
        });
        setProvider(array);
      }

      const ispData = ispResponse.data;
      if (ispData) {
        const array = [];
        Object.keys(ispData).forEach((key) => {
          const isp = ispData[key];

          array.push(isp);
        });
        setIsps(array);
      }

      const compData = compResponse.data;
      if (compData) {
        const array = [];
        Object.keys(compData).forEach((key) => {
          const comp = compData[key];
          array.push(comp);
        });
        setCompanys(array);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveplan = async () => {
    const planCode =
      planDetails.planamount +
      planDetails.planperiod +
      planDetails.periodtime +
      planDetails.bandwidth +
      Date.now();

    if (
      planDetails.planamount === "" ||
      planDetails.periodtime === "" ||
      planDetails.planname === "" ||
      planDetails.bandwidth === ""
    ) {
      toast.error("Fill All Details", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
      return;
    }

    try {
      const response = await axios.post(
        api2 + "/master/broadbandplan?partnerId=" + partnerId,
        {
          ...planDetails,
          code: planCode,
        }
      );
      if (response.status !== 200)
        return toast.error("Failed To Add Plan", { autoClose: 2000 });
      setShowModal(false);
      setPlanDetails({
        planname: "",
        planamount: "",
        provider: "",
        planperiod: "",
        periodtime: "",
        isp: "All",
        bandwidth: "",
        company: "",
        isWeb: false,
        isActive: true,
        onLead: false,
        partnerId: "687faf0f8cb6d47f12afa22b",
        code: "",
      });
      fetchData();

      toast.success("Plan Added", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    } catch (e) {
      toast.error("Something went wrong!", {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updatePlan = async () => {
    const data = {
      planamount: editPlan.planamount,
      planperiod: editPlan.periodtype,
      isActive: editPlan.isActive,
      isWeb: editPlan.isWeb,
      onLead: editPlan.onLead,
      periodtime: editPlan.periodtime,
      planname: editPlan.planname,
    };

    console.log(data);

    try {
      const response = await axios.put(
        `${api2}/master/broadbandplan/${editPlan.plankey}?partnerId=${partnerId}`,
        data
      );

      if (response.status !== 200)
        return toast.error("Failed to Upate Plan Details", { autoClose: 2000 });

      setEditModal(false);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="report-component-container">
      <ToastContainer />
      <div className="report-header">
        <h5 className="report-title" style={{ flex: "1" }}>
          Broadband Plan List
        </h5>
        <button
          onClick={() =>
            hasPermission("ADD_PLAN")
              ? setShowModal(true)
              : alert("Permission Denied")
          }
          className="btn btn-outline-success justify-content-end mb-2"
        >
          Create New Plan
        </button>
      </div>

      <div className="report-table-container">
        <table className="report-table">
          <thead className="table table-primary">
            <tr>
              <th scope="col">S. No.</th>
              <th scope="col">Plan Name</th>
              <th scope="col">Amount</th>
              <th scope="col">Duration</th>
              <th scope="col">Provider Name</th>
              <th scope="col">ISP</th>
              <th scope="col">Company</th>
              <th scope="col">On WebShow</th>
              <th scope="col">Status</th>
              <th scope="col">Show on Lead</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {arrayplan.map((data, index) => (
              <tr
                className={data.isActive !== true ? "table-danger" : ""}
                key={index}
              >
                <td>{index + 1}</td>
                <td
                  onClick={() => {
                    SetEditPlan({
                      plankey: data._id,
                      planamount: data.planamount,
                      planname: data.planname,
                      isActive: data.isActive,
                      isWeb: data.isWeb,
                      onLead: data.onLead,
                      periodtime: data.periodtime,
                      periodtype: data.planperiod,
                    });

                    setEditModal(true);
                  }}
                  className="text-primary text-decoration-underline"
                  style={{ cursor: "pointer" }}
                >
                  {data.planname}
                </td>
                <td>{data.planamount}</td>
                <td>{`${data.periodtime} ${data.planperiod}`}</td>
                <td>{data.provider}</td>
                <td>{data.isp}</td>
                <td>{data.company}</td>
                <td className={data.isWeb ? "text-success" : "text-danger"}>
                  {data.isWeb === true ? "Enabled" : "Disabled"}
                </td>
                <td className={data.isActive ? "text-success" : "text-danger"}>
                  {data.isActive === true ? "Active" : "InActive"}
                </td>
                <td className={data.onLead ? "text-success" : "text-danger"}>
                  {data.onLead === true ? "Enabled" : "Disabled"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal show={showmodal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Create New Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <div className="col-md mt-2">
              <label className="form-label">Plan Name *</label>
              <input
                onChange={(e) =>
                  setPlanDetails({
                    ...planDetails,
                    planname: e.target.value,
                  })
                }
                className="form-control"
              ></input>
            </div>

            <div className="d-flex flex-row">
              <div className="col-md mt-2 me-2">
                <label className="form-label">Provider Name *</label>
                <select
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      provider: e.target.value,
                    });
                  }}
                  className="form-select"
                >
                  <option value="">Choose...</option>
                  {provider.map((data, index) => (
                    <option key={index}>{data.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md mt-2 ms-2">
                <label className="form-label">Plan Amount *</label>
                <input
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      planamount: e.target.value,
                    });
                  }}
                  className="form-control"
                ></input>
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-md mt-2 me-2">
                <label className="form-label">Period Type *</label>
                <select
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      planperiod: e.target.value,
                    });
                  }}
                  className="form-select"
                >
                  <option value="">Choose...</option>
                  <option>Months</option>
                  <option>Days</option>
                  <option>Years</option>
                </select>
              </div>

              <div className="col-md mt-2 ms-2">
                <label className="form-label">Period Time *</label>
                <input
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      periodtime: e.target.value,
                    });
                  }}
                  className="form-control"
                  type="number"
                ></input>
              </div>
            </div>

            <div className="d-flex flex-row">
              <div className="col-md mt-2 me-2">
                <label className="form-label">ISP *</label>
                <select
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      isp: e.target.value,
                    });
                  }}
                  className="form-select"
                  disabled
                >
                  <option value="">Choose...</option>
                  {isps.map((data, index) => (
                    <option key={index}>{data.ispname}</option>
                  ))}
                </select>
              </div>

              <div className="col-md mt-2 ms-2">
                <label className="form-label">Bandwidth *</label>
                <input
                  onChange={(e) => {
                    setPlanDetails({
                      ...planDetails,
                      bandwidth: e.target.value,
                    });
                  }}
                  className="form-control"
                  type="number"
                ></input>
              </div>
            </div>

            <div className="col-md mt-2">
              <label className="form-label">Company Name *</label>
              <select
                onChange={(e) => {
                  setPlanDetails({
                    ...planDetails,
                    company: e.target.value,
                  });
                }}
                className="form-select"
              >
                <option value="">Choose...</option>
                {companys.map((data, index) => (
                  <option key={index}>{data.name}</option>
                ))}
              </select>
            </div>

            <div className="form-check from-check-inline col-md mt-2">
              <input
                onChange={(e) =>
                  setPlanDetails({
                    ...planDetails,
                    isWeb: e.target.checked,
                  })
                }
                checked={planDetails.isWeb}
                className="form-check-input"
                id="isOnline"
                type="checkbox"
              ></input>
              <label className="form-check-label" htmlFor="isOnline">
                Is Website Show?
              </label>
            </div>

            <div className="form-check from-check-inline col-md mt-2">
              <input
                checked={planDetails.isActive}
                onChange={(e) =>
                  setPlanDetails({
                    ...planDetails,
                    isActive: e.target.checked,
                  })
                }
                className="form-check-input"
                id="isActive"
                type="checkbox"
              ></input>
              <label className="form-check-label" htmlFor="isActive">
                Is Active?
              </label>
            </div>

            <div className="form-check from-check-inline col-md mt-2">
              <input
                checked={planDetails.onLead}
                onChange={(e) =>
                  setPlanDetails({
                    ...planDetails,
                    onLead: e.target.checked,
                  })
                }
                className="form-check-input"
                id="onLead"
                type="checkbox"
              ></input>
              <label className="form-check-label" htmlFor="onLead">
                Show on Lead Creation?
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={saveplan} className="btn btn-success">
            Add Plan
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="btn btn-outline-secondary"
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header>
          <Modal.Title>Edit Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <div className="col-md mt-2">
              <label className="form-label">Plan Name</label>
              <input
                value={editPlan.planname}
                className="form-control"
                type="text"
                disabled
              ></input>
            </div>

            <div className="col-md mt-2">
              <label className="form-label">Plan Amount *</label>
              <input
                onChange={(e) =>
                  SetEditPlan({
                    ...editPlan,
                    planamount: e.target.value,
                  })
                }
                defaultValue={editPlan.planamount}
                className="form-control"
                type="number"
              ></input>
            </div>

            <div className="d-flex flex-row mt-2">
              <div className="col-md me-2">
                <label className="form-label">Period Type *</label>
                <select
                  onChange={(e) =>
                    SetEditPlan({
                      ...editPlan,
                      periodtype: e.target.value,
                    })
                  }
                  defaultValue={editPlan.periodtype}
                  className="form-select"
                >
                  <option value="">Choose...</option>
                  <option>Months</option>
                  <option>Days</option>
                  <option>Years</option>
                </select>
              </div>

              <div className="col-md ms-2">
                <label className="form-label">Period Time *</label>
                <input
                  onChange={(e) =>
                    SetEditPlan({
                      ...editPlan,
                      periodtime: e.target.value,
                    })
                  }
                  defaultValue={editPlan.periodtime}
                  className="form-control"
                ></input>
              </div>
            </div>

            <div className="form-check form-check-inline col-md mt-2">
              <input
                checked={editPlan.isWeb}
                onChange={(e) =>
                  SetEditPlan({
                    ...editPlan,
                    isWeb: e.target.checked,
                  })
                }
                className="form-check-input"
                id="isOnline"
                type="checkbox"
              />
              <label className="form-check-label" htmlFor="isOnline">
                Is Website Show?
              </label>
            </div>

            <div className="form-check from-check-inline col-md mt-2">
              <input
                checked={editPlan.isActive}
                onChange={(e) =>
                  SetEditPlan({
                    ...editPlan,
                    isActive: e.target.checked,
                  })
                }
                className="form-check-input"
                id="isActive"
                type="checkbox"
              ></input>
              <label className="form-check-label" htmlFor="isActive">
                Is Active?
              </label>
            </div>

            <div className="form-check from-check-inline col-md mt-2">
              <input
                checked={editPlan.onLead}
                onChange={(e) =>
                  SetEditPlan({
                    ...editPlan,
                    onLead: e.target.checked,
                  })
                }
                className="form-check-input"
                id="onLead"
                type="checkbox"
              ></input>
              <label className="form-check-label" htmlFor="onLead">
                Show on Lead Creation?
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={updatePlan} className="btn btn-primary">
            Update
          </button>
          <button
            onClick={() => setEditModal(false)}
            className="btn btn-outline-secondary"
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
