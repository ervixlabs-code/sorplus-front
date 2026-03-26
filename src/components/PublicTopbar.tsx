/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import clsx from "clsx"
import {
  LogIn,
  UserPlus,
  Search,
  Plus,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"

/** Senin login page’te kullandığın key’ler */
export const LS_AUTH_TOKEN_KEY = "sv_auth_token_v1"
export const LS_AUTH_USER_KEY = "sv_auth_user_v1"

function getToken(): string | null {
  try {
    return localStorage.getItem(LS_AUTH_TOKEN_KEY)
  } catch {
    return null
  }
}

function doLogout() {
  try {
    localStorage.removeItem(LS_AUTH_TOKEN_KEY)
    localStorage.removeItem(LS_AUTH_USER_KEY)
  } catch {}
}

function PillButton({
  children,
  onClick,
  href,
  variant = "ghost",
  disabled,
  className,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "secondary" | "ghost" | "white"
  disabled?: boolean
  className?: string
  ariaLabel?: string
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

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={clsx(base, styles, className)}
        onClick={(e) => disabled && e.preventDefault()}
      >
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, styles, className)}
    >
      {children}
    </button>
  )
}

function NavItem({
  href,
  label,
  active,
  disabled,
}: {
  href: string
  label: string
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={(e) => disabled && e.preventDefault()}
      className={clsx(
        kNav.base,
        active ? kNav.active : kNav.idle,
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <span className="relative">
        {label}
        <span
          className={clsx(
            "pointer-events-none absolute -bottom-2 left-0 h-[2px] w-full rounded-full transition-opacity",
            active ? "opacity-100 bg-white" : "opacity-0"
          )}
        />
      </span>
    </Link>
  )
}

function MobileDrawerLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-white/20 bg-white/12 text-white"
          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10 hover:text-white"
      )}
    >
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 opacity-70" />
    </Link>
  )
}

const kNav = {
  base:
    "relative inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold transition focus:outline-none focus:ring-4 focus:ring-white/10",
  idle:
    "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-[0_12px_40px_-28px_rgba(255,255,255,0.35)]",
  active:
    "text-white bg-white/10 shadow-[0_18px_60px_-40px_rgba(255,255,255,0.35)] ring-1 ring-white/10",
}

