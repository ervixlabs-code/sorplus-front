// src/app/sss/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import { ArrowLeft, BadgeCheck, Search, Shield, Sparkles, Users } from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

type FaqCategory = string

type FaqItem = {
  id: string
  category: FaqCategory
  q: string
  a: React.ReactNode
  tags?: string[]
}

/** ✅ Prod için ENV kullan: Vercel -> NEXT_PUBLIC_API_BASE */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://sorplus-admin-backend.onrender.com").replace(/\/+$/, "")

function formatTR(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n)
  } catch {
    return String(n)
  }
}

async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${res.status} ${res.statusText} • ${text?.slice(0, 200)}`)
  }
  return res.json()
}

function PillButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "white"
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : variant === "white"
      ? "bg-white text-black shadow-sm hover:bg-white/90 focus:ring-white/30"
      : "border border-white/15 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/20"

  return (
    <button type="button" onClick={onClick} className={clsx(base, styles)}>
      {children}
    </button>
  )
}

/** ✅ Native button props desteklesin */
function IconCircleButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.99]",
        className
      )}
    >
      {children}
    </button>
  )
}

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function FaqAccordion({
  item,
  open,
  onToggle,
}: {
  item: FaqItem
  open: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={clsx(
        "group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/20 p-5 text-left transition hover:bg-black/30",
        open && "bg-black/30"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_90%_30%,rgba(16,185,129,0.12),transparent_55%)]" />

      <button type="button" onClick={onToggle} className="relative flex w-full items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
              {item.category}
            </span>

            {item.tags?.slice(0, 3)?.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-2 text-[15px] font-semibold text-white/90">{item.q}</div>
        </div>

        <span
          className={clsx(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition group-hover:bg-white/15",
            open && "bg-white/15"
          )}
        >
          <span className={clsx("text-xs font-semibold", open && "opacity-90")}>{open ? "—" : "+"}</span>
        </span>
      </button>

      <div
        className={clsx(
          "relative overflow-hidden text-sm leading-relaxed text-white/75 transition-all",
          open ? "mt-3 max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {open ? <div className="pt-2">{item.a}</div> : null}
      </div>
    </div>
  )
}

/** 🔧 API normalize helpers */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickArray(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeStr(v: any, fallback = ""): string {
  if (typeof v === "string") return v
  if (v == null) return fallback
  return String(v)
}

export default function Page() {
  const router = useRouter()
  const goList = () => router.push("/sikayetler")
  const goRules = () => router.push("/kurallar")
  const goGuide = () => router.push("/rehber")

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [items, setItems] = useState<FaqItem[]>([])

  const [cat, setCat] = useState<FaqCategory | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        setLoading(true)
        setErr(null)

        const [catsRaw, faqsRaw] = await Promise.all([apiGet("/api/faq-categories"), apiGet("/api/faqs")])

        const catsArr = pickArray(catsRaw)
        const faqsArr = pickArray(faqsRaw)

        const catNames: string[] = catsArr
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => safeStr(c?.name ?? c?.title ?? c?.slug ?? c))
          .filter(Boolean)

        // ✅ fallback: kategoriler boşsa, faqs'tan derive et (STRING olarak garantile)
        const derivedCats: string[] = Array.from(
          new Set(
            faqsArr
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((f: any) =>
                safeStr(
                  f?.category?.name ??
                    f?.categoryName ??
                    f?.faqCategory?.name ??
                    f?.faqCategoryName ??
                    f?.category ??
                    "Genel"
                )
              )
              .filter(Boolean)
          )
        )
          .map((x) => safeStr(x))
          .filter(Boolean)

        // ✅ burada kesin string[] olsun
        const baseCats: string[] = (catNames.length ? catNames : derivedCats).filter(Boolean)

        // ✅ Vercel TS "unknown" hatasını %100 kır: comparator paramlarını string yap
        const finalCats: string[] = baseCats.slice().sort((a: string, b: string) => a.localeCompare(b, "tr"))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: FaqItem[] = faqsArr.map((f: any) => {
          const id = safeStr(f?.id ?? f?._id ?? crypto?.randomUUID?.() ?? Math.random())
          const category = safeStr(
            f?.category?.name ??
              f?.categoryName ??
              f?.faqCategory?.name ??
              f?.faqCategoryName ??
              f?.category ??
              "Genel"
          )

          const question = safeStr(f?.question ?? f?.q ?? f?.title ?? "Soru")
          const answerText = safeStr(f?.answer ?? f?.a ?? f?.content ?? "")

          const tags: string[] | undefined = Array.isArray(f?.tags)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? f.tags.map((t: any) => safeStr(t)).filter(Boolean)
            : undefined

          const answerNode = (
            <div className="space-y-2">
              <div className="whitespace-pre-wrap">{answerText || "—"}</div>
            </div>
          )

          return { id, category, q: question, a: answerNode, tags }
        })

        if (!alive) return
        setCategories(finalCats)
        setItems(normalized)
        setOpenId((prev) => prev ?? (normalized[0]?.id ?? null))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (!alive) return
        setErr(e?.message ?? "Bir hata oluştu.")
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return items.filter((it) => {
      const catOk = cat === "Tümü" ? true : it.category === cat
      if (!catOk) return false
      if (!qq) return true
      const blob = `${it.q} ${it.category} ${(it.tags ?? []).join(" ")}`.toLowerCase()
      return blob.includes(qq)
    })
  }, [items, cat, q])

  const total = items.length
  const showing = filtered.length

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 -z-10">
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

      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-2.5 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Sıkça Sorulan Sorular • <span className="ml-2 text-white/70">{loading ? "yükleniyor" : "canlı"}</span>
          </div>
        </div>
      </div>

      <PublicTopbar subtitle="Şikayetler" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-8 lg:px-10 2xl:px-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri dön
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <MetaPill icon={<Users className="h-4 w-4" />} label={`${formatTR(total)} soru`} />
            <MetaPill icon={<Shield className="h-4 w-4" />} label="Moderasyon odaklı" />
            <MetaPill icon={<BadgeCheck className="h-4 w-4" />} label="Kategori bazlı" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.28),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Yardım merkezi
                </div>

                <h1 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-tight text-white md:text-[44px]">
                  Sıkça Sorulan Sorular
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                  Hızlı cevaplar burada. Arama yap, kategoriye göre filtrele, bir soruyu aç ve cevabı gör.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex w-full items-center overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-2 px-4 text-white/70">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Sorularda ara… (örn: kvkk, şikayet, moderasyon)"
                      className="h-[50px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                    />
                  </div>

                  <PillButton variant="secondary" onClick={goList}>
                    Tüm şikayetler
                  </PillButton>
                </div>

                <div className="mt-4 text-xs text-white/60">
                  Gösterilen: <span className="font-semibold text-white/85">{formatTR(showing)}</span> /{" "}
                  {formatTR(total)}
                </div>

                {err ? (
                  <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                    <div className="font-semibold">SSS yüklenemedi</div>
                    <div className="mt-1 text-rose-100/80">{err}</div>
                    <div className="mt-3">
                      <PillButton
                        variant="white"
                        onClick={() => {
                          window.location.reload()
                        }}
                      >
                        Tekrar dene
                      </PillButton>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-[96px] space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Kategoriler</div>
                    <div className="mt-1 text-sm text-white/65">Filtrele ve hızlı bul.</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(["Tümü", ...categories] as Array<FaqCategory | "Tümü">).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      className={clsx(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                        c === cat
                          ? "border-white/20 bg-white/15 text-white"
                          : "border-white/10 bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <PillButton variant="ghost" onClick={goRules}>
                    <Shield className="h-4 w-4" />
                    Kurallar
                  </PillButton>
                  <PillButton variant="ghost" onClick={goGuide}>
                    <BadgeCheck className="h-4 w-4" />
                    Rehber
                  </PillButton>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                  <div className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div>
                      <div className="font-semibold text-white/80">İpucu</div>
                      <div className="mt-1">Eğer aradığın cevabı bulamazsan, en yakın bölüm: Kurallar + Rehber.</div>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 text-sm text-white/70 backdrop-blur">
                  SSS içerikleri yükleniyor…
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div className="text-[18px] font-extrabold tracking-tight text-white">Sorular</div>
            <div className="flex items-center gap-2">
              <IconCircleButton onClick={() => setOpenId(null)} aria-label="Hepsini kapat" title="Hepsini kapat">
                <span className="text-xs font-semibold text-white/80">—</span>
              </IconCircleButton>

              <IconCircleButton
                onClick={() => setOpenId(filtered[0]?.id ?? null)}
                aria-label="İlkini aç"
                title="İlkini aç"
              >
                <span className="text-xs font-semibold text-white/80">+</span>
              </IconCircleButton>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {!loading && !err && filtered.length ? (
              filtered.map((it) => (
                <FaqAccordion
                  key={it.id}
                  item={it}
                  open={openId === it.id}
                  onToggle={() => setOpenId((cur) => (cur === it.id ? null : it.id))}
                />
              ))
            ) : !loading && !err ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                Aradığın kriterde soru bulunamadı. Filtreyi değiştir veya daha genel arama yap.
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}