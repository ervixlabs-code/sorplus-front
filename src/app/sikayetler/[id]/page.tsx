/* eslint-disable @typescript-eslint/no-explicit-any */
// app/sikayetler/[id]/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import clsx from "clsx"
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Eye,
  Flag,
  Heart,
  LogIn,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== API ================== */
const API_BASE = "http://localhost:3002"

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
type Severity = "Düşük" | "Orta" | "Yüksek"

type ComplaintDetail = {
  id: string
  title: string
  category: Category
  timeAgo: string
  severity: Severity
  views: number
  comments: number
  likes: number
  hasBrandInText?: boolean
  hasImage?: boolean
  userName: string
  avatarLetter: string
  content: string
  images?: string[]
}

type CommentItem = {
  id: string
  userName: string
  avatarLetter: string
  timeAgo: string
  text: string
  likes: number
}

/** Backend -> esnek */
type ApiComplaint = {
  id: string | number

  // Prisma alanları
  title?: string
  body?: string
  brandName?: string | null
  hasCompanyMention?: boolean
  mentionedCompanies?: string[] // ✅ Prisma alanı
  createdAt?: string

  // eski/alternatif
  detail?: string
  content?: string

  severity?: "LOW" | "MEDIUM" | "HIGH" | "Düşük" | "Orta" | "Yüksek"
  views?: number
  viewCount?: number
  comments?: number
  commentCount?: number
  likes?: number
  likeCount?: number
  hasBrandInText?: boolean
  hasImage?: boolean
  images?: string[] | null

  reporter?: { name?: string | null } | null
  userName?: string | null

  category?: { id?: number; name?: string } | string | null
  categoryId?: number | null
}

/* ================== HELPERS ================== */
function formatTR(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n)
  } catch {
    return String(n)
  }
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

function normalizeSeverity(s?: ApiComplaint["severity"]): Severity {
  if (!s) return "Orta"
  if (s === "HIGH" || s === "Yüksek") return "Yüksek"
  if (s === "LOW" || s === "Düşük") return "Düşük"
  return "Orta"
}

