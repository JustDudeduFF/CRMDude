import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import DocumetUploadTable from './DocumetUploadTable';
import AddNewDoc from './AddNewDoc';
import { FolderOpen, Upload } from 'lucide-react';
import SubscriberSection, { SectionAction } from './SubscriberSection';

export default function DocumentUpload() {
  const location = useLocation();
  const form = location.pathname.includes('upload_doc');
  return <SubscriberSection title={form ? 'Upload a document' : 'Documents'} description={form ? 'Attach a file and add its identifying details.' : 'Subscriber documents and forms, easy to find and open.'} icon={FolderOpen} backTo={form ? '/dashboard/subscriber/documents' : undefined} actions={!form && <SectionAction to="upload_doc"><Upload size={15}/> Upload document</SectionAction>}>
    <Routes>
          <Route path='/' element={<DocumetUploadTable />} />
          <Route path='upload_doc' element={<AddNewDoc />} />
        </Routes>
  </SubscriberSection>;
}
