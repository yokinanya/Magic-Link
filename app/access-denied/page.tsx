'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AccessDeniedPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className={`p-8 bg-white rounded-2xl shadow-xl text-center max-w-md w-full transition-all duration-500 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">
          Access Denied
        </h1>
        
        <p className="text-gray-600 mb-2 transition-all duration-300 delay-150 ease-in">
          Your account is not authorized to access this application.
        </p>
        <p className="text-gray-600 mb-6 transition-all duration-300 delay-200 ease-in">
          Please sign out and try again with a different account.
        </p>
        
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
        >
          Return to Login Page
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
