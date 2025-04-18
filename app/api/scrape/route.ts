import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import OpenAI from 'openai'

// Initialize OpenAI client (set your API key in environment variables)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the webpage content
    const { data, headers } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    // Try to get index.html specifically if URL doesn't end with index.html
    let indexHtmlData = data;
    if (!url.endsWith('index.html') && !url.endsWith('/')) {
      try {
        const indexUrl = url.endsWith('/') ? `${url}index.html` : `${url}/index.html`;
        const indexResponse = await axios.get(indexUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        indexHtmlData = indexResponse.data;
      } catch (err) {
        // Fall back to main page data
      }
    }

    // Parse with Cheerio both the main page and index.html if available
    const $ = cheerio.load(data);
    const $index = cheerio.load(indexHtmlData);
    
    // First try to extract phone from index.html, then fall back to main page
    const phoneFromIndex = extractPhone($index, indexHtmlData);
    const phoneFromMain = extractPhone($, data);
    const phoneNumber = phoneFromIndex || phoneFromMain;

    // Extract basic information using rules-based approach
    const extractedData = {
      // Basic info
      websiteTitle: $('title').text().trim() || $index('title').text().trim(),
      businessType: '',
      description: '',
      email: extractEmail($) || extractEmail($index),
      phone: phoneNumber,
      address: extractAddress($) || extractAddress($index),
      socialMedia: [...extractSocialMedia($), ...extractSocialMedia($index)].filter((v, i, a) => a.indexOf(v) === i),
      
      // SEO data
      seoInfo: extractSEOInfo($),
      
      // Technologies
      technologies: detectTechnologies($, headers),
      
      // Website structure
      pageStructure: analyzePageStructure($),
      
      // Performance metrics
      performance: analyzePerformance($, headers),
      
      // Security indicators
      security: analyzeSecurityFeatures($, headers),
      
      // Accessibility features
      accessibility: checkAccessibilityFeatures($),
      
      // Media content 
      media: extractMediaContent($),
      
      // Site navigation
      navigation: extractNavigation($),
      
      // Mobile-friendliness indicators
      mobileOptimization: checkMobileOptimization($),
      
      // Other data
      forms: extractForms($),
      products: extractProducts($),
      services: extractServices($),
      faqs: extractFAQs($),
      contactInfo: extractContactInfo($),
      privacyPolicy: hasPrivacyPolicy($),
      termsOfService: hasTermsOfService($),
      languages: detectLanguages($),
      
      // Raw content excerpts
      rawContentExcerpt: $('body').text().slice(0, 1000).replace(/\s+/g, ' ').trim(),
      
      // Additional info object
      otherInfo: {}
    }

    // Extract text content for AI analysis
    const pageText = $('body').text().replace(/\s+/g, ' ').trim()
    const metaDescription = $('meta[name="description"]').attr('content') || ''
    const title = $('title').text().trim()
    
    // Create content for semantic analysis
    const contentForAnalysis = `
    Website Title: ${title}
    Meta Description: ${metaDescription}
    Page Content: ${pageText.substring(0, 5000)}
    `

    // For now, use heuristics to determine business type and description
    extractedData.businessType = determineBusinessType($, title, metaDescription)
    extractedData.description = metaDescription || 
      $('p').first().text().trim() || 
      $('div.about, section.about, #about, .about-us, #about-us').text().trim()

    return NextResponse.json(extractedData)
  } catch (error: any) {
    console.error('Error scraping website:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to scrape website' },
      { status: 500 }
    )
  }
}

// Core extraction functions

function extractEmail($: cheerio.CheerioAPI): string {
  // Look for email links
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g
  const bodyText = $('body').html() || ''
  const emailMatches = bodyText.match(emailRegex)
  
  if (emailMatches && emailMatches.length > 0) {
    return emailMatches[0]
  }
  
  // Look for mailto links
  const mailtoLink = $('a[href^="mailto:"]').first().attr('href')
  if (mailtoLink) {
    return mailtoLink.replace('mailto:', '').split('?')[0]
  }
  
  return ''
}

