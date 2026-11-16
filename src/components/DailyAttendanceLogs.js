import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../FirebaseConfig';
import { usePermissions } from './PermissionProvider';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
const time = value => {
  if (!value) return '—';
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit'});
};
export default function DailyAttendanceLogs() {
  const { hasPermission } = usePermissions();
  const canView = hasPermission('VIEW_ATTENDENCE');
  const canManage = hasPermission('EDIT_EMP_PERMISSION');
  const canOpenPayroll = canManage && hasPermission('VIEW_PAYOUT');
  const [date,setDate] = useState(today);
  const [records,setRecords] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [refresh,setRefresh] = useState(0);
  useEffect(() => {
    if (!canView) return;
    let active=true;
    setLoading(true); setError(''); setRecords([]);
    (async () => {
      const month=date.slice(0,7);
      const [logs,people] = await Promise.all([
        API.get(canManage?'/payroll-integration/workspace/attendance':'/payroll-integration/my-attendance',{params:{month}}),
        canManage?API.get('/payroll-integration/employees'):Promise.resolve(null),
      ]);
      if (!Array.isArray(logs.data?.data) || (canManage && !Array.isArray(people?.data?.payroll))) throw new Error('Unexpected attendance response. Please refresh or contact your administrator.');
      const names = new Map((people?.data?.payroll || []).map(employee=>[String(employee.id),employee.name]));
      if(active) setRecords(logs.data.data.filter(row=>String(row.date||'').slice(0,10)===date).map(row=>({...row,displayName:canManage?(names.get(String(row.employeeId))||String(row.employeeId||'Unknown employee')):'You'})));
    })().catch(e=>{if(active)setError(e.response?.data?.message||e.message||'Unable to load attendance.');}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[date,canView,canManage,refresh]);
  if (!canView) return null;
  return <section className="dashboard-card daily-attendance-card" aria-label="Daily attendance logs">
    <div className="card-header"><h3 className="card-title"><i className="fas fa-clock"/>Daily Attendance Logs</h3>{canOpenPayroll&&<Link to="/dashboard/payrollandattendence?tab=attendance" className="small" aria-label="Open monthly attendance">View all</Link>}</div>
    <div className="daily-attendance-toolbar"><label className="small">Date <input aria-label="Attendance date" className="form-control form-control-sm" type="date" value={date} max={today()} onChange={e=>{if(e.target.value)setDate(e.target.value);}}/></label><button className="btn btn-sm btn-outline-primary" disabled={loading} onClick={()=>setRefresh(n=>n+1)}>Refresh</button></div>
    {!canManage&&<p className="small text-muted px-3 mb-2">Your attendance records</p>}
    {error?<div className="alert alert-danger m-3 small" role="alert">{error}</div>:<div className="table-container"><table className="dashboard-table"><thead><tr><th>Full Name</th><th>In Time</th><th>Out Time</th><th>Status</th></tr></thead><tbody>
      {loading?<tr><td colSpan={4} role="status" className="text-center p-4">Loading attendance…</td></tr>:records.length?records.map((record,index)=><tr key={record.id||record._id||index}><td>{record.displayName}</td><td>{time(record.checkIn?.time||record.checkIn)}</td><td>{time(record.checkOut?.time||record.checkOut)}</td><td><span className={`status-badge ${record.status==='absent'?'status-absent':record.status==='present'?'status-present':'status-late'}`}>{String(record.status||'Not marked').replace(/_/g,' ')}</span></td></tr>):<tr><td colSpan={4} className="text-center text-muted p-4">No attendance recorded for this date.</td></tr>}
    </tbody></table></div>}
  </section>;
}
