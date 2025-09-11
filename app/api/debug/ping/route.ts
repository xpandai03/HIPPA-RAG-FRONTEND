export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    const time = Date.now() - start;
    
    return Response.json({
      ok: true,
      time,
      timestamp: new Date().toISOString(),
      runtime: 'nodejs'
    });
  } catch (error) {
    return Response.json(
      { 
        ok: false,
        error: 'Ping failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}