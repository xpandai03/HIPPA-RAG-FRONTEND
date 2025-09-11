import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE!;
  const apiKey = process.env.RENDER_API_KEY!;
  
  if (!apiBase || !apiKey) {
    return NextResponse.json({ error: "Server misconfig: API base or key missing" }, { status: 500 });
  }

  try {
    const upstream = await fetch(`${apiBase}/v1/retrieve/stats`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Backend API error", status: upstream.status }, { status: upstream.status });
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to reach backend API" }, { status: 502 });
  }
}