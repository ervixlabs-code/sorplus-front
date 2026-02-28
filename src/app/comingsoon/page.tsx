"use client"

import React from "react"
import { Hammer } from "lucide-react"

export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* DARK BASE */}
      <div className="absolute inset-0 -z-10 bg-[#0B1020]" />

      {/* GRID + GLOWS (landing dili) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.20),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(249,115,22,0.16),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-14">
        {/* GLASS CARD */}
        <div className="relative w-full overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-8 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur sm:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_50%_110%,rgba(249,115,22,0.10),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Hammer className="h-6 w-6 text-[#F97316]" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[46px]">
                Üzerinde çalışıyoruz
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                Bu sayfa şu an geliştirme aşamasında.
              </p>
            </div>
          </div>

          {/* SINGLE LINE PROGRESS (minimal) */}
          <div className="relative mt-8">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Durum</span>
              <span className="font-semibold text-white/80">Geliştiriliyor</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/10">
              <div className="h-2 w-[72%] rounded-full bg-[#F97316]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}