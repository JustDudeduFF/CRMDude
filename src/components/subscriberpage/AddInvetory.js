import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { API } from '../../FirebaseConfig';
import { usePermissions } from '../PermissionProvider';
import { apiError, isDevice } from '../InventryPage/inventoryUtils';
import '../InventryPage/Inventory.css';
import './InventoryAssignment.css';

export default function AddInventory() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canAssign = hasPermission('ASSIGN_DEVICE') || hasPermission('ADD_DEVICE');
  const partnerId = localStorage.getItem('partnerId'), subscriber = localStorage.getItem('susbsUserid');
  const [maker, setMaker] = useState(''), [stock, setStock] = useState([]), [productId, setProductId] = useState(''), [serial, setSerial] = useState(''), [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(false), [refresh, setRefresh] = useState(0);
  const [amount, setAmount] = useState('0'), [remarks, setRemarks] = useState('');
  useEffect(() => {
    if (!canAssign) { setLoading(false); return; }
    let active = true; setLoading(true); setError('');
    API.get('/inventory/', { params: { partnerId } }).then(({ data }) => {
      if (!Array.isArray(data)) throw new Error();
      if (active) setStock(data.filter(product => isDevice(product.category)).map(product => ({ ...product, devices: (product.devices || []).filter(item => ['Free', 'Returned'].includes(item.status)) })).filter(product => product.devices.length));
    }).catch(() => { if (active) setError('Unable to load available devices. Please try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [partnerId, canAssign, refresh]);
  const makers = [...new Set(stock.map(product => product.maker))].sort();
  const products = stock.filter(product => product.maker === maker);
  const product = products.find(item => item._id === productId), device = product?.devices.find(item => item.serialNumber === serial);
  const visibleDevices = (product?.devices || []).filter(item => `${item.serialNumber} ${item.macAddress}`.toLowerCase().includes(search.toLowerCase()));
  const save = async event => {
    event.preventDefault();
    if (busy || success || !canAssign || !device) return;
    if (!subscriber || !partnerId) { setError('Select a subscriber before assigning a device.'); return; }
    const charge = Number(amount);
    if (!Number.isFinite(charge) || charge < 0) { setError('Enter an amount of zero or more.'); return; }
    setBusy(true); setError('');
    try {
      await API.post('/subscriber/inventory', { itemModel: product.model, itemCategory: product.category, itemMaker: product.maker, serialNumber: device.serialNumber, macAddress: device.macAddress, amount: charge, remarks: remarks.trim(), subscriber, partnerId, assignedBy: localStorage.getItem('contact'), assignedAt: new Date().toISOString(), date: new Date().toISOString(), status: 'Active', length: 1 });
      setSuccess(true); setStock(previous => previous.map(item => ({ ...item, devices: item.devices.filter(row => row.serialNumber !== serial) })));
    } catch (e) { setError(apiError(e)); } finally { setBusy(false); }
  };
  if (!canAssign) return <div className="inv-alert inv-alert-error" role="alert">You do not have permission to assign devices.</div>;
  return <section className="inv-assignment">
    <div className="inv-assignment-intro"><span className="inv-metric-icon"><Package size={24}/></span><div><h2>Assign a device</h2><p>Choose available stock and review the charge before assigning it.</p></div></div>
    {error && <div className="inv-alert inv-alert-error" role="alert">{error}<button type="button" className="inv-button" disabled={busy || loading} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={14}/> Retry loading stock</button></div>}
    {success ? <div className="inv-assignment-success" role="status"><CheckCircle2 size={42}/><h3>Device assigned</h3><p>The device is now listed in the subscriber’s inventory.</p><Link className="inv-button inv-button-primary" to="/dashboard/subscriber/inventory">View assigned devices</Link></div> : <form onSubmit={save}><fieldset disabled={busy}>
      <div className="inv-assignment-layout"><div className="inv-assignment-fields">
        <div className="inv-section-title"><h3><span className="inv-step">1</span> Choose your stock</h3></div>
        <div className="inv-form-grid"><label>Manufacturer<select required value={maker} disabled={loading} onChange={e => { setMaker(e.target.value); setProductId(''); setSerial(''); setError(''); }}><option value="">{loading ? 'Loading stock…' : 'Select manufacturer'}</option>{makers.map(name => <option key={name} value={name}>{name}</option>)}</select></label><label>Product<select required value={productId} disabled={!maker || loading} onChange={e => { setProductId(e.target.value); setSerial(''); setSearch(''); }}><option value="">{loading ? 'Loading stock…' : 'Select product'}</option>{products.map(item => <option key={item._id} value={item._id}>{item.category} · {item.model} ({item.devices.length} available)</option>)}</select></label></div>
        {!loading && !stock.length && !error && <div className="inv-assignment-hint">No devices are currently available. Add stock in Inventory, then refresh this list.</div>}
        {maker && !loading && !products.length && !error && <div className="inv-assignment-hint">No available devices for this manufacturer. Choose another manufacturer or add stock in Inventory.</div>}
        {product && <><label className="inv-search"><Search size={17}/><input aria-label="Search available devices" placeholder="Search serial or MAC address" value={search} onChange={e => setSearch(e.target.value)}/></label><div className="inv-assignment-devices" role="radiogroup" aria-label="Available devices">{visibleDevices.slice(0, 50).map(item => <label key={item._id || item.serialNumber} className={`inv-device-choice ${serial === item.serialNumber ? 'is-selected' : ''}`}><input type="radio" name="assignment-device" required checked={serial === item.serialNumber} onChange={() => setSerial(item.serialNumber)}/><span><strong>{item.serialNumber}</strong><small>{item.macAddress}</small></span><span className="inv-status inv-status-free">Available</span></label>)}{!visibleDevices.length && <p>No devices match this search.</p>}{visibleDevices.length > 50 && <p>Showing the first 50 devices. Search a serial or MAC to narrow the list.</p>}</div></>}
        <div className="inv-section-title"><h3><span className="inv-step">2</span> Charge & notes</h3></div><div className="inv-form-grid"><label>Device charge (₹)<input required type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}/></label></div><label>Notes (optional)<textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Installation details or notes"/></label>
      </div><aside className="inv-assignment-summary"><span className="inv-eyebrow">ASSIGNMENT SUMMARY</span><h3>{product ? `${product.maker} ${product.model}` : 'Choose a device'}</h3><dl><dt>Category</dt><dd>{product?.category || '—'}</dd><dt>Serial number</dt><dd>{device?.serialNumber || '—'}</dd><dt>MAC address</dt><dd>{device?.macAddress || '—'}</dd></dl><div className="inv-assignment-charge"><span>Charge to subscriber</span><strong>₹{Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></div><p>This amount will be added to the subscriber’s balance. Enter ₹0 for no charge.</p></aside></div>
      <div className="inv-assignment-footer"><button type="button" className="inv-button" onClick={() => navigate(-1)}><ArrowLeft size={15}/> Cancel</button><button className="inv-button inv-button-primary" disabled={busy || loading || !device}>{busy ? 'Assigning…' : 'Assign device'}</button></div>
    </fieldset></form>}
  </section>;
}
