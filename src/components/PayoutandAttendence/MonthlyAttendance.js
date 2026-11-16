import React from 'react';

export const attendanceStatuses = {
  present: ['P', 'Present'], absent: ['A', 'Absent'], late: ['L', 'Late'],
  half_day: ['HD', 'Half day'], on_leave: ['LV', 'On leave'],
};

export function monthlyAttendance(employees, records, month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const days = Array.from({ length: new Date(year, monthNumber, 0).getDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`);
  const people = new Map(employees.map(employee => [String(employee.id), employee.name]));
  const byEmployee = new Map();
  records.forEach(record => {
    const date = String(record.date || '').slice(0, 10);
    if (!days.includes(date)) return;
    const id = String(record.employeeId);
    if (!people.has(id)) people.set(id, id);
    if (!byEmployee.has(id)) byEmployee.set(id, new Map());
    byEmployee.get(id).set(date, record);
  });
  return { days, people: Array.from(people, ([id, name]) => {
    const daily = byEmployee.get(id) || new Map();
    const counts = Object.fromEntries(Object.keys(attendanceStatuses).map(status => [status, 0]));
    let hours = 0;
    daily.forEach(record => {
      if (record.status in counts) counts[record.status] += 1;
      hours += Number(record.totalHours || 0);
    });
    return { id, name, daily, counts, hours };
  }) };
}

export default function MonthlyAttendance({ attendance, month }) {
  const { days, people } = attendance;
  const monthLabel = new Date(`${month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return <>
    <div className="attendance-legend" aria-label="Attendance legend">
      {Object.entries(attendanceStatuses).map(([status, [code, label]]) => <span key={status}><span className={`payroll-status payroll-status-${status}`}>{code}</span> {label}</span>)}
      <span>— Not marked</span>
    </div>
    <div className="table-responsive payroll-table attendance-month-scroll" tabIndex={0} role="region" aria-label="Monthly attendance table">
      <table className="table table-hover align-middle mb-0 attendance-month-table">
        <caption className="visually-hidden">Attendance for {monthLabel}</caption>
        <thead><tr><th scope="col" className="attendance-employee">Employee</th>
          {days.map(date => <th scope="col" key={date}><span>{Number(date.slice(-2))}</span><small>{new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' })}</small></th>)}
          {Object.values(attendanceStatuses).map(([, label]) => <th scope="col" key={label}>{label}</th>)}<th scope="col">Hours</th>
        </tr></thead>
        <tbody>{people.map(person => <tr key={person.id}><th scope="row" className="attendance-employee">{person.name}</th>
          {days.map(date => {
            const record = person.daily.get(date);
            const [code, label] = attendanceStatuses[record?.status] || [record?.status || '—', record?.status || 'Not marked'];
            const details = `${person.name}, ${date}: ${label}${record ? `; ${record.totalHours || 0} hours${record.reason || record.notes ? `; ${record.reason || record.notes}` : ''}` : ''}`;
            return <td key={date} aria-label={details} title={details}><span className={`payroll-status payroll-status-${record?.status || 'unmarked'}`}>{code}</span></td>;
          })}
          {Object.keys(attendanceStatuses).map(status => <td key={status}>{person.counts[status]}</td>)}<td className="fw-bold">{Number(person.hours.toFixed(2))}</td>
        </tr>)}
        {!people.length && <tr><td colSpan={days.length + 7} className="p-4 text-center text-muted">No employees to display. Sync employees from Edit Partner to get started.</td></tr>}
        </tbody>
      </table>
    </div>
  </>;
}
