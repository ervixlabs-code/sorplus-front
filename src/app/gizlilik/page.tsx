"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  Sparkles,
  Search,
  ChevronDown,
  Shield,
  Lock,
  EyeOff,
  FileText,
  Cookie,
  Database,
  Share2,
  Trash2,
  UserCheck,
  Mail,
  ArrowRight,
  HelpCircle,
  Info,
  BadgeCheck,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== TYPES ================== */
type SectionCategory =
  | "Genel"
  | "Toplanan Veriler"
  | "Kullanım Amaçları"
  | "Çerezler"
  | "Paylaşım & Aktarım"
  | "Saklama Süreleri"
  | "Hakların"
  | "Güvenlik"
  | "İletişim"

const DEFAULT_CATEGORIES: SectionCategory[] = [
  "Genel",
  "Toplanan Veriler",
  "Kullanım Amaçları",
  "Çerezler",
  "Paylaşım & Aktarım",
  "Saklama Süreleri",
  "Hakların",
  "Güvenlik",
  "İletişim",
]

type PolicySection = {
  id: string
  category: string
  title: string
  desc: string
  bullets?: string[]
  icon: React.ReactNode
  level: "Zorunlu" | "Bilgi" | "Not"
}

/** Backend row (SecuritySection) */
type SecuritySectionRow = {
  id: string
  category: string
  title: string
  desc: string
  bullets?: string[]
  level?: "ZORUNLU" | "BILGI" | "NOT" | string
  sortOrder?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

/* ================== HELPERS ================== */
function cx(...a: Array<string | false | undefined | null>) {
  return clsx(a)
}

function levelBadge(level: PolicySection["level"]) {
  if (level === "Zorunlu") return "border-orange-400/25 bg-orange-400/10 text-orange-100"
  if (level === "Not") return "border-indigo-400/25 bg-indigo-400/10 text-indigo-100"
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
}

function mapLevel(x: SecuritySectionRow["level"]): PolicySection["level"] {
  const v = String(x || "").toUpperCase()
  if (v === "ZORUNLU") return "Zorunlu"
  if (v === "NOT") return "Not"
  return "Bilgi"
}

function iconForCategory(cat: string) {
  const c = (cat || "").toLowerCase()
  if (c.includes("genel")) return <Sparkles className="h-4 w-4" />
  if (c.includes("çerez") || c.includes("cerez")) return <Cookie className="h-4 w-4" />
  if (c.includes("toplanan") || c.includes("veri")) return <Database className="h-4 w-4" />
  if (c.includes("amaç")) return <FileText className="h-4 w-4" />
  if (c.includes("paylaş") || c.includes("aktar")) return <Share2 className="h-4 w-4" />
  if (c.includes("saklama")) return <Trash2 className="h-4 w-4" />
  if (c.includes("hak")) return <UserCheck className="h-4 w-4" />
  if (c.includes("güven") || c.includes("guven")) return <Shield className="h-4 w-4" />
  if (c.includes("iletişim") || c.includes("iletisim")) return <Mail className="h-4 w-4" />
  return <Info className="h-4 w-4" />
}

function formatDateTR(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(d)
}

/* ================== SMALL UI ================== */
function PillLink({
  children,
  href,
  variant = "ghost",
}: {
  children: React.ReactNode
  href: string
  variant?: "primary" | "secondary" | "ghost"
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : "border border-white/10 bg-white/10 text-white/85 shadow-sm backdrop-blur hover:bg-white/15 focus:ring-white/15"

  return (
    <Link href={href} className={cx(base, styles)}>
      {children}
    </Link>
  )
}

function PillButton({
  children,
  onClick,
  variant = "ghost",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : "border border-white/10 bg-white/10 text-white/85 shadow-sm backdrop-blur hover:bg-white/15 focus:ring-white/15"

  return (
    <button type="button" onClick={onClick} className={cx(base, styles)}>
      {children}
    </button>
  )
}

function CategoryDropdown({
  value,
  onChange,
  options,
}: {
  value: string | "Tümü"
  onChange: (v: string | "Tümü") => void
  options: string[]
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
        <ChevronDown className={cx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] shadow-2xl">
          <div className="max-h-[280px] overflow-auto p-1">
            {(["Tümü", ...options] as Array<string | "Tümü">).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={cx(
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

/* ================== CONTENT CARD ================== */
function PolicyCard({
  item,
  onCopyLink,
}: {
  item: PolicySection
  onCopyLink?: (id: string) => void
}) {
  return (
    <div
      id={item.id}
      className="relative scroll-mt-28 overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_22px_80px_-60px_rgba(0,0,0,0.80)] backdrop-blur"
    >
      <div className="pointer-events-none absolute inset-0 opacity-55 [background-image:radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.16),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/90">
              {item.category}
            </span>
            <span
              className={cx(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                levelBadge(item.level)
              )}
            >
              {item.level.toUpperCase()}
            </span>
          </div>

          <div className="mt-3 text-[18px] font-semibold leading-snug tracking-tight text-white">{item.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-white/70">{item.desc}</div>

          {item.bullets?.length ? (
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {item.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/85">
            {item.icon}
          </span>

          {onCopyLink ? (
            <button
              type="button"
              onClick={() => onCopyLink(item.id)}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/15"
              title="Bağlantıyı kopyala"
            >
              Link
            </button>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()

  const [category, setCategory] = useState<string | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  const [toast, setToast] = useState<{ open: boolean; text: string }>({ open: false, text: "" })
  const toastTimer = useRef<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")
  const [apiSections, setApiSections] = useState<PolicySection[] | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  function showToast(text: string) {
    setToast({ open: true, text })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast({ open: false, text: "" }), 2200)
  }

  // ⌘K / Ctrl+K focus search
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

  const demoSections = useMemo<PolicySection[]>(
    () => [
      {
        id: "genel",
        category: "Genel",
        title: "Gizlilik Politikası (Özet)",
        desc:
          "Bu sayfa, hizmeti kullanırken hangi verileri topladığımızı, ne amaçla işlediğimizi ve haklarını açıklar. Kişisel verilerini korumak için süreçlerimizi şeffaf tutarız.",
        level: "Bilgi",
        icon: <Sparkles className="h-4 w-4" />,
        bullets: [
          "Paylaşımlar kategori bazlıdır; hedef gösterme amaçlanmaz.",
          "Kişisel veri içeren içerikler kaldırılabilir veya otomatik maskeleme uygulanabilir.",
          "Gizlilik için en güvenlisi: paylaşmadan önce sansürlemek.",
        ],
      },
      {
        id: "veri-turleri",
        category: "Toplanan Veriler",
        title: "Toplayabileceğimiz veri türleri",
        desc: "Hizmeti sağlamak ve güvenliği korumak için sınırlı veri toplarız. Gereksiz veri istemeyiz.",
        level: "Bilgi",
        icon: <Database className="h-4 w-4" />,
        bullets: [
          "Hesap verileri (ad/soyad, e-posta, telefon – kayıt tercihine göre).",
          "Kullanım verileri (sayfa görüntüleme, cihaz/tarayıcı bilgisi, hata log’ları).",
          "İçerik verileri (paylaştığın metinler, varsa ekler — kişisel veri olmamalı).",
        ],
      },
      {
        id: "yasakli-paylasim",
        category: "Toplanan Veriler",
        title: "Paylaşmaman gereken bilgiler",
        desc:
          "Aşağıdaki bilgiler kişisel veri/özel nitelikli veri olabilir. Paylaşırsan içeriğin kaldırılabilir ve güvenlik için maskeleme uygulanabilir.",
        level: "Zorunlu",
        icon: <EyeOff className="h-4 w-4" />,
        bullets: [
          "T.C. kimlik, adres, telefon, e-posta, kart bilgisi, IBAN",
          "Kimlik/pasaport, sağlık bilgisi, biyometrik veri",
          "Özel yazışmaların açık ekran görüntüleri (sansürsüz)",
        ],
      },
      {
        id: "amaclar",
        category: "Kullanım Amaçları",
        title: "Verileri hangi amaçlarla işleriz?",
        desc: "Verileri yalnızca hizmeti çalıştırmak, güvenliği sağlamak ve deneyimi iyileştirmek için kullanırız.",
        level: "Bilgi",
        icon: <FileText className="h-4 w-4" />,
        bullets: ["Hesap oluşturma / doğrulama / giriş işlemleri", "Spam, kötüye kullanım ve güvenlik ihlallerini önleme", "Hizmet performansını ölçme ve iyileştirme"],
      },
      {
        id: "cerezler",
        category: "Çerezler",
        title: "Çerezler ve benzeri teknolojiler",
        desc:
          "Oturum yönetimi, güvenlik ve temel analitik için çerezler kullanılabilir. Gerekli olmayan çerezler için tercih sunulabilir.",
        level: "Not",
        icon: <Cookie className="h-4 w-4" />,
        bullets: ["Zorunlu çerezler: oturum / güvenlik", "Performans: sayfa yüklenme/hata ölçümü", "Tercih çerezleri: tema/dil gibi ayarlar (varsa)"],
      },
      {
        id: "paylasim-aktarim",
        category: "Paylaşım & Aktarım",
        title: "Üçüncü taraflarla paylaşım / aktarım",
        desc:
          "Kişisel verileri satmayız. Hizmet için gerekli durumlarda, yalnızca sınırlı kapsamda ve sözleşmeli iş ortaklarıyla paylaşım olabilir.",
        level: "Bilgi",
        icon: <Share2 className="h-4 w-4" />,
        bullets: ["Barındırma (hosting), log/izleme, e-posta/SMS sağlayıcıları (varsa)", "Yasal yükümlülükler kapsamında resmi talepler", "Dolandırıcılık/kötüye kullanım tespitinde güvenlik süreçleri"],
      },
      {
        id: "saklama",
        category: "Saklama Süreleri",
        title: "Saklama süreleri",
        desc: "Verileri mevzuata uygun sürelerle ve amaçla sınırlı tutarız. Gereksiz veriyi daha uzun saklamayız.",
        level: "Bilgi",
        icon: <Trash2 className="h-4 w-4" />,
        bullets: ["Hesap verileri: hesap aktif kaldıkça veya yasal süreler boyunca", "Log kayıtları: güvenlik ve hata ayıklama için sınırlı süre", "Silme talepleri: doğrulama + yasal yükümlülük kontrolleri sonrası"],
      },
      {
        id: "haklar",
        category: "Hakların",
        title: "Hakların (KVKK/GDPR çerçevesi)",
        desc: "Verilerin üzerinde kontrol hakkın var. Talep kanallarımız üzerinden başvurabilirsin.",
        level: "Bilgi",
        icon: <UserCheck className="h-4 w-4" />,
        bullets: ["Erişim: hangi verilerin işlendiğini öğrenme", "Düzeltme: yanlış/eksik veriyi düzeltme", "Silme: şartlar uygunsa silinmesini isteme", "İtiraz: belirli işlemlere itiraz etme"],
      },
      {
        id: "guvenlik",
        category: "Güvenlik",
        title: "Güvenlik önlemleri",
        desc:
          "Yetkisiz erişimi önlemek için teknik ve idari önlemler uygularız. Ancak internet üzerinden aktarımda %100 garanti yoktur.",
        level: "Not",
        icon: <Shield className="h-4 w-4" />,
        bullets: ["Erişim kontrolü ve rol bazlı yetkilendirme", "Şüpheli aktivite izleme ve oran sınırlama", "Hassas veri tespiti için maskeleme / moderasyon"],
      },
      {
        id: "iletisim",
        category: "İletişim",
        title: "Bize ulaş",
        desc: "Gizlilik taleplerin ve soruların için iletişim kanallarımızı kullanabilirsin.",
        level: "Bilgi",
        icon: <Mail className="h-4 w-4" />,
        bullets: ["E-posta: destek@ornek.com (placeholder)", "Talep türü: erişim / düzeltme / silme / itiraz", "Yanıt süresi: mevzuata uygun şekilde"],
      },
    ],
    []
  )

  async function load() {
    setLoading(true)
    setErr("")
    try {
      const res = await fetch("/api/security", {
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

      const data = (await res.json()) as SecuritySectionRow[]
      const mapped: PolicySection[] = (Array.isArray(data) ? data : [])
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((x) => ({
          id: x.id,
          category: x.category || "Genel",
          title: x.title || "",
          desc: x.desc || "",
          bullets: Array.isArray(x.bullets) ? x.bullets : [],
          level: mapLevel(x.level),
          icon: iconForCategory(x.category || ""),
        }))

      setApiSections(mapped.length ? mapped : null)

      // "Son güncelleme" için max(updatedAt/createdAt)
      const dates = (Array.isArray(data) ? data : [])
        .map((x) => x.updatedAt || x.createdAt || "")
        .filter(Boolean)
        .map((s) => new Date(s).getTime())
        .filter((t) => Number.isFinite(t))

      const maxT = dates.length ? Math.max(...dates) : 0
      setLastUpdated(maxT ? formatDateTR(new Date(maxT).toISOString()) : "")
    } catch (e: any) {
      setErr(e?.message || "Bir hata oluştu")
      setApiSections(null)
      setLastUpdated("")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const sections = apiSections ?? demoSections

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const s of sections) set.add(s.category)
    const arr = Array.from(set)
    // Eğer API boşsa default düzeni koru
    if (!arr.length) return DEFAULT_CATEGORIES
    // Default sıralama ile mümkün olduğunca eşleştir, kalanları sona ekle
    const ordered: string[] = []
    for (const c of DEFAULT_CATEGORIES) if (set.has(c)) ordered.push(c)
    for (const c of arr) if (!ordered.includes(c)) ordered.push(c)
    return ordered
  }, [sections])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return sections.filter((it) => {
      const catOk = category === "Tümü" ? true : it.category === category
      const qOk =
        !qq ||
        it.title.toLowerCase().includes(qq) ||
        it.desc.toLowerCase().includes(qq) ||
        it.category.toLowerCase().includes(qq) ||
        (it.bullets ?? []).some((b) => b.toLowerCase().includes(qq))
      return catOk && qOk
    })
  }, [sections, category, q])

  function copyDeepLink(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    navigator.clipboard?.writeText(url)
    showToast("Link kopyalandı")
  }

  function scrollToId(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      {/* toast */}
      {toast.open ? (
        <div className="fixed bottom-4 right-4 z-[100] w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-sm text-white shadow-[0_16px_60px_rgba(15,23,42,0.22)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{toast.text}</div>
              <div className="mt-1 text-xs text-white/70">Gizlilik sayfası</div>
            </div>
            <button
              onClick={() => setToast({ open: false, text: "" })}
              className="shrink-0 rounded-xl bg-white/10 px-2 py-1 text-xs font-semibold hover:bg-white/15"
            >
              Kapat
            </button>
          </div>
        </div>
      ) : null}

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
            Gizlilik • <span className="ml-2 text-white/70">kişisel verilerini koruyoruz</span>
          </div>

          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/15"
            >
              <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
              Yenile
            </button>

            <span className="ml-2">
              Kısayol: <span className="font-semibold text-white">⌘K / Ctrl+K</span> → Ara
            </span>
          </div>
        </div>
      </div>

      <PublicTopbar subtitle="Sorrunlar" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 lg:px-10 2xl:px-14">
        {/* HEADER */}
        <section className="pt-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                KVKK • Güvenlik • Şeffaflık
              </div>

              <h1 className="mt-4 text-[36px] font-semibold tracking-tight text-white md:text-[44px]">
                Gizlilik Politikası
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Kısa ve net: hangi verileri topluyoruz, ne amaçla kullanıyoruz, nasıl koruyoruz ve hakların neler?
                Aşağıdan kategori seçip arayabilirsin.
              </p>

              {/* load state */}
              {loading ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  İçerik yükleniyor…
                </div>
              ) : err ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
                  <AlertTriangle className="h-4 w-4 text-orange-200" />
                  {err}
                </div>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:w-auto">
              {/* search */}
              <div className="w-full sm:w-[380px]">
                <div className="mb-1 text-[11px] font-light text-white/55">Ara</div>
                <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-sm backdrop-blur">
                  <div className="px-4 text-white/70">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    ref={searchRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Çerez, silme, aktarım, güvenlik…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <CategoryDropdown value={category} onChange={setCategory} options={categories} />
              </div>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <Lock className="h-4 w-4 text-emerald-300" />
              Hassas bilgi paylaşma. Ekran görüntüsü yükleyeceksen{" "}
              <span className="font-semibold text-white/85">mutlaka sansürle</span>.
            </div>

            <div className="flex items-center gap-2">
              <PillLink href="/sikayet-yaz" variant="secondary">
                Sorun Yaz
                <ArrowRight className="h-4 w-4" />
              </PillLink>
              <PillLink href="/sikayetler" variant="ghost">
                Sorunları Gör
              </PillLink>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: content */}
          <div className="lg:col-span-8">
            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
                Sonuç bulunamadı. Arama/filtreyi değiştirip tekrar dene.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filtered.map((s) => (
                  <PolicyCard key={s.id} item={s} onCopyLink={copyDeepLink} />
                ))}
              </div>
            )}

            {/* Extra notice */}
            <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Önemli Not</div>
                  <div className="mt-1 text-sm text-white/65">
                    Bu metin demo/placeholder içeriktir. Hukuki nihai metin için danışman görüşü önerilir.
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Info className="h-5 w-5 text-indigo-200" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-[96px] space-y-5">
              {/* Quick checklist */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Hızlı özet</div>
                    <div className="mt-1 text-sm text-white/65">En kritik 4 madde:</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <BadgeCheck className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {[
                    "Kişisel veri paylaşma (tel/TC/adres/kart).",
                    "Sansürsüz ekran görüntüsü yükleme.",
                    "Hakların var: erişim, düzeltme, silme.",
                    "Güvenlik için log’lar sınırlı süre tutulabilir.",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-200">
                        ✓
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-col gap-2">
                  <PillLink href="/sikayet-yaz" variant="secondary">
                    Sorun Yaz
                    <ArrowRight className="h-4 w-4" />
                  </PillLink>
                  <PillLink href="/sikayetler" variant="ghost">
                    Sorunları Gör
                  </PillLink>
                </div>
              </div>

              {/* Jump to */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Bölümlere git</div>
                <div className="mt-1 text-sm text-white/65">Tek tıkla scroll</div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  {sections.slice(0, 7).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToId(s.id)}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80 hover:bg-black/25"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                          {s.icon}
                        </span>
                        <span className="font-semibold">{s.category}</span>
                      </span>
                      <span className="text-white/55">→</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 text-xs text-white/55">
                  İpucu: Kart sağ üstteki <span className="font-semibold text-white/75">Link</span> ile bölüm linkini
                  kopyalayabilirsin.
                </div>
              </div>

              {/* FAQ mini */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Mini SSS</div>
                <div className="mt-1 text-sm text-white/65">Gizlilikle ilgili</div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      q: "Verilerim satılıyor mu?",
                      a: "Hayır. Kişisel verileri satmayız; yalnızca hizmet için gerekli sağlayıcılarla sınırlı paylaşım olabilir.",
                    },
                    {
                      q: "Silme talebi nasıl yapılır?",
                      a: "İletişim bölümündeki kanaldan talep iletebilirsin. Kimlik/doğrulama gerekebilir.",
                    },
                    {
                      q: "Paylaşımımda kişisel veri varsa?",
                      a: "Moderasyonla kaldırılabilir veya maskeleme uygulanabilir. En iyisi: paylaşmadan sansürlemek.",
                    },
                  ].map((x) => (
                    <details key={x.q} className="rounded-2xl border border-white/10 bg-black/20 p-4 open:bg-black/25">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white/85">
                        <span className="inline-flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-white/70" />
                          {x.q}
                        </span>
                      </summary>
                      <div className="mt-2 text-sm text-white/70">{x.a}</div>
                    </details>
                  ))}
                </div>

                <div className="mt-4 text-xs text-white/55">
                  İstersen bir de <span className="font-semibold text-white/75">/kvkk</span> sayfası çıkarırız (aydınlatma
                  + başvuru formu).
                </div>
              </div>

              {/* Shortcuts */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Kısayollar</div>
                <div className="mt-3 flex flex-col gap-2">
                  <PillButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Yukarı çık
                  </PillButton>
                  <PillLink href="/" variant="ghost">
                    Anasayfa
                  </PillLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM NAV */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-white/60">
            Son güncelleme:{" "}
            <span className="font-semibold text-white/75">{lastUpdated || (apiSections ? "—" : "demo")}</span> • Bu metin örnek amaçlıdır.
          </div>
          <div className="flex items-center gap-2">
            <PillLink href="/sikayetler" variant="ghost">
              Sorunlara dön
            </PillLink>
            <PillLink href="/sikayet-yaz" variant="secondary">
              Sorun Yaz
            </PillLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}