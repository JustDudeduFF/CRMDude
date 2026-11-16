import React, { useEffect, useMemo, useState } from 'react';
import { History, Activity } from 'lucide-react';
import { API } from '../../FirebaseConfig';
import SubscriberSection, { useRecordView, RecordToolbar, RecordFooter, recordDate } from './SubscriberSection';

export default function SubscriberLogs() {
  const username = localStorage.getItem('susbsUserid'), partnerId = localStorage.getItem('partnerId');
  const [logs, setLogs] = useState([]), [users, setUsers] = useState({}), [loading, setLoading] = useState(true), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setError('');
    API.get(`/subscriber/logs/${username}`).then(({ data }) => {
      if (!data || typeof data !== 'object') throw new Error();
      if (active) setLogs(Array.isArray(data) ? data : Object.values(data));
    }).catch(() => { if (active) setError('Unable to load activity. Refresh to try again.'); }).finally(() => { if (active) setLoading(false); });
    API.get(`/subscriber/users?partnerId=${partnerId}`).then(({ data }) => { if (active) setUsers(Object.fromEntries(Object.values(data || {}).map(user => [user.empmobile, user.empname]))); }).catch(() => {});
    return () => { active = false; };
  }, [username, partnerId, refresh]);
  const entries = useMemo(() => logs.map(log => ({ ...log, author: users[log.modifiedby || log.modifiedBy] || log.modifiedby || log.modifiedBy || 'System', timestamp: log.updatedAt || log.createdAt || log.date })).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)), [logs, users]);
  const view = useRecordView(entries, { statusKey: 'eventType' });
  return <SubscriberSection title="Activity logs" description="A chronological record of subscriber changes and interactions." icon={History}>
    {error && <div className="sub-record-alert" role="alert">{error}</div>}
    <div className="sub-record-panel"><RecordToolbar view={view} label="activity" filename="subscriber-activity" loading={loading} exportDisabled={!!error} onRefresh={() => setRefresh(value => value + 1)}/>
      {loading ? <div className="sub-record-empty" role="status">Loading activity…</div> : error ? <div className="sub-record-empty">Activity is unavailable.</div> : view.records.length ? <div className="sub-activity-list">{view.records.map((entry, index) => <article className="sub-activity-entry" key={entry._id || index}><span className="sub-activity-icon"><Activity size={16}/></span><div><p>{entry.description || 'Subscriber record updated'}</p><div className="sub-activity-meta"><time dateTime={entry.timestamp}>{recordDate(entry.timestamp)}{entry.timestamp && !Number.isNaN(new Date(entry.timestamp).getTime()) ? ` · ${new Date(entry.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}` : ''}</time><span>{entry.author}</span></div></div></article>)}</div> : <div className="sub-record-empty">{view.total ? 'No activity matches your search.' : 'No activity recorded for this subscriber yet.'}</div>}
      <RecordFooter view={view} label="events"/>
    </div>
  </SubscriberSection>;
}
