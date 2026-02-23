import { NextResponse } from "next/server"

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "")
  const p = path.replace(/^\/+/, "")
  return `${b}/${p}`
}

export async function GET() {
  try {
    // env önceliği: API_BASE (önerilen) -> NEXT_PUBLIC_API_BASE
    const API_BASE =
      (process.env.API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        "https://sorplus-admin-backend.onrender.com").trim()

    const upstream = joinUrl(API_BASE, "/api/rules/active")

    const res = await fetch(upstream, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    const ct = res.headers.get("content-type") || ""

    if (!res.ok) {
      const body = ct.includes("application/json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => "")
      return NextResponse.json(
        {
          message: "Upstream RULES request failed",
          status: res.status,
          upstream,
          body,
        },
        { status: res.status }
      )
    }

    // success
    const data = await res.json()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Rules proxy error" },
      { status: 500 }
    )
  }
}