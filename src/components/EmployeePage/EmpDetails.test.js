import React from 'react';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import EmpDetails from './EmpDetails';
import {API} from '../../FirebaseConfig';
jest.mock('../../FirebaseConfig',()=>({API:{get:jest.fn(),put:jest.fn()}}));
jest.mock('react-router-dom',()=>({useLocation:()=>({state:{mobile:'employee-a'}})}),{virtual:true});
beforeEach(()=>{
 jest.clearAllMocks();
 API.get.mockImplementation(url=>Promise.resolve({data:url.includes('/master/offices')?[{_id:'office-a',name:'Main Office',address:'Delhi',lat:'28.6',long:'77.2'},{_id:'office-b',name:'Branch Office',address:'Noida'}]:url.includes('/master/designations')?[]:{_id:'employee-a',FULLNAME:'Asha',DOJ:'2025-05-01',USERTYPE:'web',SALARY:25000,MARKING_OFFICE:'Main Office',ACCOUNTNAME:'Asha',UPI:'asha@upi',DRIVING:'DL123',status:'active'}}));
 API.put.mockResolvedValue({data:{}});
});
test('profile shows employee details without payroll-managed controls',async()=>{
 render(<EmpDetails/>);
 expect(await screen.findByLabelText('Joining Date')).toHaveValue('2025-05-01');
 expect(screen.getByLabelText('Account Holder Name')).toHaveValue('Asha');
 expect(screen.getByLabelText('UPI ID')).toHaveValue('asha@upi');
 expect(screen.getByLabelText('Driving Licence')).toHaveValue('DL123');
 expect(screen.queryByText('Attendance Marking Location')).not.toBeInTheDocument();
 expect(screen.queryByLabelText('Monthly Salary (₹)')).not.toBeInTheDocument();
 expect(document.querySelector('[name="INTIME_H"]')).toBeNull();
 expect(document.querySelector('[name="OUTTIME_H"]')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Edit Profile'}));
 fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));
 await waitFor(()=>expect(API.put).toHaveBeenCalledWith('/employees/employee-a',expect.objectContaining({FULLNAME:'Asha'})));
});

test('Account Section permission can be assigned and saved for existing employees',async()=>{
 render(<EmpDetails/>);
 await screen.findByLabelText('Joining Date');
 fireEvent.click(screen.getByRole('button',{name:'Edit Profile'}));
 fireEvent.click(screen.getByRole('button',{name:'Access Rights'}));
 const account=screen.getByRole('checkbox',{name:'Account Section'});
 expect(account).not.toBeChecked();
 fireEvent.click(account);
 fireEvent.click(screen.getByRole('button',{name:'Save Changes'}));
 await waitFor(()=>expect(API.put).toHaveBeenCalledWith('/employees/employee-a',expect.objectContaining({payoutpermission:expect.objectContaining({ACCOUNT_SECTION:true})})));
});
