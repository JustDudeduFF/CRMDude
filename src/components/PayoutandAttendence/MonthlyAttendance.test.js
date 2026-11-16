import React from 'react';
import { render, screen } from '@testing-library/react';
import MonthlyAttendance, { monthlyAttendance } from './MonthlyAttendance';

test('whole month includes leap day, unmarked employees, and accurate totals', () => {
  const attendance = monthlyAttendance([{ id:'one', name:'Asha' }, { id:'two', name:'Ravi' }], [
    { employeeId:'one', date:'2024-02-01', status:'present', totalHours:8 },
    { employeeId:'one', date:'2024-02-29T00:00:00.000Z', status:'half_day', totalHours:4 },
    { employeeId:'one', date:'2024-01-31', status:'absent' },
  ], '2024-02');
  expect(attendance.days).toHaveLength(29);
  expect(attendance.people[0].counts).toMatchObject({ present:1, half_day:1, absent:0 });
  expect(attendance.people[0].hours).toBe(12);
  render(<MonthlyAttendance attendance={attendance} month="2024-02"/>);
  expect(screen.getByRole('table')).toHaveAccessibleName('Attendance for February 2024');
  expect(screen.getByRole('cell', { name:'Asha, 2024-02-29: Half day; 4 hours' })).toHaveTextContent('HD');
  expect(screen.getByRole('cell', { name:'Ravi, 2024-02-01: Not marked' })).toHaveTextContent('—');
});
test('month lengths change and records outside the month are excluded', () => {
  expect(monthlyAttendance([], [], '2026-04').days).toHaveLength(30);
  expect(monthlyAttendance([], [], '2026-05').days).toHaveLength(31);
  expect(monthlyAttendance([], [], '2026-02').days).toHaveLength(28);
  expect(monthlyAttendance([], [{employeeId:'old',date:'2026-01-01'}], '2026-02').people).toHaveLength(0);
});
