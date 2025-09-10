'use client';

import StreamingChat from '@/components/StreamingChat';

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold text-gray-900">Chat Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">
            Test real-time streaming responses from the HIPAA RAG API
          </p>
        </div>
      </div>
      <div className="flex-1 mx-auto max-w-4xl w-full">
        <StreamingChat />
      </div>
    </div>
  );
}