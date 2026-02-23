"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import clsx from "clsx"
import {
  Search,
  ChevronDown,
  FileText,
  Shield,
  AlertTriangle,
  UserX,
  MessageSquareWarning,
  EyeOff,
  Lock,
  BadgeCheck,
  HelpCircle,
  Info,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== API ================== */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "")
function apiUrl(path: string) {
  // Eğer NEXT_PUBLIC_API_BASE set ise absolute kullanır, değilse same-origin.
  return API_BASE ? `${API_BASE}${path}` : path
}

/* ================== TYPES ================== */
type SectionCategory =
  | "Genel"
  | "Hesap & Erişim"
  | "İçerik Kuralları"
  | "Sorumluluk"
  | "Moderasyon"
  | "Fikri Mülkiyet"
  | "Yasal"
  | "İletişim"

const CATEGORIES: SectionCategory[] = [
  "Genel",
  "Hesap & Erişim",
  "İçerik Kuralları",
  "Sorumluluk",
  "Moderasyon",
  "Fikri Mülkiyet",
  "Yasal",
  "İletişim",
]

type SectionLevel = "Zorunlu" | "Bilgi" | "Not"

type Section = {
  id: string
  category: SectionCategory
  title: string
  desc: string
  bullets?: string[]
  level: SectionLevel
  icon: React.ReactNode
}

