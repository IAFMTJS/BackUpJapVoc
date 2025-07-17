import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function SessionWarning() {
  const { sessionWarning, resetSessionTimer } = useAuth();

  if (!sessionWarning) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 pb-safe">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-nav bg-yellow-50 shadow-lg sm:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Session Timeout Warning
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your session will expire in 5 minutes due to inactivity.
                  Click anywhere to stay logged in.
                </p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                type="button"
                onClick={resetSessionTimer}
                className="inline-flex rounded-md text-yellow-700 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <span className="sr-only">Stay logged in</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 