"use client"

import React from "react"
import Link from "next/link"
import { Hammer, ArrowLeft, Sparkles } from "lucide-react"

export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1020] text-white">
      {/* DARK BASE */}
      <div className="absolute inset-0 -z-10 bg-[#0B1020]" />

      {/* GRID + GLOWS */}
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

      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur sm:rounded-[34px] sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_50%_110%,rgba(249,115,22,0.10),transparent_45%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Yakında burada
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:h-14 sm:w-14">
                <Hammer className="h-6 w-6 text-[#F97316]" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-[38px] md:text-[46px]">
                  Üzerinde çalışıyoruz
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
                  Bu sayfa şu an geliştirme aşamasında. Çok yakında daha kapsamlı içerik ve
                  işlevlerle burada olacak.
                </p>
              </div>
            </div>

            <div className="relative mt-8 rounded-[20px] border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 text-xs text-white/60">
                <span>Durum</span>
                <span className="font-semibold text-white/80">Geliştiriliyor</span>
              </div>

              <div className="mt-3 h-2.5 w-full rounded-full bg-white/10">
                <div className="h-2.5 w-[72%] rounded-full bg-[#F97316]" />
              </div>

              <div className="mt-3 text-xs leading-relaxed text-white/55">
                Arayüz hazırlandı, içerik ve bağlantılar tamamlanıyor.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-white/90"
              >
                <ArrowLeft className="h-4 w-4" />
                Anasayfaya Dön
              </Link>

              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/15"
              >
                Bize Ulaş
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
      </main>
    </div>
  )
}