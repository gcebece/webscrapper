'use client'

import { useState } from 'react'

interface SEOInfo {
  title: string
  metaDescription: string
  metaKeywords: string
  ogTags: Record<string, string>
  twitterTags: Record<string, string>
  canonicalUrl: string
  headings: {
    h1: number
    h2: number
    h3: number
  }
  imgAltTags: number
  imgMissingAlt: number
}

interface PageStructure {
  hasHeader: boolean
  hasFooter: boolean
  hasNavigation: boolean
  hasSlider: boolean
  hasSidebar: boolean
  hasCookieBanner: boolean
  totalLinks: number
  internalLinks: number
  externalLinks: number
  totalImages: number
}

interface FormInfo {
  type: string
  fields: number
}

interface ProductInfo {
  name: string
  price?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface ScrapedData {
  // Basic info
  websiteTitle?: string
  businessType?: string
  email?: string
  phone?: string
  address?: string
  socialMedia?: string[]
  description?: string
  
  // SEO data
  seoInfo?: SEOInfo
  
  // Technologies
  technologies?: string[]
  
  // Website structure
  pageStructure?: PageStructure
  
  // Other data
  forms?: FormInfo[]
  products?: ProductInfo[]
  services?: string[]
  faqs?: FAQItem[]
  contactInfo?: Record<string, string>
  privacyPolicy?: boolean
  termsOfService?: boolean
  languages?: string[]
  
  // New fields
  performance?: {
    totalScripts: number
    totalStylesheets: number
    totalImages: number
    totalIframes: number
    lazyLoadImages: number
    responseHeaders: Record<string, string>
  }
  security?: {
    hasHttps: boolean
    hasCsp: boolean
    hasXssProtection: boolean
    hasHsts: boolean
    passwordFields: boolean
    captchaPresent: boolean
    loginForm: boolean
  }
  accessibility?: {
    hasAriaLabels: boolean
    hasAriaDescribedby: boolean
    hasAriaLive: boolean
    hasAltText: number
    missingAltText: number
    hasSkipLinks: boolean
    hasLanguageAttribute: boolean
    hasTabIndex: boolean
  }
  media?: {
    images: Array<{src: string, alt: string}>
    videos: Array<{src: string}>
    hasAudio: boolean
    hasVideo: boolean
    hasEmbeddedContent: boolean
    hasYouTube: boolean
    hasVimeo: boolean
  }
  navigation?: {
    menuItems: Array<{text: string, href: string}>
    hasDropdownMenu: boolean
    hasMobileMenu: boolean
    hasBreadcrumbs: boolean
  }
  mobileOptimization?: {
    hasViewportMeta: boolean
    responsiveMetaContent: string
    hasMobileSpecificClasses: boolean
    hasMediaQueries: boolean
    usesFlexbox: boolean
    usesGrid: boolean
  }
  
  // Raw content excerpts
  rawContentExcerpt?: string
  
  // Additional info
  otherInfo?: Record<string, string>
}

interface ResultDisplayProps {
  results: ScrapedData
}

export default function ResultDisplay({ results }: ResultDisplayProps) {
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'csv' | 'text'>('json')
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('basic')
  
  const {
    websiteTitle,
    businessType,
    email,
    phone,
    address,
    socialMedia,
    description,
    seoInfo,
    technologies,
    pageStructure,
    forms,
    products,
    services,
    faqs,
    contactInfo,
    privacyPolicy,
    termsOfService,
    languages,
    performance,
    security,
    accessibility,
    media,
    navigation,
    mobileOptimization,
    rawContentExcerpt,
    otherInfo,
  } = results

  const handleDownload = (format: 'json' | 'csv' | 'text') => {
    let content: string = '';
    let filename: string = `website-data-${new Date().toISOString().split('T')[0]}`;
    let type: string = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(results, null, 2);
        filename += '.json';
        type = 'application/json';
        break;
      case 'csv':
        // Create CSV header
        content = 'Data Type,Value\n';
        if (businessType) content += `Business Type,${businessType.replace(/,/g, ' ')}\n`;
        if (description) content += `Description,${description.replace(/,/g, ' ')}\n`;
        if (email) content += `Email,${email}\n`;
        if (phone) content += `Phone,${phone}\n`;
        if (address) content += `Address,${address.replace(/,/g, ' ')}\n`;
        
        // Social media
        if (socialMedia && socialMedia.length > 0) {
          socialMedia.forEach((link, index) => {
            content += `Social Media ${index + 1},${link}\n`;
          });
        }
        
        // Technologies
        if (technologies && technologies.length > 0) {
          technologies.forEach((tech, index) => {
            content += `Technology ${index + 1},${tech}\n`;
          });
        }
        
        // Other info
        if (otherInfo && Object.keys(otherInfo).length > 0) {
          Object.entries(otherInfo).forEach(([key, value]) => {
            content += `${key},${value.replace(/,/g, ' ')}\n`;
          });
        }
        
        filename += '.csv';
        type = 'text/csv';
        break;
      case 'text':
        content = `Website Data Report\n${new Date().toLocaleString()}\n\n`;
        if (websiteTitle) content += `Website Title: ${websiteTitle}\n\n`;
        if (businessType) content += `Business Type: ${businessType}\n\n`;
        if (description) content += `Description: ${description}\n\n`;
        if (email) content += `Email: ${email}\n`;
        if (phone) content += `Phone: ${phone}\n`;
        if (address) content += `Address: ${address}\n\n`;
        
        if (socialMedia && socialMedia.length > 0) {
          content += `Social Media:\n`;
          socialMedia.forEach(link => {
            content += `- ${link}\n`;
          });
          content += '\n';
        }
        
        if (technologies && technologies.length > 0) {
          content += `Technologies Used:\n`;
          technologies.forEach(tech => {
            content += `- ${tech}\n`;
          });
          content += '\n';
        }
        
        if (services && services.length > 0) {
          content += `Services:\n`;
          services.forEach(service => {
            content += `- ${service}\n`;
          });
          content += '\n';
        }
        
        if (products && products.length > 0) {
          content += `Products:\n`;
          products.forEach(product => {
            content += `- ${product.name}${product.price ? ` (${product.price})` : ''}\n`;
          });
          content += '\n';
        }
        
        if (otherInfo && Object.keys(otherInfo).length > 0) {
          content += `Additional Information:\n`;
          Object.entries(otherInfo).forEach(([key, value]) => {
            content += `${key}: ${value}\n`;
          });
        }
        
        filename += '.txt';
        type = 'text/plain';
        break;
    }

    // Create download link
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Hide the download options after downloading
    setShowDownloadOptions(false);
  };