type TermsOfUseRow = {
  id: string
  title: string
  slug: string | null
  content: any
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

/* ================== UI HELPERS ================== */
function cx(...a: Array<string | false | undefined | null>) {
  return clsx(a)
}

function levelBadge(level: SectionLevel) {
  if (level === "Zorunlu") return "border-orange-400/25 bg-orange-400/10 text-orange-100"
  if (level === "Not") return "border-indigo-400/25 bg-indigo-400/10 text-indigo-100"
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
}

function pickIcon(category: SectionCategory) {
  // Backend içeriklerinde icon gelmeyeceği varsayımıyla category’ye göre seçiyoruz
  switch (category) {
    case "Genel":
      return <FileText className="h-4 w-4" />
    case "Hesap & Erişim":
      return <Lock className="h-4 w-4" />
    case "İçerik Kuralları":
      return <EyeOff className="h-4 w-4" />
    case "Sorumluluk":
      return <AlertTriangle className="h-4 w-4" />
    case "Moderasyon":
      return <Shield className="h-4 w-4" />
    case "Fikri Mülkiyet":
      return <BadgeCheck className="h-4 w-4" />
    case "Yasal":
      return <Info className="h-4 w-4" />
    case "İletişim":
      return <HelpCircle className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

function safeCategory(v: any): SectionCategory {
  const s = String(v || "").trim()
  if (CATEGORIES.includes(s as SectionCategory)) return s as SectionCategory
  // default
  return "Genel"
}

function safeLevel(v: any): SectionLevel {
  const s = String(v || "").trim()
  if (s === "Zorunlu" || s === "Bilgi" || s === "Not") return s
  // backend eski içerikte farklı seviye geldiyse normalize edelim
  if (s.toLowerCase() === "önemli") return "Zorunlu"
  return "Bilgi"
}

function formatDateTR(iso?: string) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(d)
}

/* ================== COMPONENTS ================== */
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
  value: SectionCategory | "Tümü"
  onChange: (v: SectionCategory | "Tümü") => void
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
            {(["Tümü", ...CATEGORIES] as Array<SectionCategory | "Tümü">).map((opt) => (
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

function Card({ item }: { item: Section }) {
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
  const [category, setCategory] = useState<SectionCategory | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>("")
  const [doc, setDoc] = useState<TermsOfUseRow | null>(null)

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

  async function load() {
    setLoading(true)
    setErr("")
    try {
      const res = await fetch(apiUrl("/api/terms-of-use"), {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!res.ok) {
        // backend 404 ise "Aktif kullanım şartları bulunamadı" gibi dönebilir
        let msg = `Yüklenemedi (HTTP ${res.status})`
        try {
          const j = await res.json()
          if (j?.message) msg = Array.isArray(j.message) ? j.message.join(", ") : String(j.message)
        } catch {
          // ignore
        }
        throw new Error(msg)
      }

      const data = (await res.json()) as TermsOfUseRow
      setDoc(data)
    } catch (e: any) {
      setErr(e?.message || "Bir hata oluştu")
      setDoc(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const items = useMemo<Section[]>(() => {
    if (!doc) return []

    const content = doc.content

    // Beklenen: { sections: [...] }
    const sectionsRaw: any[] = Array.isArray(content?.sections) ? content.sections : []

    // Eğer backend’te content string gibi kaydedildiyse (beklenmiyor ama güvenlik)
    if (!sectionsRaw.length && typeof content === "string" && content.trim()) {
      return [
        {
          id: `ts-${doc.id}-single`,
          category: "Genel",
          title: doc.title || "Kullanım Şartları",
          desc: content,
          level: "Bilgi",
          icon: pickIcon("Genel"),
        },
      ]
    }

    const mapped = sectionsRaw
      .map((s, idx) => {
        const cat = safeCategory(s?.category)
        const level = safeLevel(s?.level)
        const title = String(s?.title || "").trim()
        const desc = String(s?.desc || s?.description || "").trim()

        if (!title && !desc) return null

        const bullets = Array.isArray(s?.bullets) ? s.bullets.map((x: any) => String(x)).filter(Boolean) : undefined

        return {
          id: String(s?.id || `ts-${doc.id}-${idx}`),
          category: cat,
          title: title || `Bölüm ${idx + 1}`,
          desc: desc || "—",
          bullets,
          level,
          icon: pickIcon(cat),
        } satisfies Section
      })
      .filter(Boolean) as Section[]

    return mapped
  }, [doc])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return items.filter((it) => {
      const catOk = category === "Tümü" ? true : it.category === category
      const qOk =
        !qq ||
        it.title.toLowerCase().includes(qq) ||
        it.desc.toLowerCase().includes(qq) ||
        it.category.toLowerCase().includes(qq) ||
        (it.bullets ?? []).some((b) => b.toLowerCase().includes(qq))
      return catOk && qOk
    })
  }, [items, category, q])

  const updatedText = useMemo(() => {
    if (!doc?.updatedAt) return "—"
    return formatDateTR(doc.updatedAt)
  }, [doc?.updatedAt])

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
            Kullanım Şartları • <span className="ml-2 text-white/70">platform kuralları</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Kısayol: <span className="font-semibold text-white">⌘K / Ctrl+K</span> → Ara
          </div>
        </div>
      </div>

      <PublicTopbar subtitle="Şikayetler" showSearchStub={false} nextUrlForAuth="/sikayetler" />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 lg:px-10 2xl:px-14">
        <section className="pt-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Kurallar • Moderasyon • Sorumluluk
              </div>
              <h1 className="mt-4 text-[36px] font-semibold tracking-tight text-white md:text-[44px]">
                {doc?.title || "Kullanım Şartları"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Platformu adil ve güvenli tutmak için temel kurallar. Aşağıdan kategori seçip arayabilirsin.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end md:w-auto">
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
                    placeholder="Hesap, içerik, moderasyon…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <CategoryDropdown value={category} onChange={setCategory} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <Shield className="h-4 w-4 text-emerald-300" />
              Hakaret + kişisel veri + spam içerikleri kaldırılır. Tekrarında kısıtlama olabilir.
            </div>

            <div className="flex items-center gap-2">
              <PillLink href="/gizlilik" variant="ghost">
                Gizlilik
              </PillLink>

              <PillLink href="/sikayet-yaz" variant="secondary">
                Şikayet Yaz
              </PillLink>

              <PillButton variant="ghost" onClick={load}>
                <RefreshCw className="h-4 w-4" />
                Yenile
              </PillButton>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {loading ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Yükleniyor…
                </div>
              </div>
            ) : err ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <AlertTriangle className="h-5 w-5 text-orange-200" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white/90">Bir hata oluştu</div>
                    <div className="mt-1 text-sm text-white/70 break-words">{err}</div>
                    <div className="mt-4">
                      <PillButton variant="secondary" onClick={load}>
                        Tekrar dene <ArrowRight className="h-4 w-4" />
                      </PillButton>
                    </div>
                  </div>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
                Sonuç bulunamadı. Arama/filtreyi değiştirip tekrar dene.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filtered.map((it) => (
                  <Card key={it.id} item={it} />
                ))}
              </div>
            )}

            <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Uyarı</div>
                  <div className="mt-1 text-sm text-white/65">
                    Bu metin bilgilendirme amaçlıdır. Nihai hukuki metin için danışman görüşü önerilir.
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Info className="h-5 w-5 text-indigo-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-[96px] space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">En kritikler</div>
                    <div className="mt-1 text-sm text-white/65">Kural ihlallerinde:</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <BadgeCheck className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {[
                    "Kişisel veri → kaldırma/maskeleme",
                    "Hakaret/küfür → kaldırma",
                    "Spam/manipülasyon → kısıtlama",
                    "Tekrarlı ihlal → hesap askısı",
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
                  <PillLink href="/gizlilik" variant="ghost">
                    Gizlilik Politikası
                  </PillLink>
                  <PillLink href="/sikayet-yaz" variant="secondary">
                    Şikayet Yaz <ArrowRight className="h-4 w-4" />
                  </PillLink>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Hızlı hatalar</div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {[
                    { t: "Kişisel veri paylaşmak", i: <EyeOff className="h-4 w-4" /> },
                    { t: "Hakaret/küfür", i: <MessageSquareWarning className="h-4 w-4" /> },
                    { t: "Spam / yönlendirme", i: <UserX className="h-4 w-4" /> },
                    { t: "Özel bilgi sızdırmak", i: <Lock className="h-4 w-4" /> },
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

                <div className="mt-4 text-xs text-white/55">
                  Şüphede kaldığında: <span className="font-semibold text-white/75">paylaşma</span> ya da{" "}
                  <span className="font-semibold text-white/75">sansürle</span>.
                </div>
              </div>

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

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <AlertTriangle className="h-5 w-5 text-orange-200" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">Not</div>
                    <div className="mt-1 text-sm text-white/65">
                      Bu sayfadaki içerik admin panelden güncellenir. Yayında yalnızca aktif kayıt gösterilir.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-white/60">
            Son güncelleme: <span className="font-semibold text-white/75">{updatedText}</span>
          </div>
          <div className="flex items-center gap-2">
            <PillLink href="/gizlilik" variant="ghost">
              Gizlilik
            </PillLink>
            <PillLink href="/cerez-politikasi" variant="ghost">
              Çerez Politikası
            </PillLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}