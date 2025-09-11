'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploadZone } from './FileUploadZone';
import { UploadResponse } from '@/lib/types';

export default function StreamlinedUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result: UploadResponse = await response.json();
        
        // Show success message briefly
        setTimeout(() => {
          // Redirect to chat to start using the document
          router.push('/chat');
        }, 1500);
        
        return result;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 Upload Medical Document
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Upload your protocols, procedures, or guidelines to start chatting
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                HIPAA Compliant
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Instant Indexing
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                AI-Powered Search
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {!isUploading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📄</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your document here
                </h2>
                <p className="text-gray-600">
                  Supports PDF, Word docs, and text files up to 10MB
                </p>
              </div>
              
              <FileUploadZone onFileSelect={handleFileUpload} />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  After upload, you'll be redirected to chat with your document
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Document...
              </h2>
              <p className="text-gray-600 mb-6">
                Extracting text, creating embeddings, and indexing for search
              </p>
              
              {/* Processing Steps */}
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center text-green-600">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">File uploaded and validated</span>
                </div>
                
                <div className="flex items-center text-blue-600">
                  <div className="w-5 h-5 border-2 border-blue-500 rounded-full animate-pulse mr-3"></div>
                  <span className="text-sm">Extracting text and creating chunks</span>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm">Generating AI embeddings</span>
                </div>
                
                <div className="flex items-center text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                  <span className="text-sm">Ready for chat!</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Already have documents? <a href="/chat" className="text-blue-600 hover:underline">Go to Chat →</a>
          </p>
        </div>
      </div>
    </div>
  );
}