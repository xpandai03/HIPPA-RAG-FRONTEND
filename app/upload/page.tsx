'use client';

import { useState, useCallback } from 'react';
import { uploadFile } from '@/lib/api';
import { UploadResponse } from '@/lib/types';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadFile(file);
      setUploadResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Upload</h1>
        <p className="text-gray-600 mt-2">
          Test secure file uploads to the HIPAA RAG API. Supported formats: PDF, DOCX, DOC, TXT, MD, JPG, PNG
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg font-medium text-gray-900">Uploading...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-gray-900">
                Drop files here or click to browse
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
            
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png"
            />
          </>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-4">✅ Upload Successful</h3>
          <div className="bg-white rounded border p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(uploadResult, null, 2)}
            </pre>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Filename:</span>
              <span className="ml-2 text-gray-900">{uploadResult.filename}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Size:</span>
              <span className="ml-2 text-gray-900">{formatFileSize(uploadResult.size_bytes)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 text-gray-900">{uploadResult.mime_type || 'Unknown'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-900">{uploadResult.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">❌ Upload Failed</h3>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Phase 1 Status</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <span>File validation and security checks</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <span>HIPAA-compliant upload handling</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">🚧</span>
            <span>Coming in Phase 2: Automatic document processing and indexing</span>
          </div>
        </div>
      </div>
    </div>
  );
}