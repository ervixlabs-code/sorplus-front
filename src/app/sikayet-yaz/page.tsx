// app/sikayet-yaz/page.tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import clsx from "clsx"
import {
  Sparkles,
  Shield,
  BadgeCheck,
  Eye,
  Lock,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Info,
  AlertTriangle,
} from "lucide-react"
import Footer from "@/components/Footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== API ================== */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3002").replace(/\/+$/, "")
const LS_AUTH_TOKEN_KEY = "sv_auth_token_v1"

function getAccessToken() {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(LS_AUTH_TOKEN_KEY) || ""
  } catch {
    return ""
  }
}

function toGirisUrl(nextPath: string) {
  return `/giris?next=${encodeURIComponent(nextPath)}`
}

/* ================== TYPES ================== */
type Step = 1 | 2 | 3

type ApiCategory = {
  id: string // ✅ UUID
  name: string
  isActive?: boolean
}

type ComplaintDraft = {
  categoryId: string | null // ✅ UUID
  title: string
  detail: string
  anonymous: boolean
  brandName: string
  attachments: File[]
  acceptRules: boolean
}

/* ================== HELPERS ================== */
function formatTR(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR").format(n)
  } catch {
    return String(n)
  }
}

function isUUID(v?: string | null) {
  if (!v) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

/* ================== SMALL UI ================== */
function PillButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost"
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-55"
  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : variant === "secondary"
      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus:ring-indigo-200/70"
      : "border border-white/10 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/15"

  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(base, styles, className)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.28),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative">{children}</div>
    </div>
  )
}

