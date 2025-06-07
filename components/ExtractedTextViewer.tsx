
import React, { useState, useEffect } from 'react';
import { ClipboardCopyIcon, XCircleIcon, DocumentTextIcon, LinkIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ExtractedTextViewerProps {
  text: string;
  isLoading: boolean;
  source: 'pdf' | 'url' | null;
  onClear: () => void;
}

export const ExtractedTextViewer: React.FC<ExtractedTextViewerProps> = ({ text, isLoading, source, onClear }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => setCopied(true))
      .catch(err => console.error("Failed to copy: ", err));
  };

  const getSourceName = () => {
    if (source === 'pdf') return 'PDF Document';
    if (source === 'url') return 'Website URL';
    return 'Content';
  };

  if (!text && !isLoading) return null;

  return (
    <div className="w-full max-w-4xl p-6 bg-slate-800/70 rounded-xl shadow-xl mt-8 backdrop-blur-sm border border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 text-lg font-semibold text-slate-300">
          {isLoading && source ? (
            <>
              {source === 'pdf' ? <DocumentTextIcon className="w-6 h-6 text-sky-400" /> : <LinkIcon className="w-6 h-6 text-cyan-400" />}
              <span>Extracting from {getSourceName()}...</span>
            </>
          ) : (
            <>
              {source === 'pdf' ? <DocumentTextIcon className="w-6 h-6 text-sky-400" /> : source === 'url' ? <LinkIcon className="w-6 h-6 text-cyan-400" /> : null}
              <span>Extracted Text{source ? ` from ${getSourceName()}` : ''}</span>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          {text && !isLoading && (
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className={`p-2 rounded-md  ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-sky-600 hover:bg-sky-700'} text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              <ClipboardCopyIcon className="w-5 h-5" />
              {copied && <span className="text-xs absolute -top-2 -right-2 bg-green-500 text-white px-1 rounded-full">Copied!</span>}
            </button>
          )}
          {(text || isLoading) && (
             <button
                onClick={onClear}
                title="Clear text"
                className="p-2 rounded-md bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
             >
                <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-slate-700/50 rounded-md">
          <LoadingSpinner className="w-12 h-12 mb-4 text-sky-400" />
          <p className="text-slate-400">Processing content, please wait...</p>
        </div>
      ) : (
        <textarea
          readOnly
          value={text}
          placeholder="Extracted text will appear here..."
          className="w-full h-64 p-4 bg-slate-900/70 border border-slate-700 rounded-md text-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none custom-scrollbar"
        />
      )}
       <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #38bdf8; /* sky-400 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0ea5e9; /* sky-500 */
        }
      ` }} />
    </div>
  );
};
    