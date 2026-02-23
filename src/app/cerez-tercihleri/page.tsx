"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  Sparkles,
  Search,
  ChevronDown,
  Cookie,
  Shield,
  Lock,
  BarChart3,
  Settings,
  BadgeCheck,
  Info,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Footer from "@/components/Footer"

import PublicTopbar from "@/components/PublicTopbar"

/* ================== STORAGE ================== */
const LS_KEY = "cookie_prefs_v1"

type Category = "Genel" | "Zorunlu" | "Analitik" | "Tercih" | "Pazarlama" | "Üçüncü Taraf"

type ConsentKey = "necessary" | "analytics" | "preferences" | "marketing"

type ConsentState = {
  necessary: true
  analytics: boolean
  preferences: boolean
  marketing: boolean
  updatedAt: string // display
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function nowTR() {
  return new Date().toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function loadPrefs(): ConsentState {
  const fallback: ConsentState = {
    necessary: true,
    analytics: false,
    preferences: false,
    marketing: false,
    updatedAt: nowTR(),
  }
  const parsed = safeJsonParse<Partial<ConsentState>>(typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null, {})
  return {
    ...fallback,
    ...parsed,
    necessary: true, // always true
  }
}

function savePrefs(next: ConsentState) {
  localStorage.setItem(LS_KEY, JSON.stringify(next))
}

/* ================== UI HELPERS ================== */
function cx(...a: Array<string | false | undefined | null>) {
  return clsx(a)
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
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : "border border-white/10 bg-white/10 text-white/85 shadow-sm backdrop-blur hover:bg-white/15 focus:ring-white/15"
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cx(base, styles)}>
      {children}
    </button>
  )
}

