import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import { usePermissions } from "../PermissionProvider";
import PONPort from "./drawables/port.png";
import EthernetPort from "./drawables/ethernet.png";

const SYOLT = ({
  rackId,
  officeKey,
  deviceId,
  deviceIndex,
  officename,
  pons = 4,
  sfps = 4,
  ethernet = 4,
  portsData = {},
  show = true,
  onPortUpdate,
}) => {
  const { hasPermission } = usePermissions();

  const PON_RANGE = Number(pons) || 4;
  const SFP_RANGE = Number(sfps) || 4;
  const ETHERNET_RANGE = Number(ethernet) || 4;

  const isTwoRows = ETHERNET_RANGE > 7;
  const lowerRowPorts = Array.from({
    length: Math.ceil(ETHERNET_RANGE / 2),
  }).map((_, i) => 2 * i + 1);
  const upperRowPorts = Array.from({
    length: Math.floor(ETHERNET_RANGE / 2),
  }).map((_, i) => 2 * i + 2);

  const isSFPTwoRows = SFP_RANGE > 7;
  const SFPlowerRowPorts = Array.from({ length: Math.ceil(SFP_RANGE / 2) }).map(
    (_, i) => 2 * i + 1,
  );
  const SFPupperRowPorts = Array.from({
    length: Math.floor(SFP_RANGE / 2),
  }).map((_, i) => 2 * i + 2);

  const isTwoPONRows = PON_RANGE > 15;
  const lowerPONPorts = Array.from({ length: Math.ceil(PON_RANGE / 2) }).map(
    (_, i) => 2 * i + 1,
  );
  const upperPONPorts = Array.from({ length: Math.floor(PON_RANGE / 2) }).map(
    (_, i) => 2 * i + 2,
  );

  const [activeModal, setActiveModal] = useState(null); // 'PONs' | 'SFPs' | 'Ethernet'
  const [selectedPortNumber, setSelectedPortNumber] = useState(null);

  const [formState, setFormState] = useState({
    connectedTo: "",
    connectedPort: "",
    assignedArea: "",
  });

  const [availableDevices, setAvailableDevices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const getPortData = (sectionName, portNum) => {
    console.log(
      `Fetching port data for section: ${sectionName}, port number: ${portNum}`,
      "from portsData:",
      portsData,
    );
    const list = portsData[sectionName] || [];
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
          }));

        setAvailableDevices(formatted);
      } catch (err) {
        console.error("Failed to load office devices:", err);
      }
    };

    loadOfficeDevices();
  }, [rackId, officeKey, deviceId]);

  // Restrict candidate devices based on active OLT section
  const eligibleDevices = availableDevices.filter((dev) => {
    if (activeModal === "Ethernet") {
      // Ethernet cannot connect to FMS
      return dev.deviceType === "Switch" || dev.deviceType === "OLT";
    }
    if (activeModal === "PONs") {
      // PON ports can only link to optical distribution patch panels (FMS)
      return dev.deviceType === "FMS";
    }
    if (activeModal === "SFPs") {
      // SFPs can connect to Switch, FMS, or other OLTs
      return (
        dev.deviceType === "Switch" ||
        dev.deviceType === "FMS" ||
        dev.deviceType === "OLT"
      );
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
      connectedPort: currentPort?.connectedPort
        ? String(currentPort.connectedPort)
        : "",
      assignedArea: currentPort?.assignedArea || "",
    });

    setActiveModal(section);
  };

  const handleSavePort = async (section) => {
    if (!rackId || !officeKey || !deviceId || !selectedPortNumber) return;

    try {
      setIsSaving(true);
      const isDisconnect = !formState.connectedTo;

      // Determine correct portType and targetSection based on the OLT section
      let portType = "OTHER";
      let targetSection = section;

      if (section === "Ethernet") {
        portType = "ETHERNET";
        targetSection = "Ethernet";
      } else if (section === "PONs") {
        portType = "PON";
        targetSection = "Ports"; // PON connects to FMS Ports
      } else if (section === "SFPs") {
        portType = "SFP";
        targetSection = "SFPs";
      }

      const payload = {
        section,
        connectedTo: isDisconnect ? null : formState.connectedTo,
        connectedPort: isDisconnect ? null : String(formState.connectedPort),
        assignedArea: isDisconnect ? "" : formState.assignedArea,
        portType: isDisconnect ? undefined : portType,
        targetSection: isDisconnect ? undefined : targetSection,
      };

      await API.put(
        `/rackinfo/${rackId}/offices/${officeKey}/devices/${deviceId}/ports/${selectedPortNumber}`,
        payload,
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
        backgroundColor: "#d97706",
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
        {/* Device Information */}
        <div
          style={{
            minWidth: "125px",
            borderRight: "1px solid #cbd5e1",
            paddingRight: "12px",
          }}
        >
          <div
            style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}
          >
            OLT: {deviceId}
          </div>
          <div style={{ fontSize: "11px", color: "#475569" }}>
            Key: {deviceIndex}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{officename}</div>
        </div>

        {/* PON Section */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "3px",
            }}
          >
            PON
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
              {(isTwoPONRows
                ? upperPONPorts
                : Array.from({ length: PON_RANGE }, (_, i) => i + 1)
              ).map((portNum) => {
                const portObj = getPortData("PONs", portNum);
                const isConnected = Boolean(portObj?.connectedTo);
                return (
                  <div
                    key={portNum}
                    onContextMenu={(e) =>
                      handlePortRightClick(e, "PONs", portNum)
                    }
                    style={{
                      width: "26px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    title={
                      isConnected
                        ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                        : `PON ${portNum} (Available)`
                    }
                  >
                    <img
                      alt={`PON ${portNum}`}
                      src={PONPort}
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                        borderRadius: "2px",
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

            {isTwoPONRows && (
              <div
                style={{ display: "flex", flexDirection: "row", gap: "2px" }}
              >
                {lowerPONPorts.map((portNum) => {
                  const portObj = getPortData("PONs", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) =>
                        handlePortRightClick(e, "PONs", portNum)
                      }
                      style={{
                        width: "26px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title={
                        isConnected
                          ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                          : `PON ${portNum} (Available)`
                      }
                    >
                      <img
                        alt={`PON ${portNum}`}
                        src={PONPort}
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                          borderRadius: "2px",
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

        {/* SFP Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #cbd5e1",
            paddingLeft: "14px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "3px",
            }}
          >
            SFP
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
              {(isSFPTwoRows
                ? SFPupperRowPorts
                : Array.from({ length: SFP_RANGE }, (_, i) => i + 1)
              ).map((portNum) => {
                const portObj = getPortData("SFPs", portNum);
                const isConnected = Boolean(portObj?.connectedTo);
                return (
                  <div
                    key={portNum}
                    onContextMenu={(e) =>
                      handlePortRightClick(e, "SFPs", portNum)
                    }
                    style={{
                      width: "28px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    title={
                      isConnected
                        ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                        : `SFP ${portNum} (Available)`
                    }
                  >
                    <div
                      style={{
                        width: "22px",
                        height: "20px",
                        backgroundColor: isConnected ? "#16a34a" : "#0f172a",
                        borderRadius: "3px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#334155",
                        marginTop: "2px",
                      }}
                    >
                      GE {portNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {isSFPTwoRows && (
              <div
                style={{ display: "flex", flexDirection: "row", gap: "6px" }}
              >
                {SFPlowerRowPorts.map((portNum) => {
                  const portObj = getPortData("SFPs", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) =>
                        handlePortRightClick(e, "SFPs", portNum)
                      }
                      style={{
                        width: "28px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title={
                        isConnected
                          ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                          : `SFP ${portNum} (Available)`
                      }
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "20px",
                          backgroundColor: isConnected ? "#16a34a" : "#0f172a",
                          borderRadius: "3px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "7.5px",
                          color: "#334155",
                          marginTop: "2px",
                        }}
                      >
                        GE {portNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ethernet Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid #cbd5e1",
            paddingLeft: "14px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: "700",
              color: "#334155",
              marginBottom: "3px",
            }}
          >
            Ethernet
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
              {(isTwoRows
                ? upperRowPorts
                : Array.from({ length: ETHERNET_RANGE }, (_, i) => i + 1)
              ).map((portNum) => {
                const portObj = getPortData("Ethernet", portNum);
                const isConnected = Boolean(portObj?.connectedTo);
                return (
                  <div
                    key={portNum}
                    onContextMenu={(e) =>
                      handlePortRightClick(e, "Ethernet", portNum)
                    }
                    style={{
                      width: "26px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    title={
                      isConnected
                        ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                        : `ETH ${portNum} (Available)`
                    }
                  >
                    <img
                      alt={`ETH ${portNum}`}
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
                    <span
                      style={{
                        fontSize: "7.5px",
                        color: "#334155",
                        marginTop: "1px",
                      }}
                    >
                      GE {portNum}
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
                  const portObj = getPortData("Ethernet", portNum);
                  const isConnected = Boolean(portObj?.connectedTo);
                  return (
                    <div
                      key={portNum}
                      onContextMenu={(e) =>
                        handlePortRightClick(e, "Ethernet", portNum)
                      }
                      style={{
                        width: "26px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      title={
                        isConnected
                          ? `Connected to: ${portObj.connectedTo} (Port ${portObj.connectedPort})`
                          : `ETH ${portNum} (Available)`
                      }
                    >
                      <img
                        alt={`ETH ${portNum}`}
                        src={EthernetPort}
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: isConnected ? "#16a34a" : "#e2e8f0",
                          borderRadius: "2px",
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
                        GE {portNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={Boolean(activeModal)}
        onHide={() => setActiveModal(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Edit OLT {activeModal} Port {selectedPortNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSavePort(activeModal);
            }}
          >
            <div className="alert alert-info py-2" style={{ fontSize: "12px" }}>
              {activeModal === "Ethernet" &&
                "Ethernet ports can only connect to Ethernet interfaces on Switches or OLTs (No FMS/PON/SFP)."}
              {activeModal === "PONs" &&
                "PON ports can only connect to optical patch panel ports (FMS)."}
              {activeModal === "SFPs" &&
                "SFP ports can connect to Switch SFPs, other OLT SFPs, or FMS patch ports (No PONs)."}
            </div>

            {/* Target Device Dropdown */}
            <div className="mb-3">
              <label className="form-label">Connected Device</label>
              <select
                className="form-select"
                value={formState.connectedTo}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    connectedTo: e.target.value,
                    connectedPort: "",
                  })
                }
              >
                <option value="">-- Disconnected / None --</option>
                {eligibleDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceId} ({d.deviceType} -{" "}
                    {d.fmsname || d.swisp || d.oltType || d.serialNo})
                  </option>
                ))}
              </select>
              {eligibleDevices.length === 0 && (
                <div className="text-danger mt-1" style={{ fontSize: "11px" }}>
                  No compatible devices available in this office for{" "}
                  {activeModal} ports.
                </div>
              )}
            </div>

            {/* Target Port Number */}
            {formState.connectedTo && (
              <div className="mb-3">
                <label className="form-label">Connected Port Number</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  className="form-control"
                  value={formState.connectedPort}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
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
                placeholder="e.g. Rack A - Uplink"
                value={formState.assignedArea}
                onChange={(e) =>
                  setFormState({ ...formState, assignedArea: e.target.value })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setActiveModal(null)}
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

export default SYOLT;
