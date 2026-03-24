import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@arco-design/web-react/dist/css/arco.css'
import './globals.css'
import { siteConfig, seoConfig } from '@/config/site'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
    type: seoConfig?.openGraph?.type as 'website',
    locale: seoConfig?.openGraph?.locale,
    url: siteConfig?.url,
    siteName: seoConfig?.openGraph?.siteName,
    title: `${siteConfig?.name || '创客AI'} - ${siteConfig?.description || ''}`,
    description: siteConfig?.description,
    images: seoConfig?.openGraph?.images,
  },
  twitter: {
    card: seoConfig?.twitter?.card as 'summary_large_image',
    title: `${siteConfig?.name || '创客AI'} - ${siteConfig?.description || ''}`,
    description: siteConfig?.description,
    images: seoConfig?.openGraph?.images?.map(img => img.url),
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
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={seoConfig?.themeColor} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
