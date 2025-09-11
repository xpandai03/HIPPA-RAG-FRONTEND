import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE!;
    const apiKey = process.env.RENDER_API_KEY!;
    if (!apiBase || !apiKey) {
      return NextResponse.json({ error: "Server misconfig: API base or key missing" }, { status: 500 });
    }

    const form = await req.formData(); // keep multipart intact
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const upstream = await fetch(`${apiBase}/v1/uploads`, {
      method: "POST",
      headers: { "x-api-key": apiKey }, // DO NOT set content-type manually
      body: form,
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const text = await upstream.text();
    return new NextResponse(text, { status: upstream.status, headers: { "content-type": contentType } });
  } catch (err: any) {
    return NextResponse.json({ error: "Upload proxy failed", message: err?.message ?? "unknown" }, { status: 502 });
  }
}