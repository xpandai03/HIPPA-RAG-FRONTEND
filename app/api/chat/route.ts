import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE!;
  const apiKey = process.env.RENDER_API_KEY!;
  if (!apiBase || !apiKey) {
    return NextResponse.json({ error: "Server misconfig: API base or key missing" }, { status: 500 });
  }

  const body = await req.text(); // forward raw JSON

  const upstream = await fetch(`${apiBase}/v1/chat/stream`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
      "accept": "text/event-stream",
    },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
    },
  });
}