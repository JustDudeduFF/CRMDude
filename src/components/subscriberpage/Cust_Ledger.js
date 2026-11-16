import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { API } from '../../FirebaseConfig';
import SubscriberSection, { useRecordView, RecordToolbar, RecordFooter, rupees, recordDate } from './SubscriberSection';

// Compute balances over the complete chronological statement before filtering or paging.
export function ledgerStatement(input) {
  let balance = 0;
  return (Array.isArray(input) ? input : Object.values(input || {})).map((entry, order) => ({ ...entry, order, debitamount: Number(entry.debitamount) || 0, creditamount: Number(entry.creditamount) || 0 })).sort((a, b) => {
    const date = value => {
      const match = String(value || '').match(/^(\d{2})-(\d{2})-(\d{4})$/);
      const parsed = Date.parse(match ? `${match[3]}-${match[2]}-${match[1]}` : value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    return date(a.date) - date(b.date) || a.order - b.order;
  }).map(({ order, ...entry }) => { balance += entry.debitamount - entry.creditamount; return { ...entry, balance }; });
}
function displayDate(value) {
  const match = String(value || '').match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return recordDate(match ? `${match[3]}-${match[2]}-${match[1]}` : value);
}
export default function Cust_Ledger() {
  const userid = localStorage.getItem('susbsUserid');
  const [records, setRecords] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    if (!userid) { setError('Select a subscriber to view their ledger.'); setLoading(false); return; }
    API.get(`/subscriber/ledger?id=${userid}`).then(({ data }) => {
      if (!data || typeof data !== 'object') throw new Error();
      if (active) setRecords(ledgerStatement(data));
    }).catch(() => { if (active) setError('Unable to load this statement. Please refresh to try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userid, refresh]);
  const totals = useMemo(() => records.reduce((sum, row) => ({ debit: sum.debit + row.debitamount, credit: sum.credit + row.creditamount }), { debit: 0, credit: 0 }), [records]);
  const view = useRecordView(records, { statusKey: 'type' });
  const balance = totals.debit - totals.credit;
  return <SubscriberSection title="Ledger" description="A clear statement of charges, credits and running balance." icon={BookOpen}>
    <div className="sub-summary-metrics"><article><span><ArrowUpRight size={13}/> Total charges</span><strong>{loading || error ? '—' : rupees(totals.debit)}</strong><small>Debit entries</small></article><article><span><ArrowDownLeft size={13}/> Total credits</span><strong>{loading || error ? '—' : rupees(totals.credit)}</strong><small>Payments and adjustments</small></article><article><span>Closing balance</span><strong>{loading || error ? '—' : `${rupees(Math.abs(balance))}${balance > 0 ? ' Dr' : balance < 0 ? ' Cr' : ''}`}</strong><small>Based on the full statement</small></article></div>
    {error && <div role="alert" className="sub-record-alert">{error}</div>}
    <div className="sub-record-panel"><RecordToolbar view={view} label="ledger entries" filename="subscriber-ledger" loading={loading} exportDisabled={!!error} onRefresh={() => setRefresh(value => value + 1)}/><div className="table-responsive"><table><thead><tr><th>Date</th><th>Type</th><th>Particulars</th><th className="text-end">Debit</th><th className="text-end">Credit</th><th className="text-end">Balance</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="sub-record-empty" role="status">Loading statement…</td></tr> : error ? <tr><td colSpan={6} className="sub-record-empty">Refresh to reload the statement.</td></tr> : view.records.length ? view.records.map((row, index) => <tr key={row._id || row.ledgerKey || index}><td className="text-nowrap">{displayDate(row.date)}</td><td><span className="type-badge">{row.type || 'Entry'}</span></td><td className="particular-cell">{row.particular || '—'}</td><td className="text-end text-danger">{row.debitamount ? rupees(row.debitamount) : '—'}</td><td className="text-end text-success">{row.creditamount ? rupees(row.creditamount) : '—'}</td><td className={`text-end fw-semibold ${row.balance > 0 ? 'text-danger' : 'text-success'}`}>{rupees(Math.abs(row.balance))}{row.balance > 0 ? ' Dr' : row.balance < 0 ? ' Cr' : ''}</td></tr>) : <tr><td colSpan={6} className="sub-record-empty">{view.total ? 'No entries match your search.' : 'No transactions recorded for this account.'}</td></tr>}</tbody></table></div><RecordFooter view={view} label="entries"/></div>
  </SubscriberSection>;
}
