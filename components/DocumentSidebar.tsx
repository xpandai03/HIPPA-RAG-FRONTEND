'use client';

import { useState, useEffect } from 'react';
import { Document } from '@/lib/types';

interface DocumentSidebarProps {
  onSelectDocument?: (documentId: string) => void;
  selectedDocumentId?: string;
}

export default function DocumentSidebar({ onSelectDocument, selectedDocumentId }: DocumentSidebarProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock documents for now - will be replaced with API call
    const mockDocuments: Document[] = [
      {
        id: '1',
        filename: 'CO2-Laser-Protocol.pdf',
        status: 'indexed',
        uploadedAt: new Date(),
        size: 245760
      },
      {
        id: '2', 
        filename: 'Post-Op-Care-Guidelines.pdf',
        status: 'indexed',
        uploadedAt: new Date(),
        size: 189440
      },
      {
        id: '3',
        filename: 'Consent-Forms-2025.pdf',
        status: 'processing',
        uploadedAt: new Date(),
        size: 567890
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'indexed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-3"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">📚 Knowledge Base</h2>
        <p className="text-sm text-gray-500 mt-1">{documents.length} documents</p>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {documents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">📄</div>
              <p>No documents uploaded yet</p>
              <p className="text-xs mt-1">Upload docs to start chatting</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument?.(doc.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  selectedDocumentId === doc.id
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status === 'processing' && (
                      <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full mr-1"></div>
                    )}
                    {doc.status}
                  </span>
                </div>
                
                {selectedDocumentId === doc.id && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-blue-600">
                      💬 Chat with this document
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <a
          href="/upload"
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          ➕ Upload Document
        </a>
      </div>
    </div>
  );
}