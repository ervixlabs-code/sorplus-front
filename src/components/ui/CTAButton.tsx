import clsx from "clsx"

export default function CTAButton({
  children,
  href,
  className,
  variant = "solid",
}: {
  children: React.ReactNode
  href: string
  className?: string
  variant?: "solid" | "outline"
}) {
  const base =
    "inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-semibold transition"
  const solid =
    "bg-brand-accent text-white shadow-soft hover:brightness-95 active:brightness-90"
  const outline =
    "border border-slate-200 bg-white text-brand-primary hover:bg-slate-50"

  return (
    <a
      href={href}
      className={clsx(base, variant === "solid" ? solid : outline, className)}
    >
      {children}
    </a>
  )
}
