import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Web Scraper',
  description: 'Extract business information from any website using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-50">
          <div className="w-full mx-auto max-w-7xl">
            <header className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center">
                <a href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-lg flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                  </div>
                  <span className="font-bold text-2xl text-gray-900">WebScrapeAI</span>
                </a>
              </div>
            </header>
            <main className="px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
              <p>© {new Date().getFullYear()} WebScrapeAI. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  )
} 