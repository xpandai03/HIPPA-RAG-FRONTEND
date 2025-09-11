'use client';

import { useState, useRef, useEffect } from 'react';
import { createChatStream } from '@/lib/sseClient';
import { ChatMessage, ChatStreamChunk, CitationItem } from '@/lib/types';

interface StreamingChatProps {
  selectedDocumentId?: string;
}

export default function StreamingChat({ selectedDocumentId }: StreamingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [currentCitations, setCurrentCitations] = useState<CitationItem[]>([]);
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
    setCurrentCitations([]);
    streamingContentRef.current = '';

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      await createChatStream(
        { 
          message: currentInput,
          conversation_id: conversationId || undefined,
          k: 6
        },
        {
          onChunk: (chunk: ChatStreamChunk) => {
            switch (chunk.type) {
              case 'conversation':
                if (chunk.conversation_id) {
                  setConversationId(chunk.conversation_id);
                  if (chunk.is_new) {
                    console.log('Started new conversation:', chunk.conversation_id);
                  }
                }
                break;
                
              case 'content':
                if (chunk.content !== undefined && chunk.content !== null) {
                  const newContent = streamingContentRef.current + chunk.content;
                  streamingContentRef.current = newContent;
                  setStreamingContent(newContent);
                } else {
                  console.warn('Received content chunk with undefined/null content:', chunk);
                }
                break;
                
              case 'citations':
                if (chunk.citations) {
                  setCurrentCitations(chunk.citations);
                }
                break;
                
              case 'done':
                // Move streaming content to final messages
                const finalContent = streamingContentRef.current;
                console.log('Final content for message:', finalContent, 'length:', finalContent.length);
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: finalContent || '[Empty response]',
                  timestamp: new Date(),
                  citations: currentCitations.length > 0 ? currentCitations : undefined,
                }]);
                setStreamingContent('');
                setCurrentCitations([]);
                streamingContentRef.current = '';
                setIsStreaming(false);
                break;
                
              case 'error':
                console.error('Streaming error:', chunk.error);
                setStreamingContent('❌ Error: ' + (chunk.message || 'Failed to get response from server'));
                setIsStreaming(false);
                break;
            }
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
            setStreamingContent('❌ Error: Failed to get response from server');
            setIsStreaming(false);
          },
          onComplete: () => {
            // Fallback completion handler
            if (isStreaming) {
              const finalContent = streamingContentRef.current;
              if (finalContent) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: finalContent,
                  timestamp: new Date(),
                  citations: currentCitations.length > 0 ? currentCitations : undefined,
                }]);
              }
              setStreamingContent('');
              setCurrentCitations([]);
              streamingContentRef.current = '';
              setIsStreaming(false);
            }
          },
          signal: abortControllerRef.current.signal,
        }
      );
    } catch (error) {
      console.error('Failed to create stream:', error);
      setIsStreaming(false);
      setStreamingContent('');
      setCurrentCitations([]);
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
      {/* Conversation Status */}
      {conversationId && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="text-xs text-blue-600">
            💬 Conversation ID: {conversationId.slice(0, 8)}...
            {messages.length > 0 && (
              <span className="ml-2">• {messages.length} message{messages.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      )}
      
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
              
              {/* Citations for assistant messages */}
              {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-600 mb-1">Sources:</div>
                  <div className="space-y-1">
                    {message.citations.map((citation, citIndex) => (
                      <div key={citIndex} className="text-xs text-gray-500 flex items-center">
                        <span className="inline-block w-4 h-4 bg-blue-100 text-blue-600 rounded-full text-center leading-4 mr-2 font-medium">
                          {citation.index}
                        </span>
                        <span className="flex-1">
                          {citation.document_name} • Chunk #{citation.chunk_index} • Score: {citation.score.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.processing_time_ms && (
                  <span>({message.processing_time_ms}ms)</span>
                )}
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