  return (
    <div className="card overflow-hidden">
      <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
        <h2 className="section-title flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
          </svg>
          {websiteTitle || 'Website Analysis Results'}
        </h2>
        
        <div className="relative">
          <button 
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="flex items-center text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          
          {showDownloadOptions && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-100">
              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">
                Select Format
              </div>
              <button 
                onClick={() => handleDownload('json')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                JSON
              </button>
              <button 
                onClick={() => handleDownload('csv')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                CSV
              </button>
              <button 
                onClick={() => handleDownload('text')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Text File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'basic' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'tech' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tech')}
          >
            Technologies
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'structure' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('structure')}
          >
            Page Structure
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'seo' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('seo')}
          >
            SEO Data
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'mobile' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('mobile')}
          >
            Mobile
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'performance' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'security' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'contact' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
          <button
            className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'content' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div>
            {businessType && (
              <div className="p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="info-label text-indigo-800">Business Type</h3>
                    <p className="info-value font-medium text-indigo-900">{businessType}</p>
                  </div>
                </div>
              </div>
            )}

            {description && (
              <div className="result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  Business Description
                </h3>
                <p className="info-value mt-2">{description}</p>
              </div>
            )}

            {services && services.length > 0 && (
              <div className="result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                  Services
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((service, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {products && products.length > 0 && (
              <div className="result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  Products
                </h3>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {products.map((product, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="font-medium">{product.name}</div>
                      {product.price && <div className="text-sm text-indigo-600 mt-1">{product.price}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div className="result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  Languages
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {languages.map((lang, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technology Tab */}
        {activeTab === 'tech' && (
          <div>
            {technologies && technologies.length > 0 && (
              <div className="result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Technologies Detected
                </h3>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {technologies.map((tech, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      <span className="text-sm">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!technologies || technologies.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No technologies detected
              </div>
            )}
            
            {forms && forms.length > 0 && (
              <div className="result-item mt-6">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Forms
                </h3>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {forms.map((form, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-700">{form.type}</div>
                      <div className="text-sm text-gray-600 mt-1">Fields: {form.fields}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex items-center space-x-4">
              {privacyPolicy && (
                <div className="flex items-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-sm font-medium">Privacy Policy</span>
                </div>
              )}
              
              {termsOfService && (
                <div className="flex items-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-sm font-medium">Terms of Service</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Page Structure Tab */}
        {activeTab === 'structure' && pageStructure && (
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  Page Elements
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Header</span>
                    <span className={pageStructure.hasHeader ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasHeader ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Footer</span>
                    <span className={pageStructure.hasFooter ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasFooter ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Navigation</span>
                    <span className={pageStructure.hasNavigation ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasNavigation ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Slider/Carousel</span>
                    <span className={pageStructure.hasSlider ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasSlider ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Sidebar</span>
                    <span className={pageStructure.hasSidebar ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasSidebar ? "Yes" : "No"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Cookie Banner</span>
                    <span className={pageStructure.hasCookieBanner ? "text-green-600" : "text-red-500"}>
                      {pageStructure.hasCookieBanner ? "Yes" : "No"}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Links & Assets
                </h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Links</span>
                    <span className="font-medium">{pageStructure.totalLinks}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Internal Links</span>
                    <span className="font-medium">{pageStructure.internalLinks}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">External Links</span>
                    <span className="font-medium">{pageStructure.externalLinks}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Images</span>
                    <span className="font-medium">{pageStructure.totalImages}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SEO Data Tab */}
        {activeTab === 'seo' && seoInfo && (
          <div>
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="info-label flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Core SEO
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Title</div>
                  <div className="mt-1">{seoInfo.title}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Meta Description</div>
                  <div className="mt-1">{seoInfo.metaDescription || <span className="text-red-500">Missing</span>}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Meta Keywords</div>
                  <div className="mt-1">{seoInfo.metaKeywords || <span className="text-red-500">Missing</span>}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Canonical URL</div>
                  <div className="mt-1">{seoInfo.canonicalUrl || <span className="text-red-500">Missing</span>}</div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                  </svg>
                  Headings
                </h3>
                <div className="mt-3 flex space-x-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl font-bold text-indigo-600">{seoInfo.headings.h1}</span>
                    <span className="text-xs text-gray-500 mt-1">H1</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl font-bold text-indigo-600">{seoInfo.headings.h2}</span>
                    <span className="text-xs text-gray-500 mt-1">H2</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl font-bold text-indigo-600">{seoInfo.headings.h3}</span>
                    <span className="text-xs text-gray-500 mt-1">H3</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Images
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images with alt text</span>
                    <span className="font-medium text-green-600">{seoInfo.imgAltTags}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images missing alt text</span>
                    <span className={seoInfo.imgMissingAlt > 0 ? "font-medium text-red-500" : "font-medium text-green-600"}>
                      {seoInfo.imgMissingAlt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Tags */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Open Graph Tags
                </h3>
                <div className="mt-3">
                  {Object.keys(seoInfo.ogTags).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(seoInfo.ogTags).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs font-medium text-gray-500">og:{key}</div>
                          <div className="text-sm mt-0.5 break-words">{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm">No Open Graph tags found</div>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Twitter Card Tags
                </h3>
                <div className="mt-3">
                  {Object.keys(seoInfo.twitterTags).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(seoInfo.twitterTags).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs font-medium text-gray-500">twitter:{key}</div>
                          <div className="text-sm mt-0.5 break-words">{value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-red-500 text-sm">No Twitter Card tags found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div>
            <div className="grid gap-4 md:grid-cols-2">
              {email && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200">
                  <h3 className="info-label flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    Email
                  </h3>
                  <p className="info-value mt-2">
                    <a href={`mailto:${email}`} className="text-indigo-600 hover:underline">{email}</a>
                  </p>
                </div>
              )}

              {phone && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200">
                  <h3 className="info-label flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    Phone
                  </h3>
                  <p className="info-value mt-2">
                    <a href={`tel:${phone}`} className="text-indigo-600 hover:underline">{phone}</a>
                  </p>
                </div>
              )}
            </div>

            {address && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors duration-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  Address
                </h3>
                <p className="info-value mt-2">{address}</p>
              </div>
            )}

            {contactInfo && contactInfo.hours && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Business Hours
                </h3>
                <p className="info-value mt-2">{contactInfo.hours}</p>
              </div>
            )}

            {socialMedia && socialMedia.length > 0 && (
              <div className="mt-4 result-item">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                  Social Media
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {socialMedia.map((link, index) => {
                    // Determine platform for icon
                    const platform = link.includes('facebook.com') ? 'facebook' :
                                    link.includes('twitter.com') ? 'twitter' :
                                    link.includes('instagram.com') ? 'instagram' :
                                    link.includes('linkedin.com') ? 'linkedin' :
                                    link.includes('youtube.com') ? 'youtube' : 'other';
                    
                    return (
                      <a 
                        key={index}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded-full text-sm transition-colors duration-200"
                      >
                        {platform} <span className="sr-only">{link}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            {faqs && faqs.length > 0 && (
              <div className="mb-6">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                  </svg>
                  Frequently Asked Questions
                </h3>
                <div className="mt-3 space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 font-medium">{faq.question}</div>
                      <div className="p-3 text-gray-600">{faq.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {otherInfo && Object.keys(otherInfo).length > 0 && (
              <div className="mb-6">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  Additional Information
                </h3>
                <div className="mt-2 space-y-2">
                  {Object.entries(otherInfo).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700">{key}</div>
                      <div className="text-gray-600 mt-1">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {rawContentExcerpt && (
              <div className="mb-6">
                <h3 className="info-label flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  Raw Content Excerpt
                </h3>
                <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-600 text-sm overflow-x-auto whitespace-pre-wrap">
                  {rawContentExcerpt}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex justify-center">
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="flex items-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Complete Data
          </button>
        </div>
      </div>
    </div>
  )
} 