function CategoryDropdown({
  value,
  onChange,
  categories,
}: {
  value: Category | "Tümü"
  onChange: (v: Category | "Tümü") => void
  categories: Category[]
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
            {(["Tümü", ...categories] as Array<Category | "Tümü">).map((opt) => (
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

/* ================== SWITCH ================== */
function Switch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative h-7 w-12 rounded-full border transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed",
        checked ? "bg-emerald-500/80 border-emerald-300/30 focus:ring-emerald-200/20" : "bg-white/10 border-white/10 focus:ring-white/10",
        disabled && "opacity-60"
      )}
      aria-pressed={checked}
    >
      <span
        className={cx(
          "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "left-[26px]" : "left-[4px]"
        )}
      />
    </button>
  )
}

/* ================== CONTENT MODEL ================== */
type PrefCard = {
  key: ConsentKey | "info"
  category: Category
  title: string
  desc: string
  bullets: string[]
  icon: React.ReactNode
  locked?: boolean
}

function Card({
  item,
  enabled,
  onToggle,
}: {
  item: PrefCard
  enabled?: boolean
  onToggle?: (next: boolean) => void
}) {
  const showSwitch = item.key !== "info"
  const locked = !!item.locked

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

            {locked ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/25 bg-orange-400/10 px-2.5 py-1 text-[11px] font-semibold text-orange-100">
                <Lock className="h-3.5 w-3.5" />
                ZORUNLU
              </span>
            ) : showSwitch ? (
              <span
                className={cx(
                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  enabled ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/10 text-white/70"
                )}
              >
                {enabled ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {enabled ? "AKTİF" : "KAPALI"}
              </span>
            ) : null}
          </div>

          <div className="mt-3 text-[18px] font-semibold leading-snug tracking-tight text-white">{item.title}</div>
          <div className="mt-2 text-sm leading-relaxed text-white/70">{item.desc}</div>

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
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/85">
            {item.icon}
          </span>

          {showSwitch ? (
            <Switch checked={!!enabled} onChange={(v) => onToggle?.(v)} disabled={locked} />
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  )
}

/* ================== TOAST ================== */
type ToastKind = "success" | "error" | "info"
type ToastState = { open: boolean; kind: ToastKind; title: string; desc?: string }

function Toast({ state, onClose }: { state: ToastState; onClose: () => void }) {
  if (!state.open) return null
  const base =
    "fixed z-[100] bottom-4 right-4 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border shadow-[0_16px_60px_rgba(15,23,42,0.22)] backdrop-blur-xl overflow-hidden"
  const style =
    state.kind === "success"
      ? "bg-emerald-600 text-white border-emerald-500/30"
      : state.kind === "error"
      ? "bg-rose-600 text-white border-rose-500/30"
      : "bg-slate-900 text-white border-white/10"

  return (
    <div className={cx(base, style)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{state.title}</div>
            {state.desc ? <div className="mt-1 text-xs text-white/85">{state.desc}</div> : null}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-xl bg-white/10 hover:bg-white/15 px-2 py-1 text-xs font-semibold"
            aria-label="Kapat"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()

  const [prefs, setPrefs] = useState<ConsentState>(() => ({
    necessary: true,
    analytics: false,
    preferences: false,
    marketing: false,
    updatedAt: nowTR(),
  }))

  useEffect(() => {
    setPrefs(loadPrefs())
  }, [])

  // query controls
  const [category, setCategory] = useState<Category | "Tümü">("Tümü")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

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

  // Toast
  const [toast, setToast] = useState<ToastState>({ open: false, kind: "info", title: "" })
  const toastTimer = useRef<number | null>(null)
  function showToast(kind: ToastKind, title: string, desc?: string, ms = 3200) {
    setToast({ open: true, kind, title, desc })
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast((t) => ({ ...t, open: false })), ms)
  }

  const cards = useMemo<PrefCard[]>(
    () => [
      {
        key: "info",
        category: "Genel",
        title: "Çerez tercihlerini yönet",
        desc:
          "Aşağıdaki seçeneklerle hangi çerez türlerine izin verdiğini belirleyebilirsin. Zorunlu çerezler siteyi çalıştırmak için gereklidir.",
        bullets: ["Tercihler cihazında saklanır (localStorage).", "İstediğin zaman güncelleyebilirsin.", "Detay: Çerez Politikası sayfasında."],
        icon: <Cookie className="h-4 w-4" />,
      },
      {
        key: "necessary",
        category: "Zorunlu",
        title: "Zorunlu çerezler",
        desc: "Oturum ve güvenlik gibi temel işlevler için gereklidir. Kapatılamaz.",
        bullets: ["Oturum yönetimi", "Güvenlik / CSRF", "Temel altyapı tercihleri"],
        icon: <Lock className="h-4 w-4" />,
        locked: true,
      },
      {
        key: "analytics",
        category: "Analitik",
        title: "Analitik çerezleri",
        desc: "Ürün performansını ölçmemize ve hataları anlamamıza yardımcı olur (tercihe bağlı).",
        bullets: ["Sayfa performansı", "Anonim istatistikler", "Hata/çökme analizi (varsa)"],
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        key: "preferences",
        category: "Tercih",
        title: "Tercih çerezleri",
        desc: "Tema/dil gibi kişiselleştirmeleri hatırlamak için kullanılır (tercihe bağlı).",
        bullets: ["Tema", "Dil", "UI seçimleri"],
        icon: <Settings className="h-4 w-4" />,
      },
      {
        key: "marketing",
        category: "Pazarlama",
        title: "Pazarlama çerezleri",
        desc: "Kampanya ölçümü ve kişiselleştirilmiş reklam amaçlı olabilir (tercihe bağlı).",
        bullets: ["Kampanya ölçümü", "Yeniden hedefleme (varsa)", "Reklam etkinliği (varsa)"],
        icon: <Shield className="h-4 w-4" />,
      },
    ],
    []
  )

  const categories = useMemo<Category[]>(() => ["Genel", "Zorunlu", "Analitik", "Tercih", "Pazarlama", "Üçüncü Taraf"], [])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return cards.filter((it) => {
      const catOk = category === "Tümü" ? true : it.category === category
      const qOk =
        !qq ||
        it.title.toLowerCase().includes(qq) ||
        it.desc.toLowerCase().includes(qq) ||
        it.category.toLowerCase().includes(qq) ||
        it.bullets.some((b) => b.toLowerCase().includes(qq))
      return catOk && qOk
    })
  }, [cards, category, q])

  function setAll(v: boolean) {
    setPrefs((p) => ({
      ...p,
      necessary: true,
      analytics: v,
      preferences: v,
      marketing: v,
      updatedAt: nowTR(),
    }))
  }

  const changed = useMemo(() => {
    const saved = safeJsonParse<ConsentState | null>(typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null, null)
    if (!saved) return true
    return (
      saved.analytics !== prefs.analytics ||
      saved.preferences !== prefs.preferences ||
      saved.marketing !== prefs.marketing
    )
  }, [prefs])

  function save() {
    const next: ConsentState = { ...prefs, necessary: true, updatedAt: nowTR() }
    setPrefs(next)
    savePrefs(next)
    showToast("success", "Tercihler kaydedildi", "Çerez izinlerin güncellendi.")
  }

  function resetFromSaved() {
    const loaded = loadPrefs()
    setPrefs(loaded)
    showToast("info", "Geri yüklendi", "Kayıtlı tercihler geri yüklendi.")
  }

  const score = (prefs.analytics ? 1 : 0) + (prefs.preferences ? 1 : 0) + (prefs.marketing ? 1 : 0)
  const label =
    score === 0 ? "Sadece Zorunlu" : score === 1 ? "Minimum" : score === 2 ? "Dengeli" : "Tümü Açık"

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      <Toast state={toast} onClose={() => setToast((t) => ({ ...t, open: false }))} />

      {/* GLOBAL KEYFRAMES */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BG */}
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

      {/* TOP BAND */}
      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-6 py-2.5 lg:px-10 2xl:px-14">
          <div className="text-sm">
            Çerez Tercihleri • <span className="ml-2 text-white/70">kontrol sende</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Kısayol: <span className="font-semibold text-white">⌘K / Ctrl+K</span> → Ara
          </div>
        </div>
      </div>

<PublicTopbar
  subtitle="Şikayetler"
  showSearchStub={false} // istersen true (detay sayfasında input stub)
  nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
/>


      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 lg:px-10 2xl:px-14">
        {/* HEADER */}
        <section className="pt-8">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Zorunlu • Analitik • Tercih • Pazarlama
              </div>
              <h1 className="mt-4 text-[36px] font-semibold tracking-tight text-white md:text-[44px]">
                Çerez Tercihleri
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Hangi çerez türlerine izin verdiğini seç. Zorunlu çerezler kapatılamaz.
              </p>
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
                    placeholder="Analitik, pazarlama, tercih…"
                    className="h-[46px] w-full bg-transparent pr-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <CategoryDropdown value={category} onChange={setCategory} categories={categories} />
              </div>
            </div>
          </div>

          {/* CTA BAR */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <Shield className="h-4 w-4 text-emerald-300" />
              Son kayıt: <span className="font-semibold text-white/80">{prefs.updatedAt}</span> • Profil:{" "}
              <span className="font-semibold text-white/80">{label}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PillButton
                variant="ghost"
                onClick={() => {
                  setAll(false)
                  showToast("info", "Tümünü reddet", "Sadece zorunlu çerezler açık.")
                }}
              >
                <XCircle className="h-4 w-4" />
                Tümünü Reddet
              </PillButton>

              <PillButton
                variant="ghost"
                onClick={() => {
                  setAll(true)
                  showToast("info", "Tümünü kabul et", "Analitik + Tercih + Pazarlama açıldı.")
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Tümünü Kabul Et
              </PillButton>

              <PillButton variant="secondary" onClick={save} disabled={!changed}>
                <BadgeCheck className="h-4 w-4" />
                Kaydet
                <ArrowRight className="h-4 w-4" />
              </PillButton>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8">
            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 text-center text-white/70 backdrop-blur">
                Sonuç bulunamadı. Arama/filtreyi değiştirip tekrar dene.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filtered.map((c) => (
                  <Card
                    key={c.title}
                    item={c}
                    enabled={
                      c.key === "info"
                        ? undefined
                        : c.key === "necessary"
                        ? true
                        : prefs[c.key as ConsentKey]
                    }
                    onToggle={
                      c.key === "analytics" || c.key === "preferences" || c.key === "marketing"
                        ? (v) =>
                            setPrefs((p) => ({
                              ...p,
                              necessary: true,
                              [c.key]: v,
                              updatedAt: nowTR(),
                            }))
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            <div className="mt-8 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Detay</div>
                  <div className="mt-1 text-sm text-white/65">
                    Hangi çerezlerin kullanıldığı / sağlayıcı listesi için “Çerez Politikası” sayfasına bakabilirsin.
                  </div>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <Info className="h-5 w-5 text-indigo-200" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <PillLink href="/cerez-politikasi" variant="ghost">
                  Çerez Politikası
                </PillLink>
                <PillLink href="/gizlilik" variant="ghost">
                  Gizlilik
                </PillLink>
                <PillButton variant="ghost" onClick={resetFromSaved}>
                  <RotateCcw className="h-4 w-4" />
                  Kayıtlıya Dön
                </PillButton>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="sticky top-[96px] space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Seçim özeti</div>
                    <div className="mt-1 text-sm text-white/65">Anlık durum</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Cookie className="h-5 w-5 text-emerald-200" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    { t: "Zorunlu", v: true, i: <Lock className="h-4 w-4" /> },
                    { t: "Analitik", v: prefs.analytics, i: <BarChart3 className="h-4 w-4" /> },
                    { t: "Tercih", v: prefs.preferences, i: <Settings className="h-4 w-4" /> },
                    { t: "Pazarlama", v: prefs.marketing, i: <Shield className="h-4 w-4" /> },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white/85">
                          {x.i}
                        </span>
                        <div className="text-sm font-semibold text-white/85">{x.t}</div>
                      </div>

                      <span
                        className={cx(
                          "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                          x.v ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/10 text-white/70"
                        )}
                      >
                        {x.v ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {x.v ? "AÇIK" : "KAPALI"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                  <div className="font-semibold text-white/80">Profil: {label}</div>
                  <div className="mt-1">
                    Bu profil, seçtiğin opsiyonlara göre basit bir özet gösterimidir.
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <PillButton variant="secondary" onClick={save} disabled={!changed}>
                    <BadgeCheck className="h-4 w-4" />
                    Kaydet
                  </PillButton>
                  <PillLink href="/cerez-politikasi" variant="ghost">
                    Detayları Gör
                    <ArrowRight className="h-4 w-4" />
                  </PillLink>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                    <Info className="h-5 w-5 text-indigo-200" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">Not</div>
                    <div className="mt-1 text-sm text-white/65">
                      Bu sayfa şu an localStorage ile çalışır. İstersen backend’e bağlayıp kullanıcı bazlı da saklarız.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Kısayollar</div>
                <div className="mt-3 flex flex-col gap-2">
                  <PillButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    Yukarı çık
                  </PillButton>
                  <PillLink href="/gizlilik" variant="ghost">
                    Gizlilik
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
            Tercihlerin cihazında saklanır. (LS: <span className="font-semibold text-white/75">{LS_KEY}</span>)
          </div>
          <div className="flex items-center gap-2">
            <PillLink href="/cerez-politikasi" variant="ghost">
              Çerez Politikası
            </PillLink>
            <PillLink href="/kvkk" variant="ghost">
              KVKK
            </PillLink>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
