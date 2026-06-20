import type { Metadata } from 'next'
import { Anton, Archivo } from 'next/font/google'
import './globals.css'

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' })
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo' })

export const metadata: Metadata = {
  title: 'WC 2026 Predictions',
  description: 'World Cup 2026 prediction game leaderboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable}`}>
      <body style={{ fontFamily: "var(--font-archivo, 'Archivo', sans-serif)" }}>
        {children}
      </body>
    </html>
  )
}