export default function PublicTopbar({
  subtitle,
  disableWhileLoading,
  hideAuthButtons,
  showSearchStub,
  showWriteButton = true,
  nextUrlForAuth,
  showQuickLinks = true,
}: {
  subtitle?: string
  disableWhileLoading?: boolean
  hideAuthButtons?: boolean
  showSearchStub?: boolean
  showWriteButton?: boolean
  nextUrlForAuth?: string
  showQuickLinks?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthed, setIsAuthed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const sync = () => setIsAuthed(!!getToken())
    sync()

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_AUTH_TOKEN_KEY || e.key === LS_AUTH_USER_KEY) sync()
    }

    window.addEventListener("storage", onStorage)
    const t = setInterval(sync, 800)

    return () => {
      window.removeEventListener("storage", onStorage)
      clearInterval(t)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = original
    }
  }, [mobileOpen])

  const nextPart = useMemo(() => {
    const n = (nextUrlForAuth || "").trim()
    return n ? `?next=${encodeURIComponent(n)}` : ""
  }, [nextUrlForAuth])

  const goLogin = () => {
    setMobileOpen(false)
    router.push(`/giris${nextPart}`)
  }

  const goRegister = () => {
    setMobileOpen(false)
    router.push(`/kayit${nextPart}`)
  }

  const onLogout = () => {
    doLogout()
    setIsAuthed(false)
    setMobileOpen(false)
    router.push("/")
  }

  const disabled = !!disableWhileLoading

  const isComplaints = pathname === "/sikayetler" || pathname?.startsWith("/sikayetler/")
  const isWrite = pathname === "/sikayet-yaz"
  const isGuide = pathname === "/rehber"
  const isRules = pathname === "/kurallar"

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-white/10 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-10 2xl:px-14">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo_1.png"
                alt="SorPlus"
                width={140}
                height={40}
                priority
                className="h-auto w-[160px] sm:w-[220px] object-contain"
              />
            </Link>

            {showQuickLinks ? (
              <nav className="hidden items-center gap-2 md:flex">
                <NavItem href="/sikayetler" label="Sorunlar" active={isComplaints} disabled={disabled} />
                <NavItem href="/sikayet-yaz" label="Sorun Yaz" active={isWrite} disabled={disabled} />
                <NavItem href="/rehber" label="Rehber" active={isGuide} disabled={disabled} />
                <NavItem href="/kurallar" label="Kurallar" active={isRules} disabled={disabled} />
              </nav>
            ) : null}
          </div>

          {/* RIGHT Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            {showSearchStub ? (
              <div className="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/10 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2 px-4 text-white/80">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  placeholder="Sorunlarda ara…"
                  className="h-[46px] w-[320px] bg-transparent pr-4 text-sm font-medium text-white placeholder:text-white/55 focus:outline-none"
                  value=""
                  disabled
                />
              </div>
            ) : null}

            {showWriteButton ? (
              <PillButton variant="secondary" href="/sikayet-yaz" disabled={disabled}>
                <Plus className="h-4 w-4" />
                Sorun Yaz
              </PillButton>
            ) : null}

            {!hideAuthButtons ? (
              !isAuthed ? (
                <>
                  <PillButton variant="ghost" onClick={goLogin} disabled={disabled}>
                    <LogIn className="h-4 w-4" />
                    Giriş
                  </PillButton>
                  <PillButton variant="ghost" onClick={goRegister} disabled={disabled}>
                    <UserPlus className="h-4 w-4" />
                    Kayıt
                  </PillButton>
                </>
              ) : (
                <PillButton variant="ghost" onClick={onLogout} disabled={disabled}>
                  Çıkış Yap
                </PillButton>
              )
            ) : null}
          </div>

          {/* Mobile trigger */}
          <div className="flex items-center gap-2 md:hidden">
            {showWriteButton ? (
              <Link
                href="/sikayet-yaz"
                className="inline-flex h-10 items-center justify-center rounded-full bg-emerald-500 px-3 text-sm font-semibold text-white shadow-sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Yaz
              </Link>
            ) : null}

            <button
              type="button"
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-sm backdrop-blur transition hover:bg-white/15"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-[60] bg-slate-950/55 backdrop-blur-[2px] transition md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={clsx(
          "fixed right-0 top-0 z-[70] h-dvh w-[88%] max-w-[380px] border-l border-white/10 bg-[#0F172A]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SorPlus"
                width={130}
                height={36}
                className="h-auto w-[160px] sm:w-[220px] object-contain"
              />
            </Link>

            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            {subtitle ? (
              <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
                {subtitle}
              </div>
            ) : null}

            {showSearchStub ? (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/70">
                <Search className="h-4 w-4" />
                <span className="text-sm">Sorunlarda ara…</span>
              </div>
            ) : null}

            {showQuickLinks ? (
              <div className="space-y-3">
                <MobileDrawerLink
                  href="/sikayetler"
                  label="Sorunlar"
                  active={isComplaints}
                  onClick={() => setMobileOpen(false)}
                />
                <MobileDrawerLink
                  href="/sikayet-yaz"
                  label="Sorun Yaz"
                  active={isWrite}
                  onClick={() => setMobileOpen(false)}
                />
                <MobileDrawerLink
                  href="/rehber"
                  label="Rehber"
                  active={isGuide}
                  onClick={() => setMobileOpen(false)}
                />
                <MobileDrawerLink
                  href="/kurallar"
                  label="Kurallar"
                  active={isRules}
                  onClick={() => setMobileOpen(false)}
                />
              </div>
            ) : null}

            {showWriteButton ? (
              <Link
                href="/sikayet-yaz"
                onClick={() => setMobileOpen(false)}
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Sorun Yaz
              </Link>
            ) : null}

            {!hideAuthButtons ? (
              <div className="mt-5 space-y-3">
                {!isAuthed ? (
                  <>
                    <button
                      type="button"
                      onClick={goLogin}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <LogIn className="h-4 w-4" />
                      Giriş Yap
                    </button>

                    <button
                      type="button"
                      onClick={goRegister}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <UserPlus className="h-4 w-4" />
                      Kayıt Ol
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Çıkış Yap
                  </button>
                )}
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 px-4 py-4 text-xs text-white/45">
            © {new Date().getFullYear()} SorPlus
          </div>
        </div>
      </aside>
    </>
  )
}
