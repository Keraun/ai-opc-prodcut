"use client"

import { Button, Space, Link } from "@arco-design/web-react"
import Image from 'next/image';
import { partnersConfig } from "@/config/client"

interface PartnersConfig {
  partners?: {
    title?: string
    description?: string
    items?: Array<{
      src: string
      alt?: string
    }>
  }
}

const config = (partnersConfig as PartnersConfig)?.partners || {}

const defaultImages = [
  '/partner/partner_01.png',
  '/partner/partner_02.png',
  '/partner/partner_03.png',
  '/partner/partner_04.png',
  '/partner/partner_05.png',
  '/partner/partner_06.png',
  '/partner/partner_07.png',
  '/partner/partner_08.png',
]

const items = config.items || defaultImages.map(src => ({ src, alt: '' }))

export function Partner() {
  return (
    <div id="partner" className="flex flex-col items-center justify-center gap-4 " style={{ padding: '0 24px 24px 24px' }}>
      <div className="mt-12 text-xl sm:text-2xl font-bold text-gray-900">{config.title || "来自优秀伙伴的信任"}</div>
      <ul className="flex flex-wrap gap-4">
        {items?.map((item, index) => (
          <li className="flex items-center justify-center" style={{ width: 110 }} key={index} >
            <Image
              src={typeof item === 'string' ? item : item.src}
              alt={typeof item === 'string' ? '' : (item.alt || '')}
              width={1}
              height={1}
              style={{
                height: '48px',
                width: 'auto',
              }}
            /></li>

        ))}
      </ul>
    </div>
  )
}
