'use client';

import { useState, useRef, useEffect } from 'react';
import { createChatStream } from '@/lib/sseClient';
import { ChatMessage, ChatStreamChunk } from '@/lib/types';

export default function StreamingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!currentInput.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsStreaming(true);
    setStreamingContent('');
    streamingContentRef.current = '';

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      await createChatStream(
        { message: currentInput },
        {
          onChunk: (chunk: ChatStreamChunk) => {
            const newContent = streamingContentRef.current + chunk.content;
            streamingContentRef.current = newContent;
            setStreamingContent(newContent);
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            setStreamingContent('❌ Error: Failed to get response from server');
            setIsStreaming(false);
          },
          onComplete: () => {
            // Move streaming content to final messages using ref to avoid stale closure
            const finalContent = streamingContentRef.current;
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: finalContent,
              timestamp: new Date(),
            }]);
            setStreamingContent('');
            streamingContentRef.current = '';
            setIsStreaming(false);
          },
          signal: abortControllerRef.current.signal,
        }
      );
    } catch (error) {
      console.error('Failed to create stream:', error);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent('');
      streamingContentRef.current = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">🤖 HIPAA RAG Assistant</p>
            <p className="text-sm mt-2">Start a conversation to test the streaming API</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-900">
              <div className="whitespace-pre-wrap">{streamingContent}</div>
              <div className="flex items-center mt-2">
                <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
                <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full mr-1 delay-100"></div>
                <div className="animate-pulse h-2 w-2 bg-blue-500 rounded-full delay-200"></div>
                <span className="text-xs text-gray-500 ml-2">Streaming...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about medical procedures, policies, or protocols..."
            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
            disabled={isStreaming}
          />
          <div className="flex flex-col space-y-1">
            {!isStreaming ? (
              <button
                onClick={handleSend}
                disabled={!currentInput.trim()}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}