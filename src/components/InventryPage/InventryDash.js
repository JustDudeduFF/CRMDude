import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Package, Plus, Search, RefreshCw, Download, Upload, Pencil, ArrowRight, CheckCircle2, Wrench, Layers, Trash2, History } from 'lucide-react';
import * as XLSX from 'xlsx';
import { API } from '../../FirebaseConfig';
import { usePermissions } from '../PermissionProvider';
import { categories, statuses, isDevice, isCable, available, dateText, today, apiError, validateRows } from './inventoryUtils';
import './Inventory.css';

const blankDevice = () => ({ serialNumber: '', macAddress: '' });
const blankCable = () => ({ drumNumber: '', totalLength: '' });
const Status = ({ value }) => <span className={`inv-status inv-status-${String(value).toLowerCase().replace(/ /g, '-')}`}>{value}</span>;

function StockForm({ mode, product, makers, busy, error, onSave, onClose }) {
  const restock = mode === 'stock', edit = mode === 'edit';
  const [form, setForm] = useState({ category: product?.category || 'ONU', maker: product?.maker || '', model: product?.model || '', source: product?.source || '', stockEnterDate: (!restock && product?.stockEnterDate?.slice(0, 10)) || today(), quantity: restock ? '' : product?.quantity || '', remarks: '' });
  const [rows, setRows] = useState([isCable(product?.category) ? blankCable() : blankDevice()]);
  const [localError, setLocalError] = useState('');
  const cable = isCable(form.category), device = isDevice(form.category);
  const change = (key, value) => setForm(previous => ({ ...previous, [key]: value }));
  const changeRow = (index, key, value) => setRows(previous => previous.map((row, i) => i === index ? { ...row, [key]: value } : row));
  const submit = event => {
    event.preventDefault(); setLocalError('');
    try {
      const payload = { ...form, maker: form.maker.trim(), model: form.model.trim(), source: form.source.trim(), performedBy: localStorage.getItem('contact'), location: 'Main Stock' };
      if (!edit && (device || cable)) payload[cable ? 'cables' : 'devices'] = validateRows(rows, cable);
      if (!device && !cable && !edit) {
        payload.quantity = Number(form.quantity);
        if (!Number.isFinite(payload.quantity) || payload.quantity <= 0 || !Number.isInteger(payload.quantity)) throw new Error('Enter a whole quantity greater than zero.');
      }
      if (edit) delete payload.quantity;
      onSave(payload);
    } catch (e) { setLocalError(e.message); }
  };
  const importRows = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setLocalError('');
    try {
      const book = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const records = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { defval: '' });
      const parsed = validateRows(records.map(row => ({ serialNumber: row['Serial Number'] ?? row.serialNumber ?? row.serial_number, macAddress: row['MAC Address'] ?? row.macAddress ?? row.mac_address })));
      setRows(parsed);
    } catch (e) { setLocalError(e.message || 'Unable to read this spreadsheet.'); }
    event.target.value = '';
  };
  const template = () => {
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet([{ 'Serial Number': 'SN-001', 'MAC Address': '00:1A:2B:3C:4D:5E' }]), 'Devices'); XLSX.writeFile(book, 'device-template.xlsx');
  };
  return <form className="inv-form" onSubmit={submit}>
    <Modal.Body>
      {(localError || error) && <div className="inv-alert inv-alert-error" role="alert">{localError || error}</div>}
      <fieldset disabled={busy}>
        {!restock && <div className="inv-form-grid">
          <label>Category<select value={form.category} disabled={edit} onChange={e => { change('category', e.target.value); setRows([isCable(e.target.value) ? blankCable() : blankDevice()]); }}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
          <label>Manufacturer<input required list="inv-makers" value={form.maker} onChange={e => change('maker', e.target.value)}/><datalist id="inv-makers">{makers.map(maker => <option key={maker._id || maker.name} value={maker.name}/>)}</datalist></label>
          <label>Model / product name<input required value={form.model} onChange={e => change('model', e.target.value)} placeholder="e.g. HG8145V5"/></label>
          <label>Supplier / source<input required value={form.source} onChange={e => change('source', e.target.value)} placeholder="e.g. Local distributor"/></label>
        </div>}
        <div className="inv-form-grid"><label>Stock date<input required type="date" value={form.stockEnterDate} onChange={e => change('stockEnterDate', e.target.value)}/></label>{!device && !cable && !edit && <label>Quantity<input required type="number" min="1" step="1" value={form.quantity} onChange={e => change('quantity', e.target.value)}/></label>}</div>
        {!edit && (device || cable) && <section className="inv-entry-section"><div className="inv-section-title"><div><h3>{cable ? 'Cable drums' : 'Device details'}</h3><p>{cable ? 'Enter each drum’s full length in metres.' : `${rows.length} ${rows.length === 1 ? 'device' : 'devices'} · Add rows or import a spreadsheet.`}</p></div>{device && <div className="inv-actions"><button type="button" className="inv-button" onClick={template}><Download size={14}/> Template</button><label className="inv-button inv-file"><Upload size={14}/> Import Excel<input type="file" accept=".xlsx,.xls" aria-label="Import devices from Excel" onChange={importRows}/></label></div>}</div>
          <div className="inv-entry-rows">{rows.map((row, index) => <div className="inv-entry-row" key={index}><span className="inv-row-number">{index + 1}</span>{cable ? <><label>Drum number<input required aria-label={`Drum number ${index + 1}`} value={row.drumNumber} onChange={e => changeRow(index, 'drumNumber', e.target.value)}/></label><label>Length (m)<input required type="number" min="0.01" step="any" aria-label={`Drum length ${index + 1}`} value={row.totalLength} onChange={e => changeRow(index, 'totalLength', e.target.value)}/></label></> : <><label>Serial number<input required aria-label={`Serial number ${index + 1}`} value={row.serialNumber} onChange={e => changeRow(index, 'serialNumber', e.target.value)}/></label><label>MAC address<input required placeholder="00:1A:2B:3C:4D:5E" aria-label={`MAC address ${index + 1}`} value={row.macAddress} onChange={e => changeRow(index, 'macAddress', e.target.value)}/></label></>}<button type="button" className="inv-icon-button" disabled={rows.length === 1} aria-label={`Remove row ${index + 1}`} onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}><Trash2 size={16}/></button></div>)}</div>
          <button type="button" className="inv-button inv-add-row" onClick={() => setRows(previous => [...previous, cable ? blankCable() : blankDevice()])}><Plus size={15}/> Add {cable ? 'drum' : 'device'}</button>
        </section>}
        {!edit && <label>Notes (optional)<textarea rows={2} value={form.remarks} onChange={e => change('remarks', e.target.value)} placeholder="Delivery details or stock notes"/></label>}
      </fieldset>
    </Modal.Body><Modal.Footer><button type="button" className="inv-button" disabled={busy} onClick={onClose}>Cancel</button><button className="inv-button inv-button-primary" disabled={busy}>{busy ? 'Saving…' : edit ? 'Save changes' : restock ? 'Add stock' : 'Create product'}</button></Modal.Footer>
  </form>;
}

