import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import Summary from './SubscriberDetails';
import Payments from './Cust_PayRecpt';
import Tickets from './TicketsTable';
import Inventory from './InventoryTable';
import Notes from './DebitCreditTable';
import Remarks from './RemakFollowTable';
import Documents from './DocumentUpload';
import { API } from '../../FirebaseConfig';
let mockPath = '/dashboard/subscriber', mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPath, state: {} }), useNavigate: () => mockNavigate,
  Routes: () => null, Route: () => null, Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn() } }));
jest.mock('../ProtectedRoute', () => ({ children }) => <>{children}</>);
jest.mock('./SubscriberPersonal', () => () => null);
jest.mock('./RechargeTable', () => () => null);
jest.mock('./ReceiptModify', () => () => null);
jest.mock('./PaymetTable', () => () => null);
jest.mock('./TicketTable', () => () => null);
jest.mock('./NewTicket', () => () => null);
jest.mock('./ModifyTicket', () => () => null);
jest.mock('./InventorysTable', () => () => null);
jest.mock('./AddInvetory', () => () => null);
jest.mock('./InventryModify', () => () => null);
jest.mock('./DebitCreditsTable', () => () => null);
jest.mock('./CreateNote', () => () => null);
jest.mock('./ModDCNote', () => () => null);
jest.mock('./RemarkFollowsTable', () => () => null);
jest.mock('./ModRemFollow', () => () => null);
jest.mock('./AddRemarkFollow', () => () => null);
jest.mock('./DocumetUploadTable', () => () => null);
jest.mock('./AddNewDoc', () => () => null);
beforeEach(() => {
  jest.clearAllMocks(); localStorage.setItem('susbsUserid', 'subscriber');
  API.get.mockImplementation(url => Promise.resolve({ status: 200, data: url.includes('colonys') ? [] : { result: {} } }));
});
test.each([
  [Summary, '/dashboard/subscriber', 'Summary', 'Recharge history', 'rechargeinfo'],
  [Tickets, '/dashboard/subscriber/tickets', 'Tickets', 'New ticket', 'newticket'],
  [Inventory, '/dashboard/subscriber/inventory', 'Inventory', 'Assign device', 'addproduct'],
  [Notes, '/dashboard/subscriber/dcnote', 'Debit & credit notes', 'Add credit', 'add_cnotes'],
  [Remarks, '/dashboard/subscriber/remarkfollow', 'Remarks & follow-ups', 'Add remark', 'add_remark'],
  [Documents, '/dashboard/subscriber/documents', 'Documents', 'Upload document', 'upload_doc'],
])('section %s has a consistent heading and working action link', async (Component, path, title, action, target) => {
  mockPath = path;
  await act(async () => { render(<Component/>); });
  expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: action })).toHaveAttribute('href', target);
  expect(screen.queryByAltText('Excel')).not.toBeInTheDocument();
});
test('the payment action uses the selected subscriber when opened directly', async () => {
  mockPath = '/dashboard/subscriber/paymentreceipt'; render(<Payments/>);
  expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Create receipt' }));
  expect(mockNavigate).toHaveBeenCalledWith('collect', { state: { userid: 'subscriber' } });
});
test('document uploads have a clear return path and no duplicate upload action', () => {
  mockPath = '/dashboard/subscriber/documents/upload_doc'; render(<Documents/>);
  expect(screen.getByRole('heading', { name: 'Upload a document' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to list' })).toHaveAttribute('href', '/dashboard/subscriber/documents');
  expect(screen.queryByRole('link', { name: 'Upload document' })).not.toBeInTheDocument();
});
