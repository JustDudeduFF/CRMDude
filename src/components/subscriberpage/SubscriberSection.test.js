import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRecordView, RecordToolbar, RecordFooter, exportRecords } from './SubscriberSection';
jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a> }), { virtual: true });
const records = Array.from({ length: 23 }, (_, index) => ({ name: `Entry ${index + 1}`, status: index % 2 ? 'Completed' : 'Open' }));
function Example() {
  const view = useRecordView(records);
  return <><RecordToolbar view={view} label="test records"/><ul>{view.records.map(row => <li key={row.name}>{row.name}</li>)}</ul><RecordFooter view={view} label="test records"/></>;
}
test('paging and filters retain correct counts and reset the page', () => {
  render(<Example/>);
  expect(screen.getAllByRole('listitem')).toHaveLength(10);
  fireEvent.click(screen.getByRole('button', { name: 'Next test records page' }));
  expect(screen.getByText('Entry 11')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Filter test records'), { target: { value: 'Completed' } });
  expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  expect(screen.queryByText('Entry 1')).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search test records'), { target: { value: 'Entry 22' } });
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByText('1–1 of 1 test records (23 total)')).toBeInTheDocument();
});
test('an empty search disables export and navigation', () => {
  render(<Example/>);
  fireEvent.change(screen.getByLabelText('Search test records'), { target: { value: 'not found' } });
  expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Next test records page' })).toBeDisabled();
  expect(screen.getByText('0 of 0 test records (23 total)')).toBeInTheDocument();
});
test('CSV downloads quote text and protect formula-like values', async () => {
  let csvBlob;
  URL.createObjectURL = jest.fn(blob => { csvBlob = blob; return 'blob:export'; });
  URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  exportRecords([{ name: 'A, "quoted" name', description: '=1+1', amount: 125 }], 'example');
  const content = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(csvBlob); });
  expect(content).toContain('"A, ""quoted"" name"');
  expect(content).toContain("'=1+1");
  expect(content).toContain('"125"');
  expect(click).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:export');
  click.mockRestore();
});
