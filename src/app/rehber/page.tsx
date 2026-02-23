// app/rehber/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import clsx from "clsx"
import {
  ArrowLeft,
  BadgeCheck,
  ChevronDown,
  FileText,
  Flag,
  HeartHandshake,
  Info,
  LogIn,
  Plus,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import Footer from "@/components/Footer"
import PublicTopbar from "@/components/PublicTopbar"

/* ================== SMALL UI ================== */
function PillButton({
  children,
  onClick,
  href,
  variant = "primary",
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "secondary" | "ghost" | "white"
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] focus:outline-none focus:ring-4"
  const styles =
    variant === "primary"
      ? "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-sm hover:from-indigo-500 hover:to-indigo-700 focus:ring-indigo-200/70"
      : variant === "secondary"
      ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 focus:ring-emerald-200/70"
      : variant === "white"
      ? "bg-white text-black shadow-sm hover:bg-white/90 focus:ring-white/30"
      : "border border-white/15 bg-white/10 text-white shadow-sm hover:bg-white/15 focus:ring-white/20"

  if (href) {
    return (
      <Link href={href} className={clsx(base, styles)}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={clsx(base, styles)}>
      {children}
    </button>
  )
}

function MetaPill({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
      {icon}
      <span>{label}</span>
    </div>
  )
}

function GlassCard({
  title,
  desc,
  icon,
  tone = "indigo",
  children,
}: {
  title: string
  desc?: string
  icon?: React.ReactNode
  tone?: "indigo" | "mint" | "orange"
  children?: React.ReactNode
}) {
  const toneBg =
    tone === "mint"
      ? "from-emerald-500/20 via-teal-500/10 to-transparent"
      : tone === "orange"
      ? "from-orange-500/18 via-amber-500/10 to-transparent"
      : "from-indigo-500/22 via-violet-500/10 to-transparent"

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_110px_-80px_rgba(0,0,0,0.85)] backdrop-blur">
      <div className={clsx("pointer-events-none absolute inset-0 bg-gradient-to-br", toneBg)} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.20] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative flex items-start gap-3">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/90">{title}</div>
          {desc ? <div className="mt-1 text-sm text-white/65">{desc}</div> : null}
        </div>
      </div>

      {children ? <div className="relative mt-5">{children}</div> : null}

      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
    </div>
  )
}

function DoDontItem({
  ok,
  title,
  desc,
}: {
  ok: boolean
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-black/20 p-4">
      <div
        className={clsx(
          "mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full",
          ok ? "bg-emerald-500/15 text-emerald-200" : "bg-orange-500/15 text-orange-200"
        )}
      >
        {ok ? "✓" : "!"}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white/90">{title}</div>
        <div className="mt-1 text-sm text-white/70">{desc}</div>
      </div>
    </div>
  )
}

function FaqItem({
  q,
  a,
}: {
  q: string
  a: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOpen((s) => !s)}
      className="w-full text-left"
    >
      <div className="flex items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-black/20 p-4 hover:bg-black/30">
        <div className="text-sm font-semibold text-white/90">{q}</div>
        <ChevronDown className={clsx("h-4 w-4 text-white/70 transition", open && "rotate-180")} />
      </div>
      {open ? (
        <div className="mt-2 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          {a}
        </div>
      ) : null}
    </button>
  )
}

