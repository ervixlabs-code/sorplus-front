import clsx from "clsx"

export default function Button({
  children,
  className,
  type = "button",
}: {
  children: React.ReactNode
  className?: string
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      className={clsx(
        "h-10 px-4 rounded-xl bg-brand-accent text-white text-sm font-medium shadow-soft",
        "hover:brightness-95 active:brightness-90 transition",
        className
      )}
    >
      {children}
    </button>
  )
}
