import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmployeeProfile from './EmployeeProfileDash';
import { API } from '../../FirebaseConfig';
import { usePermissions } from '../PermissionProvider';
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn(), put: jest.fn() } }));
jest.mock('../PermissionProvider', () => ({ usePermissions: jest.fn() }));
let mockSearch = '';
jest.mock('react-router-dom', () => ({ useSearchParams: () => {
  const [params, setParams] = require('react').useState(new URLSearchParams(mockSearch));
  return [params, setParams];
} }), { virtual: true });
beforeEach(() => {
  mockSearch = ''; jest.clearAllMocks(); localStorage.setItem('empid', 'employee-a'); localStorage.setItem('contact', '9999999999');
  usePermissions.mockReturnValue({ permissions: ['EDIT_EMP', 'VIEW_ATTENDENCE'], hasPermission: key => ['EDIT_EMP', 'VIEW_ATTENDENCE'].includes(key) });
  API.get.mockImplementation(url => Promise.resolve({ data: url.includes('myactivecomplaints') ? { complaints: [{}, {}], stats: { Completed: 1 }, averageCloseTime: '2 days' } : url.includes('my-attendance') ? { data: [{ id: 'record', date: '2026-11-03', checkIn: { time: '09:30' }, status: 'present' }] } : { _id: 'employee-a', FULLNAME: 'Asha Sharma', GMAIL: 'asha@example.com', BANKNAME: 'Test bank', ACCOUNTNO: '1234567890', status: 'active' } }));
  API.put.mockResolvedValue({ data: {} });
});
test('saves only editable profile fields and preserves failed edits', async () => {
  render(<EmployeeProfile/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit profile' }));
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Asha Singh' } });
  API.put.mockRejectedValueOnce(new Error('offline'));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText(/Your changes are still available/)).toBeInTheDocument();
  expect(screen.getByLabelText('Full name')).toHaveValue('Asha Singh');
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument());
  expect(API.put).toHaveBeenLastCalledWith('/employees/employee-a', { FULLNAME: 'Asha Singh', GMAIL: 'asha@example.com', ADDRESS: '' });
});
test('loads own attendance through the direct attendance tab', async () => {
  mockSearch = 'tab=attendance'; render(<EmployeeProfile/>);
  expect(await screen.findByText('09:30')).toBeInTheDocument();
  expect(API.get).toHaveBeenCalledWith('/payroll-integration/my-attendance', { params: { month: expect.stringMatching(/^\d{4}-\d{2}$/) } });
  fireEvent.change(screen.getByLabelText('Attendance month'), { target: { value: '2026-10' } });
  await waitFor(() => expect(API.get).toHaveBeenCalledWith('/payroll-integration/my-attendance', { params: { month: '2026-10' } }));
});
test('attendance and editing respect permissions; bank number is masked', async () => {
  usePermissions.mockReturnValue({ permissions: [], hasPermission: () => false });
  render(<EmployeeProfile/>);
  await screen.findByRole('heading', { name: 'Asha Sharma' });
  expect(screen.queryByRole('button', { name: 'Edit profile' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Bank details' }));
  expect(screen.getByText('•••• 7890')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'My attendance' }));
  expect(screen.getByText(/Attendance access has not been enabled/)).toBeInTheDocument();
  expect(API.get).not.toHaveBeenCalledWith('/payroll-integration/my-attendance', expect.anything());
});
test('ticket failure leaves the profile usable and shows no fabricated metrics', async () => {
  API.get.mockImplementation(url => url.includes('myactivecomplaints') ? Promise.reject(new Error()) : Promise.resolve({ data: { _id: 'employee-a', FULLNAME: 'Asha Sharma' } }));
  render(<EmployeeProfile/>);
  expect(await screen.findByRole('heading', { name: 'Asha Sharma' })).toBeInTheDocument();
  expect(await screen.findByText(/Ticket activity could not be loaded/)).toBeInTheDocument();
  expect(screen.queryByText('4.5/5.0')).not.toBeInTheDocument();
});
