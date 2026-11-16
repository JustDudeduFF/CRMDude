import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { Plus, RefreshCw, Search, Phone, MapPin, UserCheck, ArrowRight, Pencil } from 'lucide-react';
import { API } from '../../FirebaseConfig';
import { usePermissions } from '../PermissionProvider';
import './LeadWorkflow.css';

const STATUSES = { in_progress: 'In Progress', confirmed: 'Confirmed', installed: 'Installed', cancelled: 'Cancelled' };
const EMPTY = { name: '', phone: '', alternatePhone: '', email: '', address: '', colony: '', city: '', state: '', pinCode: '', planCode: '', communicatedBy: '', notes: '' };
const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const date = value => { if (!value) return '—'; const d = new Date(value); return Number.isFinite(d.getTime()) ? `${String(d.getDate()).padStart(2, '0')}-${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]}-${d.getFullYear()}` : '—'; };
const errorMessage = error => error.response?.data?.message || error.message || 'Unable to complete lead request.';

export default function LeadDash() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canRead = ['ADD_LEAD','EDIT_LEAD','CONVERT_TO_LEAD','CANCEL_LEAD'].some(hasPermission);
  const [leads, setLeads] = useState([]), [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [status, setStatus] = useState('all'), [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null), [selected, setSelected] = useState(null), [saving, setSaving] = useState(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const current = ++generation.current; setLoading(true); setError('');
    try { const {data} = await API.get('/leads'); if (current === generation.current) setLeads(data); }
    catch (error) { if (current === generation.current) setError(errorMessage(error)); }
    finally { if (current === generation.current) setLoading(false); }
  }, []);
  useEffect(() => { if (canRead) load(); return () => { generation.current++; }; }, [canRead, load]);
  const permit = permission => { if (hasPermission(permission)) return true; window.alert('Permission denied'); return false; };
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter(lead => (status === 'all' || lead.status === status) && (!query || [lead.name,lead.phone,lead.address,lead.communicatedByName,lead.plan?.name].some(value => String(value || '').toLowerCase().includes(query))));
  }, [leads,status,search]);
  const saved = lead => { setLeads(previous => [lead, ...previous.filter(row => row._id !== lead._id)]); setEditor(null); if (selected?._id === lead._id) setSelected(lead); };
  const progress = async lead => {
    if (saving || !permit('CONVERT_TO_LEAD')) return;
    if (lead.status === 'confirmed') { if (permit('ADD_CUSTOMER')) navigate(`/dashboard/adduser?leadId=${encodeURIComponent(lead._id)}`); return; }
    setSaving(true); setError('');
    try { const {data} = await API.patch(`/leads/${encodeURIComponent(lead._id)}/status`, { status: lead.status === 'in_progress' ? 'confirmed' : 'installed' }); setLeads(previous => previous.map(row => row._id === data._id ? data : row)); if (selected?._id === data._id) setSelected(data); }
    catch (error) { setError(errorMessage(error)); }
    finally { setSaving(false); }
  };
  const cancelLead = async lead => {
    if (saving || !permit('CANCEL_LEAD')) return;
    setSaving(true); setError('');
    try { const {data} = await API.patch(`/leads/${encodeURIComponent(lead._id)}/cancel`); setLeads(previous => previous.map(row => row._id === data._id ? data : row)); if (selected?._id === data._id) setSelected(data); }
    catch (error) { setError(errorMessage(error)); }
    finally { setSaving(false); }
  };
  if (!canRead) return <main className="p-4"><div role="alert" className="alert alert-warning">Permission denied. Ask your administrator for lead access.</div></main>;
  return <main className="lead-workflow p-3 p-md-4">
    <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"><div><div className="lead-eyebrow">CUSTOMER ACQUISITION</div><h2 className="mb-1">Lead Generation</h2><p className="text-muted mb-0">Track every conversation from first enquiry to installation.</p></div><div className="d-flex gap-2"><button className="btn btn-outline-secondary d-flex gap-2 align-items-center" disabled={loading} onClick={load}><RefreshCw size={16}/>Refresh</button><button className="btn btn-primary d-flex gap-2 align-items-center" onClick={() => { if (permit('ADD_LEAD')) setEditor({}); }}><Plus size={18}/>Add Lead</button></div></header>
    <div className="row g-3 mb-4">{Object.entries(STATUSES).map(([key,label]) => <div className="col-12 col-sm-6 col-xl-3" key={key}><button className={`lead-stat ${status === key ? 'lead-stat-selected' : ''}`} onClick={() => setStatus(status === key ? 'all' : key)} aria-pressed={status === key}><span className={`lead-status-dot ${key}`}/><span>{label}</span><strong>{leads.filter(lead => lead.status === key).length}</strong></button></div>)}</div>
    <div className="d-flex flex-wrap gap-3 align-items-center mb-4"><div className="lead-search"><Search size={18}/><input aria-label="Search leads" placeholder="Search name, mobile, address or plan" value={search} onChange={event => setSearch(event.target.value)}/></div><select className="form-select lead-status-select" aria-label="Filter lead status" value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses ({leads.length})</option>{Object.entries(STATUSES).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select><span className="text-muted small">{filtered.length} leads</span></div>
    {error && <div role="alert" className="alert alert-danger">{error}</div>}
    {loading ? <p role="status">Loading leads…</p> : <div className="row g-3">{filtered.map(lead => <div className="col-12 col-md-6 col-xl-4" key={lead._id}><article className="lead-card h-100">
      <button className="lead-card-main" onClick={() => setSelected(lead)}><div className="d-flex justify-content-between align-items-start gap-2"><h5>{lead.name}</h5><span className={`lead-status ${lead.status}`}>{STATUSES[lead.status]}</span></div><div className="lead-card-line"><Phone size={15}/>{lead.phone}</div><div className="lead-card-line"><MapPin size={15}/>{lead.address}</div><div className="lead-plan"><strong>{lead.plan?.name || 'Plan not specified'}</strong><span>{money(lead.plan?.amount)}</span></div><div className="lead-card-line small"><UserCheck size={15}/>Communicated by {lead.communicatedByName || '—'}</div><div className="text-muted small mt-2">Created {date(lead.createdAt)}</div></button>
      <footer className="d-flex gap-2 border-top pt-3 mt-3"><button className="btn btn-sm btn-outline-secondary" onClick={() => { if (permit('EDIT_LEAD')) setEditor(lead); }}><Pencil size={14}/> Edit</button>{!['installed','cancelled'].includes(lead.status) && <button className="btn btn-sm btn-primary ms-auto" disabled={saving} onClick={() => progress(lead)}>{lead.status === 'in_progress' ? 'Confirm Lead' : 'Mark Installed'} <ArrowRight size={14}/></button>}{!['installed','cancelled'].includes(lead.status) && <button className="btn btn-sm btn-outline-danger" disabled={saving} onClick={() => cancelLead(lead)}>Cancel Lead</button>}</footer>
    </article></div>)}{!filtered.length && <div className="col-12"><div className="lead-empty">No leads found. Add a lead to start tracking a customer enquiry.</div></div>}</div>}
    <LeadEditor key={editor?._id || (editor ? 'new' : 'closed')} lead={editor} onClose={() => setEditor(null)} onSaved={saved}/>
    <Modal show={!!selected} onHide={() => setSelected(null)} size="lg" centered><Modal.Header closeButton><Modal.Title>Lead Details</Modal.Title></Modal.Header><Modal.Body>{selected && <>
      <div className="d-flex align-items-center justify-content-between mb-3"><h4>{selected.name}</h4><span className={`lead-status ${selected.status}`}>{STATUSES[selected.status]}</span></div>
      <div className="row g-3">{[['Mobile',selected.phone],['Alternate',selected.alternatePhone],['Email',selected.email],['Home address',selected.address],['Colony',selected.colony],['City',selected.city],['State',selected.state],['PIN code',selected.pinCode],['Requested plan',selected.plan?.name],['Plan amount',money(selected.plan?.amount)],['Provider',selected.plan?.provider],['ISP',selected.plan?.isp],['Communicating employee',selected.communicatedByName],['Employee mobile',selected.communicatedByPhone],['Created by',selected.createdByName],['Created',date(selected.createdAt)],['Notes',selected.notes]].map(([label,value]) => <div className="col-12 col-sm-6" key={label}><div className="text-muted small">{label}</div><div className="text-break">{value || '—'}</div></div>)}</div>
      <h6 className="mt-4">Status History</h6>{selected.statusHistory?.map((entry,index) => <div className="border-start ps-3 py-2" key={index}><strong>{STATUSES[entry.to] || entry.to}</strong><div className="text-muted small">{entry.employeeName} · {date(entry.date)}</div></div>)}
    </>}</Modal.Body><Modal.Footer><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button></Modal.Footer></Modal>
  </main>;
}
function LeadEditor({lead,onClose,onSaved}) {
  const [form,setForm] = useState(() => ({...EMPTY,...Object.fromEntries(Object.keys(EMPTY).map(key => [key,lead?.[key] || '']))}));
  const [options,setOptions] = useState(null), [loading,setLoading] = useState(false), [saving,setSaving] = useState(false), [error,setError] = useState(''), [retry,setRetry] = useState(0);
  const inFlight = useRef(false);
  useEffect(() => {
    if (!lead) return;
    let active=true;setLoading(true);setError('');
    API.get('/leads/options').then(({data})=>{if(active){setOptions(data);setForm(previous=>({...previous,communicatedBy:previous.communicatedBy || data.currentEmployeeId}));}}).catch(error=>{if(active)setError(errorMessage(error));}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[lead,retry]);
  const change = event => setForm(previous=>({...previous,[event.target.name]:event.target.value}));
  const submit = async event => {
    event.preventDefault();if(inFlight.current)return;inFlight.current=true;setSaving(true);setError('');
    try { const {data}=lead._id ? await API.put(`/leads/${encodeURIComponent(lead._id)}`,form) : await API.post('/leads',form);onSaved(data); }
    catch(error){setError(errorMessage(error));}finally{inFlight.current=false;setSaving(false);}
  };
  const plans=[...(options?.plans || [])];
  if(lead?.plan && !plans.some(plan=>plan.code===lead.planCode))plans.unshift({code:lead.planCode,planname:lead.plan.name,planamount:lead.plan.amount});
  const employees=[...(options?.employees || [])];
  if(lead?.communicatedBy && !employees.some(employee=>employee._id===lead.communicatedBy))employees.unshift({_id:lead.communicatedBy,FULLNAME:lead.communicatedByName,MOBILE:lead.communicatedByPhone});
  return <Modal show={!!lead} onHide={()=>{if(!saving)onClose();}} size="lg" centered backdrop={saving?'static':true} keyboard={!saving}><form onSubmit={submit}><Modal.Header closeButton={!saving}><Modal.Title>{lead?._id?'Edit Lead':'Add Lead'}</Modal.Title></Modal.Header><Modal.Body>
    <h6 className="mb-3">Customer details</h6><div className="row g-3">{[['name','Customer name',true],['phone','Mobile number',true],['alternatePhone','Alternate number'],['email','Email'],['address','Home address',true],['colony','Colony / area'],['city','City'],['state','State'],['pinCode','PIN code']].map(([key,label,required])=><div className={key==='address'?'col-12':'col-12 col-sm-6'} key={key}><label className="form-label w-100">{label}{required?' *':''}{key==='address'?<textarea className="form-control mt-1" rows={2} name={key} value={form[key]} onChange={change} required disabled={saving}/>:<input className="form-control mt-1" type={key==='email'?'email':key==='phone'||key==='alternatePhone'?'tel':'text'} name={key} value={form[key]} onChange={change} required={!!required} disabled={saving}/>}</label></div>)}</div>
    <h6 className="mt-4 mb-3">Plan and communication</h6>{loading&&<p role="status">Loading plans and employees…</p>}<div className="row g-3"><div className="col-12 col-md-6"><label className="form-label w-100">Requested plan *<select className="form-select mt-1" name="planCode" value={form.planCode} onChange={change} required disabled={loading||saving}><option value="">Select a plan</option>{plans.filter(plan=>plan.code).map(plan=><option key={plan.code} value={plan.code}>{plan.planname} · {money(plan.planamount)}</option>)}</select></label></div><div className="col-12 col-md-6"><label className="form-label w-100">Communicating employee *<select className="form-select mt-1" name="communicatedBy" value={form.communicatedBy} onChange={change} required disabled={loading||saving}><option value="">Select employee</option>{employees.map(employee=><option key={employee._id} value={employee._id}>{employee.FULLNAME} · {employee.MOBILE}</option>)}</select></label></div><div className="col-12"><label className="form-label w-100">Communication notes<textarea className="form-control mt-1" rows={3} name="notes" value={form.notes} onChange={change} disabled={saving}/></label></div></div>
    {error&&<div role="alert" className="alert alert-danger mt-3">{error}</div>}{!options&&!loading&&<button type="button" className="btn btn-outline-secondary" onClick={()=>setRetry(value=>value+1)}>Retry options</button>}
  </Modal.Body><Modal.Footer><button type="button" className="btn btn-secondary" disabled={saving} onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving||loading||!options}>{saving?'Saving…':lead?._id?'Save Lead':'Create Lead'}</button></Modal.Footer></form></Modal>;
}
