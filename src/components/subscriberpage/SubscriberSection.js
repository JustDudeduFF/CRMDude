import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import './SubscriberWorkspace.css';

export function SectionAction({ to, children, secondary = false, className = '', ...props }) {
  const classes = `sub-button ${secondary ? 'sub-button-secondary' : 'sub-button-primary'} ${className}`;
  return to ? <Link to={to} className={classes} {...props}>{children}</Link> : <button type="button" className={classes} {...props}>{children}</button>;
}
export default function SubscriberSection({ title, description, icon: Icon, actions, backTo, children }) {
  return <section className="sub-section" aria-label={title}>
    <header className="sub-section-header"><div className="sub-section-identity">{backTo && <Link to={backTo} className="sub-back-button" aria-label="Back to list"><ArrowLeft size={18}/></Link>}<span className="sub-section-icon">{Icon && <Icon size={22}/>}</span><div><span className="sub-section-eyebrow">SUBSCRIBER WORKSPACE</span><h2>{title}</h2><p>{description}</p></div></div>{actions && <div className="sub-section-actions">{actions}</div>}</header>
    <div className="sub-section-body">{children}</div>
  </section>;
}
export function useRecordView(input, { statusKey = 'status', pageSize = 10 } = {}) {
  const [search, setSearch] = useState(''), [status, setStatus] = useState('all'), [page, setPage] = useState(1);
  const records = useMemo(() => Array.isArray(input) ? input : Object.values(input || {}), [input]);
  const statuses = useMemo(() => [...new Set(records.map(record => String(record[statusKey] || '')).filter(Boolean))].sort(), [records, statusKey]);
  const filtered = useMemo(() => records.filter(record => JSON.stringify(record).toLowerCase().includes(search.trim().toLowerCase()) && (status === 'all' || String(record[statusKey]) === status)), [records, search, status, statusKey]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)), currentPage = Math.min(page, pages);
  return { statusKey, search, setSearch: value => { setSearch(value); setPage(1); }, status, setStatus: value => { setStatus(value); setPage(1); }, statuses, records: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), filtered, total: records.length, count: filtered.length, page: currentPage, pages, setPage, start: (currentPage - 1) * pageSize };
}
export function exportRecords(records, filename) {
  const keys = [...new Set(records.flatMap(record => Object.keys(record)))].filter(key => !['_id', '__v'].includes(key));
  const cell = value => {
    let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (typeof value === 'string' && /^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [keys.map(cell).join(','), ...records.map(record => keys.map(key => cell(record[key])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = `${filename}.csv`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
}
export function RecordToolbar({ view, label = 'records', filename = 'subscriber-records', loading = false, exportDisabled = false, onRefresh }) {
  return <div className="sub-record-toolbar"><label className="sub-record-search"><Search size={17}/><input type="search" aria-label={`Search ${label}`} placeholder={`Search ${label}…`} value={view.search} onChange={event => view.setSearch(event.target.value)}/></label><div className="sub-record-controls">{view.statuses.length > 0 && <select aria-label={`Filter ${label}`} value={view.status} onChange={event => view.setStatus(event.target.value)}><option value="all">{view.statusKey === "status" ? "All statuses" : view.statusKey === "source" ? "All sources" : "All types"}</option>{view.statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>}{onRefresh && <button className="sub-button sub-button-secondary" disabled={loading} onClick={onRefresh} aria-label={`Refresh ${label}`}><RefreshCw size={15}/></button>}<button className="sub-button sub-button-secondary" disabled={loading || exportDisabled || !view.count} onClick={() => exportRecords(view.filtered, filename)}><Download size={15}/><span>Export CSV</span></button></div></div>;
}
export function RecordFooter({ view, label = 'records' }) {
  return <footer className="sub-record-footer"><span>{view.count ? `${view.start + 1}–${view.start + view.records.length}` : '0'} of {view.count} {label}{view.count !== view.total && ` (${view.total} total)`}</span><div><button className="sub-page-button" disabled={view.page <= 1} onClick={() => view.setPage(view.page - 1)} aria-label={`Previous ${label} page`}><ChevronLeft size={16}/></button><span>Page {view.page} of {view.pages}</span><button className="sub-page-button" disabled={view.page >= view.pages} onClick={() => view.setPage(view.page + 1)} aria-label={`Next ${label} page`}><ChevronRight size={16}/></button></div></footer>;
}
export const rupees = value => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export const recordDate = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
