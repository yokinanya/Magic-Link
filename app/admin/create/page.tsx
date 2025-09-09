'use client';

import { useState } from 'react';
import { createLink } from './actions';

export default function CreatePage() {
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
    <div className="text-center mt-10 animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Create
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">Convert your links</p>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="Optional, starts with /"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="http(s)://"
              required
              className="flex-grow px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`px-6 py-2 text-white rounded-md transition-all duration-300 transform hover:scale-105 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Converting...' : 'Convert it'}
            </button>
          </div>
        </div>
      </form>
      
      {result && (
        <div className={`mt-8 p-4 rounded-md max-w-lg mx-auto transition-all duration-500 ${
          'error' in result && result.error
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
        }`}>
          {'error' in result && result.error ? (
            <p className="text-red-500 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error: {result.error}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Link created successfully!
              </p>
              <div className="flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-md shadow-sm">
                <p className="font-mono break-all text-blue-600 font-medium">{result.url}</p>
                <div className="flex items-center gap-2 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-sm">redirects to</span>
                </div>
                <p className="font-mono break-all text-gray-600">{result.to}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
