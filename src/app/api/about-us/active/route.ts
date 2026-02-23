import { NextResponse } from "next/server"

const API_BASE = (process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "")

export async function GET() {
  if (!API_BASE) {
    return NextResponse.json(
      { message: "API_BASE env eksik. Vercel'de API_BASE veya NEXT_PUBLIC_API_BASE tanımla." },
      { status: 500 }
    )
  }

  const upstream = `${API_BASE}/api/about-us/active`

  const res = await fetch(upstream, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  }

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": ct || "text/plain; charset=utf-8" },
  })
}