
import React, { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api'; // Optional: for better typing
import { UploadIcon, DocumentTextIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

// Ensure pdfjsLib is defined and has a version property before using it.
// This check is crucial for robustness, though the primary fix in index.html should ensure pdfjsLib is loaded.
if (typeof pdfjsLib !== 'undefined' && pdfjsLib.version) {
  const expectedWorkerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
  // Set workerSrc if it's not already set to the expected ES module worker path.
  if (pdfjsLib.GlobalWorkerOptions.workerSrc !== expectedWorkerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = expectedWorkerSrc;
  }
} else {
  // This case implies a failure in loading pdfjs-dist, which should be rare after index.html fix.
  console.error(
    'PDF.js library (pdfjsLib or its version) is not available. ' +
    'PDF functionality may be impaired. Check the import of "pdfjs-dist" in index.html.'
  );
  // As a last resort, if pdfjsLib itself exists but version is missing (highly unlikely),
  // one might try a hardcoded worker path, but the root issue would need addressing.
  // if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  //   pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.mjs`;
  // }
}


interface PdfExtractorProps {
  onExtractionStart: () => void;
  onSuccess: (text: string) => void;
  onError: (error: string) => void;
  isGlobalLoading: boolean;
}

export const PdfExtractor: React.FC<PdfExtractorProps> = ({ onExtractionStart, onSuccess, onError, isGlobalLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setFileName(file.name);
        onError(''); // Clear previous errors
      } else {
        setSelectedFile(null);
        setFileName('');
        onError("Invalid file type. Please select a PDF file.");
      }
    }
  };

  const handleExtractText = useCallback(async () => {
    if (!selectedFile) {
      onError("Please select a PDF file first.");
      return;
    }

    onExtractionStart();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Using TextItem type for item if imported, otherwise stick to 'any' for minimal change.
        const pageText = textContent.items.map((item: TextItem | any) => item.str).join(' '); 
        fullText += pageText + '\n\n'; // Add double newline for page separation
      }
      onSuccess(fullText.trim());
      setSelectedFile(null); // Clear file after successful extraction
      setFileName('');
    } catch (err) {
      console.error("Error extracting PDF text:", err);
      let errorMessage = "Failed to extract text from PDF. The file might be corrupted or password-protected.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      // Add a more specific message if it's about the worker, though the console provides good info.
      if (typeof err === 'string' && err.includes('worker')) {
        errorMessage += " (Worker script issue - check console for details)."
      } else if (err instanceof Error && (err.message.includes('worker') || err.message.includes('Worker'))) {
         errorMessage += " (Worker script issue - check console for details)."
      }
      onError(errorMessage);
    }
  }, [selectedFile, onSuccess, onError, onExtractionStart]);

  return (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl flex flex-col space-y-5 transition-all duration-300 hover:shadow-sky-500/30">
      <div className="flex items-center space-x-3 text-sky-400">
        <DocumentTextIcon className="w-8 h-8" />
        <h2 className="text-2xl font-semibold">Extract from PDF</h2>
      </div>
      <p className="text-slate-400 text-sm">
        Upload a PDF file to extract its text content. Processing happens locally in your browser.
      </p>
      
      <div>
        <label htmlFor="pdf-upload" className="block text-sm font-medium text-slate-300 mb-1">
          Select PDF file
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-sky-500 transition-colors duration-200">
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
            <div className="flex text-sm text-slate-500">
              <label
                htmlFor="pdf-file-input"
                className="relative cursor-pointer rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-sky-500"
              >
                <span>Upload a file</span>
                <input id="pdf-file-input" name="pdf-file-input" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-600">PDF up to 50MB</p>
          </div>
        </div>
        {fileName && <p className="mt-2 text-sm text-slate-400">Selected: {fileName}</p>}
      </div>

      <button
        onClick={handleExtractText}
        disabled={!selectedFile || isGlobalLoading}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isGlobalLoading ? <LoadingSpinner /> : <DocumentTextIcon className="w-5 h-5 mr-2" />}
        Extract Text from PDF
      </button>
    </div>
  );
};
