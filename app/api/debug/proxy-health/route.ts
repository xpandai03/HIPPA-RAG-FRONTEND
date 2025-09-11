export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
    const RENDER_API_KEY = process.env.RENDER_API_KEY;

    if (!API_BASE) {
      return Response.json({
        upstreamOk: false,
        error: 'Missing API_BASE',
        hint: 'Set NEXT_PUBLIC_API_BASE environment variable'
      }, { status: 500 });
    }

    if (!RENDER_API_KEY) {
      return Response.json({
        upstreamOk: false,
        error: 'Missing API_KEY',
        hint: 'Set RENDER_API_KEY environment variable'
      }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/healthz`, {
        method: 'GET',
        headers: {
          'x-api-key': RENDER_API_KEY,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const time = Date.now() - start;

      let bodySnippet = '';
      try {
        const text = await response.text();
        bodySnippet = text.substring(0, 200);
      } catch {
        bodySnippet = 'Unable to read response body';
      }

      return Response.json({
        upstreamStatus: response.status,
        upstreamOk: response.ok,
        bodySnippet,
        time,
        apiBase: API_BASE,
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return Response.json({
          upstreamOk: false,
          error: 'Request timeout',
          hint: 'Backend API took longer than 15s to respond',
          apiBase: API_BASE
        }, { status: 408 });
      }

      return Response.json({
        upstreamOk: false,
        error: 'Network error',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown network error',
        hint: 'Check API_BASE URL and network connectivity',
        apiBase: API_BASE
      }, { status: 503 });
    }

  } catch (error) {
    return Response.json({
      upstreamOk: false,
      error: 'Proxy health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}