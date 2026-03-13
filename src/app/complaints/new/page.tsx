import Container from "@/components/ui/Container"
import Button from "@/components/ui/Button"
import { categories } from "@/lib/mock"

export default function NewComplaintPage() {
  return (
    <main className="py-6 sm:py-8 lg:py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="inline-flex items-center rounded-full bg-brand.primary/5 px-3 py-1 text-[11px] font-medium text-brand.primary sm:text-xs">
              Yeni paylaşım
            </div>

            <h1 className="mt-3 text-[28px] font-semibold tracking-tight text-brand.primary sm:text-[32px] lg:text-[36px]">
              Sorun Yaz
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Video yok. Firma sayfası yok. Sadece kategori bazlı sorunlar.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              Lütfen kişisel veri paylaşma. Firma adı geçerse sistem tarafında maskeleme uygulanabilir.
            </div>

            <form className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">Kategori</label>
                  <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand.accent/30">
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
                    className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand.accent/30"
                    placeholder="Kısa ve net bir başlık yaz…"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Detay</label>
                  <textarea
                    className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand.accent/30"
                    placeholder="Sorununu detaylı anlat… (Firma adı geçerse otomatik maskelenebilir)"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Ne yaşadığını, süreci ve sonucu mümkün olduğunca açık şekilde yaz.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Gönderim sonrası içerik moderasyon sürecine alınabilir.
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="submit">Gönder</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </main>
  )
}