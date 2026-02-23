// app/iletisim/page.tsx
"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  LogIn,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"

import Footer from "@/components/Footer"

import PublicTopbar from "@/components/PublicTopbar"

type Topic =
  | "Genel"
  | "Moderasyon"
  | "Gizlilik & KVKK"
  | "Teknik"
  | "Basın"
  | "İş Birliği"

function PillButton({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "white"
  className?: string
  type?: "button" | "submit"
  disabled?: boolean
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : variant === "white"
      ? "bg-white text-black shadow-sm hover:bg-white/90 focus:ring-white/30"
      : "border border-white/15 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/20"

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, styles, className)}
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

function IconCircleButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.99]",
        className
      )}
    >
      {children}
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold tracking-wide text-white/65">{children}</div>
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[50px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: Topic
  onChange: (v: Topic) => void
  options: Topic[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Topic)}
      className="h-[50px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-sm text-white shadow-sm backdrop-blur focus:outline-none focus:ring-4 focus:ring-white/15"
    >
      {options.map((o) => (
        <option key={o} value={o} className="bg-[#0B1020]">
          {o}
        </option>
      ))}
    </select>
  )
}

export default function Page() {
  const router = useRouter()

  const goHome = () => router.push("/")
  const goWrite = () => router.push("/sikayet-yaz")
  const goList = () => router.push("/sikayetler")
  const goRules = () => router.push("/kurallar")
  const goGuide = () => router.push("/rehber")
  const goFaq = () => router.push("/sss")

  const topics: Topic[] = useMemo(
    () => ["Genel", "Moderasyon", "Gizlilik & KVKK", "Teknik", "Basın", "İş Birliği"],
    []
  )

  const [topic, setTopic] = useState<Topic>("Genel")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [consent, setConsent] = useState(true)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const canSend = name.trim().length >= 2 && email.includes("@") && message.trim().length >= 10 && consent

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSend) return
    setSending(true)

    // ✅ Şimdilik demo: backend yok. İleride /api/contact gibi endpoint’e POST bağlarız.
    await new Promise((r) => setTimeout(r, 650))

    setSending(false)
    setSent(true)
    setName("")
    setEmail("")
    setMessage("")
    setTopic("Genel")
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
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
            İletişim • <span className="ml-2 text-white/70">Destek ve geri bildirim</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            Hızlı yardım → <span className="font-semibold text-white">SSS</span> &nbsp;•&nbsp; <span className="font-semibold text-white">Kurallar</span>
          </div>
        </div>
      </div>

      <PublicTopbar
        subtitle="Şikayetler"
        showSearchStub={false} // istersen true (detay sayfasında input stub)
        nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
      />

      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-8 lg:px-10 2xl:px-14">
        {/* BREADCRUMB + META */}
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
            <MetaPill icon={<LifeBuoy className="h-4 w-4" />} label="Destek" />
            <MetaPill icon={<Shield className="h-4 w-4" />} label="Moderasyon odaklı" />
            <MetaPill icon={<BadgeCheck className="h-4 w-4" />} label="Kategori bazlı" />
          </div>
        </div>

        {/* HERO */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.28),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Yardım & İletişim
                </div>

                <h1 className="mt-4 text-[34px] font-extrabold leading-[1.08] tracking-tight text-white md:text-[44px]">
                  Bize Ulaş
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
                  Geri bildirim, teknik sorun, moderasyon talebi veya iş birliği… doğru başlığı seç ve mesajını bırak.
                  <span className="ml-2 text-white/60">Demo moddayız; gönderim şimdilik simüle edilir.</span>
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PillButton variant="secondary" onClick={goFaq}>
                    <HelpCircle className="h-4 w-4" />
                    SSS
                  </PillButton>
                  <PillButton variant="ghost" onClick={goRules}>
                    <Shield className="h-4 w-4" />
                    Kurallar
                  </PillButton>
                  <PillButton variant="ghost" onClick={goGuide}>
                    <BadgeCheck className="h-4 w-4" />
                    Rehber
                  </PillButton>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div>
                      <div className="font-semibold text-white/80">İpucu</div>
                      <div className="mt-1">
                        Şikayet içeriğiyle ilgili bir konuysa önce <span className="text-white/80">Kurallar</span> ve{" "}
                        <span className="text-white/80">Rehber</span>’e bakmak işleri hızlandırır.
                      </div>
                    </div>
                  </div>
                </div>

                {sent ? (
                  <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-white/80">
                    <div className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                      <div>
                        <div className="font-semibold text-white">Mesajın alındı (demo) 🎉</div>
                        <div className="mt-1 text-white/70">
                          Prod’da burayı backend’e bağlayıp sana “ticket id” döndüreceğiz.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-[96px] space-y-5">
              {/* Contact cards */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Hızlı iletişim</div>
                    <div className="mt-1 text-sm text-white/65">Güncel kanallar (demo).</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Mail className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/85">
                      <Mail className="h-4 w-4" />
                      support@deneyim.app
                    </div>
                    <IconCircleButton
                      aria-label="Kopyala"
                      title="Kopyala"
                      onClick={() => navigator.clipboard?.writeText("support@deneyim.app")}
                    >
                      <ExternalLink className="h-4 w-4 text-white/70" />
                    </IconCircleButton>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/85">
                      <Phone className="h-4 w-4" />
                      +90 (212) 000 00 00
                    </div>
                    <div className="text-xs text-white/50">Yakında</div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/85">
                      <MapPin className="h-4 w-4" />
                      İstanbul • Türkiye
                    </div>
                    <div className="text-xs text-white/50">Merkez</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
                  KVKK/Gizlilik talebi varsa “Gizlilik & KVKK” başlığını seçip mümkün olduğunca net yaz.
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Hızlı aksiyon</div>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={goWrite}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/85 hover:bg-black/30"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Şikayet Yaz
                    </span>
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </button>

                  <button
                    type="button"
                    onClick={goList}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/85 hover:bg-black/30"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Şikayetleri Gör
                    </span>
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/giris")}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-white/85 hover:bg-black/30"
                  >
                    <span className="inline-flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Giriş Yap / Üye Ol
                    </span>
                    <ExternalLink className="h-4 w-4 text-white/60" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FORM + SIDE */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_90%_30%,rgba(16,185,129,0.12),transparent_55%)]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Mesaj Gönder</div>
                    <div className="mt-1 text-sm text-white/65">
                      Doğru başlık seçersen geri dönüş daha hızlı olur.
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <MessageSquare className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>

                <form onSubmit={onSubmit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel>Ad Soyad</FieldLabel>
                      <Input value={name} onChange={setName} placeholder="örn: Ali Veli" />
                    </div>

                    <div className="space-y-2">
                      <FieldLabel>E-posta</FieldLabel>
                      <Input value={email} onChange={setEmail} placeholder="örn: ali@ornek.com" type="email" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Konu</FieldLabel>
                    <Select value={topic} onChange={setTopic} options={topics} />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Mesaj</FieldLabel>
                    <Textarea
                      value={message}
                      onChange={setMessage}
                      placeholder="Kısaca durumu anlat. (örn: Şu sayfada şu hata oluyor / Moderasyon talebim var / KVKK talebi...)"
                    />
                    <div className="text-[11px] text-white/50">
                      Minimum 10 karakter • Kişisel veri (TC, IBAN, adres, telefon) paylaşma.
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-emerald-400"
                    />
                    <div>
                      <div className="font-semibold text-white/85">Onay</div>
                      <div className="mt-1 text-white/60">
                        Mesajımın destek amacıyla incelenmesini kabul ediyorum. KVKK detayları için{" "}
                        <Link href="/kurallar" className="underline hover:text-white">
                          Kurallar
                        </Link>{" "}
                        ve{" "}
                        <Link href="/sss" className="underline hover:text-white">
                          SSS
                        </Link>{" "}
                        sayfasına bakabilirim.
                      </div>
                    </div>
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-white/55">
                      Demo mod: şimdilik sadece UI. Backend bağlayınca buradan mail/ticket açacağız.
                    </div>
                    <div className="flex items-center gap-2">
                      <PillButton variant="ghost" onClick={goFaq}>
                        <HelpCircle className="h-4 w-4" />
                        SSS
                      </PillButton>
                      <PillButton
                        variant="primary"
                        type="submit"
                        disabled={!canSend || sending}
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "Gönderiliyor..." : "Gönder"}
                      </PillButton>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar mini FAQ */}
          <div className="lg:col-span-5">
            <div className="space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Sık gelen konular</div>
                    <div className="mt-1 text-sm text-white/65">Önce buraya bakmak zaman kazandırır.</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <HelpCircle className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white/85">Moderasyon talebi nasıl iletilir?</div>
                    <div className="mt-2 text-sm text-white/65">
                      Konu: <span className="text-white/80 font-semibold">Moderasyon</span> seç. Şikayet ID veya linki
                      ekle ve kısa gerekçe yaz.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white/85">KVKK/Gizlilik talebi</div>
                    <div className="mt-2 text-sm text-white/65">
                      Konu: <span className="text-white/80 font-semibold">Gizlilik & KVKK</span>. Talebini net yaz; kişisel
                      veri paylaşma.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white/85">Teknik hata bildirimi</div>
                    <div className="mt-2 text-sm text-white/65">
                      Konu: <span className="text-white/80 font-semibold">Teknik</span>. Tarayıcı + sayfa + hata mesajını
                      yaz (console/network varsa ekle).
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <PillButton variant="ghost" onClick={goRules}>
                    <Shield className="h-4 w-4" />
                    Kurallar
                  </PillButton>
                  <PillButton variant="ghost" onClick={goGuide}>
                    <BadgeCheck className="h-4 w-4" />
                    Rehber
                  </PillButton>
                  <PillButton variant="secondary" onClick={goFaq}>
                    <HelpCircle className="h-4 w-4" />
                    SSS
                  </PillButton>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="text-sm font-semibold text-white/90">Notlar</div>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/65">
                  <li>Bu sayfa, şikayet oluşturma sayfasının yerine geçmez.</li>
                  <li>Şikayet oluşturmak için “Şikayet Yaz” akışını kullan.</li>
                  <li>Aciliyette en hızlı yol: konu seçip net detay yazmak.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-white/60">
            Not: İletişim formu demo. Prod’da backend’e bağlayıp “ticket sistemi”ne çevireceğiz.
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant="ghost" onClick={goHome}>
              Anasayfa
            </PillButton>
            <PillButton variant="secondary" onClick={goWrite}>
              <Plus className="h-4 w-4" />
              Şikayet Yaz
            </PillButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
