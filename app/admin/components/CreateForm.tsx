'use client';

import { useState } from 'react';
import { createLink } from '../actions';

export default function CreateForm() {
  const [path, setPath] = useState('');
  const [longUrl, setLongUrl] = useState('');
  const [result, setResult] = useState<{ url?: string; to?: string; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    const res = await createLink(path || null, longUrl);
    setResult(res);
    setIsLoading(false);
    if (res && !('error' in res)) {
        setPath('');
        setLongUrl('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Create a new short link instantly.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short Path <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">/</span>
             <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="custom-path"
                className="w-full pl-6 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 outline-none"
              />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Destination URL
          </label>
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 outline-none"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading} 
          className={`w-full py-2.5 text-white font-medium rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : 'Create Link'}
        </button>
      </form>
      
      {result && (
        <div className={`mt-6 p-4 rounded-lg text-sm transition-all duration-500 animate-slide-in border ${
          'error' in result && result.error
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
        }`}>
          {'error' in result && result.error ? (
            <div className="flex gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              {result.error}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <span className="text-green-500">✓</span>
                Success!
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 break-all font-mono text-xs text-blue-600 dark:text-blue-400 select-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Click to copy" onClick={() => {
                if(result.url) {
                    navigator.clipboard.writeText(result.url);
                }
              }}>
                {result.url}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
