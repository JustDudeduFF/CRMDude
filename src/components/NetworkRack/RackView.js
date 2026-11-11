import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { API } from "../../FirebaseConfig";
import RackDataModal from "./RackDataModal";
import SYOLT from "./SYOLT";
import Switch from "./Switch";
import FMS from "./FMS";

export default function RackView() {
  const location = useLocation();
  const { rackId, officeKey, officename } = location.state || {};

  const [showModal, setShowModal] = useState(false);
  const [counts, setCounts] = useState(0);
  const [loading, setLoading] = useState(true);

  const [oltDevices, setOltDevices] = useState([]);
  const [switchDevices, setSwitchDevices] = useState([]);
  const [fmsDevices, setFmsDevices] = useState([]);

  // Edit / Delete State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch office and its devices
  const fetchRackDevices = useCallback(async () => {
    if (!rackId || !officeKey) {
      console.error("Rack ID or Office Key is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/rackinfo/${rackId}/offices/${officeKey}`);
      const office = response.data?.data || {};
      const devicesData = office.devices || {};

      const olts = [];
      const switches = [];
      const fms = [];

      Object.entries(devicesData).forEach(([deviceId, deviceData]) => {
        if (!deviceData) return;

        const baseDevice = {
          ...deviceData,
          deviceId,
          officeKey,
          officename,
          deviceKey: Number(deviceData.deviceKey),
        };

        if (deviceData.device === "OLT") {
          olts.push({
            ...baseDevice,
            ponRange: Number(deviceData.ponRange) || 4,
            sfpRange: Number(deviceData.sfpRange) || 4,
            ethernetRange: Number(deviceData.ethernetRange) || 4,
            pons: deviceData.PONs || [],
            sfps: deviceData.SFPs || [],
            ethernet: deviceData.Ethernet || [],
          });
        } else if (deviceData.device === "Switch") {
          switches.push({
            ...baseDevice,
            swethernetrange: Number(deviceData.swethernetrange) || 8,
            swsfpsrange: Number(deviceData.swsfpsrange) || 4,
            ethernet: deviceData.Ethernet || [],
            sfps: deviceData.SFPs || [],
          });
        } else if (deviceData.device === "FMS") {
          fms.push({
            ...baseDevice,
            fmsrange: Number(deviceData.fmsrange) || 48,
            ports: deviceData.Ports || [],
          });
        }
      });

      // Sort by deviceKey for consistent rack order
      const sortByDeviceKey = (a, b) => a.deviceKey - b.deviceKey;
      setOltDevices(olts.sort(sortByDeviceKey));
      setSwitchDevices(switches.sort(sortByDeviceKey));
      setFmsDevices(fms.sort(sortByDeviceKey));

      const totalCount = Object.keys(devicesData).length;
      setCounts(totalCount);
    } catch (error) {
      console.error("Error fetching rack devices:", error.response?.data || error);
      setOltDevices([]);
      setSwitchDevices([]);
      setFmsDevices([]);
      setCounts(0);
    } finally {
      setLoading(false);
    }
  }, [rackId, officeKey, officename]);

  useEffect(() => {
    fetchRackDevices();
  }, [fetchRackDevices]);

  // Open Edit Modal with selected device info
  const handleOpenEdit = (device) => {
    setEditingDevice({
      deviceId: device.deviceId,
      deviceType: device.device,
      serialNo: device.serialNo || "",
      // OLT fields
      ponRange: device.ponRange || 4,
      ethernetRange: device.ethernetRange || 4,
      sfpRange: device.sfpRange || 4,
      // Switch fields
      swethernetrange: device.swethernetrange || 8,
      swsfpsrange: device.swsfpsrange || 4,
      // FMS fields
      fmsrange: device.fmsrange || 48,
      fmsname: device.fmsname || "",
    });
    setShowEditModal(true);
  };

  // Submit Device Update (PUT)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDevice) return;

    try {
      setIsSubmitting(true);
      const payload = {
        serialNo: editingDevice.serialNo,
      };

      if (editingDevice.deviceType === "OLT") {
        payload.ponRange = Number(editingDevice.ponRange);
        payload.ethernetRange = Number(editingDevice.ethernetRange);
        payload.sfpRange = Number(editingDevice.sfpRange);
      } else if (editingDevice.deviceType === "Switch") {
        payload.swethernetrange = Number(editingDevice.swethernetrange);
        payload.swsfpsrange = Number(editingDevice.swsfpsrange);
      } else if (editingDevice.deviceType === "FMS") {
        payload.fmsrange = Number(editingDevice.fmsrange);
        payload.fmsname = editingDevice.fmsname;
      }

      await API.put(
        `/rackinfo/${rackId}/offices/${officeKey}/devices/${editingDevice.deviceId}`,
        payload
      );

      alert(`Device ${editingDevice.deviceId} updated successfully`);
      setShowEditModal(false);
      fetchRackDevices();
    } catch (error) {
      console.error("Error updating device:", error);
      alert(`Error updating device: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Device (DELETE)
  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm(`Are you sure you want to delete device "${deviceId}"?`)) {
      return;
    }

    try {
      await API.delete(`/rackinfo/${rackId}/offices/${officeKey}/devices/${deviceId}`);
      alert(`Device ${deviceId} deleted successfully`);
      fetchRackDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
      alert(`Error deleting device: ${error.response?.data?.message || error.message}`);
    }
  };

  const hasDevices = counts > 0;

  if (loading) {
    return <div className="p-4 text-center">Loading devices...</div>;
  }

  return (
    <div className="container-fluid p-1">
      {hasDevices ? (
        <div className="d-flex flex-column w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{officename}</h4>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              + Add Device
            </button>
          </div>

          <div className="d-flex flex-column align-items-center gap-3">
            {/* OLT Devices */}
            {oltDevices.map((olt) => (
              <div key={olt.deviceId} className="d-flex align-items-center gap-2">
                <SYOLT
                  show={true}
                  rackId={rackId}
                  officeKey={officeKey}
                  deviceId={olt.deviceId}
                  deviceIndex={olt.deviceKey}
                  officename={olt.officename}
                  pons={olt.ponRange}
                  sfps={olt.sfpRange}
                  ethernet={olt.ethernetRange}
                  portsData={{ PONs: olt.pons, SFPs: olt.sfps, Ethernet: olt.ethernet }}
                  onPortUpdate={fetchRackDevices}
                />
                <div className="d-flex flex-column gap-1">
                  <button
                    onClick={() => handleOpenEdit(olt)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit Device"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(olt.deviceId)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Device"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Switch Devices */}
            {switchDevices.map((sw) => (
              <div key={sw.deviceId} className="d-flex align-items-center gap-2">
                <Switch
                  show={true}
                  rackId={rackId}
                  officeKey={officeKey}
                  deviceId={sw.deviceId}
                  deviceIndex={sw.deviceKey}
                  officename={sw.officename}
                  ethernet={sw.swethernetrange}
                  sfps={sw.swsfpsrange}
                  portsData={{ Ethernet: sw.ethernet, SFPs: sw.sfps }}
                  onPortUpdate={fetchRackDevices}
                />
                <div className="d-flex flex-column gap-1">
                  <button
                    onClick={() => handleOpenEdit(sw)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit Device"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(sw.deviceId)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Device"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* FMS Devices */}
            {fmsDevices.map((fms) => (
              <div key={fms.deviceId} className="d-flex align-items-center gap-2">
                <FMS
                  show={true}
                  rackId={rackId}
                  officeKey={officeKey}
                  deviceId={fms.deviceId}
                  deviceIndex={fms.deviceKey}
                  officename={fms.officename}
                  fmsname={fms.fmsname}
                  fmsport={fms.fmsrange}
                  portsData={{ Ports: fms.ports }}
                  onPortUpdate={fetchRackDevices}
                />
                <div className="d-flex flex-column gap-1">
                  <button
                    onClick={() => handleOpenEdit(fms)}
                    className="btn btn-sm btn-outline-primary"
                    title="Edit Device"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(fms.deviceId)}
                    className="btn btn-sm btn-outline-danger"
                    title="Delete Device"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <h5>No devices found for {officename || "this office"}</h5>
          <button onClick={() => setShowModal(true)} className="btn btn-primary mt-3">
            + Add Device
          </button>
        </div>
      )}

      {/* Edit Device Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Device ({editingDevice?.deviceId})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingDevice && (
            <form onSubmit={handleSaveEdit}>
              <div className="mb-3">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingDevice.serialNo}
                  onChange={(e) =>
                    setEditingDevice({ ...editingDevice, serialNo: e.target.value })
                  }
                  required
                />
              </div>

              {/* OLT Inputs */}
              {editingDevice.deviceType === "OLT" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">PON Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.ponRange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, ponRange: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ethernet Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.ethernetRange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, ethernetRange: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">SFP Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.sfpRange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, sfpRange: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* Switch Inputs */}
              {editingDevice.deviceType === "Switch" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Ethernet Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.swethernetrange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, swethernetrange: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">SFP Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.swsfpsrange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, swsfpsrange: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* FMS Inputs */}
              {editingDevice.deviceType === "FMS" && (
                <>
                  <div className="mb-3">
                    <label className="form-label">FMS Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingDevice.fmsname}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, fmsname: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">FMS Port Range</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      className="form-control"
                      value={editingDevice.fmsrange}
                      onChange={(e) =>
                        setEditingDevice({ ...editingDevice, fmsrange: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {/* Shared Add Device Modal */}
      <RackDataModal
        show={showModal}
        closeModal={() => setShowModal(false)}
        rackId={rackId}
        officeKey={officeKey}
        officename={officename}
        count={counts}
        onDeviceAdded={() => {
          setShowModal(false);
          fetchRackDevices();
        }}
      />
    </div>
  );
}