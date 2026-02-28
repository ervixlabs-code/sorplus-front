// app/page.tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import clsx from "clsx"
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  LogIn,
  Sparkles,
  Eye,
  MessageSquare,
  Users,
  BadgeCheck,
  Shield,
  TrendingUp,
  UserPlus,
} from "lucide-react"

import PublicTopbar from "@/components/PublicTopbar"


import Footer from "@/components/Footer"

/* ================== TYPES ================== */
type Category =
  | "E-Ticaret"
  | "Kargo & Lojistik"
  | "Bankacılık"
  | "GSM & İnternet"
  | "Sağlık"
  | "Eğitim"
  | "Kamu Hizmetleri"
  | "Dijital Platformlar"
  | "Diğer"

type TrendingComplaint = {
  id: string
  userName: string
  avatarLetter: string
  category: Category
  title: string
  views: number
  comments: number
  hasImage?: boolean
}

type TalkCard = {
  id: string
  userName: string
  avatarUrl?: string
  avatarLetter: string
  title: string
  brandHint?: string
  comments: number
  views: number
  tone: "violet" | "indigo" | "mint"
}

type ExperienceItem = {
  id: string
  category: Category
  title: string
  excerpt: string
  timeAgo: string
  severity: "Düşük" | "Orta" | "Yüksek"
  views: number
  comments: number
  hasBrandInText?: boolean
}

/* ================== CONSTANTS ================== */
const CATEGORIES: Category[] = [
  "E-Ticaret",
  "Kargo & Lojistik",
  "Bankacılık",
  "GSM & İnternet",
  "Sağlık",
  "Eğitim",
  "Kamu Hizmetleri",
  "Dijital Platformlar",
  "Diğer",
]

const HERO_SLIDES = [
  {
    eyebrow: "Toplumsal fayda • Şeffaflık • Güven",
    titleA: "Deneyimini paylaş,",
    titleB: "başkaları yalnız kalmasın",
    desc: "Problemleri kategori bazlı görünür kıl. Firma hedefleme yok — amaç linç değil, farkındalık.",
    ctaPrimary: "Şikayet Yaz",
    ctaSecondary: "Gündemi Gör",
    theme: "mint" as const,
  },
  {
    eyebrow: "Anonimlik ön planda",
    titleA: "Bir sorun yaşıyorsan,",
    titleB: "bunu saklama",
    desc: "Anonim paylaşım seçeneğiyle güvenli şekilde yaz. Özel bilgiler otomatik sansürlenir.",
    ctaPrimary: "Deneyimini Paylaş",
    ctaSecondary: "Kuralları Oku",
    theme: "indigo" as const,
  },
  {
    eyebrow: "Moderasyon & güvenlik",
    titleA: "Daha temiz bir alan:",
    titleB: "hakaret yok",
    desc: "Küfür/hakaret filtreleri ve moderasyon kuyruğu ile içerikler yayın öncesi kontrol edilir.",
    ctaPrimary: "Şikayet Yaz",
    ctaSecondary: "Nasıl Çalışır?",
    theme: "slate" as const,
  },
]

/* ================== HELPERS ================== */
function formatTR(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n)
  } catch {
    return String(n)
  }
}

