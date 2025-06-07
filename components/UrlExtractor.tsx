import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { LinkIcon, SparklesIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';

interface UrlExtractorProps {
  apiKey: string;
  onExtractionStart: () => void;
  onSuccess: (text: string) => void;
  onError: (error: string) => void;
  isGlobalLoading: boolean;
}

export const UrlExtractor: React.FC<UrlExtractorProps> = ({ apiKey, onExtractionStart, onSuccess, onError, isGlobalLoading }) => {
  const [url, setUrl] = useState<string>('');

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleExtractText = useCallback(async () => {
    if (!apiKey) {
      onError("Gemini API Key is not set. Please enter your API key in the settings above to use this feature.");
      return;
    }
    if (!url.trim()) {
      onError("Please enter a website URL.");
      return;
    }
    if (!isValidUrl(url)) {
      onError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }

    onExtractionStart();

    try {
      const extractedText = await geminiService.extractTextFromUrl(url, apiKey);
      // The service now throws an error if text is empty or indicates an issue,
      // so we can rely on that for more specific error messages.
      // The check for `extractedText` truthiness is still a good safeguard.
      if (extractedText) { 
        onSuccess(extractedText);
      } else {
        // This case should be less common if the service handles empty/error responses well.
        onError("AI could not extract text from the URL or the content was empty. The service might have returned an empty response without an error.");
      }
    } catch (err) {
      console.error("Error extracting URL text via AI:", err);
      let errorMessage = "Failed to extract text using AI. Please check the URL and your API key.";
      if (err instanceof Error) {
        errorMessage = err.message; // Use the error message from geminiService
      }
      onError(errorMessage);
    }
  }, [url, apiKey, onSuccess, onError, onExtractionStart]);

  return (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl flex flex-col space-y-5 transition-all duration-300 hover:shadow-cyan-500/30">
      <div className="flex items-center space-x-3 text-cyan-400">
        <LinkIcon className="w-8 h-8" />
        <h2 className="text-2xl font-semibold">Extract from URL (AI)</h2>
      </div>
      <p className="text-slate-400 text-sm">
        Enter a website URL. Our AI will attempt to extract its main text content. Requires a valid Gemini API Key.
      </p>
      
      <div>
        <label htmlFor="url-input" className="block text-sm font-medium text-slate-300 mb-1">
          Website URL
        </label>
        <input
          type="url"
          id="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-500 text-slate-100"
          aria-label="Website URL for AI extraction"
        />
      </div>

      <button
        onClick={handleExtractText}
        disabled={isGlobalLoading || !apiKey}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70 transition-colors duration-200"
        aria-disabled={isGlobalLoading || !apiKey}
      >
        {isGlobalLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
        Extract Text with AI
      </button>
       {!apiKey && (
         <p className="text-xs text-amber-400 text-center mt-2">
           A Gemini API key is required. Please enter and save your key above.
         </p>
       )}
    </div>
  );
};