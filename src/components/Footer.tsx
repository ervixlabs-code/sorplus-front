// components/Footer.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Linkedin, Youtube, X } from "lucide-react"

type FooterLinkItem = { label: string; href: string; muted?: boolean }

type FooterColumn = {
  title: string
  links: FooterLinkItem[]
}

type CategoryApiItem = {
  id: string | number
  name: string
  slug?: string
}

type ComplaintApiItem = {
  id: string | number
  title: string
}

/** ===================== API BASE ===================== */
const RAW_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").trim()

function normalizeApiBase(raw?: string) {
  const base = (raw || "").replace(/\/+$/, "")
  if (!base) return ""
  return base.endsWith("/api") ? base.slice(0, -4) : base
}

const API_BASE = normalizeApiBase(RAW_BASE)

async function safeJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text || null
  }
}

function buildApiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath
}

function FooterLink({
  href,
  children,
  muted = false,
}: {
  href: string
  children: React.ReactNode
  muted?: boolean
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "group block text-[13px] leading-relaxed transition sm:text-[14px]",
        muted ? "text-white/45 hover:text-white/70" : "text-white/60 hover:text-white/85"
      )}
    >
      <span className="line-clamp-2">{children}</span>
    </Link>
  )
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur transition hover:bg-white/10 hover:text-white"
      aria-label={label}
    >
      {children}
    </a>
  )
}

/** ✅ Querystring builder (SSR/TS-safe) */
function buildQuery(params: Record<string, string>) {
  const pairs = Object.entries(params)
    .filter(([, v]) => (v ?? "").trim().length > 0)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)

  return pairs.length ? `?${pairs.join("&")}` : ""
}

export default function Footer() {
  const [categories, setCategories] = useState<CategoryApiItem[]>([])
  const [complaints, setComplaints] = useState<ComplaintApiItem[]>([])
  const [catErr, setCatErr] = useState<string | null>(null)
  const [cmpErr, setCmpErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    async function load() {
      try {
        setCatErr(null)
        const res = await fetch(buildApiUrl("/api/categories"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!res.ok) {
          const body = await safeJson(res)
          throw new Error((body as any)?.message || body || `categories ${res.status}`)
        }

        const data = await safeJson(res)

        const list: CategoryApiItem[] = Array.isArray(data)
          ? data
          : data?.items || data?.data || data?.categories || []

        if (alive) setCategories(Array.isArray(list) ? list : [])
      } catch (e: any) {
        console.error("footer categories error:", e)
        if (alive) setCatErr(e?.message || "Kategoriler yüklenemedi")
      }

      try {
        setCmpErr(null)
        const res = await fetch(buildApiUrl("/api/complaints/public"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })

        if (!res.ok) {
          const body = await safeJson(res)
          throw new Error((body as any)?.message || body || `complaints ${res.status}`)
        }

        const data = await safeJson(res)

        const list: ComplaintApiItem[] = Array.isArray(data)
          ? data
          : data?.items || data?.data || data?.complaints || []

        if (alive) setComplaints(Array.isArray(list) ? list : [])
      } catch (e: any) {
        console.error("footer complaints error:", e)
        if (alive) setCmpErr(e?.message || "Şikayetler yüklenemedi")
      }
    }

    load()

    return () => {
      alive = false
    }
  }, [])

  const cols: FooterColumn[] = useMemo(() => {
    const complaintLinks: FooterLinkItem[] = (complaints?.slice(0, 5) || []).map((c) => ({
      label: c?.title || "Sorun",
      href: `/sikayetler/${c.id}`,
    }))

    if (complaintLinks.length === 0) {
      complaintLinks.push({ label: "Sorunlar", href: "/sikayetler" })
    }

    complaintLinks.push({
      label: "Tüm Sorunlar",
      href: "/sikayetler",
      muted: true,
    })

    let trendSource = complaints?.slice(5, 12) || []

    if (trendSource.length === 0 && complaints.length > 0) {
      trendSource = complaints.slice(0, 7)
    }

    const trendLinks: FooterLinkItem[] = trendSource.map((c) => ({
      label: c?.title || "Trend Şikayet",
      href: `/sikayetler/${c.id}`,
    }))

    if (trendLinks.length === 0) {
      trendLinks.push({ label: "Trend Şikayetler", href: "/sikayetler" })
    }

    trendLinks.push({
      label: "Tüm Trendler",
      href: "/sikayetler",
      muted: true,
    })

    const categoryLinks: FooterLinkItem[] = (categories?.slice(0, 9) || []).map((cat) => {
      const name = cat?.name || "Kategori"
      const slug = (cat?.slug || "").trim()
      const id = String(cat?.id ?? "")

      const qs = buildQuery({
        kategori: slug,
        kategoriId: id,
      })

      return {
        label: name,
        href: `/sikayetler${qs}`,
      }
    })

    if (categoryLinks.length === 0) {
      categoryLinks.push({ label: "Kategoriler", href: "/sikayetler" })
    }

    return [
      {
        title: "Sorunlar",
        links: complaintLinks,
      },
      {
        title: "Trend100",
        links: trendLinks,
      },
      {
        title: "Kategoriler",
        links: categoryLinks,
      },
    ]
  }, [categories, complaints])

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#14172A] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10 2xl:px-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex justify-start">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="SorPlus"
                width={150}
                height={44}
                className="h-auto w-[118px] object-contain sm:w-[138px] lg:w-[150px]"
              />
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] text-white/70 sm:gap-x-7">
            <Link className="transition hover:text-white" href="/hakkimizda">
              Hakkımızda
            </Link>
            <Link className="transition hover:text-white" href="/rehber">
              Rehber
            </Link>
            <Link className="transition hover:text-white" href="/kurallar">
              Kurallar
            </Link>
            <Link className="transition hover:text-white" href="/sss">
              Sıkça Sorulan Sorular
            </Link>
            <Link className="transition hover:text-white" href="/iletisim">
              İletişim
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <SocialButton href="#" label="X">
              <X className="h-5 w-5" />
            </SocialButton>
            <SocialButton href="#" label="YouTube">
              <Youtube className="h-5 w-5" />
            </SocialButton>
            <SocialButton href="#" label="Facebook">
              <Facebook className="h-5 w-5" />
            </SocialButton>
            <SocialButton href="#" label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </SocialButton>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10" />

        <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title} className="min-w-0">
              <div className="text-[20px] font-semibold tracking-tight text-white/85 sm:text-[22px]">
                {col.title}
              </div>

              {col.title === "Kategoriler" && catErr ? (
                <div className="mt-2 text-[12px] text-white/40">Kategoriler yüklenemedi</div>
              ) : null}

              {(col.title === "Sorunlar" || col.title === "Trend100") && cmpErr ? (
                <div className="mt-2 text-[12px] text-white/40">Şikayetler yüklenemedi</div>
              ) : null}

              <div className="mt-4 space-y-2.5 sm:space-y-3">
                {col.links.map((l, i) => (
                  <FooterLink key={`${l.href}-${i}`} href={l.href} muted={!!l.muted}>
                    {l.label}
                  </FooterLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 text-[12px] text-white/55 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} SorPlus • Tüm hakları saklıdır.</div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link className="transition hover:text-white" href="/gizlilik">
                Gizlilik
              </Link>
              <Link className="transition hover:text-white" href="/kullanim-sartlari">
                Kullanım Şartları
              </Link>
              <Link className="transition hover:text-white" href="/kvkk">
                KVKK
              </Link>
              <Link className="transition hover:text-white" href="/cerez-tercihleri">
                Çerez Tercihleri
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