function ProductDetails({ product, canEdit, canAdd, busy, onUpdate, onEdit, onRestock }) {
  const [tab, setTab] = useState('items'), [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [editing, setEditing] = useState(null), [draft, setDraft] = useState({}), [error, setError] = useState(''), [visibleCount, setVisibleCount] = useState(30);
  const cable = isCable(product.category), device = isDevice(product.category);
  const items = cable ? product.cables || [] : product.devices || [];
  const filtered = items.map((item, index) => ({ ...item, originalIndex: index })).filter(item => [item.serialNumber, item.macAddress, item.drumNumber].join(' ').toLowerCase().includes(search.toLowerCase()) && (status === 'all' || item.status === status));
  const history = [...(product.stockHistory || []), ...(product.devices || []).flatMap(item => (item.history || []).map(entry => ({ ...entry, identifier: item.serialNumber }))), ...(product.cables || []).flatMap(item => (item.cableHistory || []).map(entry => ({ ...entry, identifier: item.drumNumber })))].sort((a, b) => new Date(b.date) - new Date(a.date));
  useEffect(() => { setVisibleCount(30); }, [search, status]);
  const saveItem = async event => {
    event.preventDefault(); setError('');
    try {
      if (cable) {
        if (!draft.drumNumber.trim() || Number(draft.availableLength) < 0 || Number(draft.availableLength) > Number(draft.totalLength)) throw new Error('Available length must be between zero and the total drum length.');
      } else {
        validateRows([draft]);
      }
      await onUpdate(product, editing, draft, cable); setEditing(null);
    } catch (e) { setError(e.message || apiError(e)); }
  };
  return <>
    <div className="inv-detail-summary"><span className="inv-category">{product.category}</span><h3>{product.maker} {product.model}</h3><p>{available(product)} {cable ? 'metres available' : 'available'} · {product.source} · {dateText(product.stockEnterDate)}</p><div className="inv-actions">{canAdd && <button className="inv-button inv-button-primary" disabled={busy} onClick={onRestock}><Plus size={15}/> Add stock</button>}{canEdit && <button className="inv-button" disabled={busy} onClick={onEdit}><Pencil size={15}/> Edit product</button>}</div></div>
    <div className="inv-tabs">{['items', 'history'].map(key => <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{key === 'items' ? 'Stock details' : 'Activity history'}</button>)}</div>
    {tab === 'history' ? <div className="inv-history">{history.length ? history.map((entry, index) => <article key={index}><span className="inv-history-icon"><History size={15}/></span><div><strong>{entry.action}{entry.identifier ? ` · ${entry.identifier}` : ''}</strong><p>{entry.remarks || entry.location || entry.toLocation || 'Stock updated'}</p><small>{dateText(entry.date)}{entry.performedBy ? ` · ${entry.performedBy}` : ''}</small></div></article>) : <div className="inv-empty"><History/><h3>No activity yet</h3><p>Stock changes will appear here.</p></div>}</div> : <>
      {device || cable ? <><div className="inv-detail-filters"><label className="inv-search"><Search size={17}/><input aria-label="Search stock items" placeholder={cable ? 'Search drum number' : 'Search serial or MAC'} value={search} onChange={e => setSearch(e.target.value)}/></label>{device && <select aria-label="Device status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(value => <option key={value}>{value}</option>)}</select>}</div>
      {error && <div role="alert" className="inv-alert inv-alert-error">{error}</div>}
      <div className="inv-item-list">{filtered.slice(0, visibleCount).map(item => <article className="inv-item" key={item._id || item.originalIndex}>{editing === item.originalIndex ? <form onSubmit={saveItem}><fieldset disabled={busy}><div className="inv-form-grid">{cable ? <><label>Drum number<input required value={draft.drumNumber} onChange={e => setDraft({ ...draft, drumNumber: e.target.value })}/></label><label>Total length (m)<input required type="number" min="0.01" step="any" value={draft.totalLength} onChange={e => setDraft({ ...draft, totalLength: e.target.value })}/></label><label>Available length (m)<input required type="number" min="0" step="any" max={draft.totalLength} value={draft.availableLength} onChange={e => setDraft({ ...draft, availableLength: e.target.value })}/></label></> : <><label>Serial number<input required value={draft.serialNumber} onChange={e => setDraft({ ...draft, serialNumber: e.target.value })}/></label><label>MAC address<input required value={draft.macAddress} onChange={e => setDraft({ ...draft, macAddress: e.target.value })}/></label><label>Status<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}>{statuses.filter(value => value !== 'Installed' || draft.status === 'Installed').map(value => <option key={value}>{value}</option>)}</select></label></>}</div><div className="inv-actions"><button type="button" className="inv-button" onClick={() => setEditing(null)}>Cancel</button><button className="inv-button inv-button-primary">{busy ? 'Saving…' : 'Save item'}</button></div></fieldset></form> : <><div><strong>{item.serialNumber || item.drumNumber}</strong><p>{cable ? `${item.availableLength} m remaining of ${item.totalLength} m` : item.macAddress}</p>{cable && <progress aria-label={`Remaining length ${item.drumNumber}`} max={Number(item.totalLength) || 1} value={Number(item.availableLength) || 0}/>}</div><div className="inv-actions">{device && <Status value={item.status || 'Free'}/>} {canEdit && <button className="inv-icon-button" disabled={busy || item.status === 'Installed'} title={item.status === 'Installed' ? 'Manage installed devices from the subscriber page' : 'Edit stock item'} aria-label={`Edit ${item.serialNumber || item.drumNumber}`} onClick={() => { setEditing(item.originalIndex); setDraft(item); setError(''); }}><Pencil size={16}/></button>}</div></>}</article>)}{filtered.length > visibleCount && <button className="inv-button" onClick={() => setVisibleCount(count => count + 30)}>Show more stock items ({filtered.length - visibleCount} remaining)</button>}{!filtered.length && <div className="inv-empty"><Search/><h3>No matching stock</h3><p>Try another serial number, drum number or status.</p></div>}</div></> : <div className="inv-simple-stock"><strong>{product.quantity || 0}</strong><p>units in stock</p></div>}
    </>}
  </>;
}

export default function InventryDash() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('VIEW_INVENTORY'), canAdd = hasPermission('ADD_DEVICE'), canEdit = hasPermission('CHANGE_DEVICE_STATUS');
  const partnerId = localStorage.getItem('partnerId');
  const [products, setProducts] = useState([]), [makers, setMakers] = useState([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState(''), [message, setMessage] = useState(''), [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState(''), [category, setCategory] = useState('all'), [availability, setAvailability] = useState('all'), [sort, setSort] = useState('newest'), [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null), [modal, setModal] = useState(null), [busy, setBusy] = useState(false), [saveError, setSaveError] = useState('');
  const selected = products.find(product => product._id === selectedId);
  useEffect(() => {
    if (!canView) { setLoading(false); return; }
    let active = true; setLoading(true); setLoadError('');
    if (!partnerId) { setLoadError('Your workspace is unavailable. Please sign in again.'); setLoading(false); return; }
    API.get('/inventory/', { params: { partnerId } }).then(({ data }) => { if (!Array.isArray(data)) throw new Error(); if (active) setProducts(data); }).catch(() => { if (active) setLoadError('Unable to load inventory. Please try again.'); }).finally(() => { if (active) setLoading(false); });
    API.get('/master/devicemaker', { params: { partnerId } }).then(({ data }) => { if (active && Array.isArray(data)) setMakers(data); }).catch(() => {});
    return () => { active = false; };
  }, [partnerId, refresh, canView]);
  useEffect(() => { setPage(1); }, [search, category, availability, sort]);
  const filtered = useMemo(() => products.filter(product => {
    const haystack = [product.category, product.maker, product.model, product.source, ...(product.devices || []).flatMap(device => [device.serialNumber, device.macAddress]), ...(product.cables || []).map(cable => cable.drumNumber)].join(' ').toLowerCase();
    return haystack.includes(search.toLowerCase().trim()) && (category === 'all' || product.category === category) && (availability === 'all' || (availability === 'available' ? available(product) > 0 : available(product) === 0));
  }).sort((a, b) => sort === 'name' ? `${a.maker} ${a.model}`.localeCompare(`${b.maker} ${b.model}`) : new Date(b.stockEnterDate || 0) - new Date(a.stockEnterDate || 0)), [products, search, category, availability, sort]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10)), currentPage = Math.min(page, pageCount);
  const resetFilters = () => { setSearch(''); setCategory('all'); setAvailability('all'); };
  const replaceProduct = product => setProducts(previous => previous.some(item => item._id === product._id) ? previous.map(item => item._id === product._id ? product : item) : [...previous, product]);
  const open = (mode, product) => { setModal({ mode, product }); setSaveError(''); };
  const save = async payload => {
    if (busy) return; setBusy(true); setSaveError('');
    try {
      if (payload.devices) {
        const existing = products.flatMap(product => product.devices || []);
        if (payload.devices.some(device => existing.some(item => String(item.serialNumber).toLowerCase() === device.serialNumber.toLowerCase() || String(item.macAddress).replace(/-/g, ':').toUpperCase() === device.macAddress))) throw new Error('This serial number or MAC address is already in stock.');
      }
      if (payload.cables && modal.mode === 'stock' && payload.cables.some(cable => (modal.product.cables || []).some(item => item.drumNumber.toLowerCase() === cable.drumNumber.toLowerCase()))) throw new Error('This drum number is already in stock.');
      const response = modal.mode === 'add' ? await API.post('/inventory/add', { ...payload, partnerId }) : await API.put(`/inventory/${modal.mode === 'stock' ? 'add-stock' : 'update'}/${modal.product._id}`, payload);
      replaceProduct(response.data.product || response.data); setModal(null); setMessage(modal.mode === 'stock' ? 'Stock added successfully.' : 'Product saved successfully.');
    } catch (e) { setSaveError(e.response ? apiError(e) : e.message || apiError(e)); } finally { setBusy(false); }
  };
  const updateItem = async (product, index, payload, cable) => {
    if (busy) return; setBusy(true);
    try {
      const { data } = await API.put(`/inventory/${product._id}/${cable ? 'cable' : 'device'}/${index}`, { ...payload, performedBy: localStorage.getItem('contact'), location: 'Main Stock' });
      replaceProduct(data.product); setMessage('Stock item updated.');
    } catch (e) { throw new Error(apiError(e)); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setSaveError('');
    try { await API.delete(`/inventory/delete/${modal.product._id}`); setProducts(previous => previous.filter(product => product._id !== modal.product._id)); setModal(null); setSelectedId(null); setMessage('Product deleted.'); }
    catch (e) { setSaveError(e.response ? apiError(e) : e.message || apiError(e)); } finally { setBusy(false); }
  };
  const exportStock = () => {
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(filtered.map(product => ({ Category: product.category, Manufacturer: product.maker, Model: product.model, Available: available(product), Unit: isCable(product.category) ? 'metres' : 'units', 'Stock date': String(product.stockEnterDate || '').slice(0, 10), Source: product.source }))), 'Stock'); XLSX.writeFile(book, `inventory-${today()}.xlsx`);
  };
  if (!canView) return <main className="inv-workspace"><div className="inv-alert inv-alert-error" role="alert">You do not have access to inventory.</div></main>;
  return <main className="inv-workspace">
    <header className="inv-heading"><div><span className="inv-eyebrow">WORKSPACE / INVENTORY</span><h1>Inventory</h1><p>Know what’s in stock. Find the right item. Keep work moving.</p></div><div className="inv-actions"><button className="inv-button" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16} className={loading ? 'inv-spin' : ''}/> Refresh</button><button className="inv-button" disabled={loading || !!loadError || !filtered.length} onClick={exportStock}><Download size={16}/> Export</button>{canAdd && <button className="inv-button inv-button-primary" onClick={() => open('add')}><Plus size={17}/> Add product</button>}</div></header>
    {message && <div role="status" className="inv-alert inv-alert-success">{message}<button aria-label="Dismiss notification" onClick={() => setMessage('')}>×</button></div>}
    <section className="inv-metrics" aria-label="Inventory overview">{[[Package, 'Product types', products.length, 'Across your warehouse'], [CheckCircle2, 'Available devices', products.filter(product => isDevice(product.category)).reduce((sum, product) => sum + available(product), 0), 'Ready for installation'], [Wrench, 'Under repair', products.flatMap(product => product.devices || []).filter(device => device.status === 'On Repair').length, 'Devices being serviced'], [Layers, 'Cable available', `${products.filter(product => isCable(product.category)).reduce((sum, product) => sum + available(product), 0).toLocaleString('en-IN')} m`, 'Remaining across drums']].map(([Icon, label, value, hint]) => <article key={label}><span className="inv-metric-icon"><Icon size={21}/></span><div><span>{label}</span><strong>{loading || loadError ? '—' : value}</strong><small>{hint}</small></div></article>)}</section>
    <section className="inv-panel"><div className="inv-toolbar"><label className="inv-search"><Search size={18}/><input aria-label="Search inventory" placeholder="Search product, serial, MAC or drum…" value={search} onChange={e => setSearch(e.target.value)}/></label><select aria-label="Category filter" value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value}>{value}</option>)}</select><select aria-label="Availability filter" value={availability} onChange={e => setAvailability(e.target.value)}><option value="all">Any availability</option><option value="available">In stock</option><option value="empty">Out of stock</option></select><select aria-label="Sort inventory" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="name">Name A–Z</option></select></div>
      {loading ? <div className="inv-empty" role="status"><RefreshCw className="inv-spin"/><h3>Loading inventory…</h3></div> : loadError ? <div className="inv-empty" role="alert"><Package/><h3>Inventory is unavailable</h3><p>{loadError}</p><button className="inv-button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> : !filtered.length ? <div className="inv-empty"><Package size={36}/><h3>{products.length ? 'No matching products' : 'Your inventory starts here'}</h3><p>{products.length ? 'Try a different search or clear your filters.' : 'Add your first product, then enter devices or cable drums.'}</p>{products.length ? <button className="inv-button" onClick={resetFilters}>Clear filters</button> : canAdd && <button className="inv-button inv-button-primary" onClick={() => open('add')}><Plus size={16}/> Add first product</button>}</div> : <>
      <div className="inv-table-scroll"><table className="inv-table"><thead><tr><th>Product</th><th>Category</th><th>Available stock</th><th>Stock date</th><th>Supplier</th><th>Actions</th></tr></thead><tbody>{filtered.slice((currentPage - 1) * 10, currentPage * 10).map(product => <tr key={product._id}><td><button className="inv-product-link" onClick={() => setSelectedId(product._id)}><span className="inv-product-icon"><Package size={19}/></span><span><strong>{product.maker} {product.model}</strong><small>{isDevice(product.category) ? `${product.devices?.length || 0} total devices` : isCable(product.category) ? `${product.cables?.length || 0} cable drums` : 'General stock'}</small></span></button></td><td><span className="inv-category">{product.category}</span></td><td><span className={available(product) ? 'inv-stock-count' : 'inv-stock-empty'}>{available(product)} {isCable(product.category) ? 'm' : 'units'}</span><small className="inv-stock-hint">{available(product) ? 'Available' : 'Out of stock'}</small></td><td>{dateText(product.stockEnterDate)}</td><td>{product.source}</td><td><div className="inv-actions"><button className="inv-button inv-button-small" aria-label={`View ${product.model}`} onClick={() => setSelectedId(product._id)}>Details <ArrowRight size={14}/></button>{canAdd && <button className="inv-icon-button" aria-label={`Add stock to ${product.model}`} onClick={() => open('stock', product)}><Plus size={17}/></button>}{canEdit && <button className="inv-icon-button inv-danger" aria-label={`Delete ${product.model}`} disabled={(product.devices || []).some(device => device.status === 'Installed')} onClick={() => open('delete', product)}><Trash2 size={16}/></button>}</div></td></tr>)}</tbody></table></div>
      <footer className="inv-pagination"><span>{(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, filtered.length)} of {filtered.length} products</span><div className="inv-actions"><button className="inv-button inv-button-small" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {pageCount}</span><button className="inv-button inv-button-small" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></div></footer></>}
    </section>
    <Modal show={!!selected && !modal} onHide={() => { if (!busy) setSelectedId(null); }} size="lg" centered scrollable contentClassName="inv-modal"><Modal.Header closeButton={!busy}><Modal.Title>Product details</Modal.Title></Modal.Header><Modal.Body>{selected && <ProductDetails key={selected._id} product={selected} canEdit={canEdit} canAdd={canAdd} busy={busy} onUpdate={updateItem} onEdit={() => open('edit', selected)} onRestock={() => open('stock', selected)}/>}</Modal.Body></Modal>
    <Modal show={!!modal} onHide={() => { if (!busy) setModal(null); }} size={modal?.mode === 'delete' ? undefined : 'lg'} centered scrollable backdrop={busy ? 'static' : true} keyboard={!busy} contentClassName="inv-modal"><Modal.Header closeButton={!busy}><Modal.Title>{modal?.mode === 'add' ? 'Add a product' : modal?.mode === 'stock' ? `Add stock · ${modal.product.model}` : modal?.mode === 'delete' ? 'Delete product?' : 'Edit product'}</Modal.Title></Modal.Header>{modal?.mode === 'delete' ? <><Modal.Body>{saveError && <div className="inv-alert inv-alert-error" role="alert">{saveError}</div>}Delete <strong>{modal.product.maker} {modal.product.model}</strong> and its stock history? This cannot be undone.</Modal.Body><Modal.Footer><button className="inv-button" disabled={busy} onClick={() => setModal(null)}>Keep product</button><button className="inv-button inv-button-delete" disabled={busy} onClick={remove}>{busy ? 'Deleting…' : 'Delete product'}</button></Modal.Footer></> : modal && <StockForm key={`${modal.mode}-${modal.product?._id || 'new'}`} mode={modal.mode} product={modal.product} makers={makers} busy={busy} error={saveError} onSave={save} onClose={() => setModal(null)}/>}</Modal>
  </main>;
}
