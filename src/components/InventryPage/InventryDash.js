import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { Pencil, Plus } from "lucide-react";
import ErrorBoundary from "../ErrorBoundary";
import { API } from "../../FirebaseConfig";

// Sample data for WiFi installation items
const initialProducts = [
  {
    id: 1,
    category: "ONU",
    maker: "Huawei",
    model: "EchoLife HG8145V5",
    quantity: 3,
    stockEnterDate: "2024-09-15",
    source: "Direct from Manufacturer",
    devices: [
      {
        serialNumber: "HW-ONU-001",
        macAddress: "00:1A:2B:3C:4D:5E",
        status: "Free",
        timestamp: Date.now(),
      },
      {
        serialNumber: "HW-ONU-002",
        macAddress: "00:1A:2B:3C:4D:5F",
        status: "Free",
        timestamp: Date.now(),
      },
      {
        serialNumber: "HW-ONU-003",
        macAddress: "00:1A:2B:3C:4D:60",
        status: "Free",
        timestamp: Date.now(),
      },
    ],
  },
  {
    id: 2,
    category: "ONT",
    maker: "ZTE",
    model: "ZXHN F670L",
    quantity: 2,
    stockEnterDate: "2024-09-10",
    source: "Local Distributor",
    devices: [
      {
        serialNumber: "ZTE-ONT-001",
        macAddress: "00:2B:3C:4D:5E:6F",
        status: "Free",
        timestamp: Date.now(),
      },
      {
        serialNumber: "ZTE-ONT-002",
        macAddress: "00:2B:3C:4D:5E:70",
        status: "Free",
        timestamp: Date.now(),
      },
    ],
  },
  {
    id: 3,
    category: "Router",
    maker: "Nokia",
    model: "7750 SR-12",
    quantity: 1,
    stockEnterDate: "2024-09-05",
    source: "Regional Office",
    devices: [
      {
        serialNumber: "NK-RTR-001",
        macAddress: "00:3C:4D:5E:6F:7A",
        status: "Free",
        timestamp: Date.now(),
      },
    ],
  },
  {
    id: 4,
    category: "Optical Fiber",
    maker: "Corning",
    model: "Single Mode Fiber",
    quantity: 1000,
    stockEnterDate: "2024-08-28",
    source: "Bulk Purchase",
    drumNumber: "COR-DRUM-001",
  },
  {
    id: 5,
    category: "Cable",
    maker: "Panduit",
    model: "Cat5e UTP",
    quantity: 500,
    stockEnterDate: "2024-09-12",
    source: "Online Supplier",
  },
  {
    id: 6,
    category: "Accessories",
    maker: "CommScope",
    model: "Junction Box JB-100",
    quantity: 75,
    stockEnterDate: "2024-09-08",
    source: "Local Vendor",
  },
];

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Bulk Upload Component for Excel
const BulkUploadDevices = ({ onDevicesUploaded, category }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and transform data
        const devices = [];
        const errors = [];
        const seenSerials = new Set();
        const seenMacs = new Set();

        jsonData.forEach((row, index) => {
          const serialNumber =
            row["Serial Number"] ||
            row["serial_number"] ||
            row["serialNumber"] ||
            "";
          const macAddress =
            row["MAC Address"] || row["mac_address"] || row["macAddress"] || "";

          if (!serialNumber.trim()) {
            errors.push(`Row ${index + 2}: Missing serial number`);
            return;
          }

          if (!macAddress.trim()) {
            errors.push(`Row ${index + 2}: Missing MAC address`);
            return;
          }

          if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress)) {
            errors.push(`Row ${index + 2}: Invalid MAC address format`);
            return;
          }

          if (seenSerials.has(serialNumber)) {
            errors.push(
              `Row ${index + 2}: Duplicate serial number ${serialNumber}`
            );
            return;
          }

          if (seenMacs.has(macAddress)) {
            errors.push(
              `Row ${index + 2}: Duplicate MAC address ${macAddress}`
            );
            return;
          }

          seenSerials.add(serialNumber);
          seenMacs.add(macAddress);

          devices.push({
            serialNumber: serialNumber.trim(),
            macAddress: macAddress.trim(),
            status: "Free",
            timestamp: Date.now(),
          });
        });

        if (errors.length > 0) {
          setError(errors.join("\n"));
          setUploading(false);
          return;
        }

        if (devices.length === 0) {
          setError(
            'No valid devices found in Excel file. Please ensure columns are named "Serial Number" and "MAC Address"'
          );
          setUploading(false);
          return;
        }

        onDevicesUploaded(devices);
        setUploading(false);
        e.target.value = ""; // Reset file input
      } catch (err) {
        setError("Error reading Excel file: " + err.message);
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setUploading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [
      { "Serial Number": "EXAMPLE-001", "MAC Address": "00:1A:2B:3C:4D:5E" },
      { "Serial Number": "EXAMPLE-002", "MAC Address": "00:1A:2B:3C:4D:5F" },
      { "Serial Number": "EXAMPLE-003", "MAC Address": "00:1A:2B:3C:4D:60" },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Devices");
    XLSX.writeFile(wb, `${category}_devices_template.xlsx`);
  };

  return (
    <div className="bulk-upload-container">
      <div className="bulk-upload-header">
        <h4>Bulk Upload via Excel</h4>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={downloadTemplate}
        >
          Download Template
        </button>
      </div>

      <div className="upload-area">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="file-input"
          id="excel-upload"
          disabled={uploading}
        />
        <label htmlFor="excel-upload" className="file-label">
          {uploading ? "Processing..." : "Choose Excel File or Drag Here"}
        </label>
      </div>

      {error && (
        <div className="upload-error">
          <pre>{error}</pre>
        </div>
      )}

      <div className="upload-instructions">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul>
          <li>Download the template and fill in your device data</li>
          <li>Columns must be named: "Serial Number" and "MAC Address"</li>
          <li>MAC format: 00:1A:2B:3C:4D:5E (with colons)</li>
          <li>Each serial and MAC must be unique</li>
        </ul>
      </div>
    </div>
  );
};

