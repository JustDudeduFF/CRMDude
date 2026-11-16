import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventryDash from './InventryDash';
import { API } from '../../FirebaseConfig';
import { validateRows } from './inventoryUtils';
let mockAllowed = [];
jest.mock('../PermissionProvider', () => ({ usePermissions: () => ({ hasPermission: key => mockAllowed.includes(key) }) }));
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() } }));
jest.mock('xlsx', () => ({ utils: {}, writeFile: jest.fn() }));
const product = { _id: 'product-a', category: 'ONU', maker: 'Huawei', model: 'HG8145', source: 'Distributor', stockEnterDate: '2026-11-01', quantity: 2, devices: [{ _id: 'one', serialNumber: 'FIRST', macAddress: '00:11:22:33:44:55', status: 'Free' }, { _id: 'two', serialNumber: 'SECOND', macAddress: '00:11:22:33:44:66', status: 'On Repair' }], cables: [] };
beforeEach(() => {
  jest.clearAllMocks(); mockAllowed = ['VIEW_INVENTORY', 'ADD_DEVICE', 'CHANGE_DEVICE_STATUS'];
  localStorage.setItem('partnerId', 'partner'); localStorage.setItem('contact', 'operator');
  API.get.mockImplementation(url => Promise.resolve({ data: url.includes('devicemaker') ? [{ name: 'Huawei' }] : [product] }));
  API.put.mockResolvedValue({ data: { product } }); API.post.mockResolvedValue({ data: { ...product, _id: 'new' } }); API.delete.mockResolvedValue({ data: {} });
});
test('shows live stock, filters search, and clears filters', async () => {
  render(<InventryDash/>);
  await screen.findByRole('button', { name: 'View HG8145' });
  expect(screen.getByText('1 units')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search inventory'), { target: { value: 'missing' } });
  expect(screen.getByText('No matching products')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByRole('button', { name: 'View HG8145' })).toBeInTheDocument();
});
test('a loading failure shows a retry instead of sample inventory', async () => {
  API.get.mockRejectedValueOnce(new Error('offline'));
  render(<InventryDash/>);
  expect(await screen.findByText('Inventory is unavailable')).toBeInTheDocument();
  expect(screen.queryByText('EchoLife HG8145V5')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByRole('button', { name: 'View HG8145' })).toBeInTheDocument();
});
test('restocking sends the operator and validated device rows', async () => {
  render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Add stock to HG8145' }));
  fireEvent.change(screen.getByLabelText('Serial number 1'), { target: { value: 'NEW-SERIAL' } });
  fireEvent.change(screen.getByLabelText('MAC address 1'), { target: { value: 'aa-bb-cc-dd-ee-ff' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add stock' }));
  await waitFor(() => expect(API.put).toHaveBeenCalledWith('/inventory/add-stock/product-a', expect.objectContaining({ performedBy: 'operator', devices: [{ serialNumber: 'NEW-SERIAL', macAddress: 'AA:BB:CC:DD:EE:FF', status: 'Free' }] })));
});
test('editing filtered stock uses the original index and updates the live product', async () => {
  render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'View HG8145' }));
  fireEvent.change(screen.getByLabelText('Search stock items'), { target: { value: 'SECOND' } });
  fireEvent.click(screen.getByRole('button', { name: 'Edit SECOND' }));
  fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'Free' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
  await waitFor(() => expect(API.put).toHaveBeenCalledWith('/inventory/product-a/device/1', expect.objectContaining({ serialNumber: 'SECOND', status: 'Free' })));
});
test('failed saves preserve user input and allow a retry', async () => {
  API.put.mockRejectedValueOnce({ response: { data: { error: 'Please retry' } } });
  render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Add stock to HG8145' }));
  fireEvent.change(screen.getByLabelText('Serial number 1'), { target: { value: 'NEW-SERIAL' } });
  fireEvent.change(screen.getByLabelText('MAC address 1'), { target: { value: 'AA:BB:CC:DD:EE:FF' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add stock' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Please retry');
  expect(screen.getByLabelText('Serial number 1')).toHaveValue('NEW-SERIAL');
  fireEvent.click(screen.getByRole('button', { name: 'Add stock' }));
  await waitFor(() => expect(API.put).toHaveBeenCalledTimes(2));
});
test('view-only users have no mutation controls', async () => {
  mockAllowed = ['VIEW_INVENTORY']; render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'View HG8145' }));
  expect(screen.queryByRole('button', { name: 'Edit FIRST' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add stock' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Delete HG8145' })).not.toBeInTheDocument();
});
test('spreadsheet validation normalizes MAC addresses and rejects equivalent duplicates', () => {
  expect(validateRows([{ serialNumber: 1234, macAddress: 'aa-bb-cc-dd-ee-ff' }])[0].macAddress).toBe('AA:BB:CC:DD:EE:FF');
  expect(() => validateRows([{ serialNumber: 'one', macAddress: 'aa-bb-cc-dd-ee-ff' }, { serialNumber: 'two', macAddress: 'AA:BB:CC:DD:EE:FF' }])).toThrow(/duplicate/);
  expect(() => validateRows([{ drumNumber: 'drum', totalLength: -1 }], true)).toThrow(/greater than zero/);
});
test('restocking prevents duplicates already present in warehouse stock', async () => {
  render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'Add stock to HG8145' }));
  fireEvent.change(screen.getByLabelText('Serial number 1'), { target: { value: 'FIRST' } });
  fireEvent.change(screen.getByLabelText('MAC address 1'), { target: { value: 'AA:BB:CC:DD:EE:FF' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add stock' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('already in stock');
  expect(API.put).not.toHaveBeenCalled();
});
test('new cable products are created from drum rows with a calculated length', async () => {
  render(<InventryDash/>);
  await screen.findByRole('button', { name: 'View HG8145' });
  fireEvent.click(screen.getByRole('button', { name: 'Add product' }));
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Cable' } });
  fireEvent.change(screen.getByLabelText('Manufacturer'), { target: { value: 'Corning' } });
  fireEvent.change(screen.getByLabelText('Model / product name'), { target: { value: 'Cat6' } });
  fireEvent.change(screen.getByLabelText('Supplier / source'), { target: { value: 'Supplier' } });
  fireEvent.change(screen.getByLabelText('Drum number 1'), { target: { value: 'DRUM-1' } });
  fireEvent.change(screen.getByLabelText('Drum length 1'), { target: { value: '100' } });
  fireEvent.click(screen.getByRole('button', { name: 'Create product' }));
  await waitFor(() => expect(API.post).toHaveBeenCalledWith('/inventory/add', expect.objectContaining({ category: 'Cable', partnerId: 'partner', cables: [{ drumNumber: 'DRUM-1', totalLength: 100, availableLength: 100 }] })));
});
test('zero remaining cable length can be saved', async () => {
  const cable = { ...product, _id: 'cable', category: 'Cable', devices: [], cables: [{ _id: 'drum', drumNumber: 'DRUM-1', totalLength: 100, availableLength: 40 }] };
  API.get.mockResolvedValue({ data: [cable] }); API.put.mockResolvedValue({ data: { product: cable } });
  render(<InventryDash/>);
  fireEvent.click(await screen.findByRole('button', { name: 'View HG8145' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit DRUM-1' }));
  fireEvent.change(screen.getByLabelText('Available length (m)'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save item' }));
  await waitFor(() => expect(API.put).toHaveBeenCalledWith('/inventory/cable/cable/0', expect.objectContaining({ availableLength: '0' })));
});
test('inventory access is checked before fetching stock', () => {
  mockAllowed = []; render(<InventryDash/>);
  expect(screen.getByRole('alert')).toHaveTextContent('access');
  expect(API.get).not.toHaveBeenCalled();
});
