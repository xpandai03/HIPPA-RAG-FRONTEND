'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { healthCheck } from '@/lib/api';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [apiInfo, setApiInfo] = useState<{ service?: string; version?: string }>({});

  useEffect(() => {
    const checkApi = async () => {
      try {
        const result = await healthCheck();
        setApiStatus('online');
        setApiInfo(result);
      } catch (error) {
        setApiStatus('offline');
        console.error('API health check failed:', error);
      }
    };

    checkApi();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          🏥 HIPAA RAG Demo
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Secure document chat and upload testing for medical practices
        </p>
        
        {/* API Status */}
        <div className="mt-8 flex justify-center">
          <div className={`rounded-full px-4 py-2 text-sm font-medium ${
            apiStatus === 'online' 
              ? 'bg-green-100 text-green-800' 
              : apiStatus === 'offline'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {apiStatus === 'loading' && '🔄 Checking API...'}
            {apiStatus === 'online' && `✅ API Online - ${apiInfo.service} v${apiInfo.version}`}
            {apiStatus === 'offline' && '❌ API Offline'}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <Link 
            href="/chat"
            className="group relative rounded-lg border border-gray-300 bg-white p-6 hover:border-gray-400 hover:shadow-lg transition-all"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                💬
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Streaming Chat
                <span className="absolute inset-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Test real-time SSE streaming with the HIPAA RAG API. Ask questions and see responses stream in real-time.
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              →
            </span>
          </Link>

          <Link 
            href="/upload"
            className="group relative rounded-lg border border-gray-300 bg-white p-6 hover:border-gray-400 hover:shadow-lg transition-all"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                📁
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Document Upload
                <span className="absolute inset-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Test secure file uploads with validation. Upload PDFs, DOCX, and other medical documents.
              </p>
            </div>
            <span
              className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        {/* Technical Info */}
        <div className="mt-16 text-left max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Phase 1 Status</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>FastAPI backend deployed on Render with HTTPS</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>Server-Sent Events (SSE) streaming chat</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>Secure file upload with validation</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>API key authentication and CORS protection</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">🚧</span>
              <span>Coming in Phase 2: Real RAG with document indexing and Azure OpenAI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}