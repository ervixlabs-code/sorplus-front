// app/kayit/page.tsx
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import clsx from "clsx"
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  BadgeCheck,
  Info,
} from "lucide-react"
import Footer from "@/components/Footer"

const LS_SIGNUP_EMAIL_KEY = "signup_email_remembered_v1"
const LS_AUTH_TOKEN_KEY = "sv_auth_token_v1"
const LS_AUTH_USER_KEY = "sv_auth_user_v1"

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3002").replace(/\/+$/, "")

function PillButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "ghost" | "white"
  type?: "button" | "submit"
  disabled?: boolean
  className?: string
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4 disabled:opacity-60 disabled:cursor-not-allowed"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/30"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/30"
      : variant === "white"
      ? "bg-white text-black shadow-sm hover:bg-white/90 focus:ring-white/30"
      : "border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/15 focus:ring-white/15"

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

function Field({
  label,
  icon,
  children,
  hint,
}: {
  label: string
  icon: React.ReactNode
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px] font-light text-white/55">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/10">
          {icon}
        </span>
        {label}
      </div>
      {children}
      {hint ? <div className="mt-2 text-[12px] text-white/55">{hint}</div> : null}
    </div>
  )
}

type NoticeKind = "info" | "error" | "success"
function Notice({
  kind,
  children,
}: {
  kind: NoticeKind
  children: React.ReactNode
}) {
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

function pickErrorMessage(anyErr: any): string {
  if (!anyErr) return "Bir hata oluştu."
  if (typeof anyErr === "string") return anyErr
  if (anyErr?.message) {
    if (Array.isArray(anyErr.message)) return anyErr.message.join(" • ")
    if (typeof anyErr.message === "string") return anyErr.message
  }
  if (anyErr?.error) return String(anyErr.error)
  return "Bir hata oluştu."
}

function normalizeCityInput(v: string) {
  return v.replace(/\s+/g, " ").trim()
}

function normalizePhoneInput(raw: string) {
  // Kullanıcı rahat girsin diye boşluk/()- temizliyoruz
  const cleaned = raw.replace(/[^\d+]/g, "")
  return cleaned
}

function isValidE164(phone: string) {
  return /^\+\d{10,15}$/.test(phone)
}

export default function Page() {
  const router = useRouter()
  const sp = useSearchParams()
  const nextUrl = useMemo(() => sp.get("next") || "/", [sp])

  const nameRef = useRef<HTMLInputElement | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  // ✅ NEW
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")

  const [pass, setPass] = useState("")
  const [pass2, setPass2] = useState("")
  const [show, setShow] = useState(false)

  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(LS_SIGNUP_EMAIL_KEY)
      if (remembered) setEmail(remembered)
    } catch {}
    nameRef.current?.focus()
  }, [])

  const validate = () => {
    if (!firstName.trim()) return "Ad alanı zorunlu."
    if (!lastName.trim()) return "Soyad alanı zorunlu."
    const em = email.trim()
    if (!em || !em.includes("@")) return "Lütfen geçerli bir e-posta adresi gir."

    // ✅ NEW validations
    const ph = normalizePhoneInput(phone)
    if (!ph) return "Telefon alanı zorunlu."
    if (!isValidE164(ph)) return "Telefon formatı geçersiz. Örn: +905551112233"

    const ct = normalizeCityInput(city)
    if (!ct) return "Şehir alanı zorunlu."

    if (!pass || pass.length < 6) return "Şifre en az 6 karakter olmalı."
    if (pass !== pass2) return "Şifreler uyuşmuyor."
    if (!agree) return "Devam etmek için Kurallar ve KVKK onayı gerekli."
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setNotice(null)

    const v = validate()
    if (v) return setErr(v)

    setLoading(true)
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: normalizePhoneInput(phone),
        city: normalizeCityInput(city),
        password: pass,
        passwordConfirm: pass2,
        kvkkAccepted: true,
      }

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw data || { message: `Kayıt başarısız (${res.status})` }
      }

      const accessToken = data?.accessToken
      const user = data?.user

      if (!accessToken || !user) {
        throw { message: "Sunucudan beklenmeyen cevap geldi." }
      }

      try {
        localStorage.setItem(LS_SIGNUP_EMAIL_KEY, email.trim())
      } catch {}

      try {
        localStorage.setItem(LS_AUTH_TOKEN_KEY, accessToken)
        localStorage.setItem(LS_AUTH_USER_KEY, JSON.stringify(user))
      } catch {}

      setNotice("Kayıt başarılı ✅ Yönlendiriliyorsun…")
      router.replace(nextUrl || "/")
    } catch (e2: any) {
      setErr(pickErrorMessage(e2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 🌌 BG */}
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

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/10 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-10 2xl:px-14">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-base font-extrabold tracking-tight text-white">
                Deneyim
              </div>
              <div className="text-[11px] text-white/60">Kayıt</div>
            </div>
          </Link>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <PillButton
              variant="ghost"
              onClick={() => router.push(`/giris?next=${encodeURIComponent(nextUrl)}`)}
              className="shrink-0 px-3 py-2 text-[13px]"
              disabled={loading}
            >
              Giriş
            </PillButton>
            <PillButton
              variant="secondary"
              onClick={() => router.push("/sikayet-yaz")}
              className="shrink-0 px-3 py-2 text-[13px]"
              disabled={loading}
            >
              Şikayet Yaz
            </PillButton>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-5">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur sm:w-auto sm:justify-start">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Hesap oluştur • daha fazla etkileşim
            </div>

            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[44px] md:text-[52px]">
              Topluluğa katıl
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Kayıt olunca yorumlar, “Ben de yaşadım” ve içerik takibi aktif olur. İstersen daha sonra
              görünür adını düzenleyebilirsin.
            </p>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <BadgeCheck className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white/90">Premium deneyim</div>
                  <div className="mt-1 text-sm text-white/65">
                    Favoriler, kişisel sayfa ve filtrelenmiş akış gibi modüller hesabınla birlikte açılır.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/65">
              <div className="font-semibold text-white/80">API</div>
              <div className="mt-1">
                Register: <span className="text-white/85 font-semibold">{API_BASE}/api/auth/register</span>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur sm:rounded-[34px] sm:p-7">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.26),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08) 1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Kayıt Ol</div>
                    <div className="mt-1 text-sm text-white/65">1 dakikada hesabını oluştur.</div>
                  </div>

                  <Link
                    href={`/giris?next=${encodeURIComponent(nextUrl)}`}
                    className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/80 hover:bg-white/15 sm:w-auto sm:py-1.5"
                  >
                    Zaten hesabın var mı? Giriş yap
                  </Link>
                </div>

                {err ? <Notice kind="error">{err}</Notice> : null}
                {notice ? <Notice kind="success">{notice}</Notice> : null}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Ad" icon={<User className="h-3.5 w-3.5 text-white/75" />}>
                      <input
                        ref={nameRef}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Adın"
                        autoComplete="given-name"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                        disabled={loading}
                      />
                    </Field>

                    <Field label="Soyad" icon={<User className="h-3.5 w-3.5 text-white/75" />}>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Soyadın"
                        autoComplete="family-name"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  {/* ✅ NEW: phone + city */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Telefon"
                      icon={<Phone className="h-3.5 w-3.5 text-white/75" />}
                      hint="Örn: +905551112233"
                    >
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+905551112233"
                        inputMode="tel"
                        autoComplete="tel"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                        disabled={loading}
                      />
                    </Field>

                    <Field label="Şehir" icon={<MapPin className="h-3.5 w-3.5 text-white/75" />}>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="İstanbul"
                        autoComplete="address-level2"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <Field label="E-posta" icon={<Mail className="h-3.5 w-3.5 text-white/75" />}>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@domain.com"
                      inputMode="email"
                      autoComplete="email"
                      className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                      disabled={loading}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Şifre"
                      icon={<Lock className="h-3.5 w-3.5 text-white/75" />}
                      hint="En az 6 karakter."
                    >
                      <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <input
                          value={pass}
                          onChange={(e) => setPass(e.target.value)}
                          type={show ? "text" : "password"}
                          placeholder="••••••"
                          autoComplete="new-password"
                          className="h-[52px] w-full bg-transparent px-4 text-sm text-white placeholder:text-white/40 outline-none"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShow((s) => !s)}
                          className="mr-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          aria-label="Şifreyi göster/gizle"
                          disabled={loading}
                        >
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </Field>

                    <Field label="Şifre Tekrar" icon={<Lock className="h-3.5 w-3.5 text-white/75" />}>
                      <input
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        type={show ? "text" : "password"}
                        placeholder="••••••"
                        autoComplete="new-password"
                        className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                        disabled={loading}
                      />
                    </Field>
                  </div>

                  <label className="mt-2 flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10"
                      disabled={loading}
                    />
                    <span className="leading-relaxed">
                      <Link href="/kurallar" className="font-semibold text-white/85 hover:text-white">
                        Kurallar
                      </Link>{" "}
                      ve{" "}
                      <Link href="/kvkk" className="font-semibold text-white/85 hover:text-white">
                        KVKK
                      </Link>{" "}
                      metinlerini okudum, kabul ediyorum.
                      <span className="block text-xs text-white/55">
                        Kayıt sonrası e-posta doğrulaması istenebilir.
                      </span>
                    </span>
                  </label>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <PillButton type="submit" variant="secondary" disabled={loading} className="w-full">
                      {loading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
                      <ArrowRight className="h-4 w-4" />
                    </PillButton>

                    <PillButton
                      variant="ghost"
                      onClick={() => router.push(`/giris?next=${encodeURIComponent(nextUrl)}`)}
                      disabled={loading}
                      className="w-full"
                    >
                      Giriş’e dön
                    </PillButton>
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div className="leading-relaxed">
                      Bilgilerin güvenli şekilde işlenir. Spam/istismar için kayıtlar gerektiğinde
                      kısıtlanabilir.
                    </div>
                  </div>
                </form>
              </div>

              <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-14 -bottom-14 h-44 w-44 rounded-full bg-emerald-500/12 blur-3xl" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
