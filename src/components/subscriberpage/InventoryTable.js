import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import InventorysTable from './InventorysTable';
import AddInvetory from './AddInvetory';
import InventryModify from './InventryModify';
import ProtectedRoute from '../ProtectedRoute';
import { Package, Plus } from 'lucide-react';
import SubscriberSection, { SectionAction } from './SubscriberSection';

export default function InventoryTable() {
  const location = useLocation();
  const form = /addproduct|modinvent/.test(location.pathname);
  return <SubscriberSection title={form ? 'Assign inventory' : 'Inventory'} description={form ? 'Select available equipment for this subscriber.' : 'Equipment assigned to this subscriber and its current status.'} icon={Package} backTo={form ? '/dashboard/subscriber/inventory' : undefined} actions={!form && <SectionAction to="addproduct"><Plus size={15}/> Assign device</SectionAction>}>
    <Routes>
          <Route path='/' element={<InventorysTable/>}/>
          <Route path='addproduct' element={
            <ProtectedRoute permission={["ADD_DEVICE", "ASSIGN_DEVICE"]}>
              <AddInvetory/>
            </ProtectedRoute>
          }/> 
          <Route path='modinvent' element={
            <ProtectedRoute permission="CHANGE_DEVICE_STATUS">
              <InventryModify/>
            </ProtectedRoute>
          }/>
        </Routes>
  </SubscriberSection>;
}
