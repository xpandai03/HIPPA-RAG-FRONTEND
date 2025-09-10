export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatStreamChunk {
  content: string;
  chunk_id: number;
  done: boolean;
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