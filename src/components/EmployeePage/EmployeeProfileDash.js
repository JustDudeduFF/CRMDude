import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Briefcase, MapPin, Mail, Phone, Calendar, ShieldCheck, CreditCard, CheckCircle2, Clock, FileText, RefreshCw, Pencil, Save } from 'lucide-react';
import { API } from '../../FirebaseConfig';
import { usePermissions } from '../PermissionProvider';
import './EmployeeProfileDash.css';

const tabs = [['overview', 'Overview', User], ['account', 'Bank details', CreditCard], ['attendance', 'My attendance', Calendar], ['permissions', 'Permissions', ShieldCheck]];
const fields = [['FULLNAME', 'Full name', 'text'], ['GMAIL', 'Email address', 'email'], ['ADDRESS', 'Address', 'text']];
const dateLabel = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not provided';
const timeLabel = value => {
  if (!value) return '—';
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
};
const message = (error, fallback) => error.response?.data?.message || fallback;
const Detail = ({ label, value }) => <div className="myprofile-detail"><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>;

export default function EmployeeProfile() {
  const { permissions = [], hasPermission } = usePermissions();
  const [params, setParams] = useSearchParams();
  const activeTab = tabs.some(([key]) => key === params.get('tab')) ? params.get('tab') : 'overview';
  const employeeId = localStorage.getItem('empid');
  const contact = localStorage.getItem('contact');
  const [employee, setEmployee] = useState(null);
  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [tickets, setTickets] = useState(null);
  const [ticketError, setTicketError] = useState('');
  const [month, setMonth] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}`;
  });
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const canViewAttendance = hasPermission('VIEW_ATTENDENCE');
  const canEdit = hasPermission('EDIT_EMP');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    (async () => {
      try {
        if (!employeeId) throw new Error('Your employee account is unavailable. Please sign in again.');
        const { data } = await API.get(`/employees/${encodeURIComponent(employeeId)}`);
        if (!data || typeof data !== 'object' || Array.isArray(data) || !data._id) throw new Error('Unable to read your employee profile.');
        if (active) { setEmployee(data); setDraft(data); }
      } catch (e) { if (active) setError(message(e, e.message || 'Unable to load your profile.')); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [employeeId, refresh]);

  useEffect(() => {
    let active = true;
    setTickets(null); setTicketError('');
    if (!contact) { setTicketError('Ticket activity is unavailable for this account.'); return; }
    API.get(`/employees/${encodeURIComponent(contact)}/myactivecomplaints?month=${new Date().getMonth()}`)
      .then(({ data }) => {
        if (!Array.isArray(data?.complaints)) throw new Error();
        if (active) setTickets(data);
      }).catch(() => { if (active) setTicketError('Ticket activity could not be loaded. Use Refresh to try again.'); });
    return () => { active = false; };
  }, [contact, refresh]);

  useEffect(() => {
    if (activeTab !== 'attendance' || !canViewAttendance) return;
    let active = true;
    setAttendanceLoading(true); setAttendanceError(''); setAttendance([]);
    API.get('/payroll-integration/my-attendance', { params: { month } })
      .then(({ data }) => {
        if (!Array.isArray(data?.data)) throw new Error();
        if (active) setAttendance([...data.data].sort((a, b) => String(b.date).localeCompare(String(a.date))));
      }).catch(e => { if (active) setAttendanceError(message(e, 'Unable to load attendance. Check your payroll connection or try again.')); })
      .finally(() => { if (active) setAttendanceLoading(false); });
    return () => { active = false; };
  }, [activeTab, canViewAttendance, month, refresh]);

  const save = async event => {
    event.preventDefault();
    if (saving || !canEdit) return;
    setSaving(true); setNotice('');
    const changes = Object.fromEntries(fields.map(([key]) => [key, String(draft[key] || '').trim()]));
    if (!changes.FULLNAME) { setNotice('Full name is required.'); setSaving(false); return; }
    try {
      await API.put(`/employees/${encodeURIComponent(employeeId)}`, changes);
      setEmployee(previous => ({ ...previous, ...changes })); setEditing(false); setNotice('Profile updated successfully.');
    } catch (e) { setNotice(message(e, 'Unable to save your profile. Your changes are still available to retry.')); }
    finally { setSaving(false); }
  };
  const selectTab = key => { setParams(previous => { const next = new URLSearchParams(previous); next.set('tab', key); return next; }); };
  const name = employee?.FULLNAME || 'Your profile';
  const completed = tickets ? Number(tickets.stats?.Completed || 0) : 0;
  const total = tickets?.complaints.length || 0;
  const rate = total ? Math.min(100, Math.round(completed / total * 100)) : 0;

  return <main className="myprofile-page">
    <div className="myprofile-heading"><div><span className="myprofile-eyebrow">YOUR WORKSPACE</span><h1>My profile</h1><p>Your details, work activity and account access in one place.</p></div><button className="myprofile-button" disabled={loading || saving || editing} onClick={() => setRefresh(value => value + 1)}><RefreshCw size={16}/> Refresh</button></div>
    {loading ? <div className="myprofile-panel myprofile-empty" role="status">Loading your profile…</div> : error ? <div className="myprofile-panel" role="alert">{error}<button className="myprofile-button" onClick={() => setRefresh(value => value + 1)}>Try again</button></div> : employee && <>
      <section className="myprofile-hero"><div className="myprofile-avatar" aria-hidden="true">{name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</div><div className="myprofile-identity"><span className="myprofile-eyebrow">EMPLOYEE PROFILE</span><h2>{name}</h2><div className="myprofile-meta"><span><Briefcase size={15}/>{employee.DESIGNATION || 'Designation not assigned'}</span><span><MapPin size={15}/>{employee.MARKING_OFFICE || 'Office not assigned'}</span><span><Calendar size={15}/>Joined {dateLabel(employee.DOJ || employee.createdAt)}</span></div></div><span className="myprofile-status">{employee.status || 'Status unavailable'}</span></section>
      <div className="myprofile-stats">{[[FileText, 'Assigned this month', tickets ? total : '—'], [CheckCircle2, 'Completed this month', tickets ? completed : '—'], [Clock, 'Average close time', tickets?.averageCloseTime || '—'], [ShieldCheck, 'Granted permissions', permissions.length]].map(([Icon, label, value]) => <div className="myprofile-panel myprofile-stat" key={label}><span className="myprofile-icon"><Icon size={20}/></span><div><span>{label}</span><strong>{value}</strong></div></div>)}</div>
      {ticketError && <p className="myprofile-warning" role="status">{ticketError}</p>}
      <nav className="myprofile-tabs" aria-label="Profile sections">{tabs.map(([key, label, Icon]) => <button key={key} aria-current={activeTab === key ? 'page' : undefined} onClick={() => selectTab(key)}><Icon size={17}/>{label}</button>)}</nav>
      {activeTab === 'overview' && <div className="myprofile-columns"><section className="myprofile-panel"><div className="myprofile-section-heading"><div><h3>Personal information</h3><p>Your contact and employment details.</p></div>{canEdit && !editing && <button className="myprofile-button" onClick={() => { setDraft(employee); setEditing(true); setNotice(''); }}><Pencil size={15}/> Edit profile</button>}</div>{notice && <p role="status" className="myprofile-warning">{notice}</p>}{editing ? <form onSubmit={save}><div className="myprofile-fields">{fields.map(([key, label, type]) => <label key={key} htmlFor={`myprofile-${key}`}>{label}<input id={`myprofile-${key}`} type={type} required={key === 'FULLNAME'} disabled={saving} value={draft[key] || ''} onChange={e => setDraft({ ...draft, [key]: e.target.value })}/></label>)}</div><div className="myprofile-actions"><button className="myprofile-button" type="button" disabled={saving} onClick={() => { setEditing(false); setDraft(employee); setNotice(''); }}>Cancel</button><button className="myprofile-button myprofile-primary" disabled={saving}><Save size={16}/>{saving ? 'Saving…' : 'Save changes'}</button></div></form> : <dl className="myprofile-fields"><Detail label="Full name" value={employee.FULLNAME}/><Detail label="Email address" value={employee.GMAIL}/><Detail label="Mobile number" value={employee.MOBILE}/><Detail label="Address" value={employee.ADDRESS}/><Detail label="Employee ID" value={employee._id}/><Detail label="Joining date" value={dateLabel(employee.DOJ || employee.createdAt)}/></dl>}{!canEdit && <p className="myprofile-note">Contact your administrator to update your profile details.</p>}</section><aside className="myprofile-panel myprofile-activity"><span className="myprofile-icon"><CheckCircle2 size={22}/></span><h3>This month’s activity</h3><p>Resolution progress for tickets assigned this month.</p><strong>{tickets ? `${rate}%` : '—'}</strong><progress aria-label="Ticket resolution rate" max="100" value={rate}/><p>{tickets ? `${completed} completed · ${total} assigned` : 'Activity is unavailable.'}</p><hr/><h3>Work contact</h3><p><Mail size={15}/> {employee.GMAIL || 'Email not provided'}</p><p><Phone size={15}/> {employee.MOBILE || 'Mobile not provided'}</p></aside></div>}
      {activeTab === 'account' && <section className="myprofile-panel"><div className="myprofile-section-heading"><div><h3>Bank & payment details</h3><p>Payment information registered with your account.</p></div><CreditCard size={23}/></div><dl className="myprofile-fields"><Detail label="Account holder" value={employee.ACCOUNTNAME}/><Detail label="Bank name" value={employee.BANKNAME}/><Detail label="Account number" value={employee.ACCOUNTNO ? `•••• ${String(employee.ACCOUNTNO).slice(-4)}` : null}/><Detail label="IFSC code" value={employee.IFSC}/><Detail label="UPI ID" value={employee.UPI}/></dl><p className="myprofile-note">Contact your administrator to update bank or payment information.</p></section>}
      {activeTab === 'permissions' && <section className="myprofile-panel"><div className="myprofile-section-heading"><div><h3>Account permissions</h3><p>{permissions.length} permissions assigned by your administrator.</p></div><ShieldCheck size={23}/></div>{permissions.length ? <ul className="myprofile-permissions">{permissions.map(permission => <li key={permission}><CheckCircle2 size={16}/>{permission.replace(/_/g, ' ').toLowerCase()}</li>)}</ul> : <p className="myprofile-empty">No permissions have been assigned to your account.</p>}</section>}
      {activeTab === 'attendance' && <section className="myprofile-panel"><div className="myprofile-section-heading"><div><h3>My attendance</h3><p>Your monthly attendance records from DudePayroll.</p></div>{canViewAttendance && <label>Month<input aria-label="Attendance month" type="month" value={month} onChange={e => { if (e.target.value) setMonth(e.target.value); }}/></label>}</div>{!canViewAttendance ? <p className="myprofile-empty">Attendance access has not been enabled for your account. Contact your administrator.</p> : attendanceLoading ? <p className="myprofile-empty" role="status">Loading attendance…</p> : attendanceError ? <p className="myprofile-warning" role="alert">{attendanceError}</p> : <div className="myprofile-table"><table><thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead><tbody>{attendance.length ? attendance.map((row, index) => <tr key={row.id || row._id || index}><td>{dateLabel(row.date)}</td><td>{timeLabel(row.checkIn?.time || row.checkIn)}</td><td>{timeLabel(row.checkOut?.time || row.checkOut)}</td><td><span className="myprofile-attendance-status">{String(row.status || 'Not marked').replace(/_/g, ' ')}</span></td></tr>) : <tr><td colSpan={4} className="myprofile-empty">No attendance recorded for this month.</td></tr>}</tbody></table></div>}</section>}
    </>}
  </main>;
}
