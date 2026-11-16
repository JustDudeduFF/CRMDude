import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RackView from './RackView';
import { API } from '../../FirebaseConfig';
let mockAllowed = [];
jest.mock('../PermissionProvider', () => ({ usePermissions: () => ({ hasPermission: key => mockAllowed.includes(key) }) }));
jest.mock('../../FirebaseConfig', () => ({ API: { get:jest.fn(), post:jest.fn(), put:jest.fn(), delete:jest.fn() } }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({state:{rackId:'rack', officeKey:'office', officename:'Main'}}) }), {virtual:true});
jest.mock('./SYOLT', () => () => <div>OLT</div>);
jest.mock('./Switch', () => () => <div>Switch</div>);
jest.mock('./FMS', () => () => <div>FMS</div>);
beforeEach(() => {
 jest.clearAllMocks(); mockAllowed=['VIEW_RACK'];
 API.get.mockResolvedValue({data:{data:{devices:{'olt-one':{device:'OLT',deviceKey:1}}}}});
});
test('view-only users cannot add, edit or delete devices', async () => {
 render(<RackView/>);
 expect(await screen.findByRole('button',{name:'+ Add Device'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Edit'})).toBeDisabled();
 fireEvent.click(screen.getByRole('button',{name:'Delete'}));
 expect(API.delete).not.toHaveBeenCalled();
});
test('add and update permissions independently control actions', async () => {
 mockAllowed=['VIEW_RACK','ADD_RACK_DEVICE'];
 const {rerender}=render(<RackView/>);
 expect(await screen.findByRole('button',{name:'+ Add Device'})).toBeEnabled();
 expect(screen.getByRole('button',{name:'Edit'})).toBeDisabled();
 mockAllowed=['VIEW_RACK','UPDATE_RACK']; rerender(<RackView/>);
 expect(screen.getByRole('button',{name:'+ Add Device'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Edit'})).toBeEnabled();
});
test('without view permission no rack data is fetched', () => {
 mockAllowed=[]; render(<RackView/>);
 expect(screen.getByRole('alert')).toHaveTextContent('permission');
 expect(API.get).not.toHaveBeenCalled();
});