function CategoryDropdown({
  value,
  onChange,
  categories,
  label = "Kategori",
  loading,
}: {
  value: string | null
  onChange: (v: string | null) => void
  categories: ApiCategory[]
  label?: string
  loading?: boolean
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

  const selectedName = useMemo(() => {
    if (!value) return "Seçiniz…"
    const found = categories.find((c) => c.id === value)
    return found?.name || "Seçiniz…"
  }, [value, categories])

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 text-[11px] font-light text-white/65">{label}</div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex h-[48px] w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/15"
      >
        <span className="truncate">{loading ? "Yükleniyor…" : selectedName}</span>
        <ChevronDown className={clsx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B1020] shadow-xl">
          <div className="max-h-[280px] overflow-auto p-1">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={clsx(
                "w-full rounded-xl px-3 py-2 text-left text-sm",
                !value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
              )}
            >
              Seçiniz…
            </button>

            {categories.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                }}
                className={clsx(
                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                  opt.id === value ? "bg-white/10 text-white" : "hover:bg-white/5 text-white/85"
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

function StepperRow({
  n,
  title,
  subtitle,
  active,
  done,
  onClick,
}: {
  n: number
  title: string
  subtitle?: string
  active: boolean
  done: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        active ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/8"
      )}
    >
      <div
        className={clsx(
          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold",
          done
            ? "bg-emerald-400 text-slate-900"
            : active
            ? "bg-white text-black"
            : "bg-white/10 text-white/70"
        )}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white/90">{title}</div>
        {subtitle ? <div className="text-[11px] text-white/55">{subtitle}</div> : null}
      </div>
    </button>
  )
}

function InfoTile({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white/90">{title}</div>
        <div className="mt-1 text-xs text-white/60">{desc}</div>
      </div>
    </div>
  )
}

function ChatBubble({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={clsx("flex", side === "left" ? "justify-start" : "justify-end")}>
      <div
        className={clsx(
          "max-w-[560px] rounded-[22px] border px-4 py-3 text-sm leading-relaxed shadow-sm",
          side === "left"
            ? "border-white/10 bg-white/10 text-white/85"
            : "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
        )}
      >
        {children}
      </div>
    </div>
  )
}

type NoticeKind = "info" | "error" | "success"
function Notice({ kind, children }: { kind: NoticeKind; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "border-orange-400/20 bg-orange-400/10 text-orange-100"
      : kind === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-white/80"

  const Icon = kind === "error" ? AlertTriangle : Info

  return (
    <div className={clsx("mt-4 flex items-start gap-2 rounded-2xl border p-4 text-sm", styles)}>
      <Icon className="mt-0.5 h-4 w-4" />
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [draft, setDraft] = useState<ComplaintDraft>({
    categoryId: null,
    title: "",
    detail: "",
    anonymous: false,
    brandName: "",
    attachments: [],
    acceptRules: false,
  })

  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [notice, setNotice] = useState<{ kind: NoticeKind; text: string } | null>(null)

  const stats = useMemo(
    () => ({
      total: 4202003,
      today: 128,
    }),
    []
  )

  const stepTitle = step === 1 ? "Şikayet Detayı" : step === 2 ? "Marka (Opsiyonel)" : "Belge / Onay"

  useEffect(() => {
    ;(async () => {
      setLoadingCats(true)
      try {
        const res = await fetch(`${API_BASE}/api/categories`, { cache: "no-store" })
        if (!res.ok) throw new Error(`Categories failed: ${res.status}`)
        const data = await res.json()

        const list: ApiCategory[] = Array.isArray(data) ? data : data?.items || data?.data || []
        const normalized = list
          .filter((c) => c && c.name && c.id)
          .map((c) => ({ ...c, id: String(c.id) }))
          .filter((c) => isUUID(c.id))

        setCategories(normalized)

        // Eğer hiç UUID yoksa backend yanlış response dönüyor demektir
        if (normalized.length === 0) {
          setNotice({
            kind: "error",
            text: "Kategori id’leri UUID değil geliyor. Backend DTO categoryId UUID istiyor. /api/categories response’unu kontrol et.",
          })
        }
      } catch (e) {
        console.error(e)
        setCategories([])
        setNotice({ kind: "error", text: "Kategoriler alınamadı. Backend açık mı? (/api/categories)" })
      } finally {
        setLoadingCats(false)
      }
    })()
  }, [])

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!draft.categoryId) e.categoryId = "Bir kategori seç."
      else if (!isUUID(draft.categoryId)) e.categoryId = "Kategori id UUID olmalı."
      if (draft.title.trim().length < 6) e.title = "Başlık en az 6 karakter olmalı."
      if (draft.detail.trim().length < 40) e.detail = "Detay en az 40 karakter olmalı."
    }
    if (step === 3) {
      if (!draft.acceptRules) e.acceptRules = "Devam etmek için kuralları onayla."
    }
    return e
  }, [draft, step])

  const canNext = useMemo(() => {
    if (step === 1) return !errors.categoryId && !errors.title && !errors.detail
    if (step === 2) return true
    if (step === 3) return !errors.acceptRules
    return false
  }, [errors, step])

  const goNext = () => {
    setNotice(null)
    setStep((s) => (Math.min(3, s + 1) as Step))
  }
  const goPrev = () => {
    setNotice(null)
    setStep((s) => (Math.max(1, s - 1) as Step))
  }

  const onSubmit = async () => {
    if (!canNext) return

    const token = getAccessToken()
    if (!token) {
      setNotice({ kind: "error", text: "Oturum bulunamadı. Lütfen giriş yapıp tekrar dene." })
      router.push(toGirisUrl("/sikayet-yaz"))
      return
    }

    // ✅ Backend DTO boolean istiyor → JSON göndereceğiz
    // ✅ Backend categoryId UUID istiyor → categoryId ile göndereceğiz
    // ⚠️ Attachments varsa multipart gerekir ama backend boolean parse etmiyor → şimdilik kısıt
    if (draft.attachments.length > 0) {
      setNotice({
        kind: "error",
        text: "Şimdilik dosya ekleme kapalı. Backend multipart/form-data içinde boolean alanları kabul etmiyor. (anonymous/acceptRules) Önce backend’i düzeltelim.",
      })
      return
    }

    setLoadingSubmit(true)
    setNotice(null)

    try {
      const body = {
        categoryId: draft.categoryId, // ✅ only this
        title: draft.title.trim(),
        detail: draft.detail.trim(),
        anonymous: !!draft.anonymous, // ✅ boolean
        brandName: draft.brandName.trim() || undefined,
        acceptRules: !!draft.acceptRules, // ✅ boolean
      }

      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })

      if (res.status === 401 || res.status === 403) {
        setNotice({ kind: "error", text: "Yetkin yok / token süresi dolmuş. Tekrar giriş yap." })
        router.push(toGirisUrl("/sikayet-yaz"))
        return
      }

      const payload = await res.json().catch(() => null)

      if (!res.ok) {
        const msg =
          payload?.message?.[0] ||
          payload?.message ||
          payload?.error ||
          `Şikayet gönderilemedi (HTTP ${res.status}).`
        setNotice({ kind: "error", text: String(msg) })
        return
      }

      setNotice({ kind: "success", text: "Şikayet gönderildi ✅ Moderasyon sonrası yayınlanacak." })

      setDraft({
        categoryId: null,
        title: "",
        detail: "",
        anonymous: false,
        brandName: "",
        attachments: [],
        acceptRules: false,
      })
      setStep(1)
    } catch (e) {
      console.error(e)
      setNotice({ kind: "error", text: "Bir şeyler ters gitti. Backend'e ulaşılamadı." })
    } finally {
      setLoadingSubmit(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      <style jsx global>{`
        @keyframes floaty {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
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

      {/* TOP INFO */}
      <div className="border-b border-white/10 bg-[#1F2333] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10 2xl:px-14">
          <div className="min-w-0 text-sm">
            <span className="text-white/80">Toplam paylaşım</span>{" "}
            <span className="ml-2 text-lg font-extrabold text-emerald-300">{formatTR(stats.total)}</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Bugün: <span className="font-semibold text-white">{formatTR(stats.today)}</span>
          </div>
        </div>
      </div>

      <PublicTopbar
          subtitle="Şikayetler"
          showSearchStub={false} // istersen true (detay sayfasında input stub)
          nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
        />

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          {/* LEFT */}
          <div className="lg:col-span-4">
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white/90">Şikayet Oluştur</div>
                  <div className="mt-1 text-xs text-white/60">
                    {step}/3 • {stepTitle}
                  </div>
                </div>
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/90"
                  style={{ animation: "floaty 6s ease-in-out infinite" }}
                >
                  <Shield className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <StepperRow n={1} title="Şikayet Detayı" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
                <StepperRow n={2} title="Marka" subtitle="opsiyonel" active={step === 2} done={step > 2} onClick={() => setStep(2)} />
                <StepperRow n={3} title="Belge / Onay" active={step === 3} done={false} onClick={() => setStep(3)} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <InfoTile icon={<Lock className="h-4 w-4 text-emerald-300" />} title="Kişisel veriler paylaşma" desc="Telefon, TC, adres gibi bilgileri yazma." />
                <InfoTile icon={<BadgeCheck className="h-4 w-4 text-indigo-300" />} title="Kategori bazlı akış" desc="Paylaşımlar kategoriye göre listelenir." />
                <InfoTile icon={<Eye className="h-4 w-4 text-orange-300" />} title="Anonim paylaşım" desc="İstersen adın görünmeden yayınlanır." />
              </div>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-white/5 p-4 text-xs text-white/65">
                <div className="font-semibold text-white/80">Platform</div>
                <div className="mt-2 text-[12px] text-white/60">
                  Paylaşım sayıları ve topluluk verileri yakında gerçek zamanlı gösterilecek.
                </div>
              </div>
            </GlassCard>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8">
            <div className="mb-6 space-y-3" style={{ animation: "popIn 420ms ease-out both" }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Deneyim Asistanı
              </div>

              <div className="space-y-2">
                <ChatBubble side="left">Yaşadığın problemi birkaç adımda netleştirelim. ✨</ChatBubble>
                <ChatBubble side="left">Başlık kısa olsun, detayda “ne oldu / ne zaman / sonuç” yazarsan herkes daha iyi anlar.</ChatBubble>
                {step === 2 ? <ChatBubble side="left">İstersen metinde geçen markayı ekleyebilirsin, ama zorunlu değil.</ChatBubble> : null}
                {step === 3 ? (
                  <ChatBubble side="left">Son adım: kuralları onayla. Moderasyon sonrası yayına alınır.</ChatBubble>
                ) : null}
              </div>
            </div>

            <GlassCard className="p-5 sm:p-6 md:p-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs text-white/60">Adım {step}/3</div>
                  <div className="mt-1 text-[24px] sm:text-[26px] font-semibold tracking-tight text-white">{stepTitle}</div>
                  <div className="mt-2 text-sm text-white/70">
                    {step === 1
                      ? "Temeli burada atıyoruz. Bir kere düzgün yazınca gerisi çorap söküğü."
                      : step === 2
                      ? "İstersen marka ekle — zorunlu değil."
                      : "Belgeler opsiyonel. Kuralları onaylayınca gönderime hazır olur."}
                  </div>
                </div>

                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
                  <PillButton variant="ghost" onClick={goPrev} disabled={step === 1} className="shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </PillButton>

                  {step < 3 ? (
                    <PillButton variant="primary" onClick={goNext} disabled={!canNext} className="shrink-0">
                      Devam Et
                      <ArrowRight className="h-4 w-4" />
                    </PillButton>
                  ) : (
                    <PillButton variant="secondary" onClick={onSubmit} disabled={!canNext || loadingSubmit} className="shrink-0">
                      <Check className="h-4 w-4" />
                      {loadingSubmit ? "Gönderiliyor…" : "Şikayeti Gönder"}
                    </PillButton>
                  )}
                </div>
              </div>

              {notice ? <Notice kind={notice.kind}>{notice.text}</Notice> : null}

              <div className="mt-6">
                {step === 1 ? (
                  <div className="space-y-5" style={{ animation: "popIn 280ms ease-out both" }}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <CategoryDropdown
                          value={draft.categoryId}
                          onChange={(v) => setDraft((d) => ({ ...d, categoryId: v }))}
                          categories={categories}
                          label="Kategori"
                          loading={loadingCats}
                        />
                        {errors.categoryId ? <div className="mt-2 text-[12px] text-orange-200">{errors.categoryId}</div> : null}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <div className="text-[11px] font-light text-white/65">Hızlı özet</div>
                        <div className="mt-2 text-sm text-white/85">
                          <span className="text-white/60">Anonim:</span>{" "}
                          <span className="font-semibold">{draft.anonymous ? "Evet" : "Hayır"}</span>
                        </div>
                        <div className="mt-1 text-sm text-white/85">
                          <span className="text-white/60">Detay uzunluğu:</span>{" "}
                          <span className="font-semibold">{formatTR(draft.detail.trim().length)} karakter</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-[11px] font-light text-white/65">Başlık</div>
                      <input
                        value={draft.title}
                        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        placeholder="Kısa ve net bir başlık yaz…"
                        maxLength={80}
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
                      />
                      {errors.title ? <div className="mt-2 text-[12px] text-orange-200">{errors.title}</div> : null}
                    </div>

                    <div>
                      <div className="mb-1 text-[11px] font-light text-white/65">Detay</div>
                      <textarea
                        value={draft.detail}
                        onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))}
                        placeholder="Ne oldu? Ne zaman oldu? Süreç nasıl ilerledi? Sonuç neydi?"
                        className="min-h-[180px] w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm text-white placeholder:text-white/45 shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
                      />
                      {errors.detail ? <div className="mt-2 text-[12px] text-orange-200">{errors.detail}</div> : null}
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={draft.anonymous}
                        onChange={(e) => setDraft((d) => ({ ...d, anonymous: e.target.checked }))}
                        className="h-4 w-4 accent-emerald-400"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white/90">Anonim paylaş</div>
                        <div className="text-[12px] text-white/60">Adın görünmeden yayınlanır.</div>
                      </div>
                    </label>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-5" style={{ animation: "popIn 280ms ease-out both" }}>
                    <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                      <div className="text-sm font-semibold text-white/90">Marka eklemek ister misin?</div>
                      <div className="mt-1 text-sm text-white/65">Zorunlu değil. İstersen metinde geçen markayı burada da yazabilirsin.</div>

                      <div className="mt-4">
                        <div className="mb-1 text-[11px] font-light text-white/65">Marka adı (opsiyonel)</div>
                        <input
                          value={draft.brandName}
                          onChange={(e) => setDraft((d) => ({ ...d, brandName: e.target.value }))}
                          placeholder="Örn: ..."
                          className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-5" style={{ animation: "popIn 280ms ease-out both" }}>
                    <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white/90">Belge / ekran görüntüsü ekle</div>
                          <div className="mt-1 text-sm text-white/65">
                            Şimdilik kapalı (backend multipart boolean parse etmiyor).
                          </div>
                        </div>
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/90">
                          <Upload className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <input
                          type="file"
                          multiple
                          disabled
                          className="block w-full cursor-not-allowed text-sm text-white/50 file:mr-3 file:rounded-full file:border-0 file:bg-white/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black/40"
                        />
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-[28px] border border-white/10 bg-white/10 p-5">
                      <input
                        type="checkbox"
                        checked={draft.acceptRules}
                        onChange={(e) => setDraft((d) => ({ ...d, acceptRules: e.target.checked }))}
                        className="mt-1 h-4 w-4 accent-emerald-400"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white/90">
                          <Link href="/kurallar" className="hover:text-white underline underline-offset-4">
                            Kuralları
                          </Link>{" "}
                          okudum ve onaylıyorum
                        </div>
                        {errors.acceptRules ? <div className="mt-2 text-[12px] text-orange-200">{errors.acceptRules}</div> : null}
                      </div>
                    </label>
                  </div>
                ) : null}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
