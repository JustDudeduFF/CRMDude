import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Logs from './SubscriberLogs';
import { API } from '../../FirebaseConfig';
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
test('activity supports both author formats and can be searched by staff name', async () => {
  localStorage.setItem('susbsUserid', 'subscriber');
  API.get.mockImplementation(url => Promise.resolve({ data: url.includes('/users?') ? [{ empmobile: '123', empname: 'Asha' }] : [{ _id: 'log', modifiedBy: '123', createdAt: '2026-11-10', description: 'Updated contact information' }] }));
  render(<Logs/>);
  expect(await screen.findByText('Asha')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search activity'), { target: { value: 'Asha' } });
  expect(screen.getByText('Updated contact information')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search activity'), { target: { value: 'missing' } });
  expect(screen.getByText('No activity matches your search.')).toBeInTheDocument();
});
