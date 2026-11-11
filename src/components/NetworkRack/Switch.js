import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { usePermissions } from "../PermissionProvider";
import EthernetPort from "./drawables/ethernet.png";

const Switch = ({
  rackId,
  officeKey,
  deviceId,
  deviceIndex,
  officename,
  ethernet = 8,
  sfps = 4,
  portsData = {},
  show = true,
  onPortUpdate,
}) => {
  const { hasPermission } = usePermissions();

  const ETHERNET_RANGE = Number(ethernet) || 0;
  const SFP_RANGE = Number(sfps) || 0;

  const upperRowPorts = Array.from({ length: Math.floor(ETHERNET_RANGE / 2) }).map((_, i) => 2 * i + 2);
  const lowerRowPorts = Array.from({ length: Math.ceil(ETHERNET_RANGE / 2) }).map((_, i) => 2 * i + 1);

  const upperSFPPorts = Array.from({ length: Math.floor(SFP_RANGE / 2) }).map((_, i) => 2 * i + 2);
  const lowerSFPPorts = Array.from({ length: Math.ceil(SFP_RANGE / 2) }).map((_, i) => 2 * i + 1);
  const isTwoRowSFP = SFP_RANGE > 4;

  const [activeModal, setActiveModal] = useState(null); // 'Ethernet' | 'SFPs'
  const [selectedPortNumber, setSelectedPortNumber] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState({
    connectedTo: "",
    connectedPort: "",
    assignedArea: "",
  });

  const [availableDevices, setAvailableDevices] = useState([]);

  const getPortData = (section, portNum) => {
    const list = portsData[section] || [];
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
            swisp: dev.swisp || "",
            oltType: dev.oltType || "",
            fmsname: dev.fmsname || "",
          }));

        setAvailableDevices(formatted);
      } catch (err) {
        console.error("Failed to load office devices:", err);
      }
    };

    loadOfficeDevices();
  }, [rackId, officeKey, deviceId]);

  // Enforce validation filter:
  // - Ethernet: Only OLT or Switch Ethernet (never FMS)
  // - SFP: Can connect to Switch SFPs, OLT SFPs, or FMS (never OLT PONs)
  const eligibleDevices = availableDevices.filter((dev) => {
    if (activeModal === "Ethernet") {
      return dev.deviceType === "Switch" || dev.deviceType === "OLT";
    }
    if (activeModal === "SFPs") {
      return dev.deviceType === "Switch" || dev.deviceType === "OLT" || dev.deviceType === "FMS";
    }
    return true;
  });

  const handlePortRightClick = (e, section, portNumber) => {
    e.preventDefault();
    if (!hasPermission("UPDATE_RACK")) {
      alert("Permission Denied");
      return;
    }

    const currentPort = getPortData(section, portNumber);
    setSelectedPortNumber(portNumber);
    setFormState({
      connectedTo: currentPort?.connectedTo || "",
      connectedPort: currentPort?.connectedPort ? String(currentPort.connectedPort) : "",
      assignedArea: currentPort?.assignedArea || "",
    });

    setActiveModal(section);
  };

  const handleSavePort = async (e) => {
    e.preventDefault();
    if (!rackId || !officeKey || !deviceId || !selectedPortNumber || !activeModal) return;

    if (formState.connectedTo) {
      const targetDevice = availableDevices.find((d) => d.deviceId === formState.connectedTo);
      if (activeModal === "Ethernet" && targetDevice?.deviceType === "FMS") {
        alert("Validation Error: Switch Ethernet ports cannot connect to FMS.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const isDisconnect = !formState.connectedTo;

      const payload = {
        section: activeModal,
        connectedTo: isDisconnect ? null : formState.connectedTo,
        connectedPort: isDisconnect ? null : String(formState.connectedPort),
        assignedArea: isDisconnect ? "" : formState.assignedArea,
      };

      await API.put(
        `/rackinfo/${rackId}/offices/${officeKey}/devices/${deviceId}/ports/${selectedPortNumber}`,
        payload
      );

      setActiveModal(null);
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
        backgroundColor: "#2d3748",
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
          border: "2px solid #1a202c",
          padding: "8px 16px",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          gap: "18px",
          overflowX: "auto",
        }}
      >
        <div style={{ minWidth: "125px", borderRight: "1px solid #cbd5e1", paddingRight: "12px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Switch: {deviceId}</div>
          <div style={{ fontSize: "11px", color: "#475569" }}>Key: {deviceIndex}</div>
          {officename && <div style={{ fontSize: "11px", color: "#64748b" }}>{officename}</div>}
        </div>

        {/* Ethernet Ports */}
        {ETHERNET_RANGE > 0 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#334155", marginBottom: "3px" }}>Ethernet</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
                {upperRowPorts.map((portNum) => {
                  const portObj = getPortData("Ethernet", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) => handlePortRightClick(e, "Ethernet", portNum)}
                      style={{ width: "26px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                      title={isConnected ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})` : `Port ${portNum} (Available)`}
                    >
                      <img
                        alt={`GE ${portNum}`}
                        src={EthernetPort}
                        style={{
                          width: "20px",
                          height: "20px",
                          transform: "rotate(180deg)",
                          backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                          borderRadius: "2px",
                          padding: "1px",
                        }}
                      />
                      <span style={{ fontSize: "7.5px", color: "#334155", marginTop: "1px" }}>GE {portNum}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
                {lowerRowPorts.map((portNum) => {
                  const portObj = getPortData("Ethernet", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) => handlePortRightClick(e, "Ethernet", portNum)}
                      style={{ width: "26px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                      title={isConnected ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})` : `Port ${portNum} (Available)`}
                    >
                      <img
                        alt={`GE ${portNum}`}
                        src={EthernetPort}
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                          borderRadius: "2px",
                          padding: "1px",
                        }}
                      />
                      <span style={{ fontSize: "7.5px", color: "#334155", marginTop: "1px" }}>GE {portNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SFP Ports */}
        {SFP_RANGE > 0 && (
          <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid #cbd5e1", paddingLeft: "14px" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#334155", marginBottom: "3px" }}>SFP</span>

            {isTwoRowSFP ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                  {upperSFPPorts.map((portNum) => {
                    const portObj = getPortData("SFPs", portNum);
                    const isConnected = Boolean(portObj?.connectedTo);
                    return (
                      <div
                        key={portNum}
                        onContextMenu={(e) => handlePortRightClick(e, "SFPs", portNum)}
                        style={{ width: "28px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                        title={isConnected ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})` : `SFP ${portNum} (Available)`}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "20px",
                            backgroundColor: isConnected ? "#16a34a" : "#0f172a",
                            borderRadius: "3px",
                          }}
                        />
                        <span style={{ fontSize: "7.5px", color: "#334155", marginTop: "2px" }}>SFP {portNum}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                  {lowerSFPPorts.map((portNum) => {
                    const portObj = getPortData("SFPs", portNum);
                    const isConnected = Boolean(portObj?.connectedTo);
                    return (
                      <div
                        key={portNum}
                        onContextMenu={(e) => handlePortRightClick(e, "SFPs", portNum)}
                        style={{ width: "28px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                        title={isConnected ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})` : `SFP ${portNum} (Available)`}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "20px",
                            backgroundColor: isConnected ? "#16a34a" : "#0f172a",
                            borderRadius: "3px",
                          }}
                        />
                        <span style={{ fontSize: "7.5px", color: "#334155", marginTop: "2px" }}>SFP {portNum}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "row", gap: "6px", alignItems: "center" }}>
                {Array.from({ length: SFP_RANGE }, (_, i) => i + 1).map((portNum) => {
                  const portObj = getPortData("SFPs", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) => handlePortRightClick(e, "SFPs", portNum)}
                      style={{ width: "28px", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
                      title={isConnected ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})` : `SFP ${portNum} (Available)`}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "24px",
                          backgroundColor: isConnected ? "#16a34a" : "#0f172a",
                          borderRadius: "3px",
                        }}
                      />
                      <span style={{ fontSize: "7.5px", color: "#334155", marginTop: "3px" }}>SFP {portNum}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      <Modal show={Boolean(activeModal)} onHide={() => setActiveModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Configure Switch {activeModal} Port {selectedPortNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSavePort}>
            <div className="alert alert-info py-2" style={{ fontSize: "12px" }}>
              {activeModal === "Ethernet"
                ? "Ethernet ports only connect to Switch or OLT Ethernet (No FMS/PON/SFP)."
                : "SFP ports can connect to Switch SFPs, OLT SFPs, or FMS patch ports (Never OLT PONs)."}
            </div>

            <div className="mb-3">
              <label className="form-label">Connected Device</label>
              <select
                className="form-select"
                value={formState.connectedTo}
                onChange={(e) => setFormState({ ...formState, connectedTo: e.target.value, connectedPort: "" })}
              >
                <option value="">-- Disconnected / None --</option>
                {eligibleDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} ({d.deviceType} - {d.swisp || d.oltType || d.fmsname || d.serialNo})
                  </option>
                ))}
              </select>
            </div>

            {formState.connectedTo && (
              <div className="mb-3">
                <label className="form-label">Connected Port Number</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  className="form-control"
                  placeholder="e.g. 1"
                  value={formState.connectedPort}
                  onChange={(e) => setFormState({ ...formState, connectedPort: e.target.value })}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Assigned Area / Label</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Floor 2 Server Room"
                value={formState.assignedArea}
                onChange={(e) => setFormState({ ...formState, assignedArea: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)} disabled={isSaving}>
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

export default Switch;