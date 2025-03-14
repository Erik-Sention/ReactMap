import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SENTION HR-Map',
  description: 'HR mapping and resource management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
} 