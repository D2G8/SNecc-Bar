import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import GooglePayScript from '../components/GooglePayScript'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SNecc Bar',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>SNecc Bar</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <GooglePayScript />
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )


}
