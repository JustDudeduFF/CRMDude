import PayrollOffices from './PayrollOffices';
import React, { useEffect, useState } from 'react';
import { API } from '../../FirebaseConfig';
import './DudePayrollWorkspace.css';
export default function PayrollConnectionSettings() {
  const [connection,setConnection]=useState(null),[token,setToken]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const base='/payroll-integration';
  const load=async()=>{const {data}=await API.get(`${base}/connection`);setConnection(data);};
  useEffect(()=>{let active=true;API.get(`${base}/connection`).then(({data})=>{if(active)setConnection(data);}).catch(e=>{if(active)setMessage(e.response?.data?.message||'Unable to load DudePayroll settings');});return()=>{active=false;};},[]);
  const run=async(action)=>{setBusy(true);setMessage('');try{await action();await load();}catch(e){setMessage(e.response?.data?.message||e.message||'Unable to connect to DudePayroll');}finally{setBusy(false);}};
  return <section className="payroll-connection"><h3>DudePayroll integration</h3>
    <p>Connect DudePayroll for payroll, attendance and employee payouts. Changes here are saved separately from partner details.</p>
    {message&&<p className="alert alert-info" role="status">{message}</p>}
    <form className="payroll-connection-form" onSubmit={e=>{e.preventDefault();run(async()=>{await API.put(`${base}/connection`,{token:token.trim()});setToken('');setMessage('DudePayroll connected. Sync employees to get started.');});}}>
      <label className="form-label">DudePayroll token<input className="form-control" type="password" autoComplete="off" required value={token} disabled={busy} onChange={e=>setToken(e.target.value)}/></label>
      <button className="btn btn-primary" disabled={busy||!token.trim()}>Save / replace token</button>
    </form>
    {connection?.connected&&<><p>Connected • expires {new Date(connection.expiresAt).toLocaleString()}</p><div className="d-flex flex-wrap gap-2">
      <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={()=>run(async()=>{const {data}=await API.post(`${base}/employees/sync`,{},{timeout:600000});setMessage(`${data.synced} of ${data.total} employees synced: ${data.created} created, ${data.updated} updated.${data.errors?.length?' Some employees failed: '+data.errors.map(e=>e.message).join('; '):''}`);})}>{busy?'Working…':'Sync employees to DudePayroll'}</button>
      <button type="button" className="btn btn-outline-danger" disabled={busy} onClick={()=>run(async()=>{await API.delete(`${base}/connection`);setMessage('DudePayroll disconnected');})}>Disconnect</button>
      <a className="btn btn-outline-secondary" href="/dashboard/payrollandattendence">Open DudePayroll workspace</a>
    </div><p className="text-muted small mt-2">Sync again after changing CRM employees. Existing payroll allowances and deductions are preserved.</p><PayrollOffices /></>}
  </section>;
}
