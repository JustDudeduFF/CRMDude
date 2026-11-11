import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { usePermissions } from "../PermissionProvider";
import OpticalPort from "./drawables/optical.png";

const FMS = ({
  rackId,
  officeKey,
  deviceId,
  deviceIndex,
  officename,
  fmsname,
  fmsport = 48,
  portsData = {},
  show = true,
  onPortUpdate,
}) => {
  const { hasPermission } = usePermissions();

  const PORT_RANGE = Number(fmsport) || 48;
  const isTwoRows = PORT_RANGE > 24;
  const portsPerRow = isTwoRows ? Math.ceil(PORT_RANGE / 2) : PORT_RANGE;

  const upperRowPorts = Array.from({ length: portsPerRow }, (_, i) => i + 1);
  const lowerRowPorts = isTwoRows
    ? Array.from(
        { length: PORT_RANGE - portsPerRow },
        (_, i) => portsPerRow + i + 1,
      )
    : [];

  const [showModal, setShowModal] = useState(false);
  const [selectedPort, setSelectedPort] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [portDetails, setPortDetails] = useState({
    connectedTo: "",
    connectedPort: "",
    assignedArea: "",
    targetSection: "Ports",
  });

  const [availableDevices, setAvailableDevices] = useState([]);

  const getPortData = (portNum) => {
    const list = portsData.Ports || [];
    return list.find((p) => Number(p.port) === Number(portNum)) || null;
  };

  useEffect(() => {
    const loadOfficeDevices = async () => {
      if (!rackId || !officeKey) return;
      try {
        const res = await API.get(`/rackinfo/${rackId}/offices/${officeKey}`);
        const devices = res.data?.data?.devices || {};

        const formatted = Object.entries(devices)
          .filter(([id]) => id !== deviceId)
          .map(([id, dev]) => ({
            deviceId: id,
            deviceKey: dev.deviceKey,
            deviceType: dev.device,
            serialNo: dev.serialNo || "",
            fmsname: dev.fmsname || "",
            swisp: dev.swisp || "",
            oltType: dev.oltType || "",
            // Store range flags to ensure compatible target interfaces
            hasSfp: (Number(dev.sfpRange) || Number(dev.swsfpsrange) || 0) > 0,
            hasPon: (Number(dev.ponRange) || 0) > 0,
          }));

        setAvailableDevices(formatted);
      } catch (err) {
        console.error("Failed to load office devices:", err);
      }
    };

    loadOfficeDevices();
  }, [rackId, officeKey, deviceId]);

  // FMS patch ports connect only to optical ports (OLT PONs, OLT SFPs, Switch SFPs, or another FMS)
  // They are strictly blocked from Ethernet ports
  const eligibleDevices = availableDevices.filter((dev) => {
    if (dev.deviceType === "FMS") return true;
    if (dev.deviceType === "OLT") return dev.hasPon || dev.hasSfp;
    if (dev.deviceType === "Switch") return dev.hasSfp; // Must have SFP slots
    return false;
  });

  console.log("Eligible devices for FMS connections:", eligibleDevices);

  const handlePortRightClick = (e, portNumber) => {
    e.preventDefault();
    if (!hasPermission("UPDATE_RACK")) {
      alert("Permission Denied");
      return;
    }

    const currentPort = getPortData(portNumber);
    setSelectedPort(portNumber);
    setPortDetails({
      connectedTo: currentPort?.connectedTo || "",
      connectedPort: currentPort?.connectedPort
        ? String(currentPort.connectedPort)
        : "",
      assignedArea: currentPort?.assignedArea || "",
      targetSection: "PONs", // Default to Ports; will adjust based on selected device
    });

    setShowModal(true);
  };

  const handleSavePort = async (e) => {
    console.log("Saving port details:", portDetails);
    e.preventDefault();
    if (!rackId || !officeKey || !deviceId || !selectedPort) return;

    try {
      setIsSaving(true);
      const isDisconnect = !portDetails.connectedTo;

      const payload = {
        section: "Ports", // FMS ports are always "Ports" in the API
        connectedTo: isDisconnect ? null : portDetails.connectedTo,
        connectedPort: isDisconnect ? null : String(portDetails.connectedPort),
        assignedArea: isDisconnect ? "" : portDetails.assignedArea,
        portType: portDetails.targetSection === "SFPs" ? "SFP" : portDetails.targetSection === "PONs" ? "PON" : "OTHER", // API expects singular for SFP
      };

      await API.put(
        `/rackinfo/${rackId}/offices/${officeKey}/devices/${deviceId}/ports/${selectedPort}`,
        payload,
      );

      setShowModal(false);
      if (typeof onPortUpdate === "function") {
        onPortUpdate();
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        width: "fit-content",
        maxWidth: "100%",
        padding: "10px",
        borderRadius: "14px",
        backgroundColor: "#1e3a8a",
        boxShadow: "0 6px 14px rgba(0,0,0,0.35)",
        margin: "12px auto",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "row",
          width: "fit-content",
          minHeight: "96px",
          border: "2px solid #0f172a",
          padding: "8px 16px",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          gap: "18px",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            minWidth: "135px",
            borderRight: "1px solid #cbd5e1",
            paddingRight: "12px",
          }}
        >
          <div
            style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}
          >
            FMS: {deviceId}
          </div>
          {fmsname && (
            <div
              style={{ fontSize: "11px", fontWeight: "600", color: "#2563eb" }}
            >
              {fmsname}
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#475569" }}>
            Key: {deviceIndex}
          </div>
          {officename && (
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              {officename}
            </div>
          )}
        </div>

        {/* Optical Ports */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "3px",
            }}
          >
            Optical Patch Panel ({PORT_RANGE} Ports)
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
              {upperRowPorts.map((portNum) => {
                const portObj = getPortData(portNum);
                const isConnected = Boolean(portObj?.connectedTo);
                return (
                  <div
                    key={portNum}
                    onContextMenu={(e) => handlePortRightClick(e, portNum)}
                    style={{
                      width: "28px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    title={
                      isConnected
                        ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})\nArea: ${portObj.assignedArea || "N/A"}`
                        : `Port ${portNum} (Available)`
                    }
                  >
                    <img
                      alt={`Port ${portNum}`}
                      src={OpticalPort}
                      style={{
                        width: "22px",
                        height: "22px",
                        backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                        borderRadius: "3px",
                        padding: "1px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#334155",
                        marginTop: "1px",
                      }}
                    >
                      {portNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {isTwoRows && (
              <div
                style={{ display: "flex", flexDirection: "row", gap: "2px" }}
              >
                {lowerRowPorts.map((portNum) => {
                  const portObj = getPortData(portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) => handlePortRightClick(e, portNum)}
                      style={{
                        width: "28px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title={
                        isConnected
                          ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})\nArea: ${portObj.assignedArea || "N/A"}`
                          : `Port ${portNum} (Available)`
                      }
                    >
                      <img
                        alt={`Port ${portNum}`}
                        src={OpticalPort}
                        style={{
                          width: "22px",
                          height: "22px",
                          backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                          borderRadius: "3px",
                          padding: "1px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "7.5px",
                          color: "#334155",
                          marginTop: "1px",
                        }}
                      >
                        {portNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Configure FMS Port {selectedPort}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSavePort}>
            <div className="alert alert-info py-2" style={{ fontSize: "12px" }}>
              FMS optical ports connect to OLT PONs, SFP optics, or other FMS
              panels (RJ45 Ethernet is prohibited).
            </div>

            {/* Target Device Dropdown */}
            <div className="mb-3">
              <label className="form-label">Connected Device</label>
              <select
                className="form-select"
                value={portDetails.connectedTo}
                onChange={(e) => {
                  const targetId = e.target.value;
                  const dev = eligibleDevices.find(
                    (d) => d.deviceId === targetId,
                  );

                  setPortDetails({
                    ...portDetails,
                    connectedTo: targetId,
                    connectedPort: "",
                    // Default to PON if OLT, otherwise Ports/SFPs
                    targetSection:
                      dev?.deviceType === "OLT"
                        ? "PONs"
                        : dev?.deviceType === "Switch"
                          ? "SFPs"
                          : "Ports",
                  });
                }}
              >
                <option value="">-- Disconnected / None --</option>
                {eligibleDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} ({d.deviceType} -{" "}
                    {d.fmsname || d.oltType || d.swisp || d.serialNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Interface Type for OLT (PON vs SFP) */}
            {(() => {
              const selectedDev = eligibleDevices.find(
                (d) => d.deviceId === portDetails.connectedTo,
              );
              if (selectedDev?.deviceType === "OLT") {
                return (
                  <div className="mb-3 p-2 bg-light rounded border">
                    <label
                      className="form-label d-block fw-bold mb-2"
                      style={{ fontSize: "13px" }}
                    >
                      Select OLT Interface Type
                    </label>
                    <div className="d-flex gap-4">
                      {selectedDev.hasPon && (
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="oltSectionSelect"
                            id="oltSectionPon"
                            value="PONs"
                            checked={portDetails.targetSection === "PONs"}
                            onChange={(e) =>
                              setPortDetails({
                                ...portDetails,
                                targetSection: e.target.value,
                                connectedPort: "",
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="oltSectionPon"
                          >
                            PON Port
                          </label>
                        </div>
                      )}

                      {selectedDev.hasSfp && (
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="oltSectionSelect"
                            id="oltSectionSfp"
                            value="SFPs"
                            checked={portDetails.targetSection === "SFPs"}
                            onChange={(e) =>
                              setPortDetails({
                                ...portDetails,
                                targetSection: e.target.value,
                                connectedPort: "",
                              })
                            }
                          />
                          <label
                            className="form-check-label"
                            htmlFor="oltSectionSfp"
                          >
                            SFP Port
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Connected Port Number */}
            {portDetails.connectedTo && (
              <div className="mb-3">
                <label className="form-label">
                  Connected Port Number
                  {(() => {
                    const dev = eligibleDevices.find(
                      (d) => d.deviceId === portDetails.connectedTo,
                    );
                    if (dev?.deviceType === "OLT") {
                      return ` (${portDetails.targetSection === "PONs" ? "PON" : "SFP"})`;
                    }
                    return "";
                  })()}
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  className="form-control"
                  placeholder={
                    portDetails.targetSection === "PONs"
                      ? "Enter PON port (e.g. 1)"
                      : portDetails.targetSection === "SFPs"
                        ? "Enter SFP port (e.g. 1)"
                        : "Enter Port (e.g. 1)"
                  }
                  value={portDetails.connectedPort}
                  onChange={(e) =>
                    setPortDetails({
                      ...portDetails,
                      connectedPort: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {/* Assigned Area / Label */}
            <div className="mb-3">
              <label className="form-label">Assigned Area / Label</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Feeder Fiber - Splitter 1"
                value={portDetails.assignedArea}
                onChange={(e) =>
                  setPortDetails({
                    ...portDetails,
                    assignedArea: e.target.value,
                  })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Details"}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FMS;
