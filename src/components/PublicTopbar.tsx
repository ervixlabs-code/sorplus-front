/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import clsx from "clsx"
import { Sparkles, LogIn, UserPlus, Search, Plus } from "lucide-react"

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

/** Basit buton (login sayfandaki style ile aynı) */
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

/** Mobile nav chip */
function NavChip({
  href,
  children,
  active,
  disabled,
}: {
  href: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={(e) => disabled && e.preventDefault()}
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-white/20 bg-white/15 text-white shadow-[0_0_0_4px_rgba(255,255,255,0.06)]"
          : "border-white/10 bg-white/10 text-white/85 hover:bg-white/15 hover:text-white",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      {children}
    </Link>
  )
}

/** Desktop nav item (daha belirgin) */
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

  const nextPart = useMemo(() => {
    const n = (nextUrlForAuth || "").trim()
    return n ? `?next=${encodeURIComponent(n)}` : ""
  }, [nextUrlForAuth])

  const goLogin = () => router.push(`/giris${nextPart}`)
  const goRegister = () => router.push(`/kayit${nextPart}`)

  const onLogout = () => {
    doLogout()
    setIsAuthed(false)
    router.push("/")
  }

  const disabled = !!disableWhileLoading

  // ✅ aktif link tespiti (id sayfalarında da “Şikayetler” aktif kalsın)
  const isComplaints = pathname === "/sikayetler" || pathname?.startsWith("/sikayetler/")
  const isWrite = pathname === "/sikayet-yaz"
  const isGuide = pathname === "/rehber"
  const isRules = pathname === "/kurallar"

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/10 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-10 2xl:px-14">
        {/* LEFT */}
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-2">
                <div className="truncate text-base font-extrabold tracking-tight text-white">Deneyim</div>
                <span className="hidden rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/80 sm:inline-flex">
                  Beta
                </span>
              </div>
              <div className="text-[11px] text-white/70">{subtitle || "—"}</div>
            </div>
          </Link>

          {/* ✅ Desktop nav (daha belirgin) */}
          {showQuickLinks ? (
            <nav className="hidden items-center gap-2 md:flex">
              <NavItem href="/sikayetler" label="Şikayetler" active={isComplaints} disabled={disabled} />
              <NavItem href="/sikayet-yaz" label="Şikayet Yaz" active={isWrite} disabled={disabled} />
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
                placeholder="Şikayetlerde ara…"
                className="h-[46px] w-[320px] bg-transparent pr-4 text-sm font-medium text-white placeholder:text-white/55 focus:outline-none"
                value=""
                disabled
              />
            </div>
          ) : null}

          {showWriteButton ? (
            <PillButton variant="secondary" href="/sikayet-yaz" disabled={disabled}>
              <Plus className="h-4 w-4" />
              Şikayet Yaz
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

        {/* Mobile */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto md:hidden">
          {showQuickLinks ? (
            <>
              <NavChip href="/sikayetler" active={isComplaints} disabled={disabled}>Şikayetler</NavChip>
              <NavChip href="/sikayet-yaz" active={isWrite} disabled={disabled}>Şikayet Yaz</NavChip>
              <NavChip href="/rehber" active={isGuide} disabled={disabled}>Rehber</NavChip>
              <NavChip href="/kurallar" active={isRules} disabled={disabled}>Kurallar</NavChip>
            </>
          ) : null}

          {showWriteButton ? (
            <PillButton
              variant="secondary"
              href="/sikayet-yaz"
              className="shrink-0 px-3 py-2 text-[13px]"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
              Yaz
            </PillButton>
          ) : null}

          {!hideAuthButtons ? (
            !isAuthed ? (
              <>
                <PillButton
                  variant="ghost"
                  onClick={goLogin}
                  className="shrink-0 px-3 py-2 text-[13px]"
                  disabled={disabled}
                >
                  Giriş
                </PillButton>
                <PillButton
                  variant="ghost"
                  onClick={goRegister}
                  className="shrink-0 px-3 py-2 text-[13px]"
                  disabled={disabled}
                >
                  Kayıt
                </PillButton>
              </>
            ) : (
              <PillButton
                variant="ghost"
                onClick={onLogout}
                className="shrink-0 px-3 py-2 text-[13px]"
                disabled={disabled}
              >
                Çıkış
              </PillButton>
            )
          ) : null}
        </div>
      </div>
    </header>
  )
}
