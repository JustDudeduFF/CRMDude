import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { api2 } from "../../FirebaseConfig";

export default function AddInventory() {
  const partnerId = localStorage.getItem("partnerId");

  const [makers, setMakers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);

  const [deviceInfo, setDeviceInfo] = useState({
    serial: "",
    mac: "",
    category: "",
    maker: "",
    amount: 0,
    remarks: "",
    date: "",
  });

  // Fetch makers on mount
  useEffect(() => {
    const fetchMakers = async () => {
      try {
        const res = await axios.get(
          `${api2}/master/devicemaker?partnerId=${partnerId}`
        );
        setMakers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch makers:", err);
        toast.error("Failed to fetch makers", { autoClose: 3000 });
      }
    };
    fetchMakers();
  }, []);

  // Fetch categories and devices whenever maker changes
  useEffect(() => {
    if (!deviceInfo.maker) return;

    const fetchData = async () => {
      try {
        // Fetch categories for selected maker
        const categoryRes = await axios.get(
          `${api2}/subscriber/inventory/${deviceInfo.maker}?partnerId=${partnerId}`
        );
        const category = categoryRes.data.map((item) => ({
          category: item.category,
        }));
        setCategories(category || []);

        // Fetch inventory filtered by partnerId and maker
        const deviceRes = await axios.get(
          `${api2}/inventory?partnerId=${partnerId}&maker=${deviceInfo.maker}`
        );

        // Flatten devices array from inventory documents
        const allDevices = deviceRes.data.flatMap((item) =>
          item.devices.map((dev) => ({
            serialno: dev.serialNumber,
            macno: dev.macAddress,
            category: item.category,
            model: item.model,
            status: dev.status,
          }))
        );

        console.log("Fetched devices:", allDevices);

        setDevices(allDevices);
        setFilteredDevices(allDevices);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load data", { autoClose: 3000 });
      }
    };

    fetchData();
  }, [deviceInfo.maker]);

  // Filter devices by selected category
  useEffect(() => {
    let array = devices;
    if (deviceInfo.category) {
      array = array.filter((d) => d.category === deviceInfo.category);
    }
    setFilteredDevices(array);
  }, [deviceInfo.category, devices]);

  const saveDevice = async () => {
    if (
      !deviceInfo.maker ||
      !deviceInfo.category ||
      !deviceInfo.serial ||
      !deviceInfo.amount
    ) {
      toast.error("Please fill all required fields", { autoClose: 3000 });
      return;
    }
    try {
      const payload = {
        ...deviceInfo,
        date: new Date().toISOString(),
        partnerId,
      };
      const res = await axios.post(`${api2}/subscriber/inventory`, payload);
      if (res.status === 200) {
        toast.success("Device assigned successfully", { autoClose: 3000 });
        setDeviceInfo({
          serial: "",
          mac: "",
          category: "",
          maker: "",
          amount: 0,
          remarks: "",
          date: "",
        });
      } else {
        toast.error("Failed to assign device", { autoClose: 3000 });
      }
    } catch (err) {
      console.error("Error saving device:", err);
      toast.error("Error assigning device", { autoClose: 3000 });
    }
  };

  return (
      <div
        style={{
          margin: "20px",
          padding: "10px",
          border: "1px solid yellow",
          borderRadius: "5px",
          boxShadow: "0 0 10px yellow",
        }}
      >
        <ToastContainer />
        <form className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Product Maker</label>
            <select
              className="form-select"
              value={deviceInfo.maker}
              onChange={(e) => {
                setDeviceInfo({
                  ...deviceInfo,
                  maker: e.target.value,
                  category: "",
                });
                setCategories([]);
                setDevices([]);
                setFilteredDevices([]);
              }}
            >
              <option value="">Choose...</option>
              {makers.map((maker, idx) => (
                <option key={idx} value={maker.name}>
                  {maker.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Product Category</label>
            <select
              className="form-select"
              value={deviceInfo.category}
              onChange={(e) =>
                setDeviceInfo({ ...deviceInfo, category: e.target.value })
              }
            >
              <option value="">Choose...</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">
              Search Serial No or MAC Address
            </label>
            <input
              list="deviceList"
              className="form-control"
              placeholder="Enter Serial No or MAC"
              onChange={(e) => {
                const selectedDevice = filteredDevices.find(
                  (d) =>
                    d.serialno === e.target.value || d.macno === e.target.value
                );
                setDeviceInfo({
                  ...deviceInfo,
                  serial: selectedDevice
                    ? selectedDevice.serialno
                    : e.target.value,
                  mac: selectedDevice ? selectedDevice.macno : "",
                });
              }}
            />
            <datalist id="deviceList">
              {filteredDevices.map((d, idx) => (
                <option key={idx} value={d.serialno}>
                  {d.serialno} : {d.macno}
                </option>
              ))}
              {filteredDevices.map((d, idx) => (
                <option key={`mac-${idx}`} value={d.macno}>
                  {d.macno} : {d.serialno}
                </option>
              ))}
            </datalist>
          </div>

          <div className="col-md-2">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              value={deviceInfo.amount}
              onChange={(e) =>
                setDeviceInfo({ ...deviceInfo, amount: e.target.value })
              }
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Remarks</label>
            <input
              type="text"
              className="form-control"
              value={deviceInfo.remarks}
              onChange={(e) =>
                setDeviceInfo({ ...deviceInfo, remarks: e.target.value })
              }
            />
          </div>

          {/* Add Save button here */}
          <div className="col-md-12 mt-3">
            <button
              type="button"
              onClick={saveDevice}
              className="btn btn-success"
            >
              Assign Device
            </button>
          </div>
        </form>
      </div>
  );
}
