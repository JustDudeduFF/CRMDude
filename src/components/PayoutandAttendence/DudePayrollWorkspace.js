import React, {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Modal} from 'react-bootstrap';
import { Wallet, Users, FileCheck2, Clock3, RefreshCw, Download, CalendarDays } from 'lucide-react';
import './DudePayrollWorkspace.css';
import MonthlyAttendance, { monthlyAttendance, attendanceStatuses } from './MonthlyAttendance';
import * as XLSX from 'xlsx';
import {API} from '../../FirebaseConfig';
import {usePermissions} from '../PermissionProvider';
const base='/payroll-integration';
const sections={payouts:'Payroll & payslips',attendance:'Attendance',advances:'Salary advances',leave:'Leave',overtime:'Overtime'};
const labels={basic:'Basic salary',hra:'HRA',transport:'Transport',medical:'Medical',overtime:'Overtime',incentives:'Incentives',otherAllowances:'Other allowances',unusedEarnedLeavesPayout:'Unused earned leave payout',tax:'Tax',pf:'PF',esi:'ESI',penalties:'Penalties',advances:'Advance deductions',otherDeductions:'Other deductions'};
const fields={
 attendance:[['date','Date','date'],['status','Status','select',['present','absent','late','half_day','on_leave']],['totalHours','Hours','number'],['reason','Notes','text']],
 advances:[['amount','Amount','number'],['repaymentMonths','Repayment months','number'],['reason','Reason','text']],
 leave:[['leaveType','Leave type','select',['casual','sick','earned','unpaid']],['startDate','Start date','date'],['endDate','End date','date'],['reason','Reason','text']],
 overtime:[['date','Date','date'],['hours','Hours','number'],['reason','Reason','text']]
};
const title=value=>String(value||'').replace(/_/g,' ');
const errorText=e=>typeof e.response?.data?.message==='string'?e.response.data.message:e.message||'DudePayroll request failed';
export default function DudePayrollWorkspace(){
 const {hasPermission}=usePermissions();
 const canViewAccounts=hasPermission('ACCOUNT_SECTION');
 const [status,setStatus]=useState(null),[employees,setEmployees]=useState([]),[rows,setRows]=useState([]),[requestedTab,setTab]=useState(()=>new URLSearchParams(window.location.search).get('tab')==='attendance'?'attendance':'payouts'),[month,setMonth]=useState(new Date().toISOString().slice(0,7)),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0),[selected,setSelected]=useState(null),[editing,setEditing]=useState(false),[adjustment,setAdjustment]=useState({earnings:{},deductions:{}}),[form,setForm]=useState(null);
 const tab=!canViewAccounts&&['payouts','advances'].includes(requestedTab)?'attendance':requestedTab;
 const visibleSections=Object.entries(sections).filter(([key])=>canViewAccounts||!['payouts','advances'].includes(key));
 useEffect(()=>{setSelected(null);setForm(null);},[canViewAccounts]);
 useEffect(()=>{
  let active=true;setLoading(true);setError('');setRows([]);
  (async()=>{
   const {data:connection}=await API.get(`${base}/status`);if(!active)return;setStatus(connection);if(!connection.connected){setEmployees([]);return;}
   const [people,result]=await Promise.all([API.get(`${base}/employees`),API.get(tab==='payouts'?`${base}/payouts`:`${base}/workspace/${tab}`,{params:{month}})]);
   if(!Array.isArray(people.data?.payroll)||!Array.isArray(result.data?.data))throw new Error('Unexpected DudePayroll response. Update both backend services and retry.');
   if(active){setEmployees(people.data.payroll);setRows(result.data.data);}
  })().catch(e=>{if(active)setError(errorText(e));}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[tab,month,refresh]);
 const run=async(action)=>{setBusy(true);setError('');setMessage('');try{await action();setRefresh(n=>n+1);}catch(e){setError(errorText(e));}finally{setBusy(false);}};
 const name=id=>employees.find(e=>e.id===String(id))?.name||String(id||'');
 const amount=value=>`₹${Number(value||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
 const attendance = monthlyAttendance(employees, rows, month);
 const exportRows=()=>{
  const data=tab==='attendance'?attendance.people.map(person=>({Employee:person.name,...Object.fromEntries(attendance.days.map(date=>[date,person.daily.get(date)?.status || 'Not marked'])),...Object.fromEntries(Object.entries(attendanceStatuses).map(([status,[,label]])=>[label,person.counts[status]])),Hours:person.hours})):rows.map(row=>tab==='payouts'?{Employee:name(row.employeeId),Month:row.month,Gross:row.grossSalary,Deductions:Object.values(row.deductions||{}).reduce((a,b)=>a+Number(b),0),Net:row.netSalary,Status:row.status}:{Employee:name(row.employeeId),Date:row.date||row.startDate||row.requestedAt||'',End:row.endDate||'',Amount:row.amount??'',Hours:row.hours??row.totalHours??'',Days:row.totalDays??'',Reason:row.reason||row.notes||'',Status:row.status});
  const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(data),sections[tab].slice(0,31));XLSX.writeFile(book,`DudePayroll-${tab}-${month}.xlsx`);
 };
 const approve=(row,decision)=>run(async()=>{await API.put(`${base}/workspace/${tab}/${encodeURIComponent(row._id||row.id)}/status`,{status:decision});setMessage(`Request ${decision}`);});
 const create=event=>{event.preventDefault();const body={...form};for(const [key,,type]of fields[tab])if(type==='number')body[key]=Number(body[key]||0);run(async()=>{await API.post(`${base}/workspace/${tab}`,body);setForm(null);setMessage('Record saved in DudePayroll');});};
 return <main className="payroll-workspace">
  <div className="payroll-content">
  {error&&<div role="alert" className="alert alert-danger">{error}</div>}{message&&<div role="status" className="alert alert-success">{message}</div>}
  {status&&!status.connected&&<div className="alert alert-info">Connect DudePayroll and sync employees on the <Link to="/dashboard/partnerview">partner page under Edit Partner</Link> to get started.</div>}
  <div className="payroll-summary" aria-label="Payroll overview">
    {[{label:'Connected employees',value:status?.connected?employees.length:'—',icon:Users}, {label:tab==='payouts'?'Net payroll': 'Records in view',value:status?.connected?(tab==='payouts'?amount(rows.reduce((sum,row)=>sum+Number(row.netSalary||0),0)):rows.length):'—',icon:Wallet}, {label:'Pending action',value:status?.connected?rows.filter(row=>['draft','generated','pending'].includes(row.status)).length:'—',icon:FileCheck2}, {label:'Connection',value:status?status.connected?'Connected':'Not connected':'Checking…',icon:Clock3}].map(({label,value,icon:Icon})=><div className="payroll-summary-card" key={label}><span className="payroll-stat-icon"><Icon size={21}/></span><div><p>{label}</p><strong>{loading?'…':value}</strong></div></div>)}
  </div>
  <section className="payroll-panel">
  <div className="payroll-tabs" role="tablist" aria-label="DudePayroll sections">{visibleSections.map(([key,label])=><button key={key} role="tab" aria-selected={key===tab} className={`payroll-tab ${key===tab?'is-active':''}`} disabled={busy} onClick={()=>{setTab(key);setForm(null);setSelected(null);}}>{label}</button>)}</div>
  <div className="payroll-toolbar"><label className="form-label"><CalendarDays size={15}/> Month<input type="month" className="form-control" value={month} required disabled={busy} onChange={e=>{if(e.target.value)setMonth(e.target.value);}}/></label>
   <button className="btn btn-outline-secondary mb-2" disabled={busy||loading} onClick={()=>setRefresh(n=>n+1)}><RefreshCw size={15}/> Refresh</button>
   <button className="btn btn-outline-secondary mb-2" disabled={busy||loading||(tab==='attendance'?!attendance.people.length:!rows.length)} onClick={exportRows}><Download size={15}/> Export Excel</button>
   {status?.connected&&status.canManage&&<button className="btn btn-primary mb-2" disabled={busy||loading} onClick={()=>tab==='payouts'?run(async()=>{const {data}=await API.post(`${base}/generate`,{month},{timeout:180000});setMessage(`${data.count} payroll drafts calculated. Approved, released and paid records were preserved.`);}):setForm({employeeId:'',date:`${month}-01`,startDate:`${month}-01`,endDate:`${month}-01`,status:'present',leaveType:'casual',repaymentMonths:'1',totalHours:'8',hours:'1',reason:'',amount:''})}>{busy?'Working…':tab==='payouts'?'Generate / recalculate drafts':`Add ${tab==='advances'?'advance':tab==='leave'?'leave request':tab==='overtime'?'overtime':'attendance'}`}</button>}
  </div>
  {tab==='payouts'&&<p className="text-muted small">Generate recalculates draft earnings and deductions using current salary, attendance and approved requests. Approve a draft to lock its figures. Mark paid records a payment already made; it does not transfer funds.</p>}
  {tab==='advances'&&<p className="text-muted small">All salary advances are shown, including earlier months.</p>}
  {loading?<p role="status">Loading DudePayroll…</p>:tab==='attendance'?<MonthlyAttendance attendance={attendance} month={month}/>:<div className="table-responsive payroll-table"><table className="table table-hover align-middle mb-0"><thead><tr><th>Employee</th>{tab==='payouts'?<><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net payout</th></>:<><th>Date / period</th><th>Details</th><th>Reason / notes</th></>}<th>Status</th><th>Actions</th></tr></thead><tbody>
   {rows.map(row=><tr key={row.id||row._id}><td>{name(row.employeeId)}</td>{tab==='payouts'?<><td>{amount(row.earnings?.basic)}</td><td>{amount(Number(row.grossSalary||0)-Number(row.earnings?.basic||0))}</td><td>{amount(Object.values(row.deductions||{}).reduce((a,b)=>a+Number(b),0))}</td><td className="fw-bold">{amount(row.netSalary)}</td></>:<><td>{row.date||row.startDate||String(row.requestedAt||row.createdAt||'').slice(0,10)}{row.endDate?` to ${row.endDate}`:''}</td><td>{tab==='advances'?`${amount(row.amount)} / ${row.repaymentMonths} months`:tab==='leave'?`${row.leaveType} / ${row.totalDays} days`:`${row.hours??row.totalHours??0} hours`}</td><td>{row.reason||row.notes||'—'}</td></>}<td><span className={`payroll-status payroll-status-${row.status}`}>{title(row.status)}</span></td><td><div className="d-flex flex-wrap gap-2">
    {tab==='payouts'&&<><button className="btn btn-sm btn-outline-secondary" onClick={()=>{setSelected(row);setEditing(false);}}>Payslip details</button>{status?.canManage&&['draft','generated'].includes(row.status)&&<button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={()=>{setSelected(row);setAdjustment({earnings:{...row.earnings},deductions:{...row.deductions}});setEditing(true);}}>Adjust</button>}{status?.canManage&&['draft','generated','approved','released'].includes(row.status)&&<button className="btn btn-sm btn-primary" disabled={busy} onClick={()=>run(()=>API.post(`${base}/payouts/${row.id}/${['draft','generated'].includes(row.status)?'approve':row.status==='approved'?'release':'paid'}`))}>{['draft','generated'].includes(row.status)?'Approve':row.status==='approved'?'Release payslip':'Mark paid'}</button>}</>}
    {tab!=='payouts'&&tab!=='attendance'&&status?.canManage&&row.status==='pending'&&<><button className="btn btn-sm btn-success" disabled={busy} onClick={()=>approve(row,'approved')}>Approve</button><button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={()=>approve(row,'rejected')}>Reject</button></>}
   </div></td></tr>)}
   {!rows.length&&<tr><td colSpan={tab==='payouts'?7:6} className="p-4 text-center text-muted">No {sections[tab].toLowerCase()} records{status?.connected?' for this period':''}.</td></tr>}
  </tbody></table></div>}
  </section>
  </div>
  <Modal show={canViewAccounts&&!!selected} onHide={()=>{if(!busy)setSelected(null);}} size="lg"><Modal.Header closeButton><Modal.Title>{editing?'Adjust payroll':'Payslip details'} — {selected?name(selected.employeeId):''}</Modal.Title></Modal.Header><Modal.Body>
   {canViewAccounts&&selected&&<><p>{selected.month} • {title(selected.status)}</p>{['earnings','deductions'].map(group=><section key={group}><h5>{title(group)}</h5><div className="row g-3 mb-4">{Object.entries(editing?adjustment[group]:selected[group]||{}).map(([key,value])=><div className="col-md-6" key={key}>{editing?<label className="form-label w-100">{labels[key]||title(key)}<input className="form-control" type="number" min="0" max="100000000" step="any" value={value} disabled={busy} onChange={e=>setAdjustment(prev=>({...prev,[group]:{...prev[group],[key]:e.target.value}}))}/></label>:<p>{labels[key]||title(key)}: {amount(value)}</p>}</div>)}</div></section>)}<strong>Net payout: {amount(selected.netSalary)}</strong></>}
  </Modal.Body><Modal.Footer>{editing&&<button className="btn btn-primary" disabled={busy} onClick={()=>{const payload={};for(const group of ['earnings','deductions'])payload[group]=Object.fromEntries(Object.entries(adjustment[group]).map(([key,value])=>[key,Number(value)]));run(async()=>{await API.patch(`${base}/payouts/${selected.id}`,payload);setSelected(null);});}}>Save adjustments</button>}<button className="btn btn-secondary" disabled={busy} onClick={()=>setSelected(null)}>Close</button></Modal.Footer></Modal>
  <Modal show={!!form&&(canViewAccounts||!['payouts','advances'].includes(requestedTab))} onHide={()=>{if(!busy)setForm(null);}}><Modal.Header closeButton><Modal.Title>Add {sections[tab]}</Modal.Title></Modal.Header><form onSubmit={create}><Modal.Body>{form&&<div className="d-grid gap-3"><label>Employee<select className="form-select" required value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}><option value="">Select employee</option>{employees.filter(e=>e.isActive!==false).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>{fields[tab]?.map(([key,label,type,options])=><label key={key}>{label}{type==='select'?<select className="form-select" value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}>{options.map(value=><option key={value} value={value}>{title(value)}</option>)}</select>:<input className="form-control" required={key!=='reason'||tab!=='attendance'} type={type} min={type==='number'?0:undefined} step={type==='number'?'any':undefined} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}</div>}</Modal.Body><Modal.Footer><button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>setForm(null)}>Cancel</button><button className="btn btn-primary" disabled={busy}>Save to DudePayroll</button></Modal.Footer></form></Modal>
 </main>;
}