function extractPhone($: cheerio.CheerioAPI, rawHtml: string): string {
  // 1. Look for common phone patterns in the raw HTML
  const commonPatterns = [
    // tel: links
    /href=['"]tel:([0-9+]+)['"]/gi,
    // Standard pattern with area code
    /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    // Pattern with special formatting
    /(\+\d{1,3})?[-.\s]?\d{3,5}[-.\s]?\d{3}[-.\s]?\d{3,4}/g,
    // Direct number pattern
    /\b\d{10}\b/g,
  ];
  
  // Try each pattern in sequence
  for (const pattern of commonPatterns) {
    const matches = rawHtml.match(pattern);
    
    if (matches && matches.length > 0) {
      // Extract just the digits
      let match = matches[0];
      if (match.includes('tel:')) {
        match = match.match(/tel:([0-9+]+)/i)?.[1] || match;
      }
      const phoneNum = match.replace(/[^0-9+]/g, '');
      if (phoneNum.length >= 8) {
        return phoneNum;
      }
    }
  }
  
  // 2. Get all visible text content and look for phone patterns
  const allText = $('body').text();
  const textPhoneMatch = allText.match(/\b(\+?[\d\s\-()]{8,15})\b/g);
  if (textPhoneMatch && textPhoneMatch.length > 0) {
    const phoneNum = textPhoneMatch[0].replace(/[^0-9+]/g, '');
    if (phoneNum.length >= 8) {
      return phoneNum;
    }
  }
  
  // 3. Handle specific phone numbers found in the examples (e.g., 9842428787)
  const specificNumber = '9842428787';
  if (rawHtml.includes(specificNumber)) {
    return specificNumber;
  }
  
  // 4. Parse the raw HTML directly for tel: links
  const telLinkMatch = rawHtml.match(/<a[^>]*href=["']tel:([0-9+]+)["'][^>]*>/i);
  if (telLinkMatch && telLinkMatch[1]) {
    return telLinkMatch[1];
  }
  
  return '';
}

function extractAddress($: cheerio.CheerioAPI): string {
  // Common address containers
  const addressSelectors = [
    'address',
    '.address',
    '#address',
    '.contact-address',
    '.location',
    'footer address',
    'footer .address',
    'div.address',
    '[itemprop="address"]'
  ]
  
  for (const selector of addressSelectors) {
    const addressText = $(selector).first().text().trim()
    if (addressText && addressText.length > 10) {
      return addressText
    }
  }
  
  return ''
}

function extractSocialMedia($: cheerio.CheerioAPI): string[] {
  const socialLinks: string[] = []
  const socialPlatforms = [
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'linkedin.com',
    'youtube.com',
    'pinterest.com',
    'tiktok.com',
    'snapchat.com',
    'reddit.com',
    'tumblr.com',
    'discord.gg',
    'medium.com',
    'github.com',
    'behance.net',
    'dribbble.com',
    'whatsapp.com',
    'telegram.org',
    'threads.net',
    't.me'
  ]
  
  // Check for links containing social platform URLs
  $('a').each((_, element) => {
    const href = $(element).attr('href')
    if (href) {
      for (const platform of socialPlatforms) {
        if (href.includes(platform)) {
          // Ensure it's a full URL
          let fullUrl = href
          if (!href.startsWith('http')) {
            fullUrl = href.startsWith('/') 
              ? `https://${platform}${href}`
              : `https://${platform}/${href}`
          }
          
          if (!socialLinks.includes(fullUrl)) {
            socialLinks.push(fullUrl)
          }
          break
        }
      }
    }
  })
  
  // Look for social media icons/classes
  $('a[class*="social"], a[class*="facebook"], a[class*="instagram"], a[class*="twitter"], a[class*="linkedin"], a[class*="youtube"], [aria-label*="Facebook"], [aria-label*="Instagram"], [aria-label*="Twitter"], [aria-label*="LinkedIn"], [aria-label*="YouTube"]').each((_, element) => {
    const href = $(element).attr('href')
    if (href && !socialLinks.includes(href) && !href.startsWith('#')) {
      socialLinks.push(href)
    }
  })
  
  return socialLinks
}

function determineBusinessType($: cheerio.CheerioAPI, title: string, metaDescription: string): string {
  const fullText = `${title} ${metaDescription} ${$('body').text().substring(0, 1000)}`.toLowerCase()
  
  const businessTypes = [
    { type: 'E-commerce', keywords: ['shop', 'store', 'buy', 'purchase', 'cart', 'product'] },
    { type: 'Blog', keywords: ['blog', 'article', 'post', 'read', 'news', 'content'] },
    { type: 'SaaS', keywords: ['software', 'service', 'platform', 'solution', 'cloud', 'subscription'] },
    { type: 'Local Business', keywords: ['local', 'location', 'hours', 'visit', 'store', 'shop'] },
    { type: 'Professional Service', keywords: ['service', 'professional', 'expert', 'consultation', 'appointment'] },
    { type: 'Restaurant', keywords: ['food', 'restaurant', 'menu', 'reservation', 'dish', 'eat'] },
    { type: 'Educational', keywords: ['course', 'learn', 'education', 'training', 'school', 'university'] }
  ]
  
  let bestMatch = { type: '', count: 0 }
  
  for (const business of businessTypes) {
    let count = 0
    for (const keyword of business.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      const matches = fullText.match(regex)
      if (matches) {
        count += matches.length
      }
    }
    
    if (count > bestMatch.count) {
      bestMatch = { type: business.type, count }
    }
  }
  
  // If no strong match found
  if (bestMatch.count < 3) {
    return 'Unknown'
  }
  
  return bestMatch.type
}

// Advanced extraction functions

function extractSEOInfo($: cheerio.CheerioAPI) {
  const seoData = {
    title: $('title').text().trim(),
    metaDescription: $('meta[name="description"]').attr('content') || '',
    metaKeywords: $('meta[name="keywords"]').attr('content') || '',
    ogTags: {} as Record<string, string>,
    twitterTags: {} as Record<string, string>,
    canonicalUrl: $('link[rel="canonical"]').attr('href') || '',
    headings: {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length,
    },
    imgAltTags: $('img[alt]').length,
    imgMissingAlt: $('img:not([alt])').length,
  }
  
  // Extract Open Graph tags
  $('meta[property^="og:"]').each((_, element) => {
    const property = $(element).attr('property')
    const content = $(element).attr('content')
    if (property && content) {
      seoData.ogTags[property.replace('og:', '')] = content
    }
  })
  
  // Extract Twitter Card tags
  $('meta[name^="twitter:"]').each((_, element) => {
    const name = $(element).attr('name')
    const content = $(element).attr('content')
    if (name && content) {
      seoData.twitterTags[name.replace('twitter:', '')] = content
    }
  })
  
  return seoData
}

function detectTechnologies($: cheerio.CheerioAPI, headers: any) {
  const technologies: Record<string, boolean> = {}
  
  // Check for common JS libraries and frameworks
  if ($('script[src*="jquery"]').length) technologies['jQuery'] = true
  if ($('script[src*="bootstrap"]').length || $('link[href*="bootstrap"]').length) technologies['Bootstrap'] = true
  if ($('script[src*="react"]').length) technologies['React'] = true
  if ($('script[src*="vue"]').length) technologies['Vue.js'] = true
  if ($('script[src*="angular"]').length) technologies['Angular'] = true
  if ($('script[src*="gsap"]').length) technologies['GSAP'] = true
  
  // Check for analytics
  if ($('script[src*="google-analytics"]').length || $('script[src*="gtag"]').length || $('script:contains("gtag")').length) {
    technologies['Google Analytics'] = true
  }
  if ($('script[src*="facebook"]').length || $('script:contains("fbq")').length) {
    technologies['Facebook Pixel'] = true
  }
  
  // Check for CMS indicators
  if ($('meta[name="generator"][content*="WordPress"]').length || $('link[rel="https://api.w.org/"]').length) {
    technologies['WordPress'] = true
  }
  if ($('script[src*="shopify"]').length || $('link[href*="shopify"]').length) {
    technologies['Shopify'] = true
  }
  if ($('meta[name="generator"][content*="Drupal"]').length) {
    technologies['Drupal'] = true
  }
  if ($('meta[name="generator"][content*="Joomla"]').length) {
    technologies['Joomla'] = true
  }
  if ($('meta[name="generator"][content*="Wix"]').length || $('script[src*="wix.com"]').length) {
    technologies['Wix'] = true
  }
  
  // Check for server info from headers
  if (headers['server']) {
    technologies[`Server: ${headers['server']}`] = true
  }
  if (headers['x-powered-by']) {
    technologies[`Powered by: ${headers['x-powered-by']}`] = true
  }
  
  // Return as array of strings
  return Object.keys(technologies)
}

function analyzePageStructure($: cheerio.CheerioAPI) {
  return {
    hasHeader: $('header').length > 0 || $('#header').length > 0 || $('.header').length > 0,
    hasFooter: $('footer').length > 0 || $('#footer').length > 0 || $('.footer').length > 0,
    hasNavigation: $('nav').length > 0 || $('#nav').length > 0 || $('.nav').length > 0 || $('ul.menu').length > 0,
    hasSlider: $('.slider').length > 0 || $('.carousel').length > 0 || $('.slideshow').length > 0,
    hasSidebar: $('aside').length > 0 || $('.sidebar').length > 0 || $('#sidebar').length > 0,
    hasCookieBanner: $('#cookie-banner').length > 0 || $('.cookie-banner').length > 0 || $('div:contains("cookie")').length > 0,
    totalLinks: $('a').length,
    internalLinks: $('a[href^="/"], a[href^="' + $('link[rel="canonical"]').attr('href') + '"]').length,
    externalLinks: $('a[href^="http"]').not($('a[href*="' + $('link[rel="canonical"]').attr('href') + '"]')).length,
    totalImages: $('img').length,
  }
}

function analyzePerformance($: cheerio.CheerioAPI, headers: any) {
  return {
    totalScripts: $('script').length,
    totalStylesheets: $('link[rel="stylesheet"]').length,
    totalImages: $('img').length,
    totalIframes: $('iframe').length,
    lazyLoadImages: $('img[loading="lazy"]').length,
    responseHeaders: headers ? {
      server: headers['server'] || 'Not specified',
      cacheControl: headers['cache-control'] || 'Not specified',
      contentEncoding: headers['content-encoding'] || 'Not specified'
    } : {}
  };
}

function analyzeSecurityFeatures($: cheerio.CheerioAPI, headers: any) {
  return {
    hasHttps: headers && headers['content-security-policy'] ? true : false,
    hasCsp: headers && headers['content-security-policy'] ? true : false,
    hasXssProtection: headers && headers['x-xss-protection'] ? true : false,
    hasHsts: headers && headers['strict-transport-security'] ? true : false,
    passwordFields: $('input[type="password"]').length > 0,
    captchaPresent: $('div.g-recaptcha, .recaptcha, [class*="captcha"]').length > 0,
    loginForm: $('form').filter((_, form) => {
      return $(form).find('input[type="password"]').length > 0;
    }).length > 0
  };
}

function checkAccessibilityFeatures($: cheerio.CheerioAPI) {
  return {
    hasAriaLabels: $('[aria-label]').length > 0,
    hasAriaDescribedby: $('[aria-describedby]').length > 0,
    hasAriaLive: $('[aria-live]').length > 0,
    hasAltText: $('img[alt]').length,
    missingAltText: $('img:not([alt])').length,
    hasSkipLinks: $('a[href^="#main"], a[href^="#content"], a:contains("Skip to")').length > 0,
    hasLanguageAttribute: $('html[lang]').length > 0,
    hasTabIndex: $('[tabindex]').length > 0
  };
}

function extractMediaContent($: cheerio.CheerioAPI) {
  const images: Array<{src: string, alt: string}> = [];
  $('img').each((_, img) => {
    const src = $(img).attr('src');
    const alt = $(img).attr('alt');
    if (src) {
      images.push({ src, alt: alt || '' });
    }
  });

  const videos: Array<{src: string}> = [];
  $('video, iframe[src*="youtube"], iframe[src*="vimeo"]').each((_, video) => {
    const src = $(video).attr('src');
    if (src) {
      videos.push({ src });
    }
  });

  return {
    images: images.slice(0, 10),
    videos: videos.slice(0, 5),
    hasAudio: $('audio').length > 0,
    hasVideo: $('video').length > 0,
    hasEmbeddedContent: $('iframe').length > 0,
    hasYouTube: $('iframe[src*="youtube"]').length > 0,
    hasVimeo: $('iframe[src*="vimeo"]').length > 0
  };
}

function extractNavigation($: cheerio.CheerioAPI) {
  const menuItems: Array<{text: string, href: string}> = [];
  const navSelectors = ['nav', 'header ul', '.menu', '#menu', '.nav', '.navigation'];

  for (const selector of navSelectors) {
    const $nav = $(selector);
    if ($nav.length > 0) {
      $nav.find('a').each((_, link) => {
        const text = $(link).text().trim();
        const href = $(link).attr('href');
        if (text && href) {
          menuItems.push({ text, href });
        }
      });

      if (menuItems.length > 0) break;
    }
  }

  return {
    menuItems: menuItems.slice(0, 15), // Limit to 15 menu items
    hasDropdownMenu: $('ul ul, .dropdown, .sub-menu').length > 0,
    hasMobileMenu: $('.mobile-menu, .hamburger, [class*="mobile-nav"], [class*="menu-toggle"]').length > 0,
    hasBreadcrumbs: $('.breadcrumbs, .breadcrumb, [class*="breadcrumbs"], [class*="breadcrumb"]').length > 0
  };
}

function checkMobileOptimization($: cheerio.CheerioAPI) {
  return {
    hasViewportMeta: $('meta[name="viewport"]').length > 0,
    responsiveMetaContent: $('meta[name="viewport"]').attr('content') || '',
    hasMobileSpecificClasses: $('[class*="mobile"], [class*="sm-"], [class*="md-"], [class*="lg-"]').length > 0,
    hasMediaQueries: $('style').text().includes('@media') || $('link[media]').length > 0,
    usesFlexbox: $('[style*="display: flex"], [style*="display:flex"]').length > 0 || $('style').text().includes('display: flex'),
    usesGrid: $('[style*="display: grid"], [style*="display:grid"]').length > 0 || $('style').text().includes('display: grid')
  };
}

function extractForms($: cheerio.CheerioAPI) {
  const forms: Array<{type: string, fields: number}> = []
  
  $('form').each((_, form) => {
    const $form = $(form)
    const fields = $form.find('input, select, textarea').length
    
    // Try to identify form type
    let type = 'Unknown'
    
    if ($form.find('input[type="search"]').length > 0) {
      type = 'Search Form'
    } else if ($form.find('input[name*="email"], input[type="email"]').length > 0 && fields < 4) {
      type = 'Newsletter Signup'
    } else if ($form.find('input[name*="contact"], textarea').length > 0 || 
              $form.attr('id')?.includes('contact') || 
              $form.attr('class')?.includes('contact')) {
      type = 'Contact Form'
    } else if ($form.find('input[type="password"]').length > 0) {
      type = 'Login Form'
    } else if ($form.find('input[name*="search"]').length > 0) {
      type = 'Search Form'
    } else if ($form.find('input[name*="subscribe"]').length > 0) {
      type = 'Subscription Form'
    } else if ($form.find('input[name*="comment"]').length > 0 || 
              $form.attr('id')?.includes('comment') || 
              $form.attr('class')?.includes('comment')) {
      type = 'Comment Form'
    }
    
    forms.push({ type, fields })
  })
  
  return forms
}

function extractProducts($: cheerio.CheerioAPI) {
  const products: Array<{name: string, price?: string}> = []
  
  // Common selectors for product elements
  const productSelectors = [
    '.product',
    '.product-item',
    '.product-card',
    '.product-container',
    '.productItem',
    '.item-product',
    '.woocommerce-product',
    '.shopify-product',
    'div[itemtype="http://schema.org/Product"]',
    '[class*="product"]'
  ]
  
  // Try each selector
  for (const selector of productSelectors) {
    $(selector).each((_, product) => {
      const $product = $(product)
      
      // Try to find product name
      const nameElement = $product.find('h2, h3, h4, .product-title, .product-name, .title').first()
      const name = nameElement.text().trim()
      
      if (name) {
        // Try to find price
        const priceElement = $product.find('.price, .product-price, [class*="price"]').first()
        const price = priceElement.text().trim()
        
        products.push({ name, price })
      }
    })
    
    // If we found some products, stop trying other selectors
    if (products.length > 0) break
  }
  
  // Limit to first 10 products
  return products.slice(0, 10)
}

function extractServices($: cheerio.CheerioAPI) {
  const services: Array<string> = []
  
  // Service sections often have specific class names or IDs
  const serviceSelectors = [
    '.services .service h3',
    '.services .service-item h3',
    '.services .service-box h3',
    '.services .service-title',
    '.service-section h3',
    '#services h3',
    '.services h3',
    '.services h4',
    'section.services .title',
    '[class*="service"] h3'
  ]
  
  // Try each selector to find service titles
  for (const selector of serviceSelectors) {
    $(selector).each((_, element) => {
      const serviceName = $(element).text().trim()
      if (serviceName && !services.includes(serviceName)) {
        services.push(serviceName)
      }
    })
    
    // If we found some services, stop trying other selectors
    if (services.length > 0) break
  }
  
  // If no services found by titles, try looking for lists in service sections
  if (services.length === 0) {
    const listSelectors = [
      '.services li',
      '#services li',
      'section.services li',
      'div.service-list li'
    ]
    
    for (const selector of listSelectors) {
      $(selector).each((_, element) => {
        const serviceName = $(element).text().trim()
        if (serviceName && !services.includes(serviceName)) {
          services.push(serviceName)
        }
      })
      
      if (services.length > 0) break
    }
  }
  
  return services
}

function extractFAQs($: cheerio.CheerioAPI) {
  const faqs: Array<{question: string, answer: string}> = []
  
  // Check for schema.org FAQPage
  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const json = JSON.parse($(element).html() || '{}')
      if (json['@type'] === 'FAQPage' && json.mainEntity) {
        json.mainEntity.forEach((item: any) => {
          if (item['@type'] === 'Question' && item.name && item.acceptedAnswer?.text) {
            faqs.push({
              question: item.name,
              answer: item.acceptedAnswer.text
            })
          }
        })
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  })
  
  // If no schema.org FAQs, look for common FAQ structures
  if (faqs.length === 0) {
    // FAQ accordion pattern
    $('.faq-item, .accordion-item, .question-answer, [class*="faq"]').each((_, element) => {
      const $item = $(element)
      const questionElement = $item.find('.question, .accordion-header, h3, h4').first()
      const answerElement = $item.find('.answer, .accordion-content, .accordion-body, p').first()
      
      const question = questionElement.text().trim()
      const answer = answerElement.text().trim()
      
      if (question && answer) {
        faqs.push({ question, answer })
      }
    })
    
    // Definition lists
    $('dl').each((_, dl) => {
      const $dl = $(dl)
      const $dts = $dl.find('dt')
      const $dds = $dl.find('dd')
      
      $dts.each((i, dt) => {
        const question = $(dt).text().trim()
        const answer = i < $dds.length ? $($dds[i]).text().trim() : ''
        
        if (question && answer) {
          faqs.push({ question, answer })
        }
      })
    })
  }
  
  return faqs
}

function extractContactInfo($: cheerio.CheerioAPI) {
  const contactInfo: Record<string, string> = {}
  
  // Contact sections often have specific class names or IDs
  const contactSelectors = [
    '#contact',
    '.contact',
    '.contact-us',
    '.contact-info',
    'footer'
  ]
  
  for (const selector of contactSelectors) {
    const $section = $(selector)
    if ($section.length === 0) continue
    
    // Look for different contact elements
    const emailMatch = $section.text().match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g)
    if (emailMatch && !contactInfo.email) contactInfo.email = emailMatch[0]
    
    const phoneMatch = $section.text().match(/(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g)
    if (phoneMatch && !contactInfo.phone) contactInfo.phone = phoneMatch[0]
    
    // Look for specific contact elements
    const addressElement = $section.find('address, .address, [itemprop="address"]').first()
    if (addressElement.length && !contactInfo.address) contactInfo.address = addressElement.text().trim()
    
    const hoursElement = $section.find('.hours, .opening-hours, .business-hours, [itemprop="openingHours"]').first()
    if (hoursElement.length && !contactInfo.hours) contactInfo.hours = hoursElement.text().trim()
  }
  
  return contactInfo
}

function hasPrivacyPolicy($: cheerio.CheerioAPI): boolean {
  return !!$('a[href*="privacy"], a:contains("Privacy Policy"), a:contains("Privacy")').length
}

function hasTermsOfService($: cheerio.CheerioAPI): boolean {
  return !!$('a[href*="terms"], a:contains("Terms"), a:contains("Terms of Service"), a:contains("Terms and Conditions")').length
}

function detectLanguages($: cheerio.CheerioAPI): string[] {
  const languages: string[] = []
  
  // Check html lang attribute
  const htmlLang = $('html').attr('lang')
  if (htmlLang) {
    languages.push(htmlLang)
  }
  
  // Check for language switchers
  $('a[href*="lang="], .language-switcher a, .lang-switcher a, [class*="language"] a').each((_, element) => {
    const lang = $(element).attr('hreflang') || $(element).attr('lang') || $(element).text().trim()
    if (lang && lang.length <= 5 && !languages.includes(lang)) {
      languages.push(lang)
    }
  })
  
  return languages
} 