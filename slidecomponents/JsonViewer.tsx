import React, { useState, useCallback } from 'react';
import IconButton from './IconButton';
import Icon from './Icon';

interface JsonViewerProps {
  jsonString: string;
  onBackToEditor: () => void;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ jsonString, onBackToEditor }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy JSON');

  const handleCopyJson = useCallback(() => {
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
    }).catch(err => {
      console.error('Failed to copy JSON: ', err);
      setCopyButtonText('Copy Failed');
      setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
    });
  }, [jsonString]);

  const handleDownloadJson = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jsonString]);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-slate-800 rounded-xl shadow-2xl animate-fade-in w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-100">Presentation JSON Output</h2>
        <IconButton
          icon="arrowUturnLeft"
          label="Back to Editor"
          onClick={onBackToEditor}
          className="bg-primary hover:bg-primary-dark text-white text-sm px-4 py-2"
          iconClassName="w-4 h-4 mr-2"
        />
      </div>

      <div className="mb-4 flex space-x-3">
        <IconButton
            icon="documentDuplicate"
            label={copyButtonText}
            onClick={handleCopyJson}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5"
            iconClassName="w-3.5 h-3.5 mr-1.5"
        />
        <IconButton
            icon="arrowDownTray"
            label="Download JSON"
            onClick={handleDownloadJson}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5"
            iconClassName="w-3.5 h-3.5 mr-1.5"
        />
      </div>

      <div 
        className="bg-slate-900 p-4 rounded-lg overflow-auto max-h-[60vh] border border-slate-700 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50"
      >
        <pre className="text-xs text-sky-300 whitespace-pre-wrap break-all">
          <code>
            {jsonString}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer;
