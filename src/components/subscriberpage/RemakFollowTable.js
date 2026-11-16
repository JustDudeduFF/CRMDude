import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import RemarkFollowsTable from './RemarkFollowsTable';
import ModRemFollow from './ModRemFollow';
import AddRemarkFollow from './AddRemarkFollow';
import { MessageSquare, CalendarPlus, Plus } from 'lucide-react';
import SubscriberSection, { SectionAction } from './SubscriberSection';

export default function RemakFollowTable() {
  const location = useLocation();
  const form = /add_|modremfollow/.test(location.pathname);
  return <SubscriberSection title={form ? (location.pathname.includes('add_follow') ? 'Schedule a follow-up' : 'Subscriber remark') : 'Remarks & follow-ups'} description={form ? 'Keep the next person informed with a clear note.' : 'Customer conversations, notes and upcoming follow-ups.'} icon={MessageSquare} backTo={form ? '/dashboard/subscriber/remarkfollow' : undefined} actions={!form && <><SectionAction to="add_follow" secondary><CalendarPlus size={15}/> Schedule follow-up</SectionAction><SectionAction to="add_remark"><Plus size={15}/> Add remark</SectionAction></>}>
    <Routes>
          <Route path="/" element={<RemarkFollowsTable />} />
          <Route path="modremfollow" element={<ModRemFollow />} />
          <Route path="add_remark" element={<AddRemarkFollow mode={"remark"} />} />
          <Route path="add_follow" element={<AddRemarkFollow mode={"follow"} />} />
        </Routes>
  </SubscriberSection>;
}
