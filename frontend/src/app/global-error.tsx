// ./src/app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center px-4">
            <h1 className="text-6xl font-bold mb-4">Critical Error</h1>
            <p className="text-gray-300 text-lg mb-8">
              A critical error has occurred. Please reload the page.
            </p>
            {error.message && (
              <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto font-mono bg-gray-800 p-3 rounded">
                {error.message}
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}