"use client"

import Image from 'next/image'
import styles from "./partner.module.css"

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

interface PartnerProps {
  data?: any
}

export function Partner({ data }: PartnerProps) {
  const config = data || {}
  const items = config.items || defaultImages.map(src => ({ src, alt: '' }))

  return (
    <div id="partner" className={styles.container}>
      <div className={styles.title}>
        {config.title || "来自优秀伙伴的信任"}
      </div>
      <ul className={styles.partnerList}>
        {items?.map((item: any, index: number) => (
          <li className={styles.partnerItem} key={index}>
            <Image
              src={typeof item === 'string' ? item : item.src}
              alt={typeof item === 'string' ? '' : (item.alt || '')}
              width={1}
              height={1}
              className={styles.partnerImage}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
