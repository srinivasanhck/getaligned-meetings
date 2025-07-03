import React, { useState } from 'react';
import { InputMode, GroundingChunk } from '@/types';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner'; // Added import
import { DEFAULT_PROMPT } from '@/constants';

interface InputAreaProps {
  onGenerate: (input: string, inputMode: InputMode, useSearch: boolean) => void;
  isLoading: boolean;
  error?: string | null;
  groundingChunks?: GroundingChunk[] | null;
}

const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isLoading, error, groundingChunks }) => {
  const [userInput, setUserInput] = useState<string>(DEFAULT_PROMPT);
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.PROMPT);
  const [useSearch, setUseSearch] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      onGenerate(userInput, inputMode, useSearch);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="inputMode" className="block text-sm font-medium text-slate-300 mb-2">
            Input Type
          </label>
          <div className="flex space-x-4">
            {(Object.keys(InputMode) as Array<keyof typeof InputMode>).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(InputMode[mode])}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-150 ease-in-out
                  ${inputMode === InputMode[mode] ? 'bg-primary text-white shadow-md' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {InputMode[mode].charAt(0) + InputMode[mode].slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="userInput" className="block text-sm font-medium text-slate-300 mb-2">
            {inputMode === InputMode.PROMPT ? 'Enter your presentation prompt' : 'Paste your meeting transcript'}
          </label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            rows={inputMode === InputMode.PROMPT ? 5 : 10}
            className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            placeholder={
              inputMode === InputMode.PROMPT
                ? 'e.g., "Create a sales deck for an AI meeting summarizer..."'
                : 'Paste the full text of your meeting transcript here...'
            }
            disabled={isLoading}
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="useSearch"
            checked={useSearch}
            onChange={(e) => setUseSearch(e.target.checked)}
            className="h-4 w-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary"
            disabled={isLoading}
          />
          <label htmlFor="useSearch" className="ml-2 block text-sm text-slate-300">
            Use Google Search for up-to-date information (slower, may affect slide structure)
          </label>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-700/50 text-red-100 border border-red-700 rounded-md text-sm animate-fade-in">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !userInput.trim()}
          className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-3" />
              Generating...
            </>
          ) : (
            <>
              <Icon name="sparkles" className="w-5 h-5 mr-2" />
              Generate Presentation
            </>
          )}
        </button>
      </form>
       {groundingChunks && groundingChunks.length > 0 && (
        <div className="mt-6 p-4 bg-slate-700 rounded-lg animate-fade-in">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Sources (from Google Search):</h3>
          <ul className="list-disc list-inside space-y-1">
            {groundingChunks.map((chunk, index) => {
              const uri = chunk.web?.uri || chunk.retrievedContext?.uri;
              const title = chunk.web?.title || chunk.retrievedContext?.title || uri;
              if (uri) {
                return (
                  <li key={index} className="text-xs text-slate-400">
                    <a href={uri} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
                      {title}
                    </a>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InputArea;
