import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import DailyAttendanceLogs from './DailyAttendanceLogs';
import {API} from '../FirebaseConfig';
let mockPermissions=[];
jest.mock('./PermissionProvider',()=>({usePermissions:()=>({hasPermission:key=>mockPermissions.includes(key)})}));
jest.mock('../FirebaseConfig',()=>({API:{get:jest.fn()}}));
jest.mock('react-router-dom',()=>({Link:({to,children,...props})=><a href={to} {...props}>{children}</a>}),{virtual:true});
beforeEach(()=>{
 jest.clearAllMocks(); mockPermissions=['VIEW_ATTENDENCE','EDIT_EMP_PERMISSION','VIEW_PAYOUT'];
 API.get.mockImplementation((url,{params}={})=>Promise.resolve({data:url.endsWith('/employees')?{payroll:[{id:'one',name:'Asha'}]}:{data:[{id:'log',employeeId:'one',date:`${params.month}-01`,checkIn:{time:'09:30'},checkOut:{time:'18:00'},status:'present'}]}}));
});
test('team logs filter by selected day and resolve names and punch times',async()=>{
 render(<DailyAttendanceLogs/>);
 fireEvent.change(screen.getByLabelText('Attendance date'),{target:{value:'2026-10-01'}});
 expect(await screen.findByText('Asha')).toBeInTheDocument();
 expect(screen.getByText('09:30')).toBeInTheDocument();
 expect(screen.getByText('18:00')).toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Open monthly attendance'})).toHaveAttribute('href','/dashboard/payrollandattendence?tab=attendance');
 fireEvent.change(screen.getByLabelText('Attendance date'),{target:{value:'2026-10-02'}});
 expect(await screen.findByText('No attendance recorded for this date.')).toBeInTheDocument();
});
test('non-managers use only their own attendance endpoint',async()=>{
 mockPermissions=['VIEW_ATTENDENCE'];
 render(<DailyAttendanceLogs/>);
 await waitFor(()=>expect(API.get).toHaveBeenCalledWith('/payroll-integration/my-attendance',expect.any(Object)));
 expect(API.get).not.toHaveBeenCalledWith('/payroll-integration/employees');
 expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
test('no permission means no attendance fetch',()=>{
 mockPermissions=[]; const {container}=render(<DailyAttendanceLogs/>);
 expect(container).toBeEmptyDOMElement(); expect(API.get).not.toHaveBeenCalled();
});
test('connection errors show a useful message',async()=>{
 API.get.mockRejectedValue({response:{data:{message:'Connect payroll in CRMDude first'}}});
 render(<DailyAttendanceLogs/>);
 expect(await screen.findByRole('alert')).toHaveTextContent('Connect payroll in CRMDude first');
});
