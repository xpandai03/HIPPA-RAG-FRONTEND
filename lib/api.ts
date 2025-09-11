import { UploadResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_BASE || !API_KEY) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_API_KEY');
}

/**
 * Enhanced fetch with HIPAA-compliant error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: HeadersInit = {
    'x-api-key': API_KEY as string,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Request failed', 
        message: `HTTP ${response.status}` 
      }));
      
      throw new ApiError(
        errorData.message || `API request failed: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    // HIPAA-safe error logging (no sensitive data)
    console.error('API request failed:', {
      endpoint,
      status: error instanceof ApiError ? error.status : 'unknown',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Enhanced ApiError class with status codes
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Upload file via server-side proxy to keep API key secure
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: 'Upload failed', 
      message: `HTTP ${response.status}` 
    }));
    throw new ApiError(
      errorData.message || 'Upload failed',
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Test API connectivity
 */
export async function healthCheck(): Promise<{ ok: boolean; service: string; version: string }> {
  return apiRequest('/healthz');
}

export { ApiError };