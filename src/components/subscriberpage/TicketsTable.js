import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TicketTable from './TicketTable';
import NewTicket from './NewTicket';
import ModifyTicket from './ModifyTicket';
import ProtectedRoute from '../ProtectedRoute';
import { Ticket, Plus } from 'lucide-react';
import SubscriberSection, { SectionAction } from './SubscriberSection';

export default function TicketsTable() {
  const location = useLocation();
  const form = /newticket|modifyticket/.test(location.pathname);
  return <SubscriberSection title={form ? 'Ticket details' : 'Tickets'} description={form ? 'Record the concern and assign the next step.' : 'Track support requests, assignments and resolutions.'} icon={Ticket} backTo={form ? '/dashboard/subscriber/tickets' : undefined} actions={!form && <SectionAction to="newticket"><Plus size={15}/> New ticket</SectionAction>}>
    <Routes>
          <Route path='/' element={<TicketTable/>}/>
          <Route path='newticket' element={
            <ProtectedRoute permission="CREATE_TICKET">
              <NewTicket/>
            </ProtectedRoute>
          }/>
          <Route path='modifyticket' element={
            <ProtectedRoute permission="CLOSE_TICKET">
              <ModifyTicket/>
            </ProtectedRoute>
          }/>
        </Routes>
  </SubscriberSection>;
}
