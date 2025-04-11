// app/(auth)/auth/callback/page.tsx
import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient'; // Import the component you just created

// Optional: Define a loading component or use an inline fallback
function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md text-center">
        <h2 className="mb-4 text-xl font-medium text-gray-700">Loading...</h2>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}

// Keep this if you want server-side rendering per request
export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackClient />
    </Suspense>
  );
}