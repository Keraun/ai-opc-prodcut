import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@arco-design/web-react/dist/css/arco.css'
import './globals.css'
import { ClientLayout } from '@/components/client-layout'
import { loadInitialData, generateInitialDataScript } from '@/lib/initial-data'
import { readConfig } from '@/lib/config-manager'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

function getThemeConfig() {
  try {
    const themeConfig = readConfig('theme')
    const currentTheme = themeConfig.themes[themeConfig.currentTheme]
    return currentTheme
  } catch (error) {
    console.error('Failed to read theme config:', error)
    return null
  }
}

function getSiteConfig() {
  try {
    return readConfig('site') || {}
  } catch (error) {
    console.error('Failed to read site config:', error)
    return {}
  }
}

function getSeoConfig() {
  try {
    return readConfig('site-seo') || {}
  } catch (error) {
    console.error('Failed to read seo config:', error)
    return {}
  }
}

const siteConfig = getSiteConfig()
const seoConfig = getSeoConfig()

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig?.url || 'https://makerai.com'),
  title: {
    default: `${siteConfig?.name || '创客AI'} - ${siteConfig?.description || ''}`,
    template: `%s | ${siteConfig?.name || '创客AI'}`,
  },
  description: siteConfig?.description,
  keywords: seoConfig?.keywords,
  authors: [{ name: siteConfig?.name }],
  creator: siteConfig?.name,
  publisher: siteConfig?.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: (seoConfig?.openGraph?.type || 'website') as 'website',
    locale: seoConfig?.openGraph?.locale,
    url: siteConfig?.url,
    siteName: seoConfig?.openGraph?.siteName,
    title: `${siteConfig?.name || '创客AI'} - ${siteConfig?.description || ''}`,
    description: siteConfig?.description,
    images: seoConfig?.openGraph?.images,
  },
  twitter: {
    card: (seoConfig?.twitter?.card || 'summary_large_image') as 'summary_large_image',
    title: `${siteConfig?.name || '创客AI'} - ${siteConfig?.description || ''}`,
    description: siteConfig?.description,
    images: seoConfig?.openGraph?.images?.map((img: any) => img.url),
    creator: seoConfig?.twitter?.creator,
  },
  robots: {
    index: seoConfig?.robots?.index,
    follow: seoConfig?.robots?.follow,
    googleBot: {
      index: seoConfig?.robots?.index,
      follow: seoConfig?.robots?.follow,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: siteConfig?.url,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 服务端加载首屏初始数据
  const initialData = loadInitialData()
  const initialDataScript = generateInitialDataScript()

  const themeConfig = getThemeConfig()
  const colors = themeConfig?.colors || {}
  const effects = themeConfig?.effects || {}
  
  const radiusMap: Record<string, string> = {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem'
  }
  const shadowMap: Record<string, string> = {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    soft: '0 2px 8px 0 rgba(0, 0, 0, 0.08)'
  }
  
  const cssVariables: Record<string, string> = {
    '--theme-primary': colors.primary || '#1e40af',
    '--theme-primary-hover': colors.primaryHover || '#1e3a8a',
    '--theme-secondary': colors.secondary || '#3b82f6',
    '--theme-accent': colors.accent || '#06b6d4',
    '--theme-background': colors.background || '#ffffff',
    '--theme-background-secondary': colors.backgroundSecondary || '#f8fafc',
    '--theme-text': colors.text || '#1e293b',
    '--theme-text-secondary': colors.textSecondary || '#64748b',
    '--theme-border': colors.border || '#e2e8f0',
    '--theme-success': colors.success || '#10b981',
    '--theme-warning': colors.warning || '#f59e0b',
    '--theme-error': colors.error || '#ef4444',
    '--theme-radius': radiusMap[effects.borderRadius] || '0.5rem',
    '--theme-shadow': shadowMap[effects.shadow] || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }
  
  const styleString = Object.entries(cssVariables)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
  
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={seoConfig?.themeColor} />
        <link rel="manifest" href="/manifest.json" />
        <style dangerouslySetInnerHTML={{ __html: `:root { ${styleString} }` }} />
        {/* 注入首屏初始数据到 window 对象 */}
        <script
          dangerouslySetInnerHTML={{
            __html: initialDataScript,
          }}
        />
      </head>
      <body style={{ fontFamily: 'var(--font-sans)', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Analytics />
      </body>
    </html>
  )
}