'use client';

import { useState } from 'react';
import StreamingChat from './StreamingChat';
import DocumentSidebar from './DocumentSidebar';

export default function EnhancedChatInterface() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Document Sidebar */}
      <DocumentSidebar 
        onSelectDocument={setSelectedDocumentId}
        selectedDocumentId={selectedDocumentId}
      />
      
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">🏥 HIPAA RAG Assistant</h1>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDocumentId 
                  ? `Chatting with document • Ask about procedures, protocols, or guidelines`
                  : `Ask me anything about your uploaded medical documents`
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                API Online
              </div>
            </div>
          </div>
          
          {/* Quick Suggestion Pills */}
          {!selectedDocumentId && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                💡 Try: "What's the post-op care for CO₂ laser?"
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                💡 Try: "Show me consent form requirements"
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                💡 Try: "What are the aftercare instructions?"
              </span>
            </div>
          )}
        </div>

        {/* Chat Component */}
        <div className="flex-1 flex flex-col">
          <StreamingChat selectedDocumentId={selectedDocumentId} />
        </div>
      </div>
    </div>
  );
}