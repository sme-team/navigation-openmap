// ./src/app/unauthorized/page.tsx
'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center px-4">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-red-100 rounded-full">
            <ShieldX className="w-24 h-24 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          You do not have permission to access this page. Please log in or contact the administrator.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/en"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/en/login"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Log In
          </Link>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}