function severityUI(s: Severity) {
  if (s === "Yüksek") return { label: "YÜKSEK", cls: "border-orange-400/25 bg-orange-400/10 text-orange-100" }
  if (s === "Orta") return { label: "ORTA", cls: "border-indigo-400/25 bg-indigo-400/10 text-indigo-100" }
  return { label: "DÜŞÜK", cls: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" }
}

function pickCategoryName(c?: ApiComplaint["category"]) {
  if (!c) return "Diğer"
  if (typeof c === "string") return c
  if (typeof (c as any)?.name === "string") return String((c as any).name)
  return "Diğer"
}

function makeAvatarLetter(name?: string | null) {
  const n = (name || "").trim()
  if (!n) return "?"
  return n[0].toUpperCase()
}

function normalizeImages(images?: ApiComplaint["images"]) {
  const arr = Array.isArray(images) ? images.filter(Boolean).map(String) : []
  return arr.length ? arr : undefined
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Tek marka: Trendyol -> T*** */
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

/** brandName + mentionedCompanies hepsini maskele */
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

/** Metinde herhangi bir marka geçiyor mu? */
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

function buildBrandList(api: ApiComplaint) {
  const brandName = (api as any)?.brandName ?? null
  const mentioned = Array.isArray((api as any)?.mentionedCompanies) ? (api as any).mentionedCompanies : []
  return Array.from(new Set([brandName, ...mentioned].map((x) => String(x || "").trim()).filter(Boolean)))
}

function normalizeComplaint(api: ApiComplaint, fallbackId: string): ComplaintDetail {
  const userName = String(api?.reporter?.name || api?.userName || "Anonim")
  const avatarLetter = makeAvatarLetter(userName)

  const views = Number.isFinite(Number(api?.views)) ? Number(api?.views) : Number(api?.viewCount) || 0
  const comments = Number.isFinite(Number(api?.comments)) ? Number(api?.comments) : Number(api?.commentCount) || 0
  const likes = Number.isFinite(Number(api?.likes)) ? Number(api?.likes) : Number(api?.likeCount) || 0

  const contentRaw = String((api as any)?.body ?? api?.detail ?? api?.content ?? "").trim()

  const brandList = buildBrandList(api)

  const titleMasked = maskBrandsInText(String(api?.title || "—"), brandList)
  const contentMasked = maskBrandsInText(contentRaw || "—", brandList)

  const hasMention = !!(api as any)?.hasCompanyMention || !!api?.hasBrandInText || hasAnyBrandMention(contentRaw, brandList)

  return {
    id: String(api?.id ?? fallbackId),
    title: titleMasked,
    category: pickCategoryName(api?.category),
    timeAgo: timeAgoTR(api?.createdAt),
    severity: normalizeSeverity(api?.severity),
    views,
    comments,
    likes,
    hasBrandInText: hasMention,
    hasImage: !!api?.hasImage,
    userName,
    avatarLetter,
    content: contentMasked,
    images: normalizeImages(api?.images),
  }
}

/* ================== UI BITS ================== */
function PillButton({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "white"
  disabled?: boolean
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : variant === "white"
      ? "bg-white text-black shadow-sm hover:bg-white/90 focus:ring-white/30"
      : "border border-white/15 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/20"
  return (
    <button type="button" onClick={onClick} className={clsx(base, styles)} disabled={disabled}>
      {children}
    </button>
  )
}

function IconCircleButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.99]"
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

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : ""

  const goWrite = () => router.push("/sikayet-yaz")
  const goList = () => router.push("/sikayetler")
  const goLogin = () => router.push(`/giris?next=${encodeURIComponent(`/sikayetler/${id}`)}`)
  const goRegister = () => router.push(`/kayit?next=${encodeURIComponent(`/sikayetler/${id}`)}`)
  const requireAuth = () => goLogin()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null)
  const [similar, setSimilar] = useState<ComplaintDetail[]>([])

  const [commentText, setCommentText] = useState("")
  const [liked, setLiked] = useState(false)

  const sev = useMemo(() => (complaint ? severityUI(complaint.severity) : severityUI("Orta")), [complaint])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isHot = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"
      if (!isHot) return
      e.preventDefault()
      router.push("/sikayet-yaz")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  // fetch detail
  useEffect(() => {
    if (!id) return
    let alive = true
    const controller = new AbortController()

    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch(`${API_BASE}/api/complaints/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const data = await safeJson(res)
        if (!res.ok) {
          const msg =
            (data && (data.message || data.error || (Array.isArray(data.errors) ? data.errors.join(", ") : null))) ||
            `Şikayet alınamadı (HTTP ${res.status})`
          throw new Error(String(msg))
        }

        const raw: ApiComplaint = (data?.item || data?.data || data) as any
        const normalized = normalizeComplaint(raw, id)

        if (!alive) return
        setComplaint(normalized)

        // similar
        const params = new URLSearchParams()
        params.set("take", "4")
        params.set("skip", "0")
        params.set("sort", "NEW")
        params.set("orderBy", "createdAt")
        params.set("order", "desc")
        if (normalized.category && normalized.category !== "Diğer") params.set("category", normalized.category)
        params.set("excludeId", normalized.id)

        const r2 = await fetch(`${API_BASE}/api/complaints/public?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const d2 = await safeJson(r2)
        if (r2.ok) {
          const list: ApiComplaint[] = Array.isArray(d2) ? d2 : d2?.items || d2?.data || []
          const mapped = (list || [])
            .map((x) => normalizeComplaint(x, String(x?.id ?? "")))
            .filter((x) => x.id && x.id !== normalized.id)
            .slice(0, 4)
          if (alive) setSimilar(mapped)
        } else {
          if (alive) setSimilar([])
        }
      } catch (e: any) {
        if (!alive) return
        if (e?.name === "AbortError") return
        setErr(e?.message || "Şikayet alınamadı.")
        setComplaint(null)
        setSimilar([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
      controller.abort()
    }
  }, [id])

  const comments = useMemo<CommentItem[]>(
    () => [
      { id: "c1", userName: "Ece", avatarLetter: "E", timeAgo: "5 dk önce", text: "Aynısını yaşadım...", likes: 7 },
      { id: "c2", userName: "Hakan", avatarLetter: "H", timeAgo: "18 dk önce", text: "Yazılı kayıt açtır...", likes: 4 },
      { id: "c3", userName: "Sena", avatarLetter: "S", timeAgo: "1 saat önce", text: "Ekran görüntüsü ekleyince...", likes: 2 },
    ],
    []
  )

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

      {/* TOP INFO BAND */}
      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Şikayet detayı <span className="ml-2 text-white/70">• güvenli paylaşım</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            ⌘K / Ctrl+K → <span className="font-semibold text-white">Şikayet Yaz</span>
          </div>
        </div>
      </div>

      <PublicTopbar
        subtitle="Şikayetler"
        showSearchStub={false} // istersen true (detay sayfasında input stub)
        nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
      />

      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri dön
          </button>

          <div className="no-scrollbar flex max-w-full flex-wrap items-center gap-2 overflow-x-auto">
            <MetaPill icon={<TrendingUp className="h-4 w-4" />} label={`Kategori: ${complaint?.category || "—"}`} />
            <MetaPill icon={<Eye className="h-4 w-4" />} label={`${formatTR(complaint?.views || 0)} görüntülenme`} />
            <MetaPill icon={<MessageSquare className="h-4 w-4" />} label={`${formatTR(complaint?.comments || 0)} yorum`} />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-[34px] border border-white/10 bg-white/5 p-10 text-white/70 backdrop-blur">
            Yükleniyor…
          </div>
        ) : err ? (
          <div className="mt-6 rounded-[34px] border border-white/10 bg-white/5 p-10 text-white/70 backdrop-blur">
            <div className="font-semibold text-white/90">Şikayet yüklenemedi</div>
            <div className="mt-2">{err}</div>
            <div className="mt-4 flex gap-2">
              <PillButton variant="ghost" onClick={goList}>
                Şikayetlere dön
              </PillButton>
              <PillButton variant="secondary" onClick={goWrite}>
                Şikayet Yaz
              </PillButton>
            </div>
          </div>
        ) : !complaint ? null : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-6 sm:p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.26),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                        <span className="text-sm font-extrabold text-white/90">{complaint.avatarLetter}</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/90">{complaint.userName}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                            {complaint.category}
                          </span>
                          <span className="text-[11px] text-white/55">{complaint.timeAgo}</span>
                          {complaint.hasBrandInText ? (
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                              ★ metinde marka
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          sev.cls
                        )}
                      >
                        {sev.label}
                      </span>
                      <IconCircleButton onClick={requireAuth}>
                        <Flag className="h-4 w-4 text-white/80" />
                      </IconCircleButton>
                    </div>
                  </div>

                  <h1 className="text-[24px] font-extrabold leading-snug tracking-tight text-white sm:text-[28px] md:text-[34px]">
                    {complaint.title}
                  </h1>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                        <Eye className="h-4 w-4" /> {formatTR(complaint.views)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                        <MessageSquare className="h-4 w-4" /> {formatTR(complaint.comments)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                        <ThumbsUp className="h-4 w-4" /> {formatTR(complaint.likes + (liked ? 1 : 0))}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <PillButton variant="ghost" onClick={() => setLiked((s) => !s)}>
                        <Heart className={clsx("h-4 w-4", liked ? "text-pink-300" : "text-white")} />
                        Ben de yaşadım
                      </PillButton>

                      <PillButton variant="white" onClick={goWrite}>
                        <Plus className="h-4 w-4" />
                        Şikayet Yaz
                      </PillButton>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                    <div className="prose prose-invert max-w-none break-words">
                      {complaint.content.split("\n").map((line, idx) => (
                        <p
                          key={idx}
                          className={clsx(
                            "m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
                            line.trim() === "" ? "h-3" : "text-white/80 leading-relaxed"
                          )}
                        >
                          {line}
                        </p>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                      <div className="flex items-start gap-2">
                        <Shield className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <div>
                          <div className="font-semibold text-white/80">Kişisel veri uyarısı</div>
                          <div className="mt-1">
                            Telefon, T.C., adres, kart bilgisi gibi kişisel verileri paylaşma. Paylaşımlar moderasyondan
                            geçebilir.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {complaint.images?.length ? (
                    <div>
                      <div className="text-sm font-semibold text-white/85">Ekler</div>
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {complaint.images.map((name, i) => (
                          <div
                            key={i}
                            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                            title={name}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.22),rgba(16,185,129,0.18),rgba(249,115,22,0.14))]" />
                            <div className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-white/75">
                              {name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-[18px] font-extrabold tracking-tight text-white">Yorumlar</div>
                        <div className="mt-1 text-sm text-white/65">
                          Saygılı kalalım. Hakaret / kişisel veri içeren yorumlar kaldırılabilir.
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PillButton variant="ghost" onClick={goLogin}>
                          <LogIn className="h-4 w-4" />
                          Yorum için giriş
                        </PillButton>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[26px] border border-white/10 bg-black/20 p-4">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Yorum yaz…"
                        className="min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                      />

                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-white/55">İpucu: tarih, süreç, sonuç yaz — kişisel veri yok.</div>
                        <div className="flex items-center gap-2">
                          <PillButton variant="ghost" onClick={() => setCommentText("")} disabled={!commentText.trim()}>
                            Temizle
                          </PillButton>
                          <PillButton variant="secondary" onClick={requireAuth} disabled={!commentText.trim()}>
                            <MessageSquare className="h-4 w-4" />
                            Gönder
                          </PillButton>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                                <span className="text-sm font-extrabold text-white/90">{c.avatarLetter}</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white/90">{c.userName}</div>
                                <div className="text-[11px] text-white/55">{c.timeAgo}</div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/75 hover:bg-white/15"
                              onClick={requireAuth}
                            >
                              <ThumbsUp className="h-4 w-4" /> {formatTR(c.likes)}
                            </button>
                          </div>

                          <div className="mt-3 text-sm leading-relaxed text-white/80">{c.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-[92px] space-y-5">
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white/90">Aynı sorunu mu yaşadın?</div>
                      <div className="mt-1 text-sm text-white/65">Deneyimini yaz, başkaları yalnız kalmasın.</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <Sparkles className="h-5 w-5 text-emerald-300" />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <PillButton variant="secondary" onClick={goWrite}>
                      <Plus className="h-4 w-4" />
                      Şikayet Yaz
                    </PillButton>

                    <div className="flex gap-2">
                      <PillButton variant="ghost" onClick={goLogin}>
                        <LogIn className="h-4 w-4" />
                        Giriş
                      </PillButton>
                      <PillButton variant="ghost" onClick={goRegister}>
                        <UserPlus className="h-4 w-4" />
                        Kayıt
                      </PillButton>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                      <Users className="h-4 w-4" /> Topluluk
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                      <Shield className="h-4 w-4" /> Moderasyon
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                      <BadgeCheck className="h-4 w-4" /> Kategori bazlı
                    </span>
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">Benzer şikayetler</div>
                    <button className="text-xs text-white/70 hover:text-white" onClick={goList} type="button">
                      Hepsini gör
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {similar.length ? (
                      similar.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => router.push(`/sikayetler/${s.id}`)}
                          className="group w-full rounded-[22px] border border-white/10 bg-black/20 p-4 text-left hover:bg-black/30"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                                  {s.category}
                                </span>
                                <span className="text-[11px] text-white/55">{s.timeAgo}</span>
                              </div>

                              <div className="mt-2 line-clamp-2 text-sm font-semibold text-white/85">{s.title}</div>

                              <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
                                <span className="inline-flex items-center gap-1.5">
                                  <Eye className="h-4 w-4" /> {formatTR(s.views)}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <MessageSquare className="h-4 w-4" /> {formatTR(s.comments)}
                                </span>
                              </div>
                            </div>

                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition group-hover:bg-white/15">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-white/60">Bu kategoride başka kayıt yok.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="text-sm font-semibold text-white/90">Mini rehber</div>
                  <ul className="mt-3 space-y-2 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                        ✓
                      </span>
                      Somut detay: tarih, süreç, sonuç.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-200">
                        ✓
                      </span>
                      Kişisel veri paylaşma.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-orange-200">
                        ✓
                      </span>
                      Hakaret yerine çözüm odaklı ol.
                    </li>
                  </ul>

                  <div className="mt-4 flex items-center gap-2">
                    <PillButton variant="ghost" onClick={() => router.push("/kurallar")}>
                      Kurallar
                    </PillButton>
                    <PillButton variant="ghost" onClick={() => router.push("/rehber")}>
                      Rehber
                    </PillButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-white/60">Paylaşırken kişisel veri yazma. Saygılı iletişim, güçlü topluluk.</div>
          <div className="flex items-center gap-2">
            <PillButton variant="ghost" onClick={goList}>
              Şikayetlere dön
            </PillButton>
            <PillButton variant="secondary" onClick={goWrite}>
              Şikayet Yaz
            </PillButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
