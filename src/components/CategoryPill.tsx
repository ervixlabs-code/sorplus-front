import Link from "next/link"

export default function CategoryPill({ slug, name }: { slug: string; name: string }) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs
                 hover:border-brand-accent/40 hover:bg-brand-accent/5 transition"
    >
      {name}
    </Link>
  )
}
