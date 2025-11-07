import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import AuthGuard from "@/components/auth/auth-guard"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Stay Fresh - Farmer Storage Management",
  description: "Smart cold storage solution for farmers",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  )
}
