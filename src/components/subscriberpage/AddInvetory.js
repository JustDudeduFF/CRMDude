import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../FirebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import { FaIndustry, FaLayerGroup, FaBarcode, FaRupeeSign, FaEdit, FaTruckLoading, FaRulerCombined } from 'react-icons/fa';

export default function AddInventory() {
  const partnerId = localStorage.getItem("partnerId");
  const subscriberId = localStorage.getItem("susbsUserid");
  const navigate = useNavigate();

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
    length: 0,
    startReading: 0,
    endReading: 0,
    status: "Active",
    model: "",
  });

  const isCableOrFiber = deviceInfo.category.toLowerCase() === "optical fiber" || deviceInfo.category.toLowerCase() === "cable";

  useEffect(() => {
    const fetchMakers = async () => {
      try {
        const res = await API.get(`/master/devicemaker?partnerId=${partnerId}`);
        setMakers(res.data || []);
      } catch (err) {
        toast.error("Failed to fetch makers");
      }
    };
    fetchMakers();
  }, [partnerId]);

  useEffect(() => {
    if (!deviceInfo.maker) return;
    const fetchData = async () => {
      try {
        const categoryRes = await API.get(`/subscriber/inventory/${deviceInfo.maker}?partnerId=${partnerId}`);
        const category = categoryRes.data.map((item) => ({ category: item.category }));
        setCategories(category || []);

        const allDevices = categoryRes.data.flatMap((item) =>
          item.devices.map((dev) => ({
            serialno: dev.serialNumber,
            macno: dev.macAddress,
            category: item.category,
            model: item.model,
            status: dev.status,
          }))
        );
        setDevices(allDevices);
        setFilteredDevices(allDevices);
      } catch (err) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [deviceInfo.maker, partnerId]);

  useEffect(() => {
    let array = devices;
    if (deviceInfo.category) {
      array = array.filter((d) => d.category === deviceInfo.category);
    }
    setFilteredDevices(array);
  }, [deviceInfo.category, devices]);

  const saveDevice = async () => {
    if (!deviceInfo.maker || !deviceInfo.category || !deviceInfo.serial) {
      toast.warn("Please fill all required fields");
      return;
    }

    try {
      const payload = {
        itemModel: deviceInfo.model || "",
        itemCategory: deviceInfo.category,
        itemMaker: deviceInfo.maker,
        serialNumber: deviceInfo.serial,
        macAddress: deviceInfo.mac,
        amount: parseFloat(deviceInfo.amount),
        remarks: deviceInfo.remarks,
        subscriber: subscriberId,
        assignedBy: localStorage.getItem("contact"),
        assignedAt: new Date().toISOString(),
        date: new Date().toISOString(),
        partnerId,
        status: deviceInfo.status || "Active",
        length: deviceInfo.length || 1,
        startReading: deviceInfo.startReading || 0,
        endReading: deviceInfo.endReading || 0,
      };

      const res = await API.post(`/subscriber/inventory`, payload);
      if (res.status === 201) {
        toast.success("Device assigned successfully");
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      toast.error("Error assigning device");
    }
  };

  return (
    <div className="add-inventory-container">
      <ToastContainer />
      
      <div className="inventory-card shadow-lg">
        <div className="card-header-amber p-3 text-white d-flex align-items-center">
          <FaTruckLoading className="me-2" />
          <h5 className="mb-0 fw-bold">Inventory Assignment Form</h5>
        </div>

        <div className="card-body p-4">
          <form className="row g-4">
            
            {/* CORE SELECTION */}
            <div className="col-md-4">
              <label className="modern-label"><FaIndustry className="me-1 text-warning"/> Product Maker *</label>
              <select
                className="modern-select"
                value={deviceInfo.maker}
                onChange={(e) => {
                  setDeviceInfo({ ...deviceInfo, maker: e.target.value, category: "" });
                  setCategories([]);
                }}
              >
                <option value="">Choose Maker...</option>
                {makers.map((maker, idx) => (
                  <option key={idx} value={maker.name}>{maker.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="modern-label"><FaLayerGroup className="me-1 text-warning"/> Product Category *</label>
              <select
                className="modern-select"
                value={deviceInfo.category}
                onChange={(e) => setDeviceInfo({ ...deviceInfo, category: e.target.value })}
              >
                <option value="">Choose Category...</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat.category}>{cat.category}</option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="modern-label"><FaRupeeSign className="me-1 text-warning"/> Amount</label>
              <input
                type="number"
                className="modern-input"
                placeholder="0.00"
                value={deviceInfo.amount}
                onChange={(e) => setDeviceInfo({ ...deviceInfo, amount: e.target.value })}
              />
            </div>

            <div className="col-12"><hr className="my-2 opacity-10" /></div>

            {/* DYNAMIC IDENTIFIER FIELD */}
            <div className="col-md-6">
              <label className="modern-label">
                <FaBarcode className="me-1 text-warning"/> 
                {isCableOrFiber ? "Drum Number / Batch ID *" : "Serial No or MAC Address *"}
              </label>
              <input
                list="deviceList"
                className="modern-input"
                placeholder={isCableOrFiber ? "Enter Drum ID" : "Enter Serial/MAC"}
                onChange={(e) => {
                  const selectedDevice = filteredDevices.find(d => d.serialno === e.target.value || d.macno === e.target.value);
                  setDeviceInfo({
                    ...deviceInfo,
                    serial: selectedDevice ? selectedDevice.serialno : e.target.value,
                    mac: selectedDevice ? selectedDevice.macno : "",
                    model: selectedDevice ? selectedDevice.model : "",
                  });
                }}
              />
              <datalist id="deviceList">
                {filteredDevices.map((d, idx) => (
                  <option key={idx} value={d.serialno}>{d.serialno} : {d.macno}</option>
                ))}
              </datalist>
            </div>

            {/* CONDITIONAL METER READINGS FOR FIBER */}
            {deviceInfo.category.toLowerCase() === "optical fiber" && (
              <div className="col-md-6">
                <div className="reading-box-grid">
                  <div>
                    <label className="field-label-sm">Total Length</label>
                    <input type="number" className="modern-input" value={deviceInfo.length} onChange={(e) => setDeviceInfo({ ...deviceInfo, length: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label-sm">Start (m)</label>
                    <input type="number" className="modern-input" value={deviceInfo.startReading} onChange={(e) => setDeviceInfo({ ...deviceInfo, startReading: e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label-sm">End (m)</label>
                    <input type="number" className="modern-input" value={deviceInfo.endReading} onChange={(e) => setDeviceInfo({ ...deviceInfo, endReading: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            <div className="col-md-12">
              <label className="modern-label"><FaEdit className="me-1 text-warning"/> Remarks</label>
              <textarea
                className="modern-input"
                rows="2"
                placeholder="Internal notes about this assignment..."
                value={deviceInfo.remarks}
                onChange={(e) => setDeviceInfo({ ...deviceInfo, remarks: e.target.value })}
              />
            </div>

            <div className="col-12 mt-4 d-flex justify-content-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn btn-light rounded-pill px-4 fw-bold">Cancel</button>
              <button
                type="button"
                onClick={saveDevice}
                className="btn-amber-gradient rounded-pill px-5 border-0 py-2 fw-bold text-white shadow-sm"
              >
                Assign Product
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .add-inventory-container { font-family: 'Inter', sans-serif; }
        .inventory-card { background: #fff; border-radius: 20px; border: none; overflow: hidden; }
        .card-header-amber { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        
        .modern-label { font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; display: block; }
        .field-label-sm { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; display: block; }
        
        .modern-input, .modern-select {
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 2px solid #f1f5f9;
          font-size: 0.95rem; font-weight: 500; outline: none; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background-color: #f8fafc;
        }
        .modern-input:focus, .modern-select:focus { 
          border-color: #f59e0b; background: #fff; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); 
        }

        .reading-box-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; background: #fff8eb; padding: 10px; border-radius: 14px; border: 1px dashed #f59e0b; }
        
        .btn-amber-gradient { 
          background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); 
          transition: all 0.3s;
        }
        .btn-amber-gradient:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(234, 88, 12, 0.3) !important; }
      `}</style>
    </div>
  );
}