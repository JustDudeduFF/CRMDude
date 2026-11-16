import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import AddInventory from './AddInvetory';
import {API} from '../../FirebaseConfig';
let mockAllowed=true;
jest.mock('../PermissionProvider',()=>({usePermissions:()=>({hasPermission:()=>mockAllowed})}));
jest.mock('../../FirebaseConfig',()=>({API:{get:jest.fn(),post:jest.fn()}}));
jest.mock('react-router-dom',()=>({useNavigate:()=>jest.fn(),Link:({to,children,...props})=><a href={to} {...props}>{children}</a>}),{virtual:true});
const product={_id:'product',maker:'Huawei',model:'HG8145',category:'ONU',devices:[{_id:'free',serialNumber:'AVAILABLE',macAddress:'00:11:22:33:44:55',status:'Free'},{_id:'installed',serialNumber:'INSTALLED',macAddress:'00:11:22:33:44:66',status:'Installed'}]};
beforeEach(()=>{
 jest.clearAllMocks();mockAllowed=true;localStorage.setItem('partnerId','partner');localStorage.setItem('susbsUserid','subscriber');localStorage.setItem('contact','operator');
 API.get.mockResolvedValue({data:[product]});API.post.mockResolvedValue({status:201,data:{}});
});
async function selectDevice(){
 await screen.findByRole('option',{name:'Huawei'});
 fireEvent.change(screen.getByLabelText('Manufacturer'),{target:{value:'Huawei'}});
 fireEvent.change(screen.getByLabelText('Product'),{target:{value:'product'}});
 fireEvent.click(screen.getByRole('radio',{name:/AVAILABLE/}));
}
test('only available devices can be selected, then assignment shows a success state',async()=>{
 render(<AddInventory/>);await selectDevice();
 expect(screen.queryByRole('radio',{name:/INSTALLED/})).not.toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Device charge (₹)'),{target:{value:'250'}});
 fireEvent.click(screen.getByRole('button',{name:'Assign device'}));
 await waitFor(()=>expect(API.post).toHaveBeenCalledWith('/subscriber/inventory',expect.objectContaining({serialNumber:'AVAILABLE',subscriber:'subscriber',amount:250,assignedBy:'operator'})));
 expect(await screen.findByRole('link',{name:'View assigned devices'})).toHaveAttribute('href','/dashboard/subscriber/inventory');
 expect(API.post).toHaveBeenCalledTimes(1);
});
test('failed assignments keep the selected device and entered charge',async()=>{
 API.post.mockRejectedValueOnce({response:{data:{error:'Try again'}}});
 render(<AddInventory/>);await selectDevice();
 fireEvent.change(screen.getByLabelText('Device charge (₹)'),{target:{value:'125'}});
 fireEvent.click(screen.getByRole('button',{name:'Assign device'}));
 expect(await screen.findByRole('alert')).toHaveTextContent('Try again');
 expect(screen.getByLabelText('Device charge (₹)')).toHaveValue(125);
 expect(screen.getByRole('radio',{name:/AVAILABLE/})).toBeChecked();
});
test('without assignment permissions no stock is fetched',()=>{
 mockAllowed=false;render(<AddInventory/>);
 expect(screen.getByRole('alert')).toHaveTextContent('permission');expect(API.get).not.toHaveBeenCalled();
});
