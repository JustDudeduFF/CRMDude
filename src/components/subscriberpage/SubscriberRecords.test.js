import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Documents from './DocumetUploadTable';
import Inventory from './InventorysTable';
import { API } from '../../FirebaseConfig';
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn(), put: jest.fn(), delete: jest.fn() }, API_ORIGIN: 'https://crm.example' }));
jest.mock('../PermissionProvider', () => ({ usePermissions: () => ({ hasPermission: () => false }) }));
jest.mock('react-router-dom', () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
beforeEach(() => { jest.clearAllMocks(); localStorage.setItem('susbsUserid', 'subscriber'); });
test('documents can be searched and their existing file links remain available', async () => {
  API.get.mockResolvedValue({ data: [{ _id: 'doc', documentname: 'Installation form', source: 'User', date: '2026-11-01', modifiedby: 'Asha', url: '/documentsCRM/form.pdf' }] });
  render(<Documents/>);
  const link = await screen.findByRole('link', { name: 'View Installation form' });
  expect(link).toHaveAttribute('href', 'https://crm.example/documentsCRM/form.pdf');
  fireEvent.change(screen.getByLabelText('Search documents'), { target: { value: 'missing' } });
  expect(screen.queryByRole('link', { name: 'View Installation form' })).not.toBeInTheDocument();
  expect(screen.getByText('0 of 0 documents (1 total)')).toBeInTheDocument();
});
test('documents show a retryable error instead of an empty repository on failure', async () => {
  API.get.mockRejectedValueOnce(new Error()).mockResolvedValueOnce({ data: [] });
  render(<Documents/>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load documents');
  fireEvent.click(screen.getByRole('button', { name: 'Refresh documents' }));
  expect(await screen.findByText('No documents available in the repository.')).toBeInTheDocument();
});
test('assigned inventory remains searchable without invoking mutation APIs', async () => {
  API.get.mockResolvedValue({ data: [{ _id: 'device-abcdef', itemMaker: 'Huawei', itemCategory: 'ONU', assignedAt: '2026-11-01', serialNumber: 'SERIAL-A', macAddress: '00:11:22:33:44:55', amount: '500', status: 'Active' }] });
  render(<Inventory/>);
  expect(await screen.findByText('SERIAL-A')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search inventory'), { target: { value: 'SERIAL-A' } });
  expect(screen.getByText('Huawei')).toBeInTheDocument();
  expect(API.put).not.toHaveBeenCalled(); expect(API.delete).not.toHaveBeenCalled();
});
