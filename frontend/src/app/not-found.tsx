'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="text-9xl font-black text-slate-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-20 h-20 text-blue-600 animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900">Page Not Found</h1>
          <p className="text-slate-500 font-medium">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link 
            href="/dashboard/student"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
