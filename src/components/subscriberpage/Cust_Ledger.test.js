import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Ledger, { ledgerStatement } from './Cust_Ledger';
import { API } from '../../FirebaseConfig';
jest.mock('../../FirebaseConfig', () => ({ API: { get: jest.fn() } }));
jest.mock('react-router-dom', () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }), { virtual: true });
beforeEach(() => { jest.clearAllMocks(); localStorage.setItem('susbsUserid', 'subscriber'); });
test('ledger dates are sorted chronologically before computing balances', () => {
  const rows = ledgerStatement([{ date: '02-02-2026', debitamount: 100 }, { date: '20-01-2026', creditamount: 25 }, { date: '2026-01-10', debitamount: 50 }]);
  expect(rows.map(row => row.balance)).toEqual([50, 25, 125]);
});
test('filtering ledger entries preserves the full-statement balance', async () => {
  API.get.mockResolvedValue({ data: [{ _id: 'a', date: '2026-01-01', type: 'Charge', particular: 'Opening charge', debitamount: 100 }, { _id: 'b', date: '2026-01-02', type: 'Payment', particular: 'Payment received', creditamount: 30 }] });
  render(<Ledger/>);
  await screen.findByText('Payment received');
  fireEvent.change(screen.getByLabelText('Search ledger entries'), { target: { value: 'Payment received' } });
  const row = screen.getByText('Payment received').closest('tr');
  expect(within(row).getByText('₹70 Dr')).toBeInTheDocument();
  expect(screen.queryByText('Opening charge')).not.toBeInTheDocument();
});
test('a failed ledger request can be retried', async () => {
  API.get.mockRejectedValueOnce(new Error()).mockResolvedValueOnce({ data: [] });
  render(<Ledger/>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load');
  fireEvent.click(screen.getByRole('button', { name: 'Refresh ledger entries' }));
  expect(await screen.findByText('No transactions recorded for this account.')).toBeInTheDocument();
});
