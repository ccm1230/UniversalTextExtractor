import React, { useState, useCallback, useEffect } from 'react';
import { PdfExtractor } from './components/PdfExtractor';
import { UrlExtractor } from './components/UrlExtractor';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExtractedTextViewer } from './components/ExtractedTextViewer';
import { KeyIcon } from './components/Icons';

// const APP_API_KEY_STORAGE_KEY = 'universalTextExtractorApiKey'; // Removed as we are not using localStorage anymore

const App: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<'pdf' | 'url' | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [inputApiKey, setInputApiKey] = useState<string>('');
  const [apiKeyApplied, setApiKeyApplied] = useState<boolean>(false); // Renamed from apiKeySaved

  // useEffect to load from localStorage has been removed.

  const handleApplyApiKey = useCallback(() => { // Renamed from handleSaveApiKey
    if (inputApiKey.trim()) {
      setApiKey(inputApiKey.trim());
      setError(null); // Clear previous API key errors
      setApiKeyApplied(true);
      setTimeout(() => setApiKeyApplied(false), 2000); // Hide message after 2s
    } else {
      setApiKey('');
      // setError("API Key cleared. Enter a new key to use AI features."); // Keep or remove based on desired UX for clearing
      setApiKeyApplied(false);
    }
  }, [inputApiKey]);

  const handleExtractionStart = useCallback((source: 'pdf' | 'url') => {
    if (source === 'url' && !apiKey) {
      setError("Gemini API Key is required for URL extraction. Please enter and apply your API key above.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedText('');
    setCurrentSource(source);
  }, [apiKey]);

  const handleExtractionSuccess = useCallback((text: string) => {
    setExtractedText(text);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleExtractionError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setExtractedText('');
  }, []);

  const clearResults = useCallback(() => {
    setExtractedText('');
    setError(null);
    setCurrentSource(null);
  }, []);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4 sm:p-8 selection:bg-sky-500 selection:text-sky-900">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
            Universal Text Extractor
          </h1>
        </div>
        <p className="text-slate-400 text-lg mb-6">
          Extract text from PDF files locally or from websites using AI.
        </p>

        <div className="w-full max-w-md mx-auto p-4 bg-slate-800/50 rounded-lg shadow-md border border-slate-700 mb-8">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-slate-300 mb-1">
            Gemini API Key (Session Only)
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <KeyIcon className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="password"
                id="api-key-input"
                value={inputApiKey}
                onChange={(e) => setInputApiKey(e.target.value)}
                placeholder="Enter your Gemini API Key for this session"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 text-slate-100"
                aria-describedby="api-key-status"
              />
            </div>
            <button
              onClick={handleApplyApiKey} // Renamed
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors duration-200"
            >
              Apply Key 
            </button>
          </div>
          {apiKeyApplied && <p id="api-key-status" className="mt-2 text-sm text-green-400">API Key applied for this session!</p>}
           {!apiKey && ( // Check apiKey state instead of localStorage
             <p className="mt-2 text-xs text-slate-400">
               A Gemini API key is required for URL text extraction. Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">AI Studio</a>. The key will not be stored.
             </p>
           )}
        </div>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <PdfExtractor 
          onExtractionStart={() => handleExtractionStart('pdf')}
          onSuccess={handleExtractionSuccess} 
          onError={handleExtractionError}
          isGlobalLoading={isLoading && currentSource === 'pdf'}
        />
        <UrlExtractor 
          apiKey={apiKey}
          onExtractionStart={() => handleExtractionStart('url')}
          onSuccess={handleExtractionSuccess} 
          onError={handleExtractionError}
          isGlobalLoading={isLoading && currentSource === 'url'}
        />
      </main>

      {isLoading && (!currentSource || (currentSource !== 'pdf' && currentSource !== 'url')) && (
         <div className="my-8"> <LoadingSpinner /> <p className="text-slate-400">Processing...</p> </div>
      )}

      {error && (
        <div className="w-full max-w-4xl p-4 mb-8 bg-red-800/30 border border-red-700 rounded-lg text-red-300" role="alert">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {(extractedText || (isLoading && currentSource)) && (
        <ExtractedTextViewer 
            text={extractedText} 
            isLoading={isLoading && !!currentSource} 
            source={currentSource}
            onClear={clearResults}
        />
      )}
      
      <footer className="w-full max-w-4xl mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Universal Text Extractor. Built with React, Tailwind CSS, and Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;