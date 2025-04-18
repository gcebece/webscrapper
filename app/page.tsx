'use client'

import { useState } from 'react'
import ScrapeForm from './components/ScrapeForm'
import ResultDisplay from './components/ResultDisplay'

// Sample data for static export (GitHub Pages)
const sampleData = {
  websiteTitle: "Sample Business Website",
  businessType: "Technology Company",
  email: "contact@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Tech Lane, San Francisco, CA 94107",
  socialMedia: ["https://facebook.com/samplecompany", "https://twitter.com/samplecompany"],
  description: "This is a sample business description for the static export demonstration. In the live version, real website data will be shown here.",
  seoInfo: {
    title: "Sample SEO Title",
    metaDescription: "This is a sample meta description for demonstration purposes.",
    metaKeywords: "sample, demo, webscraper",
    ogTags: {
      title: "Sample OG Title",
      description: "Sample OG Description"
    },
    twitterTags: {
      title: "Sample Twitter Title",
      description: "Sample Twitter Description"
    },
    canonicalUrl: "https://example.com",
    headings: {
      h1: 2,
      h2: 5,
      h3: 8
    },
    imgAltTags: 10,
    imgMissingAlt: 2
  },
  technologies: ["React", "Next.js", "TailwindCSS", "API Integration"],
  pageStructure: {
    hasHeader: true,
    hasFooter: true,
    hasNavigation: true,
    hasSlider: false,
    hasSidebar: true,
    hasCookieBanner: true,
    totalLinks: 45,
    internalLinks: 32,
    externalLinks: 13,
    totalImages: 12
  }
};

export default function Home() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleScrape = async (url: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // For local development or production deployment with API
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred while scraping the website')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 mb-3">
          AI Web Scraper
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Extract valuable business information from any website with our advanced AI-powered tool
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="card transition-all duration-300 transform hover:shadow-card-hover">
            <div className="mb-6">
              <h2 className="section-title flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                Enter Website URL
              </h2>
            </div>
            <ScrapeForm onSubmit={handleScrape} isLoading={loading} />
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-100 rounded-lg text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="text-6xl mb-4 text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to analyze a website</h3>
                <p className="text-gray-500 text-sm">Enter a URL above and click "Analyze Website" to begin</p>
              </div>
            </div>
          )}
        </div>

        <div>
          {loading ? (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Analyzing website...</p>
                <p className="text-gray-500">This may take a few moments</p>
              </div>
            </div>
          ) : results ? (
            <ResultDisplay results={results} />
          ) : (
            <div className="card h-full flex items-center justify-center bg-gray-50 border-dashed border-2 border-gray-200">
              <div className="text-center p-6">
                <div className="text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Results will appear here</h3>
                <p className="text-gray-500 text-sm">Once website analysis is complete, business information will be displayed in this area</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 