const DeviceList = ({
  devices,
  onDevicesChange,
  category,
  productId,
  isReadOnly = true,
  cables,
  onCabelesChange,
}) => {
  const performedBy = localStorage.getItem("contact");
  const [readOnly, setReadOnly] = useState(isReadOnly);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [tempDevice, setTempDevice] = useState({
    serialNumber: "",
    macAddress: "",
    status: "",
  });
  const [tempCabel, setTempCable] = useState({
    drumNumber: "",
    totalLength: 0,
    availableLength: 0,
    _id: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Safely count devices by their status
  const statusCounts = Array.isArray(devices)
    ? devices.reduce((acc, device) => {
        const status = device?.status?.trim() || "Free"; // handle missing or empty status
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    : {}; // default to empty object if devices is not an array

  const getUnusedBundles = () => {
    let unusedCount = 0;
    cables.forEach((cable) => {
      if (cable.totalLength === cable.availableLength) {
        unusedCount++;
      }
    });
    return unusedCount;
  };

  const getInuseBundles = () => {
    let inuseCount = 0;
    cables.forEach((cable) => {
      if (
        cable.totalLength !== cable.availableLength &&
        cable.availableLength > 15
      ) {
        inuseCount++;
      }
    });
    return inuseCount;
  };

  const getEMptyBundles = () => {
    let emptyCount = 0;
    cables.forEach((cable) => {
      if (cable.availableLength < 15) {
        emptyCount++;
      }
    });
    return emptyCount;
  };

  const getAvailabelBundles = () => {
    let availabelCount = 0;
    cables.forEach((cable) => {
      if (cable.availableLength >= 15) {
        availabelCount++;
      }
    });
    return availabelCount;
  };

  const handleSaveDevice = async () => {
    if (category === "Cables" || category === "Optical Fiber") {
      if (tempCabel.drumNumber.trim() && tempCabel.totalLength > 0) {
        const newCables = [...cables];
        let actionType = "";
        if (editingIndex === cables.length) {
          newCables.push({ ...tempCabel });
          actionType = "Added";
        } else {
          newCables[editingIndex] = { ...tempCabel };
          actionType = "Updated";
        }
        try {
          await API.put(
            `/inventory/${productId}/cable/${editingIndex}`,
            {
              ...tempCabel,
              performedBy,
              location: "Main Stock",
            }
          );
          onCabelesChange(newCables);
          setEditingIndex(-1);
          setTempCable({
            drumNumber: "",
            totalLength: 0,
            availableLength: 0,
            _id: "",
          });
        } catch (err) {
          console.error("❌ Error saving cable to DB:", err);
        }
      } else {
        console.warn(
          "❌ Validation Failed: Missing drum number or total length"
        );
      }
    } else {
      if (tempDevice.serialNumber.trim() && tempDevice.macAddress.trim()) {
        const newDevices = [...devices];
        let actionType = "";

        if (editingIndex === devices.length) {
          newDevices.push({ ...tempDevice });
          actionType = "Added";
        } else {
          newDevices[editingIndex] = {
            ...newDevices[editingIndex],
            ...tempDevice,
          };
          actionType = "Updated";
        }

        try {
          await API.put(
            `/inventory/${productId}/device/${editingIndex}`,
            {
              ...tempDevice,
              performedBy,
              location: "Main Stock",
            }
          );

          onDevicesChange(newDevices);

          setEditingIndex(-1);
          setTempDevice({ serialNumber: "", macAddress: "", status: "" });
        } catch (err) {
          console.error("❌ Error saving device to DB:", err);
        }
      } else {
        console.warn("❌ Validation Failed: Missing serial or MAC address");
      }
    }
  };

  const handleDeleteDevice = (index) => {
    const newDevices = devices.filter((_, i) => i !== index);
    onDevicesChange(newDevices);
  };

  const handleEditDevice = (index) => {
    if (category === "Cables" || category === "Optical Fiber") {
      const cableToEdit = cables[index];
      setTempCable({
        drumNumber: cableToEdit.drumNumber,
        totalLength: cableToEdit.totalLength,
        availableLength: cableToEdit.availableLength,
        _id: cableToEdit._id,
      });
      setEditingIndex(index);
    } else {
      const deviceToEdit = devices[index];
      setTempDevice({
        serialNumber: deviceToEdit.serialNumber,
        macAddress: deviceToEdit.macAddress,
        status: deviceToEdit.status || "Free",
      });
      setEditingIndex(index);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setTempDevice({ serialNumber: "", macAddress: "", status: "" });
  };

  const validateMacAddress = (mac) => {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
  };

  const isValidDevice =
    tempDevice.serialNumber.trim() &&
    tempDevice.macAddress.trim() &&
    validateMacAddress(tempDevice.macAddress);

  const isValidCable = tempCabel.drumNumber.trim() && tempCabel.totalLength > 0;

  const filteredDevices = Array.isArray(devices)
    ? devices?.filter(
        (device) =>
          device.serialNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          device.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (device.status &&
            device.status.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  const filteredCables = cables?.filter(
    (cable) =>
      cable.drumNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cable.totalLength
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="device-list">
      <div className="device-list-header">
        <h4>
          Individual {category}{" "}
          {category === "ONT"
            ? "Devices"
            : category === "ONU"
            ? "Devices"
            : "Bundles"}{" "}
          (
          {category === "Optical Fiber" || category === "Cables"
            ? getAvailabelBundles()
            : devices.length}{" "}
          {category === "ONT"
            ? "Devices"
            : category === "ONU"
            ? "Devices"
            : "Bundles"}
          )
        </h4>

        <div className="device-header-actions">
          {/* 🔍 Search Bar */}
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="device-search"
          />

          {readOnly ? (
            <button
              onClick={() => setReadOnly(false)}
              className="btn btn-edit btn-small"
            >
              <Pencil size={18} className="text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => setReadOnly(true)}
              className="btn btn-cancel btn-small"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* 🔹 Status Summary */}

      {category === "Optical Fiber" || category === "Cables" ? (
        <div className="ms-2 mb-2">
          <span>Unused Bundles: {getUnusedBundles()}</span>
          <span> | </span>
          <span>Inuse Bundles: {getInuseBundles()}</span>
          <span> | </span>
          <span>Empty Bundles: {getEMptyBundles()}</span>
          <span> | </span>
        </div>
      ) : (
        <div className="ms-2 mb-2">
          <span>Free: {statusCounts?.Free || 0}</span> |{" "}
          <span>Installed: {statusCounts?.Installed || 0}</span> |{" "}
          <span>Returned: {statusCounts?.Returned || 0}</span> |{" "}
          <span>On Repair: {statusCounts?.["On Repair"] || 0}</span> |{" "}
          <span>Non Repairable: {statusCounts?.["Non Repairable"] || 0}</span>
        </div>
      )}

      {category === "Optical Fiber" || category === "Cables" ? (
        <div className="devices-container">
          {filteredCables.map((cable, index) => (
            <div key={index} className="device-item">
              {editingIndex === index ? (
                <div className="device-edit">
                  <input
                    type="text"
                    value={tempCabel.drumNumber}
                    onChange={(e) =>
                      setTempCable((prev) => ({
                        ...prev,
                        drumNumber: e.target.value,
                      }))
                    }
                    placeholder="Drum Number"
                    className="device-input"
                  />

                  <div className="flex flex-row">
                    <label className="me-2 device-mac">Total Length:</label>
                    <input
                      type="text"
                      value={tempCabel.totalLength}
                      onChange={(e) =>
                        setTempCable((prev) => ({
                          ...prev,
                          totalLength: e.target.value,
                        }))
                      }
                      placeholder="Total Length"
                      className="device-input"
                    />
                  </div>

                  <div className="flex flex-row">
                    <label className="me-2 device-mac">Available Length:</label>
                    <input
                      type="text"
                      value={tempCabel.availableLength}
                      onChange={(e) =>
                        setTempCable((prev) => ({
                          ...prev,
                          availableLength: e.target.value,
                        }))
                      }
                      className="device-input"
                      placeholder="Available Length"
                    ></input>
                  </div>

                  <div className="device-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      onClick={handleSaveDevice}
                      disabled={!isValidCable}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel btn-small"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="device-view">
                  <div className="device-info">
                    <span className="device-serial">
                      Drum Number: {cable.drumNumber}
                    </span>
                    <span className="device-mac">
                      Total Length: {cable.totalLength}
                    </span>
                    <span className="device-status">
                      Available length: {cable.availableLength || "N/A"}
                    </span>
                  </div>
                  {!readOnly ? (
                    <div className="device-actions">
                      <button
                        type="button"
                        className="btn btn-edit btn-small"
                        onClick={() => handleEditDevice(index)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-delete btn-small"
                        onClick={() => handleDeleteDevice(index)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="device-actions">
                      <button type="button" className="btn btn-track btn-small">
                        Info
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="devices-container">
          {filteredDevices.map((device, index) => (
            <div key={index} className="device-item">
              {editingIndex === index ? (
                <div className="device-edit">
                  <input
                    type="text"
                    value={tempDevice.serialNumber}
                    onChange={(e) =>
                      setTempDevice((prev) => ({
                        ...prev,
                        serialNumber: e.target.value,
                      }))
                    }
                    placeholder="Serial Number"
                    className="device-input"
                  />
                  <input
                    type="text"
                    value={tempDevice.macAddress}
                    onChange={(e) =>
                      setTempDevice((prev) => ({
                        ...prev,
                        macAddress: e.target.value,
                      }))
                    }
                    placeholder="MAC Address (00:1A:2B:3C:4D:5E)"
                    className="device-input"
                  />

                  {/* 🔽 Status dropdown */}
                  <select
                    value={tempDevice.status || "Free"}
                    onChange={(e) =>
                      setTempDevice((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="device-input"
                  >
                    <option value="Free">Free</option>
                    <option value="Installed">Installed</option>
                    <option value="Returned">Returned</option>
                    <option value="On Repair">On Repair</option>
                    <option value="Non Repairable">Non Repairable</option>
                  </select>

                  <div className="device-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      onClick={handleSaveDevice}
                      disabled={!isValidDevice}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel btn-small"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="device-view">
                  <div className="device-info">
                    <span className="device-serial">
                      Serial: {device.serialNumber}
                    </span>
                    <span className="device-mac">MAC: {device.macAddress}</span>
                    <span className="device-status">
                      Status: {device.status || "N/A"}
                    </span>
                  </div>
                  {!readOnly && (
                    <div className="device-actions">
                      <button
                        type="button"
                        className="btn btn-edit btn-small"
                        onClick={() => handleEditDevice(index)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-delete btn-small"
                        onClick={() => handleDeleteDevice(index)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {devices.length === 0 && !readOnly && (
        <div className="no-devices">
          No devices added yet. Click "Add Device" to start adding individual{" "}
          {category.toLowerCase()} devices.
        </div>
      )}
    </div>
  );
};

// Product Form Component
const ProductForm = ({
  onSubmit,
  onCancel,
  editProduct = null,
  makerArray,
}) => {
  const [formData, setFormData] = useState({
    category: editProduct?.category || "",
    maker: editProduct?.maker || "",
    model: editProduct?.model || "",
    quantity: editProduct?.quantity || "",
    stockEnterDate: editProduct?.stockEnterDate || "",
    source: editProduct?.source || "",
    drumNumber: editProduct?.drumNumber || "",
    devices: editProduct?.devices || [],
  });

  const [errors, setErrors] = useState({});
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const categories = [
    "ONU",
    "ONT",
    "Router",
    "Optical Fiber",
    "Cable",
    "Accessories",
  ];
  const deviceCategories = ["ONU", "ONT", "Router"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantity" && deviceCategories.includes(formData.category)) {
      const qty = parseInt(value) || 0;
      const currentDevices = formData.devices || [];

      // Adjust devices array based on quantity
      let newDevices = [...currentDevices];

      if (qty > currentDevices.length) {
        // Add empty devices
        for (let i = currentDevices.length; i < qty; i++) {
          newDevices.push({ serialNumber: "", macAddress: "" });
        }
      } else if (qty < currentDevices.length) {
        // Remove excess devices
        newDevices = newDevices.slice(0, qty);
      }

      setFormData((prev) => ({
        ...prev,
        quantity: value,
        devices: newDevices,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear category-specific fields when category changes
    if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        quantity: "",
        drumNumber: "",
        devices: [],
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDeviceChange = (index, field, value) => {
    const newDevices = [...formData.devices];
    newDevices[index] = {
      ...newDevices[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      devices: newDevices,
    }));
  };

  const handleBulkUpload = (uploadedDevices) => {
    setFormData((prev) => ({
      ...prev,
      devices: uploadedDevices,
      quantity: uploadedDevices.length.toString(),
    }));
    setShowBulkUpload(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.maker.trim()) newErrors.maker = "Maker is required";
    if (!formData.model.trim()) newErrors.model = "Model is required";
    if (!formData.stockEnterDate)
      newErrors.stockEnterDate = "Stock enter date is required";
    if (!formData.source.trim()) newErrors.source = "Source is required";

    // Category-specific validation
    if (deviceCategories.includes(formData.category)) {
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        newErrors.quantity = "Valid quantity is required";
      } else {
        // Validate each device
        const serialNumbers = new Set();
        const macAddresses = new Set();

        for (let i = 0; i < formData.devices.length; i++) {
          const device = formData.devices[i];

          if (!device.serialNumber.trim()) {
            newErrors[`device_${i}_serial`] = "Serial number is required";
          } else if (serialNumbers.has(device.serialNumber)) {
            newErrors[`device_${i}_serial`] = "Duplicate serial number";
          } else {
            serialNumbers.add(device.serialNumber);
          }

          if (!device.macAddress.trim()) {
            newErrors[`device_${i}_mac`] = "MAC address is required";
          } else if (
            !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(device.macAddress)
          ) {
            newErrors[`device_${i}_mac`] = "Invalid MAC format";
          } else if (macAddresses.has(device.macAddress)) {
            newErrors[`device_${i}_mac`] = "Duplicate MAC address";
          } else {
            macAddresses.add(device.macAddress);
          }
        }
      }
    } else {
      // For non-device categories, validate quantity
      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = "Valid quantity is required";
      }
    }

    if (formData.category === "Optical Fiber") {
      if (!formData.drumNumber.trim())
        newErrors.drumNumber = "Drum number is required for optical fiber";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const productData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        _id: editProduct?._id || Date.now(),
      };

      console.log("Form submitted with data:", formData);

      // Remove unused fields based on category
      if (!deviceCategories.includes(formData.category)) {
        delete productData.devices;
      }
      if (formData.category !== "Optical Fiber") {
        delete productData.drumNumber;
      }

      onSubmit(productData);
    }
  };

  const showDeviceFields = deviceCategories.includes(formData.category);
  const showFiberFields =
    formData.category === "Optical Fiber" || formData.category === "Cable";
  const showDeviceInputs =
    showDeviceFields && parseInt(formData.quantity) > 0 && !editProduct;

  return (
    <div className="product-form-container">
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? "error" : ""}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="error-message">{errors.category}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="maker">Maker *</label>
          <select
            type="text"
            id="maker"
            name="maker"
            value={formData.maker}
            onChange={handleChange}
            className={errors.maker ? "error" : ""}
            placeholder="e.g., Huawei, ZTE, Nokia, Corning"
          >
            <option value="">Select maker...</option>
            {makerArray.length > 0 ? (
              makerArray.map((maker, index) => (
                <option key={index} value={maker.name}>
                  {maker.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No makers available
              </option>
            )}
          </select>
          {errors.maker && (
            <span className="error-message">{errors.maker}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="model">Model *</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className={errors.model ? "error" : ""}
            placeholder="e.g., EchoLife HG8145V5"
          />
          {errors.model && (
            <span className="error-message">{errors.model}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="quantity">Quantity *</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={errors.quantity ? "error" : ""}
            placeholder="Enter quantity"
            min="1"
            readOnly={!!editProduct} // <-- make readonly in edit mode
          />
          {errors.quantity && (
            <span className="error-message">{errors.quantity}</span>
          )}
          {showDeviceFields && formData.quantity && (
            <span className="helper-text">
              {formData.quantity} individual device(s) will be added
            </span>
          )}
        </div>

        {showDeviceInputs && (
          <div className="form-group">
            <div className="device-section-header">
              <label>Device Details (Serial Number & MAC Address) *</label>
              {!editProduct && ( // hide bulk upload toggle in edit mode
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                >
                  {showBulkUpload ? "Manual Entry" : "Bulk Upload Excel"}
                </button>
              )}
            </div>

            {showBulkUpload ? (
              <BulkUploadDevices
                onDevicesUploaded={handleBulkUpload}
                category={formData.category}
              />
            ) : (
              <div className="devices-input-container">
                {formData.devices.map((device, index) => (
                  <div key={index} className="device-input-group">
                    <div className="device-number">Device #{index + 1}</div>
                    <div className="device-inputs">
                      {/* Serial */}
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={device.serialNumber}
                          onChange={(e) =>
                            handleDeviceChange(
                              index,
                              "serialNumber",
                              e.target.value
                            )
                          }
                          placeholder="Serial Number"
                          className={
                            errors[`device_${index}_serial`]
                              ? "error device-input-field"
                              : "device-input-field"
                          }
                          readOnly={!!editProduct} // readonly in edit mode
                        />
                      </div>

                      {/* MAC */}
                      <div className="input-wrapper">
                        <input
                          type="text"
                          value={device.macAddress}
                          onChange={(e) =>
                            handleDeviceChange(
                              index,
                              "macAddress",
                              e.target.value
                            )
                          }
                          placeholder="MAC Address"
                          className={
                            errors[`device_${index}_mac`]
                              ? "error device-input-field"
                              : "device-input-field"
                          }
                          readOnly={!!editProduct} // readonly in edit mode
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(showFiberFields && !editProduct) && (
          <div className="form-group">
            <label htmlFor="drumNumber">Drum Number *</label>
            <input
              type="text"
              id="drumNumber"
              name="drumNumber"
              value={formData.drumNumber}
              onChange={handleChange}
              className={errors.drumNumber ? "error" : ""}
              placeholder="e.g., COR-DRUM-001"
            />
            {errors.drumNumber && (
              <span className="error-message">{errors.drumNumber}</span>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="stockEnterDate">Stock Enter Date *</label>
          <input
            type="date"
            id="stockEnterDate"
            name="stockEnterDate"
            value={formData.stockEnterDate}
            onChange={handleChange}
            className={errors.stockEnterDate ? "error" : ""}
          />
          {errors.stockEnterDate && (
            <span className="error-message">{errors.stockEnterDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="source">Source *</label>
          <input
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="e.g., Direct from Manufacturer"
            className={errors.source ? "error" : ""}
          ></input>
          {errors.source && (
            <span className="error-message">{errors.source}</span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editProduct ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Inventory Table Component
const InventoryTable = ({
  products,
  onEdit,
  onDelete,
  onViewDevices,
  searchTerm,
  sortConfig,
  onSort,
  onAddStock,
  onShowHistory,
}) => {
  const getSortIcon = (column) => {
    if (sortConfig.key === column) {
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    return "↕";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      ONU: "#3498db",
      ONT: "#2ecc71",
      Router: "#9b59b6",
      "Optical Fiber": "#f39c12",
      Cable: "#34495e",
      Accessories: "#95a5a6",
    };
    return colors[category] || "#95a5a6";
  };

  if (products.length === 0) {
    return (
      <div className="no-products">
        {searchTerm
          ? `No products found matching "${searchTerm}"`
          : "No products in inventory"}
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="inventory-table">
        <thead>
          <tr>
            <th onClick={() => onSort("category")}>
              Category {getSortIcon("category")}
            </th>
            <th onClick={() => onSort("maker")}>
              Maker {getSortIcon("maker")}
            </th>
            <th onClick={() => onSort("model")}>
              Model {getSortIcon("model")}
            </th>
            <th onClick={() => onSort("quantity")}>
              Quantity {getSortIcon("quantity")}
            </th>
            <th onClick={() => onSort("stockEnterDate")}>
              Stock Date {getSortIcon("stockEnterDate")}
            </th>
            <th onClick={() => onSort("source")}>
              Source {getSortIcon("source")}
            </th>
            <th>Device Info</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td data-label="Category">
                <span
                  className="category-badge"
                  style={{
                    backgroundColor: getCategoryBadgeColor(product.category),
                  }}
                >
                  {product.category}
                </span>
              </td>
              <td data-label="Maker">{product.maker}</td>
              <td data-label="Model">{product.model}</td>
              <td data-label="Quantity">{product.quantity}</td>
              <td data-label="Stock Date">
                {formatDate(product.stockEnterDate)}
              </td>
              <td data-label="Source">{product.source}</td>
              <td data-label="Device Info">
                <div className="device-info">
                  {product.devices && product.devices.length > 0 ? (
                    <div className="devices-summary">
                      <span className="devices-count">
                        {
                          product.devices.filter((d) => d.status === "Free")
                            .length
                        }{" "}
                        free devices
                      </span>
                      <button
                        className="btn btn-view-devices"
                        onClick={() => onViewDevices(product)}
                        title="View all devices"
                      >
                        View Details
                      </button>
                    </div>
                  ) : product.drumNumber ? (
                    <div className="info-row">
                      <span className="info-label">Drum:</span>
                      <span className="info-value">{product.drumNumber}</span>
                    </div>
                  ) : product.cables && product.cables.length > 0 ? (
                    <div className="device-summary">
                      <span className="device-count">
                        {product.cables.length} bundles
                      </span>
                      <br></br>
                      <button
                        className="btn btn-view-devices"
                        onClick={() => onViewDevices(product)}
                        title="View all cable bundles"
                      >
                        View Details
                      </button>
                    </div>
                  ) : (
                    <span className="no-info">—</span>
                  )}
                </div>
              </td>
              <td data-label="Actions">
                <div className="action-buttons">
                  <button
                    className="btn btn-edit"
                    onClick={() => onEdit(product)}
                    title="Edit Product"
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => onDelete(product._id)}
                    title="Delete Product"
                  >
                    Delete
                  </button>
                  <button
                    className="btn btn-track"
                    onClick={() => onShowHistory(product)}
                    title="Track Info"
                  >
                    Track Info
                  </button>
                  <button
                    className="btn btn-add-stock"
                    onClick={() => onAddStock(product)}
                    title="Add Stock"
                  >
                    Add Stock
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      {getVisiblePages().map((page) => (
        <button
          key={page}
          className={`pagination-btn ${page === currentPage ? "active" : ""}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

// Main Inventory Management Component
const InventryDash = () => {
  const partnerId = localStorage.getItem("partnerId");
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "stockEnterDate",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [addingStockProductId, setAddingStockProductId] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [stockInputs, setStockInputs] = useState([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [makers, setMakers] = useState([]);
  const [drumNumber, setDrumNumber] = useState("");
  const [stockEnterDate, setStockEnterDate] = useState("");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [deviceSearch, setDeviceSearch] = useState("");

  const itemsPerPage = 10;

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.maker.toLowerCase().includes(searchLower) ||
        product.model.toLowerCase().includes(searchLower) ||
        product.source.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        (product.cables &&
          product.cables.some((cable) =>
            cable.drumNumber.toLowerCase().includes(searchLower)
          )) ||
        (product.devices &&
          product.devices.some(
            (device) =>
              device.serialNumber.toLowerCase().includes(searchLower) ||
              device.macAddress.toLowerCase().includes(searchLower)
          ))
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "stockEnterDate") {
          return sortConfig.direction === "asc"
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }

        if (typeof aValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        const comparison = aValue.toString().localeCompare(bValue.toString());
        return sortConfig.direction === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [products, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(1);
  };

  const handleAddProduct = async (productData) => {
    try {
      // Get partnerId from localStorage
      const partnerId = localStorage.getItem("partnerId");

      // Include partnerId in the request body
      const requestData = {
        ...productData,
        partnerId,
        cables: [
          {
            drumNumber: productData.drumNumber || "",
            totalLength: productData.quantity || 0,
            availableLength: productData.quantity || 0,
          },
        ],
        performedBy: localStorage.getItem("contact"),
      };

      console.log("Adding product with data:", requestData);

      // Make POST request to API
      const response = await API.post(`/inventory/add`, requestData);

      // Update local state with the saved product
      setProducts((prev) => [...prev, response.data]);

      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  // const handleEditProduct = (productData) => {
  //   setProducts((prev) =>
  //     prev.map((product) =>
  //       product._id === productData._id ? productData : product
  //     )
  //   );
  //   setShowEditModal(false);
  //   setEditingProduct(null);
  // };

  const handleEditProduct = async (productData) => {
    try {
      // Send updated data to backend
      const res = await API.put(
        `/inventory/update/${productData._id}`, // ✅ use _id (MongoDB)
        productData
      );

      if (res.status === 200) {
        const updated = res.data;
        // Update state with updated product
        setProducts((prev) =>
          prev.map((product) =>
            product._id === updated._id ? updated : product
          )
        );
        alert("Product updated successfully!");
      }
    } catch (err) {
      console.error("Error updating product:", err);
      alert(err.response?.data?.error || "Server error while updating.");
    } finally {
      setShowEditModal(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (id) => {
    setDeleteProductId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (!deleteProductId) return;

      const res = await API.delete(
        `/inventory/delete/${deleteProductId}`
      );

      if (res.status === 200) {
        // ✅ Update state after delete
        setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));
        alert("Product deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.error || "Server error, please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteProductId(null);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleViewDevices = (product) => {
    setViewingProduct(product);
    setShowDevicesModal(true);
  };

  const handleAddStock = (productId) => {
    setAddingStockProductId(productId);
    setShowAddStockModal(true);
  };

  const handleShowHistory = (product) => {
    setHistoryProduct(product);
    setShowHistoryModal(true);
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      ONU: "#3498db",
      ONT: "#2ecc71",
      Router: "#9b59b6",
      "Optical Fiber": "#f39c12",
      Cable: "#34495e",
      Accessories: "#95a5a6",
    };
    return colors[category] || "#95a5a6";
  };

  const fetchMakers = async () => {
    try {
      const response = await API.get(
        `/master/devicemaker?partnerId=${partnerId}`
      );
      setMakers(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await API.get(
        `/inventory/?partnerId=${partnerId}`
      );
      setProducts(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMakers();
  }, []);

  return (
    <div className="inventory-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
        }

        .inventory-container {
          max-width: auto;
          padding: 20px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .header {
          background: white;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .header h1 {
          color: #2c3e50;
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .header p {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .controls {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .btn-edit {
          background-color: #f39c12;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-edit:hover {
          background-color: #e67e22;
          transform: translateY(-1px);
        }

        .btn-delete {
          background-color: #e74c3c;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-delete:hover {
          background-color: #c0392b;
          transform: translateY(-1px);
        }

        .btn-track {
          background-color: #4c8bffff;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-track:hover {
          background-color: rgba(3, 127, 252, 1);
          transform: translateY(-1px);
        }

                .btn-add-stock {
          background-color: #00c521ff;
          color: white;
          padding: 8px 16px;
          font-size: 12px;
        }

        .btn-add-stock:hover {
          background-color: #4bff69ff;
          transform: translateY(-1px);
        }

        .btn-cancel {
          background-color: #95a5a6;
          color: white;
        }

        .btn-cancel:hover {
          background-color: #7f8c8d;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #5a6268;
          transform: translateY(-2px);
        }

        .btn-small {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-view-devices {
          background-color: #17a2b8;
          color: white;
          padding: 4px 8px;
          font-size: 11px;
        }

        .btn-view-devices:hover {
          background-color: #138496;
          transform: translateY(-1px);
        }

        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 30px;
           overflow-y: auto;
           overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inventory-table th {
          background-color: #34495e;
          color: white;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
        }

        .inventory-table th:hover {
          background-color: #2c3e50;
        }

        .inventory-table td {
          padding: 16px;
          border-bottom: 1px solid #ecf0f1;
          vertical-align: middle;
        }

        .inventory-table tbody tr {
          transition: background-color 0.3s ease;
        }

        .inventory-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .modal-overlay {
          position: fixed;
          top: 50px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #ecf0f1;
        }

        .modal-header h2 {
          color: #2c3e50;
          font-size: 1.5rem;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: #2c3e50;
        }

        .product-form {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #e74c3c;
        }

        .error-message {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
        }

        .pagination-btn {
          padding: 10px 16px;
          border: 2px solid #e9ecef;
          background: white;
          color: #2c3e50;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #3498db;
          background-color: #3498db;
          color: white;
        }

        .pagination-btn.active {
          background-color: #3498db;
          border-color: #3498db;
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .no-products {
          text-align: center;
          padding: 60px 20px;
          color: #7f8c8d;
          font-size: 1.2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .category-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          min-width: 60px;
        }

        .device-info {
          font-size: 12px;
        }

        .info-row {
          margin-bottom: 2px;
        }

        .info-label {
          font-weight: 500;
          color: #7f8c8d;
          margin-right: 4px;
        }

        .info-value {
          color: #2c3e50;
        }

        .no-info {
          color: #bdc3c7;
          font-style: italic;
        }

        .devices-summary {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
        }

        .devices-count {
          font-size: 12px;
          color: #2c3e50;
          font-weight: 500;
        }

        .mobile-device-info {
          background-color: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin: 8px 0;
        }

        .device-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;  
}

.device-search {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
}

.device-search:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.4);
}


        .device-list {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          background-color: #f8f9fa;
        }

        .device-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #dee2e6;
        }

        .device-list-header h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .devices-container {
          max-height: 800px;
          overflow-y: auto;
          margin-bottom: 8px;
        }

        .device-item {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 8px;
        }

        .device-view {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .device-serial, .device-mac,device-status {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .device-serial {
          font-weight: 500;
          color: #2c3e50;
        }

        .device-mac {
          color: #7f8c8d;
          font-family: monospace;
        }

        .device-status {
          font-weight: 600;
          text-transform: capitalize;
        }

        .device-edit {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .device-input {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-size: 14px;
        }

        .device-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .device-actions {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .no-devices {
          text-align: center;
          padding: 24px;
          color: #7f8c8d;
          font-style: italic;
          background: white;
          border: 2px dashed #dee2e6;
          border-radius: 6px;
        }

        .product-form-container {
          max-height: 80vh;
          overflow-y: auto;
        }

        .device-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .device-section-header label {
          margin-bottom: 0;
        }

        .devices-input-container {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          background-color: #f8f9fa;
        }

        .device-input-group {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 12px;
        }

        .device-number {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .device-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .input-wrapper {
          display: flex;
          flex-direction: column;
        }

        .device-input-field {
          padding: 8px 12px;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s ease;
        }

        .device-input-field:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .device-input-field.error {
          border-color: #e74c3c;
        }

        .helper-text {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #7f8c8d;
          font-style: italic;
        }

        .bulk-upload-container {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 20px;
          background-color: white;
          margin-top: 12px;
        }

        .bulk-upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .bulk-upload-header h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .upload-area {
          margin-bottom: 16px;
        }

        .file-input {
          display: none;
        }

        .file-label {
          display: block;
          padding: 40px 20px;
          border: 2px dashed #3498db;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          background-color: #f8f9fa;
          color: #3498db;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .file-label:hover {
          background-color: #e3f2fd;
          border-color: #2980b9;
        }

        .upload-error {
          background-color: #fee;
          border: 1px solid #e74c3c;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .upload-error pre {
          margin: 0;
          color: #c0392b;
          font-size: 12px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .upload-instructions {
          background-color: #e3f2fd;
          border-left: 4px solid #3498db;
          padding: 12px;
          border-radius: 4px;
        }

        .upload-instructions p {
          margin: 0 0 8px 0;
          font-weight: 600;
          color: #2c3e50;
        }

        .upload-instructions ul {
          margin: 0;
          padding-left: 20px;
        }

        .upload-instructions li {
          margin-bottom: 4px;
          color: #34495e;
          font-size: 13px;
        }

        .stats {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          text-align: center;
        }

        .stats-number {
          font-size: 2rem;
          font-weight: bold;
          color: #3498db;
          margin-bottom: 5px;
        }

        .stats-label {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .inventory-container {
            padding: 10px;
          }

          .header {
            padding: 20px;
          }

          .header h1 {
            font-size: 2rem;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: auto;
          }

          .inventory-table {
            display: none;
          }

          .table-container {
            display: block;
          }

          .mobile-cards {
            display: block;
          }

          .mobile-card {
            background: white;
            border: 1px solid #ecf0f1;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .mobile-card-header {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 12px;
            font-size: 1.1rem;
          }

          .mobile-card-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #f8f9fa;
          }

          .mobile-card-row:last-child {
            border-bottom: none;
            margin-bottom: 12px;
          }

          .mobile-card-label {
            font-weight: 500;
            color: #7f8c8d;
          }

          .mobile-card-value {
            color: #2c3e50;
          }

          .action-buttons {
            justify-content: center;
          }

          .pagination {
            flex-wrap: wrap;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .device-view {
            flex-direction: column;
            align-items: stretch;
          }

          .device-actions {
            justify-content: center;
            margin-top: 8px;
          }

          .devices-container {
            max-height: 250px;
          }

          .device-edit {
            gap: 12px;
          }

          .device-inputs {
            grid-template-columns: 1fr;
          }

          .devices-input-container {
            max-height: 300px;
          }

          .device-section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .bulk-upload-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
        }

        /* Mobile table alternative */
        @media (max-width: 768px) {
          .table-container .inventory-table {
            display: none;
          }
        }
      `}</style>
      {/* <div className="header">
        <h1>WiFi Equipment Inventory</h1>
        <p>Manage your network installation equipment and components</p>
      </div> */}

      {/* <div className="stats">
        <div className="stats-number">{products.length}</div>
        <div className="stats-label">Total Products in Inventory</div>
      </div> */}

      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by category, maker, model, source, serial, MAC, or drum number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Product
        </button>
      </div>

      {/* Desktop Table */}
      <div className="desktop-table">
        <InventoryTable
          products={paginatedProducts}
          onEdit={openEditModal}
          onDelete={handleDeleteProduct}
          onViewDevices={handleViewDevices}
          searchTerm={searchTerm}
          sortConfig={sortConfig}
          onSort={handleSort}
          onAddStock={handleAddStock}
          onShowHistory={handleShowHistory}
        />
      </div>

      {/* Mobile Cards */}
      <div className="mobile-cards" style={{ display: "none" }}>
        {paginatedProducts.map((product) => (
          <div key={product._id} className="mobile-card">
            <div className="mobile-card-header">
              <span
                className="category-badge"
                style={{
                  backgroundColor: getCategoryBadgeColor(product.category),
                  marginRight: "8px",
                }}
              >
                {product.category}
              </span>
              {product.maker} {product.model}
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Quantity:</span>
              <span className="mobile-card-value">{product.quantity}</span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Stock Date:</span>
              <span className="mobile-card-value">
                {new Date(product.stockEnterDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="mobile-card-row">
              <span className="mobile-card-label">Source:</span>
              <span className="mobile-card-value">{product.source}</span>
            </div>
            {product.devices && product.devices.length > 0 && (
              <div className="mobile-device-info">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Devices:</span>
                  <span className="mobile-card-value">
                    {product.devices.length} devices
                  </span>
                </div>
                <button
                  className="btn btn-view-devices btn-small"
                  onClick={() => handleViewDevices(product)}
                  style={{ width: "100%", marginTop: "8px" }}
                >
                  View Device Details
                </button>
              </div>
            )}
            {product.drumNumber && (
              <div className="mobile-device-info">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Drum:</span>
                  <span className="mobile-card-value">
                    {product.drumNumber}
                  </span>
                </div>
              </div>
            )}
            <div className="action-buttons">
              <button
                className="btn btn-edit"
                onClick={() => openEditModal(product)}
              >
                Edit
              </button>
              <button
                className="btn btn-delete"
                onClick={() => handleDeleteProduct(product._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Product"
      >
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowAddModal(false)}
          makerArray={makers}
        />
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        title="Edit Product"
      >
        <ProductForm
          editProduct={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          makerArray={makers}
        />
      </Modal>

      {/* View Devices Modal */}
      <Modal
        isOpen={showDevicesModal}
        onClose={() => {
          setShowDevicesModal(false);
          setViewingProduct(null);
        }}
        title={
          <div className="flex items-center justify-between">
            <span>
              Product Details - {viewingProduct?.maker} {viewingProduct?.model}
            </span>
          </div>
        }
      >
        {viewingProduct && viewingProduct.devices && (
          <div style={{ padding: "24px" }}>
            <ErrorBoundary>
              <DeviceList
                onDevicesChange={(updatedDevices) => {
                  setViewingProduct((prev) => ({
                    ...prev,
                    devices: updatedDevices, // ✅ update devices properly
                  }));
                }}
                onCabelesChange={(updatedCables) =>
                  setViewingProduct((prev) => ({
                    ...prev,
                    cables: updatedCables, // ✅ update cables properly
                  }))
                }
                devices={viewingProduct?.devices || []}
                category={viewingProduct?.category}
                productId={viewingProduct?._id}
                cables={viewingProduct?.cables || []}
                isReadOnly={true}
              />
            </ErrorBoundary>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteProductId(null);
        }}
        title="Confirm Delete"
      >
        <div style={{ padding: "24px" }}>
          <p
            style={{ marginBottom: "24px", fontSize: "16px", color: "#2c3e50" }}
          >
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            <button
              className="btn btn-cancel"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteProductId(null);
              }}
            >
              Cancel
            </button>
            <button className="btn btn-delete" onClick={confirmDelete}>
              Delete Product
            </button>
          </div>
        </div>
      </Modal>

      {/* Add New Stock Modal */}
      <Modal
        isOpen={showAddStockModal}
        onClose={() => {
          setShowAddStockModal(false);
          setAddingStockProductId(null);
        }}
        title={`Add New Stock - ${addingStockProductId?.maker} ${addingStockProductId?.model}`}
      >
        <div style={{ padding: "24px" }}>
          <form
            className="product-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                let payload = {};

                // Device categories
                if (
                  ["ONU", "ONT", "Router"].includes(
                    addingStockProductId.category
                  )
                ) {
                  payload = { devices: stockInputs };
                }
                // Optical Fiber
                else if (
                  addingStockProductId.category === "Optical Fiber" ||
                  addingStockProductId.category === "Cable"
                ) {
                  payload = {
                    drumNumber,
                    quantity,
                    stockEnterDate,
                    performedBy: localStorage.getItem("contact"),
                    cables: [
                      {
                        drumNumber: drumNumber,
                        totalLength: quantity,
                        availableLength: quantity,
                      },
                    ],
                  };
                }
                // Other categories (Accessories, Cable, etc.)
                else {
                  payload = {
                    quantity,
                    stockEnterDate,
                    performedBy: localStorage.getItem("contact"),
                  };
                }

                const response = await API.put(
                  `/inventory/add-stock/${addingStockProductId._id}`,
                  payload
                );

                if (response.status !== 200) {
                  alert("Error adding stock. Please try again.");
                  return;
                }

                alert("Stock added successfully!");
                setShowAddStockModal(false);
                setAddingStockProductId(null);
                fetchProducts();
              } catch (err) {
                alert("Error adding stock. Please try again.");
                console.log(err);
              }
            }}
          >
            {/* Device Categories */}
            {["ONU", "ONT", "Router"].includes(
              addingStockProductId?.category
            ) ? (
              <>
                {/* Device Inputs */}
                <div className="form-group">
                  <div className="device-section-header">
                    <label>Device Details (Serial Number, MAC Address) *</label>
                    <button
                      type="button"
                      className="btn btn-secondary btn-small"
                      onClick={() => setShowBulkUpload(!showBulkUpload)}
                    >
                      {showBulkUpload ? "Manual Entry" : "Bulk Upload Excel"}
                    </button>
                  </div>

                  {showBulkUpload && (
                    <BulkUploadDevices
                      onDevicesUploaded={(uploadedDevices) => {
                        setStockInputs(uploadedDevices);
                        setQuantity(uploadedDevices.length);
                        setShowBulkUpload(false);
                      }}
                      category={addingStockProductId.category}
                    />
                  )}

                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setQuantity(val);
                      setStockInputs(
                        Array.from({ length: val }, () => ({
                          serialNumber: "",
                          macAddress: "",
                          status: "Free",
                          timestamp: Date.now(),
                        }))
                      );
                    }}
                    className="device-input-field"
                    placeholder="Enter quantity"
                    min="1"
                  />
                  {quantity > 0 && (
                    <span className="helper-text">
                      {quantity} device(s) will be added
                    </span>
                  )}
                </div>

                {/* Manual Device Inputs */}
                {quantity > 0 && (
                  <div className="form-group">
                    <div className="devices-input-container">
                      {stockInputs.map((device, index) => (
                        <div key={index} className="device-input-group">
                          <div className="device-number">
                            Device #{index + 1}
                          </div>
                          <div className="device-inputs">
                            <input
                              type="text"
                              value={device.serialNumber}
                              onChange={(e) => {
                                const newInputs = [...stockInputs];
                                newInputs[index].serialNumber = e.target.value;
                                setStockInputs(newInputs);
                              }}
                              placeholder="Serial Number"
                              className="device-input-field"
                            />
                            <input
                              type="text"
                              value={device.macAddress}
                              onChange={(e) => {
                                const newInputs = [...stockInputs];
                                newInputs[index].macAddress = e.target.value;
                                setStockInputs(newInputs);
                              }}
                              placeholder="MAC Address (00:1A:2B:3C:4D:5E)"
                              className="device-input-field"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Non-device categories */}
                {(addingStockProductId?.category === "Optical Fiber" ||
                  addingStockProductId?.category === "Cable") && (
                  <div className="form-group">
                    <label htmlFor="drumNumber">Drum Number *</label>
                    <input
                      type="text"
                      id="drumNumber"
                      value={drumNumber}
                      onChange={(e) => setDrumNumber(e.target.value)}
                      className="device-input-field"
                      placeholder="Enter Drum Number"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="device-input-field"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stockEnterDate">Stock Enter Date *</label>
                  <input
                    type="date"
                    id="stockEnterDate"
                    value={stockEnterDate}
                    onChange={(e) => setStockEnterDate(e.target.value)}
                    className="device-input-field"
                  />
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowAddStockModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Stock
              </button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Show Stock History */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryProduct(null);
          setDeviceSearch(""); // reset search
        }}
        title={`Stock History - ${historyProduct?.maker} ${historyProduct?.model}`}
      >
        <div style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          {/* Device Search (only for device categories) */}
          {["ONU", "ONT", "Router"].includes(historyProduct?.category) && (
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="Search by Serial or MAC Address"
                className="device-input-field"
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
              />
            </div>
          )}

          {/* Check if device category */}
          {["ONU", "ONT", "Router"].includes(historyProduct?.category) ? (
            <>
              <h4>Device History</h4>
              {historyProduct?.devices?.length > 0 ? (
                historyProduct.devices
                  .filter(
                    (device) =>
                      device.serialNumber
                        .toLowerCase()
                        .includes(deviceSearch.toLowerCase()) ||
                      device.macAddress
                        .toLowerCase()
                        .includes(deviceSearch.toLowerCase())
                  )
                  .map((device, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      <strong>Device #{index + 1}</strong>
                      <p>Serial Number: {device.serialNumber}</p>
                      <p>MAC Address: {device.macAddress}</p>
                      <p>Status: {device.status}</p>
                      <h5>History:</h5>
                      {device.history?.length > 0 ? (
                        <ul style={{ paddingLeft: "20px" }}>
                          {device.history.map((h, i) => (
                            <li key={i}>
                              <strong>{h.action}</strong> at {h.location} by{" "}
                              {h.performedBy} on{" "}
                              {new Date(h.date).toLocaleString()}
                              {h.remarks && ` - ${h.remarks}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>No history available</p>
                      )}
                    </div>
                  ))
              ) : (
                <p>No devices in stock</p>
              )}
            </>
          ) : (
            <>
              <h4>Stock History</h4>
              {historyProduct?.stockHistory?.length > 0 ? (
                <ul style={{ paddingLeft: "20px" }}>
                  {historyProduct.stockHistory.map((h, i) => (
                    <li key={i}>
                      <strong>{h.action}</strong>: {h.quantity} units at{" "}
                      {h.location} by {h.performedBy} on{" "}
                      {new Date(h.date).toLocaleString()}
                      {h.remarks && ` - ${h.remarks}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No stock history available</p>
              )}
            </>
          )}

          {/* Close Button */}
          <div className="form-actions" style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventryDash;
