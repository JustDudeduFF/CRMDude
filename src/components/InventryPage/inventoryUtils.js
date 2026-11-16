export const categories = ['ONU', 'ONT', 'Router', 'Optical Fiber', 'Cable', 'Accessories'];
export const statuses = ['Free', 'Installed', 'Returned', 'On Repair', 'Non Repairable'];
export const isDevice = category => ['ONU', 'ONT', 'Router'].includes(category);
export const isCable = category => ['Optical Fiber', 'Cable'].includes(category);
export const available = product => isDevice(product.category) ? (product.devices || []).filter(device => device.status === 'Free' || device.status === 'Returned').length : isCable(product.category) ? (product.cables || []).reduce((sum, cable) => sum + Number(cable.availableLength || 0), 0) : Number(product.quantity || 0);
export const dateText = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
export const today = () => { const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key).value).join('-'); };
export const apiError = error => error.response?.data?.error || error.response?.data?.message || 'Unable to save changes. Please try again.';
export function validateRows(rows, cable = false) {
  if (!rows.length) throw new Error(cable ? 'Add at least one drum.' : 'Add at least one device.');
  if (rows.length > 5000) throw new Error('Import up to 5,000 stock items at a time.');
  const identifiers = new Set(), macs = new Set();
  return rows.map((row, index) => {
    if (cable) {
      const drumNumber = String(row.drumNumber || '').trim();
      const totalLength = Number(row.totalLength);
      if (!drumNumber || !Number.isFinite(totalLength) || totalLength <= 0) throw new Error(`Row ${index + 1}: enter a drum number and a length greater than zero.`);
      if (identifiers.has(drumNumber.toLowerCase())) throw new Error(`Row ${index + 1}: duplicate drum number.`);
      identifiers.add(drumNumber.toLowerCase());
      return { drumNumber, totalLength, availableLength: totalLength };
    }
    const serialNumber = String(row.serialNumber || '').trim();
    const macAddress = String(row.macAddress || '').trim().replace(/-/g, ':').toUpperCase();
    if (!serialNumber || !/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/.test(macAddress)) throw new Error(`Row ${index + 1}: enter a serial number and a valid MAC address.`);
    if (identifiers.has(serialNumber.toLowerCase()) || macs.has(macAddress)) throw new Error(`Row ${index + 1}: duplicate serial number or MAC address.`);
    identifiers.add(serialNumber.toLowerCase()); macs.add(macAddress);
    return { serialNumber, macAddress, status: 'Free' };
  });
}
