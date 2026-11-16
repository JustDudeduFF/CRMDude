import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import { API } from '../FirebaseConfig';
jest.mock('../FirebaseConfig', () => ({ API: { get: jest.fn() } }));
jest.mock('./PayoutandAttendence/PayrollConnectionSettings', () => () => <section>DudePayroll connection controls</section>);
jest.mock('xlsx', () => ({ utils: {}, writeFile: jest.fn() }));
beforeEach(() => {
  localStorage.setItem('partnerId', 'partner-a');
  API.get.mockResolvedValue({ data: [{ _id: 'partner-a', name: 'Example Partner', companyname: 'Example Company', email: '', status: 'Active' }] });
});
test('DudePayroll settings appear only inside the existing partner edit modal', async () => {
  render(<Dashboard />);
  await screen.findByText('Example Partner');
  expect(screen.queryByText('DudePayroll connection controls')).not.toBeInTheDocument();
  fireEvent.click(document.querySelector('button.edit'));
  expect(screen.getByRole('dialog')).toHaveTextContent('DudePayroll connection controls');
});
test('editing another partner cannot change the signed-in payroll connection', async () => {
  localStorage.setItem('partnerId', 'partner-b');
  render(<Dashboard />);
  await screen.findByText('Example Partner');
  fireEvent.click(document.querySelector('button.edit'));
  expect(screen.queryByText('DudePayroll connection controls')).not.toBeInTheDocument();
  expect(screen.getByRole('dialog')).toHaveTextContent('Sign in to that partner');
});
test('eye opens read-only partner details and can continue to edit', async () => {
  render(<Dashboard />);
  fireEvent.click(await screen.findByRole('button', { name: 'View Example Partner details' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveTextContent('Partner Details');
  expect(dialog).toHaveTextContent('Example Company');
  expect(dialog).toHaveTextContent('WhatsApp: Disabled');
  expect(dialog.querySelector('input')).toBeNull();
  expect(screen.queryByText('DudePayroll connection controls')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Partner' }));
  expect(await screen.findByText('DudePayroll connection controls')).toBeInTheDocument();
});
