import { NextResponse } from "next/server"

const API_BASE = (process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "")

export async function GET() {
  if (!API_BASE) {
    return NextResponse.json(
      { message: "API_BASE env eksik. Vercel'de API_BASE veya NEXT_PUBLIC_API_BASE tanımla." },
      { status: 500 }
    )
  }

  const res = await fetch(`${API_BASE}/api/terms-of-use`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  const contentType = res.headers.get("content-type") || ""
  const body = contentType.includes("application/json") ? await res.json() : await res.text()

  return NextResponse.json(body, { status: res.status })
}