/* ================== PAGE ================== */
export default function Page() {
  const router = useRouter()
  const goWrite = () => router.push("/sikayet-yaz")
  const goList = () => router.push("/sikayetler")

  // ⌘K / Ctrl+K → şikayet yaz
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

  const faqs = useMemo(
    () => [
      {
        q: "Firma adı yazabilir miyim?",
        a: "MVP’de firma sayfası yok. Metinde firma adı geçerse içerik yıldızlı etiketle işaretlenebilir. Ama amaç linç değil; süreci anlatmak.",
      },
      {
        q: "Kişisel veriyi yanlışlıkla yazarsam ne olur?",
        a: "Telefon, adres, T.C., kart bilgisi gibi veriler paylaşılmamalı. Moderasyon otomatik olarak maskeleyebilir; yine de paylaşmadan önce kontrol et.",
      },
      {
        q: "Şikayetim kaldırılır mı?",
        a: "Hakaret, nefret söylemi, kişisel veri veya tamamen asılsız/kanıtsız ağır iddialar içeren içerikler kaldırılabilir.",
      },
      {
        q: "Yorumlar nasıl olmalı?",
        a: "Kısa ve faydalı: benzer deneyim, somut öneri, güvenli yönlendirme. Kişisel veri isteme/verme yok.",
      },
    ],
    []
  )

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-slate-100">
      {/* GLOBAL */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

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
            Rehber •{" "}
            <span className="ml-2 text-white/70">Daha kaliteli deneyim paylaşımları için</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-white/80 sm:flex">
            ⌘K / Ctrl+K → <span className="font-semibold text-white">Şikayet Yaz</span>
          </div>
        </div>
      </div>

      <PublicTopbar
        subtitle="Şikayetler"
        showSearchStub={false} // istersen true (detay sayfasında input stub)
        nextUrlForAuth="/sikayetler" // ya da mevcut sayfa path’in
      />

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-screen-2xl px-6 pb-16 pt-8 lg:px-10 2xl:px-14">
        {/* TOP LINE */}
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
            <MetaPill icon={<Shield className="h-4 w-4 text-emerald-300" />} label="Kişisel veri yok" />
            <MetaPill icon={<BadgeCheck className="h-4 w-4 text-indigo-300" />} label="Kategori bazlı" />
            <MetaPill icon={<Users className="h-4 w-4 text-white/80" />} label="Topluluk odaklı" />
          </div>
        </div>

        {/* HERO */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/5 p-7 shadow-[0_35px_120px_-90px_rgba(0,0,0,0.85)] backdrop-blur">
              <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.28),transparent_50%),radial-gradient(circle_at_85%_35%,rgba(16,185,129,0.20),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(249,115,22,0.14),transparent_55%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/85 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Rehber • kaliteli içerik
                </div>

                <h1 className="mt-4 text-[34px] font-semibold tracking-tight text-white md:text-[44px]">
                  İyi bir şikayet nasıl yazılır?
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                  Amaç linç değil — süreci görünür kılmak. Ne oldu, ne zaman oldu, hangi adımlar denendi, sonuç ne?
                  Bunları net yazarsan hem okunur hem de fayda sağlar.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PillButton variant="secondary" onClick={goWrite}>
                    <Plus className="h-4 w-4" />
                    Şikayet Yaz
                  </PillButton>
                  <PillButton variant="ghost" onClick={goList}>
                    Şikayetleri Gör
                  </PillButton>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">1) Somut</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Tarih • süreç • sonuç</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">2) Güvenli</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Kişisel veri yok</div>
                  </div>
                  <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/60">3) Saygılı</div>
                    <div className="mt-1 text-sm font-semibold text-white/90">Hakaret yok</div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <GlassCard
              tone="mint"
              icon={<Shield className="h-5 w-5 text-emerald-200" />}
              title="Kişisel veri uyarısı"
              desc="Telefon, T.C., adres, kart bilgisi, IBAN vb. paylaşma."
            >
              <div className="text-sm text-white/70">
                Paylaşımlar moderasyondan geçebilir. En güvenlisi: kişisel veriyi hiç yazmamak.
                Ekran görüntüsü ekliyorsan da hassas bilgileri kapat.
              </div>
            </GlassCard>

            <GlassCard
              tone="indigo"
              icon={<Flag className="h-5 w-5 text-indigo-200" />}
              title="Ne zaman “bildir” kullanılır?"
              desc="Spam, hakaret, kişisel veri veya yanlış yönlendirme."
            >
              <div className="text-sm text-white/70">
                Topluluk güvenliği için bildirimler önemli. Yanlış bildirimler ise moderasyon yükünü artırır.
              </div>
            </GlassCard>
          </div>
        </div>

        {/* STEP-BY-STEP */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <GlassCard
              tone="indigo"
              icon={<FileText className="h-5 w-5 text-white" />}
              title="Adım adım yazım şablonu"
              desc="Kopyala-yapıştır mantığında: kısa ve güçlü."
            >
              <ol className="space-y-3 text-sm text-white/75">
                <li className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90 font-semibold">1) Başlık</div>
                  <div className="mt-1">
                    “Kargom 10 gündür dağıtıma çıkmadı” gibi net, ölçülebilir.
                  </div>
                </li>
                <li className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90 font-semibold">2) Ne oldu?</div>
                  <div className="mt-1">
                    Olayı 3–5 cümleyle özetle.
                  </div>
                </li>
                <li className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90 font-semibold">3) Ne zaman oldu?</div>
                  <div className="mt-1">
                    Tarih/hafta aralığı ver. “Dün / bugün” demek yerine mümkünse gün yaz.
                  </div>
                </li>
                <li className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90 font-semibold">4) Ne denedin?</div>
                  <div className="mt-1">
                    Müşteri hizmetleri, kayıt açma, şube, mail vb. adımları madde madde.
                  </div>
                </li>
                <li className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="text-white/90 font-semibold">5) Beklentin ne?</div>
                  <div className="mt-1">
                    “İade / çözüm / net bilgilendirme” gibi somut istek.
                  </div>
                </li>
              </ol>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <PillButton variant="secondary" onClick={goWrite}>
                  <Plus className="h-4 w-4" /> Bu şablonla yaz
                </PillButton>
                <PillButton variant="ghost" onClick={goList}>
                  Örnekleri gör
                </PillButton>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5">
            <GlassCard
              tone="orange"
              icon={<HeartHandshake className="h-5 w-5 text-orange-200" />}
              title="Yap / Yapma"
              desc="Okunurluk + güven için hızlı kontrol."
            >
              <div className="space-y-3">
                <DoDontItem ok title="Somut anlat" desc="Tarih, süreç, ekran görüntüsü (kapatılmış verilerle)." />
                <DoDontItem ok title="Sakin dil kullan" desc="Duygu olabilir ama hakaret olmamalı." />
                <DoDontItem ok={false} title="Kişisel veri paylaşma" desc="Telefon, adres, TC, kart, IBAN vb." />
                <DoDontItem ok={false} title="Toplu hedef gösterme" desc="Linç dili yerine süreç/olay anlat." />
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-white/70" />
                  <div>
                    <div className="font-semibold text-white/85">Kısa kural</div>
                    <div className="mt-1">“Okuyan bir yabancı, olayı tek okumada anlayabiliyor mu?”</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <GlassCard
              tone="indigo"
              icon={<BadgeCheck className="h-5 w-5 text-indigo-200" />}
              title="SSS"
              desc="En sık gelen sorular"
            >
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <FaqItem key={i} q={f.q} a={f.a} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5">
            <GlassCard
              tone="mint"
              icon={<Users className="h-5 w-5 text-emerald-200" />}
              title="Topluluk standardı"
              desc="Herkesin işine yarayan içerik üretelim."
            >
              <div className="space-y-3 text-sm text-white/75">
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  • “Ben de yaşadım” yerine bir cümle ekle: <span className="text-white/85 font-semibold">Ne zaman, nasıl çözüldü?</span>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  • Yönlendirme yaparken güvenli ol: kişisel veri isteme/verme yok.
                </div>
                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  • Şikayet çözülürse güncelle: “sonuç” bölümü değer katar.
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <PillButton variant="secondary" onClick={goWrite}>
                  <Plus className="h-4 w-4" />
                  Şikayet Yaz
                </PillButton>
                <PillButton variant="ghost" onClick={goList}>
                  Şikayetleri Gör
                </PillButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
