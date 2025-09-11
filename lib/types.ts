export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: CitationItem[];
  processing_time_ms?: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  k?: number;
}

export interface ChatStreamChunk {
  type: 'conversation' | 'content' | 'citations' | 'done' | 'error';
  content?: string;
  conversation_id?: string;
  is_new?: boolean;
  citations?: CitationItem[];
  finish_reason?: string;
  error?: string;
  message?: string;
}

export interface CitationItem {
  index: number;
  document_name: string;
  chunk_index: number;
  score: number;
  document_id: string;
}

export interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface UploadResponse {
  filename: string;
  size_bytes: number;
  mime_type: string | null;
  status: string;
}

export interface ApiErrorData {
  error: string;
  message: string;
  detail?: any;
}

export interface Document {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'indexed' | 'failed';
  uploadedAt: Date;
  size: number;
  mimeType?: string;
}