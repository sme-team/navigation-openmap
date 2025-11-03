// ./src/app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="text-center px-4">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-yellow-100 rounded-full">
            <AlertTriangle className="w-24 h-24 text-yellow-600" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Something went wrong
        </h1>

        <p className="text-gray-600 text-lg mb-4 max-w-md mx-auto">
          We encountered an error while loading the page. Please try again.
        </p>

        {error.message && (
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto font-mono bg-gray-100 p-3 rounded">
            {error.message}
          </p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/en"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors inline-block"
          >
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
}