import Link from "next/link"

export type Complaint = {
  id: string
  title: string
  body: string
  category: { slug: string; name: string }
  createdAt: string
  supportCount: number
}

export default function ComplaintCard({ item }: { item: Complaint }) {
  return (
    <Link
      href={`/complaints/${item.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-soft
                 hover:-translate-y-0.5 hover:border-brand-accent/30 transition"
    >
      <div className="flex justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{item.category.name}</span>
        <span className="bg-brand-accent/10 text-brand-accent px-2 py-1 rounded-full">
          +{item.supportCount}
        </span>
      </div>

      <div className="mt-2 font-semibold text-brand-primary">{item.title}</div>
      <div className="mt-1 text-sm text-slate-600">{item.body}</div>
    </Link>
  )
}
