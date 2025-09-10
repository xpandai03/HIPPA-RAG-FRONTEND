import { ChatRequest, ChatStreamChunk } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_BASE || !API_KEY) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_API_KEY');
}

export interface StreamingOptions {
  onChunk: (chunk: ChatStreamChunk) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
  signal?: AbortSignal;
}

/**
 * Create streaming chat connection using Server-Sent Events with POST body
 * HIPAA compliant - no sensitive data in URL parameters
 */
export async function createChatStream(
  request: ChatRequest,
  options: StreamingOptions
): Promise<void> {
  const { onChunk, onError, onComplete, signal } = options;

  try {
    const response = await fetch(`${API_BASE}/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY as string,
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed: ChatStreamChunk = JSON.parse(data);
              onChunk(parsed);
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    if (error instanceof Error) {
      // HIPAA-safe error logging
      console.error('Stream error:', {
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      onError(error);
    } else {
      onError(new Error('Unknown streaming error'));
    }
  }
}