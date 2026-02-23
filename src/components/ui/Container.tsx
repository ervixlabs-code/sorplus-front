import clsx from "clsx"

export default function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx("mx-auto w-full max-w-6xl px-4", className)}>
      {children}
    </div>
  )
}
