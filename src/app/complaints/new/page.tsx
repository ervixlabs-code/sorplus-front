import Container from "@/components/ui/Container"
import Button from "@/components/ui/Button"
import { categories } from "@/lib/mock"

export default function NewComplaintPage() {
  return (
    <main className="py-8">
      <Container>
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold text-brand.primary">Şikayet Yaz</h1>
          <p className="mt-1 text-sm text-slate-600">
            Video yok. Firma sayfası yok. Sadece kategori bazlı şikayet.
          </p>

          <form className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand.accent/30">
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Başlık</label>
              <input
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-brand.accent/30"
                placeholder="Kısa ve net bir başlık yaz…"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Detay</label>
              <textarea
                className="mt-2 min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-brand.accent/30"
                placeholder="Şikayetini detaylı anlat… (Firma adı geçerse otomatik maskelenecek)"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="submit">Gönder</Button>
            </div>
          </form>
        </div>
      </Container>
    </main>
  )
}
