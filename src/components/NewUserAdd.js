import React, { useState, useEffect } from "react";
import {  db, storage, api2 } from "../FirebaseConfig";
import { uploadBytes, getDownloadURL, ref as dbRef } from "firebase/storage";
import { ref, set, update } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import { ProgressBar } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NewUserAdd.css";

export default function NewUserAdd() {
  const partnerId = localStorage.getItem("partnerId");
  const navigate = useNavigate();
  //Use States For Fill All Details
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [installationAddress, setInstallationAddress] = useState("");
  const [colonyName, setColonyName] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  // Connection Details
  const [planAmount, setPlanAmount] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [refundableAmount, setRefundableAmount] = useState("");
  const [activationDate, setActivationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expiryDate, setExpiryDate] = useState(null);
  const [conectiontyp, setConnectionTyp] = useState("");
  const [category, setCategory] = useState("All");
  const [deviceMaker, setDeviceMaker] = useState("All");
  const [filterDevice, setFilterDevice] = useState([]);
  const [deviceSerialNumber, setDeviceSerialNumber] = useState({
    serial: "",
    mac: "",
  });
  // Documents
  const [identityProof, setIdentityProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [cafDocuments, setCafDocuments] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  //Broadband Plan Array for Fetching Data
  const [arraycolony, setArraycolony] = useState([]);
  const [arrayplan, setArrayplan] = useState([]);
  const [arrayisp, setArrayisp] = useState([]);
  const [arrayprovider, setArrayProvider] = useState([]);
  const [arraydevice, setArraydevice] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [arraymaker, setArrayMaker] = useState([]);
  const [planDuration, setPlanDuration] = useState(0); // Duration value from Firebase
  const [durationUnit, setDurationUnit] = useState("");
  const [planData, setPlanData] = useState({
    provider: "All",
    isp: "All",
    planname: "",
    activationDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    planAmount: "",
    bandwidth: "",
    planperiod: "",
    periodtime: "",
    baseamount: "",
    remarks: "",
    plancode: "",
    installby: "",
    leadby: "",
  });
  const [arrayuser, setArrayUser] = useState([]);
  const [filterPlans, setFilterPlans] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    initialData();
  }, []);

  const initialData = async () => {
    try {
      const [responsePlan, responseColony, responseIsp, responseUsers] =
        await Promise.all([
          axios.get(api2 + "/addnew/broadbandplan?partnerId=" + partnerId),
          axios.get(api2 + "/subscriber/colonys?partnerId=" + partnerId),
          axios.get(api2 + "/subscriber/isps?partnerId=" + partnerId),
          axios.get(api2 + "/subscriber/users?partnerId=" + partnerId),
        ]);

      if (
        responsePlan.status !== 200 ||
        responseColony.status !== 200 ||
        responseUsers.status !== 200 ||
        responseIsp.status !== 200
      ) {
        return;
      }

      const colonyData = responseColony.data;
      if (colonyData) {
        setArraycolony(colonyData);
      }

      const planData = responsePlan.data.plans;
      if (planData) {
        const array = [];
        Object.keys(planData).forEach((key) => {
          const plan = planData[key];
          const planKey = key;

          array.push({ ...plan, planKey });
        });
        const provider = [...new Set(array.map((data) => data.provider))];
        setArrayProvider(provider);
        setArrayplan(array);
      }

      const ispData = responseIsp.data;
      if (ispData) {
        const array = [];
        Object.keys(ispData).forEach((key) => {
          const isp = ispData[key];
          array.push(isp);
        });
        setArrayisp(array);
      }

      const userData = responseUsers.data;
      if (userData) {
        const array = [];
        Object.keys(userData).forEach((key) => {
          const user = userData[key];

          const name = user.empname;
          const mobile = user.empmobile;
          array.push({ name, mobile });
        });
        setArrayUser(array);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const updateExpirationDate = (newActivationDate, duration, unit) => {
    const date = new Date(newActivationDate);

    // Extend the date based on the unit from Firebase
    if (unit === "Months") {
      date.setMonth(date.getMonth() + parseInt(duration));
    } else if (unit === "Years") {
      date.setFullYear(date.getFullYear() + parseInt(duration));
    } else if (unit === "Days") {
      date.setDate(date.getDate() + parseInt(duration));
    }

    // Format the new expiration date to YYYY-MM-DD
    const formattedExpirationDate = date.toISOString().split("T")[0];
    setExpiryDate(formattedExpirationDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    // Validation
    if (
      !fullName ||
      !username ||
      !mobileNo ||
      !company ||
      !installationAddress ||
      !conectiontyp ||
      !planData.isp
    ) {
      toast.error("Mandatory fields must not be empty", {
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setLoader(false);
      return;
    }

    try {
      const formData = new FormData();

      // Append text fields
      formData.append("company", company);
      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("mobileNo", mobileNo);
      formData.append("email", email);
      formData.append("installationAddress", installationAddress);
      formData.append("colonyName", colonyName);
      formData.append("state", state);
      formData.append("pinCode", pinCode);
      formData.append("isp", planData.isp);
      formData.append("planName", planData.planname);
      formData.append("planAmount", planAmount);
      formData.append("securityDeposit", securityDeposit);
      formData.append("refundableAmount", refundableAmount);
      formData.append("activationDate", activationDate);
      formData.append("expiryDate", expiryDate);
      formData.append("conectiontyp", conectiontyp);
      formData.append("bandwidth", planData.bandwidth);
      formData.append("provider", planData.provider);
      formData.append("createdAt", new Date().toISOString().split("T")[0]);
      formData.append("installedby", planData.installby);
      formData.append("leadby", planData.leadby);
      formData.append("completedby", localStorage.getItem("contact"));
      formData.append("plancode", planData.plancode)
      formData.append("source", "Web CRM");

      // Append document flags (if needed)
      formData.append("documents[addressProof]", "1");
      formData.append("documents[identityProof]", "1");
      formData.append("documents[cafDocument]", "1");
      formData.append("documents[profilePhoto]", "1");

      // Append files (only if selected)
      if (addressProof) formData.append("addressProof", addressProof);
      if (identityProof) formData.append("identityProof", identityProof);
      if (cafDocuments) formData.append("cafDocument", cafDocuments);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);

      const response = await axios.post(
        `${api2}/addnew?partnerId=${partnerId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Subscriber added successfully!");
        localStorage.setItem(
          "susbsUserid",
          response.data.message.split(" ")[2]
        );
        navigate("/dashboard/subscriber");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error adding subscriber.");
    } finally {
      setLoader(false);
    }
  };


  useEffect(() => {
    let deviceFilter = arraydevice;

    if (category !== "All") {
      deviceFilter = deviceFilter.filter(
        (device) => device.devicecategry === category
      );
    }

    if (deviceMaker !== "All") {
      deviceFilter = deviceFilter.filter(
        (device) => device.makername === deviceMaker
      );
    }

    setFilterDevice(deviceFilter);
  }, [category, deviceMaker]);

  useEffect(() => {
    let filterArray = arrayplan;

    if (planData.provider !== "All") {
      filterArray = filterArray.filter(
        (data) => data.provider === planData.provider
      );
    }

    setFilterPlans(filterArray);
  }, [planData.provider, planData.isp]);

  return (
    <div className="new-user-add-container">
      {loader && (
        <div
          className="spinner-wrapper"
          style={{
            position: "fixed",
            width: "100%",
            top: "0",
            height: "100%",
            backgroundColor: "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: "0.5",
            zIndex: "1000",
          }}
        >
          <div style={{ width: "200px", height: "100px", position: "fixed" }}>
            <ProgressBar
              height="80"
              width="80"
              radius="9"
              color="blue"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <br></br>
            <label style={{ color: "white", fontSize: "17px" }}>
              Uploading Data...
            </label>
          </div>
        </div>
      )}
      <div className="new-user-add-section">
        <h3 className="new-user-add-section-title">Basic Information</h3>
        <div className="new-user-add-form-container">
          <form className="new-user-add-form">
            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Select Company (Auto)
              </label>
              <input
                value={company}
                className="new-user-add-form-control"
                disabled
              />
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">FullName *</label>
              <input
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                className="new-user-add-form-control"
                required
              />
              <div className="new-user-add-validation-feedback valid-feedback">
                Looks good!
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Username *</label>
              <div className="new-user-add-input-group">
                <span className="new-user-add-input-group-text">@</span>
                <input
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  className="new-user-add-form-control"
                  required
                />
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Mobile No. *</label>
              <div className="new-user-add-input-group">
                <span className="new-user-add-input-group-text">+91</span>
                <input
                  onChange={(e) => setMobileNo(e.target.value)}
                  maxLength={10}
                  type="numbers"
                  className="new-user-add-form-control"
                  required
                />
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Email Address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="new-user-add-form-control"
                required
              />
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Installation Address *
              </label>
              <input
                onChange={(e) => setInstallationAddress(e.target.value)}
                type="text"
                className="new-user-add-form-control"
                required
              />
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Colony Name</label>
              <select
                onChange={(e) => {
                  const selectColony = e.target.value;
                  setColonyName(selectColony);

                  const selectedColonyObj = arraycolony.find(
                    (colony) => colony.name === selectColony
                  );
                  if (selectedColonyObj) {
                    setCompany(selectedColonyObj.undercompany);
                  } else {
                    setCompany("");
                  }
                }}
                className="new-user-add-form-select"
                required
              >
                <option>Choose...</option>
                {arraycolony.length > 0 ? (
                  arraycolony.map((colony, index) => (
                    <option key={index} value={colony.name}>
                      {colony.name}
                    </option>
                  ))
                ) : (
                  <option value="">No Colony Available</option>
                )}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">State</label>
              <input
                onChange={(e) => setState(e.target.value)}
                type="text"
                className="new-user-add-form-control"
                required
              />
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">PIN Code</label>
              <input
                onChange={(e) => setPinCode(e.target.value)}
                type="text"
                className="new-user-add-form-control"
                required
              />
            </div>
          </form>
        </div>
      </div>

      <div className="new-user-add-section">
        <h3 className="new-user-add-section-title">Connection Details</h3>
        <div className="new-user-add-form-container">
          <form className="new-user-add-form">
            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Select ISP *</label>
              <select
                onChange={(e) =>
                  setPlanData({
                    ...planData,
                    isp: e.target.value,
                  })
                }
                className="new-user-add-form-select"
                required
              >
                <option value="">Choose...</option>
                {arrayisp.length > 0 ? (
                  arrayisp.map((isp, index) => (
                    <option key={index} value={isp}>
                      {isp}
                    </option>
                  ))
                ) : (
                  <option value="">No ISP Available</option>
                )}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Provider Name</label>
              <select
                onChange={(e) =>
                  setPlanData({
                    ...planData,
                    provider: e.target.value,
                  })
                }
                className="new-user-add-form-select"
              >
                <option value="">Choose...</option>
                {arrayprovider.map((data, index) => (
                  <option key={index} value={data}>
                    {data}
                  </option>
                ))}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Plan Name</label>
              <select
                onChange={(e) => {
                  const selectedPlanName = e.target.value;

                  // Find the selected plan's amount
                  const selectedPlanObj = arrayplan.find(
                    (plan) => plan.planKey === selectedPlanName
                  );
                  if (selectedPlanObj) {
                    setPlanAmount(selectedPlanObj.planamount);
                    const periodtyp = selectedPlanObj.planperiod;
                    const periodtime = selectedPlanObj.periodtime;

                    setPlanData({
                      ...planData,
                      plancode: selectedPlanName,
                      bandwidth: selectedPlanObj.bandwidth,
                      provider: selectedPlanObj.provider,
                      isp: planData.isp,
                      planname: selectedPlanObj.planname,
                    });

                    setPlanDuration(periodtime);
                    setDurationUnit(periodtyp);

                    updateExpirationDate(activationDate, periodtime, periodtyp);
                  } else {
                    setPlanAmount("");
                  }
                }}
                className="new-user-add-form-select"
                required
              >
                <option>Choose...</option>
                {filterPlans.length > 0 ? (
                  filterPlans.map((plan, index) => (
                    <option key={index} value={plan.planKey}>
                      {plan.planname}
                    </option>
                  ))
                ) : (
                  <option value="">No Plan Available</option>
                )}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Plan Amount</label>
              <div className="input-group has-validation">
                <input
                  onChange={(e) => setPlanAmount(e.target.value)}
                  type="text"
                  value={planAmount}
                  className="new-user-add-form-control"
                  aria-describedby="inputGroupPrepend"
                  required
                ></input>
                <div className="invalid-feedback">
                  Please choose a username.
                </div>
              </div>
            </div>
            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom03"
                className="new-user-add-form-label"
              >
                Security Deposite
              </label>
              <input
                onChange={(e) => {
                  setSecurityDeposit(e.target.value);
                  setRefundableAmount(e.target.value);
                }}
                type="text"
                className="new-user-add-form-control"
                id="validationCustom03"
                required
              ></input>
              <div className="invalid-feedback">
                Please provide a valid city.
              </div>
            </div>
            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom04"
                className="new-user-add-form-label"
              >
                Refundable Amount
              </label>
              <input
                value={refundableAmount}
                onChange={(e) => setRefundableAmount(e.target.value)}
                type="text"
                className="new-user-add-form-control"
                id="validationCustom03"
                required
              ></input>
              <div className="invalid-feedback">
                Please select a valid state.
              </div>
            </div>
            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom04"
                className="new-user-add-form-label"
              >
                Activation Date
              </label>
              <input
                value={activationDate}
                type="date"
                onChange={(e) => {
                  setActivationDate(e.target.value);
                  updateExpirationDate(
                    e.target.value,
                    planDuration,
                    durationUnit
                  );
                }}
                className="new-user-add-form-control"
              ></input>
              <div className="invalid-feedback">
                Please select a valid state.
              </div>
            </div>
            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom04"
                className="new-user-add-form-label"
              >
                Expiry Date
              </label>
              <input
                disabled
                value={expiryDate}
                type="date"
                onChange={(e) => setExpiryDate(e.target.value)}
                className="new-user-add-form-control"
              ></input>
              <div className="invalid-feedback">
                Please select a valid state.
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Connection Type *
              </label>
              <select
                onChange={(e) => setConnectionTyp(e.target.value)}
                className="new-user-add-form-select"
              >
                <option value="">Choose...</option>
                <option value="FTTH">FTTH</option>
                <option value="EtherNet">EtherNet</option>
              </select>
            </div>
          </form>
        </div>

        {/* Inventory Details Section */}
        <h3 className="new-user-add-section-title">
          Inventory & Device Details
        </h3>
        <div className="new-user-add-form-container">
          <form className="new-user-add-form" noValidate>
            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Select Device Maker
              </label>
              <select
                onChange={(e) => setDeviceMaker(e.target.value)}
                className="new-user-add-form-select"
                id="validationCustom04"
                required
              >
                <option value="All">Choose...</option>
                {arraymaker.length > 0 ? (
                  arraymaker.map((devicename, index) => (
                    <option key={index} value={devicename}>
                      {devicename}
                    </option>
                  ))
                ) : (
                  <option value="">No Maker Available</option>
                )}
              </select>
              <div className="invalid-feedback">
                Please select a valid state.
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Select Category</label>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="new-user-add-form-select"
              >
                <option value="">Choose...</option>
                {arraycategory.length > 0 ? (
                  arraycategory.map((category, index) => (
                    <option value={category} key={index}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option value="">No Category Available</option>
                )}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Search Serial No or MAC Address *
              </label>
              <input
                onChange={(e) => {
                  const devicemac = e.target.value;
                  const current_device = arraydevice.find(
                    (data) => data.macno === devicemac
                  );

                  if (current_device) {
                    setDeviceSerialNumber({
                      ...deviceSerialNumber,
                      mac: e.target.value,
                      serial: current_device.serialno,
                    });
                  }
                }}
                className="new-user-add-form-control"
                list="data"
                type="text"
              ></input>
              <datalist id="data">
                {filterDevice.map((data, index) => (
                  <option key={index} value={data.macno}>
                    {data.serialno + " : " + data.macno}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">
                Installation By *
              </label>
              <select
                onChange={(e) =>
                  setPlanData({
                    ...planData,
                    installby: e.target.value,
                  })
                }
                className="new-user-add-form-select"
              >
                <option value="">Choose...</option>
                {arrayuser.map((data, index) => (
                  <option key={index} value={data.mobile}>
                    {data.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Lead By *</label>
              <select
                onChange={(e) =>
                  setPlanData({
                    ...planData,
                    leadby: e.target.value,
                  })
                }
                className="new-user-add-form-select"
              >
                <option value="">Choose...</option>
                {arrayuser.map((data, index) => (
                  <option key={index} value={data.name}>
                    {data.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Documents Details Section */}

        <h3 className="new-user-add-section-title">
          Documents & Terms Conditions
        </h3>
        <div className="new-user-add-form-container">
          <form className="new-user-add-form" noValidate>
            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom04"
                className="new-user-add-form-label"
              >
                Identity Proof
              </label>
              <div className="input-group">
                <input
                  onChange={(e) => setIdentityProof(e.target.files[0])}
                  type="file"
                  className="new-user-add-form-control"
                  id="inputGroupFile04"
                  aria-describedby="inputGroupFileAddon04"
                  aria-label="Upload"
                ></input>
              </div>
              <div className="invalid-feedback">
                Please select a valid state.
              </div>
            </div>

            <div className="new-user-add-form-group">
              <label
                htmlFor="validationCustom01"
                className="new-user-add-form-label"
              >
                Address Proof
              </label>
              <div className="input-group">
                <input
                  onChange={(e) => setAddressProof(e.target.files[0])}
                  type="file"
                  className="new-user-add-form-control"
                  id="inputGroupFile04"
                  aria-describedby="inputGroupFileAddon04"
                  aria-label="Upload"
                ></input>
              </div>

              <div className="valid-feedback">Looks good!</div>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">CAF Documents</label>
              <input
                onChange={(e) => setCafDocuments(e.target.files[0])}
                type="file"
                className="new-user-add-form-control"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                aria-label="Upload"
              ></input>
            </div>

            <div className="new-user-add-form-group">
              <label className="new-user-add-form-label">Profile Photo</label>
              <input
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                type="file"
                className="new-user-add-form-control"
                id="inputGroupFile04"
                aria-describedby="inputGroupFileAddon04"
                aria-label="Upload"
              ></input>
            </div>
          </form>
        </div>
        <button
          onClick={handleSubmit}
          className="new-user-add-btn new-user-add-btn-success"
        >
          Upload Details
        </button>
        <ToastContainer />
      </div>
    </div>
  );
}
