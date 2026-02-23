"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import clsx from "clsx"
import {
  Sparkles,
  Search,
  ChevronDown,
  Shield,
  BadgeCheck,
  AlertTriangle,
  UserX,
  EyeOff,
  Lock,
  FileText,
  MessageSquareWarning,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Info,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== TYPES ================== */
type RuleCategory =
  | "Genel"
  | "Kişisel Veri & Gizlilik"
  | "Saygı & Dil"
  | "Kanıt & Paylaşım"
  | "Spam & Manipülasyon"
  | "Moderasyon Süreci"
  | "Hukuki"

/** API: GET /api/rules/active response shape */
type RulesPublic = {
  id: string
  title: string
  slug: string | null
  content: any // { rules:[...] } veya { sections:[...] } bekliyoruz
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

/* ================== CONSTANTS ================== */
const CATEGORIES: RuleCategory[] = [
  "Genel",
  "Kişisel Veri & Gizlilik",
  "Saygı & Dil",
  "Kanıt & Paylaşım",
  "Spam & Manipülasyon",
  "Moderasyon Süreci",
  "Hukuki",
]

/* ================== HELPERS ================== */
function cx(...a: Array<string | false | undefined | null>) {
  return clsx(a)
}

function levelBadge(level: Rule["level"]) {
  if (level === "Zorunlu") return "border-orange-400/25 bg-orange-400/10 text-orange-100"
  if (level === "Öneri") return "border-indigo-400/25 bg-indigo-400/10 text-indigo-100"
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
}

function iconFromKey(key: any) {
  const k = String(key || "").toLowerCase()
  if (k.includes("spark")) return <Sparkles className="h-4 w-4" />
  if (k.includes("shield")) return <Shield className="h-4 w-4" />
  if (k.includes("badge")) return <BadgeCheck className="h-4 w-4" />
  if (k.includes("alert")) return <AlertTriangle className="h-4 w-4" />
  if (k.includes("userx")) return <UserX className="h-4 w-4" />
  if (k.includes("eyeoff")) return <EyeOff className="h-4 w-4" />
  if (k.includes("lock")) return <Lock className="h-4 w-4" />
  if (k.includes("file")) return <FileText className="h-4 w-4" />
  if (k.includes("msg") || k.includes("warning")) return <MessageSquareWarning className="h-4 w-4" />
  if (k.includes("help")) return <HelpCircle className="h-4 w-4" />
  if (k.includes("check")) return <CheckCircle2 className="h-4 w-4" />
  return <Info className="h-4 w-4" />
}

function normalizeRuleCategory(v: any): RuleCategory {
  const s = String(v || "").trim().toLowerCase()
  if (s.includes("kişisel") || s.includes("gizlilik")) return "Kişisel Veri & Gizlilik"
  if (s.includes("sayg") || s.includes("dil")) return "Saygı & Dil"
  if (s.includes("kanıt") || s.includes("paylaş")) return "Kanıt & Paylaşım"
  if (s.includes("spam") || s.includes("manip")) return "Spam & Manipülasyon"
  if (s.includes("moder")) return "Moderasyon Süreci"
  if (s.includes("hukuk")) return "Hukuki"
  return "Genel"
}

function normalizeRuleLevel(v: any): Rule["level"] {
  const s = String(v || "").trim().toLowerCase()
  if (s.includes("zorun")) return "Zorunlu"
  if (s.includes("öner")) return "Öneri"
  return "Bilgi"
}

type Rule = {
  id: string
  category: RuleCategory
  title: string
  desc: string
  level: "Zorunlu" | "Öneri" | "Bilgi"
  icon: React.ReactNode
}

function normalizeLevel(v: any): Rule["level"] {
  const s = String(v || "").toLowerCase()
  if (s.includes("zorun")) return "Zorunlu"
  if (s.includes("öner") || s.includes("oner")) return "Öneri"
  return "Bilgi"
}

/**
 * Backend content -> UI rules
 * supports:
 *  - content.rules: [{ id?, category, title, desc/description, level, iconKey }]
 *  - content.sections: KVKK style (title/desc/category/level/iconKey)
 */
function toRulesFromContent(content: any): Rule[] {
  // content.rules | content.items | content.sections gibi farklı yapılara tolerans
  const raw =
    content?.rules ??
    content?.items ??
    content?.sections ??
    content?.data ??
    null

  if (!Array.isArray(raw)) return []

  return raw
    .map((r: any, idx: number) => {
      const id = String(r?.id || r?.slug || `rule-${idx}`)
      const title = String(r?.title || "").trim()
      const desc = String(r?.desc || r?.description || r?.text || "").trim()
      if (!title || !desc) return null

      return {
        id,
        category: normalizeRuleCategory(r?.category),
        title,
        desc,
        level: normalizeRuleLevel(r?.level),
        icon: iconFromKey(r?.iconKey || r?.icon || r?.iconName),
      } as Rule
    })
    .filter(Boolean) as Rule[]
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
}: {
  value: RuleCategory | "Tümü"
  onChange: (v: RuleCategory | "Tümü") => void
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
            {(["Tümü", ...CATEGORIES] as Array<RuleCategory | "Tümü">).map((opt) => (
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

function RuleCard({ item }: { item: Rule }) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_22px_80px_-60px_rgba(0,0,0,0.80)] backdrop-blur">
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
        </div>

        <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/85">
          {item.icon}
        </span>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const [category, setCategory] = useState<RuleCategory | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  // API state
  const [apiErr, setApiErr] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [rulesTitle, setRulesTitle] = useState<string>("Kurallar")
  const [itemsFromApi, setItemsFromApi] = useState<Rule[] | null>(null) // null => fallback demo

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

  // Demo fallback (API yoksa)
  const demoRules = useMemo<Rule[]>(
    () => [
      {
        id: "r1",
        category: "Genel",
        title: "Amaç: farkındalık + çözüm odağı",
        desc: "Burası firma hedefleme / linç platformu değil. Kategori bazlı deneyim paylaşımıyla sorunları görünür kılmayı amaçlarız.",
        level: "Bilgi",
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        id: "r2",
        category: "Genel",
        title: "Tek bir olay = tek paylaşım",
        desc: "Aynı olayı tekrar tekrar açmak yerine mevcut başlık altında güncelleme paylaş. Gereksiz tekrarlar kaldırılabilir.",
        level: "Öneri",
        icon: <BadgeCheck className="h-4 w-4" />,
      },
      {
        id: "r3",
        category: "Kişisel Veri & Gizlilik",
        title: "Telefon, T.C., adres, kart bilgisi yasak",
        desc: "Kişisel veriler otomatik gizlenebilir; yine de paylaşma. Paylaşımlar moderasyona takılabilir veya kaldırılabilir.",
        level: "Zorunlu",
        icon: <EyeOff className="h-4 w-4" />,
      },
      {
        id: "r4",
        category: "Kişisel Veri & Gizlilik",
        title: "Özel ekran görüntülerini sansürle",
        desc: "Sipariş numarası, IBAN, açık isim/soyisim gibi alanları kapatarak yükle. Aksi durumda içerik kaldırılabilir.",
        level: "Zorunlu",
        icon: <Lock className="h-4 w-4" />,
      },
      {
        id: "r5",
        category: "Saygı & Dil",
        title: "Hakaret, küfür, nefret söylemi yok",
        desc: "Küfür/hakaret içeren içerikler kaldırılır; tekrarında hesap kısıtlanabilir.",
        level: "Zorunlu",
        icon: <MessageSquareWarning className="h-4 w-4" />,
      },
      {
        id: "r6",
        category: "Saygı & Dil",
        title: "Kişiye saldırı değil, sürece odak",
        desc: "İsim verip hedef göstermek yerine yaşanan süreci ve sonucu anlat. Çözüm odaklı dil daha hızlı sonuç getirir.",
        level: "Öneri",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      {
        id: "r7",
        category: "Kanıt & Paylaşım",
        title: "Somut detay: tarih, süreç, sonuç",
        desc: "“Ne oldu?”, “Ne zaman?”, “Ne denendi?” ve “Ne bekleniyor?” net olursa topluluk daha faydalı yorum yapar.",
        level: "Öneri",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: "r8",
        category: "Kanıt & Paylaşım",
        title: "Yanıltıcı/uydurma içerik kaldırılır",
        desc: "Bilinçli yanlış yönlendirme veya iftira niteliği taşıyan içerikler silinir; gerekli durumlarda kayıtlar saklanabilir.",
        level: "Zorunlu",
        icon: <AlertTriangle className="h-4 w-4" />,
      },
      {
        id: "r9",
        category: "Spam & Manipülasyon",
        title: "Reklam, yönlendirme, link spam yok",
        desc: "Kampanya linkleri, referral, toplu yönlendirme içerikleri kaldırılır.",
        level: "Zorunlu",
        icon: <UserX className="h-4 w-4" />,
      },
      {
        id: "r10",
        category: "Moderasyon Süreci",
        title: "İçerikler moderasyondan geçebilir",
        desc: "Riskli içerikler (kişisel veri, hakaret, hedef gösterme) yayın öncesi incelemeye alınabilir.",
        level: "Bilgi",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: "r11",
        category: "Moderasyon Süreci",
        title: "Bildirim mekanizması var",
        desc: "Uygunsuz içerikleri “Bildir” ile işaretle. Tekrarlayan ihlallerde erişim kısıtlanabilir.",
        level: "Bilgi",
        icon: <Info className="h-4 w-4" />,
      },
      {
        id: "r12",
        category: "Hukuki",
        title: "Yasal taleplerde kayıt paylaşımı olabilir",
        desc: "Yasal mercilerden gelen taleplerde, mevzuata uygun şekilde kayıtlar paylaşılabilir.",
        level: "Bilgi",
        icon: <HelpCircle className="h-4 w-4" />,
      },
    ],
    []
  )

  // ✅ Public Rules fetch: GET /api/rules (Next proxy) -> upstream /api/rules/active
  useEffect(() => {
    let alive = true

    async function load() {
      try {
        setApiLoading(true)
        setApiErr(null)

        const res = await fetch("/api/kurallar", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(`Rules fetch failed (${res.status})${text ? ` - ${text}` : ""}`)
        }

        const data = (await res.json()) as RulesPublic | null

        // backend "aktif doc yok" ise null döndürebilir
        if (!data) {
          if (!alive) return
          setItemsFromApi(null)
          setRulesTitle("Kurallar")
          setApiErr("Aktif kurallar dokümanı bulunamadı (null). Demo içerik gösteriliyor.")
          return
        }

        const nextTitle = String(data?.title || "Kurallar").trim() || "Kurallar"
        const mapped = toRulesFromContent(data?.content)

        if (!alive) return
        setRulesTitle(nextTitle)
        setItemsFromApi(mapped.length ? mapped : [])
      } catch (e: any) {
        if (!alive) return
        setItemsFromApi(null)
        setApiErr(e?.message || "Rules API bağlanamadı")
      } finally {
        if (!alive) return
        setApiLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  const rules: Rule[] = useMemo(() => {
    // API başarılı ama content boş geldiyse: demo göster
    if (Array.isArray(itemsFromApi)) return itemsFromApi.length ? itemsFromApi : demoRules
    return demoRules
  }, [itemsFromApi, demoRules])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return rules.filter((it) => {
      const catOk = category === "Tümü" ? true : it.category === category
      const qOk =
        !qq ||
        it.title.toLowerCase().includes(qq) ||
        it.desc.toLowerCase().includes(qq) ||
        it.category.toLowerCase().includes(qq)
      return catOk && qOk
    })
  }, [rules, category, q])

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
            Kurallar & Rehber • <span className="ml-2 text-white/70">güvenli paylaşım için</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Kısayol: <span className="font-semibold text-white">⌘K / Ctrl+K</span> → Ara
          </div>
        </div>
      </div>

      <PublicTopbar subtitle="Şikayetler" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 lg:px-10 2xl:px-14">
        {/* HEADER */}
        <section className="pt-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Güvenli paylaşım • Moderasyon • Gizlilik
              </div>

              <h1 className="mt-4 text-[36px] font-semibold tracking-tight text-white md:text-[44px]">
                {rulesTitle || "Kurallar"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Kısa ve net: kişisel veri yok, hakaret yok, süreç odaklı anlatım var. Aşağıdan kategori seçip arayabilirsin.
              </p>

              {/* ✅ API banner */}
              {apiErr ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm text-orange-100">
                  Rules API uyarısı: <span className="font-semibold">{apiErr}</span> — demo içerik gösteriliyor.
                </div>
              ) : null}

              {!apiErr && apiLoading ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75">
                  Kurallar yükleniyor…
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
                    placeholder="Kişisel veri, hakaret, spam…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <CategoryDropdown value={category} onChange={setCategory} />
              </div>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <Shield className="h-4 w-4 text-emerald-300" />
              Paylaşımın önce bu kurallara göre değerlendirilir. Şüphede kaldığında{" "}
              <span className="font-semibold text-white/85">kişisel veriyi kaldır</span>.
            </div>

            <div className="flex items-center gap-2">
              <PillLink href="/sikayetler" variant="ghost">
                Şikayetlere Git
              </PillLink>
              <PillLink href="/sikayet-yaz" variant="secondary">
                Şikayet Yaz
              </PillLink>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: rules */}
          <div className="lg:col-span-8">
            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
                Sonuç bulunamadı. Arama/filtreyi değiştirip tekrar dene.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filtered.map((r) => (
                  <RuleCard key={r.id} item={r} />
                ))}
              </div>
            )}

            <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Sık yapılan hatalar</div>
                  <div className="mt-1 text-sm text-white/65">İçerik kaldırılmasının en sık sebepleri:</div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <AlertTriangle className="h-5 w-5 text-orange-200" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  { t: "Telefon / adres / TC paylaşmak", i: <EyeOff className="h-4 w-4" /> },
                  { t: "Küfür-hakaret ile yazmak", i: <MessageSquareWarning className="h-4 w-4" /> },
                  { t: "İsim verip hedef göstermek", i: <UserX className="h-4 w-4" /> },
                  { t: "Link/yorum spam yapmak", i: <Shield className="h-4 w-4" /> },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                      {x.i}
                    </span>
                    <div className="font-semibold text-white/85">{x.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-[96px] space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Hızlı kontrol listesi</div>
                    <div className="mt-1 text-sm text-white/65">Paylaşmadan önce 10 saniye:</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <BadgeCheck className="h-5 w-5 text-indigo-200" />
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {[
                    "Kişisel veri yok (tel/TC/adres/kart).",
                    "Hakaret yok, süreç odaklı.",
                    "Tarih + süreç + sonuç yazıldı.",
                    "Gerekiyorsa ekran görüntüsü sansürlü.",
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
                    Şikayet Yaz
                    <ArrowRight className="h-4 w-4" />
                  </PillLink>
                  <PillLink href="/sikayetler" variant="ghost">
                    Şikayetleri Gör
                  </PillLink>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">SSS (Demo)</div>
                <div className="mt-1 text-sm text-white/65">En çok sorulanlar</div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      q: "Paylaşımım neden yayına alınmadı?",
                      a: "Kişisel veri, hakaret, hedef gösterme veya spam şüphesi varsa moderasyona düşer.",
                    },
                    {
                      q: "Marka adı yazarsam ne olur?",
                      a: "Firma sayfası yok. Metinde geçerse sadece “★ metinde marka” gibi işaret olabilir.",
                    },
                    {
                      q: "Nasıl daha etkili yazılır?",
                      a: "Somut detay + beklenti: “Ne istiyorum?” net olursa yorumlar daha kaliteli gelir.",
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

                <div className="mt-4 text-xs text-white/55">Not: SSS sayfasını istersen ayrıca çıkarırız.</div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Shield className="h-5 w-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">Moderasyon notu</div>
                    <div className="mt-1 text-sm text-white/65">
                      Kural ihlallerinde içerik kaldırılabilir ve erişim kısıtlanabilir.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Kısa yollar</div>
                <div className="mt-3 flex flex-col gap-2">
                  <PillButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Yukarı çık
                  </PillButton>
                  <PillLink href="/sikayetler" variant="ghost">
                    Listeye dön
                  </PillLink>
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
            Kaynak: <span className="font-semibold text-white/75">GET /api/rules/active</span> (Next proxy:{" "}
            <span className="font-semibold text-white/75">/api/rules</span>)
          </div>
          <div className="flex items-center gap-2">
            <PillLink href="/sikayetler" variant="ghost">
              Şikayetlere dön
            </PillLink>
            <PillLink href="/sikayet-yaz" variant="secondary">
              Şikayet Yaz
            </PillLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}