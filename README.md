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

## Debugging & Diagnostics

### Debug Dashboard
Visit `/debug` on your deployed site to run system checks:
- Environment variable validation
- Backend API connectivity
- Proxy health status
- Real-time error diagnostics

### Debug API Endpoints

Test these endpoints directly to diagnose issues:

**Local Development:**
```bash
# Check environment variables
curl -s http://localhost:3000/api/debug/env | jq .

# Test basic connectivity  
curl -s http://localhost:3000/api/debug/ping | jq .

# Check backend API health
curl -s http://localhost:3000/api/debug/proxy-health | jq .
```

**Production:**
```bash
# Replace with your Vercel URL
curl -s https://your-app.vercel.app/api/debug/env | jq .
curl -s https://your-app.vercel.app/api/debug/proxy-health | jq .
```

### Environment Setup for Production

**Required Vercel Environment Variables:**

1. **NEXT_PUBLIC_API_BASE** (Public)
   - Your Render API URL: `https://your-app.onrender.com`
   - Safe to expose to client-side

2. **RENDER_API_KEY** (Server-only)
   - Your API key from Render dashboard
   - NEVER expose to client - stays on server

**Setting in Vercel:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add both variables for Production AND Preview environments
3. Redeploy after adding variables

### Troubleshooting Guide

| Error | Debug Check Result | Solution |
|-------|-------------------|----------|
| `hasRenderApiKey: false` | Missing server config | Set RENDER_API_KEY in Vercel, redeploy |
| `upstreamStatus: 401` | API key invalid | Check RENDER_API_KEY value and permissions |
| `upstreamStatus: 403` | API access forbidden | Verify API key permissions, check CORS |
| `upstreamStatus: 404` | Endpoint not found | Verify NEXT_PUBLIC_API_BASE URL is correct |
| `upstreamStatus: 500` | Backend error | Check Render service logs and status |
| Network/timeout errors | Connectivity issues | Check API base URL and network connectivity |

### Debug Response Examples

**Healthy System:**
```json
{
  "hasRenderApiKey": true,
  "apiBase": "https://hipaa-rag-api.onrender.com",
  "vercelEnv": "production",
  "runtime": "nodejs"
}
```

**Backend Health:**
```json
{
  "upstreamStatus": 200,
  "upstreamOk": true,
  "bodySnippet": "{\"ok\":true,\"service\":\"HIPAA RAG API\"}"
}
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