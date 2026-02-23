import { NextResponse } from "next/server"

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "")
  const p = path.replace(/^\/+/, "")
  return `${b}/${p}`
}

export async function GET() {
  try {
    // Backend base URL (ör: http://localhost:3001 veya https://api.domain.com)
    const API_BASE =
      (process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "").trim()

    if (!API_BASE) {
      return NextResponse.json(
        { message: "API_BASE env missing (set API_BASE in .env.local)" },
        { status: 500 }
      )
    }

    // Backend endpoint: çoğu projede /api/kvkk olur
    const upstream = joinUrl(API_BASE, "/api/kvkk")

    const res = await fetch(upstream, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const contentType = res.headers.get("content-type") || ""

    // Upstream hata verdiyse, body'yi olduğu gibi geçir (json/text)
    if (!res.ok) {
      const body = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => "")

      return NextResponse.json(
        {
          message: "Upstream KVKK request failed",
          status: res.status,
          upstream,
          body,
        },
        { status: res.status }
      )
    }

    // Success: JSON dön
    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "KVKK proxy error" },
      { status: 500 }
    )
  }
}