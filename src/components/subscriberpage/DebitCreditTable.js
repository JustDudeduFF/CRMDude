import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DebitCreditsTable from './DebitCreditsTable';
import CreateNote from './CreateNote';
import ModDCNote from './ModDCNote';
import ProtectedRoute from '../ProtectedRoute';
import { ReceiptText, Plus } from 'lucide-react';
import SubscriberSection, { SectionAction } from './SubscriberSection';

export default function DebitCreditTable() {
  const location = useLocation();
  const form = /add_|modnote/.test(location.pathname);
  return <SubscriberSection title={form ? 'Billing adjustment' : 'Debit & credit notes'} description={form ? 'Review the adjustment details before saving.' : 'Billing adjustments and their supporting notes.'} icon={ReceiptText} backTo={form ? '/dashboard/subscriber/dcnote' : undefined} actions={!form && <><SectionAction to="add_dnotes" secondary><Plus size={15}/> Add debit</SectionAction><SectionAction to="add_cnotes"><Plus size={15}/> Add credit</SectionAction></>}>
    <Routes>
          <Route path='/' element={<DebitCreditsTable/>}/>
          <Route path='add_dnotes' element={
            <ProtectedRoute permission="CREATE_CREDIT">
              <CreateNote notety={"danger"}/>
            </ProtectedRoute>
          }/>
          <Route path='add_cnotes' element={
            <ProtectedRoute permission="CREATE_DEBIT">
              <CreateNote notety={"success"}/>
            </ProtectedRoute>
          }/>
          <Route path='modnote' element={<ModDCNote/>}/>
        </Routes>
  </SubscriberSection>;
}
