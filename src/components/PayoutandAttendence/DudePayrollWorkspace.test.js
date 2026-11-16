import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {API} from '../../FirebaseConfig';
import DudePayrollWorkspace from './DudePayrollWorkspace';
import PayrollConnectionSettings from './PayrollConnectionSettings';
import {usePermissions} from '../PermissionProvider';
jest.mock('../PermissionProvider',()=>({usePermissions:jest.fn()}));
jest.mock('../../FirebaseConfig',()=>({API:{get:jest.fn(),post:jest.fn(),put:jest.fn(),patch:jest.fn(),delete:jest.fn()}}));
jest.mock('react-router-dom',()=>({Link:({to,children,...props})=><a href={to} {...props}>{children}</a>}),{virtual:true});
jest.mock('xlsx',()=>({utils:{},writeFile:jest.fn()}));
beforeEach(()=>{
 jest.clearAllMocks();
 usePermissions.mockReturnValue({hasPermission:key=>key==='ACCOUNT_SECTION'});
 API.get.mockImplementation(url=>Promise.resolve({data:url.endsWith('/status')?{connected:true,canManage:true}:url.endsWith('/connection')?{connected:true,expiresAt:'2027-01-01'}:url.endsWith('/employees')?{payroll:[{id:'emp-a',name:'Test Employee',isActive:true}],employees:[]}: {data:[],currency:'INR'}}));
 API.post.mockResolvedValue({data:{count:1}});API.put.mockResolvedValue({data:{}});
});
test('workspace generates through DudePayroll, with settings on partner page',async()=>{
 render(<DudePayrollWorkspace/>);
 const generate=await screen.findByRole('button',{name:'Generate / recalculate drafts'});
 await waitFor(()=>expect(generate).toBeEnabled());
 expect(screen.queryByLabelText('DudePayroll token')).not.toBeInTheDocument();
 expect(screen.queryByRole('link',{name:'Integration settings'})).not.toBeInTheDocument();
 expect(screen.queryByRole('heading',{name:'DudePayroll'})).not.toBeInTheDocument();
 fireEvent.click(generate);
 await waitFor(()=>expect(API.post).toHaveBeenCalledWith('/payroll-integration/generate',expect.objectContaining({month:expect.any(String)}),expect.any(Object)));
});
test('attendance loads and saves through DudePayroll',async()=>{
 render(<DudePayrollWorkspace/>);
 await screen.findByRole('button',{name:'Generate / recalculate drafts'});
 fireEvent.click(screen.getByRole('tab',{name:'Attendance'}));
 await waitFor(()=>expect(API.get).toHaveBeenCalledWith('/payroll-integration/workspace/attendance',expect.any(Object)));
 await waitFor(()=>expect(screen.getByRole('button',{name:'Add attendance'})).toBeEnabled());
 fireEvent.click(screen.getByRole('button',{name:'Add attendance'}));
 fireEvent.change(screen.getByLabelText('Employee'),{target:{value:'emp-a'}});
 fireEvent.click(screen.getByRole('button',{name:'Save to DudePayroll'}));
 await waitFor(()=>expect(API.post).toHaveBeenCalledWith('/payroll-integration/workspace/attendance',expect.objectContaining({employeeId:'emp-a',status:'present',totalHours:8})));
});
test('partner settings save token without embedding payroll workspace',async()=>{
 render(<PayrollConnectionSettings/>);
 const token='dp_'+'a'.repeat(64);
 fireEvent.change(screen.getByLabelText('DudePayroll token'),{target:{value:token}});
 fireEvent.click(screen.getByRole('button',{name:'Save / replace token'}));
 await waitFor(()=>expect(API.put).toHaveBeenCalledWith('/payroll-integration/connection',{token}));
 expect(screen.queryByRole('tab',{name:'Payroll & payslips'})).not.toBeInTheDocument();
});
test('malformed response shows an error without blanking the workspace',async()=>{
 API.get.mockImplementation(url=>Promise.resolve({data:url.endsWith('/status')?{connected:true,canManage:true}: '<html>old server</html>'}));
 render(<DudePayrollWorkspace/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Unexpected DudePayroll response');
 expect(screen.getByRole('tab',{name:'Payroll & payslips'})).toBeInTheDocument();
});

test('net payroll uses rupees and Indian number formatting even when API returns USD',async()=>{
 API.get.mockImplementation(url=>Promise.resolve({data:url.endsWith('/status')?{connected:true,canManage:true}:url.endsWith('/employees')?{payroll:[]}: {data:[{id:'payout-a',employeeId:'emp-a',netSalary:125000,status:'paid'}],currency:'USD'}}));
 render(<DudePayrollWorkspace/>);
 await waitFor(()=>expect(screen.getAllByText('₹1,25,000').length).toBe(2));
 expect(screen.queryByText(/USD/)).not.toBeInTheDocument();
});

test('without Account Section permission salary sections and financial requests are absent',async()=>{
 usePermissions.mockReturnValue({hasPermission:()=>false});
 render(<DudePayrollWorkspace/>);
 await waitFor(()=>expect(API.get).toHaveBeenCalledWith('/payroll-integration/workspace/attendance',expect.any(Object)));
 expect(screen.queryByRole('tab',{name:'Payroll & payslips'})).not.toBeInTheDocument();
 expect(screen.queryByRole('tab',{name:'Salary advances'})).not.toBeInTheDocument();
 expect(screen.queryByText('Net payroll')).not.toBeInTheDocument();
 expect(API.get).not.toHaveBeenCalledWith('/payroll-integration/payouts',expect.anything());
 expect(API.get).not.toHaveBeenCalledWith('/payroll-integration/workspace/advances',expect.anything());
 await waitFor(()=>expect(screen.queryByText('Loading DudePayroll…')).not.toBeInTheDocument());
});
test('revoking Account Section immediately hides open payslip data',async()=>{
 API.get.mockImplementation(url=>Promise.resolve({data:url.endsWith('/status')?{connected:true,canManage:true}:url.endsWith('/employees')?{payroll:[]}: {data:[{id:'payout-a',employeeId:'emp-a',netSalary:125000,status:'paid'}]}}));
 const {rerender}=render(<DudePayrollWorkspace/>);
 fireEvent.click(await screen.findByRole('button',{name:'Payslip details'}));
 expect(screen.getByRole('dialog')).toHaveTextContent('₹1,25,000');
 usePermissions.mockReturnValue({hasPermission:()=>false});
 rerender(<DudePayrollWorkspace/>);
 await waitFor(()=>expect(screen.queryByText('Loading DudePayroll…')).not.toBeInTheDocument());
 expect(screen.queryByText(/Net payout:/)).not.toBeInTheDocument();
 expect(screen.queryByRole('tab',{name:'Payroll & payslips'})).not.toBeInTheDocument();
});
