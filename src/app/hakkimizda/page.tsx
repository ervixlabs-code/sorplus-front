"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  ArrowLeft,
  Shield,
  BadgeCheck,
  Users,
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  Mail,
  ChevronRight,
  BookOpen,
  Scale,
  Lock,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

import PublicTopbar from "@/components/PublicTopbar"
import Footer from "@/components/Footer"

/* ================== API ================== */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "")
function apiUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path
}

type AboutUsRow = {
  id: string
  title: string
  content: any
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

function formatDateTR(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(d)
}

/* ================== UI COMPONENTS ================== */
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

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function GlassCard({
  title,
  desc,
  icon,
}: {
  title: string
  desc: string
  icon: React.ReactNode
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_50%_110%,rgba(249,115,22,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative flex items-start gap-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-white/70">{desc}</div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const router = useRouter()
  const goWrite = () => router.push("/sikayet-yaz")
  const goList = () => router.push("/sikayetler")

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>("")
  const [doc, setDoc] = useState<AboutUsRow | null>(null)

  async function load() {
    setLoading(true)
    setErr("")
    try {
      const res = await fetch(apiUrl("/api/about-us/active"), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!res.ok) {
        let msg = `Yüklenemedi (HTTP ${res.status})`
        try {
          const j = await res.json()
          if (j?.message) msg = Array.isArray(j.message) ? j.message.join(", ") : String(j.message)
        } catch {
          // ignore
        }
        throw new Error(msg)
      }

      const data = (await res.json()) as AboutUsRow
      setDoc(data)
    } catch (e: any) {
      setErr(e?.message || "Bir hata oluştu")
      setDoc(null)
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ================== CONTENT MAPPING (flexible) ================== */
  const content = useMemo(() => (doc?.content ? doc.content : null), [doc])

  // Hero / Mission text
  const heroPill = (content?.heroPill as string) || "Misyonumuz"
  const heroTitle =
    (content?.heroTitle as string) ||
    (content?.headline as string) ||
    "Deneyimleri görünür kıl,"
  const heroTitle2 =
    (content?.heroTitle2 as string) ||
    (content?.headline2 as string) ||
    "insanlar yalnız kalmasın"
  const heroDesc =
    (content?.heroDesc as string) ||
    (content?.description as string) ||
    "Deneyim; kategori bazlı şikayet/deneyim paylaşımlarını daha şeffaf, daha güvenli ve daha çözüm odaklı bir çerçevede bir araya getirmeyi hedefler. Firma hedefleme yok — amaç linç değil, farkındalık ve ortak akıl."

  // Right sidebar cards
  const rightCards: Array<{ title: string; desc: string; icon?: string }> = Array.isArray(content?.rightCards)
    ? content.rightCards
    : [
        {
          title: "Güvenli alan",
          desc: "Küfür/hakaret filtreleri, moderasyon kuyruğu ve raporlama mekanizmasıyla içerikler daha temiz kalır.",
          icon: "shield",
        },
        {
          title: "Kategori bazlı yapı",
          desc: "Firma sayfaları yok. İçerik; konu/kategori üzerinden keşfedilir, böylece hedef gösterme azalır.",
          icon: "badge",
        },
        {
          title: "Topluluk gücü",
          desc: "Benzer deneyimler görünür oldukça kullanıcılar yalnız hissetmez; çözüm önerileri öne çıkar.",
          icon: "heart",
        },
      ]

  // Values section
  const valuesTitle = (content?.valuesTitle as string) || "İlkelerimiz net"
  const valuesDesc =
    (content?.valuesDesc as string) || "Platformu büyütürken en önce güveni ve kullanıcı faydasını koruyoruz."

  const valuesCards: Array<{ title: string; desc: string; icon?: string }> = Array.isArray(content?.valuesCards)
    ? content.valuesCards
    : [
        { title: "Gizlilik", desc: "Kişisel veriler paylaşılmaz. İhlal içeren içerikler kaldırılabilir.", icon: "lock" },
        { title: "Adalet", desc: "İçerik değerlendirmesi, kurallara uygunluk üzerinden yapılır.", icon: "scale" },
        { title: "Çözüm odak", desc: "Hedef: kavga değil, süreç/sonuç paylaşımı ve faydalı öneri.", icon: "chat" },
        {
          title: "Şeffaflık",
          desc: "İleride şeffaflık raporları ve moderasyon metrikleri yayınlanır (MVP sonrası).",
          icon: "trend",
        },
      ]

  const contactTitle = (content?.contactTitle as string) || "İletişim"
  const contactDesc = (content?.contactDesc as string) || "Öneri, geri bildirim veya iş birliği için bize yaz."

  const bottomNote =
    (content?.bottomNote as string) || "Not: Bu sayfa MVP tasarımıdır. İçerik ve metrikler API bağlanınca dinamikleşir."

  const updatedText = useMemo(() => formatDateTR(doc?.updatedAt), [doc?.updatedAt])

  function iconByKey(key?: string) {
    switch ((key || "").toLowerCase()) {
      case "shield":
        return <Shield className="h-5 w-5" />
      case "badge":
        return <BadgeCheck className="h-5 w-5" />
      case "heart":
        return <Heart className="h-5 w-5" />
      case "lock":
        return <Lock className="h-5 w-5" />
      case "scale":
        return <Scale className="h-5 w-5" />
      case "chat":
        return <MessageSquare className="h-5 w-5" />
      case "trend":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <SparkIcon />
    }
  }

  function SparkIcon() {
    return <div className="text-white"><span className="inline-block">✨</span></div>
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      {/* GLOBAL KEYFRAMES */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-2.5 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Hakkımızda • <span className="ml-2 text-white/70">Deneyim platformu</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            ⌘K / Ctrl+K → <span className="font-semibold text-white">Şikayet Yaz</span>
          </div>
        </div>
      </div>

      <PublicTopbar subtitle="Şikayetler" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-8 lg:px-10 2xl:px-14">
        {/* BACK */}
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
            <MetaPill icon={<Users className="h-4 w-4" />} label="Topluluk odaklı" />
            <MetaPill icon={<Shield className="h-4 w-4" />} label="Gizlilik & güvenlik" />
            <MetaPill icon={<BadgeCheck className="h-4 w-4" />} label="Kategori bazlı" />
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-white/15"
            >
              <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
              Yenile
            </button>
          </div>
        </div>

        {/* LOAD/ERR BANNER */}
        {loading ? (
          <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              İçerik yükleniyor…
            </div>
          </div>
        ) : err ? (
          <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-200" />
              <div className="min-w-0">
                <div className="font-semibold text-white/85">Hakkımızda yüklenemedi</div>
                <div className="mt-1 break-words">{err}</div>
              </div>
            </div>
          </div>
        ) : null}

        {/* HERO */}
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.26),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {heroPill}
                </div>

                <h1 className="mt-5 text-[34px] font-extrabold leading-[1.08] tracking-tight text-white md:text-[44px]">
                  {heroTitle}
                  <span className="block text-white/85">{heroTitle2}</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">{heroDesc}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PillButton variant="secondary" onClick={goList}>
                    <TrendingUp className="h-4 w-4" />
                    Şikayetlere Git
                  </PillButton>
                  <PillButton variant="ghost" onClick={goWrite}>
                    <MessageSquare className="h-4 w-4" />
                    Şikayet Yaz
                  </PillButton>
                  <PillButton variant="white" onClick={() => router.push("/kurallar")}>
                    <BookOpen className="h-4 w-4" />
                    Kuralları Oku
                  </PillButton>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-white/60">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                    <Eye className="h-4 w-4" /> Şeffaf metrikler (MVP sonrası)
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                    <Lock className="h-4 w-4" /> Kişisel veri koruması
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
                    <Scale className="h-4 w-4" /> Adil moderasyon
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-5">
            <div className="space-y-5">
              {rightCards.slice(0, 3).map((c, idx) => (
                <GlassCard key={`${c.title}-${idx}`} icon={iconByKey(c.icon)} title={c.title} desc={c.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white/85">Değerlerimiz</div>
              <div className="mt-1 text-[26px] font-extrabold tracking-tight text-white">{valuesTitle}</div>
              <div className="mt-2 max-w-2xl text-sm text-white/70">{valuesDesc}</div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/kurallar")}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur hover:bg-white/15 md:inline-flex"
            >
              Kurallara git <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {valuesCards.slice(0, 4).map((c, idx) => (
              <GlassCard key={`${c.title}-${idx}`} icon={iconByKey(c.icon)} title={c.title} desc={c.desc} />
            ))}
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
            <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.26),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="text-sm font-semibold text-white/90">{contactTitle}</div>
                <div className="mt-1 text-sm text-white/70">{contactDesc}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PillButton variant="secondary" onClick={() => router.push("/iletisim")}>
                  <Mail className="h-4 w-4" />
                  İletişim Sayfası
                </PillButton>
                <PillButton variant="ghost" onClick={goWrite}>
                  Şikayet Yaz
                </PillButton>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM NAV */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-white/60">
            {bottomNote}{" "}
            <span className="ml-2 text-white/40">
              (Son güncelleme: <span className="text-white/70 font-semibold">{updatedText}</span>)
            </span>
          </div>
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