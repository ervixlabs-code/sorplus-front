// app/giris/page.tsx
"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import clsx from "clsx"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertTriangle, Info } from "lucide-react"
import Footer from "@/components/Footer"

import PublicTopbar from "@/components/PublicTopbar"

const LS_EMAIL_KEY = "auth_email_remembered_v1"
const LS_AUTH_TOKEN_KEY = "sv_auth_token_v1"
const LS_AUTH_USER_KEY = "sv_auth_user_v1"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3002").replace(/\/+$/, "")

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
    <button type={type} onClick={onClick} disabled={disabled} className={clsx(base, styles, className)}>
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

export default function Page() {
  const router = useRouter()
  const sp = useSearchParams()
  const nextUrl = useMemo(() => sp.get("next") || "/", [sp])

  const emailRef = useRef<HTMLInputElement | null>(null)

  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  const [err, setErr] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(LS_EMAIL_KEY)
      if (remembered) setEmail(remembered)
    } catch {}
    emailRef.current?.focus()
  }, [])

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

  const validate = () => {
    const em = email.trim()
    if (!em || !em.includes("@")) return "Lütfen geçerli bir e-posta adresi gir."
    if (!pass || pass.length < 6) return "Şifre en az 6 karakter olmalı."
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
      const payload = { email: email.trim(), password: pass }

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) throw data || { message: `Giriş başarısız (${res.status})` }

      const accessToken = data?.accessToken
      const user = data?.user

      if (!accessToken || !user) throw { message: "Sunucudan beklenmeyen cevap geldi." }

      // remember email (not auth!)
      try {
        if (remember) localStorage.setItem(LS_EMAIL_KEY, email.trim())
        else localStorage.removeItem(LS_EMAIL_KEY)
      } catch {}

      // persist auth
      try {
        localStorage.setItem(LS_AUTH_TOKEN_KEY, accessToken)
        localStorage.setItem(LS_AUTH_USER_KEY, JSON.stringify(user))
      } catch {}

      setNotice("Giriş başarılı ✅ Yönlendiriliyorsun…")
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
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

      {/* ✅ TOPBAR (GENEL) */}
      <PublicTopbar subtitle="Giriş" hideAuthButtons disableWhileLoading={loading} nextUrlForAuth={nextUrl} />

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-5">
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur sm:w-auto sm:justify-start">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Güvenli giriş • Şifreler korunur
            </div>

            <h1 className="mt-4 text-[34px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[44px] md:text-[52px]">
              Tekrar hoş geldin
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              Giriş yaptığında kişisel alanın, yorumların ve takip ettiğin içerikler burada olur.
            </p>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
              <div className="text-sm font-semibold text-white/90">İpucu</div>
              <div className="mt-2 text-sm text-white/70 leading-relaxed">
                Hızlı erişim için <span className="font-semibold text-white/90">⌘K</span> /{" "}
                <span className="font-semibold text-white/90">Ctrl+K</span> ile şikayet yazma ekranını açabilirsin.
              </div>

              <div className="mt-4 text-sm text-white/70 break-words">
                Başarılı girişten sonra yönlendirme: <span className="font-semibold text-white/90">{nextUrl}</span>
              </div>

              <div className="mt-4 text-xs text-white/55 break-words">
                Login endpoint: <span className="text-white/80 font-semibold">{API_BASE}/api/auth/login</span>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur sm:rounded-[34px] sm:p-7">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.26),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.16),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white/90">Giriş Yap</div>
                    <div className="mt-1 text-sm text-white/65">E-posta ve şifrenle devam et.</div>
                  </div>

                  <Link
                    href={`/kayit?next=${encodeURIComponent(nextUrl)}`}
                    className="w-full rounded-full border border-white/10 bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/80 hover:bg-white/15 sm:w-auto sm:py-1.5"
                  >
                    Hesabın yok mu? Kayıt ol
                  </Link>
                </div>

                {err ? <Notice kind="error">{err}</Notice> : null}
                {notice ? <Notice kind="success">{notice}</Notice> : null}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <Field label="E-posta" icon={<Mail className="h-3.5 w-3.5 text-white/75" />}>
                    <input
                      ref={emailRef}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@domain.com"
                      inputMode="email"
                      autoComplete="email"
                      className="h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-4 focus:ring-white/10"
                      disabled={loading}
                    />
                  </Field>

                  <Field label="Şifre" icon={<Lock className="h-3.5 w-3.5 text-white/75" />}>
                    <div className="flex items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <input
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        type={show ? "text" : "password"}
                        placeholder="••••••"
                        autoComplete="current-password"
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

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                        disabled={loading}
                      />
                      Bu cihazda e-postayı hatırla
                    </label>

                    <Link
                      href={`/sifre-sifirla?next=${encodeURIComponent(nextUrl)}`}
                      className="text-left text-sm font-semibold text-white/75 hover:text-white sm:text-right"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <PillButton type="submit" variant="secondary" disabled={loading} className="w-full">
                      {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
                      <ArrowRight className="h-4 w-4" />
                    </PillButton>

                    <PillButton variant="ghost" onClick={() => router.push("/sikayet-yaz")} className="w-full" disabled={loading}>
                      Şikayet Yaz
                    </PillButton>
                  </div>

                  <div className="mt-3 text-xs leading-relaxed text-white/55">
                    Devam ederek{" "}
                    <Link href="/kurallar" className="text-white/75 hover:text-white">
                      Kurallar
                    </Link>{" "}
                    ve{" "}
                    <Link href="/kvkk" className="text-white/75 hover:text-white">
                      KVKK
                    </Link>{" "}
                    metinlerini kabul etmiş olursun.
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div className="leading-relaxed">
                      Şifren hiçbir zaman düz metin olarak saklanmaz. Giriş denemeleri güvenlik için sınırlanabilir.
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
