'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                🏥 HIPAA RAG Demo
              </h1>
            </div>
            <div className="ml-10 flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-b-2 border-blue-500 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                href="/chat"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/chat') 
                    ? 'border-b-2 border-blue-500 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat
              </Link>
              <Link
                href="/upload"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/upload') 
                    ? 'border-b-2 border-blue-500 text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              Phase 1 Demo
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}