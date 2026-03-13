import Container from "@/components/ui/Container"
import { complaints } from "@/lib/mock"

function maskCompanyNames(text: string) {
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

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const item = complaints.find((x) => x.id === id)

  if (!item) {
    return (
      <main className="py-6 sm:py-8 lg:py-10">
        <Container>
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              !
            </div>

            <h1 className="mt-4 text-lg font-semibold text-slate-800">Sorun bulunamadı</h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Aradığın içerik kaldırılmış, taşınmış ya da hiç oluşturulmamış olabilir.
            </p>
          </div>
        </Container>
      </main>
    )
  }

  return (
    <main className="py-6 sm:py-8 lg:py-10">
      <Container>
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <span className="inline-flex items-center rounded-full bg-brand.primary/5 px-3 py-1 font-medium text-brand.primary">
              {item.category.name}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{item.createdAt}</span>
          </div>

          <h1 className="mt-4 text-[26px] font-semibold tracking-tight text-brand.primary sm:text-[30px] lg:text-[34px]">
            {item.title}
          </h1>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            İçerikte geçen firma adları topluluk kuralları gereği kısmen maskelenmiş olabilir.
          </div>

          <article className="mt-6 rounded-[24px] border border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-5 sm:py-6">
            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700 sm:text-[15px]">
              {maskCompanyNames(item.body)}
            </div>
          </article>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500 sm:text-sm">
              Bu paylaşımı faydalı bulduysan destekleyebilir veya inceleme için bildirebilirsin.
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:border-brand.accent/40 hover:bg-brand.accent/5">
                Destekle ({item.supportCount})
              </button>

              <button className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Şikayet Bildir
              </button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}