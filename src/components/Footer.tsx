// components/Footer.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import Link from "next/link"
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
  // bazen API’de summary vs olabilir; şart değil
}

/** ===================== API BASE ===================== */
const ENV_BASE =
  (process.env as any)?.NEXT_PUBLIC_API_BASE ||
  (process.env as any)?.NEXT_PUBLIC_BACKEND_BASE ||
  ""

function normalizeApiBase(raw?: string) {
  const base = (raw || "").trim()
  if (!base) return ""
  const noTrail = base.replace(/\/+$/, "")
  return noTrail.endsWith("/api") ? noTrail.slice(0, -4) : noTrail
}

const API_BASE_RAW = normalizeApiBase(ENV_BASE)

// ✅ DEV fallback: env yoksa backend portuna git (genelde 3002)
const API_BASE =
  API_BASE_RAW ||
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:3002`
    : "http://localhost:3002")

async function safeJson(res: Response) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text || null
  }
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
        "block text-[13px] leading-relaxed transition",
        muted ? "text-white/45 hover:text-white/70" : "text-white/55 hover:text-white/80"
      )}
    >
      <span className="line-clamp-2">{children}</span>
    </Link>
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
      // -------- categories --------
      try {
        setCatErr(null)
        const res = await fetch(`${API_BASE}/api/categories`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        if (!res.ok) {
          const body = await safeJson(res)
          throw new Error((body as any)?.message || body || `categories ${res.status}`)
        }
        const data = await safeJson(res)

        const list: CategoryApiItem[] =
          Array.isArray(data)
            ? data
            : (data?.items || data?.data || data?.categories || [])

        if (alive) setCategories(list || [])
      } catch (e: any) {
        console.error("footer categories error:", e)
        if (alive) setCatErr(e?.message || "Kategoriler yüklenemedi")
      }

      // -------- complaints --------
      try {
        setCmpErr(null)
        const res = await fetch(`${API_BASE}/api/complaints/public`, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        if (!res.ok) {
          const body = await safeJson(res)
          throw new Error((body as any)?.message || body || `complaints ${res.status}`)
        }
        const data = await safeJson(res)

        const list: ComplaintApiItem[] =
          Array.isArray(data)
            ? data
            : (data?.items || data?.data || data?.complaints || [])

        if (alive) setComplaints(list || [])
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
    const complaintLinks: FooterLinkItem[] =
      (complaints?.slice(0, 5) || []).map((c) => ({
        label: c?.title || "Şikayet",
        href: `/sikayetler/${c.id}`,
      }))

    if (complaintLinks.length === 0) {
      complaintLinks.push({ label: "Şikayetler", href: "/sikayetler" })
    }

    complaintLinks.push({ label: "Tüm Şikayetler", href: "/sikayetler", muted: true })

    const categoryLinks: FooterLinkItem[] =
      (categories?.slice(0, 9) || []).map((cat) => {
        const name = cat?.name || "Kategori"
        const slug = (cat?.slug || "").trim()
        const id = String(cat?.id ?? "")

        // ✅ en sağlam: hem slug hem id gönder
        const qs = buildQuery({
          kategori: slug, // eski param adın kalsın
          kategoriId: id, // garanti fallback
        })

        return {
          label: name,
          href: `/sikayetler${qs}`,
        }
      }) || []

    if (categoryLinks.length === 0) {
      categoryLinks.push({ label: "Kategoriler", href: "/sikayetler" })
    }

    return [
      {
        title: "Şikayetler",
        links: complaintLinks,
      },
      {
        title: "Trend100",
        links: [
          { label: "Recom Alacak Yönetimi • Ücret/iletişim problemi", href: "/sikayetler/t7" },
          { label: "Rufus Concept • İade ve gecikme şikayetleri", href: "/sikayetler/t8" },
          { label: "Anket Et • Üyelik iptali / ücret iadesi", href: "/sikayetler/t9" },
          { label: "0850 512 07 45 • İstenmeyen aramalar", href: "/sikayetler/t10" },
          { label: "Buzlu Turizm • Sefer iptali / bilet iadesi", href: "/sikayetler/t11" },
          { label: "ORIS Telekom • Hat taşıma / fatura itirazı", href: "/sikayetler/t12" },
          { label: "Şok Net • Paket düşümü / hız sorunu", href: "/sikayetler/t13" },
        ],
      },
      {
        title: "Kategoriler",
        links: categoryLinks,
      },
    ]
  }, [categories, complaints])

  return (
    <footer className="relative border-t border-white/10 bg-[#14172A] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.12),transparent_40%)]" />

      <div className="relative mx-auto w-full max-w-screen-2xl px-6 py-10 lg:px-10 2xl:px-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 shadow-sm">
              <span className="text-sm font-extrabold">✓</span>
            </div>
            <div className="leading-tight">
              <div className="text-lg font-extrabold tracking-tight">deneyim</div>
              <div className="text-[11px] text-white/55">kategori bazlı platform</div>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] text-white/70">
            <Link className="hover:text-white" href="/hakkimizda">
              Hakkımızda
            </Link>
            <Link className="hover:text-white" href="/rehber">
              Rehber
            </Link>
            <Link className="hover:text-white" href="/kurallar">
              Kurallar
            </Link>
            <Link className="hover:text-white" href="/sss">
              Sıkça Sorulan Sorular
            </Link>
            <Link className="hover:text-white" href="/iletisim">
              İletişim
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur hover:bg-white/10 hover:text-white"
              aria-label="X"
            >
              <X className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur hover:bg-white/10 hover:text-white"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur hover:bg-white/10 hover:text-white"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur hover:bg-white/10 hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10" />

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {cols.map((col) => (
            <div key={col.title}>
              <div className="text-[22px] font-semibold tracking-tight text-white/85">{col.title}</div>

              {col.title === "Kategoriler" && catErr ? (
                <div className="mt-2 text-[12px] text-white/40">Kategoriler yüklenemedi</div>
              ) : null}
              {col.title === "Şikayetler" && cmpErr ? (
                <div className="mt-2 text-[12px] text-white/40">Şikayetler yüklenemedi</div>
              ) : null}

              <div className="mt-4 space-y-2.5">
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
          <div className="flex flex-col gap-3 text-[12px] text-white/55 md:flex-row md:items-center md:justify-between">
            <div>© {new Date().getFullYear()} Deneyim • Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link className="hover:text-white" href="/gizlilik">
                Gizlilik
              </Link>
              <Link className="hover:text-white" href="/kullanim-sartlari">
                Kullanım Şartları
              </Link>
              <Link className="hover:text-white" href="/kvkk">
                KVKK
              </Link>
              <Link className="hover:text-white" href="/cerez-tercihleri">
                Çerez Tercihleri
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}