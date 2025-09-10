# HIPAA RAG Frontend

Next.js 14 frontend for testing the HIPAA-compliant RAG API with real-time streaming chat and secure file uploads.

## Features

- ✅ **Real-time SSE Chat** - Server-Sent Events streaming with the Render API
- ✅ **Secure File Upload** - Drag-and-drop with validation and progress tracking  
- ✅ **HIPAA Compliance** - No PHI in logs, secure error handling
- ✅ **TypeScript** - Full type safety with proper error boundaries
- ✅ **Responsive UI** - Clean Tailwind design optimized for demo purposes

## Quick Start

### 1. Setup Environment

```bash
# Clone and install
cd hipaa-rag-frontend
npm install

# Copy environment template
cp .env.local.example .env.local

# Update .env.local with your Render API details:
# NEXT_PUBLIC_API_BASE=https://your-app.onrender.com
# NEXT_PUBLIC_API_KEY=your-render-api-key
```

### 2. Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Test /chat and /upload pages
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_BASE=https://your-app.onrender.com  
# NEXT_PUBLIC_API_KEY=your-render-api-key
```

## CORS Configuration

**Important:** Add your Vercel domain to the backend CORS settings:

1. Go to your Render dashboard
2. Update `ALLOW_ORIGINS` environment variable:
   ```
   https://your-frontend.vercel.app,http://localhost:3000
   ```
3. Redeploy the API service

## Pages

### `/` - Home
- API health status check
- Navigation to chat and upload demos
- Phase 1 status overview

### `/chat` - Streaming Chat  
- Real-time SSE streaming from API
- Message history with timestamps
- Start/stop streaming controls
- HIPAA-safe error handling

### `/upload` - File Upload
- Drag-and-drop file interface
- Supports: PDF, DOCX, DOC, TXT, MD, JPG, PNG
- Real-time upload progress
- Server response display

## Architecture

```
lib/
├── api.ts          # HTTP client with API key auth
├── sseClient.ts    # Server-Sent Events streaming
└── types.ts        # TypeScript interfaces

components/
├── Navigation.tsx   # App navigation
└── StreamingChat.tsx # SSE chat implementation
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Render API base URL | `https://your-app.onrender.com` |
| `NEXT_PUBLIC_API_KEY` | API authentication key | `generated-by-render` |

## Security Features

- **No PHI logging** - Only metadata logged for debugging
- **API key authentication** - All requests include x-api-key header
- **CORS protection** - Backend restricts origins to known domains
- **Error boundaries** - Graceful error handling without data exposure
- **Type safety** - Full TypeScript coverage prevents runtime errors

## Testing

```bash
# Type checking
npm run type-check

# Linting  
npm run lint

# Build test
npm run build
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] CORS origins updated in Render backend
- [ ] API endpoints returning 200 responses
- [ ] SSE streaming working in production
- [ ] File uploads completing successfully
- [ ] No console errors in browser

## Support

- API Status: Check `/healthz` endpoint
- Logs: Vercel dashboard → Functions tab
- Backend: Render dashboard → hipaa-rag-api service