import Link from "next/link"
import Container from "@/components/ui/Container"
import CTAButton from "@/components/ui/CTAButton"

export default function Topbar() {
  return (
    <>
      {/* ÜST SİYAH BAR (Şikayetvar hissi) */}
      <div className="bg-brand-primary text-white">
        <Container className="h-10 flex items-center justify-between">
          <div className="text-xs text-white/80">
            Toplam çözüm sayısı <span className="text-white font-semibold">4.198.506</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/70 hidden sm:block">
              Şikayet ve çözümleri canlı olarak takip et
            </div>
            <a
              href="#"
              className="h-7 px-3 rounded-full bg-emerald-500/90 text-white text-xs font-semibold grid place-items-center"
            >
              CANLI İZLE
            </a>
          </div>
        </Container>
      </div>

      {/* ANA NAV */}
      <header className="border-b border-slate-200 bg-white">
        <Container className="h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-primary text-white grid place-items-center shadow-soft">
              <span className="font-bold">Ş</span>
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-brand-primary">sikayetvar</div>
              <div className="text-[11px] text-slate-500 -mt-0.5">Kategori Bazlı</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 ml-6">
            <a className="hover:text-brand-primary" href="#sikayetler">Şikayetler</a>
            <a className="hover:text-brand-primary" href="#trend">Trend</a>
            <a className="hover:text-brand-primary" href="#tv">TV</a>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a href="#" className="text-sm text-slate-600 hover:text-brand-primary">
              Giriş Yap / Üye Ol
            </a>
            <CTAButton href="/complaints/new">+ Şikayet Yaz</CTAButton>
          </div>
        </Container>
      </header>
    </>
  )
}
