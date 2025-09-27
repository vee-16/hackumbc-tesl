import './globals.css'
import { ReactNode } from 'react'


export const metadata = { title: 'Tech Equity Support Lab' }


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
    <body>
    <div className="min-h-screen">
      <header className="bg-white shadow p-4">
        <div className="container mx-auto text-black">Tech Equity Support Lab</div>
      </header>
      <main className="container mx-auto p-4">{children}</main>
    </div>
    </body>
    </html>
  )
}