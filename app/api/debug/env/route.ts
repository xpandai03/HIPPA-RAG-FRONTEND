export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hasRenderApiKey = !!process.env.RENDER_API_KEY;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'not-set';
    const vercelEnv = process.env.VERCEL_ENV || 'unknown';
    
    return Response.json({
      hasRenderApiKey,
      apiBase,
      vercelEnv,
      runtime: 'nodejs',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { 
        error: 'Failed to check environment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}