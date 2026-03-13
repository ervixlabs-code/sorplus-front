import Container from "@/components/ui/Container"
import ComplaintCard from "@/components/ComplaintCard"
import { categories, complaints } from "@/lib/mock"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const cat = categories.find((c) => c.slug === slug)
  const filtered = complaints.filter((x) => x.category.slug === slug)

  return (
    <main className="py-6 sm:py-8 lg:py-10">
      <Container>
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center rounded-full bg-brand.primary/5 px-3 py-1 text-[11px] font-medium text-brand.primary sm:text-xs">
                Kategori
              </div>

              <h1 className="mt-3 text-[26px] font-semibold tracking-tight text-brand.primary sm:text-[30px] lg:text-[34px]">
                {cat?.name ?? "Kategori"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                Bu kategorideki sorunları görüntülüyorsun.
              </p>
            </div>

            <div className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500 sm:w-auto sm:justify-start">
              Filtreler (MVP’de sonra)
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="text-sm text-slate-500">
              Toplam{" "}
              <span className="font-semibold text-slate-800">
                {filtered.length}
              </span>{" "}
              içerik bulundu
            </div>
          </div>
        </section>

        <section className="mt-6 sm:mt-8">
          {filtered.length ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
              {filtered.map((item) => (
                <ComplaintCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                !
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Henüz bu kategoride sorun yok
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Bu kategoriye ait ilk paylaşım henüz eklenmemiş görünüyor.
              </p>
            </div>
          )}
        </section>
      </Container>
    </main>
  )
}