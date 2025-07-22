import React from 'react';
import ObjectPDFViewer from '../components/ObjectPDFViewer';

export default function BrochurePage({ title, pdfUrl }) {
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <ObjectPDFViewer pdfUrl={pdfUrl} title={title} />
    </div>
  );
}
