import Container from "@/components/ui/Container"
import { complaints } from "@/lib/mock"

function maskCompanyNames(text: string) {
  // MVP: sadece örnek maskeleme (backend’e geçince sözlük + alias ile yapacağız)
  const companies = ["Trendyol", "Hepsiburada", "Vodafone", "Turkcell", "Türk Telekom"]
  let out = text
  for (const c of companies) {
    const masked =
      c.length <= 2 ? "*".repeat(c.length) : c[0] + "*".repeat(Math.max(3, c.length - 1))
    const re = new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
    out = out.replace(re, masked)
  }
  return out
}

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = complaints.find((x) => x.id === id)

  if (!item) {
    return (
      <main className="py-10">
        <Container>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            Şikayet bulunamadı.
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="py-8">
      <Container>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">{item.category.name}</span>
            <span className="mx-2">•</span>
            <span>{item.createdAt}</span>
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-brand.primary">{item.title}</h1>

          <div className="mt-4 whitespace-pre-wrap text-slate-700 leading-relaxed">
            {maskCompanyNames(item.body)}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button className="h-10 px-4 rounded-xl border border-slate-200 hover:border-brand.accent/40 hover:bg-brand.accent/5 transition text-sm">
              Destekle ({item.supportCount})
            </button>
            <button className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm">
              Şikayet Bildir
            </button>
          </div>
        </div>
      </Container>
    </main>
  )
}
