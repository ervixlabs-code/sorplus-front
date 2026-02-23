/* eslint-disable @typescript-eslint/no-explicit-any */
// app/sikayetler/page.tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  ChevronDown,
  Eye,
  MessageSquare,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== API ================== */
/**
 * ✅ Public ortam için:
 * - env varsa onu kullan
 * - yoksa prod base yaz (localhost bırakma)
 */
const API_BASE =
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE?.trim() ||
  "https://sorplus-admin-backend.onrender.com" // <- kendi public backend base'in neyse bunu yaz

async function safeJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text || null
  }
}

/* ================== TYPES ================== */
type Category = string
type SortKey = "new" | "views" | "comments"

type ComplaintItem = {
  id: string
  category: Category
  title: string
  excerpt: string
  timeAgo: string
  views: number
  comments: number
  severity: "Düşük" | "Orta" | "Yüksek"
  hasBrandInText?: boolean
}

/** Backend -> esnek public complaint shape */
type ApiComplaint = {
  id: string | number

  title?: string
  body?: string
  brandName?: string | null
  hasCompanyMention?: boolean
  mentionedCompanies?: string[]
  createdAt?: string

  detail?: string
  description?: string
  excerpt?: string

  views?: number
  viewCount?: number
  comments?: number
  commentCount?: number

  severity?: "LOW" | "MEDIUM" | "HIGH" | "Düşük" | "Orta" | "Yüksek"

  category?: { id?: string | number; name?: string } | string | null
  categoryId?: string | number | null
}

type ApiCategory = {
  id: number
  name: string
  isActive?: boolean
}

/* ================== HELPERS ================== */
function formatTR(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n)
  } catch {
    return String(n)
  }
}

function sevBadge(sev: ComplaintItem["severity"]) {
  if (sev === "Yüksek") return "border-orange-400/25 bg-orange-400/10 text-orange-100"
  if (sev === "Orta") return "border-indigo-400/25 bg-indigo-400/10 text-indigo-100"
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
}

function normalizeSeverity(s?: ApiComplaint["severity"]): ComplaintItem["severity"] {
  if (!s) return "Orta"
  if (s === "HIGH" || s === "Yüksek") return "Yüksek"
  if (s === "LOW" || s === "Düşük") return "Düşük"
  return "Orta"
}

function timeAgoTR(dateISO?: string) {
  if (!dateISO) return "—"
  const d = new Date(dateISO)
  const now = new Date()
  const diff = Math.max(0, now.getTime() - d.getTime())
  const min = Math.floor(diff / 60000)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (min < 1) return "az önce"
  if (min < 60) return `${min} dk önce`
  if (hr < 24) return `${hr} saat önce`
  if (day === 1) return `dün`
  if (day < 7) return `${day} gün önce`
  const wk = Math.floor(day / 7)
  if (wk < 4) return `${wk} hafta önce`
  return d.toLocaleDateString("tr-TR")
}

