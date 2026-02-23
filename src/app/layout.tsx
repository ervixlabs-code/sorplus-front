import "./globals.css"
import type { Metadata } from "next"
import Topbar from "@/components/Topbar"

export const metadata: Metadata = {
  title: "Deneyim",
  description: "Kategori bazlı şikayet platformu",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  )
}
