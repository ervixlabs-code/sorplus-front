"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  Search,
  ChevronDown,
  Shield,
  FileText,
  Info,
  UserCheck,
  Database,
  Lock,
  Mail,
  HelpCircle,
  BadgeCheck,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

type SectionCategory =
  | "Aydınlatma"
  | "Veri Sorumlusu"
  | "İşleme Amaçları"
  | "Aktarım"
  | "Saklama"
  | "Hakların"
  | "Başvuru"
  | "İletişim"

const CATEGORIES: SectionCategory[] = [
  "Aydınlatma",
  "Veri Sorumlusu",
  "İşleme Amaçları",
  "Aktarım",
  "Saklama",
  "Hakların",
  "Başvuru",
  "İletişim",
]

type Section = {
  id: string
  category: SectionCategory
  title: string
  desc: string
  bullets?: string[]
  level: "Zorunlu" | "Bilgi" | "Not"
  icon: React.ReactNode
}

/** API response (public GET /api/kvkk) */
type KvkkPublic = {
  id: string
  title: string
  slug: string | null
  content: any // { sections: [...] } bekliyoruz
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

function cx(...a: Array<string | false | undefined | null>) {
  return clsx(a)
}

function levelBadge(level: Section["level"]) {
  if (level === "Zorunlu") return "border-orange-400/25 bg-orange-400/10 text-orange-100"
  if (level === "Not") return "border-indigo-400/25 bg-indigo-400/10 text-indigo-100"
  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
}

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

/** content.sections -> UI Section map */
function iconFromKey(key: string | undefined) {
  const k = (key || "").toLowerCase()
  if (k.includes("shield")) return <Shield className="h-4 w-4" />
  if (k.includes("file")) return <FileText className="h-4 w-4" />
  if (k.includes("database")) return <Database className="h-4 w-4" />
  if (k.includes("lock")) return <Lock className="h-4 w-4" />
  if (k.includes("mail")) return <Mail className="h-4 w-4" />
  if (k.includes("user")) return <UserCheck className="h-4 w-4" />
  if (k.includes("badge")) return <BadgeCheck className="h-4 w-4" />
  if (k.includes("info")) return <Info className="h-4 w-4" />
  return <Info className="h-4 w-4" />
}

function normalizeCategory(v: any): SectionCategory {
  const s = String(v || "").trim()

  // direkt eşleşmeler
  if ((CATEGORIES as string[]).includes(s)) return s as SectionCategory

  // tolerans (admin içerik girerken farklı yazılmış olabilir)
  const lower = s.toLowerCase()
  if (lower.includes("ayd")) return "Aydınlatma"
  if (lower.includes("sorumlu")) return "Veri Sorumlusu"
  if (lower.includes("amaç")) return "İşleme Amaçları"
  if (lower.includes("akt")) return "Aktarım"
  if (lower.includes("sak")) return "Saklama"
  if (lower.includes("hak")) return "Hakların"
  if (lower.includes("başv")) return "Başvuru"
  if (lower.includes("ileti")) return "İletişim"

  return "Aydınlatma"
}

function normalizeLevel(v: any): Section["level"] {
  const s = String(v || "").toLowerCase()
  if (s.includes("zorun")) return "Zorunlu"
  if (s.includes("not")) return "Not"
  return "Bilgi"
}

function toSectionsFromKvkkContent(content: any): Section[] {
  const raw = content?.sections
  if (!Array.isArray(raw)) return []

  return raw
    .map((r: any, idx: number) => {
      const id = String(r?.id || r?.slug || `kvkk-${idx}`)
      const category = normalizeCategory(r?.category)
      const title = String(r?.title || "").trim()
      const desc = String(r?.desc || r?.description || "").trim()

      if (!title || !desc) return null

      const bulletsRaw = r?.bullets
      const bullets = Array.isArray(bulletsRaw)
        ? bulletsRaw.map((x: any) => String(x)).filter(Boolean)
        : undefined

      const iconKey = r?.iconKey || r?.icon || undefined

      return {
        id,
        category,
        title,
        desc,
        bullets,
        level: normalizeLevel(r?.level),
        icon: iconFromKey(iconKey),
      } as Section
    })
    .filter(Boolean) as Section[]
}

export default function Page() {
  const router = useRouter()
  const [category, setCategory] = useState<SectionCategory | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  // API state
  const [apiErr, setApiErr] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [kvkkTitle, setKvkkTitle] = useState<string>("KVKK")
  const [itemsFromApi, setItemsFromApi] = useState<Section[] | null>(null)

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
  const demoItems = useMemo<Section[]>(
    () => [
      {
        id: "kvkk-aydinlatma",
        category: "Aydınlatma",
        title: "KVKK Aydınlatma Metni (Özet)",
        desc:
          "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinin hangi şartlarda işlendiğine ilişkin bilgilendirme amaçlıdır.",
        level: "Bilgi",
        icon: <FileText className="h-4 w-4" />,
        bullets: ["Amaç: şeffaflık", "Kapsam: hizmet kullanıcıları", "Başvuru: aşağıda"],
      },
      {
        id: "kvkk-sorumlu",
        category: "Veri Sorumlusu",
        title: "Veri sorumlusu",
        desc: "Veri sorumlusu bilgileri burada yer alır (placeholder). Şirket unvanı/adresi daha sonra netleşince doldurulur.",
        level: "Zorunlu",
        icon: <Shield className="h-4 w-4" />,
        bullets: ["Unvan: Örnek A.Ş.", "Adres: ...", "E-posta: destek@ornek.com"],
      },
      {
        id: "kvkk-amaclar",
        category: "İşleme Amaçları",
        title: "Kişisel veri işleme amaçları",
        desc: "Hizmeti sunmak, güvenliği sağlamak, kullanıcı deneyimini iyileştirmek ve hukuki yükümlülükleri yerine getirmek için veri işlenebilir.",
        level: "Bilgi",
        icon: <Database className="h-4 w-4" />,
        bullets: ["Hesap işlemleri", "Güvenlik ve kötüye kullanım önleme", "İletişim ve destek süreçleri"],
      },
      {
        id: "kvkk-aktarim",
        category: "Aktarım",
        title: "Verilerin aktarımı",
        desc: "Veriler, hizmetin sağlanması için zorunlu üçüncü taraf sağlayıcılarla (barındırma, log/izleme vb.) sınırlı şekilde paylaşılabilir.",
        level: "Not",
        icon: <Lock className="h-4 w-4" />,
        bullets: ["Yasal talepler kapsamında resmi mercilere aktarım olabilir.", "Veri satışı yapılmaz."],
      },
      {
        id: "kvkk-saklama",
        category: "Saklama",
        title: "Saklama süreleri",
        desc: "Veriler, ilgili amaç ve mevzuatın gerektirdiği süre boyunca saklanır. Süre sonunda silme/anonimleştirme uygulanabilir.",
        level: "Bilgi",
        icon: <Info className="h-4 w-4" />,
        bullets: ["Hesap verileri: hesap aktifken", "Log verileri: sınırlı süre", "Yasal yükümlülük: gerekli süre"],
      },
      {
        id: "kvkk-haklar",
        category: "Hakların",
        title: "KVKK kapsamındaki hakların",
        desc: "KVKK’nın 11. maddesi kapsamında; erişim, düzeltme, silme, itiraz gibi haklara sahipsin.",
        level: "Bilgi",
        icon: <UserCheck className="h-4 w-4" />,
        bullets: ["Verini öğrenme", "Düzeltme isteme", "Silme/anonimleştirme isteme", "İtiraz etme"],
      },
      {
        id: "kvkk-basvuru",
        category: "Başvuru",
        title: "Başvuru yöntemi",
        desc: "Taleplerini e-posta üzerinden iletebilirsin. Güvenlik için kimlik doğrulama istenebilir.",
        level: "Zorunlu",
        icon: <BadgeCheck className="h-4 w-4" />,
        bullets: ["Konu: KVKK Başvurusu", "Talep türü: erişim/düzeltme/silme", "Yanıt: mevzuata uygun süre"],
      },
      {
        id: "kvkk-iletisim",
        category: "İletişim",
        title: "İletişim",
        desc: "KVKK taleplerin için iletişim (placeholder).",
        level: "Bilgi",
        icon: <Mail className="h-4 w-4" />,
        bullets: ["destek@ornek.com", "Alternatif kanal: destek formu (varsa)"],
      },
    ],
    []
  )

  // ✅ Public KVKK fetch: GET /api/kvkk
  useEffect(() => {
  let alive = true

  async function load() {
    try {
      setApiLoading(true)
      setApiErr(null)

      const res = await fetch("/api/kvkk", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`KVKK fetch failed (${res.status})${text ? ` - ${text}` : ""}`)
      }

      const data = (await res.json()) as KvkkPublic
      const nextTitle = (data?.title || "KVKK").trim() || "KVKK"
      const sections = toSectionsFromKvkkContent(data?.content)

      if (!alive) return
      setKvkkTitle(nextTitle)
      setItemsFromApi(sections.length ? sections : [])
    } catch (e: any) {
      if (!alive) return
      setItemsFromApi(null) // null => demo fallback
      setApiErr(e?.message || "KVKK API bağlanamadı")
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

  const items: Section[] = useMemo(() => {
    // API başarılı ama sections boş geldiyse: yine demo yerine boş liste göstermek istemeyebiliriz
    // burada istersen boşsa demo gösterelim:
    if (Array.isArray(itemsFromApi)) {
      return itemsFromApi.length ? itemsFromApi : demoItems
    }
    return demoItems
  }, [itemsFromApi, demoItems])

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
            KVKK • <span className="ml-2 text-white/70">aydınlatma + başvuru</span>
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
                Aydınlatma • Haklar • Başvuru
              </div>

              <h1 className="mt-4 text-[36px] font-semibold tracking-tight text-white md:text-[44px]">
                {kvkkTitle || "KVKK"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Aydınlatma metni + hakların + başvuru yöntemi. Kategori seçip arayabilirsin.
              </p>

              {/* ✅ API banner (screenshot ile aynı mantık) */}
              {apiErr ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-4 py-2 text-sm text-orange-100">
                  KVKK API bağlanamadı: <span className="font-semibold">{apiErr}</span> — demo içerik gösteriliyor.
                </div>
              ) : null}

              {!apiErr && apiLoading ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/75">
                  KVKK yükleniyor…
                </div>
              ) : null}
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
                    placeholder="Haklar, başvuru, aktarım…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <CategoryDropdown value={category} onChange={setCategory} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {filtered.length === 0 ? (
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
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-[96px] space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Hızlı özet</div>
                    <div className="mt-1 text-sm text-white/65">En çok kullanılan haklar:</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <BadgeCheck className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-white/75">
                  {["Erişim", "Düzeltme", "Silme", "İtiraz"].map((t) => (
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
                  <PillLink href="/cerez-politikasi" variant="ghost">
                    Çerez Politikası
                  </PillLink>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Başvuru ipucu</div>
                <div className="mt-3 flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Mail className="h-5 w-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-sm text-white/75">E-postaya şunları yaz:</div>
                    <div className="mt-2 text-xs text-white/65">
                      <div>• Ad Soyad</div>
                      <div>• Talep türü (erişim/düzeltme/silme)</div>
                      <div>• Hesap e-postası/telefonu</div>
                      <div>• Açıklama</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                  Örnek konu: <span className="font-semibold text-white/80">KVKK Başvurusu</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}