function makeExcerpt(text?: string, max = 150) {
  const t = String(text || "").trim().replace(/\s+/g, " ")
  if (!t) return "—"
  return t.length > max ? t.slice(0, max - 1) + "…" : t
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function maskOneBrand(text: string, brand: string) {
  const t = String(text || "")
  const b = String(brand || "").trim()
  if (!t || !b) return t
  const first = b[0] || "*"
  const mask = `${first}***`
  const pattern = escapeRegExp(b)
  const reWord = new RegExp(`\\b${pattern}\\b`, "giu")
  if (reWord.test(t)) return t.replace(reWord, mask)
  const reSoft = new RegExp(pattern, "giu")
  return t.replace(reSoft, mask)
}

function maskBrandsInText(text: string, brands: Array<string | null | undefined>) {
  let out = String(text || "")
  const list = (brands || [])
    .map((x) => String(x || "").trim())
    .filter(Boolean)

  if (!out || list.length === 0) return out

  list.sort((a, b) => b.length - a.length)
  for (const b of list) out = maskOneBrand(out, b)
  return out
}

function hasAnyBrandMention(text: string, brands: Array<string | null | undefined>) {
  const t = String(text || "")
  const list = (brands || [])
    .map((x) => String(x || "").trim())
    .filter(Boolean)

  if (!t || list.length === 0) return false

  for (const b of list) {
    try {
      const re = new RegExp(escapeRegExp(b), "iu")
      if (re.test(t)) return true
    } catch {
      if (t.toLowerCase().includes(b.toLowerCase())) return true
    }
  }
  return false
}

function buildPager(totalPages: number, current: number) {
  const clamp = (v: number) => Math.max(1, Math.min(totalPages, v))
  const c = clamp(current)
  if (totalPages <= 10) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const out: Array<number | "…"> = []
  const left = Math.max(2, c - 2)
  const right = Math.min(totalPages - 1, c + 2)

  out.push(1)
  if (left > 2) out.push("…")
  for (let n = left; n <= right; n++) out.push(n)
  if (right < totalPages - 1) out.push("…")
  out.push(totalPages)
  return out
}

/* ================== SMALL UI PRIMS ================== */
function PillButton({
  children,
  onClick,
  href,
  variant = "primary",
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "secondary" | "ghost"
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : "border border-white/10 bg-white/10 text-white/85 shadow-sm backdrop-blur hover:bg-white/15 focus:ring-white/15"

  if (href) {
    return (
      <Link href={href} className={clsx(base, styles, className)}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={clsx(base, styles, className)}>
      {children}
    </button>
  )
}

function CategoryDropdown({
  value,
  options,
  onChange,
}: {
  value: string | "Tümü"
  options: Array<{ id: number; name: string }>
  onChange: (v: { id: number | null; name: string | "Tümü" }) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 text-[11px] font-light text-white/55">Kategori</div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex h-[46px] min-w-[220px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white/90 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={clsx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] shadow-2xl">
          <div className="max-h-[280px] overflow-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange({ id: null, name: "Tümü" })
                setOpen(false)
              }}
              className={clsx(
                "w-full rounded-xl px-3 py-2 text-left text-sm",
                value === "Tümü" ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
              )}
            >
              Tümü
            </button>

            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange({ id: opt.id, name: opt.name })
                  setOpen(false)
                }}
                className={clsx(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  opt.name === value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
                )}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const label = value === "new" ? "En Yeni" : value === "views" ? "En Çok Görüntülenen" : "En Çok Yorumlanan"

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 text-[11px] font-light text-white/55">Sıralama</div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex h-[46px] min-w-[220px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white/90 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/10"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={clsx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] shadow-2xl">
          <div className="p-1">
            {[
              { k: "new", t: "En Yeni" },
              { k: "views", t: "En Çok Görüntülenen" },
              { k: "comments", t: "En Çok Yorumlanan" },
            ].map((it) => (
              <button
                key={it.k}
                type="button"
                onClick={() => {
                  onChange(it.k as SortKey)
                  setOpen(false)
                }}
                className={clsx(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  it.k === value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
                )}
              >
                {it.t}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ================== CARD ================== */
function ComplaintCard({ item, onOpen }: { item: ComplaintItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-5 text-left shadow-[0_22px_80px_-60px_rgba(0,0,0,0.80)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/7"
    >
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.16),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
              {item.category}
            </span>

            <span className="text-[11px] text-white/55">{item.timeAgo}</span>

            <span
              className={clsx(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                sevBadge(item.severity)
              )}
            >
              {item.severity.toUpperCase()}
            </span>

            {item.hasBrandInText ? (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
                ★ metinde marka
              </span>
            ) : null}
          </div>

          <div className="mt-3 line-clamp-2 text-[18px] font-semibold leading-snug tracking-tight text-white">
            {item.title}
          </div>

          <div className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-white/70">{item.excerpt}</div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {formatTR(item.views)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)}
            </span>
          </div>
        </div>

        <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/85 transition group-hover:bg-white/15">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
    </button>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()

  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [categorySel, setCategorySel] = useState<{ id: number | null; name: string | "Tümü" }>({
    id: null,
    name: "Tümü",
  })

  const [sort, setSort] = useState<SortKey>("new")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  const [items, setItems] = useState<ComplaintItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  // Public için kısayol hint yazısı yok, ama input focus kısayolu kalsın.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac")
      const hot = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k"
      if (!hot) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // categories
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" })
        const data = await safeJson(res)
        if (!res.ok) return
        const list: ApiCategory[] = Array.isArray(data) ? data : data?.items || data?.data || []
        const clean = list.filter((c) => c && typeof c.id === "number" && typeof c.name === "string")
        if (alive) setCategories(clean)
      } catch {
        // publicte sessiz geç
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // filter changes => reset page
  useEffect(() => {
    setPage(1)
  }, [categorySel.id, sort, q])

  // complaints fetch
  useEffect(() => {
    let alive = true
    const controller = new AbortController()

    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const skip = (page - 1) * PAGE_SIZE
        const take = PAGE_SIZE

        const params = new URLSearchParams()
        params.set("skip", String(skip))
        params.set("take", String(take))

        const qq = q.trim()
        if (qq) params.set("q", qq)

        if (categorySel.id) params.set("categoryId", String(categorySel.id))
        if (categorySel.name && categorySel.name !== "Tümü") params.set("category", String(categorySel.name))

        if (sort === "new") {
          params.set("sort", "NEW")
          params.set("orderBy", "createdAt")
          params.set("order", "desc")
        } else if (sort === "views") {
          params.set("sort", "VIEWS")
          params.set("orderBy", "views")
          params.set("order", "desc")
        } else {
          params.set("sort", "COMMENTS")
          params.set("orderBy", "comments")
          params.set("order", "desc")
        }

        const res = await fetch(`${API_BASE}/api/complaints/public?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const data = await safeJson(res)
        if (!res.ok) {
          const msg =
            (data && (data.message || data.error || (Array.isArray(data.errors) ? data.errors.join(", ") : null))) ||
            `Liste alınamadı (HTTP ${res.status})`
          throw new Error(String(msg))
        }

        const list: ApiComplaint[] = Array.isArray(data) ? data : data?.items || data?.data || []
        const totalFromApi =
          typeof (data as any)?.total === "number"
            ? (data as any).total
            : typeof (data as any)?.count === "number"
            ? (data as any).count
            : typeof (data as any)?.meta?.total === "number"
            ? (data as any).meta.total
            : null

        const mapped: ComplaintItem[] = (list || []).map((c) => {
          const catName =
            typeof c?.category === "string"
              ? c.category
              : typeof (c?.category as any)?.name === "string"
              ? (c.category as any).name
              : "Diğer"

          const views = Number.isFinite(Number(c?.views)) ? Number(c?.views) : Number(c?.viewCount) || 0
          const comments = Number.isFinite(Number(c?.comments)) ? Number(c?.comments) : Number(c?.commentCount) || 0

          const bodyRaw = String(c?.body ?? c?.detail ?? (c as any)?.description ?? "")

          const brandName = (c as any)?.brandName ?? null
          const mentioned = Array.isArray((c as any)?.mentionedCompanies) ? (c as any).mentionedCompanies : []

          const brandList = Array.from(
            new Set([brandName, ...mentioned].map((x) => String(x || "").trim()).filter(Boolean))
          )

          const titleMasked = maskBrandsInText(String(c?.title || "—"), brandList)
          const bodyMasked = maskBrandsInText(bodyRaw, brandList)

          const excerptFromApi = String(c?.excerpt ?? "").trim()
          const excerpt = excerptFromApi
            ? makeExcerpt(maskBrandsInText(excerptFromApi, brandList), 160)
            : makeExcerpt(bodyMasked, 160)

          const hasMention = !!(c as any)?.hasCompanyMention || hasAnyBrandMention(bodyRaw, brandList)

          return {
            id: String(c?.id ?? ""),
            category: String(catName || "Diğer"),
            title: titleMasked,
            excerpt: String(excerpt || "—"),
            timeAgo: timeAgoTR(c?.createdAt),
            views,
            comments,
            severity: normalizeSeverity(c?.severity),
            hasBrandInText: hasMention,
          }
        })

        if (!alive) return
        setItems(mapped)
        setTotal(totalFromApi ?? (skip + mapped.length))
      } catch (e: any) {
        if (!alive) return
        if (e?.name === "AbortError") return
        setErr(e?.message || "Liste alınamadı.")
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
      controller.abort()
    }
  }, [page, PAGE_SIZE, categorySel.id, categorySel.name, sort, q])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total, PAGE_SIZE])
  const pageSafe = Math.min(page, totalPages)
  const pager = useMemo(() => buildPager(totalPages, pageSafe), [totalPages, pageSafe])

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

      {/* 🌌 GLOBAL DARK GRID BACKGROUND */}
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

      {/* TOP INFO BAND (sade) */}
      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Şikayetler •{" "}
            <span className="ml-2 text-white/70">{loading ? "yükleniyor" : `${formatTR(total)} kayıt`}</span>
          </div>

          {/* public için gereksiz kısayol text kaldırıldı */}
        </div>
      </div>

      <PublicTopbar subtitle="Şikayetler" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 sm:px-6 lg:px-10 2xl:px-14">
        {/* HEADER */}
        <section className="pt-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-[34px] font-semibold tracking-tight text-white sm:text-[36px] md:text-[44px]">
                Şikayetler
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Arama yap, kategori seç, sıralamayı değiştir. Detaya girmek için karta tıkla.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto">
              <div className="w-full md:w-[420px]">
                <div className="mb-1 text-[11px] font-light text-white/55">Ara</div>
                <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-sm backdrop-blur">
                  <div className="px-4 text-white/70">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    ref={searchRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Başlık, açıklama, kategori…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="no-scrollbar flex items-end gap-3 overflow-x-auto pb-1">
                <div className="shrink-0">
                  <CategoryDropdown
                    value={categorySel.name}
                    options={categories.map((c) => ({ id: c.id, name: c.name }))}
                    onChange={(v) => setCategorySel({ id: v.id, name: v.name })}
                  />
                </div>
                <div className="shrink-0">
                  <SortDropdown value={sort} onChange={setSort} />
                </div>
              </div>
            </div>
          </div>

          {/* FILTER SUMMARY + CTA (public clean) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <SlidersHorizontal className="h-4 w-4 text-white/60" />
              <span>
                {categorySel.name === "Tümü" ? "Tüm kategoriler" : categorySel.name}
                {" • "}
                {sort === "new" ? "En Yeni" : sort === "views" ? "En Çok Görüntülenen" : "En Çok Yorumlanan"}
              </span>
              {err ? <span className="ml-2 text-orange-200">• {err}</span> : null}
            </div>

            <div className="flex items-center gap-2">
              <PillButton variant="ghost" onClick={() => router.back()}>
                Geri
              </PillButton>
              <PillButton variant="secondary" href="/sikayet-yaz">
                Şikayet Yaz
              </PillButton>
            </div>
          </div>
        </section>

        {/* GRID */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
              Yükleniyor…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
              Sonuç bulunamadı. Arama/filtreyi değiştirip tekrar dene.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((it) => (
                <ComplaintCard key={it.id} item={it} onOpen={() => router.push(`/sikayetler/${it.id}`)} />
              ))}
            </div>
          )}
        </section>

        {/* PAGINATION */}
        <section className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <div className="text-xs text-white/60">
            Sayfa <span className="font-semibold text-white/85">{pageSafe}</span> /{" "}
            <span className="font-semibold text-white/85">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1 || loading}
              className={clsx(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold backdrop-blur transition",
                pageSafe <= 1 || loading
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "border-white/10 bg-white/10 text-white/85 hover:bg-white/15"
              )}
            >
              <ArrowLeft className="h-4 w-4" /> Önceki
            </button>

            <div className="no-scrollbar flex max-w-[62vw] items-center gap-2 overflow-auto px-1">
              {pager.map((p, idx) =>
                p === "…" ? (
                  <div key={`dots-${idx}`} className="px-1 text-white/40">
                    …
                  </div>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={clsx(
                      "h-11 w-11 shrink-0 rounded-full border text-sm font-semibold transition",
                      p === pageSafe
                        ? "border-white/20 bg-white text-black"
                        : "border-white/10 bg-white/10 text-white/85 hover:bg-white/15",
                      loading && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages || loading}
              className={clsx(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold backdrop-blur transition",
                pageSafe >= totalPages || loading
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "border-white/10 bg-white/10 text-white/85 hover:bg-white/15"
              )}
            >
              Sonraki <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}