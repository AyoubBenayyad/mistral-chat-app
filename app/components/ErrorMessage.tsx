import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, suggestion, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{message}</h3>
          {suggestion && (
            <div className="mt-2 text-sm text-red-700">
              <p>{suggestion}</p>
            </div>
          )}
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}