function severityUI(s: ExperienceItem["severity"]) {
  if (s === "Yüksek") return { label: "YÜKSEK", cls: "border-orange-400/25 bg-orange-400/10 text-orange-100" }
  if (s === "Orta") return { label: "ORTA", cls: "border-indigo-400/25 bg-indigo-400/10 text-indigo-100" }
  return { label: "DÜŞÜK", cls: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" }
}

/* ================== UI ================== */
function HeroArt({ theme, onOpen }: { theme: "mint" | "indigo" | "slate"; onOpen?: () => void }) {
  const palette =
    theme === "mint"
      ? { a: "rgba(16,185,129,0.30)", b: "rgba(59,130,246,0.18)", c: "rgba(249,115,22,0.14)" }
      : theme === "indigo"
      ? { a: "rgba(99,102,241,0.26)", b: "rgba(16,185,129,0.16)", c: "rgba(236,72,153,0.10)" }
      : { a: "rgba(15,23,42,0.18)", b: "rgba(99,102,241,0.14)", c: "rgba(16,185,129,0.10)" }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative h-full w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white/60 text-left shadow-[0_18px_60px_-35px_rgba(2,6,23,0.55)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-slate-200/70"
      aria-label="Gündeme git"
    >
      <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(to_right,rgba(2,6,23,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(2,6,23,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="absolute -right-10 -top-10 h-[220px] w-[220px] rounded-[42px] bg-[rgba(99,102,241,0.10)]" />
      <div className="absolute right-10 top-12 h-[220px] w-[220px] rounded-full" style={{ background: palette.a }} />
      <div className="absolute right-28 bottom-12 h-[240px] w-[240px] rounded-[56px]" style={{ background: palette.b }} />
      <div className="absolute -right-24 bottom-[-60px] h-[340px] w-[340px] rounded-full" style={{ background: palette.c }} />

      <div className="absolute left-8 top-8 grid grid-cols-2 gap-4">
        <div className="flex h-[120px] w-[160px] items-center justify-center rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
          <div className="text-center">
            <div className="text-xs text-slate-500">Bugün paylaşılan</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{formatTR(128)}</div>
          </div>
        </div>
        <div className="flex h-[120px] w-[160px] items-center justify-center rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
          <div className="text-center">
            <div className="text-xs text-slate-500">Toplam paylaşım</div>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{formatTR(4202003)}</div>
          </div>
        </div>
      </div>

      <div className="absolute left-8 bottom-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 font-bold text-white">D</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">A</div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">M</div>
        <div className="ml-2 text-sm text-slate-700">
          <div className="font-semibold">Gündem akıyor</div>
          <div className="text-xs text-slate-500">Deneyimler görünür oluyor</div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/75 to-transparent" />
      <div className="absolute bottom-4 right-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm">
        Tıkla • Şikayetleri gör
      </div>
    </button>
  )
}

function PillButton({
  children,
  onClick,
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : "border border-white/15 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/20"
  return (
    <button type="button" onClick={onClick} className={clsx(base, styles)} disabled={disabled}>
      {children}
    </button>
  )
}

function IconButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
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

function CategoryDropdown({
  value,
  onChange,
}: {
  value: Category | "Tümü"
  onChange: (v: Category | "Tümü") => void
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
      <div className="mb-1 text-[11px] font-light text-white/60">Kategoriler</div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex h-[46px] min-w-[240px] items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={clsx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#12182B] shadow-xl">
          <div className="max-h-[280px] overflow-auto p-1">
            {(["Tümü", ...CATEGORIES] as Array<Category | "Tümü">).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={clsx(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  opt === value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()

  const goWrite = () => router.push("/sikayet-yaz")
  const goList = () => router.push("/sikayetler")
  const goDetail = (id: string) => router.push(`/sikayetler/${id}`)
  const goGuide = () => router.push("/rehber")
  const goRules = () => router.push("/kurallar")
  const goLogin = () => router.push(`/giris?next=${encodeURIComponent("/")}`)
  const goRegister = () => router.push(`/kayit?next=${encodeURIComponent("/")}`)

  const totalCount = 4202003
  const todayCount = 128

  const [category, setCategory] = useState<Category | "Tümü">("Tümü")
  const [query, setQuery] = useState("")

  // hero slider
  const [heroIndex, setHeroIndex] = useState(0)
  const heroTrackRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef({ isDown: false, startX: 0, deltaX: 0, pointerId: -1 })

  // trending data (gundem)
  const trending = useMemo<TrendingComplaint[]>(
    () => [
      {
        id: "t1",
        userName: "Sude",
        avatarLetter: "S",
        category: "Kargo & Lojistik",
        title: "Kargom 10 gündür dağıtıma çıkmadı, kimse net bilgi vermiyor",
        views: 22473,
        comments: 11,
        hasImage: true,
      },
      {
        id: "t2",
        userName: "Hakan",
        avatarLetter: "H",
        category: "Dijital Platformlar",
        title: "Yanıltıcı SMS ile dolandırıcılık: operatör destek vermiyor",
        views: 3593,
        comments: 2,
      },
      {
        id: "t3",
        userName: "Ali",
        avatarLetter: "A",
        category: "Sağlık",
        title: "Randevu sistemi sürekli hata veriyor, işlem tamamlanmıyor",
        views: 3212,
        comments: 4,
        hasImage: true,
      },
      {
        id: "t4",
        userName: "Göktuğ",
        avatarLetter: "G",
        category: "E-Ticaret",
        title: "İade talebim reddedildi, müşteri hizmetleri çözüm üretmiyor",
        views: 2447,
        comments: 5,
      },
      {
        id: "t5",
        userName: "Okur",
        avatarLetter: "O",
        category: "Kamu Hizmetleri",
        title: "Eksik zam ve geciken ödeme mağduriyeti: muhatap yok",
        views: 51378,
        comments: 18,
      },
      {
        id: "t6",
        userName: "Aytaç",
        avatarLetter: "A",
        category: "Bankacılık",
        title: "Onayım olmadan işlem yapılmış, itiraz süreci belirsiz",
        views: 5877,
        comments: 7,
      },
      {
        id: "t7",
        userName: "Ece",
        avatarLetter: "E",
        category: "Eğitim",
        title: "Kurs iptali sonrası ücret iadesi aylardır yapılmıyor",
        views: 8121,
        comments: 6,
        hasImage: true,
      },
      {
        id: "t8",
        userName: "Mert",
        avatarLetter: "M",
        category: "GSM & İnternet",
        title: "Taahhüt dışı ücret yansıtıldı, müşteri hizmetleri oyalıyor",
        views: 10890,
        comments: 9,
      },
    ],
    []
  )

  // “Çok Konuşulanlar” datası
  const talked = useMemo<TalkCard[]>(
    () => [
      {
        id: "c1",
        userName: "Aleyna",
        avatarLetter: "A",
        title: "İzin almadan sipariş iptali, fiyat artışı ve iade sorunu",
        brandHint: "Bir e-ticaret markası (metinde geçti)",
        comments: 12,
        views: 1009,
        tone: "violet",
      },
      {
        id: "c2",
        userName: "Mehmet",
        avatarLetter: "M",
        title: "Şebeke kesiliyor, bağlantı problemi ve uyumsuzluk şikayeti",
        brandHint: "Bir operatör (metinde geçti)",
        comments: 11,
        views: 271,
        tone: "indigo",
      },
      {
        id: "c3",
        userName: "Sena",
        avatarLetter: "S",
        title: "Kargo şubesinde teslimat gecikmesi: sürekli yönlendirme yapılıyor",
        brandHint: "Bir kargo firması (metinde geçti)",
        comments: 8,
        views: 642,
        tone: "mint",
      },
    ],
    []
  )

  // bottom “experience feed” demo
  const experiences = useMemo<ExperienceItem[]>(
    () => [
      {
        id: "e1",
        category: "E-Ticaret",
        title: "İade talebi onaylandı deniyor ama 12 gündür para yatmadı",
        excerpt:
          "Kargo teslim edildi, sistemde iade tamamlandı görünüyor fakat ödeme tarafında sürekli “beklemede” kalıyor. Destek tarafı otomatik cevap dönüyor.",
        timeAgo: "14 dk önce",
        severity: "Yüksek",
        views: 4821,
        comments: 23,
        hasBrandInText: true,
      },
      {
        id: "e2",
        category: "GSM & İnternet",
        title: "Taahhüt yenileme sonrası paket içeriğim düşürüldü",
        excerpt:
          "Aynı fiyata yeniledim ama hız ve kota farklı görünüyor. Görüşmeler kayıt altındaymış; buna rağmen net dönüş alamadım.",
        timeAgo: "1 saat önce",
        severity: "Orta",
        views: 1970,
        comments: 9,
        hasBrandInText: false,
      },
      {
        id: "e3",
        category: "Kargo & Lojistik",
        title: "Şubede ‘teslim edildi’ denmiş ama paket ortada yok",
        excerpt:
          "Dağıtıma çıktıktan sonra sistem teslim edildi gösteriyor. Kamera kayıtları, imza vb. hiçbir kanıt sunulmadı. Süreç uzadıkça uzuyor.",
        timeAgo: "3 saat önce",
        severity: "Yüksek",
        views: 8055,
        comments: 31,
        hasBrandInText: true,
      },
      {
        id: "e4",
        category: "Sağlık",
        title: "Randevu sistemi hata verdi, muayene günü boşa gitti",
        excerpt:
          "Onay mesajı geldi, hastaneye gidince ‘kayda düşmemiş’ dediler. Aynı durum birkaç kişide daha yaşanmış.",
        timeAgo: "Dün",
        severity: "Orta",
        views: 1298,
        comments: 6,
        hasBrandInText: false,
      },
      {
        id: "e5",
        category: "Bankacılık",
        title: "Kartım bloke oldu, itiraz süreci net anlatılmıyor",
        excerpt:
          "Güvenlik sebebiyle bloke dediler ama nedenini söylemiyorlar. Şube ve çağrı merkezi farklı şeyler söylüyor. Süreç şeffaf değil.",
        timeAgo: "2 gün önce",
        severity: "Düşük",
        views: 734,
        comments: 3,
        hasBrandInText: false,
      },
    ],
    []
  )

  const goHero = (next: number) => {
    const idx = (next + HERO_SLIDES.length) % HERO_SLIDES.length
    setHeroIndex(idx)
  }
  const heroSlide = HERO_SLIDES[heroIndex]

  // HERO swipe
  const onHeroPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    dragRef.current.isDown = true
    dragRef.current.startX = e.clientX
    dragRef.current.deltaX = 0
    dragRef.current.pointerId = e.pointerId
    heroTrackRef.current?.setPointerCapture?.(e.pointerId)
  }

  const onHeroPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDown) return
    if (dragRef.current.pointerId !== e.pointerId) return
    dragRef.current.deltaX = e.clientX - dragRef.current.startX

    const el = heroTrackRef.current
    if (!el) return
    const dx = dragRef.current.deltaX
    el.style.transition = "none"
    el.style.transform = `translateX(calc(${-heroIndex * 100}% + ${dx}px))`
  }

  const onHeroPointerUpOrCancel = (e: React.PointerEvent) => {
    if (!dragRef.current.isDown) return
    if (dragRef.current.pointerId !== e.pointerId) return

    const dx = dragRef.current.deltaX
    dragRef.current.isDown = false
    dragRef.current.pointerId = -1

    const el = heroTrackRef.current
    if (el) {
      el.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)"
      el.style.transform = `translateX(${-heroIndex * 100}%)`
    }

    const threshold = 70
    if (dx > threshold) goHero(heroIndex - 1)
    else if (dx < -threshold) goHero(heroIndex + 1)
  }

  useEffect(() => {
    const el = heroTrackRef.current
    if (!el) return
    el.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)"
    el.style.transform = `translateX(${-heroIndex * 100}%)`
  }, [heroIndex])

  // ⌘K / Ctrl+K → /sikayet-yaz
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        router.push("/sikayet-yaz")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router])

  // ===========================
  // ✅ GÜNDEM MARQUEE: 2 LANE ONLY
  // ===========================
  const laneA = trending.filter((_, i) => i % 2 === 0)
  const laneB = trending.filter((_, i) => i % 2 === 1)

  const laneA2 = [...laneA, ...laneA]
  const laneB2 = [...laneB, ...laneB]

  // ✅ sadece 2 hız: ön hızlı, arka yavaş
  const laneFast = Math.max(18, laneA.length * 6) // foreground
  const laneSlow = Math.max(28, laneB.length * 8) // background

  const searchToList = () => {
    const q = query.trim()
    const c = category !== "Tümü" ? category : ""
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (c) params.set("cat", c)
    router.push(`/sikayetler${params.toString() ? `?${params.toString()}` : ""}`)
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      {/* GLOBAL KEYFRAMES */}
      <style jsx global>{`
  @keyframes marquee {
    0% { transform: translate3d(0,0,0); }
    100% { transform: translate3d(-50%,0,0); }
  }
  @keyframes floaty {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* ✅ MARQUEE CLASSES (garanti çalışır) */
  .marq {
    animation-name: marquee;
    animation-duration: var(--dur, 24s);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-play-state: running;
    transform: translate3d(0,0,0);
    will-change: transform;
  }
  .marq:hover { animation-play-state: paused; } /* hover’da durmasını istersen kalsın */
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

<PublicTopbar
  subtitle="Şikayetler"
  showSearchStub={false} // istersen true (detay sayfasında input stub)
  nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
/>



      {/* TOP INFO BAND */}
      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Toplam paylaşım{" "}
            <span className="ml-2 text-lg font-extrabold text-emerald-300">{formatTR(totalCount)}</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Bugün: <span className="font-semibold text-white">{formatTR(todayCount)}</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 sm:px-6 lg:px-10 2xl:px-14">
        {/* HERO SLIDER */}
        <section className="pt-8 md:pt-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {heroSlide.eyebrow}
              </div>

              <h1 className="mt-5 text-[40px] font-extrabold leading-[1.05] tracking-tight text-white md:text-[54px]">
                {heroSlide.titleA}
                <span className="block">{heroSlide.titleB}</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">{heroSlide.desc}</p>

              <div className="mt-6">
                <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 px-4 text-white/70">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Kategori, konu, problem ara…"
                    className="h-[52px] w-full bg-transparent pr-3 text-sm text-white placeholder:text-white/45 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") searchToList()
                    }}
                  />
                  <button
                    type="button"
                    className="m-1.5 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-200/70"
                    onClick={searchToList}
                  >
                    Ara
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PillButton variant="primary" onClick={goWrite}>
                  <Plus className="h-4 w-4" />
                  {heroSlide.ctaPrimary}
                </PillButton>

                <PillButton
                  variant="ghost"
                  onClick={() => {
                    if (heroSlide.ctaSecondary === "Gündemi Gör") {
                      document.getElementById("gundem")?.scrollIntoView({ behavior: "smooth" })
                      return
                    }
                    if (heroSlide.ctaSecondary === "Kuralları Oku") return goRules()
                    if (heroSlide.ctaSecondary === "Nasıl Çalışır?") return goGuide()
                    return goList()
                  }}
                >
                  {heroSlide.ctaSecondary}
                </PillButton>
              </div>

              <div className="mt-7 flex items-center gap-3">
                <IconButton onClick={() => goHero(heroIndex - 1)}>
                  <ChevronLeft className="h-4 w-4 text-white/80" />
                </IconButton>

                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goHero(i)}
                      className={clsx(
                        "h-2.5 w-2.5 rounded-full transition",
                        i === heroIndex ? "bg-white" : "bg-white/30 hover:bg-white/50"
                      )}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>

                <IconButton onClick={() => goHero(heroIndex + 1)}>
                  <ChevronRight className="h-4 w-4 text-white/80" />
                </IconButton>
              </div>
            </div>

            <div className="md:col-span-7">
              <div
                className="relative h-[380px] overflow-hidden md:h-[460px]"
                onPointerDown={onHeroPointerDown}
                onPointerMove={onHeroPointerMove}
                onPointerUp={onHeroPointerUpOrCancel}
                onPointerCancel={onHeroPointerUpOrCancel}
              >
                <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing" />

                <div
                  ref={heroTrackRef}
                  className="flex h-full w-full"
                  style={{
                    transform: `translateX(${-heroIndex * 100}%)`,
                    transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {HERO_SLIDES.map((s, i) => (
                    <div key={i} className="h-full w-full shrink-0 px-0">
                      <HeroArt theme={s.theme} onOpen={goList} />
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0B1020] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0B1020] to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* GÜNDEMDEKİ ŞİKAYETLER — FULL BLEED */}
        <section id="gundem" className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-14 w-screen py-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B1020] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1020] to-transparent" />

          <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 2xl:px-14">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[30px] font-semibold tracking-tight text-white">Gündemdeki Şikayetler</h2>
                <p className="mt-1 text-sm text-white/65">
                  Toplulukta en çok konuşulan başlıklar — akış halinde görünür.
                </p>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="hidden items-center gap-2 text-xs text-white/60 md:flex">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Akış
                </div>
                <button
                  type="button"
                  onClick={goList}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur hover:bg-white/15"
                >
                  Tüm şikayetler
                </button>
              </div>
            </div>
          </div>

          {/* ✅ MARQUEE: 2 LINE */}
          <div className="mt-8 space-y-6">
            {/* LAYER 1 (FAST / foreground) */}
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0B1020] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0B1020] to-transparent" />

              <div
  className="marq flex w-[200%] gap-5"
  style={{ ["--dur" as any]: `${laneFast}s`, opacity: 0.95 }}
>

                {laneA2.map((item, idx) => (
                  <TrendingCardMarquee key={`p1-${item.id}-${idx}`} item={item} onOpen={() => goDetail(item.id)} />
                ))}
              </div>
            </div>

            {/* LAYER 2 (SLOW / background) */}
            <div className="relative overflow-hidden">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#0B1020] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#0B1020] to-transparent" />

              <div
  className="marq flex w-[200%] gap-5"
  style={{
    ["--dur" as any]: `${laneSlow}s`,
    opacity: 0.65,
    transform: "translateZ(0) scale(0.98)",
    filter: "saturate(0.95)",
  }}
>

                {laneB2.map((item, idx) => (
                  <TrendingCardMarquee
                    key={`p2-${item.id}-${idx}`}
                    item={item}
                    onOpen={() => goDetail(item.id)}
                    tone="soft"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 2xl:px-14">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                  <TrendingUp className="h-4 w-4 text-indigo-300" />
                  Güncel nabız
                </div>
                <h3 className="mt-4 text-[34px] font-semibold tracking-tight text-white">Çok konuşulanlar</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  En hızlı etkileşim alan başlıklar. Kategori bazlı — güvenli paylaşım.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
                    <Shield className="h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-sm font-semibold text-white">Moderasyon</div>
                      <div className="text-xs text-white/65">Spam / hakaret filtreleri</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur">
                    <BadgeCheck className="h-5 w-5 text-indigo-300" />
                    <div>
                      <div className="text-sm font-semibold text-white">Kategori bazlı</div>
                      <div className="text-xs text-white/65">Firma sayfası yok</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={goList}
                    className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-sm hover:bg-white/90"
                  >
                    Şikayetleri gör
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8">
                <TalkedRail items={talked} onWrite={goWrite} onOpen={(id) => goDetail(id)} />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SAYILARLA DENEYİM */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-[#0B1020] py-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.20),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(249,115,22,0.16),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 2xl:px-14">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sayılarla Deneyim
              </div>
              <h3 className="mt-4 text-[38px] font-semibold tracking-tight">Güvenin ölçülebilir hali</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                Topluluğun nabzını metriklerle takip et. Detaylar şikayet listesinde.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <PillButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Yukarı Çık
              </PillButton>
              <PillButton variant="secondary" onClick={goWrite}>
                Şikayet Yaz
              </PillButton>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              onOpen={goList}
              icon={<Users className="h-5 w-5" />}
              label="Bireysel Üye Sayısı"
              value={formatTR(14091568)}
              accent="violet"
            />
            <StatTile
              onOpen={goList}
              icon={<Shield className="h-5 w-5" />}
              label="Kayıtlı Kategori"
              value={formatTR(256)}
              accent="mint"
              suffix=" +"
            />
            <StatTile
              onOpen={goList}
              icon={<BadgeCheck className="h-5 w-5" />}
              label="Çözülen Şikayet"
              value={formatTR(4190157)}
              accent="indigo"
            />
            <StatTile
              onOpen={goList}
              icon={<Eye className="h-5 w-5" />}
              label="Son 30 Günde Ziyaretçi"
              value={formatTR(21829975)}
              accent="orange"
            />
          </div>

          {/* FEED */}
          <div className="mt-12">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-indigo-300" />
                  Son Eklenen Deneyimler
                </div>
                <h4 className="mt-3 text-[28px] font-semibold tracking-tight">
                  Canlı akış hissi veren{" "}
                  <span className="bg-[linear-gradient(90deg,rgba(99,102,241,1),rgba(16,185,129,1),rgba(249,115,22,1))] bg-clip-text text-transparent">
                    premium feed
                  </span>
                </h4>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Detayları görmek için karta tıkla — doğrudan şikayet detayına gidersin.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/10 backdrop-blur">
                  <div className="px-4 text-white/70">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    placeholder="Bu bölümde ara…"
                    className="h-[44px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none sm:w-[280px]"
                    disabled
                    value=""
                  />
                </div>

                <button
                  type="button"
                  onClick={goList}
                  className="inline-flex h-[44px] items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black shadow-sm hover:bg-white/90"
                >
                  Hepsini Gör
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <FeaturedExperienceCard item={experiences[0]} onOpen={() => goDetail(experiences[0].id)} />
              </div>

              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-3 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                  <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_90%_25%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_50%_110%,rgba(249,115,22,0.12),transparent_50%)]" />
                  <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

                  <div className="relative flex items-center justify-between px-4 py-3">
                    <div className="text-sm font-semibold text-white/90">Akış</div>
                    <div className="text-xs text-white/60">güncel</div>
                  </div>

                  <div className="relative space-y-3 p-2">
                    {experiences.slice(1).map((it) => (
                      <ExperienceRow key={it.id} item={it} onOpen={() => goDetail(it.id)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center">
              <div className="text-xs text-white/65">⌘K → Şikayet yaz • Oklar → Hero slider</div>
              <div className="text-xs text-white/65">Güvenli paylaşım: kişisel veri ekleme, hakaret yok.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ================== TRENDING CARD (MARQUEE) ================== */
function TrendingCardMarquee({
  item,
  onOpen,
  tone = "bold",
}: {
  item: TrendingComplaint
  onOpen: () => void
  tone?: "bold" | "soft"
}) {
  const cardBase =
    "group text-left shrink-0 select-none rounded-[26px] border border-white/10 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.55)] transition"
  const cardBg =
    tone === "bold"
      ? "bg-white hover:-translate-y-0.5 hover:bg-white/95"
      : "bg-white/90 backdrop-blur hover:-translate-y-0.5 hover:bg-white"

  return (
    <button onClick={onOpen} className={clsx(cardBase, cardBg)} style={{ width: 360 }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-extrabold text-white">
              {item.avatarLetter}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{item.userName}</div>
              <div className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[12px] font-semibold text-indigo-700">
                {item.category}
              </div>
            </div>
          </div>

          {item.hasImage ? (
            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <div className="h-full w-full bg-[linear-gradient(135deg,rgba(99,102,241,0.20),rgba(16,185,129,0.18),rgba(249,115,22,0.12))]" />
            </div>
          ) : (
            <div className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-50" />
          )}
        </div>

        <div className="mt-4 line-clamp-3 text-[17px] font-extrabold leading-snug tracking-tight text-slate-950">
          {item.title}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 text-[13px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {formatTR(item.views)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)} yorum
          </span>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-800 shadow-sm">
            İncele
          </span>
        </div>
      </div>

      <div className="h-2 w-full rounded-b-[26px] bg-[linear-gradient(90deg,rgba(99,102,241,0.60),rgba(16,185,129,0.55),rgba(249,115,22,0.40))]" />
    </button>
  )
}

/* ================== ÇOK KONUŞULANLAR (Rail) ================== */
function TalkedRail({
  items,
  onWrite,
  onOpen,
}: {
  items: TalkCard[]
  onWrite: () => void
  onOpen: (id: string) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.65)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(249,115,22,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-white/90">Öne çıkan kartlar</div>
          <div className="text-xs text-white/60">güncel</div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.slice(0, 2).map((it) => (
            <BigTalkCard key={it.id} item={it} onOpen={() => onOpen(it.id)} />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.slice(2, 3).map((it) => (
            <SmallTalkCard key={it.id} item={it} onOpen={() => onOpen(it.id)} />
          ))}

          <div className="md:col-span-2">
            <div className="h-full rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Hızlı ipuçları</div>
                  <div className="mt-1 text-xs text-white/60">İçerik kalitesi için mini rehber</div>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-white/10" />
              </div>

              <ul className="mt-4 space-y-3 text-sm text-white/75">
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

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpen("rehber")}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/15"
                >
                  Rehber
                </button>
                <button
                  type="button"
                  onClick={onWrite}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                >
                  Şikayet Yaz
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>
    </div>
  )
}

function BigTalkCard({ item, onOpen }: { item: TalkCard; onOpen: () => void }) {
  const tone =
    item.tone === "violet"
      ? "from-violet-600 to-indigo-600"
      : item.tone === "mint"
      ? "from-emerald-500 to-teal-500"
      : "from-indigo-600 to-sky-600"

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-white/95 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_-45px_rgba(0,0,0,0.55)]"
    >
      <div className={clsx("pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-br", tone)} />
      <div className="pointer-events-none absolute -right-14 -bottom-14 h-44 w-44 rounded-full bg-black/5" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 font-extrabold text-white">
            {item.avatarLetter}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{item.userName}</div>
            <div className="mt-1 text-xs text-slate-500">{item.brandHint}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)} yorum
          </span>
        </div>
      </div>

      <div className="relative mt-5 line-clamp-3 text-[22px] font-semibold leading-snug tracking-tight text-slate-900">
        {item.title}
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Eye className="h-4 w-4" /> {formatTR(item.views)}
        </span>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
          İncele
        </span>
      </div>
    </button>
  )
}

function SmallTalkCard({ item, onOpen }: { item: TalkCard; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group h-full rounded-[28px] border border-white/10 bg-white/90 p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 font-extrabold text-white">
            {item.avatarLetter}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{item.userName}</div>
            <div className="mt-1 text-xs text-slate-500">{item.brandHint}</div>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(99,102,241,0.16),rgba(16,185,129,0.14),rgba(249,115,22,0.10))]" />
      </div>

      <div className="mt-4 line-clamp-3 text-base font-semibold leading-snug text-slate-900">{item.title}</div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)} yorum
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" /> {formatTR(item.views)}
        </span>
      </div>
    </button>
  )
}

/* ================== STATS TILE ================== */
function StatTile({
  icon,
  label,
  value,
  suffix,
  accent,
  onOpen,
}: {
  icon: React.ReactNode
  label: string
  value: string
  suffix?: string
  accent: "violet" | "indigo" | "mint" | "orange"
  onOpen?: () => void
}) {
  const accentClass =
    accent === "violet"
      ? "from-violet-500/25 to-indigo-500/10"
      : accent === "indigo"
      ? "from-indigo-500/25 to-sky-500/10"
      : accent === "mint"
      ? "from-emerald-500/25 to-teal-500/10"
      : "from-orange-500/25 to-amber-500/10"

  const ring =
    accent === "violet"
      ? "ring-violet-400/20"
      : accent === "indigo"
      ? "ring-indigo-400/20"
      : accent === "mint"
      ? "ring-emerald-400/20"
      : "ring-orange-400/20"

  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(
        "relative overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-5 text-left shadow-sm ring-1 transition hover:-translate-y-0.5 hover:bg-white/7 focus:outline-none focus:ring-4 focus:ring-white/15",
        ring
      )}
      aria-label={`${label} detayına git`}
    >
      <div className={clsx("pointer-events-none absolute inset-0 bg-gradient-to-br", accentClass)} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-black/20 blur-xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white"
          style={{ animation: "floaty 6s ease-in-out infinite" }}
        >
          {icon}
        </div>
        <div className="text-right text-xs text-white/60">LIVE</div>
      </div>

      <div className="relative mt-5 text-xs text-white/70">{label}</div>
      <div className="relative mt-1 text-[26px] font-extrabold tracking-tight">
        {value}
        {suffix ? <span className="text-white/80">{suffix}</span> : null}
      </div>

      <div className="relative mt-3 text-xs font-semibold text-white/70">Tıkla • şikayetleri gör</div>
    </button>
  )
}

/* ================== EXPERIENCE FEED ================== */
function FeaturedExperienceCard({ item, onOpen }: { item: ExperienceItem; onOpen: () => void }) {
  const sev = severityUI(item.severity)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative h-full w-full overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 text-left shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/7"
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.30),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.22),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <span className="text-sm font-extrabold text-white/90">{item.category.slice(0, 1)}</span>
          </div>
          <div>
            <div className="text-xs text-white/60">{item.timeAgo}</div>
            <div className="mt-1 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
              {item.category}
            </div>
          </div>
        </div>

        <div className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", sev.cls)}>
          {sev.label}
        </div>
      </div>

      <div className="relative mt-5 text-[22px] font-semibold leading-snug tracking-tight text-white">{item.title}</div>
      <div className="relative mt-3 line-clamp-4 text-sm leading-relaxed text-white/70">{item.excerpt}</div>

      <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs text-white/65">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> {formatTR(item.views)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)}
          </span>
          {item.hasBrandInText ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
              ★ metinde marka
            </span>
          ) : null}
        </div>

        <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm">
          İncele
        </span>
      </div>
    </button>
  )
}

function ExperienceRow({ item, onOpen }: { item: ExperienceItem; onOpen: () => void }) {
  const sev = severityUI(item.severity)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-[22px] border border-white/10 bg-black/20 p-4 text-left transition hover:bg-black/30"
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
              {item.category}
            </span>
            <span className="text-[11px] text-white/55">{item.timeAgo}</span>
            {item.hasBrandInText ? (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                ★ metinde marka
              </span>
            ) : null}
          </div>

          <div className="mt-2 line-clamp-1 text-[15px] font-semibold text-white/90">{item.title}</div>
          <div className="mt-1 line-clamp-2 text-sm text-white/65">{item.excerpt}</div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {formatTR(item.views)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" /> {formatTR(item.comments)}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", sev.cls)}>
            {sev.label}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition group-hover:bg-white/15">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  )
}
