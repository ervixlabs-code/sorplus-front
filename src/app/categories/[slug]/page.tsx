import Container from "@/components/ui/Container"
import ComplaintCard from "@/components/ComplaintCard"
import { categories, complaints } from "@/lib/mock"

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = categories.find((c) => c.slug === slug)

  const filtered = complaints.filter((x) => x.category.slug === slug)

  return (
    <main className="py-8">
      <Container>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-brand.primary">
              {cat?.name ?? "Kategori"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Bu kategorideki şikayetleri görüntülüyorsun.
            </p>
          </div>
          <div className="text-xs text-slate-500">Filtreler (MVP’de sonra)</div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length ? (
            filtered.map((item) => <ComplaintCard key={item.id} item={item} />)
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              Henüz bu kategoride şikayet yok.
            </div>
          )}
        </div>
      </Container>
    </main>
  )
}
